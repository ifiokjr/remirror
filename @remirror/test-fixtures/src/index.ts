import diff from 'jest-diff';

import {
  AnyExtension,
  AnyExtensionConstructor,
  AnyPreset,
  AnyPresetConstructor,
  BaseExtensionOptions,
  RemirrorManager,
  RemirrorManagerParameter,
  ErrorConstant,
  ExtensionConstructorParameter,
  invariant,
  isEqual,
  isFunction,
  mutateDefaultExtensionOptions,
  object,
  omit,
  OptionsOfConstructor,
  PresetConstructorParameter,
} from '@remirror/core';
import { CorePreset } from '@remirror/preset-core';
import { ReactPreset } from '@remirror/preset-react';

/**
 * A manager used for testing with the preset core already applied.
 *
 * TODO refactor to use combined array as parameter.
 */
export function createBaseManager<
  ExtensionUnion extends AnyExtension,
  PresetUnion extends AnyPreset
>(parameter: Partial<RemirrorManagerParameter<ExtensionUnion, PresetUnion>> = {}) {
  const { extensions = [], presets = [], settings } = parameter;
  const corePreset = new CorePreset();

  return RemirrorManager.fromObject({
    extensions,
    presets: [...presets, corePreset],
    settings,
  });
}

/**
 * A manager for use to test `@remirror/react`.
 *
 * TODO refactor to use combined array as parameter.
 */
export function createReactManager<
  ExtensionUnion extends AnyExtension,
  PresetUnion extends AnyPreset
>(parameter: Partial<RemirrorManagerParameter<ExtensionUnion, PresetUnion>> = {}) {
  const { extensions = [], presets = [], settings } = parameter;
  const corePreset = new CorePreset();
  const reactPreset = new ReactPreset();

  return RemirrorManager.fromObject({
    extensions,
    presets: [...presets, corePreset, reactPreset],
    settings,
  });
}

export const initialJson = {
  type: 'doc',
  content: [
    { type: 'paragraph', content: [{ type: 'text', text: 'Better docs to come soon...' }] },
  ],
};

/**
 * Validate the shape of your extension.
 */
export function isExtensionValid<Type extends AnyExtensionConstructor>(
  Extension: Type,
  ...[options]: ExtensionConstructorParameter<OptionsOfConstructor<Type>>
) {
  const extension = new Extension(options);

  let defaultOptions: BaseExtensionOptions = object();

  mutateDefaultExtensionOptions((value) => {
    defaultOptions = value;
  });

  for (const key of Extension.handlerKeys) {
    invariant(isFunction(extension.options[key]), {
      message: `Invalid handler 'key'. Make sure not to overwrite the default handler`,
      code: ErrorConstant.INVALID_EXTENSION,
    });
  }

  const expectedOptions = {
    ...defaultOptions,
    ...Extension.defaultOptions,
    ...options,
  };
  invariant(isEqual(omit(extension.options, Extension.handlerKeys), expectedOptions), {
    message: `Invalid 'defaultOptions' for '${Extension.name}'\n\n${
      diff(extension.options, expectedOptions) ?? ''
    }\n`,
    code: ErrorConstant.INVALID_EXTENSION,
  });

  return true;
}

/**
 * Validate the shape of your preset.
 */
export function isPresetValid<Type extends AnyPresetConstructor>(
  Preset: Type,
  ...[options]: PresetConstructorParameter<OptionsOfConstructor<Type>>
) {
  const extension = new Preset(options);

  const expectedOptions = { ...Preset.defaultOptions, ...options };
  invariant(isEqual(extension.options, expectedOptions), {
    message: `Invalid 'defaultOptions' for '${Preset.name}'\n\n${
      diff(extension.options, expectedOptions) ?? ''
    }\n`,
  });

  return true;
}

export { diff };

export { default as minDocument } from 'min-document';

export * from '@remirror/preset-core';
export * from '@remirror/extension-doc';
export * from '@remirror/extension-text';
export * from '@remirror/extension-paragraph';
export * from '@remirror/extension-bold';
export * from '@remirror/extension-code-block';
export * from '@remirror/extension-heading';
export * from '@remirror/extension-blockquote';
export * from '@remirror/extension-link';
export * from '@remirror/extension-italic';
export * from '@remirror/extension-underline';
export * from './object-nodes';
export * from './object-shapes';
export * from './typecheck';
