declare module 'semver' {
  export function parse(version: string): SemVer | null;
  export function clean(version: string, options?: Options): string | null;
  export function valid(version: string): string | null;
  export function inc(
    version: string,
    release: ReleaseType,
    optionsOrNum?: Options | number,
    identifier?: string,
  ): string | null;
  export function compare(v1: string, v2: string, loose?: boolean): -1 | 0 | 1;
  export function rcompare(v1: string, v2: string, loose?: boolean): -1 | 0 | 1;
  export function major(version: string): number;
  export function minor(version: string): number;
  export function patch(version: string): number;
  export function prerelease(version: string, options?: Options): (string | number)[];
  export function intersects(
    range1: string | SemVer,
    range2: string | SemVer,
    options?: Options,
  ): boolean;
  export function simplifyRange(range: string | SemVer, options?: Options): string;
  export function gtr(version: string | SemVer, range: string | SemVer, options?: Options): boolean;
  export function ltr(version: string | SemVer, range: string | SemVer, options?: Options): boolean;
  export function outside(
    version: string | SemVer,
    range: string | SemVer,
    hilo?: '>' | '<',
    options?: Options,
  ): boolean;
  export function satisfies(
    version: string | SemVer,
    range: string | SemVer,
    options?: Options,
  ): boolean;
  export class SemVer {
    public major: number;
    public minor: number;
    public patch: number;
    public prerelease: (string | number)[];
    public build: string[];
    constructor(version: string, optionsOrLoose?: boolean | Options);
    public format(): string;
    public inspect(): string;
    public toString(): string;
  }

  export type ReleaseType =
    | 'major'
    | 'premajor'
    | 'minor'
    | 'preminor'
    | 'patch'
    | 'prepatch'
    | 'prerelease';

  export interface Options {
    loose?: boolean;
    includePrerelease?: boolean;
    rangeRequired?: boolean;
    coerce?: boolean;
    rtl?: boolean;
  }
}
