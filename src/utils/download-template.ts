import { promisify } from 'util';
import { getTemplateList } from './get-template-list';
import chalk from 'chalk';
import ora from 'ora';
import { printTemplateList } from './print-template-list';
import downloadGitRepo from 'download-git-repo';

/**
 * @desc 下载github的模板
 * @param {string} templateName 模板名称
 * @param {string} projectName 项目名称
 * @returns {Promise<void>}
 */
const downloadTemplate = async function (templateName: string, projectName: string): Promise<void> {
  const templateList = await getTemplateList();
  // 判断模板是否存在
  if (!templateList[templateName]) {
    console.log(chalk.red(`===>【${templateName}】模版不存在, 请重新选择模版名称。\n`));
    printTemplateList(templateList);
    process.exit(1);
  }
  // 通过 templateName 获取下载地址
  const { downloadUrl } = templateList[templateName];

  const spinner = ora(chalk.green('开始拉取模版...'));
  // 包装成一个promise方法.
  const downloadGitRepoPromise = promisify(downloadGitRepo);

  try {
    // 下载模版
    spinner.start();
    await downloadGitRepoPromise(`direct:${downloadUrl}`, projectName, { clone: true });
    spinner.succeed(chalk.green('===> 模版拉取完成\n'));
  } catch (error: any) {
    spinner.fail(chalk.red(`===> 模版拉取失败, 失败原因: ${chalk.red(error.message)}`));
    // 退出node进程
    process.exit(1);
  }
};

export { downloadTemplate };
