import { MarkSpec, MarkType, Node as PMNode, NodeSpec, NodeType } from 'prosemirror-model';
import { Plugin as PMPlugin } from 'prosemirror-state';
import { Decoration } from 'prosemirror-view';
import { NodeViewPortalContainer } from '../portal-container';
import { EditorView, InputRule, Mark, NodeView, Transaction } from './aliases';
import { AnyFunction, Attrs, EditorSchema, EditorState, ProsemirrorNode } from './base';
import { EditorViewParams, SchemaParams } from './builders';

/**
 * Used to apply the Prosemirror transaction to the current EditorState.
 */
export type DispatchFunction = (tr: Transaction) => void;

/**
 * This function encapsulate an editing action.
 * A command function takes an editor state and optionally a dispatch function that it can use to dispatch a transaction.
 * It should return a boolean that indicates whether it could perform any action.
 *
 * When no dispatch callback is passed, the command should do a 'dry run', determining whether it is applicable,
 * but not actually doing anything
 */
export type CommandFunction = (
  state: EditorState,
  dispatch: DispatchFunction | undefined,
  view: EditorView,
) => boolean;

/**
 * A map of keyboard bindings and their corresponding command functions (a.k.a editing actions).
 */
export type KeyboardBindings = Record<string, CommandFunction>;

type DOMOutputSpecPos1 = DOMOutputSpecPosX | { [attr: string]: string };
type DOMOutputSpecPosX = string | 0 | [string, 0] | [string, { [attr: string]: string }, 0];

/**
 * Defines the return type of the toDom methods for both Nodes and marks
 *
 * @remarks
 * This differs from the default Prosemirror type definition which seemed didn't work at the time of writing.
 *
 * Additionally we don't want to support domNodes in the toDOM spec since this will create problems once SSR is fully supported
 */
export type DOMOutputSpec =
  | string
  | [string, 0]
  | [string, { [attr: string]: string }, 0]
  | [
      string,
      DOMOutputSpecPos1?,
      DOMOutputSpecPosX?,
      DOMOutputSpecPosX?,
      DOMOutputSpecPosX?,
      DOMOutputSpecPosX?,
      DOMOutputSpecPosX?,
      DOMOutputSpecPosX?,
      DOMOutputSpecPosX?,
      DOMOutputSpecPosX?,
      DOMOutputSpecPosX?,
    ];

/**
 * The schema spec definition for a node extension
 */
export interface NodeExtensionSpec extends Omit<NodeSpec, 'toDOM'> {
  /**
   * Defines the default way a node of this type should be serialized
   * to DOM/HTML (as used by
   * [`DOMSerializer.fromSchema`](#model.DOMSerializer^fromSchema)).
   *
   * Should return a {@link DOMOutputSpec} that describes a DOM node, with an
   * optional number zero (“hole”) in it to indicate where the node's
   * content should be inserted.
   */
  toDOM?: (node: ProsemirrorNode) => DOMOutputSpec;
}

/**
 * The schema spec definition for a mark extension
 */
export interface MarkExtensionSpec extends Omit<MarkSpec, 'toDOM'> {
  /**
   * Defines the default way marks of this type should be serialized
   * to DOM/HTML.
   */
  toDOM?: (mark: Mark, inline: boolean) => DOMOutputSpec;
}

export interface ExtensionManagerParams extends SchemaParams {
  /**
   * Retrieve the portal container
   */
  getPortalContainer: () => NodeViewPortalContainer;
  /**
   * Retrieve the editor state via a function call
   */
  getEditorState: () => EditorState;
}

/**
 * Inject a view into the params of the views.
 */
export interface ViewExtensionManagerParams extends EditorViewParams, ExtensionManagerParams {}

export type FlexibleConfig<GFunc extends AnyFunction, GNames extends string = string> =
  | GFunc
  | GFunc[]
  | Record<GNames, GFunc | GFunc[]>;

export type ExtensionCommandFunction = (attrs?: Attrs) => CommandFunction;
export type ExtensionBooleanFunction = (attrs?: Attrs) => boolean;

type InferredType<GType> = GType extends {} ? { type: GType } : {};
export type SchemaTypeParams<GType> = ExtensionManagerParams & InferredType<GType>;

export type SchemaNodeTypeParams = SchemaTypeParams<NodeType<EditorSchema>>;
export type SchemaMarkTypeParams = SchemaTypeParams<MarkType<EditorSchema>>;

export interface CommandParams extends ExtensionManagerParams, EditorViewParams {
  /**
   * Returns true when the editor can be edited and false when it cannot.
   *
   * This is useful for deciding whether or not to run a command especially if the command is
   * resource intensive or slow.
   */
  isEditable: () => boolean;
}

/* Utility Types */

export type Key<GRecord> = keyof GRecord;
export type Value<GRecord> = GRecord[Key<GRecord>];

export type ElementUnion = Value<HTMLElementTagNameMap>;

export interface ActionMethods {
  /**
   * Runs an action within the editor.
   *
   * @remarks
   *
   * ```ts
   * actions.bold.command() // Make the currently selected text bold
   * ```
   *
   * @param attrs - certain commands require attrs to run
   */
  command(attrs?: Attrs): void;

  /**
   * Determines whether the command is currently in an active state.
   *
   * @remarks
   * This could be used used for menu items to determine whether they should be highlighted as active or inactive.
   */
  isActive(attrs?: Attrs): boolean;

  /**
   * Returns true when the command can be run and false when it can't be run.
   *
   * @remarks
   * Some commands can have rules and restrictions. For example you may want to disable styling making text bold
   * when within a codeBlock. In that case isEnabled would be false when within the codeBlock and true when outside.
   */
  isEnabled(attrs?: Attrs): boolean;
}

/**
 * The method signature used to call the Prosemirror `nodeViews`
 */
export type NodeViewMethod<GNodeView extends NodeView = NodeView> = (
  node: ProsemirrorNode,
  view: EditorView,
  getPos: () => number,
  decorations: Decoration[],
) => GNodeView;

export type RemirrorActions<GKeys extends string = string> = Record<GKeys, ActionMethods>;

/**
 * Marks are categorized into different groups. One motivation for this was to allow the `code` mark
 * to exclude other marks, without needing to explicitly name them. Explicit naming requires the
 * named mark to exist in the schema. This is undesirable because we want to construct different
 * schemas that have different sets of nodes/marks.
 */
export enum MarkGroup {
  FONT_STYLE = 'fontStyle',
  SEARCH_QUERY = 'searchQuery',
  LINK = 'link',
  COLOR = 'color',
  ALIGNMENT = 'alignment',
  INDENTATION = 'indentation',
}

/**
 * Defines the type of the extension.
 */
export enum ExtensionType {
  NODE = 'node',
  MARK = 'mark',
  EXTENSION = 'extension',
}

export type GetAttrs = Attrs | ((p: string[] | string) => Attrs | null | undefined);

export type InputRuleCreator = (
  regexp: RegExp,
  nodeType: NodeType,
  getAttrs?: GetAttrs,
  joinPredicate?: (p1: string[], p2: PMNode) => boolean,
) => InputRule;

export type PluginCreator = <GType extends NodeType | MarkType>(
  regexp: RegExp,
  nodeType: GType,
  getAttrs?: GetAttrs,
  joinPredicate?: (p1: string[], p2: PMNode) => boolean,
) => PMPlugin;

export * from './aliases';
export * from './base';
export * from './builders';
