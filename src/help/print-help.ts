import chalk from 'chalk'
import { readLocalPackageJson } from '@/common/read-local-package-json'
import { printAsTable } from '@/common/print-as-table'

/**
 * 默认 CLI 命令名称
 */
const DEFAULT_CLI_NAME = 'templet'

/**
 * 从 package.json 中获取 CLI 命令名称
 *
 * @returns CLI 命令名称
 */
function getCliShellName(): string {
  const { bin } = readLocalPackageJson(['bin'])

  if (typeof bin === 'string') {
    return bin
  }

  if (bin && typeof bin === 'object') {
    const firstKey = Object.keys(bin)[0]
    return firstKey || DEFAULT_CLI_NAME
  }

  return DEFAULT_CLI_NAME
}

/**
 * 构建帮助信息表格数据
 *
 * @param cliName - CLI 命令名称
 * @returns 包含命令和说明的对象
 */
function buildHelpTableData(cliName: string): Record<string, string> {
  return {
    [`${cliName} list`]: ' 查看所有模板列表',
    [`${cliName} init`]: ' 自定义选择模板',
    [`${cliName} create <模板名称> <项目名称>`]: ' 指定模板名称创建项目',
    [`${cliName} clone <仓库地址>`]: ' 代理 github clone 指令',
    [`${cliName} replace <仓库地址>`]: ' 替换仓库地址',
    [`${cliName} kill <端口号>`]: ' 杀死占用的端口号的进程',
    [`${cliName} update`]: ' 脚手架更新',
    [`${cliName} help`]: ' 查看帮助信息',
  }
}

/**
 * 打印帮助信息
 * 显示所有可用的 CLI 命令及其说明
 *
 * @returns Promise<void>
 */
export async function printHelp(): Promise<void> {
  const cliShell = getCliShellName()
  const tableHeader = [`${chalk.blueBright('  指令')}`, `${chalk.blueBright('   说明')}`]
  const tableBody = buildHelpTableData(cliShell)

  await printAsTable(tableBody, tableHeader)
}
