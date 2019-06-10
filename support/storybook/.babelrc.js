const baseBabel = require('../babel/base.babel');
const { resolve } = require('path');

const moduleResolver = [
  'module-resolver',
  {
    alias: {
      '@remirror/core': '../../@remirror/core/src',
      '@remirror/core-extensions': '../../@remirror/core-extensions/src',
      '@remirror/extension-emoji': '../../@remirror/extension-emoji/src',
      '@remirror/extension-enhanced-link': '../../@remirror/extension-enhanced-link/src',
      '@remirror/extension-epic-mode': '../../@remirror/extension-epic-mode/src',
      '@remirror/extension-mention': '../../@remirror/extension-mention/src',
      '@remirror/react': '../../@remirror/react/src',
      '@remirror/react-utils': '../../@remirror/react-utils/src',
      '@remirror/react-ssr': '../../@remirror/react-ssr/src',
      '@remirror/renderer-react': '../../@remirror/renderer-react/src',
      '@remirror/showcase': '../../@remirror/showcase/src',
      '@remirror/ui-twitter': '../../@remirror/ui-twitter/src',
      '@remirror/ui-wysiwyg': '../../@remirror/ui-wysiwyg/src',
      remirror: '../../packages/remirror/src',
    },
    cwd: resolve(__dirname),
  },
];

module.exports = {
  ...baseBabel,
  plugins: [...baseBabel.plugins, moduleResolver],
};
