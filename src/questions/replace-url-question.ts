import chalk from 'chalk'

/**
 * 问题配置接口
 */
interface QuestionConfig {
  type: 'input'
  name: 'replaceUrl'
  message: string
  validate: (input: string) => boolean | string
}

/**
 * 验证 GitHub 远程地址格式
 * @param input - 用户输入的 URL
 * @returns 验证结果
 */
function validateGitHubUrl(input: string): boolean | string {
  const trimmedInput = input.trim()

  if (!trimmedInput) {
    return 'GitHub 远程地址不能为空'
  }

  // GitHub URL 正则表达式：支持 http/https 协议，github.com 或 github.com 的子域名
  const githubUrlReg =
    /^(https?:\/\/)?([\da-z\.-]+\.)?github\.com\/[\w\.-]+\/[\w\.-]+(?:\.git)?\/?$/

  if (githubUrlReg.test(trimmedInput)) {
    return true
  }

  return '请输入正确的 GitHub 远程地址（例如：https://github.com/username/repo.git）'
}

/**
 * 创建替换 URL 问题配置
 * @returns 问题配置对象
 */
export function replaceUrlQuestion(): QuestionConfig {
  return {
    type: 'input',
    name: 'replaceUrl',
    message: chalk.redBright('请输入正确的 GitHub 远程地址:'),
    validate: validateGitHubUrl,
  }
}
