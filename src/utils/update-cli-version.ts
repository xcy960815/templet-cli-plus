import execa from 'execa';
import { readLocalPackageJson } from './read-local-packagejson';
const { name } = readLocalPackageJson(['name']);

/**
 * @desc 将依赖包更新到指定的版本号
 * @param {最新的版本号} latestVersion
 */
const updateCliVersion = async function (latestVersion: string): Promise<void> {
  // 一次性切换 npm 源并安装依赖包
  await execa(
    `npm`,
    ['install', `${name}@${latestVersion}`, '-g', '--registry', 'https://registry.npm.taobao.org'],
    {
      shell: true,
      stdio: 'inherit',
    },
  );
};

export { updateCliVersion };
