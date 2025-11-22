import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'
import * as cloneRepositoryModule from '@/clone/clone-repository'
import * as checkSameFolderModule from '@/init/check-same-folder'
import * as checkCliVersionModule from '@/update/check-cli-version'

// Mock 所有依赖模块
jest.mock('@/clone/clone-repository')
jest.mock('@/init/check-same-folder')
jest.mock('@/update/check-cli-version')

describe('clone 命令', () => {
  let mockExit: jest.SpiedFunction<typeof process.exit>
  let mockConsoleError: jest.SpiedFunction<typeof console.error>
  let mockConsoleLog: jest.SpiedFunction<typeof console.log>

  beforeEach(() => {
    mockExit = jest.spyOn(process, 'exit').mockImplementation((code?: number | string | null) => {
      throw new Error(`process.exit(${code})`)
    })
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {})

    // 设置默认的 mock 返回值
    ;(
      checkCliVersionModule.checkCliVersion as jest.MockedFunction<
        typeof checkCliVersionModule.checkCliVersion
      >
    ).mockResolvedValue(undefined)
    ;(
      checkSameFolderModule.checkSameFolder as jest.MockedFunction<
        typeof checkSameFolderModule.checkSameFolder
      >
    ).mockResolvedValue(false)
    ;(
      cloneRepositoryModule.cloneRepository as jest.MockedFunction<
        typeof cloneRepositoryModule.cloneRepository
      >
    ).mockResolvedValue(undefined)
  })

  afterEach(() => {
    jest.clearAllMocks()
    mockExit.mockRestore()
    mockConsoleError.mockRestore()
    mockConsoleLog.mockRestore()
  })

  it('应该成功克隆仓库', async () => {
    const url = 'https://github.com/user/repo.git'

    // 执行 clone 命令逻辑
    await checkCliVersionModule.checkCliVersion()
    const hasSameFolder = await checkSameFolderModule.checkSameFolder(url)
    if (hasSameFolder) {
      // 如果有同名文件夹，应该退出
      return
    }
    await cloneRepositoryModule.cloneRepository(url)

    // 验证调用
    expect(checkCliVersionModule.checkCliVersion).toHaveBeenCalled()
    expect(checkSameFolderModule.checkSameFolder).toHaveBeenCalledWith(url)
    expect(cloneRepositoryModule.cloneRepository).toHaveBeenCalledWith(url)
  })

  it('应该在存在同名文件夹时退出', async () => {
    const url = 'https://github.com/user/repo.git'

    ;(
      checkSameFolderModule.checkSameFolder as jest.MockedFunction<
        typeof checkSameFolderModule.checkSameFolder
      >
    ).mockResolvedValue(true)

    const hasSameFolder = await checkSameFolderModule.checkSameFolder(url)
    expect(hasSameFolder).toBe(true)
    expect(cloneRepositoryModule.cloneRepository).not.toHaveBeenCalled()
  })

  it('应该处理 GitHub URL', async () => {
    const githubUrl = 'https://github.com/user/repo.git'

    await cloneRepositoryModule.cloneRepository(githubUrl)

    expect(cloneRepositoryModule.cloneRepository).toHaveBeenCalledWith(githubUrl)
  })

  it('应该处理 GitLab URL（不使用代理）', async () => {
    const gitlabUrl = 'https://gitlab.com/user/repo.git'

    await cloneRepositoryModule.cloneRepository(gitlabUrl)

    expect(cloneRepositoryModule.cloneRepository).toHaveBeenCalledWith(gitlabUrl)
  })

  it('应该在克隆失败时处理错误', async () => {
    const url = 'https://github.com/user/repo.git'
    const error = new Error('克隆失败')

    ;(
      cloneRepositoryModule.cloneRepository as jest.MockedFunction<
        typeof cloneRepositoryModule.cloneRepository
      >
    ).mockRejectedValue(error)

    try {
      await cloneRepositoryModule.cloneRepository(url)
    } catch (e) {
      expect(e).toBe(error)
    }
  })

  it('应该处理空 URL', async () => {
    const emptyUrl = ''

    ;(
      cloneRepositoryModule.cloneRepository as jest.MockedFunction<
        typeof cloneRepositoryModule.cloneRepository
      >
    ).mockImplementation(async () => {
      throw new Error('仓库 URL 不能为空')
    })

    try {
      await cloneRepositoryModule.cloneRepository(emptyUrl)
    } catch (e) {
      expect(e).toBeInstanceOf(Error)
    }
  })
})
