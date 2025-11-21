import ora from 'ora'
import chalk from 'chalk'
import { promisify } from 'util'
import { readLocalPackageJson } from '@/common/read-local-packagejson'
import request from 'request'

const { name } = readLocalPackageJson(['name'])
const REGISTRY_BASE_URL = 'https://registry.npmmirror.com'
const REQUEST_TIMEOUT = 3000
const requestPromise = promisify(request)

interface IJsonResult {
  statusCode: number
  body: string
  headers: {
    [key: string]: string
  }
  request: {
    uri: {
      protocol: string
      slashes: boolean
      auth: null
      host: string
      port: number
      hostname: string
      hash: null
      search: null
      query: null
      pathname: string
      path: string
      href: string
    }
    method: string
  }
}

interface IResult {
  toJSON: () => IJsonResult
}

/**
 * @desc 检查线上最新的脚手架版本号
 * @return {Promise<void>}
 */
export const getCliVersion = async (): Promise<IResult> => {
  const spinner = ora(chalk.green('正在检查脚手架版本\n'))
  spinner.start()

  try {
    const result = await requestPromise({
      url: `${REGISTRY_BASE_URL}/${name}`,
      timeout: REQUEST_TIMEOUT,
      headers: {
        'user-agent': `${name} cli`,
        accept: 'application/vnd.npm.install-v1+json',
      },
    })
    spinner.succeed(`${chalk.green('✔ 🎉 脚手架版本检查完成')}\n`)
    return result
  } catch (error: any) {
    const isTimeout = error?.code === 'ETIMEDOUT'
    const failMessage = isTimeout ? '脚手架版本检查超时\n' : '脚手架版本检查失败请重试一次\n'
    spinner.fail(chalk.red(failMessage))
    process.exit(1)
  }
}
