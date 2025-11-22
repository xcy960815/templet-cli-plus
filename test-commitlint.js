#!/usr/bin/env node

/**
 * 测试 commitlint 配置的脚本
 * 注意：由于 Node 14 的限制，此脚本仅验证配置文件格式
 * 实际功能测试需要 Node 16.9.0+ 或升级 commitlint 版本
 */

const fs = require('fs')
const path = require('path')

console.log('🔍 检查 commitlint 配置...\n')

// 1. 检查配置文件是否存在
const configPath = path.join(__dirname, 'commitlint.config.js')
if (!fs.existsSync(configPath)) {
  console.error('❌ commitlint.config.js 文件不存在')
  process.exit(1)
}
console.log('✅ commitlint.config.js 文件存在')

// 2. 检查配置文件格式
try {
  const config = require(configPath)
  console.log('✅ commitlint.config.js 格式正确')

  // 3. 检查必要的配置项
  if (config.extends && Array.isArray(config.extends)) {
    console.log(`✅ extends 配置: ${config.extends.join(', ')}`)
  }

  if (config.rules) {
    console.log('✅ rules 配置存在')

    // 检查 type-enum 规则
    if (config.rules['type-enum']) {
      const types = config.rules['type-enum'][2]
      console.log(`✅ 支持的 type 类型: ${types.join(', ')}`)
    }
  }
} catch (error) {
  console.error('❌ commitlint.config.js 格式错误:', error.message)
  process.exit(1)
}

// 4. 检查 husky hook
const huskyCommitMsgPath = path.join(__dirname, '.husky', 'commit-msg')
if (fs.existsSync(huskyCommitMsgPath)) {
  console.log('✅ .husky/commit-msg hook 存在')

  const hookContent = fs.readFileSync(huskyCommitMsgPath, 'utf-8')
  if (hookContent.includes('commitlint')) {
    console.log('✅ commit-msg hook 包含 commitlint 调用')
  } else {
    console.warn('⚠️  commit-msg hook 可能未正确配置')
  }
} else {
  console.warn('⚠️  .husky/commit-msg hook 不存在')
}

console.log('\n📝 测试用例说明：')
console.log('\n❌ 不规范的 commit 信息（应该被拦截）：')
console.log('   git commit -m "test commit"')
console.log('   git commit -m "FEAT: add feature"')
console.log('   git commit -m "feat:"')
console.log('   git commit -m "feat: add feature."')
console.log('   git commit -m "update: something"')

console.log('\n✅ 规范的 commit 信息（应该通过）：')
console.log('   git commit -m "feat: add new feature"')
console.log('   git commit -m "fix(cli): resolve bug"')
console.log('   git commit -m "docs: update readme"')

console.log('\n⚠️  注意：由于当前 Node 版本为 14.21.3，')
console.log('   @commitlint/cli@20.x 需要 Node 16.9.0+。')
console.log('   要完整测试功能，请升级 Node 版本或降级 commitlint。\n')
