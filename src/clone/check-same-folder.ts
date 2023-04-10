import chalk from 'chalk';
import fs from 'fs';

/**
 * @desc 获取仓库名称
 * @param {string} url
 * @returns
 */
function getRepositoriesName(url: string): string {
  const repositoriesName = url.split('/').pop()?.replace('.git', '') || '';
  return repositoriesName;
}
/**
 * @desc 检查文件
 * @param {仓库url} url
 * @returns
 */
export function checkSameFolder(url: string): void {
  // 通过url获取仓库名称
  const repositoriesName = getRepositoriesName(url);
  // 目录列表
  const dirList = fs.readdirSync('./');
  // 是否存在相同的项目名称
  const hasSameFolder = dirList.some((name) => name === repositoriesName);
  if (hasSameFolder) {
    console.log(chalk.redBright('检测到当前目录下存在相同的文件名'));
    process.exit(1);
  }
}
