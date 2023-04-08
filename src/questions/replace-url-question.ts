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
    message: `请输入正确的url`,
    validate: function (answer) {
      const urlReg = /^(https?:\/\/)?([\da-z\\.-]+)\.([a-z\\.]{2,6})([\/\w \\.-]*)*\/?$/;
      if (urlReg.test(answer)) {
        return true;
      } else {
        console.log(chalk.redBright(`请输入正确的url`));
        return false;
      }
    },
  };
};
