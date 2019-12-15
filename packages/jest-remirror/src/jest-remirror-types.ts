import {
  ActionsFromExtensions,
  AnyExtension,
  Attrs,
  AttrsParams,
  CommandFunction,
  EditorSchema,
  EditorState,
  EditorStateParams,
  EditorViewParams,
  Extension,
  HelpersFromExtensions,
  MarkExtension,
  NodeExtension,
  ProsemirrorNode,
  SchemaFromExtensions,
} from '@remirror/core';
import { InjectedRemirrorProps } from '@remirror/react';
import { RenderResult } from '@testing-library/react/pure';
import { FireParams, TestEditorViewParams } from 'jest-prosemirror';
import { Node as PMNode } from 'prosemirror-model';

import { BaseExtensionNodeNames, BaseExtensionNodes } from './jest-remirror-schema';

export interface BaseFactoryParams<GSchema extends EditorSchema = EditorSchema> extends Partial<AttrsParams> {
  /**
   * The name of the node or mark
   */
  name: string;

  /**
   * The editor schema
   */
  schema: GSchema;
}

/**
 * A useful feature of the builder is being able to declaratively mark positions
 * in content using the angled braces e.g. `<cursor>`.
 *
 * These positions are called tags, and are tracked on every node in the tree that has a tag on any of its descendants.
 */
export interface Tags {
  [name: string]: number;
}

/**
 * Content that contains tagged information.
 */
export type TaggedContentItem = TaggedProsemirrorNode | TagTracker;

/**
 * The data structures of the tagged content
 */
export type TaggedContent = TaggedContentItem | Array<ProsemirrorNode | TaggedContentItem>;

/**
 * Tagged content with text as well
 */
export type TaggedContentWithText = string | TaggedContent;

/**
 * ProseMirror doesn't support empty text nodes, making it difficult to
 * capture a tagged position without introducing text.
 *
 * E.g.:
 *
 *     p('<cursor>')
 *     p('Hello ', '<cursor>', 'world!')
 *
 * After the tagged syntax is stripped we're left with:
 *
 *     p('')
 *     p('Hello ', '', 'world!')
 *
 * This violates the rule of text nodes being non-empty. This class solves the
 * problem by providing an alternative data structure that *only* stores tags,
 * and can be used in scenarios where an empty text would be forbidden.
 *
 * This is done under the hood when using `text()` factory, and instead of
 * always returning a text node, it'll instead return one of two things:
 *
 * - a text node -- when given a non-empty string
 * - a tag tracker -- when given a string that *only* contains tags.
 */
export class TagTracker {
  public tags!: Tags;
}

/**
 * A standard ProseMirror Node that also tracks tags.
 */
export interface TaggedProsemirrorNode<GSchema extends EditorSchema = EditorSchema> extends PMNode<GSchema> {
  tags: Tags;
}

export interface AddContentReturn<GExtension extends AnyExtension>
  extends EditorStateParams<SchemaFromExtensions<GExtension>>,
    EditorViewParams<SchemaFromExtensions<GExtension>> {
  /**
   * The current prosemirror document.
   */
  doc: ProsemirrorNode;

  /**
   * The actions available in the editor. When updating the content of the TestEditor make sure not to
   * use a stale copy of the actions otherwise it will throw errors due to using an outdated state.
   */
  actions: ActionsFromExtensions<GExtension>;

  /**
   * The helpers available in the editor. When updating the content of the TestEditor make sure not to
   * use a stale copy of the helpers object otherwise it will throw errors due to using an outdated state.
   */
  helpers: HelpersFromExtensions<GExtension>;

  /**
   * The start of the current selection
   */
  start: number;

  /**
   * The end of the current selection. For a cursor selection this will be the same as the start.
   */
  end: number;

  /**
   * All custom tags that have been added  *not including* the following
   * - `<start>`
   * - `<end>`
   * - `<node>`
   * - `<cursor>`
   * - `<all>`
   * - `<anchor>`
   *
   * Which are all part of the formal cursor and selection API.
   */
  tags: Tags;

  /**
   * Allows for the chaining of calls and is useful for running tests after
   * actions.
   *
   * You shouldn't use it to call any mutative functions that would change
   * the editor state.
   *
   * ```ts
   * const create = () => renderEditor({ plainNodes: [], others: [new EmojiExtension()] });
   * const {
   *   nodes: { p, doc },
   *   add,
   * } = create();
   *
   * add(doc(p('<cursor>'))).insertText(':-)')
   *   .callback(content => {
   *     expect(content.state.doc).toEqualRemirrorDocument(doc(p('😃')));
   *   })
   *   .insertText(' awesome')
   *   .callback(content => {
   *      expect(content.state.doc).toEqualRemirrorDocument(doc(p('😃 awesome')));
   *   });
   * ```
   */
  callback(
    fn: (
      content: Pick<
        AddContentReturn<GExtension>,
        'helpers' | 'actions' | 'end' | 'state' | 'tags' | 'start' | 'doc' | 'view'
      >,
    ) => void,
  ): AddContentReturn<GExtension>;

  /**
   * Allows for the chaining of action calls.
   */
  actionsCallback(
    callback: (actions: ActionsFromExtensions<GExtension>) => void,
  ): AddContentReturn<GExtension>;

  /**
   * Allows for the chaining of helper calls.
   */
  helpersCallback(
    callback: (helpers: HelpersFromExtensions<GExtension>) => void,
  ): AddContentReturn<GExtension>;

  /**
   * Set selection in the document to a certain position
   */
  jumpTo(pos: 'start' | 'end'): AddContentReturn<GExtension>;
  jumpTo(start: number, end?: number): AddContentReturn<GExtension>;

  /**
   * A function which replaces the current selection with the new content.
   *
   * This should be used to add new content to the dom.
   */
  replace(...content: string[] | TaggedProsemirrorNode[]): AddContentReturn<GExtension>;

  /**
   * Insert text at the current starting point for the cursor.
   * Text will be typed out with keys each firing a keyboard event.
   *
   * ! This doesn't currently support the use of tags and cursors.
   * ! Also adding multiple strings which create nodes also creates an out of position error
   */
  insertText(text: string): AddContentReturn<GExtension>;

  /**
   * Runs a keyboard shortcut.
   * e.g. `Mod-X`
   *
   * @param shortcut
   */
  shortcut(shortcut: string): AddContentReturn<GExtension>;

  /**
   * Presses a key on the keyboard.
   * e.g. `Mod-X`
   *
   * @param key - the key to press (or string representing a key)
   */
  press(key: string): AddContentReturn<GExtension>;

  /**
   * A simplistic implementation of pasting content into the editor.
   * Underneath it calls the paste handler `transformPaste` and that is all.
   *
   * @param content - The text or node to paste into the document at the current
   * selection.
   */
  paste(content: TaggedProsemirrorNode | string): AddContentReturn<GExtension>;

  /**
   * Takes any command as an input and dispatches it within the document context.
   *
   * @param command - the command function to run with the current state and view
   */
  dispatchCommand(command: CommandFunction): AddContentReturn<GExtension>;

  /**
   * Fires a custom event at the specified dom node.
   * e.g. `click`
   *
   * @param shortcut - the shortcut to type
   */
  fire(params: FireParams): AddContentReturn<GExtension>;

  /**
   * Simply calls add again which overwrites the whole doc
   */
  overwrite: AddContent<GExtension>;
}

export type AddContent<GExtension extends AnyExtension> = (
  content: TaggedProsemirrorNode<SchemaFromExtensions<GExtension>>,
) => AddContentReturn<GExtension>;

export type MarkWithAttrs<GNames extends string> = {
  [P in GNames]: (attrs?: Attrs) => (...content: TaggedContentWithText[]) => TaggedProsemirrorNode[];
};

export type NodeWithAttrs<GNames extends string> = {
  [P in GNames]: (attrs?: Attrs) => (...content: TaggedContentWithText[]) => TaggedProsemirrorNode;
};

export type MarkWithoutAttrs<GNames extends string> = {
  [P in GNames]: (...content: TaggedContentWithText[]) => TaggedProsemirrorNode[];
};

export type NodeWithoutAttrs<GNames extends string> = {
  [P in GNames]: (...content: TaggedContentWithText[]) => TaggedProsemirrorNode;
};

export type CreateTestEditorReturn<
  GPlainMarks extends Array<MarkExtension<any>>,
  GPlainNodes extends Array<NodeExtension<any>>,
  GAttrMarks extends Array<MarkExtension<any>>,
  GAttrNodes extends Array<NodeExtension<any>>,
  GOthers extends Array<Extension<any>>,
  GExtension extends GenericExtension<
    GPlainMarks,
    GPlainNodes,
    GAttrMarks,
    GAttrNodes,
    GOthers
  > = GenericExtension<GPlainMarks, GPlainNodes, GAttrMarks, GAttrNodes, GOthers>
> = Omit<InjectedRemirrorProps<GExtension>, 'view'> &
  TestEditorViewParams<SchemaFromExtensions<GExtension>> & {
    utils: RenderResult;
    add: AddContent<GExtension>;
    nodes: NodeWithoutAttrs<GetNames<GPlainNodes> | BaseExtensionNodeNames>;
    marks: MarkWithoutAttrs<GetNames<GPlainMarks>>;
    attrNodes: NodeWithAttrs<GetNames<GAttrNodes>>;
    attrMarks: MarkWithAttrs<GetNames<GAttrMarks>>;
    getState(): EditorState<SchemaFromExtensions<GExtension>>;
    schema: SchemaFromExtensions<GExtension>;
    p: (...content: TaggedContentWithText[]) => TaggedProsemirrorNode;
    doc: (...content: TaggedContentWithText[]) => TaggedProsemirrorNode;
  };

export type GetNames<GExtensions extends AnyExtension[]> = GExtensions[number]['name'];

export type GenericExtension<
  GPlainMarks extends Array<MarkExtension<any>>,
  GPlainNodes extends Array<NodeExtension<any>>,
  GAttrMarks extends Array<MarkExtension<any>>,
  GAttrNodes extends Array<NodeExtension<any>>,
  GOthers extends Array<Extension<any>>
> =
  | BaseExtensionNodes
  | GPlainMarks[number]
  | GPlainNodes[number]
  | GAttrMarks[number]
  | GAttrNodes[number]
  | GOthers[number];

export interface CreateTestEditorExtensions<
  GPlainMarks extends Array<MarkExtension<any>>,
  GPlainNodes extends Array<NodeExtension<any>>,
  GAttrMarks extends Array<MarkExtension<any>>,
  GAttrNodes extends Array<NodeExtension<any>>,
  GOthers extends Array<Extension<any>>
> {
  /**
   * Create marks which don't need any attributes
   */
  plainMarks: GPlainMarks;

  /**
   * Create nodes which don't take any attributes
   */
  plainNodes: GPlainNodes;

  /**
   * Create marks which take attributes in a curried function call.
   */
  attrMarks: GAttrMarks;

  /**
   * Create nodes which take attributes in a curried function call
   */
  attrNodes: GAttrNodes;

  /**
   * For plain extensions (non-mark and non-node).
   */
  others: GOthers;
}
