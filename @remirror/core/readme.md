<div align="center">
	<br />
	<div>
		<img width="300" src="../../support/assets/logo-icon.svg" alt="remirror" />
    <h1 align="center">core</h1>
	</div>
    <br />
    <br />
    <br />
    <br />
</div>

[![npm bundle size (scoped)](https://img.shields.io/bundlephobia/minzip/@remirror/core.svg?style=for-the-badge)](https://bundlephobia.com/result?p=@remirror/core) [![npm](https://img.shields.io/npm/dm/@remirror/core.svg?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/@remirror/core) [![Dependencies (path)](https://img.shields.io/david/ifiokjr/remirror.svg?logo=npm&path=@remirror%2Fcore&style=for-the-badge)](https://github.com/ifiokjr/remirror/blob/master/@remirror/core/package.json) [![NPM](https://img.shields.io/npm/l/@remirror/core.svg?style=for-the-badge)](https://github.com/ifiokjr/remirror/blob/master/LICENSE) [![GitHub issues by-label](https://img.shields.io/github/issues/ifiokjr/remirror/@remirror/core.svg?label=Open%20Issues&logo=github&style=for-the-badge)](https://github.com/ifiokjr/remirror/issues?utf8=%E2%9C%93&q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3A%40remirror%2Fcore) [![GitHub pull requests by-label](https://img.shields.io/github/issues-pr/ifiokjr/remirror/@remirror/core.svg?label=Open%20Pull%20Requests&logo=github&style=for-the-badge)](https://github.com/ifiokjr/remirror/pulls?utf8=%E2%9C%93&q=is%3Apr+is%3Aopen+sort%3Aupdated-desc+label%3A%40remirror%2Fcore)

This packages provides the core building blocks for the remirror editing experience. It provides the api for extensions and TypeScript types used throughout the other packages.

It should rarely be used independently.

Note that this package itself is framework agnostic and while remirror today is targeted at react users it's possible to widen the scope to `angular`, `vue` and other popular framework libraries.

## Installation

```bash
yarn add @remirror/core
```

## Extensions

Extensions are the building blocks of the editing experience in remirror. They provide behaviour, plugins, [marks](https://prosemirror.net/docs/guide/#schema.marks), and [nodes](https://prosemirror.net/docs/guide/#schema.node_types) as well as configuration at instantiation for any extension.

### Create an extension

Extension can be `Extension`, `MarkExtension` or `NodeExtension`.

- `Extension` Pure extensions only concern themselves with the behaviour of the editor. For example the extension called `History` is a pure extension and it simply tracks all the actions and provides undo and redo commands to your configured editor.
- `MarkExtension` These are used to add extra styling or other information to inline content. Marks are used for adding links to content, bold stying, italic and other changes which affect the content in a simple way.
- `NodeExtension` These add make nodes available to the content of the editor. Examples include [`@remirror/extension-emoji`](../extension-emoji) and [`@remirror/extension-mention`](../extension-mention)

To create an extension extend from the class provided from the core library. The following example is taken from the Strikethrough extension in the [`@remirror/core-extensions`](../core-extensions) library.

```ts
import {
  MarkExtension,
  MarkExtensionSpec,
  markInputRule,
  markPasteRule,
  SchemaMarkTypeParams,
  toggleMark,
} from '@remirror/core';

export class Strike extends MarkExtension {
  get name(): 'strike' {
    return 'strike';
  }

  // This is the prosemirror related schema information
  get schema(): MarkExtensionSpec {
    return {
      parseDOM: [
        {
          tag: 's',
        },
        {
          tag: 'del',
        },
        {
          tag: 'strike',
        },
        {
          style: 'text-decoration',
          getAttrs: value => (value === 'line-through' ? {} : false),
        },
      ],
      toDOM: () => ['s', 0],
    };
  }

  // Defines keymaps for this extension
  public keys({ type }: SchemaMarkTypeParams) {
    return {
      'Mod-d': toggleMark(type),
    };
  }

  // Defines commands that can be used to build menu UI's
  public commands({ type }: SchemaMarkTypeParams) {
    return () => toggleMark(type);
  }

  // Input rules happen as code is being typed
  public inputRules({ type }: SchemaMarkTypeParams) {
    return [markInputRule(/~([^~]+)~$/, type)];
  }

  // Paste rules are activated when code is pasted into the editor
  public pasteRules({ type }: SchemaMarkTypeParams) {
    return [markPasteRule(/~([^~]+)~/g, type)];
  }
}
```

## Extension Manager

The extension manager is used to manage the extensions passed into the editor. It automatically creates the nodes and marks which are used for generating a schema.

```ts
import { ExtensionManager, Doc, Text, Paragraph } from '@remirror/core';
import { Bold, Italic } from '@remirror/core-extensions';

const extensions = [new Doc(), new Text(), new Paragraph(), new Bold(), new Italic()];

console.log(extensions.nodes); // { doc: { ... }, paragraph: { ... }, text: { ... } }
console.log(extension.marks); // { bold: { ... }, italic: { ... } }

// Can also create a schema for you
extensions.createSchema(); // Returns a schema composed of nodes and marks in the extensions provided
```
