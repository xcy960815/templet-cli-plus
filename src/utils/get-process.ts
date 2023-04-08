import execa from 'execa';

/**
 * @desc 获取进程id
 * @param {string} port
 * @returns {Promise<{processName:string,processId:string}>}
 */
export const getProcess = async function (
  port: string,
): Promise<{ processName: string; processId: string }> {
  const result = await execa.command(`lsof -i :${port}`);
  const [pName, pId] = result.stdout.trim().split(/\n/)[1].split(/\s+/);
  return {
    processName: pName,
    processId: pId,
  };
};