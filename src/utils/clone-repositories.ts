import chalk from 'chalk';
import execa from 'execa';
const getDownloadTime = {
  startTime: null,
  start() {
    this.startTime = Date.now();
  },
  end() {
    const endTime = Date.now();
    console.log(
      `${chalk.greenBright(`下载耗时:${((endTime - this.startTime) / 1000).toFixed(2)} 秒`)}`,
    );
  },
};
/**
 * @desc 获取仓库名称
 * @param {string} url
 * @returns
 */
function getRepositoriesName(url) {
  const warehouseNames = url.split('/');
  const warehouseName = warehouseNames.find((item) => item.includes('.git')).split('.git')[0];
  return warehouseName;
}
const getCloneOption = function (url: string): string {
  if (url.includes('gitlab')) {
    return `git clone ${url}`;
  } else if (url.includes('gitee')) {
    return `git clone ${url}`;
  } else {
    return `git clone https://ghproxy.com/${url}`;
  }
};
/**
 * @desc 下载仓库
 * @link 加速方案 https://bbs.huaweicloud.com/blogs/294241
 * @param {string} url
 * @return {Promise<void>}
 */
export const cloneRepositories = async function (url: string): Promise<void> {
  // https://ghproxy.com/github地址
  const downloadShell = getCloneOption(url);
  // 开始计时
  getDownloadTime.start();
  // 下载仓库
  try {
    await execa.command(downloadShell, {
      cwd: process.cwd(),
      stdio: 'inherit',
    });
    // 删除.git文件夹
    await execa.command(`rm -rf ./${getRepositoriesName(url)}/.git`, {
      cwd: process.cwd(),
      stdio: 'inherit',
    });
  } catch (error) {
    console.log(chalk.red(`===> 下载失败\n`));
    process.exit(1);
  }
  getDownloadTime.end();
  process.exit(0);
};
