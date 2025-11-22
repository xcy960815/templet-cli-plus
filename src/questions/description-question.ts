import chalk from 'chalk'

/**
 * 问题配置接口
 */
interface QuestionConfig {
  type: 'input'
  name: 'description'
  message: string
}

/**
 * 创建项目描述问题配置
 * @returns 问题配置对象
 */
export function descriptionQuestion(): QuestionConfig {
  return {
    type: 'input',
    name: 'description',
    message: chalk.cyan('请输入项目描述:'),
  }
}
