import { initQuestions } from '@/questions/init-questions'

/**
 * URL 验证正则表达式
 * 支持 http/https 协议，验证域名格式
 */
const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/

/**
 * 校验 URL 是否合法
 * @param url - 待校验的 URL 地址
 * @returns 返回合法的 URL（确保以 / 结尾）
 */
export const checkReplaceUrl = async (url: string): Promise<string> => {
  // 去除首尾空格
  const trimmedUrl = url.trim()

  if (!trimmedUrl) {
    const { replaceUrl } = await initQuestions(['replaceUrl'])
    return ensureTrailingSlash(replaceUrl)
  }

  // 确保 URL 以 / 结尾
  const normalizedUrl = ensureTrailingSlash(trimmedUrl)

  // 验证 URL 格式
  if (!URL_REGEX.test(normalizedUrl)) {
    const { replaceUrl } = await initQuestions(['replaceUrl'])
    return ensureTrailingSlash(replaceUrl)
  }

  return normalizedUrl
}

/**
 * 确保 URL 以 / 结尾
 * @param url - URL 地址
 * @returns 以 / 结尾的 URL
 */
const ensureTrailingSlash = (url: string): string => {
  return url.endsWith('/') ? url : `${url}/`
}
