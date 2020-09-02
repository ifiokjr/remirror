<p align="center">
  <a href="https://remirror.io"><img width="300" height="300" src="https://raw.githubusercontent.com/remirror/remirror/next/support/assets/logo-animated-light.svg?sanitize=true" alt="animated remirror logo" /></a>
</p>

<p align="center">
  A <em>toolkit</em> for building cross-platform text editors
  <br />in the framework of your choice.
</p>

<br />

<p align="center">
  <a href="#why"><strong>Why?</strong></a> ·
  <a href="#status"><strong>Status</strong></a> ·
  <a href="https://remirror.io/docs"><strong>Documentation</strong></a> ·
  <a href="https://remirror.io/playground"><strong>Playground</strong></a> ·
  <a href="https://remirror.io/docs/contributing"><strong>Contributing</strong></a>
</p>

<br />

<p align="center">
  <a href="https://remirror.io/docs/showcase/social">
    <img src="https://media.githubusercontent.com/media/ifiokjr/assets/master/remirror/repo-banner.gif" title="Editable mentions and emoji being showcased" alt="A gif showing mentions being suggested as the user types with editing supported">
  </a>
</p>

<br />

<p align="center">
  <a href="https://unpkg.com/@remirror/core@next/dist/core.browser.esm.js">
    <img src="https://img.shields.io/bundlephobia/minzip/@remirror/core/next" alt="Bundled sized of core library" title="@remirror/core bundle size">
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

## Why

`remirror` was started as a personal challenge. Would it be possible to build an editor that combined great performance with ease of use? It was also important to give users of all frameworks, the ability to build an editor by picking and choosing their desired building blocks.

In order to meet these goals, [ProseMirror][prosemirror] was picked as the best choice for the core editor layer. The second decision was to base the structure of the editor on blocks of functionality called `Extensions`. Each extension would be designed to fulfil a specific purpose in the editor. Due to this structure, users would be able to craft a fully custom implementation.

In the `next` version of `remirror`, some of these initial goals are starting to be met. Every single part of the editor is controlled by extensions. For example, the core (`Schema`) is managed by a [built-in extension](https://github.com/remirror/remirror/blob/HEAD/packages/@remirror/core/src/builtins/schema-extension.ts). This means that the editor you chooses to build is completely customizable, while providing sane defaults.

In this version the API has improved a lot. Multi-framework support is now possible. Currently there is support for `React` and the `DOM` with support being added for `Preact` in the next few weeks and `Svelte` after that.

There are also a host of drop in components and hooks being built. For example to add a drop down emoji picker to your react editor the following code is all you need.

```tsx
import React from 'react';
import { SocialEmojiComponent, SocialProvider } from 'remirror/react/social';

const Editor = () => {
  return (
    <SocialProvider>
      <SocialEmojiComponent />
    </SocialProvider>
  );
};
```

With this small snippet your editor now supports some complex UI Functionality. And it's all customisable with ordinary `css`. If you prefer `CSS-in-JS` the styles are also available with `emotion` and `styled-components`.

There's so much more to come and I'm glad you're taking a look. I hope `remirror` proves to be everything you need for your next text editor project.

<br />

## Status

This is the `next` version of remirror. It is undergoing heavy development at the moment and documentation is still being rewritten to capture the updated API.

While exploring this project, if you find errors or would like to suggest improvements there are several options.

- Open an issue in our [github repo](https://github.com/remirror/remirror/issues).
- [Join our discord server](https://remirror.io/chat) and discuss the problem with our community.
- Create a pull request with your proposed improvement by clicking the edit button on the relevant page.
- Move on, because deadlines are looming and life is too short.

Whatever you decide thanks for giving a chance to the `remirror` project.

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
- Prebuilt editors [social](./@remirror/react-social) and [wysiwyg](./@remirror/react-wysiwyg) and a markdown option is coming soon.
- 30+ extensions and 8 presets available to create your very own editor.
- Zero configuration support for **Server Side Rendering (SSR)**.
- Cross platform and cross-framework, with an Angular solution coming later this year.

<br />

## Prerequisites

- [Typescript](https://www.typescriptlang.org/) `>= 4`
- [pnpm](https://pnpm.js.org/en/installation) `>= 5.5`

<br />

## Getting Started

![A gif showing mentions being suggested as the user types with editing supported](https://media.githubusercontent.com/media/ifiokjr/assets/master/remirror/repo-banner.gif 'A gif showing mentions being suggested as the user types with editing supported').

You can see a guide on how to to add this exact editor to your codebase here.

To add this editor to your codebase, first install the required dependencies. Make sure to include the `@next` distribution tag to ensure you install the correct version.

```bash
# yarn
yarn add remirror@next @remirror/pm@next

# pnpm
pnpm add remirror@next @remirror/pm@next

# npm
npm install remirror@next @remirror/pm@next
```

`@remirror/pm` is a peer dependency which manages all the ProseMirror packages for you. It means that the conflicts which can sometimes happen between versions are no longer an issue. It's also important because it's quite easy to bundle multiple versions of the same library in your codebase. By

## Usage

Once installed you will be able to add the following code which creates an editor with the bold extension active. Clicking the button when text is selected will toggle between bold and not bold.

```tsx
import React, { useCallback } from 'react';
import { BoldExtension } from 'remirror/extension/bold';
import { RemirrorProvider, useManager, useRemirror, useExtensionCreator } from 'remirror/react';

const Editor = () => {
  const { getRootProps, active, commands } = useRemirror({ autoUpdate: true });

  return (
    <div>
      <div {...getRootProps()} />
      <button
        onClick={() => commands.toggleBold()}
        style={{ fontWeight: active.bold() ? 'bold' : undefined }}
      >
        Bold
      </button>
    </div>
  );
};

const EditorWrapper = () => {
  const manager = useManager([new BoldExtension()]);

  return (
    <RemirrorProvider manager={manager}>
      <Editor />
    </RemirrorProvider>
  );
};
```

<br />

## Contributing

Please read our [contribution guide] for details on our code of conduct, and the process for submitting pull requests. It also outlines the project structure so you can find help when navigating your way around the codebase.

In addition each folder in this codebase a readme describing why it exists.

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
[installation]: https://remirror.io/docs/guide/installation
[typescript]: https://github.com/microsoft/Typescript
[react]: https://github.com/facebook/react
[prosemirror]: https://prosemirror.net
