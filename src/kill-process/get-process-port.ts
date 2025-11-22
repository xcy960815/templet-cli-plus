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
 * 为不同操作系统返回相应的命令和参数来查询端口占用情况
 * @param {string} port - 端口号
 * @param {Platform} os - 操作系统平台（darwin/linux/win32）
 * @returns {CommandOptions} 包含命令和参数的对象
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
 * 解析 netstat 命令的输出，提取指定端口上运行的进程信息
 * 输出格式: Proto  Local Address  Foreign Address  State  PID
 * @param {string} output - netstat 命令的原始输出
 * @param {string} port - 要查找的端口号
 * @returns {ProcessInfo[]} 进程信息数组，如果没有找到则返回空数组
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

    // 跳过标题行
    if (line.startsWith('Proto') || line.startsWith('协议')) {
      continue
    }

    // 匹配 TCP 连接行，格式: TCP  0.0.0.0:PORT  ...  LISTENING  PID
    // 支持多种格式：
    // 1. TCP    0.0.0.0:8080    0.0.0.0:0    LISTENING    1234
    // 2. TCP    [::]:8080       [::]:0       LISTENING    1234
    // 3. TCP    127.0.0.1:8080  0.0.0.0:0    ESTABLISHED  1234
    const tcpMatch = line.match(/^TCP\s+/i)
    if (!tcpMatch) continue

    // 提取本地地址和端口
    const localAddrMatch = line.match(/TCP\s+([\d.]+|\[[\d:]+\]):(\d+)/i)
    // 提取远程地址和端口（可选）
    const foreignAddrMatch = line.match(/\s+([\d.]+|\[[\d:]+\]|[\*]+):(\d+)/i)
    // 提取 PID（最后一个数字）
    const pidMatch = line.match(/(\d+)\s*$/)

    if (pidMatch) {
      const pid = pidMatch[1]
      let matchedPort: string | null = null

      // 检查本地端口
      if (localAddrMatch && localAddrMatch[2] === port) {
        matchedPort = localAddrMatch[2]
      }
      // 检查远程端口（如果本地端口不匹配）
      else if (foreignAddrMatch && foreignAddrMatch[2] === port) {
        matchedPort = foreignAddrMatch[2]
      }

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
 * 解析 lsof 命令的输出，提取进程信息
 * 输出格式: COMMAND  PID  USER  FD  TYPE  DEVICE  SIZE/OFF  NODE  NAME
 * @param {string} output - lsof 命令的原始输出
 * @returns {ProcessInfo[]} 进程信息数组，如果没有找到则返回空数组
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
 * 根据操作系统类型调用相应的解析函数
 * @param {string} output - 命令的原始输出
 * @param {Platform} os - 操作系统平台
 * @param {string} port - 端口号
 * @returns {ProcessInfo[]} 进程信息数组
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
 * 将进程信息格式化输出到控制台
 * @param {ProcessInfo[]} processes - 进程信息数组
 * @param {string} port - 端口号
 * @returns {void}
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
 * 获取 Windows 进程名称
 * 使用 tasklist 命令查询指定 PID 的进程名称
 * @param {string} pid - 进程 ID
 * @returns {Promise<string>} 进程名称，如果获取失败则返回 "PID-{pid}" 格式
 */
async function getWindowsProcessName(pid: string): Promise<string> {
  try {
    const { stdout } = await execa('tasklist', ['/FI', `PID eq ${pid}`, '/FO', 'CSV', '/NH'], {
      shell: true,
      reject: false,
    })

    if (stdout && stdout.trim()) {
      // CSV 格式: "进程名","PID","会话名","会话#","内存使用"
      const match = stdout.match(/^"([^"]+)"/)
      if (match && match[1]) {
        return match[1]
      }
    }
  } catch (error) {
    // 如果获取进程名称失败，返回默认值
  }

  return `PID-${pid}`
}

/**
 * 为 Windows 进程获取实际的进程名称
 * 遍历进程列表，为每个进程查询实际的进程名称并更新
 * @param {ProcessInfo[]} processes - 进程信息数组
 * @returns {Promise<ProcessInfo[]>} 更新后的进程信息数组，包含实际的进程名称
 */
async function enrichWindowsProcessNames(processes: ProcessInfo[]): Promise<ProcessInfo[]> {
  if (processes.length === 0) {
    return processes
  }

  const enrichedProcesses = await Promise.all(
    processes.map(async (process) => {
      if (process.processName.startsWith('PID-')) {
        const processName = await getWindowsProcessName(process.processId)
        return {
          ...process,
          processName,
          command: processName,
        }
      }
      return process
    })
  )

  return enrichedProcesses
}

/**
 * 获取指定端口上运行的进程信息
 * 根据当前操作系统执行相应的命令查询端口占用情况，并解析返回进程信息
 * @param {string} port - 端口号
 * @returns {Promise<ProcessInfo[]>} 进程信息数组，如果没有找到进程则返回空数组
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

    let processes = parseProcessInfo(stdout || '', currentOs, port)

    // 如果是 Windows 系统，尝试获取实际的进程名称
    if (currentOs === SUPPORTED_OS.WIN32) {
      processes = await enrichWindowsProcessNames(processes)
    }

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
