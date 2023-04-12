import ora from 'ora';
import chalk from 'chalk';
import { promisify } from 'util';
import { readLocalPackageJson } from '@/common/read-local-packagejson';
import request from 'request';
const { name } = readLocalPackageJson(['name']);
const requestPromise = promisify(request);

interface IJsonResult {
  statusCode: number;
  body: string;
  headers: {
    [key: string]: string;
  };
  request: {
    uri: {
      protocol: string;
      slashes: boolean;
      auth: null;
      host: string;
      port: number;
      hostname: string;
      hash: null;
      search: null;
      query: null;
      pathname: string;
      path: string;
      href: string;
    };
    method: string;
  };
}

interface IResult {
  toJSON: () => IJsonResult;
}

/**
 * @desc 检查线上最新的脚手架版本号
 * @return {Promise<void>}
 */
export const getCliVersion = async (): Promise<IResult> => {
  const spinner = ora(chalk.green('正在检查脚手架版本\n')).start();
  const result = await requestPromise({
    url: `https://registry.npmmirror.com/${name}`,
    timeout: 3000,
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
  return result;
};
