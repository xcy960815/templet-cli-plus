import chalk from 'chalk';
import execa from 'execa';
class DownloadTimer {
  static #startTime = 0;

  static start() {
    this.#startTime = Date.now();
  }

  static end() {
    const endTime = Date.now();
    console.log(
      `${chalk.greenBright(`下载耗时:${((endTime - this.#startTime) / 1000).toFixed(2)} 秒`)}`,
    );
  }
}

/**
 * @desc 下载仓库
 * @link 加速方案 https://bbs.huaweicloud.com/blogs/294241
 * @param {string} url
 * @return {Promise<void>}
 */
export const cloneRepositorie = async function (url: string): Promise<void> {
  const cloneUrl = url.includes('gitlab')
    ? `git clone ${url}`
    : url.includes('gitee')
    ? `git clone ${url}`
    : `git clone https://ghproxy.com/${url}`;
  // 开始计时
  DownloadTimer.start();
  // 下载仓库
  try {
    await execa(cloneUrl, {
      cwd: process.cwd(),
      stdio: 'inherit',
      shell: true,
    });
  } catch (error) {
    console.log(chalk.red(`===> 下载失败\n`));
    console.log(error);
    process.exit(1);
  }
  DownloadTimer.end();
};
