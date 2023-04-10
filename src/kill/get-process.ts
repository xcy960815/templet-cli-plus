import execa from 'execa';
interface IProcessOption {
  processName: string;
  processId: string;
}
/**
 * @desc 获取进程id
 * @param {string} port
 * @returns {Promise<IProcessOption>}
 */
export const getProcess = async function (port: string): Promise<IProcessOption> {
  const result = await execa.command(`lsof -i :${port}`);
  const [pName, pId] = result.stdout.trim().split(/\n/)[1].split(/\s+/);
  return {
    processName: pName,
    processId: pId,
  };
};
