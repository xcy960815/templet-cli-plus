import execa from 'execa'
import chalk from 'chalk'
import fs from 'fs'
import path from 'path'

/**
 * 统计信息接口
 */
interface CountInfo {
  all: number
  success: number
  error: number
}

/**
 * 修改 git 项目地址
 * @param newOriginAddress - 新的 git 远程地址前缀
 * @returns Promise<void>
 * @throws {Error} 当没有找到 git 项目时抛出错误
 */
export const replaceOriginAddress = async (newOriginAddress: string): Promise<void> => {
  const currentFolderPath = process.cwd()

  // 获取所有 git 项目文件夹
  const gitFolders = getGitFolders(currentFolderPath)

  if (gitFolders.length === 0) {
    console.log(chalk.redBright(`检测到当前路径下【${currentFolderPath}】没有 git 项目`))
    process.exit(1)
  }

  const countInfo: CountInfo = {
    all: gitFolders.length,
    success: 0,
    error: 0,
  }

  // 逐个处理 git 项目
  for (const folder of gitFolders) {
    try {
      await processGitFolder(currentFolderPath, folder, newOriginAddress, countInfo)
    } catch (error) {
      console.error(
        chalk.redBright(`处理项目 ${chalk.yellowBright(folder)} 时出错:`),
        error instanceof Error ? error.message : String(error)
      )
      countInfo.error += 1
    }
  }

  // 输出统计信息
  printSummary(countInfo)
  process.exit(0)
}

/**
 * 获取当前目录下所有 git 项目文件夹
 * @param currentPath - 当前目录路径
 * @returns git 项目文件夹名称数组
 */
const getGitFolders = (currentPath: string): string[] => {
  try {
    const items = fs.readdirSync(currentPath)
    return items.filter((item) => {
      // 过滤掉隐藏文件夹
      if (item.startsWith('.')) {
        return false
      }
      // 检查是否为 git 项目
      const gitPath = path.join(currentPath, item, '.git')
      return fs.existsSync(gitPath) && fs.statSync(gitPath).isDirectory()
    })
  } catch (error) {
    throw new Error(
      `无法读取目录 ${currentPath}: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

/**
 * 处理单个 git 项目文件夹
 * @param currentPath - 当前目录路径
 * @param folder - 项目文件夹名称
 * @param newOriginAddress - 新的 git 远程地址前缀
 * @param countInfo - 统计信息对象
 */
const processGitFolder = async (
  currentPath: string,
  folder: string,
  newOriginAddress: string,
  countInfo: CountInfo
): Promise<void> => {
  const folderPath = path.join(currentPath, folder)

  console.log(`${chalk.yellowBright('当前项目名称')}: ${chalk.greenBright(folder)}`)

  // 获取旧的远程地址
  const oldAddress = await getGitRemote(folderPath)
  if (!oldAddress) {
    console.log(chalk.yellowBright(`项目 ${folder} 没有配置远程地址，跳过`))
    countInfo.error += 1
    return
  }

  console.log(`${chalk.yellowBright('更新前地址')}:\n${chalk.greenBright(oldAddress)}`)

  // 更新远程地址
  const newRemoteUrl = `${newOriginAddress}${folder}`
  await updateGitRemote(folderPath, newRemoteUrl)

  // 验证新地址
  const newAddress = await getGitRemote(folderPath)
  if (newAddress && newAddress.includes(newRemoteUrl)) {
    console.log(`${chalk.yellowBright('更新后地址')}:\n${chalk.greenBright(newAddress)}`)
    countInfo.success += 1
  } else {
    console.log(chalk.redBright(`项目 ${folder} 地址更新失败`))
    countInfo.error += 1
  }
}

/**
 * 获取 git 远程地址
 * @param folderPath - 项目文件夹路径
 * @returns 远程地址字符串，如果获取失败则返回空字符串
 */
const getGitRemote = async (folderPath: string): Promise<string> => {
  try {
    const { stdout } = await execa('git', ['remote', '-v'], {
      cwd: folderPath,
    })
    return stdout || ''
  } catch (error) {
    console.error(
      chalk.redBright(`获取远程地址失败: ${error instanceof Error ? error.message : String(error)}`)
    )
    return ''
  }
}

/**
 * 更新 git 远程地址
 * @param folderPath - 项目文件夹路径
 * @param newRemoteUrl - 新的远程地址
 */
const updateGitRemote = async (folderPath: string, newRemoteUrl: string): Promise<void> => {
  try {
    // 删除旧的 origin
    await execa('git', ['remote', 'rm', 'origin'], {
      cwd: folderPath,
      stdio: 'inherit',
    })
  } catch (error) {
    // 如果 origin 不存在，忽略错误
    if (!(error instanceof Error && error.message.includes('No such remote'))) {
      throw error
    }
  }

  // 添加新的 origin
  await execa('git', ['remote', 'add', 'origin', newRemoteUrl], {
    cwd: folderPath,
    stdio: 'inherit',
  })
}

/**
 * 打印统计信息
 * @param countInfo - 统计信息对象
 */
const printSummary = (countInfo: CountInfo): void => {
  console.log('\n' + chalk.blueBright(`总共: ${countInfo.all}`))
  console.log(chalk.greenBright(`成功: ${countInfo.success}`))
  console.log(chalk.redBright(`失败: ${countInfo.error}`))
}
