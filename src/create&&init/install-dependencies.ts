import execa from 'execa'
import path from 'path'
import chalk from 'chalk'

/**
 * @desc 给当前项目安装依赖包
 * @param {string} templateName 模板名称
 * @param {string} projectName 项目名称
 * @returns {Promise<void>}
 */
export const installDependencies = async (projectName: string): Promise<void> => {
  // 获取当前项目的绝对路径
  const projectPath = path.resolve(process.cwd(), projectName)
  console.info(`⌛️ ${chalk.greenBright('开始安装依赖包')}`)
  try {
    // 一次性切换 npm 源并安装依赖包
    await execa(`npm`, ['install', '--registry', 'https://registry.npm.taobao.org'], {
      shell: true,
      stdio: 'inherit',
      cwd: projectPath,
    })

    console.info(chalk.greenBright('🎉依赖包安装完成\n'))
    // 输出 cd 指令
    console.info(`   ${chalk.redBright('cd')} ${chalk.yellowBright(projectName)}\n`)
    // 输出 启动 指令
    console.info(`   ${chalk.greenBright('npm run dev')}`)
  } catch (error) {
    console.error(chalk.redBright('   ❌ 安装依赖包失败，请检查网络或手动安装依赖包'))
  }
}
