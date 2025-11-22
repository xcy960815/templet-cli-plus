#!/usr/bin/env node

/**
 * 检查包管理器，确保使用 pnpm
 * 如果检测到使用 npm 或 yarn，会显示错误并退出
 */

const { execSync } = require('child_process')
const path = require('path')

// 获取包管理器信息
function getPackageManager() {
  // 方法1: 检查 npm_execpath 环境变量（最可靠）
  const execPath = process.env.npm_execpath || ''

  if (execPath) {
    if (execPath.includes('pnpm')) {
      return 'pnpm'
    }
    if (execPath.includes('yarn')) {
      return 'yarn'
    }
    if (execPath.includes('npm')) {
      return 'npm'
    }
  }

  // 方法2: 检查用户代理
  const userAgent = process.env.npm_config_user_agent || ''
  if (userAgent) {
    if (userAgent.includes('pnpm')) {
      return 'pnpm'
    }
    if (userAgent.includes('yarn')) {
      return 'yarn'
    }
    if (userAgent.includes('npm')) {
      return 'npm'
    }
  }

  // 方法3: 检查 _ 环境变量（包含调用命令的路径）
  const commandPath = process.env._ || ''
  if (commandPath) {
    const basename = path.basename(commandPath).toLowerCase()
    if (basename === 'pnpm' || basename.includes('pnpm')) {
      return 'pnpm'
    }
    if (basename === 'yarn' || basename.includes('yarn')) {
      return 'yarn'
    }
    if (basename === 'npm' || basename.includes('npm')) {
      return 'npm'
    }
  }

  // 方法4: 检查进程命令行参数（通过检查父进程）
  try {
    // 在某些系统上，可以通过检查进程树来检测
    const platform = process.platform
    if (platform === 'darwin' || platform === 'linux') {
      try {
        const ppid = process.ppid
        const cmd = execSync(
          `ps -p ${ppid} -o command= 2>/dev/null || ps -p ${ppid} -o args= 2>/dev/null`,
          {
            encoding: 'utf8',
            timeout: 1000,
          }
        ).trim()

        if (cmd.includes('pnpm')) {
          return 'pnpm'
        }
        if (cmd.includes('yarn')) {
          return 'yarn'
        }
        if (cmd.includes('npm')) {
          return 'npm'
        }
      } catch (e) {
        // 忽略错误，继续其他检测方法
      }
    }
  } catch (e) {
    // 忽略错误
  }

  return 'unknown'
}

// 主函数
function main() {
  const pm = getPackageManager()

  if (pm === 'pnpm') {
    // 使用 pnpm，允许继续
    return
  }

  if (pm === 'npm' || pm === 'yarn') {
    console.error('\n')
    console.error('\x1b[31m%s\x1b[0m', '❌ 错误: 此项目必须使用 pnpm 作为包管理器')
    console.error('\n')
    console.error('\x1b[33m%s\x1b[0m', '请使用以下命令:')
    console.error('  pnpm install     # 安装依赖')
    console.error('  pnpm run dev     # 启动开发')
    console.error('  pnpm run build   # 构建项目')
    console.error('\n')
    console.error('\x1b[36m%s\x1b[0m', '安装 pnpm:')
    console.error('  npm install -g pnpm')
    console.error('\n')
    process.exit(1)
  }

  // 如果无法检测，给出警告但允许继续（开发环境可能无法检测）
  if (pm === 'unknown') {
    console.warn('\x1b[33m%s\x1b[0m', '⚠️  警告: 无法检测包管理器，请确保使用 pnpm')
  }
}

main()
