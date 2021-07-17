import {
  ApplySchemaAttributes,
  command,
  CommandFunction,
  CreateExtensionPlugin,
  extension,
  ExtensionPriority,
  ExtensionTag,
  findChildren,
  findNodeAtSelection,
  getActiveNode,
  isNodeSelection,
  isTextSelection,
  keyBinding,
  KeyBindingProps,
  NodeExtension,
  NodeExtensionSpec,
  NodeSpecOverride,
  ProsemirrorNode,
} from '@remirror/core';
import { Fragment, Slice } from '@remirror/pm/model';
import { TextSelection } from '@remirror/pm/state';

import { FigcaptionExtension } from './figcaption-extension';

export interface CaptionOptions {}

/**
 * An extension to annotate content with a caption
 */
@extension<CaptionOptions>({})
export class CaptionExtension extends NodeExtension<CaptionOptions> {
  get name() {
    return 'caption' as const;
  }

  readonly tags = [ExtensionTag.Block];

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): NodeExtensionSpec {
    return {
      content: 'captionCompatible figcaption',
      defining: true,
      draggable: false,
      ...override,
      attrs: extra.defaults(),
      parseDOM: [{ tag: 'figure', getAttrs: extra.parse }, ...(override.parseDOM ?? [])],
      toDOM: (node) => ['figure', extra.dom(node), 0],
    };
  }

  createExtensions() {
    return [new FigcaptionExtension({ priority: ExtensionPriority.Low })];
  }

  @command()
  toggleCaption(): CommandFunction {
    return (props) => {
      const { tr } = props;

      if (!isNodeSelection(tr.selection)) {
        return false;
      }

      const activeNode = getActiveNode({ state: tr, type: this.type });

      if (activeNode) {
        return this.removeCaption()(props);
      }

      return this.addCaption()(props);
    };
  }

  @command()
  addCaption(text = ''): CommandFunction {
    return ({ tr, dispatch }) => {
      if (!isNodeSelection(tr.selection)) {
        return false;
      }

      const { node, $from } = tr.selection;

      if (!this.isCaptionCompatibleNode(node)) {
        return false;
      }

      const activeNode = getActiveNode({ state: tr, type: this.type });

      // If already a caption, append text to existing caption text
      if (activeNode) {
        const { node, pos } = activeNode;
        tr.setSelection(TextSelection.create(tr.doc, pos + node.nodeSize - 3));
        dispatch?.(tr.insertText(text));
        return true;
      }

      // If not captioned, wrap selected node and append caption text
      const captionNode = this.type.create(null, node);
      const slice = new Slice(Fragment.from(captionNode), 0, 1);
      const { pos } = $from;

      if (dispatch) {
        tr.replace(pos, pos + 1, slice);
        tr.setSelection(TextSelection.create(tr.doc, pos + captionNode.nodeSize + 1));
        dispatch(tr.insertText(text));
      }

      return true;
    };
  }

  @command()
  removeCaption(): CommandFunction {
    return ({ tr, dispatch }) => {
      const activeNode = getActiveNode({ state: tr, type: this.type });

      if (!activeNode) {
        return false;
      }

      const { node, pos, end } = activeNode;
      const captionCompatibleNode = findChildren({
        node,
        predicate: ({ node }) => this.isCaptionCompatibleNode(node),
      })[0];

      if (!captionCompatibleNode) {
        return false;
      }

      const slice = new Slice(Fragment.from(captionCompatibleNode.node), 0, 0);
      dispatch?.(tr.replace(pos, end, slice));
      return true;
    };
  }

  /**
   * Handle the backspace key when deleting caption text.
   */
  @keyBinding({ shortcut: 'Backspace' })
  handleBackspace(props: KeyBindingProps): boolean {
    const { tr, dispatch } = props;
    const activeNode = getActiveNode({ state: tr, type: this.type });

    // If not in a caption context return false and let other extension
    // (ie: BaseKeymapExtension) do the deleting operation.
    if (!activeNode) {
      return false;
    }

    // If deleting the captionCompatible node itself, remove everything
    // Else we are deleting the caption text
    if (isNodeSelection(tr.selection) && this.isCaptionCompatibleNode(tr.selection.node)) {
      const { pos, end } = activeNode;
      dispatch?.(tr.replaceRange(pos, end, Slice.empty));
      return true;
    }

    if (!(isTextSelection(tr.selection) && tr.selection.empty)) {
      return false;
    }

    // If deleting in middle of caption text, resume default behaviour
    if (tr.selection.$from.parentOffset !== 0) {
      return false;
    }

    const captionTextNode = findNodeAtSelection(tr.selection);

    // If deleting from start of caption text, remove image and lift caption
    if (captionTextNode?.node.content.size > 0) {
      const { pos, end } = activeNode;
      dispatch?.(tr.replaceRangeWith(pos, end, captionTextNode.node));
      return true;
    }

    // Lift captionable node
    return this.removeCaption()(props);
  }

  /**
   * Handle the Enter key within in the caption text
   */
  @keyBinding({ shortcut: 'Enter' })
  handleEnter({ tr, dispatch }: KeyBindingProps): boolean {
    const activeNode = getActiveNode({ state: tr, type: this.type });

    // If not in a caption context return false and let other extension
    // (ie: BaseKeymapExtension) do the deleting operation.
    if (!activeNode) {
      return false;
    }

    if (!(isTextSelection(tr.selection) && tr.selection.empty)) {
      return false;
    }

    const captionTextNode = findNodeAtSelection(tr.selection);

    if (!captionTextNode) {
      return false;
    }

    if (dispatch) {
      const { node, end } = captionTextNode;
      const { textOffset, pos, nodeAfter } = tr.selection.$from;
      tr.insert(activeNode.end, nodeAfter ? node.cut(textOffset) : node.type.create());
      tr.setSelection(TextSelection.create(tr.doc, pos, end));
      dispatch(tr.deleteSelection());
    }

    return true;
  }

  createPlugin(): CreateExtensionPlugin {
    return {
      props: {
        handleTextInput: (view, _from, _to, text) => {
          const { state, dispatch } = view;
          return this.addCaption(text)({ state, dispatch, tr: state.tr });
        },
      },
    };
  }

  private isCaptionCompatibleNode(node: ProsemirrorNode): boolean {
    const captionCompatibleNodes = this.store.tags[ExtensionTag.CaptionCompatible];
    return captionCompatibleNodes.includes(node.type.name);
  }
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      caption: CaptionExtension;
    }
  }
}
