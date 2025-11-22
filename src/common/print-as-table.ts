import chalk from 'chalk'
import Table from 'cli-table3'
import wordWrap from 'word-wrap'
import { TextEncoder } from 'util'
import slog from 'single-line-log'

/**
 * 文本编码器，用于计算文本宽度
 */
const encoder = new TextEncoder()

/**
 * 可用的 chalk 颜色方法列表
 */
const CHALK_COLORS = [
  'black',
  'red',
  'green',
  'yellow',
  'blue',
  'magenta',
  'cyan',
  'white',
  'gray',
  'grey',
  'blackBright',
  'redBright',
  'greenBright',
  'yellowBright',
  'blueBright',
  'magentaBright',
  'cyanBright',
  'whiteBright',
] as const

/**
 * 默认字体大小
 */
const DEFAULT_FONT_SIZE = 1

/**
 * 终端边距（用于计算列宽）
 */
const TERMINAL_MARGIN = 10

/**
 * UTF-8 单字节字符的最大值
 */
const UTF8_SINGLE_BYTE_MAX = 0x7f

/**
 * UTF-8 多字节字符的起始值
 */
const UTF8_MULTI_BYTE_START = 0xc0

/**
 * 中文字符宽度（相对于英文字符）
 */
const CHINESE_CHAR_WIDTH = 0.5

/**
 * 表格选项接口
 */
interface TableOptions {
  footerMessage?: string
}

/**
 * 计算文本的显示宽度（考虑中文字符占双倍宽度）
 * @param text 要计算的文本
 * @param fontSize 字体大小，默认为 1
 * @returns 文本的显示宽度
 */
function getTextWidth(text: string, fontSize: number = DEFAULT_FONT_SIZE): number {
  const buffer = encoder.encode(text)
  let width = 0

  for (const byte of buffer) {
    // 单字节字符（ASCII）或多字节字符的起始字节
    if (byte <= UTF8_SINGLE_BYTE_MAX || byte >= UTF8_MULTI_BYTE_START) {
      width += 1
    } else {
      // 多字节字符的后续字节（如中文）
      width += CHINESE_CHAR_WIDTH
    }
  }

  return width * fontSize
}

/**
 * 计算字符串数组中的最大文本宽度
 * @param texts 文本数组
 * @returns 最大宽度
 */
function getMaxTextWidth(texts: string[]): number {
  if (texts.length === 0) {
    return 0
  }

  return Math.max(...texts.map((text) => getTextWidth(text)))
}

/**
 * 随机选择一个 chalk 颜色方法
 * @returns chalk 颜色方法
 */
function getRandomColor(): (text: string) => string {
  const colorName = CHALK_COLORS[Math.floor(Math.random() * CHALK_COLORS.length)]
  return chalk[colorName as keyof typeof chalk] as (text: string) => string
}

/**
 * 包装文本并应用颜色
 * @param text 要包装的文本
 * @param width 最大宽度
 * @param colorizer 颜色函数
 * @returns 包装并着色后的文本
 */
function wrapAndColorize(text: string, width: number, colorizer: (text: string) => string): string {
  return wordWrap(text, { width, cut: true })
    .split('\n')
    .map((line) => colorizer(line))
    .join('\n')
}

/**
 * 计算表格列宽
 * @param terminalWidth 终端宽度
 * @param nameMaxWidth 名称列的最大宽度
 * @param valueMaxWidth 值列的最大宽度
 * @returns 包含名称列和值列宽度的元组
 */
function calculateColumnWidths(
  terminalWidth: number,
  nameMaxWidth: number,
  valueMaxWidth: number
): [number, number] {
  const totalMaxWidth = nameMaxWidth + valueMaxWidth
  const availableWidth = terminalWidth - TERMINAL_MARGIN

  if (totalMaxWidth === 0) {
    // 如果两个列都没有内容，平均分配
    const halfWidth = Math.floor(availableWidth / 2)
    return [halfWidth + 1, halfWidth]
  }

  const nameRatio = nameMaxWidth / totalMaxWidth
  const nameWidth = Math.floor(availableWidth * nameRatio)
  const valueWidth = Math.floor(availableWidth * (1 - nameRatio))

  return [nameWidth + 1, valueWidth]
}

/**
 * 打印表格并支持终端大小变化时自动重新渲染
 * @param tableBody 表格数据（键值对）
 * @param tableHeader 表格头部
 * @param options 可选配置
 * @returns 返回一个清理函数，用于移除事件监听器
 */
export async function printAsTable(
  tableBody: Record<string, string>,
  tableHeader: string[],
  options?: TableOptions
): Promise<() => void> {
  let lastTableString = ''

  const renderTable = (): void => {
    const terminalWidth = process.stdout.columns || 80
    const templateNames = Object.keys(tableBody)
    const templateValues = Object.values(tableBody)

    // 计算各列的最大文本宽度
    const nameMaxWidth = getMaxTextWidth(templateNames)
    const valueMaxWidth = getMaxTextWidth(templateValues)

    // 计算列宽
    const [nameWidth, valueWidth] = calculateColumnWidths(
      terminalWidth,
      nameMaxWidth,
      valueMaxWidth
    )

    // 创建表格实例
    const table = new Table({
      head: tableHeader,
      colWidths: [nameWidth, valueWidth],
    })

    // 填充表格数据
    for (const [key, value] of Object.entries(tableBody)) {
      const colorizer = getRandomColor()
      const coloredName = wrapAndColorize(key, nameWidth, colorizer)
      const coloredValue = wrapAndColorize(value, valueWidth, colorizer)
      table.push([coloredName, coloredValue])
    }

    // 生成最终字符串
    const tableString = table.toString()
    const finalString = options?.footerMessage
      ? `${tableString}\n${options.footerMessage}`
      : tableString

    // 只在内容变化时更新输出
    if (finalString !== lastTableString) {
      lastTableString = finalString
      slog.stdout(finalString)
    }
  }

  // 初始渲染
  renderTable()

  // 监听终端大小变化
  process.stdout.on('resize', renderTable)

  // 返回清理函数
  return () => {
    process.stdout.removeListener('resize', renderTable)
  }
}
