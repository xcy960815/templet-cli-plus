import os from 'os';

/**
 * @desc 获取当前系统用户名称
 * @returns {name:当前系统用户名称}
 */
const getUserInfo = (): { username: string } => {
  // 获取当前用户
  const { username } = os.userInfo();
  return { username };
};

export { getUserInfo };
