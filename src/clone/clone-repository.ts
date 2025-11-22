import chalk from 'chalk'
import execa from 'execa'
import { ProgressBar } from '@/utils/progress-bar'

/**
 * 下载计时器
 * 用于记录和显示 git clone 操作的耗时
 */
class DownloadTimer {
  private static startTime = 0

  /**
   * 开始计时
   * 记录当前时间戳作为开始时间
   * @returns {void}
   */
  static start(): void {
    this.startTime = Date.now()
  }

  /**
   * 结束计时并输出耗时
   * 计算从开始到结束的时间差，并以秒为单位输出
   * @returns {void}
   */
  static end(): void {
    const endTime = Date.now()
    const duration = ((endTime - this.startTime) / 1000).toFixed(2)
    console.log(chalk.greenBright(`下载耗时: ${duration} 秒`))
  }
}

/**
 * 判断是否需要使用代理加速
 * 对于非 GitLab 和 Gitee 的仓库，需要使用代理加速下载
 * @param {string} url - Git 仓库 URL 地址
 * @returns {boolean} 如果需要使用代理返回 true，否则返回 false
 */
function needsProxy(url: string): boolean {
  const lowerUrl = url.toLowerCase()
  return !lowerUrl.includes('gitlab') && !lowerUrl.includes('gitee')
}

/**
 * 构建 git clone 命令参数
 * 根据 URL 判断是否需要添加代理前缀，然后构建 git clone 命令的参数数组
 * @param {string} url - Git 仓库 URL 地址
 * @param {boolean} useProxy - 是否使用代理
 * @returns {string[]} git clone 命令的参数数组，格式为 ['clone', '--progress', 'url']
 */
function buildCloneArgs(url: string, useProxy: boolean = true): string[] {
  const targetUrl = needsProxy(url) && useProxy ? `https://ghproxy.com/${url}` : url
  return ['clone', '--progress', targetUrl]
}

/**
 * 判断错误是否与代理相关
 * @param {Error} error - 错误对象
 * @returns {boolean} 如果是代理相关错误返回 true
 */
function isProxyError(error: Error): boolean {
  const errorMessage = error.message.toLowerCase()
  return (
    errorMessage.includes('ghproxy') ||
    errorMessage.includes('ssl_error_syscall') ||
    errorMessage.includes('ssl_connect') ||
    errorMessage.includes('connection') ||
    errorMessage.includes('timeout')
  )
}

/**
 * 解析 git clone 输出中的进度信息
 * @param {string} line - git clone 输出的一行
 * @returns {number | null} 进度百分比（0-100），如果无法解析则返回 null
 */
function parseGitProgress(line: string): number | null {
  // 匹配 git clone 的进度输出，例如：
  // - "Receiving objects: 50% (1234/2468), 1.23 MiB | 1.23 MiB/s"
  // - "Resolving deltas: 100% (1234/1234)"
  const receivingMatch = line.match(/Receiving objects:\s*(\d+)%/i)
  if (receivingMatch) {
    return parseInt(receivingMatch[1], 10)
  }

  const resolvingMatch = line.match(/Resolving deltas:\s*(\d+)%/i)
  if (resolvingMatch) {
    // Resolving deltas 阶段，将进度映射到 50-100%
    const deltaProgress = parseInt(resolvingMatch[1], 10)
    return 50 + Math.floor(deltaProgress / 2)
  }

  const checkingMatch = line.match(/Checking out files:\s*(\d+)%/i)
  if (checkingMatch) {
    // Checking out 阶段，将进度映射到 90-100%
    const checkoutProgress = parseInt(checkingMatch[1], 10)
    return 90 + Math.floor(checkoutProgress / 10)
  }

  return null
}

/**
 * 执行 git clone 操作
 * @param {string} url - Git 仓库 URL 地址
 * @param {boolean} useProxy - 是否使用代理
 * @param {ProgressBar} progressBar - 进度条实例
 * @returns {Promise<void>}
 */
async function executeClone(
  url: string,
  useProxy: boolean,
  progressBar: ProgressBar
): Promise<void> {
  const cloneArgs = buildCloneArgs(url, useProxy)

  // 使用模拟进度条作为后备方案
  let progress = 0
  let useRealProgress = false
  const progressInterval = setInterval(() => {
    if (!useRealProgress && progress < 95) {
      progress += Math.random() * 3
      progress = Math.min(progress, 95)
      progressBar.render({ completed: progress, total: 100 })
    }
  }, 500)

  // 尝试监听 git clone 的输出流来获取真实进度
  const childProcess = execa('git', cloneArgs, {
    cwd: process.cwd(),
    stdio: ['inherit', 'pipe', 'pipe'],
  })

  // 监听 stderr（git clone 的进度信息通常输出到 stderr）
  const stderrHandler = (chunk: Buffer) => {
    const lines = chunk.toString().split('\n')
    for (const line of lines) {
      const parsedProgress = parseGitProgress(line)
      if (parsedProgress !== null) {
        useRealProgress = true
        progress = parsedProgress
        progressBar.render({ completed: progress, total: 100 })
      }
    }
  }

  if (childProcess.stderr) {
    childProcess.stderr.on('data', stderrHandler)
  }

  try {
    await childProcess
  } finally {
    // 清理资源
    clearInterval(progressInterval)
    if (childProcess.stderr) {
      childProcess.stderr.removeListener('data', stderrHandler)
    }
    // 确保流被关闭
    if (childProcess.stdout) {
      childProcess.stdout.destroy()
    }
    if (childProcess.stderr) {
      childProcess.stderr.destroy()
    }
  }

  progressBar.complete(100)
  progressBar.clear()
}

/**
 * 下载 Git 仓库
 * 使用 git clone 命令下载指定的仓库，对于 GitHub 等仓库会自动使用代理加速
 * 如果代理失败，会自动回退到直接连接
 * @param {string} url - Git 仓库 URL 地址
 * @returns {Promise<void>} 无返回值
 * @throws {Error} 当 URL 为空或下载失败时，会输出错误信息并退出进程
 * @link 加速方案 https://bbs.huaweicloud.com/blogs/294241
 */
export const cloneRepository = async (url: string): Promise<void> => {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    console.error(chalk.red('错误: 仓库 URL 不能为空'))
    process.exit(1)
  }

  const trimmedUrl = url.trim()
  const shouldUseProxy = needsProxy(trimmedUrl)
  const progressBar = new ProgressBar({
    description: chalk.cyan('正在克隆仓库'),
    barLength: 30,
  })

  DownloadTimer.start()

  try {
    // 首先尝试使用代理（如果需要）
    if (shouldUseProxy) {
      try {
        await executeClone(trimmedUrl, true, progressBar)
        DownloadTimer.end()
        return
      } catch (error) {
        // 如果是代理相关错误，尝试直接连接
        if (error instanceof Error && isProxyError(error)) {
          console.warn('\n' + chalk.yellow('⚠️  代理连接失败，正在尝试直接连接...\n'))
          progressBar.clear()
          // 重新创建进度条
          const retryProgressBar = new ProgressBar({
            description: chalk.cyan('正在克隆仓库（直接连接）'),
            barLength: 30,
          })
          await executeClone(trimmedUrl, false, retryProgressBar)
          DownloadTimer.end()
          return
        }
        // 如果不是代理错误，直接抛出
        throw error
      }
    } else {
      // 不需要代理，直接连接
      await executeClone(trimmedUrl, false, progressBar)
      DownloadTimer.end()
    }
  } catch (error) {
    progressBar.clear()
    DownloadTimer.end()
    console.error(chalk.red('\n===> 下载失败'))

    if (error instanceof Error) {
      console.error(chalk.red(`错误信息: ${error.message}`))
    } else {
      console.error(error)
    }

    process.exit(1)
  }
}
