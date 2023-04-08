import chalk from 'chalk';
import execa from 'execa'; /* 执行指令 */

/**
 * @desc kill 进程
 * @param {{processName:string,processId:string}} processOption
 * @returns {Promise<{processName:string,processId:string}>}
 */
export const killProcess = async function (processOption: {
  processName: string;
  processId: string;
}): Promise<{ processName: string; processId: string }> {
  const { processName, processId } = processOption;
  console.log(chalk.yellowBright(`正在关闭进程:${processName}`));
  const execShell = `kill ${processId}`;
  const result = await execa.command(execShell).catch((error: any) => error);
  if (result.exitCode === 0) {
    console.log(chalk.greenBright(`进程关闭成功:${processName}`));
  } else {
    console.log(chalk.redBright(`进程关闭失败:${processName}`));
  }
  return processOption;
};
