export * from './jest-remirror-builder';
export * from './jsdom-polyfills';
export * from './jest-remirror-matchers';
export * from './jest-remirror-editor';
export * from './jest-remirror-environment';
export * from './jest-remirror-utils';
export * from './jest-remirror-types';

declare global {
  interface Window {
    hasWarnedAboutCancelAnimationFramePolyfill?: boolean;
    ignoreAllJSDOMWarnings: boolean;
  }
}
