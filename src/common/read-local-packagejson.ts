import pck from '../../package.json'
import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * package.json 的类型定义
 */
interface PackageJson {
  name: string
  version: string
  description?: string
  engines?: {
    node?: string
    [key: string]: string | undefined
  }
  [key: string]: unknown
}

/**
 * 读取 package.json 文件
 * @returns PackageJson 对象
 * @throws {Error} 当无法读取或解析 package.json 时抛出错误
 */
function readPackageJson(): PackageJson {
  try {
    const packagePath = join(__dirname, '../../package.json')
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
