#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// 获取 commit message 文件路径
const msgFile = process.argv[2]
if (!msgFile) {
  console.error('请提供 commit message 文件路径')
  process.exit(1)
}

// 读取 commit message
const msg = fs.readFileSync(path.resolve(process.cwd(), msgFile), 'utf-8').trim()

// commit message 格式
const commitRE =
  /^(revert: )?(feat|fix|docs|style|refactor|perf|test|build|ci|chore|types)(\(.+\))?: .{1,50}/

if (!commitRE.test(msg)) {
  console.error(
    '\n提交信息格式错误。\n\n' +
      '正确的提交信息格式：\n\n' +
      '  feat: 添加新功能\n' +
      '  fix: 修复 bug\n' +
      '  docs: 文档更新\n' +
      '  style: 代码格式（不影响代码运行的变动）\n' +
      '  refactor: 重构（既不是新增功能，也不是修改 bug 的代码变动）\n' +
      '  perf: 性能优化\n' +
      '  test: 增加测试\n' +
      '  build: 构建过程或辅助工具的变动\n' +
      '  ci: CI 配置相关\n' +
      '  chore: 其他改动\n' +
      '  types: 类型定义文件修改\n\n' +
      '例如：\n' +
      '  feat: 添加用户登录功能\n' +
      '  fix: 修复用户列表分页问题\n' +
      '  docs: 更新 README 文档\n'
  )
  process.exit(1)
}
