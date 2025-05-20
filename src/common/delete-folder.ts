import { promises as fs, existsSync, statSync } from 'fs'
import { join } from 'path'
import chalk from 'chalk'
import ora from 'ora'

/**
 * 递归删除文件夹及其内容
 * @param folderPath - 要删除的文件夹路径
 * @returns Promise<void>
 * @throws {Error} 当删除操作失败时抛出错误
 */
async function handleDeleteFolder(folderPath: string): Promise<void> {
  if (!existsSync(folderPath)) {
    return
  }

  const items = await fs.readdir(folderPath)

  await Promise.all(
    items.map(async (item) => {
      const itemPath = join(folderPath, item)
      const stats = statSync(itemPath)

      if (stats.isDirectory()) {
        await handleDeleteFolder(itemPath)
      } else {
        try {
          await fs.unlink(itemPath)
        } catch (error) {
          throw new Error(
            `无法删除文件 ${itemPath}: ${error instanceof Error ? error.message : String(error)}`
          )
        }
      }
    })
  )

  try {
    await fs.rmdir(folderPath)
  } catch (error) {
    throw new Error(
      `无法删除文件夹 ${folderPath}: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

/**
 * 删除指定文件夹及其内容
 * @param folderPath - 要删除的文件夹路径
 * @param showProgress - 是否显示进度提示，默认为 false
 * @returns Promise<void>
 */
async function deleteFolder(folderPath: string, showProgress: boolean = false): Promise<void> {
  const spinner = showProgress ? ora('正在删除文件...').start() : null

  try {
    await handleDeleteFolder(folderPath)
    if (showProgress) {
      spinner?.succeed(chalk.green('文件删除完成\n'))
    }
  } catch (error) {
    if (showProgress) {
      spinner?.fail(
        chalk.red(`删除文件失败: ${error instanceof Error ? error.message : String(error)}`)
      )
    }
    throw error
  }
}

export { deleteFolder }
