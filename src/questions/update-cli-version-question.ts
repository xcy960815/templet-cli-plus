import { readLocalPackageJson } from '@/common/read-local-packagejson';
interface IUpdateCliVersionQuestion {
  type: 'confirm';
  name: 'updateCliVersion';
  message: string;
}

/**
 * @description 更新cli版本问题
 * @returns {IUpdateCliVersionQuestion}
 */
const updateCliVersionQuestion = function (): IUpdateCliVersionQuestion {
  const { name } = readLocalPackageJson(['name']);
  return {
    type: 'confirm',
    name: 'updateCliVersion',
    message: `Do you want to update the ${name}?`,
  };
};

export { updateCliVersionQuestion };
