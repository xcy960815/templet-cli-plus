import chalk from 'chalk';

interface IReplaceUrlQuestion {
  type: 'input';
  name: string;
  message: string;
  validate: (input: string) => boolean;
}

export const replaceUrlQuestion = function (): IReplaceUrlQuestion {
  return {
    type: 'input',
    name: 'replaceUrl',
    message: chalk.redBright(`请输入正确的github远程地址`),
    validate: function (input: string) {
      const urlReg = /^(https?:\/\/)?([\da-z\\.-]+)\.([a-z\\.]{2,6})([\/\w \\.-]*)*\/?$/;
      if (urlReg.test(input)) {
        return true;
      } else {
        console.log(chalk.redBright(`请输入正确的github远程地址`));
        return false;
      }
    },
  };
};
