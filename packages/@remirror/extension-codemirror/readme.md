# @remirror/extension-codemirror

> Add [CodeMirror](https://codemirror.net/) to your editor.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

[version]: https://flat.badgen.net/npm/v/@remirror/extension-codemirror/next
[npm]: https://npmjs.com/package/@remirror/extension-codemirror/v/next
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/extension-codemirror@next
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/extension-codemirror@next
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/extension-codemirror/red?icon=npm

## Installation

```bash
yarn add @remirror/extension-codemirror@next @remirror/pm@next # yarn
pnpm add @remirror/extension-codemirror@next @remirror/pm@next # pnpm
npm install @remirror/extension-codemirror@next @remirror/pm@next # npm
```

## Usage

The following code sample will create a limited editor and run the available commands from this extension.

```ts
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/yaml/yaml';

import { RemirrorManager } from 'remirror/core';
import { CorePreset } from 'remirror/preset/core';

import { CodeMirrorExtension } from '@remirror/extension-codemirror';

// Create the codeMirror extension
const codeMirrorExtension = new CodeMirrorExtension();
const corePreset = new CorePreset();

// Create the Editor Manager with the codeMirror extension passed through.
const manager = RemirrorManager.create([codeMirrorExtension, corePreset]);

// Pass the dom element to the editor. If you are using `@remirror/react` or
// other framework wrappers then this is handled for you.
const element = document.createElement('div');
document.body.append(element);

// Add the view to the editor manager.
manager.addView(element);

// Access the codeMirror commands
manager.store.commands.createCodeMirror({ language: 'yaml' });

// Update the codeMirror
manager.store.chain
  .updateCodeBlock({ language: 'js', codeMirrorConfig: { lineNumbers: true } })
  .run();
```
