import { getCliVersion } from './get-cli-version';
import { compareCliVersion } from './compare-cli-version';
import { updateCliVersion } from './update-cli-version';

/**
 * @desc 检查脚手架版本号
 * @return {Promise<void>}
 */
export const checkCliVersion = async (): Promise<void> => {
  const { body, statusCode } = (await getCliVersion()).toJSON();
  // 当 statusCode 为 404的时候 说明请求的地址不存在 那就是没发布到npm
  // 所以只判断 statusCode 为 200的时候
  if (statusCode === 200) {
    const parseBody = JSON.parse(body);
    const latestVersion = await compareCliVersion(parseBody);
    if (latestVersion) {
      await updateCliVersion(latestVersion);
    }
  }
};
