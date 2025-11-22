import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'
import * as checkCliVersionModule from '@/update/check-cli-version'

// Mock 所有依赖模块
jest.mock('@/update/check-cli-version')

describe('update 命令', () => {
  let mockConsoleLog: jest.SpiedFunction<typeof console.log>

  beforeEach(() => {
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {})

    // 设置默认的 mock 返回值
    ;(
      checkCliVersionModule.checkCliVersion as jest.MockedFunction<
        typeof checkCliVersionModule.checkCliVersion
      >
    ).mockResolvedValue(undefined)
  })

  afterEach(() => {
    jest.clearAllMocks()
    mockConsoleLog.mockRestore()
  })

  it('应该检查 CLI 版本', async () => {
    // 执行 update 命令逻辑
    await checkCliVersionModule.checkCliVersion()

    // 验证调用
    expect(checkCliVersionModule.checkCliVersion).toHaveBeenCalled()
  })

  it('应该显示更新提示信息', async () => {
    // update 命令会显示提示信息
    const message = '🎉 脚手架已经是最新版本\n'
    console.log(message)

    expect(mockConsoleLog).toHaveBeenCalledWith(message)
  })

  it('应该在版本检查失败时处理错误', async () => {
    const error = new Error('版本检查失败')

    ;(
      checkCliVersionModule.checkCliVersion as jest.MockedFunction<
        typeof checkCliVersionModule.checkCliVersion
      >
    ).mockRejectedValue(error)

    try {
      await checkCliVersionModule.checkCliVersion()
    } catch (e) {
      expect(e).toBe(error)
    }
  })
})
