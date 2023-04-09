import chalk from 'chalk';
import ora from 'ora';
import { downloadRepositories } from '@/utils/download-repositories';
import { printTemplateList } from '@/utils/print-template-list';
import { getTemplateList } from '@/utils/get-template-list';

/**
 * @desc 下载github的模板
 * @param {string} templateName 模板名称
 * @param {string} projectName 项目名称
 * @returns {Promise<void>}
 */
export const downloadTemplate = async function (
  templateName: string,
  downloadType: string,
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
    const downloadUrl = `${templateOptions.downloadUrl}`;
    if (downloadType === 'zip') {
      // zip:
      await downloadRepositories(downloadUrl, projectName, { clone: false });
    }

    // ${downloadType}:
    await downloadRepositories(downloadUrl, projectName, { clone: true });
    spinner.succeed(chalk.green('===> 模版拉取完成\n'));
  } catch (error) {
    spinner.fail(chalk.red(`===> 模版拉取失败\n`));
    process.exit(1);
  }
};
