import chalk from 'chalk';

interface IDeleteFolderQuestion {
  type: 'list';
  name: 'deleteFolder';
  message: string;
  choices: Array<{ name: string; value: string }>;
}
/**
 * @desc 删除文件夹问题
 * @returns {IDeleteFolderQuestion}
 */
const deleteFolderQuestion = function (): IDeleteFolderQuestion {
  return {
    type: 'list',
    name: 'deleteFolder',
    message: chalk.redBright('检测到当前路径下有跟项目重复的文件夹，是删除还是保留？'),
    choices: [
      { name: '删除重名的文件夹', value: 'delete' },
      { name: '保留重名的文件夹并基于当前文件夹创建一个随机的文件夹后缀', value: 'rename' },
      { name: '放弃创建', value: 'cancel' },
    ],
  };
};

export { deleteFolderQuestion };
