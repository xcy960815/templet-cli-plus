import { readdirSync } from 'fs'
import chalk from 'chalk'

/**
 * 常量定义
 */
const GIT_SUFFIX = /\.git$/
const URL_PATTERN = /^https?:\/\//

/**
 * 警告消息模板
 */
const WARNING_MESSAGE = (folderName: string) =>
  `\n警告: 当前目录下已存在名为 "${folderName}" 的文件夹\n` +
  '这可能会导致文件冲突。建议：\n' +
  '1. 使用不同的项目名称\n' +
  '2. 删除或重命名现有文件夹\n' +
  '3. 在其他目录下创建项目\n'

/**
 * 从 URL 中提取项目名称
 * @param url - GitHub URL 或项目名称
 * @returns 提取的项目名称，如果无法提取则返回空字符串
 */
function extractProjectName(url: string): string {
  if (!url || typeof url !== 'string') {
    return ''
  }

  const trimmed = url.trim()

  // 如果不是 URL，直接返回
  if (!URL_PATTERN.test(trimmed)) {
    return trimmed
  }

  // 从 URL 中提取项目名称
  const parts = trimmed.split('/').filter(Boolean)
  const lastPart = parts[parts.length - 1] || ''

  return lastPart.replace(GIT_SUFFIX, '')
}

/**
 * 检查当前目录下是否存在同名文件夹
 * @param projectName - 项目名称或 GitHub URL
 * @returns Promise<boolean> 如果存在同名文件夹返回 true，否则返回 false
 * @throws {Error} 当无法读取目录或发生其他错误时抛出错误
 */
export async function checkSameFolder(projectName: string): Promise<boolean> {
  try {
    const extractedName = extractProjectName(projectName)

    if (!extractedName) {
      throw new Error('无法从 URL 中提取有效的项目名称')
    }

    const currentDir = process.cwd()
    const folderList = readdirSync(currentDir)
    const hasSameFolder = folderList.includes(extractedName)

    if (hasSameFolder) {
      console.warn(chalk.yellow(WARNING_MESSAGE(extractedName)))
    }

    return hasSameFolder
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(chalk.red(`检查同名文件夹时出错: ${errorMessage}`))
    throw new Error(`检查同名文件夹失败: ${errorMessage}`)
  }
}
