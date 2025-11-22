import chalk from 'chalk'
import gitclone from 'git-clone/promise'
import ora from 'ora'
import { printAsTable } from '@/common/print-as-table'
import { getTemplateList } from '@/list/get-template-list'
import { ProgressBar } from '@/utils/progress-bar'

/**
 * 常量定义
 */
const GHPROXY_BASE_URL = 'https://ghproxy.com/'
const DEFAULT_BRANCH = 'master'
const BRANCH_HASH_PATTERN = /#master$/

/**
 * 进度条消息
 */
const PROGRESS_MESSAGES = {
  FETCHING: '正在获取模板列表',
  DOWNLOADING: '正在下载模板',
  SUCCESS: chalk.green('模板下载完成！\n'),
  FAILED: chalk.red('模板下载失败'),
} as const

/**
 * 模板配置接口
 */
interface TemplateConfig {
  desc: string
  downloadUrl: string
}

/**
 * 模板列表类型
 */
type TemplateList = Record<string, TemplateConfig>

/**
 * 自定义错误类，用于模板下载相关的错误
 */
class TemplateError extends Error {
  constructor(
    message: string,
    public templateName?: string,
    public originalError?: Error
  ) {
    super(message)
    this.name = 'TemplateError'
    // 确保错误堆栈正确
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TemplateError)
    }
  }
}

/**
 * 判断是否需要使用代理加速
 * 对于非 GitLab 和 Gitee 的仓库，需要使用代理加速下载
 * @param {string} url - Git 仓库 URL 地址
 * @returns {boolean} 如果需要使用代理返回 true，否则返回 false
 */
function needsProxy(url: string): boolean {
  const lowerUrl = url.toLowerCase()
  return !lowerUrl.includes('gitlab') && !lowerUrl.includes('gitee')
}

/**
 * 判断错误是否与代理相关
 * @param {Error} error - 错误对象
 * @returns {boolean} 如果是代理相关错误返回 true
 */
function isProxyError(error: Error): boolean {
  const errorMessage = error.message.toLowerCase()
  return (
    errorMessage.includes('ghproxy') ||
    errorMessage.includes('ssl_error_syscall') ||
    errorMessage.includes('ssl_connect') ||
    errorMessage.includes('connection') ||
    errorMessage.includes('timeout')
  )
}

/**
 * 处理下载 URL，添加代理并移除分支哈希
 * @param downloadUrl - 原始下载 URL
 * @param useProxy - 是否使用代理
 * @returns 处理后的下载 URL
 */
function processDownloadUrl(downloadUrl: string, useProxy: boolean = true): string {
  // 移除 URL 末尾的分支哈希（如 #master）
  const cleanedUrl = downloadUrl.replace(BRANCH_HASH_PATTERN, '')
  // 如果需要代理且应该使用代理，则添加 ghproxy 代理前缀
  if (needsProxy(cleanedUrl) && useProxy) {
    return `${GHPROXY_BASE_URL}${cleanedUrl}`
  }
  return cleanedUrl
}

/**
 * 显示可用的模板列表
 * @param templateList - 模板列表
 * @param invalidTemplate - 无效的模板名称
 */
function showAvailableTemplates(templateList: TemplateList, invalidTemplate: string): void {
  console.log(chalk.red(`\n模板 "${invalidTemplate}" 不存在，请从以下模板中选择：\n`))

  const tableHeader = [chalk.cyan('模板名称'), chalk.blue('模板描述')]
  const tableBody: Record<string, string> = {}

  for (const [key, value] of Object.entries(templateList)) {
    tableBody[key] = value.desc
  }

  printAsTable(tableBody, tableHeader)
}

/**
 * 下载 GitHub 模板
 * @param templateName - 模板名称
 * @param projectName - 项目名称（目标文件夹名称）
 * @throws {TemplateError} 当模板不存在或下载失败时抛出错误
 */
export async function downloadTemplate(templateName: string, projectName: string): Promise<void> {
  const fetchProgressBar = new ProgressBar({
    description: PROGRESS_MESSAGES.FETCHING,
    barLength: 30,
  })

  try {
    // 获取模板列表
    fetchProgressBar.render({ completed: 0, total: 100 })
    const templateList = await getTemplateList()
    fetchProgressBar.render({ completed: 50, total: 100 })

    const templateConfig = templateList[templateName]

    // 验证模板是否存在
    if (!templateConfig) {
      fetchProgressBar.clear()
      showAvailableTemplates(templateList, templateName)
      throw new TemplateError('模板不存在', templateName)
    }

    fetchProgressBar.complete(100)
    fetchProgressBar.clear()

    // 开始下载，使用进度条
    const downloadProgressBar = new ProgressBar({
      description: chalk.cyan(PROGRESS_MESSAGES.DOWNLOADING),
      barLength: 30,
    })

    const originalUrl = templateConfig.downloadUrl.replace(BRANCH_HASH_PATTERN, '')
    const shouldUseProxy = needsProxy(originalUrl)

    // 使用模拟进度条（因为 git-clone 库不提供进度回调）
    let progress = 0
    const progressInterval = setInterval(() => {
      if (progress < 90) {
        progress += Math.random() * 10
        progress = Math.min(progress, 90)
        downloadProgressBar.render({ completed: progress, total: 100 })
      }
    }, 200)

    try {
      // 首先尝试使用代理（如果需要）
      if (shouldUseProxy) {
        try {
          const downloadUrl = processDownloadUrl(templateConfig.downloadUrl, true)
          await gitclone(downloadUrl, projectName, {
            checkout: DEFAULT_BRANCH,
            shallow: true,
          })

          clearInterval(progressInterval)
          downloadProgressBar.complete(100)
          downloadProgressBar.clear()
          console.log(PROGRESS_MESSAGES.SUCCESS)
          return
        } catch (downloadError) {
          // 如果是代理相关错误，尝试直接连接
          if (downloadError instanceof Error && isProxyError(downloadError)) {
            console.warn('\n' + chalk.yellow('⚠️  代理连接失败，正在尝试直接连接...\n'))
            clearInterval(progressInterval)
            downloadProgressBar.clear()
            // 重新创建进度条
            const retryProgressBar = new ProgressBar({
              description: chalk.cyan('正在下载模板（直接连接）'),
              barLength: 30,
            })
            // 重新设置进度条
            progress = 0
            const retryProgressInterval = setInterval(() => {
              if (progress < 90) {
                progress += Math.random() * 10
                progress = Math.min(progress, 90)
                retryProgressBar.render({ completed: progress, total: 100 })
              }
            }, 200)

            try {
              const directDownloadUrl = processDownloadUrl(templateConfig.downloadUrl, false)
              await gitclone(directDownloadUrl, projectName, {
                checkout: DEFAULT_BRANCH,
                shallow: true,
              })

              clearInterval(retryProgressInterval)
              retryProgressBar.complete(100)
              retryProgressBar.clear()
              console.log(PROGRESS_MESSAGES.SUCCESS)
              return
            } catch (retryError) {
              clearInterval(retryProgressInterval)
              retryProgressBar.clear()
              throw retryError
            }
          }
          // 如果不是代理错误，直接抛出
          clearInterval(progressInterval)
          downloadProgressBar.clear()
          throw downloadError
        }
      } else {
        // 不需要代理，直接连接
        const downloadUrl = processDownloadUrl(templateConfig.downloadUrl, false)
        await gitclone(downloadUrl, projectName, {
          checkout: DEFAULT_BRANCH,
          shallow: true,
        })

        clearInterval(progressInterval)
        downloadProgressBar.complete(100)
        downloadProgressBar.clear()
        console.log(PROGRESS_MESSAGES.SUCCESS)
      }
    } catch (downloadError) {
      clearInterval(progressInterval)
      downloadProgressBar.clear()
      throw downloadError
    }
  } catch (error) {
    fetchProgressBar.clear()
    ora().fail(chalk.red('模板下载失败'))

    // 如果是自定义错误，直接抛出
    if (error instanceof TemplateError) {
      throw error
    }

    // 包装其他错误
    const originalError = error instanceof Error ? error : new Error(String(error))
    throw new TemplateError('下载模板时发生错误', templateName, originalError)
  }
}
