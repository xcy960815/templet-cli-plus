import chalk from 'chalk'
import { table } from 'table'
import wordWrap from 'word-wrap'
import slog from 'single-line-log'

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
 * 中文字符的 Unicode 范围
 */
const CHINESE_CHAR_RANGE = /[\u4e00-\u9fa5]/

/**
 * 表格选项接口
 */
interface TableOptions {
  footerMessage?: string
}

/**
 * 去除 ANSI 转义码（颜色代码等）
 * 用于在计算文本宽度时排除不可见的控制字符
 * @param {string} text - 包含 ANSI 转义码的文本
 * @returns {string} 去除 ANSI 转义码后的纯文本
 */
function stripAnsiCodes(text: string): string {
  // ANSI 转义码的正则表达式：\u001b[ 或 \x1b[ 开头，直到遇到字母（m 或其他）
  return text.replace(/\u001b\[[0-9;]*[a-zA-Z]/g, '')
}

/**
 * 计算文本的显示宽度（考虑中文字符占双倍宽度）
 * 在终端中，中文字符通常占 2 个字符宽度，英文字符占 1 个字符宽度
 * 自动去除 ANSI 转义码以确保宽度计算准确
 * @param {string} text - 要计算的文本（可能包含 ANSI 转义码）
 * @param {number} [fontSize=1] - 字体大小，默认为 1
 * @returns {number} 文本的显示宽度（字符数）
 */
function getTextWidth(text: string, fontSize: number = DEFAULT_FONT_SIZE): number {
  // 去除 ANSI 转义码后再计算宽度
  const cleanText = stripAnsiCodes(text)
  let width = 0

  // 遍历每个字符（不是字节）
  for (const char of cleanText) {
    // 中文字符占 2 个字符宽度，其他字符占 1 个字符宽度
    if (CHINESE_CHAR_RANGE.test(char)) {
      width += 2
    } else {
      width += 1
    }
  }

  return width * fontSize
}

/**
 * 计算字符串数组中的最大文本宽度
 * 遍历数组中的所有文本，返回显示宽度最大的值
 * @param {string[]} texts - 文本数组
 * @returns {number} 最大显示宽度，如果数组为空返回 0
 */
function getMaxTextWidth(texts: string[]): number {
  if (texts.length === 0) {
    return 0
  }

  return Math.max(...texts.map((text) => getTextWidth(text)))
}

/**
 * 随机选择一个 chalk 颜色方法
 * 从预定义的颜色列表中随机选择一种颜色函数
 * @returns {(text: string) => string} chalk 颜色方法，接受文本并返回着色后的文本
 */
function getRandomColor(): (text: string) => string {
  const colorName = CHALK_COLORS[Math.floor(Math.random() * CHALK_COLORS.length)]
  return chalk[colorName as keyof typeof chalk] as (text: string) => string
}

/**
 * 包装文本并应用颜色
 * 将文本按指定宽度换行，并对每一行应用颜色
 * @param {string} text - 要包装的文本
 * @param {number} width - 最大宽度（字符数）
 * @param {(text: string) => string} colorizer - 颜色函数，用于为文本着色
 * @returns {string} 包装并着色后的文本，多行文本用换行符分隔
 */
function wrapAndColorize(text: string, width: number, colorizer: (text: string) => string): string {
  return wordWrap(text, { width, cut: true })
    .split('\n')
    .map((line) => colorizer(line))
    .join('\n')
}

/**
 * 计算表格列宽
 * 根据终端宽度和内容宽度，按比例分配两列的宽度
 * 确保列宽至少能容纳表头的完整宽度
 * @param {number} terminalWidth - 终端宽度（字符数）
 * @param {number} nameMaxWidth - 名称列的最大内容宽度
 * @param {number} valueMaxWidth - 值列的最大内容宽度
 * @param {number} nameHeaderWidth - 名称列表头的宽度
 * @param {number} valueHeaderWidth - 值列表头的宽度
 * @returns {[number, number]} 包含名称列和值列宽度的元组 [nameWidth, valueWidth]
 */
function calculateColumnWidths(
  terminalWidth: number,
  nameMaxWidth: number,
  valueMaxWidth: number,
  nameHeaderWidth: number,
  valueHeaderWidth: number
): [number, number] {
  const totalMaxWidth = nameMaxWidth + valueMaxWidth
  const availableWidth = Math.max(terminalWidth - TERMINAL_MARGIN, 20) // 确保最小可用宽度

  // 计算最小列宽（表头宽度 + padding）
  const minNameWidth = nameHeaderWidth + 2
  const minValueWidth = valueHeaderWidth + 2
  const totalMinWidth = minNameWidth + minValueWidth

  if (totalMaxWidth === 0) {
    // 如果两个列都没有内容，平均分配，但至少能容纳表头
    if (totalMinWidth > availableWidth) {
      // 如果最小宽度之和超过可用宽度，按比例分配
      const nameRatio = minNameWidth / totalMinWidth
      return [
        Math.max(Math.floor(availableWidth * nameRatio), 5),
        Math.max(Math.floor(availableWidth * (1 - nameRatio)), 5),
      ]
    }
    const halfWidth = Math.floor(availableWidth / 2)
    return [Math.max(halfWidth + 1, minNameWidth), Math.max(halfWidth, minValueWidth)]
  }

  const nameRatio = nameMaxWidth / totalMaxWidth
  let nameWidth = Math.floor(availableWidth * nameRatio)
  let valueWidth = Math.floor(availableWidth * (1 - nameRatio))

  // 确保列宽至少能容纳表头的完整宽度，并添加一些边距
  nameWidth = Math.max(nameWidth + 1, minNameWidth)
  valueWidth = Math.max(valueWidth, minValueWidth)

  // 如果总宽度超过了可用宽度，按比例缩小
  const totalWidth = nameWidth + valueWidth
  if (totalWidth > availableWidth) {
    if (totalMinWidth > availableWidth) {
      // 如果最小宽度之和超过可用宽度，按最小宽度比例分配
      const minRatio = minNameWidth / totalMinWidth
      nameWidth = Math.max(Math.floor(availableWidth * minRatio), 5)
      valueWidth = Math.max(Math.floor(availableWidth * (1 - minRatio)), 5)
    } else {
      // 否则按当前宽度比例缩小，但保持最小宽度
      const scale = availableWidth / totalWidth
      nameWidth = Math.max(Math.floor(nameWidth * scale), minNameWidth)
      valueWidth = Math.max(Math.floor(valueWidth * scale), minValueWidth)
    }
  }

  return [nameWidth, valueWidth]
}

/**
 * 打印表格
 * 创建并显示一个格式化的表格
 * @param {Record<string, string>} tableBody - 表格数据（键值对对象）
 * @param {string[]} tableHeader - 表格头部数组，通常包含列名
 * @param {TableOptions} [options] - 可选配置，如页脚消息
 */
export async function printAsTable(
  tableBody: Record<string, string>,
  tableHeader: string[],
  options?: TableOptions
): Promise<void> {
  let lastTableString = ''

  // 为每一行固定颜色（在闭包中保存，确保重新渲染时颜色不变）
  const rowColorizers = new Map<string, (text: string) => string>()
  for (const key of Object.keys(tableBody)) {
    if (!rowColorizers.has(key)) {
      rowColorizers.set(key, getRandomColor())
    }
  }

  const renderTable = (): void => {
    const terminalWidth = process.stdout.columns || 80
    const templateNames = Object.keys(tableBody)
    const templateValues = Object.values(tableBody)

    // 计算各列的最大文本宽度（包括表头）
    const nameHeaderWidth = getTextWidth(tableHeader[0])
    const valueHeaderWidth = getTextWidth(tableHeader[1])
    const nameMaxWidth = Math.max(getMaxTextWidth(templateNames), nameHeaderWidth)
    const valueMaxWidth = Math.max(getMaxTextWidth(templateValues), valueHeaderWidth)

    // 计算列宽
    const [nameWidth, valueWidth] = calculateColumnWidths(
      terminalWidth,
      nameMaxWidth,
      valueMaxWidth,
      nameHeaderWidth,
      valueHeaderWidth
    )

    // 构建表格数据（二维数组）
    const tableData: string[][] = [tableHeader]

    // 填充表格数据，使用固定的颜色
    for (const [key, value] of Object.entries(tableBody)) {
      const colorizer = rowColorizers.get(key) || getRandomColor()
      tableData.push([colorizer(key), colorizer(value)])
    }

    // 配置表格选项
    // 注意：table 库会自动处理 ANSI 转义码，因为它依赖了 string-width
    // table 库的 width 包含 padding（默认左右各 1），所以实际可用宽度是 width - 2
    // 确保列宽至少能容纳表头：width >= headerWidth + 2（padding）
    // 这样即使启用 wrapWord，表头也不会换行（因为宽度足够）
    // 而表格内容可以在列宽变化时正确换行
    const nameWidthFinal = Math.max(nameWidth, nameHeaderWidth + 2)
    const valueWidthFinal = Math.max(valueWidth, valueHeaderWidth + 2)

    // 始终启用 wrapWord，让表格内容可以在终端宽度变化时正确换行
    // 由于列宽已经确保能容纳表头，表头不会换行
    const tableConfig = {
      columns: {
        0: {
          width: nameWidthFinal,
          wrapWord: true, // 启用换行，确保终端宽度变化时内容正确显示
          paddingLeft: 1,
          paddingRight: 1,
        },
        1: {
          width: valueWidthFinal,
          wrapWord: true, // 启用换行，确保终端宽度变化时内容正确显示
          paddingLeft: 1,
          paddingRight: 1,
        },
      },
    }

    // 生成表格字符串
    const tableString = table(tableData, tableConfig)
    const finalString = options?.footerMessage
      ? `${tableString}\n${options.footerMessage}`
      : tableString

    // 只在内容变化时更新输出
    if (finalString !== lastTableString) {
      lastTableString = finalString
      slog.stdout(finalString)
    }
  }

  // 渲染表格
  renderTable()
}
