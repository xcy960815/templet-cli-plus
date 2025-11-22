import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'
import * as printHelpModule from '@/help/print-help'
import * as checkCliVersionModule from '@/update/check-cli-version'

// Mock 所有依赖模块
jest.mock('@/help/print-help')
jest.mock('@/update/check-cli-version')

describe('help 命令', () => {
  beforeEach(() => {
    // 设置默认的 mock 返回值
    ;(
      checkCliVersionModule.checkCliVersion as jest.MockedFunction<
        typeof checkCliVersionModule.checkCliVersion
      >
    ).mockResolvedValue(undefined)
    ;(
      printHelpModule.printHelp as jest.MockedFunction<typeof printHelpModule.printHelp>
    ).mockResolvedValue(undefined)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('应该成功显示帮助信息', async () => {
    // 执行 help 命令逻辑
    await checkCliVersionModule.checkCliVersion()
    await printHelpModule.printHelp()

    // 验证调用
    expect(checkCliVersionModule.checkCliVersion).toHaveBeenCalled()
    expect(printHelpModule.printHelp).toHaveBeenCalled()
  })

  it('应该在显示帮助信息失败时处理错误', async () => {
    const error = new Error('显示帮助信息失败')

    ;(
      printHelpModule.printHelp as jest.MockedFunction<typeof printHelpModule.printHelp>
    ).mockRejectedValue(error)

    try {
      await printHelpModule.printHelp()
    } catch (e) {
      expect(e).toBe(error)
    }
  })

  it('应该先检查版本再显示帮助', async () => {
    const callOrder: string[] = []

    ;(
      checkCliVersionModule.checkCliVersion as jest.MockedFunction<
        typeof checkCliVersionModule.checkCliVersion
      >
    ).mockImplementation(async () => {
      callOrder.push('checkVersion')
    })
    ;(
      printHelpModule.printHelp as jest.MockedFunction<typeof printHelpModule.printHelp>
    ).mockImplementation(async () => {
      callOrder.push('printHelp')
    })

    await checkCliVersionModule.checkCliVersion()
    await printHelpModule.printHelp()

    expect(callOrder).toEqual(['checkVersion', 'printHelp'])
  })
})
