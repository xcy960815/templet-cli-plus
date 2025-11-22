import chalk from 'chalk'

/**
 * 问题配置接口
 */
interface QuestionConfig {
  type: 'list'
  name: 'deleteFolder'
  message: string
  choices: Array<{ name: string; value: string }>
}

/**
 * 创建删除文件夹问题配置
 * @returns 问题配置对象
 */
export function deleteFolderQuestion(): QuestionConfig {
  return {
    type: 'list',
    name: 'deleteFolder',
    message: chalk.redBright('检测到当前路径下有跟项目重复的文件夹，是删除还是保留？'),
    choices: [
      { name: '删除重名的文件夹', value: 'delete' },
      { name: '保留重名的文件夹并基于当前文件夹创建一个随机的文件夹后缀', value: 'rename' },
      { name: '放弃创建', value: 'cancel' },
    ],
  }
}
