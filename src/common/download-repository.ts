// import downloadUrl from 'download';
// import gitclone from 'git-clone/promise';
// import rm from 'rimraf';

// /**
//  * @desc 仓库选项
//  */
// interface IRepositoryOptions {
//   type: string;
//   origin?: string | null;
//   owner?: string | null;
//   name?: string;
//   checkout?: string;
//   url?: string;
// }

// interface IOptions {
//   clone?: boolean;
// }
// /**
//  * @desc 下载仓库
//  * @param {string} repository
//  * @param {string} dest
//  * @param {IOptions} options
//  */

// export const downloadRepositorie = async (
//   repositoryPath: string,
//   dest: string,
//   options?: IOptions,
// ): Promise<void> => {
//   const clone = options && options.clone ? options.clone : false;
//   const repositoryOptions: IRepositoryOptions = getRepositoryOptions(repositoryPath);
//   console.log('repositoryOptions', repositoryOptions);
//   const url = repositoryOptions.url || getUrl(repositoryOptions, clone);
//   const shallow = repositoryOptions.checkout === 'master';
//   if (clone) {
//     const result = await gitclone(url, dest, {
//       checkout: repositoryOptions.checkout,
//       shallow,
//     }).catch((error) => error);
//     console.log('result', result);
//   } else {
//     console.log('进入到downloadUrl中...');
//     const result = await downloadUrl(url, dest, {
//       extract: true,
//       strip: 1,
//       mode: '666',
//       headers: { accept: 'application/zip' },
//     }).catch((error) => error);
//     console.log('result', result);
//   }
// };

// /**
//  * @desc 解析仓库地址
//  * @param {string} repositoryPath
//  * @return {IRepositoryOptions}
//  */
// function getRepositoryOptions(repositoryPath: string): IRepositoryOptions {
//   //  如果开头是direct:，则直接下载
//   const startWidthDirectMatch = /^(?:(direct):([^#]+)(?:#(.+))?)$/.exec(repositoryPath);
//   if (startWidthDirectMatch) {
//     const url = startWidthDirectMatch[2];
//     const checkout = startWidthDirectMatch[3] || 'master';
//     return {
//       type: 'direct',
//       url: url,
//       checkout: checkout,
//     };
//   } else {
//     const startNotWidthDirectMatch =
//       /^(?:(github|gitlab|bitbucket|gitee):)?(?:(.+):)?([^\/]+)\/([^#]+)(?:#(.+))?$/.exec(
//         repositoryPath,
//       )!;
//     const type = startNotWidthDirectMatch[1];
//     let origin = startNotWidthDirectMatch[2];
//     const owner = startNotWidthDirectMatch[3];
//     const name = startNotWidthDirectMatch[4];
//     const checkout = startNotWidthDirectMatch[5] || 'master';

//     if (origin == null) {
//       if (type === 'github') origin = 'github.com';
//       else if (type === 'gitee') origin = 'gitee.com';
//       else if (type === 'gitlab') origin = 'gitlab.com';
//       else if (type === 'bitbucket') origin = 'bitbucket.com';
//     }

//     return {
//       type: type,
//       origin: origin,
//       owner: owner,
//       name: name,
//       checkout: checkout,
//     };
//   }
// }

// /**
//  * @desc 添加协议
//  * @param {String} url
//  * @return {String}
//  */
// function addProtocol(repositoryOptions: IRepositoryOptions, clone: boolean): string {
//   let origin = repositoryOptions.origin!;
//   if (!/^(f|ht)tps?:\/\//i.test(origin)) {
//     if (clone)
//       if (repositoryOptions.type == 'gitee') {
//         origin = 'https://' + origin;
//       } else {
//         origin = 'git@' + origin;
//       }
//     else {
//       origin = 'https://' + origin;
//     }
//   }
//   return origin;
// }

// /**
//  * @desc Return a zip or git url for a given `repositoryOptions`.
//  * @param {IRepositoryOptions} repositoryOptions
//  * @return {String}
//  */
// function getUrl(repositoryOptions: IRepositoryOptions, clone: boolean): string {
//   let url;
//   // 使用协议获取来源并添加尾部斜杠或冒号（对于 ssh）
//   let origin = addProtocol(repositoryOptions, clone);
//   if (/^git\@/i.test(origin)) {
//     origin = origin + ':';
//   } else {
//     origin = origin + '/';
//   }
//   // 构建 url
//   if (clone) {
//     url = origin + repositoryOptions.owner + '/' + repositoryOptions.name + '.git';
//   } else {
//     if (repositoryOptions.type === 'github')
//       url = `${origin}${repositoryOptions.owner}/${repositoryOptions.name}/archive/${repositoryOptions.checkout}.zip`;
//     else if (repositoryOptions.type === 'gitee')
//       url = `${origin}${repositoryOptions.owner}/${repositoryOptions.name}/repository/archive/${repositoryOptions.checkout}.zip`;
//     else if (repositoryOptions.type === 'gitlab')
//       url = `${origin}${repositoryOptions.owner}/${repositoryOptions.name}/repository/archive.zip?ref=${repositoryOptions.checkout}`;
//     else if (repositoryOptions.type === 'bitbucket')
//       url = `${origin}${repositoryOptions.owner}/${repositoryOptions.name}/get/${repositoryOptions.checkout}.zip`;
//   }

//   return url;
// }
