# @remirror/core-types

## 1.0.0-next.33

> 2020-09-07

### Minor Changes

- 525ac3d8: Add `AcceptUndefined` annotation which allows options to accept undefined as their default value.
- 92ed4135: Add new `AnchorHeadParameter` export and make it a part of `PrimitiveSelection` type.

### Patch Changes

- Updated dependencies [7a34e15d]
  - @remirror/core-constants@1.0.0-next.33

## 1.0.0-next.32

> 2020-09-05

### Patch Changes

- Updated dependencies [[`a830c70f`](https://github.com/remirror/remirror/commit/a830c70f76a5021c955e9cbba26b86e2db0333e3)]:
  - @remirror/core-constants@1.0.0-next.32
  - @remirror/pm@1.0.0-next.32

## 1.0.0-next.28

> 2020-08-27

### Patch Changes

- Updated dependencies [[`d5bbeb4e`](https://github.com/remirror/remirror/commit/d5bbeb4e8e193e695838207706a04f7739cc1448)]:
  - @remirror/pm@1.0.0-next.28

## 1.0.0-next.26

> 2020-08-24

### Patch Changes

- Updated dependencies [a2bc3bfb]
  - @remirror/core-constants@1.0.0-next.26
  - @remirror/pm@1.0.0-next.26

## 1.0.0-next.22

> 2020-08-17

### Major Changes

- 45d82746: 💥 Remove `AttributesWithClass`.

  🚀 Add `NodeAttributes` and `MarkAttributes` exports which can be extended in the `Remirror.ExtraNodeAttributes` and `Remirror.ExtraMarkAttributes`.

  🚀 Add `isAllSelection` which checks if the user has selected everything in the active editor.

### Patch Changes

- Updated dependencies [9ab1d0f3]
  - @remirror/core-constants@1.0.0-next.22
  - @remirror/pm@1.0.0-next.22

## 1.0.0-next.21

> 2020-08-15

### Patch Changes

- 3673a0f0: Fix #518 caused by the way the `EditorWrapper` was setting up listeners to events from the `RemirrorManager`. Previously the failure became apparent when used in an uncontrolled editor in `StrictMode`.

  Set the default `CommandFunction` type parameter to be `EditorSchema` for better code completion when creating an extension.

  - @remirror/pm@1.0.0-next.21

## 1.0.0-next.20

> 2020-08-14

### Minor Changes

- 8f9eb16c: Enable `all` selection when setting initial content and focusing on the editor.

  ```tsx
  import { useRemirror } from 'remirror/react';

  const { focus } = useRemirror();
  focus('all');
  ```

### Patch Changes

- Updated dependencies [770e3d4a]
- Updated dependencies [92653907]
  - @remirror/pm@1.0.0-next.20

## 1.0.0-next.16

> 2020-08-01

### Major Changes

- 6c6d524e: **Breaking Changes** 💥

  Rename `contains` to `containsNodesOfType`.

  Make `isValidPresetConstructor` internal only.

  Remove `EMPTY_CSS_VALUE`, `CSS_ROTATE_PATTERN` from `@remirror/core-constants`.

  Remove method: `clean() | coerce() | fragment() | markFactory() | nodeFactory() | offsetTags() | sequence() | slice() | text() | isTaggedNode() | replaceSelection()` and type: `BaseFactoryParameter | MarkWithAttributes | MarkWithoutAttributes | NodeWithAttributes | NodeWithoutAttributes | TagTracker | TaggedContent | TaggedContentItem | TaggedContentWithText | Tags` exports from `jest-remirror`.

  Remove `SPECIAL_INPUT_KEYS | SPECIAL_KEYS | SPECIAL_MENU_KEYS | SPECIAL_TOGGLE_BUTTON_KEYS` from `multishift`.

### Minor Changes

- 6528323e: **Breaking:** `@remirror/preset-core` -`CreateCoreManagerOptions` now extends `Remirror.ManagerSettings`.

  **Breaking:** `@remirror/preset-wysiwyg` - Rename `CreateWysiwygPresetListParameter` to **`CreateWysiwygPresetListOptions`**. Also it now extends `Remirror.ManagerSettings`. **Breaking:**`@remirror/react` - `CreateReactManagerOptions` now extends `Remirror.ManagerSettings`. **Breaking:** `@remirror/react-social` - `CreateSocialManagerOptions` now extends `Remirror.ManagerSettings`.

  **Breaking:** `@remirror/react`, `@remirror/react-social`, `@remirror/react-wysiwyg` now uses a `settings` property for manager settings.

  `@remirror/core-types` - Add `GetStaticAndDynamic<Options>` helper for extracting options from extension. Apply it to the packages mentioned above.

  - `@remirror/react-wysiwyg` - Update imports from `@remirror/preset-wysiwyg`.

### Patch Changes

- a7037832: Use exact versions for `@remirror` package `dependencies` and `peerDepedencies`.

  Closes #435

- dcccc5fc: Add browser entrypoint to packages and shrink bundle size.
- 231f664b: Upgrade dependencies.
- 6c6d524e: Remove use of `export *` for better tree shaking.

  Closes #406

- Updated dependencies [a7037832]
- Updated dependencies [dcccc5fc]
- Updated dependencies [231f664b]
- Updated dependencies [6c6d524e]
- Updated dependencies [6c6d524e]
  - @remirror/core-constants@1.0.0-next.16
  - @remirror/pm@1.0.0-next.16

## 1.0.0-next.13

> 2020-07-29

### Patch Changes

- e45706e5: Add new `extensionDecorator` function which augments the static properties of an `Extension` constructor when used as a decorator.

  The following code will add a decorator to the extension.

  ```ts
  import { PlainExtension, ExtensionPriority, extensionDecorator } from 'remirror/core';

  interface ExampleOptions {
    color?: string;

    /**
     * This option is annotated as a handler and needs a static property.
     **/
    onChange?: Handler<() => void>;
  }

  @extensionDecorator<ExampleOptions>({
    defaultOptions: { color: 'red' },
    defaultPriority: ExtensionPriority.Lowest,
    handlerKeys: ['onChange'],
  })
  class ExampleExtension extends PlainExtension<ExampleOptions> {
    get name() {
      return 'example' as const;
    }
  }
  ```

  The extension decorator updates the static properties of the extension. If you prefer not to use decorators it can also be called as a function. The `Extension` constructor is mutated by the function call and does not need to be returned.

  ```ts
  extensionDecorator({ defaultSettings: { color: 'red' } })(ExampleExtension);
  ```

- Updated dependencies [92342ab0]
  - @remirror/core-constants@1.0.0-next.13

## 1.0.0-next.6

> 2020-07-20

### Patch Changes

- e06a3623: Upgrade package dependencies.
- Updated dependencies [e06a3623]
  - @remirror/core-constants@1.0.0-next.6

## 1.0.0-next.4

> 2020-07-16

### Patch Changes

- 5d5970ae: Update repository and website field to point to HEAD rather than a specific branch.
- Updated dependencies [5d5970ae]
  - @remirror/core-constants@1.0.0-next.4
  - @remirror/pm@1.0.0-next.4

## 1.0.0-next.3

> 2020-07-11

### Patch Changes

- Updated dependencies [e90bc748]
  - @remirror/pm@1.0.0-next.3

## 1.0.0-next.1

> 2020-07-05

### Patch Changes

- Fix missing dist files from previous publish.
- Updated dependencies [undefined]
  - @remirror/core-constants@1.0.0-next.1
  - @remirror/pm@1.0.0-next.1

## 1.0.0-next.0

> 2020-07-05

### Major Changes

- The whole API for remirror has completely changed. These pre-release versions are a breaking change across all packages. The best way to know what's changed is to read the documentaion on the new documentation site `https://remirror.io`.
- 28bd8bea: This is a breaking change to the structure of published npm packages.

  - Move build directory from `lib` to `dist`
  - Remove option for multiple entry points. It is no longer possible to import module from '@remirror/core/lib/custom'
  - Only use one entry file.
  - Remove declaration source mapping for declaration files
  - Remove the src directory from being published.

- 7b817ac2: Rename all types and interfaces postfixed with `Params` to use the postfix `Parameter`. If your code was importing any matching interface you will need to update the name.

### Patch Changes

- Updated dependencies [undefined]
- Updated dependencies [28bd8bea]
- Updated dependencies [7b817ac2]
  - @remirror/core-constants@1.0.0-next.0
  - @remirror/pm@1.0.0-next.0

## 0.9.0

### Minor Changes

- 0300d01c: - Auto defined `isEnabled` via commands with `dispatch=undefined`.
  - `HistoryExtension` now checks that whether `dispatch=undefined`.
  - Remove `CommandStatusCheck`.
  - Add new type `ExtensionIsActiveFunction` which doesn't take the command name.
  - Remove `isEnabled` from `Extension` interface.

## 0.8.0

### Minor Changes

- 24f83413: - Change the signature of `CommandFunction` to only accept one parameter which contains `dispatch`, `view`, `state`.

  - Create a new exported `ProsemirrorCommandFunction` type to describe the prosemirror commands which are still used in the codebase.
  - Rename `KeyboardBindings` to `KeyBindings`. Allow `CommandFunctionParams` to provide extra parameters like `next` in the newly named `KeyBindings`.
  - Create a new `KeyBindingCommandFunction` to describe the `Extension.keys()` return type. Update the name of the `ExcludeOptions.keymaps` -> `ExcludeOptions.keys`.

  **BREAKING CHANGE**

## 0.7.4

### Patch Changes

- 7380e18f: Update repository url from ifiokjr/remirror to remirror/remirror to reflect new GitHub organisation.
- Updated dependencies [7380e18f]
  - @remirror/core-constants@0.7.4
  - @remirror/react-portals@0.7.4

## 0.7.3

### Patch Changes

- 5f85c0de: Bump a new version to test out the changeset API.
- Updated dependencies [5f85c0de]
  - @remirror/core-constants@0.7.3
  - @remirror/react-portals@0.7.3
