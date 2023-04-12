import chalk from 'chalk';
import Table from 'cli-table3';
import wordWrap from 'word-wrap';
import { TextEncoder } from 'util';
const encoder = new TextEncoder();
const chalkColor = [
  'black',
  'red',
  'green',
  'yellow',
  'blue',
  'magenta',
  'cyan',
  'white',
  'gray',
  'grey',
  'blackBright',
  'redBright',
  'greenBright',
  'yellowBright',
  'blueBright',
  'magentaBright',
  'cyanBright',
  'whiteBright',
  // 'bgBlack',
  // 'bgRed',
  // 'bgGreen',
  // 'bgYellow',
  // 'bgBlue',
  // 'bgMagenta',
  // 'bgCyan',
  // 'bgWhite',
  // 'bgBlackBright',
  // 'bgRedBright',
  // 'bgGreenBright',
  // 'bgYellowBright',
  // 'bgBlueBright',
  // 'bgMagentaBright',
  // 'bgCyanBright',
  // 'bgWhiteBright',
];

function getTextWidth(text: string, font: number = 1): number {
  const buffer = encoder.encode(text);
  const length = buffer.length;
  let width = 0;
  for (let i = 0; i < length; i++) {
    const byte = buffer[i];
    if (byte <= 0x7f || byte >= 0xc0) {
      width++;
    } else {
      width += 0.5;
    }
  }
  return width * font;
}
/**
 * @desc 循环输出 从网上查询的模板列表
 * @param {Record<string, string>} tableBody
 * @returns {Promise<void>}
 */
export const printAsTable = async function (
  tableBody: Record<string, string>,
  tableHeader: Array<string>,
): Promise<void> {
  // 获取终端的宽度
  const terminalWidth = process.stdout.columns;
  const templateNames = Object.keys(tableBody);
  const templateValues = Object.values(tableBody);
  // 英文的最大长度
  const nameMaxLength = templateNames.reduce((previousValue, templateName) => {
    const width = getTextWidth(templateName);
    if (width >= previousValue) {
      return width;
    } else {
      return previousValue;
    }
  }, 0);
  // 中文的最大长度
  const valueMaxLength = templateValues.reduce((previousValue, templateValue) => {
    const width = getTextWidth(templateValue);
    if (width >= previousValue) {
      return width;
    } else {
      return previousValue;
    }
  }, 0);
  // 计算出英文和中文的比例
  const nameRatio = nameMaxLength / (nameMaxLength + valueMaxLength);
  const nameWidth = Math.floor((terminalWidth - 10) * nameRatio);

  const valueWidth = Math.floor((terminalWidth - 10) * (1 - nameRatio));
  // 创建一个新的表格实例
  const table = new Table({
    head: tableHeader, // 表头
    colWidths: [nameWidth + 1, valueWidth], // 列宽
  });

  for (const key in tableBody) {
    // 随机获取 chalkColorArray 中的颜色
    const randomColor = chalk[chalkColor[Math.floor(Math.random() * chalkColor.length)]];
    // 模板名称
    const name = wordWrap(key, { width: nameWidth, cut: true })
      .split('\n')
      .map((line) => randomColor(line))
      .join('\n');
    // 模板描述
    const desc = wordWrap(tableBody[key], { width: valueWidth, cut: true })
      .split('\n')
      .map((line) => randomColor(line))
      .join('\n');
    table.push([name, desc]);
  }
  // 输出表格到控制台
  console.log(table.toString());
};
