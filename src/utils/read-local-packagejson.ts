import pck from '../../package.json';

type PackageOriginalContent = typeof pck & { engines?: { node?: string } };
type TPackageContent<K extends keyof PackageOriginalContent | 'engines'> = {
  [key in K]?: PackageOriginalContent[key]
};

/**
 * @desc 获取package的属性
 * @params {string[]} packageKeys package.json 里面的属性
 * @returns packageKey存在的时候 就返回packageKey 所对应的值 否则 返回全部的package.json的内容
 */

const readLocalPackageJson = <K extends keyof PackageOriginalContent | 'engines'>(
  packageKeys?: Array<K>,
): TPackageContent<K> => {
  const packageContent: TPackageContent<K> = {};
  const originalContent = pck as PackageOriginalContent & {
    engines?: { node: string };
  };
  if (packageKeys && packageKeys.length) {
    packageKeys.forEach(key => {
      if (key === 'engines') {
        packageContent[key] = originalContent[key] as TPackageContent<K>[K];
      } else {
        packageContent[key] = originalContent[key] as PackageOriginalContent[K];
      }
    });
    return packageContent;
  } else {
    return originalContent;
  }
};

export { readLocalPackageJson };
