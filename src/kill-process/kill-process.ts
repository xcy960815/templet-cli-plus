import chalk from 'chalk'
import execa from 'execa'
import ora from 'ora'
import { platform } from 'os'
import { ProcessInfo } from '@/kill-process/get-process-port'

/**
 * 操作系统平台类型
 */
type Platform = ReturnType<typeof platform>

/**
 * 命令执行选项
 */
interface CommandOptions {
  command: string
  args: string[]
}

/**
 * 支持的操作系统类型
 */
const SUPPORTED_OS = {
  DARWIN: 'darwin',
  LINUX: 'linux',
  WIN32: 'win32',
} as const

/**
 * 自定义错误类，用于进程终止相关的错误
 */
class KillProcessError extends Error {
  constructor(
    message: string,
    public port: string,
    public processId: string,
    public originalError?: Error
  ) {
    super(message)
    this.name = 'KillProcessError'
    // 保持错误堆栈跟踪
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, KillProcessError)
    }
  }
}

/**
 * 根据操作系统获取终止进程的命令
 * 为不同操作系统返回相应的命令和参数来终止进程
 * @param {string} processId - 进程 ID
 * @param {Platform} os - 操作系统平台（darwin/linux/win32）
 * @returns {CommandOptions} 包含命令和参数的对象
 * @throws {KillProcessError} 当操作系统不支持时抛出错误
 */
function getKillCommand(processId: string, os: Platform): CommandOptions {
  switch (os) {
    case SUPPORTED_OS.DARWIN:
    case SUPPORTED_OS.LINUX:
      return {
        command: 'kill',
        args: [processId],
      }
    case SUPPORTED_OS.WIN32:
      return {
        command: 'taskkill',
        args: ['/F', '/PID', processId],
      }
    default:
      throw new KillProcessError(`不支持的操作系统: ${os}`, '', processId)
  }
}

/**
 * 执行终止进程的命令
 * 根据操作系统执行相应的 kill 命令来终止指定进程
 * @param {ProcessInfo} process - 进程信息对象
 * @param {Platform} os - 操作系统平台
 * @returns {Promise<void>} 无返回值
 * @throws {KillProcessError} 当终止进程失败时抛出错误
 */
async function executeKillCommand(process: ProcessInfo, os: Platform): Promise<void> {
  const { processName, processId } = process
  const { command, args } = getKillCommand(processId, os)

  const result = await execa(command, args, {
    shell: true,
    reject: false, // 不因为命令失败而抛出错误
  })

  if (result.exitCode !== 0) {
    const errorMessage = result.stderr || result.stdout || '未知错误'
    throw new KillProcessError(`终止进程失败: ${errorMessage.trim()}`, '', processId)
  }
}

/**
 * 终止单个进程并更新 spinner
 * 执行终止进程操作，并在过程中更新加载提示信息
 * @param {ProcessInfo} process - 进程信息对象
 * @param {ora.Ora} spinner - ora spinner 实例，用于显示加载状态
 * @param {Platform} os - 操作系统平台
 * @returns {Promise<void>} 无返回值
 * @throws {KillProcessError} 当终止进程失败时抛出错误
 */
async function killSingleProcess(
  process: ProcessInfo,
  spinner: ora.Ora,
  os: Platform
): Promise<void> {
  const { processName, processId } = process
  spinner.text = chalk.cyan(`正在终止进程 ${processName} (PID: ${processId})...`)

  try {
    await executeKillCommand(process, os)
    spinner.succeed(chalk.green(`成功终止进程 ${processName} (PID: ${processId})`))
  } catch (error) {
    spinner.fail(chalk.red(`终止进程 ${processName} (PID: ${processId}) 失败`))
    throw error
  }
}

/**
 * 终止指定端口上的进程
 * 遍历进程列表，逐个终止每个进程，并显示进度提示
 * @param {ProcessInfo[]} processes - 进程信息数组
 * @param {string} port - 端口号
 * @returns {Promise<void>} 无返回值
 * @throws {KillProcessError} 当终止进程失败时抛出错误
 */
export async function killProcess(processes: ProcessInfo[], port: string): Promise<void> {
  if (!processes.length) {
    console.log(chalk.yellow(`\n未检测到与端口 ${port} 相关的进程\n`))
    return
  }

  const currentOs = platform()
  const spinner = ora(chalk.cyan('正在终止进程...')).start()

  try {
    // 逐个终止进程
    for (const process of processes) {
      await killSingleProcess(process, spinner, currentOs)
      // 如果还有更多进程要终止，重新启动 spinner
      if (processes.indexOf(process) < processes.length - 1) {
        spinner.start()
      }
    }

    spinner.succeed(chalk.green(`\n端口 ${port} 上的所有进程已成功终止\n`))
  } catch (error) {
    spinner.fail(chalk.red('终止进程失败'))

    if (error instanceof KillProcessError) {
      // 添加端口信息到错误对象
      error.port = port
      throw error
    }

    throw new KillProcessError(
      `终止进程时发生错误: ${error instanceof Error ? error.message : String(error)}`,
      port,
      processes[0]?.processId || '',
      error instanceof Error ? error : new Error(String(error))
    )
  }
}
