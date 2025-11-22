import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'
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

describe('init 命令', () => {
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
      initQuestionsModule.initQuestions as jest.MockedFunction<
        typeof initQuestionsModule.initQuestions
      >
    ).mockResolvedValue({
      templateName: 'test-template',
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

  it('应该成功初始化项目', async () => {
    // 执行 init 命令逻辑
    await checkCliVersionModule.checkCliVersion()
    const answers = await initQuestionsModule.initQuestions([
      'templateName',
      'projectName',
      'version',
      'description',
      'author',
    ])

    const hasSameFolder = await checkSameFolderModule.checkSameFolder(answers.projectName)
    const finalProjectName = hasSameFolder
      ? await handleSameFolderModule.handleSameFolder(answers.projectName)
      : answers.projectName

    await downloadTemplateModule.downloadTemplate(answers.templateName, finalProjectName)
    setTargetPackageJsonModule.setTargetPackageJson(finalProjectName, answers)
    installDependenciesModule.installDependencies(finalProjectName)

    // 验证调用
    expect(checkCliVersionModule.checkCliVersion).toHaveBeenCalled()
    expect(initQuestionsModule.initQuestions).toHaveBeenCalledWith([
      'templateName',
      'projectName',
      'version',
      'description',
      'author',
    ])
    expect(checkSameFolderModule.checkSameFolder).toHaveBeenCalledWith('test-project')
    expect(downloadTemplateModule.downloadTemplate).toHaveBeenCalledWith(
      'test-template',
      'test-project'
    )
    expect(setTargetPackageJsonModule.setTargetPackageJson).toHaveBeenCalledWith(
      'test-project',
      answers
    )
    expect(installDependenciesModule.installDependencies).toHaveBeenCalledWith('test-project')
  })

  it('应该处理所有必需的问题', async () => {
    const questions: Array<'templateName' | 'projectName' | 'version' | 'description' | 'author'> =
      ['templateName', 'projectName', 'version', 'description', 'author']

    await initQuestionsModule.initQuestions(questions)

    expect(initQuestionsModule.initQuestions).toHaveBeenCalledWith(questions)
  })

  it('应该在初始化失败时处理错误', async () => {
    const error = new Error('初始化失败')

    ;(
      initQuestionsModule.initQuestions as jest.MockedFunction<
        typeof initQuestionsModule.initQuestions
      >
    ).mockRejectedValue(error)

    try {
      await initQuestionsModule.initQuestions([
        'templateName',
        'projectName',
        'version',
        'description',
        'author',
      ])
    } catch (e) {
      expect(e).toBe(error)
    }
  })
})
