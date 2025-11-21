import ora from 'ora'
import chalk from 'chalk'
import { promisify } from 'util'
import { readLocalPackageJson } from '@/common/read-local-packagejson'
import request, { CoreOptions, UriOptions, Response } from 'request'

const { name } = readLocalPackageJson(['name'])
const REGISTRY_BASE_URL = 'https://registry.npmmirror.com'
const REQUEST_TIMEOUT = 3000
const requestPromise = promisify(request)

type RequestResult = Response

const buildRequestOptions = (pkgName: string): UriOptions & CoreOptions => ({
  url: `${REGISTRY_BASE_URL.replace(/\/$/, '')}/${encodeURIComponent(pkgName)}`,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'user-agent': `${pkgName} cli`,
    accept: 'application/vnd.npm.install-v1+json',
  },
})

const handleRequestError = (spinner: ora.Ora, error: NodeJS.ErrnoException): never => {
  const isTimeout = error?.code === 'ETIMEDOUT'
  const failMessage = isTimeout ? '脚手架版本检查超时\n' : '脚手架版本检查失败请重试一次\n'
  spinner.fail(chalk.red(failMessage))
  if (!isTimeout && error?.message) {
    console.error(chalk.red(`详细错误: ${error.message}`))
  }
  process.exit(1)
}

/**
 * @desc 检查线上最新的脚手架版本号
 * @return {Promise<RequestResult>}
 */
export const getCliVersion = async (): Promise<RequestResult> => {
  const spinner = ora({
    text: chalk.green('正在检查脚手架版本\n'),
    spinner: 'dots',
  }).start()

  try {
    const requestOptions = buildRequestOptions(name ?? '')
    const result = await requestPromise(requestOptions)
    spinner.succeed(chalk.green('🎉 脚手架版本检查完成'))
    return result
  } catch (error: any) {
    handleRequestError(spinner, error)
  }
}
