// 这里用到一个很实用的 npm 模块，用以在同一行打印文本
import slog from 'single-line-log';

// 封装的 ProgressBar 工具
const progressBar = function (description, barLength): void {
  // 两个基本参数(属性)
  this.description = description || 'Progress'; // 命令行开头的文字信息
  this.length = barLength || 25; // 进度条的长度(单位：字符)，默认设为 25
  // 刷新进度条图案、文字的方法
  this.render = function (opts) {
    const percent = Number((opts.completed / opts.total).toFixed(4)); // 计算进度(子任务的 完成数 除以 总数)
    const cellNum = Math.floor(percent * this.length); // 计算需要多少个 █ 符号来拼凑图案

    // 拼接黑色条
    let cell = '';
    for (var i = 0; i < cellNum; i++) {
      cell += '█';
    }

    // 拼接灰色条
    let empty = '';
    for (let i = 0; i < this.length - cellNum; i++) {
      empty += '░';
    }

    // 拼接最终文本
    const cmdText =
      this.description +
      ': ' +
      (100 * percent).toFixed(2) +
      '% ' +
      cell +
      empty +
      ' ' +
      opts.completed +
      '/' +
      opts.total;

    // 在单行输出文本
    slog.stdout(cmdText);
  };
};

export { progressBar };
