interface DownloadTypeQuestion {
  type: 'list';
  name: 'downloadType';
  message: '请选择下载方式';
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
 * @desc 下载方式问题 单选框
 * @returns {DownloadTypeQuestion}
 */

const DownloadTypeQuestion = function (): DownloadTypeQuestion {
  return {
    type: 'list',
    name: 'downloadType',
    message: '请选择下载方式',
    choices: [
      {
        name: 'zip',
        value: 'zip',
      },
      {
        name: 'git',
        value: 'git',
      },
    ],
  };
};

export { DownloadTypeQuestion };
