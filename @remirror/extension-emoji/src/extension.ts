import {
  Cast,
  EDITOR_CLASS_NAME,
  ExtensionCommandFunction,
  NodeExtension,
  NodeExtensionSpec,
  replaceText,
  SchemaNodeTypeParams,
} from '@remirror/core';
import { ReactNodeView } from '@remirror/react';
import { ObjectInterpolation } from 'emotion';
import { DefaultEmoji } from './components/emoji';
import { createEmojiPlugin } from './plugin';
import { EmojiAttrs, EmojiExtensionOptions } from './types';

export class EmojiExtension extends NodeExtension<EmojiExtensionOptions> {
  /**
   * The name is dynamically generated based on the passed in type.
   */
  get name() {
    return 'emoji' as const;
  }

  get defaultOptions() {
    return {
      extraAttrs: [],
      transformAttrs: (attrs: Pick<EmojiAttrs, 'name'>) => ({
        'aria-label': `Emoji: ${attrs.name}`,
        title: `Emoji: ${attrs.name}`,
        class: `${EDITOR_CLASS_NAME}-emoji-node${this.options.className ? ' ' + this.options.className : ''}`,
      }),
      className: '',
      size: '1.1em',
      style: {},
      EmojiComponent: DefaultEmoji,
    };
  }

  get schema(): NodeExtensionSpec {
    const { transformAttrs } = this.options;
    return {
      inline: true,
      group: 'inline',
      selectable: false,
      atom: false,
      attrs: {
        id: { default: '' },
        native: { default: '' },
        name: { default: '' },
        colons: { default: '' },
        skin: { default: '' },
        'aria-label': { default: '' },
        title: { default: '' },
        class: { default: '' },
        useNative: { default: false },
        ...this.extraAttrs(),
      },
      parseDOM: [
        {
          tag: 'span[data-emoji-id]',
          getAttrs: domNode => {
            const dom = domNode as HTMLElement;
            const skin = dom.getAttribute('data-emoji-skin');
            const useNative = dom.getAttribute('data-emoji-use-native');

            const attrs = {
              id: dom.getAttribute('data-emoji-id') || '',
              native: dom.getAttribute('data-emoji-native') || '',
              name: dom.getAttribute('data-emoji-name') || '',
              colons: dom.getAttribute('data-emoji-colons') || '',
              skin: skin ? Number(skin) : null,
              useNative: useNative === 'true',
            };

            return attrs;
          },
        },
      ],
      toDOM: node => {
        const { id, name, native, colons, skin, useNative } = node.attrs as EmojiAttrs;
        const attrs = {
          'data-emoji-id': id,
          'data-emoji-colons': colons,
          'data-emoji-native': native,
          'data-emoji-name': name,
          'data-emoji-skin': !isNaN(Number(skin)) ? String(skin) : '',
          'data-use-native': useNative ? 'true' : 'false',
          contenteditable: 'false',
          ...transformAttrs({ name }),
        };
        return ['span', attrs, native];
      },
    };
  }

  public commands = ({ type }: SchemaNodeTypeParams): ExtensionCommandFunction => attrs => {
    attrs = { ...attrs, ...this.options.transformAttrs(Cast<EmojiAttrs>(attrs)) };
    return replaceText({ type, attrs });
  };

  public plugin({ type }: SchemaNodeTypeParams) {
    const { emojiData } = this.options;
    return createEmojiPlugin({
      key: this.pluginKey,
      emojiData,
      type,
    });
  }

  public nodeView({ getPortalContainer }: SchemaNodeTypeParams) {
    const { set, size, emojiData, EmojiComponent, style } = this.options;

    const defaultStyle: ObjectInterpolation<undefined> = {
      userSelect: 'all',
      display: 'inline-block',
      span: {
        display: 'inline-block',
        height: size,
        width: size,
      },
    };

    return ReactNodeView.createNodeView({
      Component: EmojiComponent,
      getPortalContainer,
      props: {
        set,
        size,
        emojiData,
      },
      style: [defaultStyle, style],
    });
  }
}
