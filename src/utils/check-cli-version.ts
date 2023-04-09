import ora from 'ora';
import semver from 'semver';
import { initQuestions } from '@/questions/init-questions';
import chalk from 'chalk';
import { promisify } from 'util';
import { updateCliVersion } from './update-cli-version';
import { readLocalPackageJson } from './read-local-packagejson';
import request from 'request';
const { name, version } = readLocalPackageJson(['name', 'version']);

/**
 * @desc 检查线上最新的脚手架版本号
 * @return {Promise<void>}
 */
const checkCliVersion = async (): Promise<void> => {
  const spinner = ora(chalk.green('正在检查脚手架版本\n'));
  spinner.start();
  const requestPromise = promisify(request);
  const result = await requestPromise({
    // url: `https://registry.npmjs.org/${name}`,
    url: `https://registry.npmmirror.com/${name}`, // 使用淘宝源镜像
    timeout: 1000,
    // agent,
  }).catch((error) => {
    // 当错误类型不为超时错误时，打印错误信息
    if (error.code !== 'ETIMEDOUT') {
      spinner.fail(chalk.red('脚手架版本检查失败请重试一次\n'));
    } else {
      spinner.fail(chalk.red('脚手架版本检查超时\n'));
    }
    process.exit(1);
  });
  spinner.succeed(`${chalk.green('🎉 手架版本检查完成')}\n`);
  if (result) {
    const { body, statusCode } = result;
    if (statusCode === 200) {
      const parseBody = JSON.parse(body);
      // 获取最新的cli版本
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
    }
  }
};

export { checkCliVersion };
