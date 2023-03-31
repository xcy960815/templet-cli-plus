import ora from 'ora';
import { promisify } from 'util';
import request from 'request';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
interface ITemplate {
  desc: string;
  downloadUrl: string;
}

/**
 * @desc 查询线上模板列表
 * @link https://bbs.huaweicloud.com/blogs/294241 加速方案
 * @returns {Promise<Record<string, ITemplate>>}
 */
const getTemplateList = async function(): Promise<Record<string, ITemplate>> {
  const isDev = process.env.NODE_ENV === 'development';
  const spinner = ora(chalk.greenBright('正在查询模板相关配置...'));
  spinner.start();
  const responseFilePath = path.join(__dirname, 'template-list.json');
  const cacheTime = isDev ? 10 * 1000 : 24 * 60 * 60 * 1000; // 开发环境缓存有效期为10秒 线上环境有效期为1天
  try {
    const cacheStat = fs.statSync(responseFilePath);
    const now = new Date().getTime();
    if (now - cacheStat.mtimeMs < cacheTime) {
      // 缓存未过期，直接读取文件中的数据
      const data = fs.readFileSync(responseFilePath, 'utf-8');
      spinner.succeed(chalk.greenBright('🎉 模板相关配置查询完成（使用缓存数据）\n'));
      return JSON.parse(data);
    }
  } catch (error) {}

  // 缓存已过期或文件不存在，重新请求接口获取最新数据
  const result = await promisify(request)({
    url:
      'https://ghproxy.com/https://raw.githubusercontent.com/xcy960815/template-list/master/template-list.json',
    timeout: 10000,
  }).catch(error => {
    if (error.code === 'ETIMEDOUT') {
      spinner.fail(chalk.redBright('模板相关配置查询超时，请稍后再试'));
    } else {
      spinner.fail(chalk.redBright('模板相关配置查询失败，请稍后再试'));
    }
    process.exit(1);
  });

  spinner.succeed(chalk.greenBright('🎉 模板相关配置查询完成（请求最新数据）\n'));

  fs.writeFileSync(responseFilePath, result.body);

  return JSON.parse(result.body);
};

export { getTemplateList };
