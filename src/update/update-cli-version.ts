import execa from 'execa'
import chalk from 'chalk'
import ora from 'ora'
import { readLocalPackageJson } from '@/common/read-local-package-json'

const { name } = readLocalPackageJson(['name'])
const REGISTRY_URL = 'https://registry.npmmirror.com'

/**
 * 更新 CLI 到指定版本
 * @param latestVersion - 要更新到的版本号
 * @throws {Error} 当更新失败时抛出错误
 */
export const updateCliVersion = async (latestVersion: string): Promise<void> => {
  if (!name) {
    throw new Error('无法获取包名，更新失败')
  }

  if (!latestVersion) {
    throw new Error('版本号不能为空')
  }

  const spinner = ora({
    text: chalk.blue(`正在更新 ${name} 到版本 ${latestVersion}...`),
    spinner: 'dots',
  }).start()

  try {
    // 先移除本地老版本
    spinner.text = chalk.blue(`正在移除本地旧版本...`)
    try {
      await execa('npm', ['uninstall', '-g', name!], {
        shell: true,
        stdio: 'pipe', // 使用 pipe 以隐藏 npm 的详细输出，只显示 spinner
      })
    } catch (uninstallError) {
      // 如果卸载失败（可能包不存在），继续执行安装
      // 这不会影响后续的安装流程
    }

    // 安装新版本
    spinner.text = chalk.blue(`正在安装新版本 ${latestVersion}...`)
    await execa('npm', ['install', '-g', `${name}@${latestVersion}`, '--registry', REGISTRY_URL], {
      shell: true,
      stdio: 'pipe', // 使用 pipe 以隐藏 npm 的详细输出，只显示 spinner
    })

    spinner.succeed(chalk.green(`✅ ${name} 已成功更新到版本 ${latestVersion}`))
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    spinner.fail(chalk.red(`❌ 更新失败: ${errorMessage}`))
    throw new Error(`更新 ${name} 到版本 ${latestVersion} 失败: ${errorMessage}`)
  }
}
