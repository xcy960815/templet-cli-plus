import fs from 'fs';
import chalk from 'chalk';

/**
 * @desc 删除文件
 * @param {string} filePath
 * @returns {boolean} 删除成功返回true 否则返回false
 */
const deleteFolder = function (filePath: string): boolean {
  if (fs.existsSync(filePath)) {
    const files = fs.readdirSync(filePath);
    files.forEach((file) => {
      const nextFilePath = `${filePath}/${file}`;
      const states = fs.statSync(nextFilePath);
      if (states.isDirectory()) {
        deleteFolder(nextFilePath);
      } else {
        try {
          fs.unlinkSync(nextFilePath);
        } catch (error: any) {
          console.log(chalk.redBright(`无法删除文件 ${nextFilePath}: ${error.message}`));
        }
      }
    });
    try {
      fs.rmdirSync(filePath);
    } catch (error: any) {
      console.log(chalk.redBright(`无法删除文件夹 ${filePath}: ${error.message}`));
    }
    return true;
  }
  return false;
};

export { deleteFolder };
