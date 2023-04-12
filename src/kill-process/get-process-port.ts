import execa from 'execa';
interface IProcessOption {
  processName: string;
  processId: string;
}
/**
 * @desc 获取进程id
 * @param {string} port
 * @returns {Promise<Array<IProcessOption>>}
 */
export const getProcessByPort = async function (port: string): Promise<Array<IProcessOption>> {
  const { stdout } = await execa('lsof', ['-i', `:${port}`], {
    shell: true,
  });
  if (!stdout.trim()) {
    return [];
  }
  const lines = stdout.trim().split(/\n/);

  const processes: IProcessOption[] = [];
  for (let i = 1; i < lines.length; i++) {
    const [pName, pId] = lines[i].split(/\s+/);
    if (pName.includes('node')) {
      processes.push({
        processName: pName,
        processId: pId,
      });
    }
  }
  return processes;
};
