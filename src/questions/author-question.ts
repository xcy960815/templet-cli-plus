import { getUserInfo } from '../utils/get-user-info';

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
const authorQuestion = function (): IAuthorQuestion {
  // 获取当前系统用户名称
  const { username } = getUserInfo();
  return {
    type: 'input',
    name: 'author',
    default: username,
    message: '请输入项目作者',
  };
};

export { authorQuestion };
