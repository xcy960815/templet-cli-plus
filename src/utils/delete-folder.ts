import fs from 'fs';
import chalk from 'chalk';
import ora from 'ora';

/**
 * @desc 删除文件
 * @param {string} filePath
 * @returns {boolean} 删除成功返回true 否则返回false
 */
const handleDeleteFolder = function(filePath: string): void {
  if (fs.existsSync(filePath)) {
    const files = fs.readdirSync(filePath);
    files.forEach(file => {
      const nextFilePath = `${filePath}/${file}`;
      const states = fs.statSync(nextFilePath);
      if (states.isDirectory()) {
        handleDeleteFolder(nextFilePath);
      } else {
        try {
          fs.unlinkSync(nextFilePath);
        } catch (error) {
          console.log(chalk.redBright(`无法删除文件 ${nextFilePath}: ${error.message}`));
        }
      }
    });
    try {
      fs.rmdirSync(filePath);
    } catch (error) {
      console.log(chalk.redBright(`无法删除文件夹 ${filePath}: ${error.message}`));
    }
  }
};

const deleteFolder = function(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const spinner = ora('===> 开始删除重复文件').start();
    try {
      handleDeleteFolder(filePath);
      spinner.succeed(chalk.green('===> 重复文件删除完毕\n'));
      resolve();
    } catch (error) {
      spinner.fail(chalk.red(`===> 删除重复文件失败, 失败原因: ${chalk.red(error.message)}`));
      process.exit(1);
    }
  });
};

export { deleteFolder };
