import { Static } from '@remirror/core';

export interface IframeOptions {
  /**
   * The default source to use for the iframe.
   */
  defaultSource?: Static<string>;

  /**
   * The class to add to the iframe.
   *
   * @default 'remirror-iframe'
   */
  class?: Static<string>;

  /**
   * Enable resizing.
   *
   * If true, the iframe node will be rendered by `nodeView` instead of `toDOM`.
   *
   * @default false
   */
  enableResizing: boolean;
}
