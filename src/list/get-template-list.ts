import ora from 'ora'
import { promisify } from 'util'
import request from 'request'
import chalk from 'chalk'
import path from 'path'
import fs from 'fs'
interface ITemplate {
  desc: string
  downloadUrl: string
}

/**
 * @desc 查询线上模板列表
 * @link https://bbs.huaweicloud.com/blogs/294241 加速方案
 * @returns {Promise<Record<string, ITemplate>>}
 */
export const getTemplateList = async function (
  output?: boolean
): Promise<Record<string, ITemplate>> {
  const isDev = process.env.NODE_ENV === 'development'
  let spinner
  if (output) spinner = ora(chalk.greenBright('正在查询模板相关配置...')).start()

  const templateListFilePath = path.join(__dirname, 'template-list.json')
  const cacheTime = isDev ? 60 * 1000 : 24 * 60 * 60 * 1000 // 开发环境缓存有效期为10秒 线上环境有效期为1天
  try {
    const templateListFileStat = fs.statSync(templateListFilePath)
    const now = new Date().getTime()
    if (now - templateListFileStat.mtimeMs < cacheTime) {
      // 缓存未过期，直接读取文件中的数据
      const data = fs.readFileSync(templateListFilePath, 'utf-8')
      output && spinner.succeed(chalk.greenBright('🎉 模板相关配置查询完成（使用缓存数据）\n'))
      return JSON.parse(data)
    }
  } catch (error) {}

  // 缓存已过期或文件不存在，重新请求接口获取最新数据
  const requestTargets = [
    {
      label: 'raw.staticdn.net',
      url: 'https://raw.staticdn.net/xcy960815/template-list/master/template-list.json',
    },
    {
      label: 'raw.githubusercontent.com',
      url: 'https://raw.githubusercontent.com/xcy960815/template-list/master/template-list.json',
    },
    {
      label: 'cdn.jsdelivr.net',
      url: 'https://cdn.jsdelivr.net/gh/xcy960815/template-list/template-list.json',
    },
  ]

  const promisifyRequest = promisify(request)
  let parsedBody: Record<string, ITemplate> | undefined
  let lastError: Error | undefined

  for (const target of requestTargets) {
    const response = await promisifyRequest({
      url: target.url,
      timeout: 20000,
      headers: {
        'User-Agent': 'templet-cli-plus',
        Accept: 'application/json',
      },
    }).catch((error) => {
      lastError = error
      if (output) {
        spinner.warn(
          chalk.yellow(`模板相关配置查询失败：${target.label} 无法连接，尝试切换备用源...`)
        )
      }
      return null
    })

    if (!response) continue

    const body =
      typeof response.body === 'string'
        ? response.body
        : Buffer.isBuffer(response.body)
          ? response.body.toString('utf-8')
          : ''

    try {
      parsedBody = JSON.parse(body)
      output &&
        spinner.succeed(
          chalk.greenBright(`🎉 模板相关配置查询完成（来自 ${target.label} 的最新数据）\n`)
        )
      break
    } catch (error) {
      lastError = error as Error
      if (output) {
        spinner.warn(
          chalk.yellow(
            `模板相关配置解析失败：${target.label} 返回了非 JSON 内容，正在尝试备用源...`
          )
        )
      }
      const preview = typeof body === 'string' ? body.slice(0, 200) : ''
      preview && console.error(chalk.gray(`[${target.label} 响应预览]\n${preview}`))
    }
  }

  if (!parsedBody) {
    output && spinner.fail(chalk.redBright('模板相关配置查询失败，所有备用源均不可用，请稍后再试'))
    if (lastError) {
      console.error(chalk.gray(`[模板查询报错详情] ${lastError.message || lastError}`))
    }
    process.exit(1)
  }

  fs.writeFileSync(templateListFilePath, JSON.stringify(parsedBody, null, 2))

  return parsedBody
}
