// TODO remove these exports

export * from '@remirror/core-constants';
export * from '@remirror/core-utils';
export * from '@remirror/core-types';
export * from '@remirror/core-helpers';

export * from './builtins';
export * from './extension';
export * from './editor-manager';
export * from './editor-wrapper';
export * from './preset';
export * from './styles';
export * from './types';

// TODO move to a new package.
export * from './commands';

export type {
  BaseClass,
  BaseClassConstructor,
  AddHandler,
  AddCustomHandler,
  CustomHandlerMethod,
} from './extension/base-class';
