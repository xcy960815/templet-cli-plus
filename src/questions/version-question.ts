import chalk from 'chalk'

/**
 * 问题配置接口
 */
interface QuestionConfig {
  type: 'input'
  name: 'version'
  default: string
  message: string
  validate?: (input: string) => boolean | string
}

/**
 * 验证版本号格式（语义化版本号）
 * @param input - 用户输入的版本号
 * @returns 验证结果，true 表示有效，string 表示错误信息
 */
function validateVersion(input: string): boolean | string {
  if (!input.trim()) {
    return '版本号不能为空'
  }

  // 语义化版本号正则：主版本号.次版本号.修订号（可选：-预发布标识 +构建元数据）
  const semverRegex =
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/

  if (!semverRegex.test(input.trim())) {
    return '请输入有效的语义化版本号（例如：1.0.0、2.1.3、1.0.0-beta.1）'
  }

  return true
}

/**
 * 创建版本号问题配置
 * @returns 问题配置对象
 */
export function versionQuestion(): QuestionConfig {
  return {
    type: 'input',
    name: 'version',
    default: '1.0.0',
    message: chalk.cyan('请输入项目版本号:'),
    validate: validateVersion,
  }
}
