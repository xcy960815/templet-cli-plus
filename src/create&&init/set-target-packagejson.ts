import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import ora from 'ora';
import { readLocalPackageJson } from '../common/read-local-packagejson';
import { QuestionsMap } from '@/questions/init-questions';
interface ITargetPackageJson {
  name: string;
  version: string;
  description?: string;
  keywords?: string[];
  homepage?: string;
  bugs?: {
    url?: string;
    email?: string;
  };
  license?: string;
  author?:
    | string
    | {
        name: string;
        email?: string;
        url?: string;
      };
  contributors?:
    | string[]
    | {
        name: string;
        email?: string;
        url?: string;
      }[];
  files?: string[];
  main?: string;
  browser?: string;
  bin?: {
    [key: string]: string;
  };
  man?: string | string[];
  directories?: {
    lib?: string;
    bin?: string;
    man?: string;
    doc?: string;
    example?: string;
  };
  repository?: {
    type: string;
    url: string;
  };
  scripts?: {
    [key: string]: string;
  };
  dependencies?: {
    [key: string]: string;
  };
  devDependencies?: {
    [key: string]: string;
  };
  peerDependencies?: {
    [key: string]: string;
  };
  engines?: {
    node?: string;
    npm?: string;
  };
  os?: string[];
  cpu?: string[];
  private?: boolean;
  publishConfig?: {
    [key: string]: string;
  };
  [key: string]: any;
}
/**
 * @desc 修改创建的项目的 package.json 文件
 * @param projectName
 * @param answers
 * @returns {void}
 */

type IAnswers = { [key in keyof QuestionsMap]: string };

const setTargetPackageJson = (projectName: string, answers: IAnswers) => {
  const spinner = ora(chalk.greenBright('===> 开始修改package.json文件...'));
  spinner.start();
  try {
    const { templateName } = answers;
    // 创建的项目的 package.json 的路径
    const targetPackageJsonPath = path.resolve(process.cwd(), `${projectName}/package.json`);
    const targetPackageJsonBuffer: Buffer = fs.readFileSync(targetPackageJsonPath);
    // 将 templateName 替换成 projectName
    // 创建一个动态的正则
    const replaceTemplateNameReg = new RegExp(templateName || '', 'g');
    const targetPackageContentString = targetPackageJsonBuffer
      .toString()
      .replace(replaceTemplateNameReg, projectName || templateName || '');
    const targetPackageContent: ITargetPackageJson = JSON.parse(targetPackageContentString);
    Object.keys(answers).forEach((answer: string) => {
      const answerValue: string = answers[answer];
      const hasKey: boolean = targetPackageContent.hasOwnProperty(answer);
      if (hasKey) {
        targetPackageContent[answer] = answerValue ? answerValue : '';
      } else if (answer === 'projectName') {
        targetPackageContent.name = answerValue;
      }
    });
    fs.writeFileSync(targetPackageJsonPath, JSON.stringify(targetPackageContent, null, 4));
    spinner.succeed(`${chalk.greenBright('===> 修改package.json文件完毕')}\n`);
    const { name } = readLocalPackageJson(['name']);
    // 提示项目创建成功
    console.log(
      `${chalk.green(`【 ${projectName} 】`)} 由 ${chalk.yellowBright(
        `【 ${name} 】创建项目完成\n`,
      )}`,
    );
  } catch (e) {
    spinner.fail(chalk.redBright('===> 修改package.json文件失败'));
  }
};

export { setTargetPackageJson };
