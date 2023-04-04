import { download as downloadGitRepo } from './download-git-repo';
import chalk from 'chalk';
import ora from 'ora';
import { printTemplateList } from './print-template-list';
import { getTemplateList } from './get-template-list';

/**
 * @desc 下载github的模板
 * @param {string} templateName 模板名称
 * @param {string} projectName 项目名称
 * @returns {Promise<void>}
 */
const downloadTemplate = async function (
  templateName: string,
  downloadSource: string,
  projectName: string,
): Promise<void> {
  const templateList = await getTemplateList();
  const templateOptions = templateList[templateName];
  // 判断模板是否存在
  if (!templateOptions) {
    console.log(chalk.red(`===>【${templateName}】模版不存在, 请重新选择模版名称。\n`));
    printTemplateList(templateList);
    process.exit(1);
  }
  const spinner = ora(chalk.green('开始拉取模版...')).start();
  try {
    const downloadUrl = `${downloadSource}:${templateOptions.downloadUrl}`;
    console.log('downloadUrl', downloadUrl);

    await downloadGitRepo(downloadUrl, projectName, { clone: true });
    spinner.succeed(chalk.green('===> 模版拉取完成\n'));
  } catch (error) {
    spinner.fail(chalk.red(`===> 模版拉取失败\n`));
    process.exit(1);
  }
};

export { downloadTemplate };
