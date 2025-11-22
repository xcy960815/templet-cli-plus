import execa from 'execa'
import path from 'path'
import chalk from 'chalk'
import { ProgressBar } from '@/utils/progress-bar'

/**
 * NPM 镜像源地址（淘宝镜像）
 */
const NPM_REGISTRY = 'https://registry.npm.taobao.org'

/**
 * 控制台消息
 */
const MESSAGES = {
  INSTALL_START: (text: string) => `⌛️ ${chalk.greenBright(text)}`,
  INSTALL_SUCCESS: (text: string) => chalk.greenBright(text),
  INSTALL_ERROR: (text: string) => chalk.redBright(text),
  CD_COMMAND: (command: string, projectName: string) =>
    `   ${chalk.redBright(command)} ${chalk.yellowBright(projectName)}`,
  DEV_COMMAND: (command: string) => `   ${chalk.greenBright(command)}`,
} as const

/**
 * 为项目安装依赖包
 * 使用淘宝 npm 镜像源进行安装，安装完成后输出后续操作提示
 *
 * @param projectName - 项目名称（文件夹名称）
 * @returns Promise<void>
 */
export async function installDependencies(projectName: string): Promise<void> {
  const projectPath = path.resolve(process.cwd(), projectName)

  const progressBar = new ProgressBar({
    description: '正在安装依赖包',
    barLength: 30,
  })

  try {
    // 使用模拟进度条（因为 npm install 的输出格式复杂，难以准确解析）
    let progress = 0
    const progressInterval = setInterval(() => {
      if (progress < 95) {
        progress += Math.random() * 5
        progress = Math.min(progress, 95)
        progressBar.render({ completed: progress, total: 100 })
      }
    }, 300)

    await execa('npm', ['install', '--registry', NPM_REGISTRY], {
      shell: true,
      stdio: 'inherit',
      cwd: projectPath,
    })

    clearInterval(progressInterval)
    progressBar.complete(100)
    progressBar.clear()

    console.info(`${MESSAGES.INSTALL_SUCCESS('🎉依赖包安装完成')}\n`)
    console.info(`${MESSAGES.CD_COMMAND('cd', projectName)}\n`)
    console.info(MESSAGES.DEV_COMMAND('npm run dev'))
  } catch (error) {
    progressBar.clear()
    console.error(MESSAGES.INSTALL_ERROR('   ❌ 安装依赖包失败，请检查网络或手动安装依赖包'))
    // 可以选择是否重新抛出错误，这里保持静默失败以允许用户手动安装
  }
}
