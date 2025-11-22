import execa from 'execa'
import { platform } from 'os'
import chalk from 'chalk'

/**
 * 操作系统平台类型
 */
type Platform = ReturnType<typeof platform>

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
 * 命令执行选项
 */
interface CommandOptions {
  command: string
  args: string[]
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
    // 保持错误堆栈跟踪
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ProcessError)
    }
  }
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
 * 根据操作系统获取进程信息的命令
 * @param port - 端口号
 * @param os - 操作系统平台
 * @returns 命令和参数
 * @throws {ProcessError} 当操作系统不支持时抛出错误
 */
function getProcessCommand(port: string, os: Platform): CommandOptions {
  switch (os) {
    case SUPPORTED_OS.DARWIN:
    case SUPPORTED_OS.LINUX:
      return {
        command: 'lsof',
        args: ['-i', `:${port}`, '-P', '-n'],
      }
    case SUPPORTED_OS.WIN32:
      return {
        command: 'netstat',
        args: ['-ano', '-p', 'TCP'],
      }
    default:
      throw new ProcessError(`不支持的操作系统: ${os}`, port)
  }
}

/**
 * 解析 Windows netstat 输出
 * 输出格式: Proto  Local Address  Foreign Address  State  PID
 * @param output - 命令输出
 * @param port - 端口号
 * @returns 进程信息数组
 */
function parseWindowsOutput(output: string, port: string): ProcessInfo[] {
  if (!output.trim()) {
    return []
  }

  const lines = output.trim().split('\n')
  const processMap = new Map<string, ProcessInfo>()

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    // 匹配 TCP 连接行，格式: TCP  0.0.0.0:PORT  ...  LISTENING  PID
    const match = line.match(/TCP\s+[\d.]+:(\d+)\s+.*?\s+(\d+)$/)
    if (match) {
      const [, matchedPort, pid] = match
      if (matchedPort === port && pid) {
        // 避免重复添加相同的 PID
        if (!processMap.has(pid)) {
          processMap.set(pid, {
            processName: `PID-${pid}`,
            processId: pid,
            command: 'unknown',
          })
        }
      }
    }
  }

  return Array.from(processMap.values())
}

/**
 * 解析 Unix-like 系统 lsof 输出
 * 输出格式: COMMAND  PID  USER  FD  TYPE  DEVICE  SIZE/OFF  NODE  NAME
 * @param output - 命令输出
 * @returns 进程信息数组
 */
function parseUnixOutput(output: string): ProcessInfo[] {
  if (!output.trim()) {
    return []
  }

  const lines = output.trim().split('\n')
  const processMap = new Map<string, ProcessInfo>()

  // 跳过标题行
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    // 使用正则表达式匹配，处理可能的多个空格
    const parts = line.split(/\s+/)
    if (parts.length >= 2) {
      const command = parts[0]
      const pid = parts[1]
      const user = parts.length >= 3 ? parts[2] : undefined

      // 避免重复添加相同的 PID
      if (pid && !processMap.has(pid)) {
        processMap.set(pid, {
          processName: command,
          processId: pid,
          user,
          command,
        })
      }
    }
  }

  return Array.from(processMap.values())
}

/**
 * 解析进程信息
 * @param output - 命令输出
 * @param os - 操作系统
 * @param port - 端口号
 * @returns 进程信息数组
 */
function parseProcessInfo(output: string, os: Platform, port: string): ProcessInfo[] {
  if (os === SUPPORTED_OS.WIN32) {
    return parseWindowsOutput(output, port)
  } else {
    return parseUnixOutput(output)
  }
}

/**
 * 打印进程信息
 * @param processes - 进程信息数组
 * @param port - 端口号
 */
function printProcessInfo(processes: ProcessInfo[], port: string): void {
  if (processes.length === 0) {
    console.log(chalk.yellow(`\n端口 ${port} 上没有找到进程\n`))
    return
  }

  console.log(chalk.cyan(`\n在端口 ${port} 上找到以下进程：\n`))
  processes.forEach((proc, index) => {
    console.log(chalk.blue(`进程 ${index + 1}:`))
    console.log(chalk.blue(`  进程名称: ${proc.processName}`))
    console.log(chalk.blue(`  进程 ID: ${proc.processId}`))
    if (proc.user) {
      console.log(chalk.blue(`  用户: ${proc.user}`))
    }
    if (proc.command) {
      console.log(chalk.blue(`  命令: ${proc.command}`))
    }
    if (index < processes.length - 1) {
      console.log('---')
    }
  })
  console.log('')
}

/**
 * 获取指定端口上运行的进程信息
 * @param port - 端口号
 * @returns Promise<ProcessInfo[]> 进程信息数组
 * @throws {ProcessError} 当获取进程信息失败时抛出错误
 */
export async function getProcessByPort(port: string): Promise<ProcessInfo[]> {
  const currentOs = platform()

  try {
    const { command, args } = getProcessCommand(port, currentOs)

    const { stdout, stderr, exitCode } = await execa(command, args, {
      shell: true,
      reject: false,
    })

    // 检查命令执行是否成功
    if (exitCode !== 0 && stderr) {
      // 在某些系统上，如果没有找到进程，lsof 会返回非零退出码
      // 这是正常情况，不应该抛出错误
      if (!stderr.includes('No such file') && !stderr.includes('not found')) {
        throw new ProcessError(
          `执行命令失败: ${command} ${args.join(' ')}\n错误信息: ${stderr}`,
          port
        )
      }
    }

    const processes = parseProcessInfo(stdout || '', currentOs, port)
    printProcessInfo(processes, port)

    return processes
  } catch (error) {
    if (error instanceof ProcessError) {
      throw error
    }

    throw new ProcessError(
      `获取进程信息失败: ${error instanceof Error ? error.message : String(error)}`,
      port,
      error instanceof Error ? error : new Error(String(error))
    )
  }
}
