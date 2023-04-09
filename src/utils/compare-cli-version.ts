import semver from 'semver';
import chalk from 'chalk';
import { initQuestions } from '../questions/init-questions';
import { updateCliVersion } from '../utils/update-cli-version';
import { readLocalPackageJson } from './read-local-packagejson';
const { name, version } = readLocalPackageJson(['name', 'version']);

/**
 * @desc 对比线上最新的脚手架版本号
 * @return {Promise<void>}
 */
export const compareCliVersion = async (parseBody): Promise<void> => {
  const latestVersion = parseBody['dist-tags'].latest || '0.0.1';
  // 当前版本号
  const currentVersion = version;
  // 版本号对比
  const hasNewVersion = semver.lt(currentVersion, latestVersion);
  if (hasNewVersion) {
    console.log(chalk.yellow(`  A newer version of ${name} is available`));
    console.log('  最新版本:    ' + chalk.green(latestVersion));
    console.log('  当前版本:    ' + chalk.red(currentVersion));
    const answer = await initQuestions(['updateCliVersion']);
    if (answer.updateCliVersion) {
      await updateCliVersion(latestVersion);
    } else {
      console.log(chalk.red('已放弃版本更新'));
    }
  } else {
    console.log(chalk.green('脚手架已经是最新版本'));
  }
};
