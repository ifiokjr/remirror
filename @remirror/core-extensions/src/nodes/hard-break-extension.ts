import { ExtensionManagerNodeTypeParams, KeyboardBindings,NodeExtension, NodeExtensionSpec } from '@remirror/core';
import { chainCommands, exitCode } from 'prosemirror-commands';

export class HardBreakExtension extends NodeExtension {
  get name() {
    return 'hardBreak' as const;
  }

  get schema(): NodeExtensionSpec {
    return {
      attrs: this.extraAttrs(),
      inline: true,
      group: 'inline',
      selectable: false,
      parseDOM: [{ tag: 'br' }],
      toDOM: () => ['br'],
    };
  }

  public keys({ type }: ExtensionManagerNodeTypeParams):KeyboardBindings {
    const command = chainCommands(exitCode, (state, dispatch) => {
      if (dispatch) {
        dispatch(state.tr.replaceSelectionWith(type.create()).scrollIntoView());
      }

      return true;
    });
    return {
      'Mod-Enter': command,
      'Shift-Enter': command,
    };
  }
}
