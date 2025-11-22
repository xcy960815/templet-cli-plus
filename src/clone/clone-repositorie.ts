import chalk from 'chalk'
import execa from 'execa'

/**
 * 下载计时器
 */
class DownloadTimer {
  private static startTime = 0

  static start(): void {
    this.startTime = Date.now()
  }

  static end(): void {
    const endTime = Date.now()
    const duration = ((endTime - this.startTime) / 1000).toFixed(2)
    console.log(chalk.greenBright(`下载耗时: ${duration} 秒`))
  }
}

/**
 * 判断是否需要使用代理加速
 * @param url Git 仓库 URL
 * @returns 是否需要使用代理
 */
function needsProxy(url: string): boolean {
  const lowerUrl = url.toLowerCase()
  return !lowerUrl.includes('gitlab') && !lowerUrl.includes('gitee')
}

/**
 * 构建 git clone 命令参数
 * @param url Git 仓库 URL
 * @returns git clone 命令参数数组
 */
function buildCloneArgs(url: string): string[] {
  const targetUrl = needsProxy(url) ? `https://ghproxy.com/${url}` : url
  return ['clone', targetUrl]
}

/**
 * 下载仓库
 * @param url Git 仓库 URL
 * @link 加速方案 https://bbs.huaweicloud.com/blogs/294241
 */
export const cloneRepositorie = async (url: string): Promise<void> => {
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
