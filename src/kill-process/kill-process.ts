import chalk from 'chalk'
import execa from 'execa'
import ora from 'ora'
import { platform } from 'os'
import { ProcessInfo } from './get-process-port'

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
  }
}

/**
 * 根据操作系统获取终止进程的命令
 * @param processId - 进程 ID
 * @returns 命令和参数数组
 */
function getKillCommand(processId: string): [string, string[]] {
  const os = platform()

  switch (os) {
    case 'darwin': // macOS
    case 'linux':
      return ['kill', [processId]]
    case 'win32':
      return ['taskkill', ['/F', '/PID', processId]]
    default:
      throw new KillProcessError(`不支持的操作系统: ${os}`, '', processId)
  }
}

/**
 * 终止指定端口上的进程
 * @param processes - 进程信息数组
 * @param port - 端口号
 * @throws {KillProcessError} 当终止进程失败时抛出错误
 */
export async function killProcess(processes: ProcessInfo[], port: string): Promise<void> {
  if (!processes.length) {
    console.log(chalk.yellow(`\n未检测到与端口 ${port} 相关的 Node.js 进程\n`))
    return
  }

  const spinner = ora(chalk.cyan('正在终止进程...')).start()

  try {
    for (const process of processes) {
      const { processName, processId } = process
      spinner.text = chalk.cyan(`正在终止进程 ${processName} (PID: ${processId})...`)

      const [command, args] = getKillCommand(processId)

      const result = await execa(command, args, {
        shell: true,
        reject: false, // 不因为命令失败而抛出错误
      })

      if (result.exitCode === 0) {
        spinner.succeed(chalk.green(`成功终止进程 ${processName} (PID: ${processId})`))
      } else {
        throw new KillProcessError(`终止进程失败: ${result.stderr || '未知错误'}`, port, processId)
      }
    }

    spinner.succeed(chalk.green(`\n端口 ${port} 上的所有进程已成功终止\n`))
  } catch (error) {
    spinner.fail(chalk.red('终止进程失败'))

    if (error instanceof KillProcessError) {
      throw error
    }

    throw new KillProcessError(
      '终止进程时发生错误',
      port,
      processes[0]?.processId || '',
      error instanceof Error ? error : new Error(String(error))
    )
  }
}
