import execa from 'execa';
import { readLocalPackageJson } from '../common/read-local-packagejson';
const { name } = readLocalPackageJson(['name']);

/**
 * @desc 将依赖包更新到指定的版本号
 * @param {最新的版本号} latestVersion
 */
export const updateCliVersion = async function (_latestVersion: string): Promise<void> {
  // 一次性切换 npm 源并安装依赖包
  // 不知道此方法 可不可以解决 更新之后 不加载最新版本的问题
  await execa(
    `npm`,
    ['install', '-g', `${name}@latest`, '--registry', 'https://registry.npm.taobao.org'],
    {
      shell: true,
      stdio: 'inherit',
    },
  );
};
