<p align="center">
  <a href="https://remirror.io"><img width="300" height="300" src="https://raw.githubusercontent.com/remirror/remirror/next/support/assets/logo-animated-light.svg?sanitize=true" alt="animated remirror logo" /></a>
</p>

<p align="center">
  A <em>toolkit</em> for building <em>cross-platform</em> text editors
  <br />in the <em>framework</em> of your choice.
</p>

<br />

<p align="center">
  <a href="#motivation"><strong>Motivation</strong></a> ·
  <a href="#status"><strong>Status</strong></a> ·
  <a href="https://remirror.io/docs"><strong>Documentation</strong></a> ·
  <a href="https://remirror.io/playground"><strong>Playground</strong></a> ·
  <a href="https://remirror.io/docs/contributing"><strong>Contributing</strong></a>
</p>

<br />

<p align="center">
  <a href="https://unpkg.com/@remirror/core/dist/core.browser.esm.js">
    <img src="https://img.shields.io/bundlephobia/minzip/@remirror/core/next" alt="Bundled sized of core [getJSON]brary" title="@remirror/core bundle size">
  </a>
  <a href="https://github.com/remirror/remirror/actions?query=workflow:ci">
    <img src="https://github.com/remirror/remirror/workflows/ci/badge.svg?branch=next" alt="Continuous integration badge for automatic releases" title="GitHub Actions CI Badge" />
  </a>
  <a href="https://github.com/remirror/remirror/actions?query=workflow:docs">
    <img src="https://github.com/remirror/remirror/workflows/docs/badge.svg?branch=next" alt="Continuous integration badge for docs deployment" title="Docs Deployment CI Badge" />
  </a>
  <a href="https://codeclimate.com/github/remirror/remirror/maintainability">
    <img src="https://api.codeclimate.com/v1/badges/f4d8dcd5c2228524a53a/maintainability" alt="Project maintainability provided by CodeClimate" title="Maintainability score"/>
  </a>
  <a href="https://codeclimate.com/github/remirror/remirror/test_coverage">
    <img src="https://api.codeclimate.com/v1/badges/f4d8dcd5c2228524a53a/test_coverage" alt="Unit test coverage for the codebase" title="Code coverage" />
  </a>
  <a href="https://remirror.io/chat">
    <img alt="Discord" src="https://img.shields.io/discord/726035064831344711" alt="Join our discord server" title="Discord server link" />
  </a>
  <a href="./packages/remirror/package.json">
    <img src="https://img.shields.io/npm/v/remirror/next?style=flat">
  </a>
</p>

<br />

## Introduction

```tsx
import React from 'react';
import { BoldExtension, ItalicExtension, UnderlineExtension } from 'remirror/extensions';
import { Remirror, useRemirror } from '@remirror/react';

const extensions = () => [new BoldExtension(), new ItalicExtension(), new UnderlineExtension()];

const Editor = () => {
  const { manager, onChange, state } = useRemirror({
    extensions,
    content: '<p>Hi <strong>Friend</strong></p>',
    stringHandler: 'html',
    selection: 'end',
  });

  return <Remirror onChange={onChange} manager={manager} state={state} />;
};
```

With this code snippet your editor now supports basic editing functionality.

<br />

## Installation

```bash
yarn add remirror @remirror/react # Yarn

npm install remirror @remirror/react # npm

pnpm add remirror @remirror/react # pnpm
```

If you run into any issues we recommend any of the following:

- Open an issue in our [github repo](https://github.com/remirror/remirror/issues).
- [Join our discord server](https://remirror.io/chat) and discuss the problem with our community.
- Create a pull request with your proposed improvement by clicking the edit button on the relevant page.

Whatever you decide thanks for taking the time to explore the **remirror** project.

<br />

## Documentation

View our documentation website [**here**][introduction].

- [Introduction]
- [Create an editor](https://remirror.io/docs/guide/create-editor)
- [Extensions](https://remirror.io/docs/concepts/extension)

<br />

## Features

- A11y focused and ARIA compatible.
- I18n support via [lingui](https://github.com/lingui/js-lingui).
- Collaborative editing with [yjs](https://github.com/yjs/yjs).
- 30+ extensions for creating fully customized editing experiences.
- Zero configuration support for **Server Side Rendering (SSR)**.
- Cross platform and cross-framework, with an Angular solution coming later this year.

<br />

## Prerequisites

- [Typescript](https://www.typescriptlang.org/) `>= 4`
- [pnpm](https://pnpm.js.org/en/installation) `>= 5.5`

<br />

## Getting Started

To add an editor to your codebase, first install the required dependencies. Make sure to include the `` tag so that the correct version is installed.

```bash
# yarn
yarn add remirror

# pnpm
pnpm add remirror

# npm
npm install remirror
```

## Usage

Once installed you will be able to add the following code which creates an editor with the bold extension active. Clicking the button when text is selected will toggle between bold.

```tsx
import React, { useCallback } from 'react';
import { BoldExtension } from 'remirror/extensions';
import {
  EditorComponent,
  Remirror,
  useActive,
  useCommands,
  useHelpers,
  useKeymap,
  useRemirror,
} from '@remirror/react';

const Button = () => {
  // `autoUpdate` means that every editor update will recalculate the output
  // from `active.bold()` and keep the bold status up to date in the editor.
  const { bold } = useActive();

  return (
    <>
      <button
        onClick={() => commands.toggleBold()}
        style={{ fontWeight: bold() ? 'bold' : undefined }}
      >
        Bold
      </button>
    </>
  );
};

// Hooks can be added to the context without the need for creating custom components
const hooks = [
  () => {
    const { getJSON } = useHelpers();

    const onSave = useCallback(
      (props) => {
        const { state } = props;
        saveToBackend(getJSON(state));

        return true; // Prevents any further key handlers from being run.
      },
      [getJSON],
    );

    useKeymap('Mod-s', onSave);
  },
];

const Editor = () => {
  const { manager, state } = useRemirror({ extensions: () => [new BoldExtension()] });

  // The editor is built up like lego blocks of functionality within the editor
  // provider.
  return (
    <Remirror manager={manager} initialContent={state} hooks={hooks}>
      <Button />
      <EditorComponent />
    </Remirror>
  );
};
```

<br />

## Contributing

Please read our [contribution guide] for details on our code of conduct, and the process for submitting pull requests. It also outlines the project structure so you can find help when navigating your way around the codebase.

In addition each folder in this codebase includes a readme describing why it exists.

You might also notice there are surprisingly few files in the root directory of this project. All the configuration files have been moved to the `support/root` directory and are symlinked to the root directory in a `preinstall` hook. For more information take a look at [folder](support/root) and [readme](support/root/readme.md).

Finally you can keep track on what's being worked on via the [projects].

<br />

## Versioning

This project uses [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/remirror/remirror/tags).

<br />

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

[introduction]: https://remirror.io/docs
[contribution guide]: https://remirror.io/docs/contributing
[projects]: https://remirror.io/projects
[installation]: https://remirror.io/docs/installation
[typescript]: https://github.com/microsoft/Typescript
[react]: https://github.com/facebook/react
[prosemirror]: https://prosemirror.net
