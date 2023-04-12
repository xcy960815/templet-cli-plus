import chalk from 'chalk';
import execa from 'execa';
import ora from 'ora';
interface IProcessOption {
  processName: string;
  processId: string;
}
/**
 * @desc kill 进程
 * @param {Array<IProcessOption>} processOptions
 * @returns {Promise<void>}
 */
export const killProcess = async function (
  processOptions: Array<IProcessOption>,
  port: string,
): Promise<void> {
  if (!processOptions.length) {
    console.log(chalk.redBright(`未检测到与端口 ${port} 相关的node进程`));
    process.exit(1);
  }
  const processOption = processOptions[0];
  const { processName, processId } = processOption;
  const spinner = ora(
    chalk.yellowBright(`正在关闭端口 ${port} 相关进程，进程名称: ${processName}`),
  ).start();
  const result = await execa(`kill ${processId}`, {
    shell: true,
  });
  if (result.code === 0) {
    spinner.succeed(chalk.greenBright(`端口 ${port} 相关进程关闭成功，进程名称: ${processName}`));
    process.exit(0);
  } else {
    spinner.fail(chalk.redBright(`端口 ${port} 相关进程关闭失败，进程名称: ${processName}`));
    process.exit(1);
  }
};
