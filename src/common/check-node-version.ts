// import semver from 'semver';
// import chalk from 'chalk';
// import { readLocalPackageJson } from '@/common/read-local-packagejson';
// // 获取package.json的内容
// const { engines, name } = readLocalPackageJson(['engines', 'name']);

// /**
//  * @desc 检查当前node版本
//  * @returns {Promise<void>}
//  */
// export const checkNodeVersion = async function (): Promise<void> {
//   // node范围
//   const requiredVersion = engines!.node ?? '^0.0.0';
//   const compliantVersion = semver.satisfies(process.version, requiredVersion, {
//     includePrerelease: true,
//   });
//   // 如果node版本不符合 就给用户提示
//   if (!compliantVersion) {
//     console.log(
//       chalk.redBright(
//         `\n您当前使用的Node版本为${process.version}\n\n但此版本的${name}需要Node的版本为 ${requiredVersion}\n\n请升级您的Node版本。`,
//       ),
//     );
//     process.exit(0);
//   }
// };
import semver from 'semver';
import chalk from 'chalk';
import execa from 'execa';
import { readLocalPackageJson } from '@/common/read-local-packagejson';

const { engines, name } = readLocalPackageJson(['engines', 'name']);

/**
 * 检查当前 node 版本是否符合要求
 */
export const checkNodeVersion = async function (): Promise<void> {
  // 获取需要的 Node.js 版本范围
  const requiredVersion = engines!.node ?? '^0.0.0';
  // const currentNodeVersion = process.version;
  const { stdout: currentNodeVersion } = await execa('node', ['-v']);
  const isCompliant = semver.satisfies(currentNodeVersion, requiredVersion, {
    includePrerelease: true,
  });

  // 如果当前版本不符合要求，则输出错误信息
  if (!isCompliant) {
    console.error(
      chalk.redBright(
        `\n您当前使用的 Node.js 版本为 ${process.version}\n\n但此版本的 ${name} 需要 Node.js 版本为 ${requiredVersion}\n\n请升级您的 Node.js 版本。`,
      ),
    );
    process.exit(1); // 使用非零数表示出现了异常
  }
};
