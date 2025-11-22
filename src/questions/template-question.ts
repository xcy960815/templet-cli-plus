import chalk from 'chalk'
import { getTemplateList } from '../list/get-template-list'

/**
 * 问题配置接口
 */
interface QuestionConfig {
  type: 'list'
  name: 'templateName'
  message: string
  choices: Array<{ name: string }>
}

/**
 * 创建模板选择问题配置
 * @returns 问题配置对象
 * @throws {Error} 当无法获取模板列表时抛出错误
 */
export async function templateNameQuestion(): Promise<QuestionConfig> {
  try {
    const templateList = await getTemplateList(true)
    const choices = Object.keys(templateList).map((name) => ({ name }))

    if (choices.length === 0) {
      throw new Error('未找到可用的模板列表')
    }

    return {
      type: 'list',
      name: 'templateName',
      message: chalk.cyan('请选择模版版本:'),
      choices,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '获取模板列表失败'
    throw new Error(`模板选择配置创建失败: ${errorMessage}`)
  }
}
