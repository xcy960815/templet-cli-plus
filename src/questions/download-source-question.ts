interface DownloadSourceQuestion {
  type: 'list';
  name: 'downloadSource';
  message: '请选择下载源';
  choices: Array<
    | {
        name: string;
        value: string;
      }
    | {
        name: string;
        value: string;
      }
  >;
}

/**
 * @desc 下载源问题 单选框
 * @returns {DownloadSourceQuestion}
 */

const downloadSourceQuestion = function (): DownloadSourceQuestion {
  return {
    type: 'list',
    name: 'downloadSource',
    message: '请选择下载源',
    choices: [
      {
        name: 'github（代码最新，依赖宿主网络环境）',
        value: 'github',
      },
      {
        name: 'gitee（网络最好，但是小概率不是最新代码）',
        value: 'gitee',
      },
    ],
  };
};

export { downloadSourceQuestion };
