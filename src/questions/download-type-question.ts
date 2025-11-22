import chalk from 'chalk'

/**
 * 问题配置接口
 */
interface QuestionConfig {
  type: 'list'
  name: 'downloadType'
  message: string
  choices: Array<{ name: string; value: string }>
}

/**
 * 创建下载方式选择问题配置
 * @returns 问题配置对象
 */
export function downloadTypeQuestion(): QuestionConfig {
  return {
    type: 'list',
    name: 'downloadType',
    message: chalk.cyan('请选择下载方式:'),
    choices: [
      {
        name: 'zip',
        value: 'zip',
      },
      {
        name: 'git',
        value: 'git',
      },
    ],
  }
}
