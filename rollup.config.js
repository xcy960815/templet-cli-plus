import typescript from 'rollup-plugin-typescript2'
import { terser } from 'rollup-plugin-terser'
import { nodeResolve } from '@rollup/plugin-node-resolve' //将外部引入的js打包进来
import babel from 'rollup-plugin-babel'
import commonjs from '@rollup/plugin-commonjs' // 将CommonJS模块转换为ES6, 方便rollup直接调用
import json from '@rollup/plugin-json'
import replace from '@rollup/plugin-replace'
import pkg from './package.json'

const isProduction = process.env.NODE_ENV === 'production'

export default {
  input: './src/index.ts',
  output: [
    {
      format: 'cjs',
      file: 'bin/index.cjs.js',
      banner: '#!/usr/bin/env node',
      globals: {
        chalk: 'chalk',
        commander: 'commander',
        fs: 'fs',
        path: 'path',
        util: 'util',

        request: 'request',
        ora: 'ora',
        'cli-table3': 'cli-table3',

        'git-clone/promise': 'git-clone/promise',
        // execa 被打包进来，不需要 globals
        // execa: 'execa',
      },
    },
  ],
  plugins: [
    nodeResolve({
      preferBuiltins: true,
      alias: {
        '@': './src',
      },
    }),
    commonjs({
      include: 'node_modules/**',
    }),
    isProduction && terser(),
    babel({
      exclude: 'node_modules/**',
    }),
    // 热更新
    // !isProduction && livereload(),
    typescript({
      exclude: 'node_modules/**',
      useTsconfigDeclarationDir: true,
      extensions: ['.js', '.ts', '.tsx'],
    }),
    json(),
    replace({
      preventAssignment: true,
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
  ],
  onwarn(warning) {
    if (warning.code !== 'CIRCULAR_DEPENDENCY') {
      console.error(`(!) ${warning.message}`)
    }
  },

  // 将package.json中的 peerDependencies 作为外部依赖
  // 注意：execa 需要被打包进来，因为它是 ES 模块，在 CommonJS 环境中需要特殊处理
  external: [
    // Node.js 内置模块
    'path',
    'os',
    'fs',
    'util',
    'child_process',
    'assert',
    'events',
    'stream',
    'buffer',

    // 第三方依赖
    'chalk',
    'request',
    'ora',
    'cli-table3',
    'git-clone/promise',
  ].concat(Object.keys(pkg.peerDependencies || {}).filter((dep) => dep !== 'execa')),
}
