import chalk from 'chalk'

/**
 * 问题配置接口
 */
interface QuestionConfig {
  type: 'input'
  name: 'projectName'
  message: string
  default: string
  validate?: (input: string) => boolean | string
}

/**
 * 验证项目名称
 * @param input - 用户输入
 * @returns 验证结果
 */
function validateProjectName(input: string): boolean | string {
  if (!input.trim()) {
    return '项目名称不能为空'
  }
  if (input.length > 50) {
    return '项目名称不能超过 50 个字符'
  }
  // 项目名称只能包含字母、数字、连字符和下划线
  if (!/^[a-zA-Z0-9_-]+$/.test(input)) {
    return '项目名称只能包含字母、数字、连字符和下划线'
  }
  return true
}

/**
 * 创建项目名称问题配置
 * @param projectName - 默认项目名称
 * @returns 问题配置对象
 */
export function projectNameQuestion(projectName?: string): QuestionConfig {
  const defaultName = projectName || 'project'
  return {
    type: 'input',
    name: 'projectName',
    message: chalk.cyan('请输入项目名称:'),
    default: defaultName,
    validate: validateProjectName,
  }
}
