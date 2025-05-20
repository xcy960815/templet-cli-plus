import semver from 'semver'
import chalk from 'chalk'
import execa from 'execa'
import { readLocalPackageJson } from '@/common/read-local-packagejson'

interface PackageEngines {
  node?: string
}

interface PackageInfo {
  engines?: PackageEngines
  name: string
}

/**
 * 自定义错误类，用于 Node.js 版本不兼容的情况
 */
class NodeVersionError extends Error {
  constructor(
    public currentVersion: string,
    public requiredVersion: string,
    public packageName: string
  ) {
    super(`Node.js 版本不兼容`)
    this.name = 'NodeVersionError'
  }
}

/**
 * 获取当前 Node.js 版本
 * @returns Promise<string> 当前 Node.js 版本
 * @throws {Error} 当无法获取 Node.js 版本时抛出错误
 */
async function getCurrentNodeVersion(): Promise<string> {
  try {
    const { stdout } = await execa('node', ['-v'])
    return stdout.trim()
  } catch (error) {
    throw new Error(
      `无法获取 Node.js 版本: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

/**
 * 检查当前 Node.js 版本是否符合要求
 * @throws {NodeVersionError} 当 Node.js 版本不兼容时抛出错误
 */
export async function checkNodeVersion(): Promise<void> {
  try {
    const { engines, name } = readLocalPackageJson(['engines', 'name']) as PackageInfo
    const requiredVersion = engines?.node ?? '^0.0.0'
    const currentNodeVersion = await getCurrentNodeVersion()

    const isCompliant = semver.satisfies(currentNodeVersion, requiredVersion, {
      includePrerelease: true,
    })

    if (!isCompliant) {
      const error = new NodeVersionError(currentNodeVersion, requiredVersion, name)
      console.error(
        chalk.redBright(
          `\n您当前使用的 Node.js 版本为 ${currentNodeVersion}\n\n` +
            `但此版本的 ${name} 需要 Node.js 版本为 ${requiredVersion}\n\n` +
            '请升级您的 Node.js 版本。\n\n' +
            '您可以使用以下命令升级 Node.js：\n' +
            '1. 使用 nvm（推荐）：\n' +
            '   nvm install --lts\n' +
            '   nvm use --lts\n\n' +
            '2. 或直接从 Node.js 官网下载：\n' +
            '   https://nodejs.org/zh-cn/download/\n'
        )
      )
      throw error
    }
  } catch (error) {
    if (error instanceof NodeVersionError) {
      process.exit(1)
    }
    console.error(
      chalk.redBright(
        `检查 Node.js 版本时出错: ${error instanceof Error ? error.message : String(error)}`
      )
    )
    process.exit(1)
  }
}
