import semver from 'semver'
import chalk from 'chalk'
import { initQuestions } from '../questions/init-questions'
import { readLocalPackageJson } from '../common/read-local-packagejson'
const { name, version: currentVersion } = readLocalPackageJson(['name', 'version'])

/**
 * @desc 对比线上最新的脚手架版本号
 * @return {Promise<void>}
 */
export const compareCliVersion = async (latestVersion: string): Promise<string | undefined> => {
  // 版本号对比
  const hasNewVersion: boolean = semver.ltr(currentVersion!, latestVersion)
  if (hasNewVersion) {
    console.log(chalk.yellow(`  A newer version of ${name} is available`))
    console.log('  最新版本:    ' + chalk.green(latestVersion))
    console.log('  当前版本:    ' + chalk.red(currentVersion))
    const answer = await initQuestions(['updateCliVersion'])
    if (answer.updateCliVersion) {
      return latestVersion
    } else {
      console.log(chalk.red('已放弃版本更新'))
    }
  } else {
    console.log(chalk.green('脚手架已经是最新版本'))
  }
}
