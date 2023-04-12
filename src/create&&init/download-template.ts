import chalk from 'chalk';
import ora from 'ora';
import gitclone from 'git-clone/promise';
import { printAsTable } from '@/common/print-as-table';
import { getTemplateList } from '@/list/get-template-list';

/**
 * @desc 下载github的模板
 * @param {string} templateName 模板名称
 * @param {string} projectName 项目名称
 * @returns {Promise<void>}
 */
export const downloadTemplate = async function (
  templateName: string,
  projectName: string,
): Promise<void> {
  const templateList = await getTemplateList();
  const templateOptions = templateList[templateName];
  // 判断模板是否存在
  if (!templateOptions) {
    console.log(chalk.red(`===>【${templateName}】模版不存在, 请重新选择模版名称。\n`));
    const tableHeader = [chalk.red('  模板名称'), chalk.blue('  模板描述')];
    const tableBody: { [key: string]: string } = {};
    Object.keys(templateList).forEach((key) => {
      tableBody[key] = templateList[key].desc;
    });
    printAsTable(tableBody, tableHeader);
    process.exit(1);
  }
  console.log('');
  const spinner = ora(chalk.green('开始拉取模版...')).start();
  try {
    // 利用 ghproxy.com 代理 github.com
    const downloadUrl = `https://ghproxy.com/${templateOptions.downloadUrl.replace('#master', '')}`;
    await gitclone(downloadUrl, projectName, {
      checkout: 'master',
      shallow: true,
    });
    spinner.succeed(chalk.green('===> 模版拉取完成\n'));
  } catch (error) {
    spinner.fail(chalk.red(`===> 模版拉取失败\n`));
    process.exit(1);
  }
};
