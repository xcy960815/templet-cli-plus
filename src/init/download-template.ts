import chalk from 'chalk'
import ora from 'ora'
import gitclone from 'git-clone/promise'
import { printAsTable } from '@/common/print-as-table'
import { getTemplateList } from '@/list/get-template-list'

/**
 * 常量定义
 */
const GHPROXY_BASE_URL = 'https://ghproxy.com/'
const DEFAULT_BRANCH = 'master'
const BRANCH_HASH_PATTERN = /#master$/

/**
 * Spinner 消息
 */
const SPINNER_MESSAGES = {
  FETCHING: chalk.cyan('正在获取模板列表...'),
  DOWNLOADING: chalk.cyan('正在下载模板...'),
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
 * 处理下载 URL，添加代理并移除分支哈希
 * @param downloadUrl - 原始下载 URL
 * @returns 处理后的下载 URL
 */
function processDownloadUrl(downloadUrl: string): string {
  // 移除 URL 末尾的分支哈希（如 #master）
  const cleanedUrl = downloadUrl.replace(BRANCH_HASH_PATTERN, '')
  // 添加 ghproxy 代理前缀
  return `${GHPROXY_BASE_URL}${cleanedUrl}`
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
  const spinner = ora(SPINNER_MESSAGES.FETCHING).start()

  try {
    // 获取模板列表
    const templateList = await getTemplateList()
    const templateConfig = templateList[templateName]

    // 验证模板是否存在
    if (!templateConfig) {
      spinner.stop()
      showAvailableTemplates(templateList, templateName)
      throw new TemplateError('模板不存在', templateName)
    }

    // 更新 spinner 状态并开始下载
    spinner.text = SPINNER_MESSAGES.DOWNLOADING
    const downloadUrl = processDownloadUrl(templateConfig.downloadUrl)

    await gitclone(downloadUrl, projectName, {
      checkout: DEFAULT_BRANCH,
      shallow: true,
    })

    spinner.succeed(SPINNER_MESSAGES.SUCCESS)
  } catch (error) {
    spinner.fail(SPINNER_MESSAGES.FAILED)

    // 如果是自定义错误，直接抛出
    if (error instanceof TemplateError) {
      throw error
    }

    // 包装其他错误
    const originalError = error instanceof Error ? error : new Error(String(error))
    throw new TemplateError('下载模板时发生错误', templateName, originalError)
  }
}
