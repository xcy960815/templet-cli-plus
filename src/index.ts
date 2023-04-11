import { checkNodeVersion } from '@/common/check-node-version';
checkNodeVersion();
import { Command } from 'commander';
const program = new Command();
import { initQuestions } from '@/questions/init-questions';
import { checkReplaceUrl } from '@/replace/check-replace-url';
import { replaceOriginAddress } from '@/replace/replace-origin-address';
import { getProcess } from '@/kill/get-process';
import { killProcess } from '@/kill/kill-process';
import { downloadTemplate } from '@/create&&init/download-template';
import { setTargetPackageJson } from '@/create&&init/set-target-packagejson';
import { installDependencies } from '@/create&&init/install-dependencies';
import chalk from 'chalk';
import { checkCliVersion } from '@/update/check-cli-version';
import { checkSameFolder } from '@/create&&init/check-same-folder';
import { handleSameFolder } from '@/create&&init/handle-same-folder';
import { cloneRepositorie } from '@/clone/clone-repositorie';
import { getTemplateList } from '@/list/get-template-list';
import { printTemplateList } from '@/list/print-template-list';
import { readLocalPackageJson } from '@/common/read-local-packagejson';
const { bin, version } = readLocalPackageJson(['bin', 'version']);
// 获取当前的指令
const cliShell = Object.keys(bin || {})[0];
program.version(version!, '-v,-V,--version');

/**
 * @desc 初始化指定版本的指令
 */
program
  .command('create <templateName> <projectName>')
  .description(chalk.yellowBright('通过指定模版创建项目'))
  .action(async (templateName: string, projectName: string) => {
    // 检查版本号
    await checkCliVersion();
    // 收集用户配置
    const answers = await initQuestions(
      ['projectName', 'version', 'description', 'author'],
      projectName,
    );
    // 检查文件名称
    const hasSameFolder = await checkSameFolder(projectName);
    const newProjectName = hasSameFolder ? await handleSameFolder(projectName) : projectName;

    await downloadTemplate(templateName, newProjectName);

    await setTargetPackageJson(newProjectName, { ...answers, templateName });

    installDependencies(newProjectName);
  });

/**
 * @desc 用户自己选择版本
 */
program
  .command('init')
  .description(chalk.greenBright('初始化模板'))
  .action(async () => {
    // 检查版本号
    await checkCliVersion();
    // 收集用户信息
    const answers = await initQuestions([
      'templateName',
      'projectName',
      'version',
      'description',
      'author',
    ]);
    const hasSameFolder = await checkSameFolder(answers.projectName);
    const newProjectName = hasSameFolder
      ? await handleSameFolder(answers.projectName)
      : answers.projectName;
    // 下载模板
    await downloadTemplate(answers.templateName, newProjectName);
    // 现在成功之后 修改package.json 内容
    await setTargetPackageJson(newProjectName, answers);
    // 安装依赖包
    installDependencies(newProjectName);
  });

/**
 * @desc 查看所有的vue版本指令
 */
program
  .command('list')
  .description(chalk.redBright('查看所有模版列表'))
  .action(async () => {
    // 检查版本号
    await checkCliVersion();
    const templateList = await getTemplateList(true);
    printTemplateList(templateList);
  });

/**
 * @desc 替换仓库指令
 */
program
  .command('replace <url>')
  .description(chalk.redBright('替换仓库指令'))
  .action(async (originAddress: string) => {
    // 检查cli版本
    await checkCliVersion();
    // 检查url是否合法
    const newOriginAddress = await checkReplaceUrl(originAddress);
    // 执行修改地址
    await replaceOriginAddress(newOriginAddress);
  });
/**
 * @desc kill指令
 */
program
  .command('kill <port>')
  .description(chalk.blueBright('kill指令'))
  .action(async (port: string) => {
    // 获取进程id
    const processOption = await getProcess(port);
    // 杀死进程
    await killProcess(processOption);
  });

/**
 * @desc clone指令
 */
program
  .command('clone <url>')
  .description(chalk.blueBright('clone指令'))
  .action(async (url: string) => {
    // 检查cli版本
    await checkCliVersion();
    const hasSameFolder = await checkSameFolder(url);
    if (hasSameFolder) {
      console.log(chalk.redBright('检测到当前目录下存在相同的文件名, 请更换文件名后重试'));
      process.exit(1);
    }
    // clone 仓库
    await cloneRepositorie(url);
  });
/**
 * @desc 脚手架更新指令
 * @returns {String}
 */
program
  .command('update')
  .description(chalk.bgYellow('脚手架更新指令'))
  .action(async () => {
    // 检查版本号
    await checkCliVersion();
    console.log(chalk.bgYellow('🎉 脚手架已经是最新版本\n'));
  });

/**
 * @desc 脚手架帮助指令
 * @returns {String}
 */
program
  .command('help')
  .description('脚手架帮助指令')
  .action(async () => {
    // 检查版本号
    await checkCliVersion();
    console.log(
      `${chalk.blueBright(`${cliShell} list`)} : ${chalk.blueBright('查看所有模板列表')}`,
    );
    console.log(`${chalk.redBright(`${cliShell} init`)} : ${chalk.redBright('自定义选择模板')}`);
    console.log(
      `${chalk.yellowBright(`${cliShell} create <模板名称> <项目名称>`)} : ${chalk.yellowBright(
        '指定模板名称创建项目',
      )}`,
    );
    console.log(
      `${chalk.greenBright(`${cliShell} replace <仓库地址>`)} : ${chalk.greenBright(
        '替换仓库地址',
      )}`,
    );
    console.log(
      `${chalk.bgRed(`${cliShell} kill <端口号>`)} : ${chalk.bgRed('杀死指定端口号的进程')}`,
    );
    console.log(`${chalk.bgYellow(`${cliShell} update`)} : ${chalk.bgYellow('脚手架更新指令')}`);
  });

program.parse(process.argv);
