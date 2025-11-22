#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

/**
 * 验证 Git commit message 格式的脚本
 * 支持 Conventional Commits 规范，包括 revert 前缀和 scope
 * @fileoverview Git commit message 格式验证工具
 */

/**
 * 获取 commit message 文件路径
 * @type {string | undefined}
 */
const msgFile = process.argv[2]
if (!msgFile) {
  console.error('请提供 commit message 文件路径')
  process.exit(1)
}

/**
 * 读取 commit message
 * @type {string}
 */
let msg
try {
  msg = fs.readFileSync(path.resolve(process.cwd(), msgFile), 'utf-8')
} catch (error) {
  console.error(`无法读取 commit message 文件: ${error.message}`)
  process.exit(1)
}

/**
 * 只验证第一行（subject line），忽略 body 和 footer
 * @type {string}
 */
const subject = msg.split('\n')[0].trim()

/**
 * 如果消息为空，直接退出
 */
if (!subject) {
  console.error('\n提交信息不能为空。\n')
  process.exit(1)
}

/**
 * commit message 格式正则表达式
 * 支持 revert: 前缀
 * 支持 scope（括号内的内容，如 feat(ui):）
 * 描述部分限制 1-50 个字符
 * @type {RegExp}
 */
const commitRE =
  /^(revert: )?(feat|fix|docs|style|refactor|perf|test|build|ci|chore|types)(\([^)]+\))?: .{1,50}$/

/**
 * 验证 commit message 格式
 * 如果格式不正确，输出错误信息并退出
 */
if (!commitRE.test(subject)) {
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
      '  docs: 更新 README 文档\n' +
      '  feat(ui): 添加按钮组件\n'
  )
  process.exit(1)
}
