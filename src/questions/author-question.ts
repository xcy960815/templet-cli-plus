import os from 'os';
interface IAuthorQuestion {
  type: 'input';
  name: 'author';
  default: string;
  message: '请输入项目作者';
}

/**
 * @desc 作者问题
 * @returns {IAuthorQuestion}
 */
export const authorQuestion = function (): IAuthorQuestion {
  // 获取当前系统用户名称
  const { username } = os.userInfo();
  return {
    type: 'input',
    name: 'author',
    default: username,
    message: '请输入项目作者',
  };
};
