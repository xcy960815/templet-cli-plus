import ora from 'ora'
import { promisify } from 'util'
import request, { Response } from 'request'
import chalk from 'chalk'
import path from 'path'
import fs from 'fs'

// 类型定义
export interface Template {
  desc: string
  downloadUrl: string
}

interface RequestTarget {
  label: string
  url: string
}

type TemplateList = Record<string, Template>

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
 * 返回模板列表缓存文件的完整路径
 * @returns {string} 缓存文件的完整路径
 */
const getCacheFilePath = (): string => {
  return path.join(__dirname, CACHE_FILE_NAME)
}

/**
 * 获取缓存有效期时间
 * 根据环境变量判断是开发环境还是生产环境，返回相应的缓存时间
 * @returns {number} 缓存有效期时间（毫秒），开发环境为 1 分钟，生产环境为 1 天
 */
const getCacheTime = (): number => {
  const isDev = process.env.NODE_ENV === 'development'
  return isDev ? DEV_CACHE_TIME : PROD_CACHE_TIME
}

/**
 * 检查缓存是否有效
 * 通过比较文件的修改时间和当前时间来判断缓存是否在有效期内
 * @param {string} filePath - 缓存文件路径
 * @param {number} cacheTime - 缓存有效期时间（毫秒）
 * @returns {boolean} 如果缓存有效返回 true，否则返回 false
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
 * 读取并解析 JSON 格式的缓存文件
 * @param {string} filePath - 缓存文件路径
 * @returns {TemplateList | null} 模板列表对象，如果读取或解析失败返回 null
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
 * 处理不同类型的响应体（字符串或 Buffer），统一转换为字符串
 * @param {Response} response - HTTP 响应对象
 * @returns {string} 响应体字符串，如果无法转换则返回空字符串
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
 * 向指定的 URL 发送 HTTP 请求获取模板列表，并处理错误情况
 * @param {RequestTarget} target - 请求目标对象，包含标签和 URL
 * @param {ora.Ora} [spinner] - 可选的 ora spinner 实例，用于显示加载状态
 * @returns {Promise<TemplateList | null>} 模板列表对象，如果请求或解析失败返回 null
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
 * 按顺序尝试多个备用源，直到成功获取模板列表或所有源都失败
 * @param {ora.Ora} [spinner] - 可选的 ora spinner 实例，用于显示加载状态
 * @returns {Promise<TemplateList | null>} 模板列表对象，如果所有源都失败返回 null
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
 * 将模板列表数据序列化为 JSON 并写入缓存文件
 * @param {string} filePath - 缓存文件路径
 * @param {TemplateList} data - 要保存的模板列表数据
 * @returns {void} 无返回值，写入失败时仅记录错误不影响主流程
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
 * 查询线上模板列表
 * 优先从本地缓存读取，如果缓存无效或不存在则从多个备用源请求最新数据
 * @param {boolean} [output] - 是否输出加载提示，默认为 false
 * @returns {Promise<TemplateList>} 模板列表对象，键为模板名称，值为模板信息
 * @throws {Error} 当所有备用源都不可用时，输出错误信息并退出进程
 * @link 加速方案 https://bbs.huaweicloud.com/blogs/294241
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
