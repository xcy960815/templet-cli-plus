interface IVersionQuestion {
  type: 'input'
  name: 'version'
  message: '项目版本'
  default: string
}

/**
 * @desc 项目版本号问题
 * @returns {IVersionQuestion}
 */
const versionQuestion = function (): IVersionQuestion {
  return {
    type: 'input',
    name: 'version',
    message: '项目版本',
    default: '1.0.0',
  }
}

export { versionQuestion }
