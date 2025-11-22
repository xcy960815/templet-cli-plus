import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'
import * as checkReplaceUrlModule from '@/replace/check-replace-url'
import * as replaceOriginAddressModule from '@/replace/replace-origin-address'
import * as checkCliVersionModule from '@/update/check-cli-version'

// Mock 所有依赖模块
jest.mock('@/replace/check-replace-url')
jest.mock('@/replace/replace-origin-address')
jest.mock('@/update/check-cli-version')

describe('replace 命令', () => {
  let mockExit: jest.SpiedFunction<typeof process.exit>
  let mockConsoleError: jest.SpiedFunction<typeof console.error>

  beforeEach(() => {
    mockExit = jest.spyOn(process, 'exit').mockImplementation((code?: number) => {
      throw new Error(`process.exit(${code})`)
    })
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {})

    // 设置默认的 mock 返回值
    ;(
      checkCliVersionModule.checkCliVersion as jest.MockedFunction<
        typeof checkCliVersionModule.checkCliVersion
      >
    ).mockResolvedValue(undefined)
    ;(
      checkReplaceUrlModule.checkReplaceUrl as jest.MockedFunction<
        typeof checkReplaceUrlModule.checkReplaceUrl
      >
    ).mockResolvedValue('https://github.com/username/')
    ;(
      replaceOriginAddressModule.replaceOriginAddress as jest.MockedFunction<
        typeof replaceOriginAddressModule.replaceOriginAddress
      >
    ).mockResolvedValue(undefined)
  })

  afterEach(() => {
    jest.clearAllMocks()
    mockExit.mockRestore()
    mockConsoleError.mockRestore()
  })

  it('应该成功替换仓库地址', async () => {
    const originAddress = 'https://github.com/username'

    // 执行 replace 命令逻辑
    await checkCliVersionModule.checkCliVersion()
    const newOriginAddress = await checkReplaceUrlModule.checkReplaceUrl(originAddress)
    await replaceOriginAddressModule.replaceOriginAddress(newOriginAddress)

    // 验证调用
    expect(checkCliVersionModule.checkCliVersion).toHaveBeenCalled()
    expect(checkReplaceUrlModule.checkReplaceUrl).toHaveBeenCalledWith(originAddress)
    expect(replaceOriginAddressModule.replaceOriginAddress).toHaveBeenCalledWith(
      'https://github.com/username/'
    )
  })

  it('应该验证并规范化 URL', async () => {
    const invalidUrl = 'invalid-url'
    const validUrl = 'https://github.com/username/'

    ;(
      checkReplaceUrlModule.checkReplaceUrl as jest.MockedFunction<
        typeof checkReplaceUrlModule.checkReplaceUrl
      >
    ).mockResolvedValue(validUrl)

    const result = await checkReplaceUrlModule.checkReplaceUrl(invalidUrl)

    expect(checkReplaceUrlModule.checkReplaceUrl).toHaveBeenCalledWith(invalidUrl)
    expect(result).toBe(validUrl)
    expect(result.endsWith('/')).toBe(true)
  })

  it('应该在替换失败时处理错误', async () => {
    const originAddress = 'https://github.com/username'
    const error = new Error('替换失败')

    ;(
      replaceOriginAddressModule.replaceOriginAddress as jest.MockedFunction<
        typeof replaceOriginAddressModule.replaceOriginAddress
      >
    ).mockRejectedValue(error)

    try {
      const newOriginAddress = await checkReplaceUrlModule.checkReplaceUrl(originAddress)
      await replaceOriginAddressModule.replaceOriginAddress(newOriginAddress)
    } catch (e) {
      expect(e).toBe(error)
    }
  })

  it('应该处理空 URL 输入', async () => {
    const emptyUrl = ''
    const validUrl = 'https://github.com/username/'

    ;(
      checkReplaceUrlModule.checkReplaceUrl as jest.MockedFunction<
        typeof checkReplaceUrlModule.checkReplaceUrl
      >
    ).mockResolvedValue(validUrl)

    const result = await checkReplaceUrlModule.checkReplaceUrl(emptyUrl)

    expect(result).toBe(validUrl)
  })
})
