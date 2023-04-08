import execa from 'execa';
import chalk from 'chalk';
import fs from 'fs';
/**
 * @desc 修改 git 项目地址
 * @param {string} newAddress
 * @returns {Promise<void>}
 */
export const replaceAddress = async function (newAddress: string): Promise<void> {
  /* 获取当前指令所在的地址 */
  const filePath = process.cwd();
  const folders = fs.readdirSync(filePath) || [];
  /* 返回过滤隐藏文件夹 */
  const folderList = folders.filter((item) => item.substring(0, 1) !== '.');
  // 如果没有文件夹则直接返回
  if (!folderList.length) {
    // 给用户提示 检测到当前路径下没有文件夹
    console.log(chalk.redBright('检测到当前路径下没有文件夹'));
    // 结束进程
    process.exit(1);
  }

  const countInfo = { all: 0, success: 0, error: 0 };
  countInfo.all = folderList.length;
  for (let i = 0; i < folderList.length; i++) {
    const folder = folderList[i];
    console.log(`${chalk.yellowBright('当前项目名称')}: ${chalk.greenBright(folder)}`);
    const { stdout: oldAddress } = await execa(`cd ${filePath}/${folder} && git remote -v`, {
      shell: true,
      stdio: 'inherit',
    });
    if (oldAddress) {
      console.log(`${chalk.yellowBright('更新前地址')}:\n ${chalk.greenBright(oldAddress)}`);
      // 进入项目目录，删除旧的 git 指向,设置新 git 指向
      await execa(
        `cd ${filePath}/${folder}&&git remote rm origin && git remote add origin ${newAddress}${folder}`,
        {
          shell: true,
          stdio: 'inherit',
        },
      );
      const { stdout: nowAddress } = await execa(`cd ${filePath}/${folder}&&git remote -v`, {
        shell: true,
        stdio: 'inherit',
      });
      if (nowAddress) {
        console.log(`${chalk.yellowBright('更新后地址')}:\n ${chalk.greenBright(nowAddress)}`);
        countInfo.success += 1;
      } else {
        countInfo.error += 1;
      }
    } else {
      countInfo.error += 1;
    }
  }
  // 输出计数
  console.log(chalk.blueBright(`总共:${countInfo.all}`));
  console.log(chalk.greenBright(`成功:${countInfo.success}`));
  console.log(chalk.redBright(`失败:${countInfo.error}`));
  process.exit(1);
};
