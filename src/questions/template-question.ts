import { getTemplateList } from '../utils/get-template-list';

export interface ITemplateQuestion {
  type: 'list';
  message: '请选择模版版本';
  name: 'templateName';
  choices: Array<{ name: string }>;
}

/**
 * @desc 选择指定版本的问题
 * @returns {Promise<ITemplateQuestion>}
 */
const templateNameQuestion = async function (): Promise<ITemplateQuestion> {
  const templateList = await getTemplateList();
  const choices = Object.keys(templateList).map((name) => ({ name }));
  return {
    type: 'list',
    message: '请选择模版版本',
    name: 'templateName',
    choices,
  };
};
export { templateNameQuestion };
