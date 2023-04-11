import fs from 'fs';
import chalk from 'chalk';
import ora from 'ora';

/**
 * @desc 删除文件 先删除文件夹下的文件 再删除文件夹
 * @param {string} filePath
 * @returns {boolean} 删除成功返回true 否则返回false
 */
const handleDeleteFolder = function (folderPath: fs.PathLike): void {
  const hasFolder = fs.existsSync(folderPath);
  if (hasFolder) {
    // 读取文件夹下面的文件
    const folderList = fs.readdirSync(folderPath);
    folderList.forEach((file) => {
      const nextFilePath = `${folderPath}/${file}`;
      const stats = fs.statSync(nextFilePath);
      // 获取到的文件或目录的信息对象 stats 是否表示一个目录。
      const isFolder = stats.isDirectory();
      if (isFolder) {
        handleDeleteFolder(nextFilePath);
      } else {
        try {
          // 删除文件
          fs.unlinkSync(nextFilePath);
        } catch (error) {
          console.log(chalk.redBright(`无法删除文件 ${nextFilePath}`));
        }
      }
    });
    try {
      // 删除文件夹
      fs.rmdirSync(folderPath);
    } catch (error) {
      console.log(chalk.redBright(`无法删除文件夹 ${folderPath}`));
    }
  }
};

const deleteFolder = function (folderPath: fs.PathLike, logOut?: boolean): void {
  let spinner;
  logOut && (spinner = ora('===> 开始删除文件').start());
  try {
    handleDeleteFolder(folderPath);
    logOut && spinner.succeed(chalk.green('===> 文件删除完毕\n'));
  } catch (error) {
    logOut && spinner.fail(chalk.red(`===> 删除文件失败`));
    process.exit(1);
  }
};

export { deleteFolder };
