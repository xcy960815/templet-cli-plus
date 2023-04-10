import { initQuestions } from '@/questions/init-questions';

/**
 * @desc 校验url 是否合法
 * @param {string} url
 * @returns {Promise<{url:string}>}
 */
export const checkReplaceUrl = async function (url: string): Promise<string> {
  if (!url.endsWith('/')) url = `${url}/`;
  // 校验 一个github地址是否合法的正则表达式
  const urlReg = /^(https?:\/\/)?([\da-z\\.-]+)\.([a-z\\.]{2,6})([\/\w \\.-]*)*\/?$/;
  if (!urlReg.test(url)) {
    const { replaceUrl } = await initQuestions(['replaceUrl']);
    return replaceUrl;
  } else {
    return url;
  }
};
