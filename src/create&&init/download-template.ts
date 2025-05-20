import chalk from 'chalk'
import ora from 'ora'
import gitclone from 'git-clone/promise'
import { printAsTable } from '@/common/print-as-table'
import { getTemplateList } from '@/list/get-template-list'

/**
 * 模板配置接口
 */
interface TemplateConfig {
  desc: string
  downloadUrl: string
}

/**
 * 模板列表接口
 */
interface TemplateList {
  [key: string]: TemplateConfig
}

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
  }
}

/**
 * 显示可用的模板列表
 * @param templateList - 模板列表
 * @param invalidTemplate - 无效的模板名称
 */
function showAvailableTemplates(templateList: TemplateList, invalidTemplate: string): void {
  console.log(chalk.red(`\n模板 "${invalidTemplate}" 不存在，请从以下模板中选择：\n`))
  const tableHeader = [chalk.cyan('模板名称'), chalk.blue('模板描述')]
  const tableBody = Object.entries(templateList).reduce(
    (acc, [key, value]) => {
      acc[key] = value.desc
      return acc
    },
    {} as Record<string, string>
  )

  printAsTable(tableBody, tableHeader)
}

/**
 * 下载 GitHub 模板
 * @param templateName - 模板名称
 * @param projectName - 项目名称
 * @throws {TemplateError} 当模板不存在或下载失败时抛出错误
 */
export async function downloadTemplate(templateName: string, projectName: string): Promise<void> {
  const spinner = ora(chalk.cyan('正在获取模板列表...')).start()

  try {
    const templateList = await getTemplateList()
    const templateOptions = templateList[templateName]

    if (!templateOptions) {
      spinner.stop()
      showAvailableTemplates(templateList, templateName)
      throw new TemplateError('模板不存在', templateName)
    }

    spinner.text = chalk.cyan('正在下载模板...')

    // 使用 ghproxy.com 代理 github.com
    const downloadUrl = `https://ghproxy.com/${templateOptions.downloadUrl.replace('#master', '')}`

    await gitclone(downloadUrl, projectName, {
      checkout: 'master',
      shallow: true,
    })

    spinner.succeed(chalk.green('模板下载完成！\n'))
  } catch (error) {
    spinner.fail(chalk.red('模板下载失败'))

    if (error instanceof TemplateError) {
      throw error
    }

    throw new TemplateError(
      '下载模板时发生错误',
      templateName,
      error instanceof Error ? error : new Error(String(error))
    )
  }
}
