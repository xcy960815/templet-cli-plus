import chalk from 'chalk'

/**
 * 问题配置接口
 */
interface QuestionConfig {
  type: 'list'
  name: 'downloadSource'
  message: string
  choices: Array<{ name: string; value: string }>
}

/**
 * 创建下载源选择问题配置
 * @returns 问题配置对象
 */
export function downloadSourceQuestion(): QuestionConfig {
  return {
    type: 'list',
    name: 'downloadSource',
    message: chalk.cyan('请选择下载源:'),
    choices: [
      {
        name: 'github（代码最新，依赖宿主网络环境）',
        value: 'github',
      },
      {
        name: 'gitee（网络最好，但是小概率不是最新代码）',
        value: 'gitee',
      },
    ],
  }
}
