import chalk from 'chalk';
import { readLocalPackageJson } from '../common/read-local-packagejson';
import { printAsTable } from '@/common/print-as-table';
const { bin } = readLocalPackageJson(['bin']);
const cliShell = Object.keys(bin || {})[0];

/**
 * @desc 打印帮助信息
 * @return {void}
 */
export const printHelp = (): void => {
  const tableHeader = [`${chalk.blueBright('  指令')}`, `${chalk.blueBright(' 说明')}`];
  const tableBody = {
    [`${cliShell} list`]: '查看所有模板列表',
    [`${cliShell} init`]: '自定义选择模板',
    [`${cliShell} update`]: '脚手架更新',
    [`${cliShell} replace <仓库地址>`]: '替换仓库地址',
    [`${cliShell} kill <端口号>`]: '杀死指定端口号的进程',
    [`${cliShell} create <模板名称> <项目名称>`]: '指定模板名称创建项目',
  };
  printAsTable(tableBody, tableHeader);
};
