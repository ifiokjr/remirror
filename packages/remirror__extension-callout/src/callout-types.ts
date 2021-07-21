import type {
  EditorView,
  LiteralUnion,
  ProsemirrorAttributes,
  ProsemirrorNode,
  Static,
} from '@remirror/core';

/**
 * Options available to the [[`CalloutExtension`]].
 */
export interface CalloutOptions {
  /**
   * The default callout type to use when none is provided.
   *
   * It is a property so it can change during the editor's life.
   *
   * @default 'info'
   */
  defaultType?: Static<string>;

  /**
   * The valid types for the callout node.
   *
   * @default ['info', 'warning' , 'error' , 'success', 'blank']
   */
  validTypes?: Static<string[]>;

  /**
   * The default emoji passed to attrsibute when none is provided.
   *
   * @default ''
   */
  defaultEmoji?: Static<string>;

  /**
   * The function passed into `calloutExtension` to render the emoji at the front.
   *
   */
  renderEmoji?: (node: ProsemirrorNode, view: EditorView, getPos: () => number) => HTMLElement;
}

export interface CalloutAttributes extends ProsemirrorAttributes {
  /**
   * The type of callout, for instance `info`, `warning`, `error`, `success` or `blank`.
   *
   * @default 'info'
   */
  type?: LiteralUnion<'info' | 'warning' | 'error' | 'success' | 'blank', string>;

  /**
   * The emoji information of callout.
   *
   * @default ''
   */
  emoji?: string;
}
