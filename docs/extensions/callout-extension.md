---
hide_title: true
title: 'CalloutExtension'
---

import { Example } from '@components';

# `CalloutExtension`

## Summary

This extension adds callouts to your text editor.

## Features

### Classify with semantic types

Not all callouts are the same. For example, a callout could contain an urgent warning to the reader that should stand out brightly. In contrast, a callout might contain an informational note which shouldn't overshadow the other text.

These different use cases can be represented by setting the `type` property to `info`, `warning` , `error`, `success`, or `blank`:

```ts
commands.toggleCallout({ type: 'error' });
```

The extension will use different background colors for each type like red for errors.

### Add custom emoji

The semantic types are too limiting for some use cases - especially "info" callouts could benefit from more, context-specific sub categories like:

![image](https://user-images.githubusercontent.com/9339055/126482400-9fb5b5ad-aaa0-48b5-a4b1-e162b116a027.png)

Context-specific sub categories can be created by configuring an emoji for the callout, additionally to the semantic type:

```ts
import { CalloutExtension } from '@remirror/extension-callout';

const basicExtensions = () => [new CalloutExtension({ renderEmoji, defaultEmoji: '💡' })];

/**
 * If you want to update the emoji to a new one, you can dispatch a transaction to update the `emoji` attrs inside this function.
 */
const renderEmoji = (node: ProsemirrorNode) => {
  const emoji = document.createElement('span');
  emoji.textContent = node.attrs.emoji;
  return emoji;
};
```

## Usage

### Installation

This extension is installed for you when you install the main `remirror` package.

You can use the imports in the following way.

```ts
import { CalloutExtension } from 'remirror/extensions';
```

To install it directly you can use

The extension is provided by the `@remirror/extension-callout` package. There are two ways of pulling it into your project.

### Examples

<Example name="BasicCallout" />

## API

### Options

### Commands

### Helpers
