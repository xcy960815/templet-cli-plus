interface IProjectNameQuestion {
  type: 'input';
  name: 'projectName';
  message: '请输入项目名称';
  default: string;
}

/**
 * @desc 项目名称
 * @param {string} projectName
 * @returns {IProjectNameQuestion}
 */
const projectNameQuestion = function (projectName?: string): IProjectNameQuestion {
  projectName = projectName ? projectName : 'project';
  return {
    type: 'input',
    name: 'projectName',
    message: '请输入项目名称',
    default: projectName,
  };
};

export { projectNameQuestion };
