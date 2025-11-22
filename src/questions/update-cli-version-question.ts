import chalk from 'chalk'
import { readLocalPackageJson } from '@/common/read-local-packagejson'

/**
 * 问题配置接口
 */
interface QuestionConfig {
  type: 'confirm'
  name: 'updateCliVersion'
  message: string
}

/**
 * 获取 CLI 工具名称
 * @returns CLI 工具名称，如果获取失败则返回默认值
 */
function getCliName(): string {
  try {
    const { name } = readLocalPackageJson(['name'])
    return name || 'CLI 工具'
  } catch (error) {
    // 如果无法读取 package.json，使用默认名称
    return 'CLI 工具'
  }
}

/**
 * 创建更新 CLI 版本问题配置
 * @returns 问题配置对象
 */
export function updateCliVersionQuestion(): QuestionConfig {
  const cliName = getCliName()
  return {
    type: 'confirm',
    name: 'updateCliVersion',
    message: chalk.cyan(`是否要更新 ${chalk.yellow(cliName)} 到最新版本?`),
  }
}
