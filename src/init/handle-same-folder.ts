import path from 'path'
import chalk from 'chalk'
import { initQuestions } from '@/questions/init-questions'
import { deleteFolder } from '@/common/delete-folder'

/**
 * 文件夹处理操作类型
 */
const FOLDER_ACTIONS = {
  DELETE: 'delete',
  RENAME: 'rename',
  CANCEL: 'cancel',
} as const

/**
 * 控制台消息
 */
const MESSAGES = {
  RENAME_START: chalk.green('===> 开始重命名文件'),
  RENAME_SUCCESS: (name: string) =>
    `已随机文件后缀已生成，新的项目名称为【 ${chalk.greenBright(name)} 】`,
  CANCEL: chalk.redBright('已放弃创建'),
} as const

/**
 * 处理相同文件夹名称的情况
 * 当检测到目标文件夹已存在时，询问用户是删除、重命名还是取消操作
 *
 * @param projectName - 项目名称（文件夹名称）
 * @returns 处理后的项目名称（如果重命名则返回新名称，否则返回原名称）
 */
export async function handleSameFolder(projectName: string): Promise<string> {
  const answer = await initQuestions(['deleteFolder'])

  switch (answer.deleteFolder) {
    case FOLDER_ACTIONS.DELETE: {
      const targetPath = path.resolve(process.cwd(), projectName)
      await deleteFolder(targetPath, true)
      break
    }

    case FOLDER_ACTIONS.RENAME: {
      console.log(`\n${MESSAGES.RENAME_START}\n`)
      const newProjectName = addTimestampSuffix(projectName)
      console.info(`${MESSAGES.RENAME_SUCCESS(newProjectName)}\n`)
      return newProjectName
    }

    case FOLDER_ACTIONS.CANCEL:
    default: {
      console.log(MESSAGES.CANCEL)
      process.exit(1)
    }
  }

  return projectName
}

/**
 * 为项目名称添加时间戳后缀
 * 格式：{projectName} YYYY-MM-DD HH:mm:ss
 *
 * @param projectName - 原始项目名称
 * @returns 添加时间戳后缀后的项目名称
 */
function addTimestampSuffix(projectName: string): string {
  const now = new Date()

  // 格式化日期和时间
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const date = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')

  return `${projectName} ${year}-${month}-${date} ${hours}:${minutes}:${seconds}`
}
