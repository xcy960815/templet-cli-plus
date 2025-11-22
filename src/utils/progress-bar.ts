import slog from 'single-line-log'

/**
 * 进度条配置选项
 */
interface ProgressBarOptions {
  /** 进度条描述文本 */
  description?: string
  /** 进度条长度（字符数） */
  barLength?: number
  /** 填充字符 */
  filledChar?: string
  /** 空字符 */
  emptyChar?: string
}

/**
 * 渲染参数
 */
interface RenderOptions {
  /** 已完成的数量 */
  completed: number
  /** 总数量 */
  total: number
}

/**
 * 进度条类，用于在终端显示进度
 */
class ProgressBar {
  private readonly description: string
  private readonly length: number
  private readonly filledChar: string
  private readonly emptyChar: string

  /**
   * 创建进度条实例
   * @param options - 配置选项
   */
  constructor({
    description = 'Progress',
    barLength = 25,
    filledChar = '█',
    emptyChar = '░',
  }: ProgressBarOptions = {}) {
    // 验证并设置参数
    if (barLength < 1) {
      throw new Error('进度条长度必须大于 0')
    }
    if (description.trim().length === 0) {
      throw new Error('描述文本不能为空')
    }

    this.description = description.trim()
    this.length = Math.floor(barLength)
    this.filledChar = filledChar
    this.emptyChar = emptyChar
  }

  /**
   * 计算进度百分比
   * @param completed - 已完成数量
   * @param total - 总数量
   * @returns 进度百分比（0-1）
   */
  private calculatePercent(completed: number, total: number): number {
    if (total <= 0) {
      return 0
    }
    if (completed < 0) {
      return 0
    }
    if (completed >= total) {
      return 1
    }
    return completed / total
  }

  /**
   * 渲染进度条
   * @param options - 渲染参数
   * @throws {Error} 当参数无效时抛出错误
   */
  render({ completed, total }: RenderOptions): void {
    // 参数验证
    if (typeof completed !== 'number' || !Number.isFinite(completed)) {
      throw new Error('completed 必须是有效的数字')
    }
    if (typeof total !== 'number' || !Number.isFinite(total)) {
      throw new Error('total 必须是有效的数字')
    }
    if (total < 0) {
      throw new Error('total 不能为负数')
    }

    const percent = this.calculatePercent(completed, total)
    const cellNum = Math.floor(percent * this.length)
    const percentText = (100 * percent).toFixed(2)

    // 构建进度条
    const cell = this.filledChar.repeat(cellNum)
    const empty = this.emptyChar.repeat(this.length - cellNum)

    // 构建输出文本
    const cmdText = `${this.description}: ${percentText}% ${cell}${empty} ${Math.floor(completed)}/${Math.floor(total)}`

    slog.stdout(cmdText)
  }

  /**
   * 完成进度条（显示 100%）
   * @param total - 总数量
   */
  complete(total: number): void {
    this.render({ completed: total, total })
  }

  /**
   * 清除进度条
   */
  clear(): void {
    slog.stdout('')
  }
}

export { ProgressBar }
export type { ProgressBarOptions, RenderOptions }
