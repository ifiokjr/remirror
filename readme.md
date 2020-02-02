<div align="center">
  <br />
  <div align="center">
    <img width="300" height="300" src="https://rawcdn.githack.com/ifiokjr/remirror/f94e6c63e555f65ad5f3f13a3f343204cdc92dff/support/assets/logo.svg?sanitize=true" alt="remirror" />
  </div>
    <br />
    <br />
    <br />
</div>

<p align="center">

<a href="https://dev.azure.com/remirror/remirror/_build/latest?definitionId=1&amp;branchName=canary"><img src="https://dev.azure.com/remirror/remirror/_apis/build/status/ifiokjr.remirror?branchName=canary" alt="Azure DevOps builds" /></a>
<a href="https://github.com/ifiokjr/remirror/actions?query=workflow%3A%22Node+CI%22"><img src="https://github.com/ifiokjr/remirror/workflows/Node%20CI/badge.svg" alt="GitHub Actions CI" /></a>
<a href="https://travis-ci.com/ifiokjr/remirror"><img src="https://travis-ci.com/ifiokjr/remirror.svg?branch=canary" alt="Travis (.com)" /></a>
<a href="https://codeclimate.com/github/ifiokjr/remirror/test_coverage"><img src="https://api.codeclimate.com/v1/badges/cfd42ff63704a1cbe232/test_coverage" /></a>
<a href="https://github.com/ifiokjr/remirror/commits/canary"><img src="https://img.shields.io/github/commit-activity/m/ifiokjr/remirror.svg?amp;logo=github" alt="GitHub commit activity"></a>
<a href="https://github.com/ifiokjr/remirror/commits/canary"><img src="https://img.shields.io/github/last-commit/ifiokjr/remirror.svg?amp;logo=github" alt="GitHub last commit" /></a>
<a href="https://github.com/ifiokjr/remirror/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc"><img src="https://img.shields.io/github/issues-raw/ifiokjr/remirror.svg?amp;logo=github" alt="GitHub issues" /></a>
<a href="https://github.com/ifiokjr/remirror/pulls?q=is%3Apr+is%3Aopen+sort%3Aupdated-desc"><img src="https://img.shields.io/github/issues-pr/ifiokjr/remirror.svg?amp;logo=github" alt="GitHub pull requests" /></a>
<a href="https://github.com/ifiokjr/remirror"><img src="https://img.shields.io/github/stars/ifiokjr/remirror.svg?amp;logo=github" alt="GitHub stars" /></a>
<a href="https://github.com/ifiokjr/remirror/blob/canary/LICENSE"><img src="https://img.shields.io/npm/l/remirror.svg" alt="LICENSE" /></a>
<a href="https://app.netlify.com/sites/remirror/deploys"><img src="https://api.netlify.com/api/v1/badges/f59cbf02-798f-45dd-a78c-93ec52b08d20/deploy-status" alt="Netlify Status" /></a>
<a href="https://spectrum.chat/remirror"><img alt="Join the community on Spectrum" src="https://withspectrum.github.io/badge/badge.svg" /></a>

</p>

<br />

<div align="center">
  <div align="center">
    <img width="600"  src="https://media.githubusercontent.com/media/ifiokjr/remirror/canary/support/assets/wysiwyg.png" alt="remirror" />
  </div>
    <br />
</div>

> Remirror is a toolkit for building accessible editors which run on the web and desktop.

<br />

### Status

Remirror is still undergoing heavy development, but is used in production by at least one company. At the
moment the focus is on releasing a stable API and while this is ongoing documentation has slipped from being
the priority.

Right now the best way to understand the library is to read through the codebase and take a look at how
existing editors have been structured. A quick way to get started is to
[spin up our Next.js example](https://github.com/ifiokjr/remirror/blob/canary/examples/with-next/readme.md#getting-started).

### Documentation

View our documentation website at https://docs.remirror.org/

- [Introduction]
  <!-- - [Installation] -->
- [Getting started]

<br />

### Features

- A11y focused and ARIA compatible.
- **3** prebuilt editors, [markdown](./@remirror/editor-markdown), [social](./@remirror/editor-social) and
  [wysiwyg](./@remirror/editor-wysiwyg).
- Extensions available for adding your own flavour to your own custom editor editor.
- Zero config support **Server Side Rendering (SSR)**.

<br />

### Prerequisites

- Typescript `>= 3.6`
- React `>= 16.9`
- Yarn `>= 1.17`

<br />

![A gif showing mentions being suggested as the user types with editing supported](https://media.githubusercontent.com/media/ifiokjr/assets/master/remirror/repo-banner.gif 'A gif showing mentions being suggested as the user types with editing supported')

### Testing

From the root of this repository run the following to trigger a full typecheck, linting and jest tests.

```bash
yarn checks
```

By default these checks are not run automatically. To enable automatic precommit and prepush hooks use the
following command:

```bash
yarn start:checks
```

To stop per-commit / per-push checks run:

```bash
yarn stop:checks
```

<br />

### Built With

- [Typescript]
- [React]
- [Prosemirror]
- [Theme UI]

<br />

### Contributing

Please read [contributing.md](docs/contributing.md) for details on our code of conduct, and the process for
submitting pull requests.

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/ifiokjr/remirror)

<br />

### Versioning

This project uses [SemVer](http://semver.org/) for versioning. For the versions available, see the
[tags on this repository](https://github.com/ifiokjr/remirror/tags).

Currently all versions within the repo are locked and this will continue until `v1.0.0` is. At this point
versions will be updated independently.

<br />

### License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

[introduction]: https://docs.remirror.org
[installation]: https://docs.remirror.org/installation
[getting started]: https://docs.remirror.org/guides/quickstart
[typescript]: https://github.com/microsoft/Typescript
[react]: https://github.com/facebook/react
[prosemirror]: https://prosemirror.net
[theme ui]: https://github.com/system-ui/theme-ui

<br />

### Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://ifiokjr.com"><img src="https://avatars2.githubusercontent.com/u/1160934?v=4" width="100px;" alt=""/><br /><sub><b>Ifiok Jr.</b></sub></a><br /><a href="https://github.com/ifiokjr/remirror/commits?author=ifiokjr" title="Documentation">📖</a> <a href="https://github.com/ifiokjr/remirror/commits?author=ifiokjr" title="Code">💻</a> <a href="#example-ifiokjr" title="Examples">💡</a> <a href="https://github.com/ifiokjr/remirror/commits?author=ifiokjr" title="Tests">⚠️</a> <a href="#maintenance-ifiokjr" title="Maintenance">🚧</a></td>
    <td align="center"><a href="https://graphile.org/sponsor"><img src="https://avatars2.githubusercontent.com/u/129910?v=4" width="100px;" alt=""/><br /><sub><b>Benjie Gillam</b></sub></a><br /><a href="https://github.com/ifiokjr/remirror/commits?author=benjie" title="Documentation">📖</a> <a href="https://github.com/ifiokjr/remirror/issues?q=author%3Abenjie" title="Bug reports">🐛</a> <a href="#example-benjie" title="Examples">💡</a> <a href="https://github.com/ifiokjr/remirror/commits?author=benjie" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/aried3r"><img src="https://avatars1.githubusercontent.com/u/1301152?v=4" width="100px;" alt=""/><br /><sub><b>Anton Rieder</b></sub></a><br /><a href="https://github.com/ifiokjr/remirror/commits?author=aried3r" title="Documentation">📖</a></td>
    <td align="center"><a href="https://aarongreenlee.com/"><img src="https://avatars0.githubusercontent.com/u/264508?v=4" width="100px;" alt=""/><br /><sub><b>Aaron Greenlee</b></sub></a><br /><a href="https://github.com/ifiokjr/remirror/commits?author=aarongreenlee" title="Documentation">📖</a> <a href="https://github.com/ifiokjr/remirror/commits?author=aarongreenlee" title="Code">💻</a></td>
    <td align="center"><a href="http://yellowbrim.com"><img src="https://avatars2.githubusercontent.com/u/1542740?v=4" width="100px;" alt=""/><br /><sub><b>Charley Bodkin</b></sub></a><br /><a href="https://github.com/ifiokjr/remirror/commits?author=charlex" title="Code">💻</a> <a href="https://github.com/ifiokjr/remirror/commits?author=charlex" title="Documentation">📖</a></td>
    <td align="center"><a href="https://ocavue.github.io/"><img src="https://avatars2.githubusercontent.com/u/24715727?v=4" width="100px;" alt=""/><br /><sub><b>ocavue</b></sub></a><br /><a href="https://github.com/ifiokjr/remirror/commits?author=ocavue" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
