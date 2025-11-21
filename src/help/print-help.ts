import chalk from 'chalk'
import { readLocalPackageJson } from '../common/read-local-packagejson'
import { printAsTable } from '@/common/print-as-table'
const { bin } = readLocalPackageJson(['bin'])
const cliShell =
  typeof bin === 'string' ? bin : bin && typeof bin === 'object' ? Object.keys(bin)[0] : 'templet'

/**
 * @desc 打印帮助信息
 * @return {Promise<void>}
 */
export const printHelp = async (): Promise<void> => {
  const tableHeader = [`${chalk.blueBright('  指令')}`, `${chalk.blueBright('   说明')}`]
  const tableBody = {
    [`${cliShell} list`]: ' 查看所有模板列表',
    [`${cliShell} init`]: ' 自定义选择模板',
    [`${cliShell} create <模板名称> <项目名称>`]: ' 指定模板名称创建项目',
    [`${cliShell} clone <仓库地址>`]: ' 代理 github clone 指令',
    [`${cliShell} replace <仓库地址>`]: ' 替换仓库地址',
    [`${cliShell} kill <端口号>`]: ' 杀死占用的端口号的进程',
    [`${cliShell} update`]: ' 脚手架更新',
    [`${cliShell} help`]: ' 查看帮助信息',
  }

  const cleanup = await printAsTable(tableBody, tableHeader)

  // 当进程退出时清理事件监听器
  process.on('exit', cleanup)
}
