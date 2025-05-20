import { readdirSync, existsSync } from 'fs'
import { join } from 'path'
import chalk from 'chalk'

/**
 * 从 URL 中提取项目名称
 * @param url - GitHub URL 或项目名称
 * @returns 提取的项目名称
 */
function extractProjectName(url: string): string {
  if (!url.includes('http')) {
    return url
  }

  const parts = url.split('/')
  const lastPart = parts[parts.length - 1]
  return lastPart.replace(/\.git$/, '')
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

    if (!existsSync(currentDir)) {
      throw new Error(`目录不存在: ${currentDir}`)
    }

    const folderList = readdirSync(currentDir)
    const hasSameFolder = folderList.some((name) => name === extractedName)

    if (hasSameFolder) {
      console.warn(
        chalk.yellow(
          `\n警告: 当前目录下已存在名为 "${extractedName}" 的文件夹\n` +
            '这可能会导致文件冲突。建议：\n' +
            '1. 使用不同的项目名称\n' +
            '2. 删除或重命名现有文件夹\n' +
            '3. 在其他目录下创建项目\n'
        )
      )
    }

    return hasSameFolder
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(chalk.red(`检查同名文件夹时出错: ${errorMessage}`))
    throw new Error(`检查同名文件夹失败: ${errorMessage}`)
  }
}
