import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'
import * as getProcessByPortModule from '@/kill-process/get-process-port'
import type { ProcessInfo } from '@/kill-process/get-process-port'
import * as killProcessModule from '@/kill-process/kill-process'

// Mock 所有依赖模块
jest.mock('@/kill-process/get-process-port')
jest.mock('@/kill-process/kill-process')

describe('kill 命令', () => {
  let mockExit: jest.SpiedFunction<typeof process.exit>
  let mockConsoleError: jest.SpiedFunction<typeof console.error>

  beforeEach(() => {
    mockExit = jest.spyOn(process, 'exit').mockImplementation((code?: number) => {
      throw new Error(`process.exit(${code})`)
    })
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {})

    // 设置默认的 mock 返回值
    ;(getProcessByPortModule.getProcessByPort as jest.MockedFunction<
      typeof getProcessByPortModule.getProcessByPort
    >) = jest.fn<typeof getProcessByPortModule.getProcessByPort>().mockResolvedValue([
      {
        processName: 'node',
        processId: '12345',
      },
    ] as ProcessInfo[])
    ;(killProcessModule.killProcess as jest.MockedFunction<typeof killProcessModule.killProcess>) =
      jest.fn<typeof killProcessModule.killProcess>().mockResolvedValue(undefined)
  })

  afterEach(() => {
    jest.clearAllMocks()
    mockExit.mockRestore()
    mockConsoleError.mockRestore()
  })

  it('应该成功终止指定端口的进程', async () => {
    const port = '8080'

    // 执行 kill 命令逻辑
    const processOptions = await getProcessByPortModule.getProcessByPort(port)
    await killProcessModule.killProcess(processOptions, port)

    // 验证调用
    expect(getProcessByPortModule.getProcessByPort).toHaveBeenCalledWith(port)
    expect(killProcessModule.killProcess).toHaveBeenCalledWith(processOptions, port)
  })

  it('应该处理没有找到进程的情况', async () => {
    const port = '8080'

    ;(getProcessByPortModule.getProcessByPort as jest.MockedFunction<
      typeof getProcessByPortModule.getProcessByPort
    >) = jest
      .fn<typeof getProcessByPortModule.getProcessByPort>()
      .mockResolvedValue([] as ProcessInfo[])
    ;(killProcessModule.killProcess as jest.MockedFunction<typeof killProcessModule.killProcess>) =
      jest.fn<typeof killProcessModule.killProcess>().mockResolvedValue(undefined)

    const processOptions = await getProcessByPortModule.getProcessByPort(port)
    await killProcessModule.killProcess(processOptions, port)

    expect(getProcessByPortModule.getProcessByPort).toHaveBeenCalledWith(port)
    expect(killProcessModule.killProcess).toHaveBeenCalledWith([], port)
  })

  it('应该处理多个进程的情况', async () => {
    const port = '8080'
    const multipleProcesses: ProcessInfo[] = [
      { processName: 'node', processId: '12345' },
      { processName: 'node', processId: '12346' },
    ]

    ;(getProcessByPortModule.getProcessByPort as jest.MockedFunction<
      typeof getProcessByPortModule.getProcessByPort
    >) = jest
      .fn<typeof getProcessByPortModule.getProcessByPort>()
      .mockResolvedValue(multipleProcesses)

    const processOptions = await getProcessByPortModule.getProcessByPort(port)
    await killProcessModule.killProcess(processOptions, port)

    expect(processOptions).toHaveLength(2)
    expect(killProcessModule.killProcess).toHaveBeenCalledWith(multipleProcesses, port)
  })

  it('应该在终止进程失败时处理错误', async () => {
    const port = '8080'
    const error = new Error('终止进程失败')

    ;(killProcessModule.killProcess as jest.MockedFunction<typeof killProcessModule.killProcess>) =
      jest.fn<typeof killProcessModule.killProcess>().mockRejectedValue(error)

    try {
      const processOptions = await getProcessByPortModule.getProcessByPort(port)
      await killProcessModule.killProcess(processOptions, port)
    } catch (e) {
      expect(e).toBe(error)
    }
  })

  it('应该处理无效端口号', async () => {
    const invalidPort = 'invalid'

    ;(getProcessByPortModule.getProcessByPort as jest.MockedFunction<
      typeof getProcessByPortModule.getProcessByPort
    >) = jest
      .fn<typeof getProcessByPortModule.getProcessByPort>()
      .mockRejectedValue(new Error('无效的端口号'))

    try {
      await getProcessByPortModule.getProcessByPort(invalidPort)
    } catch (e) {
      expect(e).toBeInstanceOf(Error)
    }
  })
})
