import inquirer from 'inquirer'
import type { QuestionCollection } from 'inquirer'
import { versionQuestion } from '@/questions/version-question'
import { descriptionQuestion } from '@/questions/description-question'
import { templateNameQuestion } from '@/questions/template-question'
import { authorQuestion } from '@/questions/author-question'
import { projectNameQuestion } from '@/questions/project-name-question'
import { deleteFolderQuestion } from '@/questions/delete-folder-question'
import { updateCliVersionQuestion } from '@/questions/update-cli-version-question'
// import { downloadSourceQuestion } from '@/questions/download-source-question';
// import { downloadTypeQuestion } from '@/questions/download-type-question';
import { replaceUrlQuestion } from '@/questions/replace-url-question'

/**
 * 问题函数类型定义
 * 大部分问题函数不接受参数，只有 projectNameQuestion 接受可选的 projectName 参数
 */
type QuestionFunction = (projectName?: string) => QuestionCollection | Promise<QuestionCollection>

/**
 * 问题映射表
 * 包含所有可用的问题配置函数
 */
export const questionsMap = {
  version: versionQuestion,
  description: descriptionQuestion,
  templateName: templateNameQuestion,
  author: authorQuestion,
  projectName: projectNameQuestion,
  deleteFolder: deleteFolderQuestion,
  updateCliVersion: updateCliVersionQuestion,
  replaceUrl: replaceUrlQuestion,
  // downloadSource: downloadSourceQuestion,
  // downloadType: downloadTypeQuestion,
} as const

/**
 * 问题键类型
 */
export type QuestionKey = keyof typeof questionsMap

/**
 * 问题映射类型
 */
export type QuestionsMap = {
  [K in QuestionKey]: QuestionFunction
}

/**
 * 初始化并执行交互式问题
 * @param questions - 要执行的问题键数组
 * @param projectName - 可选的默认项目名称，用于 projectNameQuestion
 * @returns 用户回答的对象，键为问题名称，值为用户输入
 * @throws {Error} 当问题配置创建失败时抛出错误
 *
 * @example
 * ```typescript
 * const answers = await initQuestions(['projectName', 'version'], 'my-project')
 * console.log(answers.projectName) // 用户输入的项目名称
 * console.log(answers.version) // 用户输入的版本号
 * ```
 */
export async function initQuestions<K extends QuestionKey>(
  questions: K[],
  projectName?: string
): Promise<{ [P in K]: string }> {
  try {
    // 并行创建所有问题配置
    const questionConfigs = await Promise.all(
      questions.map((question) => {
        const questionFn = questionsMap[question]
        return questionFn(projectName)
      })
    )

    // 执行交互式提问
    const answers = await inquirer.prompt(questionConfigs)

    return answers as { [P in K]: string }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    throw new Error(`问题初始化失败: ${errorMessage}`)
  }
}
