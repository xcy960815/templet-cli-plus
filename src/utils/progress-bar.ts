import slog from 'single-line-log'

type ProgressBarOptions = {
  description?: string
  barLength?: number
}

class ProgressBar {
  private description: string
  private length: number

  constructor({ description = 'Progress', barLength = 25 }: ProgressBarOptions = {}) {
    this.description = description
    this.length = barLength
  }

  render = ({ completed, total }: { completed: number; total: number }): void => {
    const percent = Number((completed / total).toFixed(4))
    const cellNum = Math.floor(percent * this.length)

    const cell = '█'.repeat(cellNum)
    const empty = '░'.repeat(this.length - cellNum)

    const cmdText = `${this.description}: ${(100 * percent).toFixed(
      2
    )}% ${cell}${empty} ${completed}/${total}`

    slog.stdout(cmdText)
  }
}

export { ProgressBar }
