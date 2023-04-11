import fs from 'fs';

/**
 * @desc 检查当前路径下面是否存在跟项目重名的文件夹
 * @param {string} projectName
 * @returns {Promise} 返回项目名称
 */
export const checkSameFolder = async function (projectName: string): Promise<boolean> {
  // url 可能是 字符串也可能是 github地址
  if (projectName.includes('http')) {
    projectName = projectName.split('/').pop()?.replace('.git', '') || '';
  }
  // 目录列表
  const folderList = fs.readdirSync('./');
  // 是否存在相同的项目名称
  return folderList.some((name) => name === projectName);
};
