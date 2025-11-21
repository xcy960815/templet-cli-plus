import chalk from 'chalk'
import { getCliVersion } from './get-cli-version'
import { compareCliVersion } from './compare-cli-version'
import { updateCliVersion } from './update-cli-version'

type DistTags = { latest?: string }
type RegistryResponse = { 'dist-tags'?: DistTags }

/**
 * @desc 解析最新的版本号
 * @param body {string}
 * @returns {string | undefined}
 */
const parseLatestVersion = (body: string): string | undefined => {
  try {
    const jsonBody: RegistryResponse = JSON.parse(body)
    return jsonBody['dist-tags']?.latest
  } catch (error) {
    console.warn(chalk.yellow('⚠️  npm registry 响应解析失败'), error)
    return undefined
  }
}

/**
 * @desc 确保版本号可比较
 * @param latestVersion {string}
 * @returns {Promise<string | undefined>}
 */
const ensureComparableVersion = async (latestVersion: string): Promise<string | undefined> =>
  compareCliVersion(latestVersion)

/**
 * @desc 检查脚手架版本号
 * @return {Promise<void>}
 */
export const checkCliVersion = async (): Promise<void> => {
  const { body, statusCode } = (await getCliVersion()).toJSON()

  if (statusCode !== 200) {
    console.warn(chalk.yellow('⚠️  npm registry 返回非 200 状态码，跳过版本检查'))
    return
  }

  const latestVersion = parseLatestVersion(body)
  if (!latestVersion) {
    console.warn(chalk.yellow('⚠️  未从 dist-tags.latest 中获取到版本号，跳过更新'))
    return
  }

  const versionToUpdate = await ensureComparableVersion(latestVersion)
  if (!versionToUpdate) {
    return
  }

  await updateCliVersion(versionToUpdate)
}
