import { userInfo } from 'os'
import chalk from 'chalk'

/**
 * 问题配置接口
 */
interface QuestionConfig {
  type: 'input'
  name: 'author'
  default: string
  message: string
  validate?: (input: string) => boolean | string
}

/**
 * 常量定义
 */
const DEFAULT_AUTHOR = 'anonymous'
const MAX_AUTHOR_LENGTH = 50
const AUTHOR_PATTERN = /^[\u4e00-\u9fa5a-zA-Z0-9_\s-]+$/

/**
 * 获取系统用户信息
 * @returns 用户名，如果获取失败则返回默认值
 */
function getSystemUsername(): string {
  try {
    const { username } = userInfo()
    return username || DEFAULT_AUTHOR
  } catch {
    return DEFAULT_AUTHOR
  }
}

/**
 * 验证作者名称
 * @param input - 用户输入
 * @returns 验证结果
 */
function validateAuthor(input: string): boolean | string {
  const trimmed = input.trim()

  if (!trimmed) {
    return '作者名称不能为空'
  }

  if (trimmed.length > MAX_AUTHOR_LENGTH) {
    return `作者名称不能超过 ${MAX_AUTHOR_LENGTH} 个字符`
  }

  if (!AUTHOR_PATTERN.test(trimmed)) {
    return '作者名称只能包含中文、英文、数字、下划线、空格和连字符'
  }

  return true
}

/**
 * 创建作者问题配置
 * @returns 问题配置对象
 */
export function authorQuestion(): QuestionConfig {
  return {
    type: 'input',
    name: 'author',
    default: getSystemUsername(),
    message: chalk.cyan('请输入项目作者名称:'),
    validate: validateAuthor,
  }
}
