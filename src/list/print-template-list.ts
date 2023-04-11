import chalk from 'chalk';
import Table from 'cli-table3';
import wordWrap from 'word-wrap';
interface ITemplate {
  desc: string;
  downloadUrl: string;
}

/**
 * @desc 循环输出 从网上查询的模板列表
 * @param {Record<string, ITemplate>} templateList
 * @returns {Promise<void>}
 */
export const printTemplateList = async function (
  templateList: Record<string, ITemplate>,
): Promise<void> {
  // 获取终端的宽度
  const terminalWidth = process.stdout.columns;
  const templateNames = Object.keys(templateList);
  const templateValues = Object.values(templateList).map((item) => item.desc);
  // 英文的最大长度
  const enMaxLength = templateNames.reduce(
    (previousValue, currentValue) =>
      currentValue.length >= previousValue ? currentValue.length : previousValue,
    0,
  );

  // 中文的最大长度
  const cnMaxLength = templateValues.reduce(
    (previousValue, currentValue) =>
      currentValue.length >= previousValue ? currentValue.length : previousValue,
    0,
  );
  // 计算出英文和中文的比例
  const ratio = enMaxLength / cnMaxLength;
  const enWidth = Math.floor((terminalWidth - 10) * ratio);
  const cnWidth = Math.floor((terminalWidth - 10) * (1 - ratio));
  // 创建一个新的表格实例
  const table = new Table({
    head: [chalk.red('模板名称'), chalk.blue('模板描述')], // 表头
    colWidths: [enWidth + 1, cnWidth], // 列宽
  });
  for (const key in templateList) {
    // 模板名称
    const name = wordWrap(key, { width: enWidth, cut: true })
      .split('\n')
      .map((line) => chalk.yellow(line))
      .join('\n');
    // 模板描述
    const desc = wordWrap(templateList[key].desc, { width: cnWidth, cut: true })
      .split('\n')
      .map((line) => chalk.yellow(line))
      .join('\n');

    table.push([name, desc]);
  }
  // 输出表格到控制台
  console.log(table.toString());
};
