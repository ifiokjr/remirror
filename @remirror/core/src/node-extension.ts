import { NodeType } from 'prosemirror-model';
import { nodeActive } from './document-helpers';
import { Extension } from './extension';
import {
  EditorSchema,
  ExtensionBooleanFunction,
  ExtensionType,
  FlexibleConfig,
  NodeExtensionSpec,
  SchemaParams,
} from './types';

export type ExtraAttrs = Array<string | [string, string]>;

export interface NodeExtensionOptions {
  /**
   * Inject additional attributes.
   */
  extraAttrs?: ExtraAttrs;
}

export abstract class NodeExtension<
  GOptions extends NodeExtensionOptions = NodeExtensionOptions
> extends Extension<GOptions, NodeType<EditorSchema>> {
  get type() {
    return ExtensionType.NODE;
  }

  /**
   * Allows for the
   */
  protected extraAttrs() {
    const extraAttrs = this.options.extraAttrs!;
    const attrs: Record<string, { default?: unknown }> = {};
    if (!extraAttrs) {
      return attrs;
    }

    for (const item of extraAttrs) {
      if (Array.isArray(item)) {
        attrs[item[0]] = { default: attrs[1] };
      } else {
        attrs[item] = {};
      }
    }
    return attrs;
  }

  public abstract readonly schema: NodeExtensionSpec;

  public active({ getEditorState, schema }: SchemaParams): FlexibleConfig<ExtensionBooleanFunction> {
    return attrs => nodeActive(getEditorState(), schema.nodes.name, attrs);
  }
}
