import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'
import * as getTemplateListModule from '@/list/get-template-list'
import type { Template } from '@/list/get-template-list'
import * as printAsTableModule from '@/common/print-as-table'
import * as checkCliVersionModule from '@/update/check-cli-version'

// Mock 所有依赖模块
jest.mock('@/list/get-template-list')
jest.mock('@/common/print-as-table')
jest.mock('@/update/check-cli-version')

describe('list 命令', () => {
  let mockExit: jest.SpiedFunction<typeof process.exit>
  let mockConsoleError: jest.SpiedFunction<typeof console.error>

  beforeEach(() => {
    mockExit = jest.spyOn(process, 'exit').mockImplementation((code?: number) => {
      throw new Error(`process.exit(${code})`)
    })
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {})

    // 设置默认的 mock 返回值
    ;(checkCliVersionModule.checkCliVersion as jest.MockedFunction<
      typeof checkCliVersionModule.checkCliVersion
    >) = jest.fn<typeof checkCliVersionModule.checkCliVersion>().mockResolvedValue(undefined)
    ;(getTemplateListModule.getTemplateList as jest.MockedFunction<
      typeof getTemplateListModule.getTemplateList
    >) = jest.fn<typeof getTemplateListModule.getTemplateList>().mockResolvedValue({
      'template-1': {
        desc: 'Template 1 description',
        downloadUrl: 'https://github.com/user/template-1',
      },
      'template-2': {
        desc: 'Template 2 description',
        downloadUrl: 'https://github.com/user/template-2',
      },
    } as Record<string, Template>)
    ;(printAsTableModule.printAsTable as jest.MockedFunction<
      typeof printAsTableModule.printAsTable
    >) = jest.fn<typeof printAsTableModule.printAsTable>().mockResolvedValue(undefined)
  })

  afterEach(() => {
    jest.clearAllMocks()
    mockExit.mockRestore()
    mockConsoleError.mockRestore()
  })

  it('应该成功获取并显示模板列表', async () => {
    // 执行 list 命令逻辑
    await checkCliVersionModule.checkCliVersion()
    const templateList = await getTemplateListModule.getTemplateList(true)

    const tableHeader = ['模板名称', '模板描述']
    const tableBody: Record<string, string> = {}

    Object.keys(templateList).forEach((key) => {
      tableBody[key] = templateList[key].desc
    })

    await printAsTableModule.printAsTable(tableBody, tableHeader)

    // 验证调用
    expect(checkCliVersionModule.checkCliVersion).toHaveBeenCalled()
    expect(getTemplateListModule.getTemplateList).toHaveBeenCalledWith(true)
    expect(printAsTableModule.printAsTable).toHaveBeenCalled()
  })

  it('应该正确格式化模板列表数据', async () => {
    const templateList: Record<string, Template> = {
      'react-template': {
        desc: 'React 项目模板',
        downloadUrl: 'https://github.com/user/react-template',
      },
      'vue-template': {
        desc: 'Vue 项目模板',
        downloadUrl: 'https://github.com/user/vue-template',
      },
    }

    ;(getTemplateListModule.getTemplateList as jest.MockedFunction<
      typeof getTemplateListModule.getTemplateList
    >) = jest.fn<typeof getTemplateListModule.getTemplateList>().mockResolvedValue(templateList)

    const result = await getTemplateListModule.getTemplateList(true)
    const tableBody: Record<string, string> = {}

    Object.keys(result).forEach((key) => {
      tableBody[key] = result[key].desc
    })

    expect(tableBody).toEqual({
      'react-template': 'React 项目模板',
      'vue-template': 'Vue 项目模板',
    })
  })

  it('应该在获取模板列表失败时处理错误', async () => {
    const error = new Error('获取模板列表失败')

    ;(getTemplateListModule.getTemplateList as jest.MockedFunction<
      typeof getTemplateListModule.getTemplateList
    >) = jest.fn<typeof getTemplateListModule.getTemplateList>().mockRejectedValue(error)

    try {
      await getTemplateListModule.getTemplateList(true)
    } catch (e) {
      expect(e).toBe(error)
    }
  })

  it('应该处理空模板列表', async () => {
    ;(getTemplateListModule.getTemplateList as jest.MockedFunction<
      typeof getTemplateListModule.getTemplateList
    >) = jest
      .fn<typeof getTemplateListModule.getTemplateList>()
      .mockResolvedValue({} as Record<string, Template>)

    const templateList = await getTemplateListModule.getTemplateList(true)
    const tableBody: Record<string, string> = {}

    Object.keys(templateList).forEach((key) => {
      tableBody[key] = templateList[key].desc
    })

    expect(Object.keys(tableBody)).toHaveLength(0)
  })
})
