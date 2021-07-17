import {
  ApplySchemaAttributes,
  extension,
  ExtensionTag,
  NodeExtension,
  NodeExtensionSpec,
  NodeSpecOverride,
} from '@remirror/core';

export interface FigcaptionOptions {}

/**
 * An extension to annotate content with a caption
 */
@extension<FigcaptionOptions>({})
export class FigcaptionExtension extends NodeExtension<FigcaptionOptions> {
  get name() {
    return 'figcaption' as const;
  }

  readonly tags = [ExtensionTag.Block];

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): NodeExtensionSpec {
    return {
      content: 'paragraph',
      draggable: false,
      ...override,
      attrs: extra.defaults(),
      parseDOM: [{ tag: 'figcaption', getAttrs: extra.parse }, ...(override.parseDOM ?? [])],
      toDOM: (node) => ['figcaption', extra.dom(node), 0],
    };
  }
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      figcaption: FigcaptionExtension;
    }
  }
}
