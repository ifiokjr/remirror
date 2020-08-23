import {
  ApplySchemaAttributes,
  CommandFunction,
  extensionDecorator,
  ExtensionTag,
  FromToParameter,
  InputRule,
  isElementDomNode,
  isString,
  MarkExtension,
  MarkExtensionSpec,
  markInputRule,
  Static,
  toggleMark,
} from '@remirror/core';

type FontWeightProperty =
  | '-moz-initial'
  | 'inherit'
  | 'initial'
  | 'revert'
  | 'unset'
  | 'bold'
  | 'normal'
  | 'bolder'
  | 'lighter'
  | number;

export interface BoldOptions {
  /**
   * Optionally set the font weight property for this extension.
   */
  weight?: Static<FontWeightProperty>;
}

/**
 * When added to your editor it will provide the `bold` command which makes the text under the cursor /
 * or at the provided position range bold.
 */
@extensionDecorator<BoldOptions>({
  defaultOptions: { weight: undefined },
  staticKeys: ['weight'],
})
export class BoldExtension extends MarkExtension<BoldOptions> {
  get name() {
    return 'bold' as const;
  }

  readonly tags = [ExtensionTag.FormattingMark, ExtensionTag.FontStyle];

  createMarkSpec(extra: ApplySchemaAttributes): MarkExtensionSpec {
    return {
      attrs: extra.defaults(),
      parseDOM: [
        {
          tag: 'strong',
          getAttrs: extra.parse,
        },
        // This works around a Google Docs misbehavior where
        // pasted content will be inexplicably wrapped in `<b>`
        // tags with a font-weight normal.
        {
          tag: 'b',
          getAttrs: (node) =>
            isElementDomNode(node) && node.style.fontWeight !== 'normal'
              ? extra.parse(node)
              : false,
        },
        {
          style: 'font-weight',
          getAttrs: (node) =>
            isString(node) && /^(bold(er)?|[5-9]\d{2,})$/.test(node) ? null : false,
        },
      ],
      toDOM: (node) => {
        const { weight } = this.options;

        if (weight) {
          return ['strong', { 'font-weight': weight.toString() }, 0];
        }

        return ['strong', extra.dom(node), 0];
      },
    };
  }

  createKeymap() {
    return {
      'Mod-b': toggleMark({ type: this.type }),
    };
  }

  createInputRules(): InputRule[] {
    return [
      markInputRule({
        regexp: /(?:\*\*|__)([^*_]+)(?:\*\*|__)$/,
        type: this.type,
        ignoreWhitespace: true,
      }),
    ];
  }

  createCommands() {
    return {
      /**
       * Toggle the bold styling on and off. Remove the formatting if any
       * matching bold formatting within the selection or provided range.
       */
      toggleBold: (range?: FromToParameter) => {
        return toggleMark({ type: this.type, range });
      },

      /**
       * Set the bold formatting for the provided range.
       *
       * TODO add selection support.
       * TODO add check to see that provided range is valid.
       */
      setBold: (range: FromToParameter): CommandFunction => ({ tr, dispatch }) => {
        dispatch?.(tr.addMark(range?.from, range?.to, this.type.create()));

        return true;
      },

      /**
       * Remove the bold formatting from the provided range.
       *
       * TODO add selection support.
       * TODO add check that the provided range is valid.
       */
      removeBold: (range: FromToParameter): CommandFunction => ({ tr, dispatch }) => {
        dispatch?.(tr.removeMark(range?.from, range?.to, this.type));

        return true;
      },
    };
  }
}
