# @remirror/extension-bidi

> Add automatic bi-directional text support to your remirror editor. Just start typing for the magic.

[![Version][version]][npm] [![Weekly Downloads][downloads-badge]][npm] [![Bundled size][size-badge]][size] [![Typed Codebase][typescript]](#) [![MIT License][license]](#)

[version]: https://flat.badgen.net/npm/v/@remirror/extension-bidi/next
[npm]: https://npmjs.com/package/@remirror/extension-bidi/v/next
[license]: https://flat.badgen.net/badge/license/MIT/purple
[size]: https://bundlephobia.com/result?p=@remirror/extension-bidi@next
[size-badge]: https://flat.badgen.net/bundlephobia/minzip/@remirror/extension-bidi@next
[typescript]: https://flat.badgen.net/badge/icon/TypeScript?icon=typescript&label
[downloads-badge]: https://badgen.net/npm/dw/@remirror/extension-bidi/red?icon=npm

## Installation

```bash
# yarn
yarn add @remirror/extension-bidi@next @remirror/pm@next

# pnpm
pnpm add @remirror/extension-bidi@next @remirror/pm@next

# npm
npm install @remirror/extension-bidi@next @remirror/pm@next
```

This is included by default when you install the recommended `remirror` package. All exports are also available via the entry-point, `remirror/extension/bidi`.

## Usage

This add bidirectional text support to your editor.

The following code creates an instance of this extension.

```ts
import { BidiExtension } from 'remirror/extension/bidi';

const extension = new BidiExtension();
```