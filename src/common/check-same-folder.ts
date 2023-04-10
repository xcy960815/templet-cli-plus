import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import { initQuestions } from '@/questions/init-questions';
import { deleteFolder } from '@/common/delete-folder';

/**
 * @desc 检查当前路径下面是否存在跟项目重名的文件夹
 * @param {string} projectName
 * @returns {Promise} 返回项目名称
 */
export const checkSameFolder = async function (projectName: string): Promise<string> {
  // 目录列表
  const dirList = fs.readdirSync('./');
  // 是否存在相同的项目名称
  const hasSameFolder = dirList.some((name) => name === projectName);
  if (hasSameFolder) {
    // 空一行
    console.log('');
    // 如果有相同的文件夹名称 询问用户
    const answer = await initQuestions(['deleteFolder']);
    if (answer.deleteFolder === 'delete') {
      await deleteFolder(path.resolve(process.cwd(), projectName));
    } else if (answer.deleteFolder === 'rename') {
      console.log(`\n${chalk.green('===> 开始重命名文件')}\n`);
      projectName = timeSuffix(projectName);
      console.info(`已随机文件后缀已生成，新的项目名称为【 ${chalk.greenBright(projectName)} 】\n`);
    } else {
      // 放弃创建
      console.log(chalk.redBright('已放弃创建'));
      process.exit(1);
    }
  }
  return projectName;
};
/**
 * @desc 生成随机文件后缀
 * @param {string} projectName
 * @returns {string}
 */
const timeSuffix = function (projectName: string): string {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const fullMonth = month < 10 ? `0${month}` : month;
  const date = currentDate.getDate();
  const hours = currentDate.getHours();
  const minutes = currentDate.getMinutes();
  const seconds = currentDate.getSeconds();
  projectName = `${projectName} ${year}-${fullMonth}-${date} ${hours}:${minutes}:${seconds}`;
  return projectName;
};
