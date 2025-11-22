import ora from 'ora'
import { promisify } from 'util'
import request, { Response } from 'request'
import chalk from 'chalk'
import path from 'path'
import fs from 'fs'

// 类型定义
export interface ITemplate {
  desc: string
  downloadUrl: string
}

interface RequestTarget {
  label: string
  url: string
}

type TemplateList = Record<string, ITemplate>

// 常量配置
const CACHE_FILE_NAME = 'template-list.json'
const REQUEST_TIMEOUT = 20000
const DEV_CACHE_TIME = 60 * 1000 // 开发环境缓存有效期：1分钟
const PROD_CACHE_TIME = 24 * 60 * 60 * 1000 // 生产环境缓存有效期：1天

const REQUEST_TARGETS: RequestTarget[] = [
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

/**
 * 获取缓存文件路径
 */
const getCacheFilePath = (): string => {
  return path.join(__dirname, CACHE_FILE_NAME)
}

/**
 * 获取缓存有效期时间
 */
const getCacheTime = (): number => {
  const isDev = process.env.NODE_ENV === 'development'
  return isDev ? DEV_CACHE_TIME : PROD_CACHE_TIME
}

/**
 * 检查缓存是否有效
 */
const isCacheValid = (filePath: string, cacheTime: number): boolean => {
  try {
    const fileStat = fs.statSync(filePath)
    const now = Date.now()
    return now - fileStat.mtimeMs < cacheTime
  } catch {
    return false
  }
}

/**
 * 从缓存文件读取模板列表
 */
const readCacheFile = (filePath: string): TemplateList | null => {
  try {
    const data = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(data)
  } catch {
    return null
  }
}

/**
 * 将响应体转换为字符串
 */
const getResponseBody = (response: Response): string => {
  if (typeof response.body === 'string') {
    return response.body
  }
  if (Buffer.isBuffer(response.body)) {
    return response.body.toString('utf-8')
  }
  return ''
}

/**
 * 请求单个目标源
 */
const requestTarget = async (
  target: RequestTarget,
  spinner?: ora.Ora
): Promise<TemplateList | null> => {
  const promisifyRequest = promisify(request)

  try {
    const response = await promisifyRequest({
      url: target.url,
      timeout: REQUEST_TIMEOUT,
      headers: {
        'User-Agent': 'templet-cli-plus',
        Accept: 'application/json',
      },
    })

    const body = getResponseBody(response as Response)

    try {
      return JSON.parse(body) as TemplateList
    } catch (parseError) {
      // JSON 解析失败
      if (spinner) {
        spinner.warn(
          chalk.yellow(
            `模板相关配置解析失败：${target.label} 返回了非 JSON 内容，正在尝试备用源...`
          )
        )
        const preview = body.slice(0, 200)
        if (preview) {
          console.error(chalk.gray(`[${target.label} 响应预览]\n${preview}`))
        }
      }
      return null
    }
  } catch (error) {
    // 请求失败
    if (spinner) {
      spinner.warn(
        chalk.yellow(`模板相关配置查询失败：${target.label} 无法连接，尝试切换备用源...`)
      )
    }
    return null
  }
}

/**
 * 从多个备用源请求模板列表
 */
const fetchTemplateListFromSources = async (spinner?: ora.Ora): Promise<TemplateList | null> => {
  for (const target of REQUEST_TARGETS) {
    const result = await requestTarget(target, spinner)
    if (result) {
      if (spinner) {
        spinner.succeed(
          chalk.greenBright(`🎉 模板相关配置查询完成（来自 ${target.label} 的最新数据）\n`)
        )
      }
      return result
    }
  }
  return null
}

/**
 * 保存模板列表到缓存文件
 */
const saveCacheFile = (filePath: string, data: TemplateList): void => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
  } catch (error) {
    // 缓存写入失败不影响主流程，仅记录错误
    console.error(chalk.gray(`[缓存写入失败] ${error instanceof Error ? error.message : error}`))
  }
}

/**
 * @desc 查询线上模板列表
 * @link https://bbs.huaweicloud.com/blogs/294241 加速方案
 * @param output 是否输出加载提示
 * @returns {Promise<Record<string, ITemplate>>}
 */
export const getTemplateList = async (output?: boolean): Promise<TemplateList> => {
  const spinner = output ? ora(chalk.greenBright('正在查询模板相关配置...')).start() : undefined

  const cacheFilePath = getCacheFilePath()
  const cacheTime = getCacheTime()

  // 尝试从缓存读取
  if (isCacheValid(cacheFilePath, cacheTime)) {
    const cachedData = readCacheFile(cacheFilePath)
    if (cachedData) {
      if (spinner) {
        spinner.succeed(chalk.greenBright('🎉 模板相关配置查询完成（使用缓存数据）\n'))
      }
      return cachedData
    }
  }

  // 缓存无效或不存在，从网络请求
  const templateList = await fetchTemplateListFromSources(spinner)

  if (!templateList) {
    if (spinner) {
      spinner.fail(chalk.redBright('模板相关配置查询失败，所有备用源均不可用，请稍后再试'))
    }
    process.exit(1)
  }

  // 保存到缓存
  saveCacheFile(cacheFilePath, templateList)

  return templateList
}
