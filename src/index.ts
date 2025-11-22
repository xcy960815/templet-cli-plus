// 第三方库
import chalk from 'chalk'
import { Command } from 'commander'
import ora from 'ora'

// 内部模块 - 通用工具
import { checkNodeVersion } from '@/common/check-node-version'
import { printAsTable } from '@/common/print-as-table'
import { readLocalPackageJson } from '@/common/read-local-package-json'

// 内部模块 - 功能模块
import { cloneRepository } from '@/clone/clone-repository'
import { printHelp } from '@/help/print-help'
import { checkSameFolder } from '@/init/check-same-folder'
import { downloadTemplate } from '@/init/download-template'
import { handleSameFolder } from '@/init/handle-same-folder'
import { installDependencies } from '@/init/install-dependencies'
import { setTargetPackageJson } from '@/init/set-target-package-json'
import { getProcessByPort } from '@/kill-process/get-process-port'
import { killProcess } from '@/kill-process/kill-process'
import { getTemplateList } from '@/list/get-template-list'
import { initQuestions } from '@/questions/init-questions'
import { checkReplaceUrl } from '@/replace/check-replace-url'
import { replaceOriginAddress } from '@/replace/replace-origin-address'
import { checkCliVersion } from '@/update/check-cli-version'

// 检查 Node 版本（必须在其他导入之前执行）
checkNodeVersion()

// 初始化 Commander
const program = new Command()
const { version } = readLocalPackageJson(['bin', 'version'])
program.version(version!, '-v,-V,--version')

/**
 * 命令处理函数包装器，自动检查 CLI 版本
 */
function withVersionCheck<T extends (...args: any[]) => Promise<any>>(handler: T): T {
  return (async (...args: Parameters<T>) => {
    await checkCliVersion()
    return handler(...args)
  }) as T
}

/**
 * 处理项目名称冲突
 */
async function resolveProjectName(projectName: string): Promise<string> {
  const hasSameFolder = await checkSameFolder(projectName)
  return hasSameFolder ? await handleSameFolder(projectName) : projectName
}

/**
 * 初始化项目的通用逻辑
 */
async function initializeProject(
  templateName: string,
  projectName: string,
  answers: Record<string, string>
): Promise<void> {
  const newProjectName = await resolveProjectName(projectName)
  await downloadTemplate(templateName, newProjectName)
  await setTargetPackageJson(newProjectName, { ...answers, templateName })
  installDependencies(newProjectName)
}

/**
 * 处理交互式列表退出逻辑
 */
async function handleInteractiveExit(cleanup: () => void): Promise<void> {
  const isInteractive = process.stdout.isTTY && process.stdin.isTTY

  if (!isInteractive) {
    cleanup()
    process.exit(0)
    return
  }

  await new Promise<void>((resolve) => {
    const handleExit = (chunk: Buffer) => {
      const key = chunk.toString().trim().toLowerCase()
      if (key === 'q' || key === '') {
        process.stdin.off('data', handleExit)
        if (process.stdin.isTTY) {
          process.stdin.setRawMode(false)
          process.stdin.pause()
        }
        cleanup()
        resolve()
      }
    }

    process.stdin.setRawMode(true)
    process.stdin.resume()
    process.stdin.on('data', handleExit)
  })

  process.exit(0)
}

/**
 * create 命令：通过指定模版创建项目
 */
program
  .command('create <templateName> <projectName>')
  .description(chalk.yellowBright('通过指定模版创建项目'))
  .action(
    withVersionCheck(async (templateName: string, projectName: string) => {
      try {
        const answers = await initQuestions(
          ['projectName', 'version', 'description', 'author'],
          projectName
        )
        await initializeProject(templateName, projectName, answers)
      } catch (error) {
        // const message = error instanceof Error ? error.message : '未知错误'
        // console.error(chalk.redBright(`❌ 创建项目失败: ${message}`))
        process.exit(1)
      }
    })
  )

/**
 * init 命令：用户自己选择模板和配置
 */
program
  .command('init')
  .description(chalk.greenBright('初始化模板'))
  .action(
    withVersionCheck(async () => {
      try {
        const answers = await initQuestions([
          'templateName',
          'projectName',
          'version',
          'description',
          'author',
        ])
        await initializeProject(answers.templateName, answers.projectName, answers)
      } catch (error) {
        // const message = error instanceof Error ? error.message : '未知错误'
        process.exit(1)
      }
    })
  )

/**
 * list 命令：查看所有模版列表
 */
program
  .command('list')
  .description(chalk.redBright('查看所有模版列表'))
  .action(
    withVersionCheck(async () => {
      try {
        const templateList = await getTemplateList(true)
        const tableHeader = ['模板名称', '模板描述']
        const tableBody: Record<string, string> = {}

        Object.keys(templateList).forEach((key) => {
          tableBody[key] = templateList[key].desc
        })
        await printAsTable(tableBody, tableHeader)
      } catch (error) {
        const message = error instanceof Error ? error.message : '未知错误'
        console.error(chalk.redBright(`❌ 获取模板列表失败: ${message}`))
        process.exit(1)
      }
    })
  )

/**
 * replace 命令：替换仓库地址
 */
program
  .command('replace <url>')
  .description(chalk.redBright('替换仓库指令'))
  .action(
    withVersionCheck(async (originAddress: string) => {
      try {
        const newOriginAddress = await checkReplaceUrl(originAddress)
        await replaceOriginAddress(newOriginAddress)
      } catch (error) {
        const message = error instanceof Error ? error.message : '未知错误'
        console.error(chalk.redBright(`❌ 替换仓库地址失败: ${message}`))
        process.exit(1)
      }
    })
  )

/**
 * kill 命令：杀死指定端口号的进程
 */
program
  .command('kill <port>')
  .description(chalk.blueBright('杀死指定端口号的进程'))
  .action(async (port: string) => {
    try {
      const processOptions = await getProcessByPort(port)
      await killProcess(processOptions, port)
    } catch (error) {
      const message = error instanceof Error ? error.message : '未知错误'
      console.error(chalk.redBright(`❌ 终止进程失败: ${message}`))
      process.exit(1)
    }
  })

/**
 * clone 命令：代理 github clone 指令
 */
program
  .command('clone <url>')
  .description(chalk.blueBright('代理 github clone 指令'))
  .action(
    withVersionCheck(async (url: string) => {
      try {
        const hasSameFolder = await checkSameFolder(url)
        if (hasSameFolder) {
          console.log(chalk.redBright('检测到当前目录下存在相同的文件名, 请更换文件名后重试'))
          process.exit(1)
        }
        await cloneRepository(url)
      } catch (error) {
        const message = error instanceof Error ? error.message : '未知错误'
        console.error(chalk.redBright(`❌ 克隆仓库失败: ${message}`))
        process.exit(1)
      }
    })
  )

/**
 * update 命令：脚手架更新指令
 */
program
  .command('update')
  .description(chalk.blueBright('脚手架更新指令'))
  .action(
    withVersionCheck(async () => {
      console.log(chalk.blueBright('🎉 脚手架已经是最新版本\n'))
    })
  )

/**
 * help 命令：脚手架帮助指令
 */
program
  .command('help')
  .description(chalk.bgRed('脚手架帮助指令'))
  .action(
    withVersionCheck(async () => {
      printHelp()
    })
  )

// 解析命令行参数
program.parse(process.argv)
