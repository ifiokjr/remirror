import {
  ApplySchemaAttributes,
  CommandFunction,
  extensionDecorator,
  InputRule,
  NodeExtension,
  NodeExtensionSpec,
  NodeGroup,
  nodeInputRule,
} from '@remirror/core';

/**
 * An extension for the remirror editor. CHANGE ME.
 */
@extensionDecorator({})
export class HorizontalRuleExtension extends NodeExtension {
  get name() {
    return 'horizontalRule' as const;
  }

  createNodeSpec(extra: ApplySchemaAttributes): NodeExtensionSpec {
    return {
      attrs: extra.defaults(),
      group: NodeGroup.Block,
      parseDOM: [{ tag: 'hr', getAttrs: extra.parse }],
      toDOM: (node) => ['hr', extra.dom(node)],
    };
  }

  createCommands() {
    return {
      horizontalRule: (): CommandFunction => ({ state, dispatch }) => {
        if (dispatch) {
          dispatch(state.tr.replaceSelectionWith(this.type.create()));
        }

        return true;
      },
    };
  }

  createInputRules(): InputRule[] {
    return [nodeInputRule({ regexp: /^(?:---|___\s|\*\*\*\s)$/, type: this.type })];
  }
}
