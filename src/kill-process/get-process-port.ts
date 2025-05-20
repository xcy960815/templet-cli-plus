import execa from 'execa'
import { platform } from 'os'
import chalk from 'chalk'

/**
 * 进程信息接口
 */
export interface ProcessInfo {
  processName: string
  processId: string
  user?: string
  command?: string
}

/**
 * 自定义错误类，用于进程操作相关的错误
 */
class ProcessError extends Error {
  constructor(
    message: string,
    public port: string,
    public originalError?: Error
  ) {
    super(message)
    this.name = 'ProcessError'
  }
}

/**
 * 根据操作系统获取进程信息的命令
 * @param port - 端口号
 * @returns 命令和参数数组
 */
function getProcessCommand(port: string): [string, string[]] {
  const os = platform()

  switch (os) {
    case 'darwin': // macOS
    case 'linux':
      return ['lsof', ['-i', `:${port}`]]
    case 'win32':
      return ['netstat', ['-ano', '-p', 'TCP', '-n']]
    default:
      throw new ProcessError(`不支持的操作系统: ${os}`, port)
  }
}

/**
 * 解析进程信息
 * @param output - 命令输出
 * @param os - 操作系统
 * @param port - 端口号
 * @returns 进程信息数组
 */
function parseProcessInfo(output: string, os: string, port: string): ProcessInfo[] {
  if (!output.trim()) {
    return []
  }

  const lines = output.trim().split('\n')
  const processes: ProcessInfo[] = []

  if (os === 'win32') {
    // Windows 输出格式: Proto  Local Address  Foreign Address  State  PID
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].trim().split(/\s+/)
      if (parts.length >= 5 && parts[1].endsWith(`:${port}`)) {
        processes.push({
          processName: 'node.exe',
          processId: parts[4],
          command: 'node',
        })
      }
    }
  } else {
    // Unix-like 系统输出格式: COMMAND  PID  USER  FD  TYPE  DEVICE  SIZE/OFF  NODE  NAME
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].trim().split(/\s+/)
      if (parts.length >= 2 && parts[0].includes('node')) {
        processes.push({
          processName: parts[0],
          processId: parts[1],
          user: parts[2],
          command: parts[0],
        })
      }
    }
  }

  return processes
}

/**
 * 获取指定端口上运行的进程信息
 * @param port - 端口号
 * @returns Promise<ProcessInfo[]> 进程信息数组
 * @throws {ProcessError} 当获取进程信息失败时抛出错误
 */
export async function getProcessByPort(port: string): Promise<ProcessInfo[]> {
  try {
    const os = platform()
    const [command, args] = getProcessCommand(port)

    const { stdout } = await execa(command, args, {
      shell: true,
      reject: false, // 不因为命令失败而抛出错误
    })

    const processes = parseProcessInfo(stdout, os, port)

    if (processes.length === 0) {
      console.log(chalk.yellow(`\n端口 ${port} 上没有找到 Node.js 进程\n`))
    } else {
      console.log(chalk.cyan(`\n在端口 ${port} 上找到以下 Node.js 进程：\n`))
      processes.forEach((proc) => {
        console.log(chalk.blue(`进程名称: ${proc.processName}`))
        console.log(chalk.blue(`进程 ID: ${proc.processId}`))
        if (proc.user) console.log(chalk.blue(`用户: ${proc.user}`))
        console.log('---')
      })
    }

    return processes
  } catch (error) {
    throw new ProcessError(
      '获取进程信息失败',
      port,
      error instanceof Error ? error : new Error(String(error))
    )
  }
}
