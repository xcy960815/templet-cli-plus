import slog from 'single-line-log'
import chalk from 'chalk'

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
   * @param {ProgressBarOptions} [options] - 配置选项
   * @param {string} [options.description='Progress'] - 进度条描述文本
   * @param {number} [options.barLength=25] - 进度条长度（字符数），必须大于 0
   * @param {string} [options.filledChar='█'] - 填充字符，表示已完成部分
   * @param {string} [options.emptyChar='░'] - 空字符，表示未完成部分
   * @throws {Error} 当 barLength 小于 1 或 description 为空时抛出错误
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
   * 根据已完成数量和总数量计算进度百分比，确保返回值在 0-1 之间
   * @param {number} completed - 已完成数量
   * @param {number} total - 总数量
   * @returns {number} 进度百分比（0-1 之间的浮点数）
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
   * 根据百分比获取对应的背景色
   * @param {number} percent - 进度百分比（0-1 之间的浮点数）
   * @returns {string} 带背景色的字符串
   */
  private getBackgroundColor(percent: number): (text: string) => string {
    const percentValue = percent * 100

    if (percentValue < 30) {
      // 0-30%: 红色背景
      return chalk.bgRed
    } else if (percentValue < 60) {
      // 30-60%: 黄色背景
      return chalk.bgYellow
    } else if (percentValue < 90) {
      // 60-90%: 蓝色背景
      return chalk.bgBlue
    } else {
      // 90-100%: 绿色背景
      return chalk.bgGreen
    }
  }

  /**
   * 渲染进度条
   * 根据已完成数量和总数量计算并显示进度条，包括百分比和进度条可视化
   * @param {RenderOptions} options - 渲染参数
   * @param {number} options.completed - 已完成数量，必须是有效的数字
   * @param {number} options.total - 总数量，必须是有效的数字且不能为负数
   * @returns {void} 无返回值，直接输出到终端
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
    const filledCells = this.filledChar.repeat(cellNum)
    const empty = this.emptyChar.repeat(this.length - cellNum)

    // 根据百分比获取背景色并应用到填充部分
    const getBgColor = this.getBackgroundColor(percent)
    const coloredCell = filledCells ? getBgColor(filledCells) : filledCells

    // 构建输出文本
    const cmdText = `${this.description}: ${percentText}% ${coloredCell}${empty} ${Math.floor(completed)}/${Math.floor(total)}`

    slog.stdout(cmdText)
  }

  /**
   * 完成进度条（显示 100%）
   * 将进度条设置为完成状态，显示 100% 进度
   * @param {number} total - 总数量
   * @returns {void} 无返回值
   */
  complete(total: number): void {
    this.render({ completed: total, total })
  }

  /**
   * 清除进度条
   * 清空当前行的输出，用于隐藏进度条
   * @returns {void} 无返回值
   */
  clear(): void {
    slog.stdout('')
  }
}

export { ProgressBar }
export type { ProgressBarOptions, RenderOptions }
