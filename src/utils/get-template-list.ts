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
 * @returns {Promise<Record<string, ITemplate>>}
 */
const getTemplateList = async function (): Promise<Record<string, ITemplate>> {
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
    // 使用gitee同步github仓库内容 从而实现加速
    url: 'https://gitee.com/api/v5/repos/xuchongyu/template-list/git/blobs/542ad1e1ce60b9773f80f12cf01e2504377849c2?access_token=911e3419a9f381e2a96bbe0fbd87af52',
    timeout: 10000,
  }).catch((error) => {
    if (error.code === 'ETIMEDOUT') {
      spinner.fail(chalk.redBright('模板相关配置查询超时，请稍后再试'));
    } else {
      spinner.fail(chalk.redBright('模板相关配置查询失败，请稍后再试'));
    }
    process.exit(1);
  });

  spinner.succeed(chalk.greenBright('🎉 模板相关配置查询完成（请求最新数据）\n'));

  const { content } = JSON.parse(result.body);

  const base64Content = Buffer.from(content, 'base64').toString();
  // base64 转 json
  const jsonContent = JSON.parse(base64Content);

  fs.writeFileSync(responseFilePath, base64Content);

  return jsonContent;
};

export { getTemplateList };
