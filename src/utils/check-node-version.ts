import semver from 'semver';
import chalk from 'chalk';
import { readLocalPackageJson } from '@/utils/read-local-packagejson';
// 获取package.json的内容
const { engines, name } = readLocalPackageJson(['engines', 'name']);

/**
 * @desc 检查当前node版本
 * @returns {Promise<void>}
 */
export const checkNodeVersion = async function (): Promise<void> {
  // node范围
  const requiredVersion = engines!.node ?? '^0.0.0';
  const compliantVersion = semver.satisfies(process.version, requiredVersion, {
    includePrerelease: true,
  });
  // 如果node版本不符合 就给用户提示
  if (!compliantVersion) {
    console.log(
      chalk.red(
        `\n您当前使用的Node版本为${process.version}\n\n但此版本的${name}需要Node的版本为 ${requiredVersion}\n\n请升级您的Node版本。`,
      ),
    );
    process.exit(1);
  }
};
