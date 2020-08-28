const ignore = [
  '**/__tests__',
  '**/__dts__',
  '**/__mocks__',
  '**/__fixtures__',
  '*.{test,spec}.{ts,tsx}',
  '**/*.d.ts',
  '*.d.ts',
];

const basePreset = ['@babel/preset-react', 'linaria/babel'];

const presets = [
  ...basePreset,
  ['@babel/preset-env', {}, 'name-added-to-prevent-duplicate-with-linaria-preset'],
];

const testBabelPresetEnv = [
  '@babel/preset-env',
  { targets: { node: '12' } },
  'name-added-to-prevent-duplicate-with-linaria-preset',
];
const nonTestEnv = { ignore, presets };

module.exports = {
  presets: [...basePreset, testBabelPresetEnv],
  overrides: [
    { test: /\.ts$/, plugins: [['@babel/plugin-transform-typescript', { isTSX: false }]] },
    { test: /\.tsx$/, plugins: [['@babel/plugin-transform-typescript', { isTSX: true }]] },
    {
      test: /\.[jt]sx?$/,
      plugins: [
        ['@babel/plugin-proposal-class-properties'],
        ['@babel/plugin-proposal-private-methods'],
      ],
    },
  ],
  plugins: [
    'babel-plugin-macros',
    ['@babel/plugin-transform-runtime', {}, 'name-added-to-prevent-duplicate-with-linaria-preset'],
    ['@babel/plugin-transform-template-literals', {}, 'no-clash'],
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-numeric-separator',
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    'babel-plugin-annotate-pure-calls',
  ],
  env: { production: nonTestEnv, development: nonTestEnv },
};
