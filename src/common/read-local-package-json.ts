import { readFileSync, existsSync } from 'fs'
import { join, resolve, dirname } from 'path'

/**
 * package.json 的类型定义
 */
interface PackageJson {
  name: string
  version: string
  description?: string
  bin?: string | Record<string, string>
  engines?: {
    node?: string
    [key: string]: string | undefined
  }
  [key: string]: unknown
}

/**
 * 查找项目根目录的 package.json 文件
 * 从当前文件位置或工作目录向上查找，直到找到 package.json
 * @returns package.json 的完整路径
 * @throws {Error} 当无法找到 package.json 时抛出错误
 */
function findPackageJson(): string {
  // 尝试多个起始路径
  const startPaths = [
    __dirname, // 当前文件所在目录
    process.cwd(), // 当前工作目录（测试环境通常是项目根目录）
  ]

  for (const startPath of startPaths) {
    let currentPath = resolve(startPath)
    const rootPath = resolve('/')

    // 向上查找直到根目录
    while (currentPath !== rootPath) {
      const packagePath = join(currentPath, 'package.json')
      if (existsSync(packagePath)) {
        return packagePath
      }
      // 移动到父目录
      const parentPath = dirname(currentPath)
      if (parentPath === currentPath) {
        break // 已到达根目录
      }
      currentPath = parentPath
    }
  }

  throw new Error('无法找到 package.json 文件')
}

/**
 * 读取 package.json 文件
 * @returns PackageJson 对象
 * @throws {Error} 当无法读取或解析 package.json 时抛出错误
 */
function readPackageJson(): PackageJson {
  try {
    const packagePath = findPackageJson()
    const content = readFileSync(packagePath, 'utf-8')
    return JSON.parse(content) as PackageJson
  } catch (error) {
    throw new Error(
      `无法读取 package.json: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

/**
 * 从 package.json 中获取指定属性
 * @template K - 要获取的属性键名
 * @param keys - 要获取的属性键名数组
 * @returns 包含指定属性的对象
 * @throws {Error} 当无法读取 package.json 时抛出错误
 */
export function readLocalPackageJson<K extends keyof PackageJson>(
  keys?: K[]
): Pick<PackageJson, K> {
  try {
    const packageJson = readPackageJson()

    if (!keys?.length) {
      return packageJson as Pick<PackageJson, K>
    }

    return keys.reduce(
      (result, key) => {
        if (key in packageJson) {
          result[key] = packageJson[key]
        }
        return result
      },
      {} as Pick<PackageJson, K>
    )
  } catch (error) {
    throw new Error(
      `读取 package.json 失败: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}
