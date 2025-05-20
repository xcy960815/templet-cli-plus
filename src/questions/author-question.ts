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
 * 自定义错误类，用于用户信息获取相关的错误
 */
class UserInfoError extends Error {
  constructor(
    message: string,
    public originalError?: Error
  ) {
    super(message)
    this.name = 'UserInfoError'
  }
}

/**
 * 获取系统用户信息
 * @returns 用户名
 * @throws {UserInfoError} 当无法获取用户信息时抛出错误
 */
function getSystemUsername(): string {
  try {
    const { username } = userInfo()
    return username || 'anonymous'
  } catch (error) {
    throw new UserInfoError(
      '无法获取系统用户信息',
      error instanceof Error ? error : new Error(String(error))
    )
  }
}

/**
 * 验证作者名称
 * @param input - 用户输入
 * @returns 验证结果
 */
function validateAuthor(input: string): boolean | string {
  if (!input.trim()) {
    return '作者名称不能为空'
  }
  if (input.length > 50) {
    return '作者名称不能超过 50 个字符'
  }
  if (!/^[\u4e00-\u9fa5a-zA-Z0-9_\s-]+$/.test(input)) {
    return '作者名称只能包含中文、英文、数字、下划线、空格和连字符'
  }
  return true
}

/**
 * 创建作者问题配置
 * @returns 问题配置对象
 * @throws {UserInfoError} 当无法获取系统用户信息时抛出错误
 */
export function authorQuestion(): QuestionConfig {
  try {
    const defaultAuthor = getSystemUsername()

    return {
      type: 'input',
      name: 'author',
      default: defaultAuthor,
      message: chalk.cyan('请输入项目作者名称:'),
      validate: validateAuthor,
    }
  } catch (error) {
    if (error instanceof UserInfoError) {
      // 如果无法获取系统用户信息，使用默认值
      return {
        type: 'input',
        name: 'author',
        default: 'anonymous',
        message: chalk.cyan('请输入项目作者名称:'),
        validate: validateAuthor,
      }
    }
    throw error
  }
}
