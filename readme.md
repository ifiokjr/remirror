<div align="center">
	<br />
	<div>
		<img width="600" height="600" src="support/assets/logo.svg" alt="remirror" />
	</div>
    <br />
    <br />
    <br />
    <br />

</div>

> Remirror is a a react based text-editor for building elegant editing experiences for web, mobile and desktop.

[![Azure DevOps builds](https://img.shields.io/azure-devops/build/remirror/1b12c364-8c17-4f7a-a215-b8e0d2c9b253/1.svg?label=Azure%20Pipeline&style=for-the-badge&logo=azuredevops)](https://dev.azure.com/remirror/remirror/_build/latest?definitionId=1&branchName=master) [![Travis (.com)](https://img.shields.io/travis/com/ifiokjr/remirror.svg?label=Travis%20Build&style=for-the-badge&logo=travisci)](https://travis-ci.com/ifiokjr/remirror) [![Code Climate coverage](https://img.shields.io/codeclimate/coverage/ifiokjr/remirror.svg?style=for-the-badge&&logo=data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDI0IDI0Ij48dGl0bGU+Q29kZSBDbGltYXRlIGljb248L3RpdGxlPjxwYXRoIGQ9Ik0gMTYuMDQ2ODc1IDUuMDM5MDYyIEwgMjQgMTIuOTkyMTg4IEwgMjEuMjkyOTY5IDE1LjcwMzEyNSBMIDE2LjA0Njg3NSAxMC40NTcwMzEgTCAxNC4yMDMxMjUgMTIuMzA4NTk0IEwgMTEuNDg4MjgxIDkuNTk3NjU2IFogTSAxMC42NTIzNDQgMTAuNDM3NSBMIDEzLjM1OTM3NSAxMy4xNTIzNDQgTCAxNS45MDYyNSAxNS42OTE0MDYgTCAxMy4xOTE0MDYgMTguMzk4NDM4IEwgNy45NTMxMjUgMTMuMTYwMTU2IEwgMy43NzczNDQgMTcuMzM1OTM4IEwgMi43MDcwMzEgMTguMzk4NDM4IEwgMCAxNS42OTE0MDYgTCA3Ljk1MzEyNSA3LjczODI4MSBaIE0gMTAuNjUyMzQ0IDEwLjQzNzUgIi8+PC9zdmc+)](https://codeclimate.com/github/ifiokjr/remirror/test_coverage) [![Code Climate maintainability](https://img.shields.io/codeclimate/maintainability/ifiokjr/remirror.svg?style=for-the-badge&&logo=data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDI0IDI0Ij48dGl0bGU+Q29kZSBDbGltYXRlIGljb248L3RpdGxlPjxwYXRoIGQ9Ik0gMTYuMDQ2ODc1IDUuMDM5MDYyIEwgMjQgMTIuOTkyMTg4IEwgMjEuMjkyOTY5IDE1LjcwMzEyNSBMIDE2LjA0Njg3NSAxMC40NTcwMzEgTCAxNC4yMDMxMjUgMTIuMzA4NTk0IEwgMTEuNDg4MjgxIDkuNTk3NjU2IFogTSAxMC42NTIzNDQgMTAuNDM3NSBMIDEzLjM1OTM3NSAxMy4xNTIzNDQgTCAxNS45MDYyNSAxNS42OTE0MDYgTCAxMy4xOTE0MDYgMTguMzk4NDM4IEwgNy45NTMxMjUgMTMuMTYwMTU2IEwgMy43NzczNDQgMTcuMzM1OTM4IEwgMi43MDcwMzEgMTguMzk4NDM4IEwgMCAxNS42OTE0MDYgTCA3Ljk1MzEyNSA3LjczODI4MSBaIE0gMTAuNjUyMzQ0IDEwLjQzNzUgIi8+PC9zdmc+)](https://codeclimate.com/github/ifiokjr/remirror/maintainability) [![Code Climate technical debt](https://img.shields.io/codeclimate/tech-debt/ifiokjr/remirror.svg?style=for-the-badge&&logo=data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDI0IDI0Ij48dGl0bGU+Q29kZSBDbGltYXRlIGljb248L3RpdGxlPjxwYXRoIGQ9Ik0gMTYuMDQ2ODc1IDUuMDM5MDYyIEwgMjQgMTIuOTkyMTg4IEwgMjEuMjkyOTY5IDE1LjcwMzEyNSBMIDE2LjA0Njg3NSAxMC40NTcwMzEgTCAxNC4yMDMxMjUgMTIuMzA4NTk0IEwgMTEuNDg4MjgxIDkuNTk3NjU2IFogTSAxMC42NTIzNDQgMTAuNDM3NSBMIDEzLjM1OTM3NSAxMy4xNTIzNDQgTCAxNS45MDYyNSAxNS42OTE0MDYgTCAxMy4xOTE0MDYgMTguMzk4NDM4IEwgNy45NTMxMjUgMTMuMTYwMTU2IEwgMy43NzczNDQgMTcuMzM1OTM4IEwgMi43MDcwMzEgMTguMzk4NDM4IEwgMCAxNS42OTE0MDYgTCA3Ljk1MzEyNSA3LjczODI4MSBaIE0gMTAuNjUyMzQ0IDEwLjQzNzUgIi8+PC9zdmc+)](https://codeclimate.com/github/ifiokjr/remirror/issues) [![GitHub commit activity](https://img.shields.io/github/commit-activity/m/ifiokjr/remirror.svg?style=for-the-badge&logo=github)](https://github.com/ifiokjr/remirror/commits/master) [![GitHub last commit](https://img.shields.io/github/last-commit/ifiokjr/remirror.svg?style=for-the-badge&logo=github)](https://github.com/ifiokjr/remirror/commits/master) [![LICENSE](https://img.shields.io/npm/l/remirror.svg?style=for-the-badge)](https://github.com/ifiokjr/remirror/blob/master/LICENSE) [![GitHub issues](https://img.shields.io/github/issues-raw/ifiokjr/remirror.svg?style=for-the-badge&logo=github)](https://github.com/ifiokjr/remirror/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc) [![GitHub pull requests](https://img.shields.io/github/issues-pr/ifiokjr/remirror.svg?style=for-the-badge&logo=github)](https://github.com/ifiokjr/remirror/pulls?q=is%3Apr+is%3Aopen+sort%3Aupdated-desc) [![GitHub stars](https://img.shields.io/github/stars/ifiokjr/remirror.svg?style=for-the-badge&logo=github)](https://github.com/ifiokjr/remirror) [![GitHub tag (latest SemVer)](https://img.shields.io/github/tag/ifiokjr/remirror.svg?style=for-the-badge&logo=github)](https://github.com/ifiokjr/remirror/tags) [![LGTM Alerts](https://img.shields.io/lgtm/alerts/g/ifiokjr/remirror.svg?style=for-the-badge&logo=lgtm)](https://lgtm.com/projects/g/ifiokjr/remirror/alerts/) [![LGTM Grade](https://img.shields.io/lgtm/grade/javascript/g/ifiokjr/remirror.svg?style=for-the-badge&logo=lgtm)](https://lgtm.com/projects/g/ifiokjr/remirror/context:javascript)

# [📖 Docs](https://docs.remirror.org)

- [Introduction](https://docs.remirror.org)
- [Install](https://docs.remirror.org/install)
- [Walkthrough guide](https://docs.remirror.org/walekthroug)

## Getting Started

### Prerequisites

You can use either `npm` or `yarn` for managing packages. This project has been built with yarn workspaces so all further instructions will assume you're using `yarn`.

For help translating commands refer to this helpful [document](https://yarnpkg.com/lang/en/docs/migrating-from-npm/#toc-cli-commands-comparison)

#### TypeScript Users

This project is built with and should work with versions `>=3.3`.

### Install

A step by step series of examples that tell you how to get a development env running

Say what the step will be

```bash
yarn add remirror
```

Import and use the component with the child component as a render function.

```ts
import { Remirror } from 'remirror';

const Editor = props => (
  <Remirror
    onChange={onChange}
    placeholder='This is a placeholder'
    autoFocus={true}
    initialContent={initialJson}
  >
    {({ getMenuProps, actions }) => {
      const menuProps = getMenuProps({
        name: 'floating-menu',
      });
      return (
        <div>
          <div
            style={{
              position: 'absolute',
              top: menuProps.position.top,
              left: menuProps.position.left,
            }}
            ref={menuProps.ref}
          >
            <button
              style={{
                backgroundColor: actions.bold.isActive() ? 'white' : 'pink',
                fontWeight: actions.bold.isActive() ? 600 : 300,
              }}
              disabled={!actions.bold.isEnabled()}
              onClick={runAction(actions.bold.run)}
            >
              B
            </button>
          </div>
        </div>
      );
    }}
  </Remirror>
);
```

React hooks can also be used to pull the Remirror Context from a parent provider. This api relies on the new(ish) hooks specification and React Context.

```ts
import { RemirrorProvider, useRemirror } from 'remirror';

// ...

function HooksComponent(props) {
  // This pull the remirror props out from the context.
  const { getMenuProps } = useRemirror();

  // ...
  return <Menu {...getMenuProps()} />;
}

class App extends Component {
  // ...
  render() {
    return (
      <RemirrorProvider>
        <HooksComponent />
      </RemirrorProvider>
    );
  }
}
```

In a similar fashion Higher Order Components (HOC's) can be used to wrap a component.

```ts
import { RemirrorProvider, withRemirror, InjectedRemirrorProps } from 'remirror';

// ...

function EditorComponent(props: InjectedRemirrorProps) {
  const { getMenuProps } = props;

  // ...
  return <Menu {...getMenuProps()} />;
}

const WrappedEditorComponent = withRemirror(EditorComponent);

class App extends Component {
  // ...
  render() {
    return (
      <RemirrorProvider>
        <WrappedEditorComponent />
      </RemirrorProvider>
    );
  }
}
```

## Running the tests

From the root of this repository run the following to trigger a full typecheck, linting and jest tests.

```bash
yarn checks
```

By default these checks are run on every push. To prevent these hooks from running by default simply copy `.config.sample.json` to `.config.json`. This file is read before hooks are run and can cancel checks when configured.

## Built With

- [React](https://github.com/facebook/react) - The web framework used
- [Prosemirror](https://prosemirror.net) - A beautiful and elegant text editor for DOM environments.

## Contributing

Please read [CONTRIBUTING.md](https://github.com/ifiokjr/remirror/blob/master/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests.

## Versioning

This project uses [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/ifiokjr/remirror/tags).

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

- The api and Many ideas were ~~stolen~~ borrowed from **[tiptap](https://github.com/heyscrumpy/tiptap)** which is a prosemirror editor for Vue. The concept of extensions and a lot of the early code was a direct port from this library.
- At the time I started thinking about building an editor [Slate](https://github.com/ianstormtaylor) didn't have great support for Android devices (they've since addressed [this here](https://github.com/ianstormtaylor/slate/pull/2553))
