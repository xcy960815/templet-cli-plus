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
 * 默认 Node.js 版本要求（当 package.json 中未指定时使用）
 */
const DEFAULT_NODE_VERSION = '^0.0.0'

/**
 * Node.js 官网下载地址
 */
const NODEJS_DOWNLOAD_URL = 'https://nodejs.org/zh-cn/download/'

/**
 * 自定义错误类，用于 Node.js 版本不兼容的情况
 */
class NodeVersionError extends Error {
  constructor(
    public readonly currentVersion: string,
    public readonly requiredVersion: string,
    public readonly packageName: string
  ) {
    super('Node.js 版本不兼容')
    this.name = 'NodeVersionError'
    // 确保 instanceof 检查正常工作
    Object.setPrototypeOf(this, NodeVersionError.prototype)
  }
}

/**
 * 获取错误消息字符串
 * @param error 错误对象
 * @returns 错误消息字符串
 */
function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

/**
 * 获取当前 Node.js 版本
 * @returns 当前 Node.js 版本（例如：v18.0.0）
 * @throws {Error} 当无法获取 Node.js 版本时抛出错误
 */
async function getCurrentNodeVersion(): Promise<string> {
  try {
    const { stdout } = await execa('node', ['-v'])
    return stdout.trim()
  } catch (error) {
    throw new Error(`无法获取 Node.js 版本: ${getErrorMessage(error)}`)
  }
}

/**
 * 格式化版本不兼容的错误消息
 * @param currentVersion 当前 Node.js 版本
 * @param requiredVersion 要求的 Node.js 版本
 * @param packageName 包名称
 * @returns 格式化后的错误消息
 */
function formatVersionMismatchMessage(
  currentVersion: string,
  requiredVersion: string,
  packageName: string
): string {
  return [
    '',
    `您当前使用的 Node.js 版本为 ${currentVersion}`,
    '',
    `但此版本的 ${packageName} 需要 Node.js 版本为 ${requiredVersion}`,
    '',
    '请升级您的 Node.js 版本。',
    '',
    '您可以使用以下命令升级 Node.js：',
    '1. 使用 nvm（推荐）：',
    '   nvm install --lts',
    '   nvm use --lts',
    '',
    '2. 或直接从 Node.js 官网下载：',
    `   ${NODEJS_DOWNLOAD_URL}`,
    '',
  ].join('\n')
}

/**
 * 检查当前 Node.js 版本是否符合要求
 * @throws {NodeVersionError} 当 Node.js 版本不兼容时抛出错误
 */
export async function checkNodeVersion(): Promise<void> {
  try {
    const packageInfo = readLocalPackageJson(['engines', 'name']) as PackageInfo
    const { engines, name } = packageInfo
    const requiredVersion = engines?.node ?? DEFAULT_NODE_VERSION
    const currentNodeVersion = await getCurrentNodeVersion()

    const isCompliant = semver.satisfies(currentNodeVersion, requiredVersion, {
      includePrerelease: true,
    })

    if (!isCompliant) {
      const error = new NodeVersionError(currentNodeVersion, requiredVersion, name)
      const errorMessage = formatVersionMismatchMessage(currentNodeVersion, requiredVersion, name)
      console.error(chalk.redBright(errorMessage))
      throw error
    }
  } catch (error) {
    // 如果是版本不兼容错误，已经打印了详细消息，直接退出
    if (error instanceof NodeVersionError) {
      process.exit(1)
    }

    // 其他错误，打印错误信息后退出
    console.error(chalk.redBright(`检查 Node.js 版本时出错: ${getErrorMessage(error)}`))
    process.exit(1)
  }
}
