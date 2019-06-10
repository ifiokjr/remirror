import { Interpolation } from '@emotion/core';
import {
  EDITOR_CLASS_SELECTOR,
  NodeExtension,
  NodeExtensionSpec,
  SchemaNodeTypeParams,
  toggleBlockItem,
} from '@remirror/core';
import { textblockTypeInputRule } from 'prosemirror-inputrules';

export class CodeBlock extends NodeExtension {
  get name() {
    return 'codeBlock' as const;
  }

  get schema(): NodeExtensionSpec {
    return {
      attrs: this.extraAttrs(),
      content: 'text*',
      marks: '',
      group: 'block',
      code: true,
      defining: true,
      draggable: false,
      parseDOM: [{ tag: 'pre', preserveWhitespace: 'full' }],
      toDOM: () => ['pre', ['code', 0]],
    };
  }

  public commands({ type, schema }: SchemaNodeTypeParams) {
    return () => toggleBlockItem({ type, toggleType: schema.nodes.paragraph });
  }

  public keys({ type, schema }: SchemaNodeTypeParams) {
    return {
      'Shift-Ctrl-\\': toggleBlockItem({ type, toggleType: schema.nodes.paragraph }),
    };
  }

  public styles(): Interpolation {
    return {
      [`${EDITOR_CLASS_SELECTOR} pre`]: {
        backgroundColor: '#000',
        borderRadius: '5px',
        padding: '.7rem 1rem',
        color: '#fff',
        fontSize: '.8rem',
        overflowX: 'auto',
      },
      [`${EDITOR_CLASS_SELECTOR} pre code`]: {
        display: 'block',
      },
    };
  }

  public inputRules({ type }: SchemaNodeTypeParams) {
    return [textblockTypeInputRule(/^```$/, type)];
  }
}
