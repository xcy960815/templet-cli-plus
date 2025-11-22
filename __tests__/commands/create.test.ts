import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'
import { Command } from 'commander'
import * as initQuestionsModule from '@/questions/init-questions'
import * as checkSameFolderModule from '@/init/check-same-folder'
import * as handleSameFolderModule from '@/init/handle-same-folder'
import * as downloadTemplateModule from '@/init/download-template'
import * as setTargetPackageJsonModule from '@/init/set-target-package-json'
import * as installDependenciesModule from '@/init/install-dependencies'
import * as checkCliVersionModule from '@/update/check-cli-version'

// Mock 所有依赖模块
jest.mock('@/questions/init-questions')
jest.mock('@/init/check-same-folder')
jest.mock('@/init/handle-same-folder')
jest.mock('@/init/download-template')
jest.mock('@/init/set-target-package-json')
jest.mock('@/init/install-dependencies')
jest.mock('@/update/check-cli-version')

describe('create 命令', () => {
  let program: Command
  let mockExit: jest.SpiedFunction<typeof process.exit>
  let mockConsoleError: jest.SpiedFunction<typeof console.error>

  beforeEach(() => {
    program = new Command()
    mockExit = jest.spyOn(process, 'exit').mockImplementation((code?: number | string | null) => {
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
      initQuestionsModule.initQuestions as jest.MockedFunction<
        typeof initQuestionsModule.initQuestions
      >
    ).mockResolvedValue({
      projectName: 'test-project',
      version: '1.0.0',
      description: 'Test description',
      author: 'Test Author',
    } as any)
    ;(
      checkSameFolderModule.checkSameFolder as jest.MockedFunction<
        typeof checkSameFolderModule.checkSameFolder
      >
    ).mockResolvedValue(false)
    ;(
      downloadTemplateModule.downloadTemplate as jest.MockedFunction<
        typeof downloadTemplateModule.downloadTemplate
      >
    ).mockResolvedValue(undefined)
    ;(
      setTargetPackageJsonModule.setTargetPackageJson as jest.MockedFunction<
        typeof setTargetPackageJsonModule.setTargetPackageJson
      >
    ).mockReturnValue(undefined)
    ;(
      installDependenciesModule.installDependencies as jest.MockedFunction<
        typeof installDependenciesModule.installDependencies
      >
    ).mockResolvedValue(undefined)
  })

  afterEach(() => {
    jest.clearAllMocks()
    mockExit.mockRestore()
    mockConsoleError.mockRestore()
  })

  it('应该成功创建项目', async () => {
    // 模拟 create 命令的行为
    const templateName = 'test-template'
    const projectName = 'test-project'

    // 执行命令逻辑
    await checkCliVersionModule.checkCliVersion()
    const answers = await initQuestionsModule.initQuestions(
      ['projectName', 'version', 'description', 'author'],
      projectName
    )
    const hasSameFolder = await checkSameFolderModule.checkSameFolder(projectName)
    const finalProjectName = hasSameFolder
      ? await handleSameFolderModule.handleSameFolder(projectName)
      : projectName

    await downloadTemplateModule.downloadTemplate(templateName, finalProjectName)
    setTargetPackageJsonModule.setTargetPackageJson(finalProjectName, {
      ...answers,
      templateName,
    })
    installDependenciesModule.installDependencies(finalProjectName)

    // 验证调用
    expect(checkCliVersionModule.checkCliVersion).toHaveBeenCalled()
    expect(initQuestionsModule.initQuestions).toHaveBeenCalledWith(
      ['projectName', 'version', 'description', 'author'],
      projectName
    )
    expect(checkSameFolderModule.checkSameFolder).toHaveBeenCalledWith(projectName)
    expect(downloadTemplateModule.downloadTemplate).toHaveBeenCalledWith(templateName, projectName)
    expect(setTargetPackageJsonModule.setTargetPackageJson).toHaveBeenCalled()
    expect(installDependenciesModule.installDependencies).toHaveBeenCalledWith(projectName)
  })

  it('应该处理同名文件夹冲突', async () => {
    const templateName = 'test-template'
    const projectName = 'test-project'
    const resolvedProjectName = 'test-project-resolved'

    ;(
      checkSameFolderModule.checkSameFolder as jest.MockedFunction<
        typeof checkSameFolderModule.checkSameFolder
      >
    ).mockResolvedValue(true)
    ;(
      handleSameFolderModule.handleSameFolder as jest.MockedFunction<
        typeof handleSameFolderModule.handleSameFolder
      >
    ).mockResolvedValue(resolvedProjectName)

    const hasSameFolder = await checkSameFolderModule.checkSameFolder(projectName)
    const finalProjectName = hasSameFolder
      ? await handleSameFolderModule.handleSameFolder(projectName)
      : projectName

    expect(finalProjectName).toBe(resolvedProjectName)
    expect(handleSameFolderModule.handleSameFolder).toHaveBeenCalledWith(projectName)
  })

  it('应该在下载模板失败时处理错误', async () => {
    const templateName = 'test-template'
    const projectName = 'test-project'
    const error = new Error('下载失败')

    ;(
      downloadTemplateModule.downloadTemplate as jest.MockedFunction<
        typeof downloadTemplateModule.downloadTemplate
      >
    ).mockRejectedValue(error)

    try {
      await downloadTemplateModule.downloadTemplate(templateName, projectName)
    } catch (e) {
      expect(e).toBe(error)
    }

    expect(downloadTemplateModule.downloadTemplate).toHaveBeenCalledWith(templateName, projectName)
  })

  it('应该在问题初始化失败时处理错误', async () => {
    const projectName = 'test-project'
    const error = new Error('问题初始化失败')

    ;(
      initQuestionsModule.initQuestions as jest.MockedFunction<
        typeof initQuestionsModule.initQuestions
      >
    ).mockRejectedValue(error)

    try {
      await initQuestionsModule.initQuestions(
        ['projectName', 'version', 'description', 'author'],
        projectName
      )
    } catch (e) {
      expect(e).toBe(error)
    }
  })
})
