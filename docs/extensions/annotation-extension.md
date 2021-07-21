---
hide_title: true
title: AnnotationExtension
---

# `AnnotationExtension`

## Summary

This extension allows to annotate the content in your editor

## Features

## Annotate multiple text nodes

Annotation enrich parts of a document. For example, a user could annotate a sentence as "important" to find it back later on.

Annotations are rendered as [Decorations](https://prosemirror.net/docs/ref/#view.Decorations), these differ from [marks](https://prosemirror.net/docs/ref/#model.Mark) in that they can span across multiple Prosemirror nodes.

Prosemirror stores all content in a [flat sequence of nodes](https://prosemirror.net/docs/guide/#doc). For example, the text "**bold _italic_ bold**" contains 3 different nodes (italic forces a split of the node)

| Text     | Marks            |
| -------- | ---------------- |
| `bold `  | `bold`           |
| `italic` | `bold`, `italic` |
| ` bold`  | `bold`           |

In contrast, one annotation could cover **_multiple_** text nodes with a **_single_** decoration. This is relevant e.g. if you want to show a list of sentences marked as "important" or if you want to allow users to rename the "important" annotation (which otherwise would have to be done in all nodes).

### Overlapping annotations

Annotations can be partially or fully overlapping. For example, a user could annotate the "important" sentence as well with "to be reviewed" or a word in the sentence as "customer X".

The annotation extension provides logic to visualize such overlapping annotations by mixing colors. See storybook for an example.

### Extendable data model

The extension defines only the minimal required fields: position where the annotation starts/ends and an ID. For convince, the annotation provides also the text covered by the annotation.

An app using the annotation-extension can extend the base data model. For example, it could add a label (like "important") or a color to each annotation. The annotation extension will pass these custom fields simply through to the app.

### Collaborative editing (Yjs)

As stated above, Annotations are _decorations_ - these are not part of the Prosemirror document model, they are part of the view. Whilst the model is syncronised between users, the _view_ is not.

To enable collaboration on annotations, additional logic has been added in the [Yjs extension](https://github.com/remirror/remirror/tree/main/packages/remirror__extension-yjs#readme), that modifies _this_ extension's options to utilise a [Yjs Map](https://docs.yjs.dev/api/shared-types/y.map). This is a shared data structure, meaning annotations can also be collaborated on.

This [proof of concept](https://github.com/collaborne/remirror-yjs-webrtc-demo/#readme) has a in-depth description of this approach.

## Usage

### Installation

This extension is installed for you when you install the main `remirror` package.

You can use the imports in the following way.

```ts
import { AnnotationExtension } from 'remirror/extensions';
```

To install it directly you can use

The extension is provided by the `@remirror/extension-annotation` package. There are two ways of pulling it into your project.

### Examples

See storybook for example usage.

## API

### Options

### Commands

### Helpers
