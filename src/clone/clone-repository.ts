import chalk from 'chalk'
import execa from 'execa'

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
 * @returns {string[]} git clone 命令的参数数组，格式为 ['clone', 'url']
 */
function buildCloneArgs(url: string): string[] {
  const targetUrl = needsProxy(url) ? `https://ghproxy.com/${url}` : url
  return ['clone', targetUrl]
}

/**
 * 下载 Git 仓库
 * 使用 git clone 命令下载指定的仓库，对于 GitHub 等仓库会自动使用代理加速
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

  const cloneArgs = buildCloneArgs(url.trim())

  DownloadTimer.start()

  try {
    await execa('git', cloneArgs, {
      cwd: process.cwd(),
      stdio: 'inherit',
    })
    DownloadTimer.end()
  } catch (error) {
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
