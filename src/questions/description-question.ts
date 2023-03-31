interface IDescriptionQuestion {
  type: 'input';
  name: 'description';
  message: '请输入项目描述';
}

/**
 * @desc 项目描述问题
 * @returns {IDescriptionQuestion}
 */
const descriptionQuestion = function (): IDescriptionQuestion {
  return {
    type: 'input',
    name: 'description',
    message: '请输入项目描述',
  };
};

export { descriptionQuestion };
