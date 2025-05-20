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
  const promisifyRequest = promisify(request)
  const result = await promisifyRequest({
    // 源地址 /https://raw.githubusercontent.com/xcy960815/template-list/master/template-list.json

    // 加速地址
    // https://raw.staticdn.netxcy960815/template-list/master/template-list.json 生效

    // https://ghproxy.com/https://raw.githubusercontent.com/xcy960815/template-list/master/template-list.json 未加速 返回 ECONNRESET

    // https://github3.mk-proxy.ml/-----https://raw.githubusercontent.com/xcy960815/template-list/master/template-list.json

    // https://gh.api.99988866.xyz/https://raw.githubusercontent.com/xcy960815/template-list/master/template-list.json

    url: 'https://raw.staticdn.net/xcy960815/template-list/master/template-list.json',
    timeout: 20000,
  }).catch((error) => {
    if (error.code === 'ETIMEDOUT') {
      output && spinner.fail(chalk.redBright('模板相关配置查询超时，请稍后再试'))
    } else {
      output && spinner.fail(chalk.redBright('模板相关配置查询失败，请稍后再试'))
    }
    process.exit(1)
  })

  output && spinner.succeed(chalk.greenBright('🎉 模板相关配置查询完成（请求最新数据）\n'))

  fs.writeFileSync(templateListFilePath, result.body)

  return JSON.parse(result.body)
}
