const { SKIP_STORIES } = process.env;

const ignore = [
  '**/__tests__',
  '**/__mocks__',
  '**/__fixtures__',
  ...(SKIP_STORIES ? ['**/__stories__'] : []),
  '*.{test,spec}.{ts,tsx}',
  '**/*.d.ts',
  '*.d.ts',
];

const basePreset = ['@babel/preset-typescript', '@babel/preset-react'];

const presets = [['@babel/preset-env'], ...basePreset];

const testBabelPresetEnv = ['@babel/preset-env', { targets: { node: '8' } }];
const nonTestEnv = { ignore, presets };

module.exports = {
  presets: [testBabelPresetEnv, ...basePreset],
  plugins: [
    // Required for the compilation of abstract classes
    '@babel/plugin-transform-typescript',
    ['@babel/plugin-transform-runtime'],
    ['@babel/plugin-proposal-class-properties'],
    ['@babel/plugin-proposal-object-rest-spread'],
    '@babel/plugin-syntax-dynamic-import',
  ],
  env: { production: nonTestEnv, development: nonTestEnv },
};
