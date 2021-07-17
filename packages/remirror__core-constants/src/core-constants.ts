/**
 * The css class added to a node that is selected.
 */
export const SELECTED_NODE_CLASS_NAME = 'ProseMirror-selectednode';

/**
 * The css selector for a selected node.
 */
export const SELECTED_NODE_CLASS_SELECTOR = `.${SELECTED_NODE_CLASS_NAME}`;

/**
 * ProseMirror uses the Unicode Character 'OBJECT REPLACEMENT CHARACTER'
 * (U+FFFC) as text representation for leaf nodes, i.e. nodes that don't have
 * any content or text property (e.g. hardBreak, emoji, mention, rule) It was
 * introduced because of https://github.com/ProseMirror/prosemirror/issues/262
 * This can be used in an input rule regex to be able to include or exclude such
 * nodes.
 */
export const LEAF_NODE_REPLACING_CHARACTER = '\uFFFC';

/**
 * The null character.
 *
 * See {@link https://stackoverflow.com/a/6380172}
 */
export const NULL_CHARACTER = '\0';

/**
 * Indicates that a state update was caused by an override and not via
 * transactions or user commands.
 *
 * This is the case when `setContent` is called and for all `controlled` updates
 * within a `react` editor instance.
 */
export const STATE_OVERRIDE = '__state_override__';

/**
 * The global name for the module exported by the remirror webview bundle.
 */
export const REMIRROR_WEBVIEW_NAME = '$$__REMIRROR_WEBVIEW_BUNDLE__$$';

/**
 * A character useful for separating inline nodes.
 *
 * @remarks
 * Typically used in decorations as follows.
 *
 * ```ts
 * document.createTextNode(ZERO_WIDTH_SPACE_CHAR);
 * ```
 *
 * This produces the html entity '8203'
 */
export const ZERO_WIDTH_SPACE_CHAR = '\u200B';

/**
 * The non breaking space character.
 */
export const NON_BREAKING_SPACE_CHAR = '\u00A0';

/**
 * A default empty object node. Useful for resetting the content of a
 * prosemirror document.
 */
export const EMPTY_PARAGRAPH_NODE = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
    },
  ],
};

export const EMPTY_NODE = {
  type: 'doc',
  content: [],
};

/**
 * The type for the extension tags..
 */
export type ExtensionTag = Remirror.ExtensionTags & typeof BaseExtensionTag;

/**
 * A method for updating the extension tags.
 *
 * ```tsx
 * import { ExtensionTag, mutateTag } from 'remirror';
 *
 * mutateTag((tag) => {
 *   tag.SuperCustom = 'superCustom';
 * });
 *
 * declare global {
 *   namespace Remirror {
 *     interface ExtensionTag {
 *       SuperCustom: 'superCustom';
 *     }
 *   }
 * }
 *
 *
 * log(ExtensionTag.SuperCustom); // This is fine ✅
 * log(ExtensionTag.NotDefined); // This will throw ❌
 * ```
 */
export function mutateTag(mutator: (Tag: ExtensionTag) => void): void {
  mutator(BaseExtensionTag);
}

const BaseExtensionTag = {
  /**
   * Describes a node that can be used as the last node of a document and
   * doesn't need to have anything else rendered after itself.
   *
   * @remarks
   *
   * e.g. `paragraph`
   */
  LastNodeCompatible: 'lastNodeCompatible',

  /**
   * A mark that is used to change the formatting of the node it wraps.
   *
   * @remarks
   *
   * e.g. `bold`, `italic`
   */
  FormattingMark: 'formattingMark',

  /**
   * A node that formats text in a non-standard way.
   *
   * @remarks
   *
   * e.g. `codeBlock`, `heading`, `blockquote`
   */
  FormattingNode: 'formattingNode',

  /**
   * Identifies a node which has problems with cursor navigation.
   *
   * @remarks
   *
   * When this tag is added to an extension this will be picked up by
   * behavioural extensions such as the NodeCursorExtension which makes hard to
   * reach nodes reachable using keyboard arrows.
   */
  NodeCursor: 'nodeCursor',

  /**
   * Mark group for font styling (e.g. bold, italic, underline, superscript).
   */
  FontStyle: 'fontStyle',

  /**
   * Mark groups for links.
   */
  Link: 'link',

  /**
   * Mark groups for colors (text-color, background-color, etc).
   */
  Color: 'color',

  /**
   * Mark group for alignment.
   */
  Alignment: 'alignment',

  /**
   * Mark group for indentation.
   */
  Indentation: 'indentation',

  /**
   * Extension which affect the behaviour of the content. Can be nodes marks or
   * plain.
   */
  Behavior: 'behavior',

  /**
   * Marks and nodes which contain code.
   */
  Code: 'code',

  /**
   * Whether this node is an inline node.
   *
   * - `text` is an inline node, but `paragraph` is a block node.
   */
  InlineNode: 'inline',

  /**
   * This is a node that can contain list items.
   */
  ListContainerNode: 'listContainer',

  /**
   * Tags the extension as a list item node which can be contained by
   * [[`ExtensionTag.ListNode`]].
   */
  ListItemNode: 'listItemNode',

  /**
   * Sets this as a block level node.
   */
  Block: 'block',

  /**
   * @deprecate use `ExtensionTags.Block` instead.
   */
  BlockNode: 'block',

  /**
   * Set this as a text block
   */
  TextBlock: 'textBlock',

  /**
   * A tag that excludes this from input rules.
   */
  ExcludeInputRules: 'excludeFromInputRules',

  /**
   * A mark or node that can't  be exited when at the end and beginning of the
   * document with an arrow key or backspace key.
   */
  PreventExits: 'preventsExits',

  /**
   * Represents a media compatible node.
   */
  Media: 'media',

  /**
   * Represents a node that can be given a caption
   */
  CaptionCompatible: 'captionCompatible',
} as const;

/**
 * These are the default supported tag strings which help categorize different
 * behaviors that extensions can exhibit.
 *
 * @remarks
 *
 * Any extension can register itself with multiple such behaviors and these
 * categorizations can be used by other extensions when running commands and
 * updating the document.
 */
export const ExtensionTag = BaseExtensionTag as ExtensionTag;

/**
 * The string values which can be used as extension tags.
 */
export type ExtensionTagType = ExtensionTag[keyof ExtensionTag];

/**
 * The identifier key which is used to check objects for whether they are a
 * certain type.
 *
 * @remarks
 *
 * Just pretend you don't know this exists.
 *
 * @internal
 */
export const __INTERNAL_REMIRROR_IDENTIFIER_KEY__: unique symbol = Symbol.for('__remirror__');

/**
 * These constants are stored on the `REMIRROR_IDENTIFIER_KEY` property of
 * `remirror` related constructors and instances in order to identify them as
 * being internal to Remirror.
 *
 * @remarks
 *
 * This helps to prevent issues around check types via `instanceof` which can
 * lead to false negatives.
 *
 * @internal
 */
export enum RemirrorIdentifier {
  /**
   * Identifies `PlainExtension`s.
   */
  PlainExtension = 'RemirrorPlainExtension',

  /**
   * Identifies `NodeExtension`s.
   */
  NodeExtension = 'RemirrorNodeExtension',

  /**
   * Identifies `MarkExtension`s.
   */
  MarkExtension = 'RemirrorMarkExtension',

  /**
   * Identifies `PlainExtensionConstructor`s.
   */
  PlainExtensionConstructor = 'RemirrorPlainExtensionConstructor',

  /**
   * Identifies `NodeExtensionConstructor`s.
   */
  NodeExtensionConstructor = 'RemirrorNodeExtensionConstructor',

  /**
   * Identifies `MarkExtensionConstructor`s.
   */
  MarkExtensionConstructor = 'RemirrorMarkExtensionConstructor',

  /**
   * The string used to identify an instance of the `Manager`
   */
  Manager = 'RemirrorManager',

  /**
   * The preset type identifier.
   */
  Preset = 'RemirrorPreset',

  /**
   * The preset type identifier.
   */
  PresetConstructor = 'RemirrorPresetConstructor',
}

/**
 * The priority of extension which determines what order it is loaded into the
 * editor.
 *
 * @remarks
 *
 * Higher priority extension (higher numberic value) will ensure the extension
 * has a higher preference in your editor. In the case where you load two
 * identical extensions into your editor (same name, or same constructor), the
 * extension with the  higher priority is the one that will be loaded.
 *
 * The higher the numeric value the higher the priority. The priority can also
 * be passed a number but naming things in this `enum` should help provide some
 * context to the numbers.
 *
 * By default all extensions are created with a `ExtensionPriority.Default`.
 */
export enum ExtensionPriority {
  /**
   * Use this **never** 😉
   */
  Critical = 1_000_000,

  /**
   * A, like super duper, high priority.
   */
  Highest = 100_000,

  /**
   * The highest priority level that should be used in a publicly shared
   * extension (to allow some wiggle room for downstream users overriding
   * priorities).
   */
  High = 10_000,

  /**
   * A medium priority extension. This is typically all you need to take
   * priority over built in extensions.
   */
  Medium = 1000,

  /**
   * This is the **default** priority for most extensions.
   */
  Default = 100,

  /**
   * This is the **default** priority for builtin behavior changing extensions.
   */
  Low = 10,

  /**
   * This is useful for extensions that exist to be overridden.
   */
  Lowest = 0,
}

/**
 * Identifies the stage the extension manager is at.
 */
export enum ManagerPhase {
  /**
   * The initial value for the manager phase.
   */
  None,

  /**
   * When the extension manager is being created and the onCreate methods are
   * being called.
   *
   * This happens within the RemirrorManager constructor.
   */
  Create,

  /**
   * When the view is being added and all `onView` lifecycle methods are being
   * called. The view is typically added before the dom is ready for it.
   */
  EditorView,

  /**
   * The phases of creating this manager are completed and `onTransaction` is
   * called every time the state updates.
   */
  Runtime,

  /**
   * The manager is being destroyed.
   */
  Destroy,
}

/**
 * The named shortcuts that can be used to update multiple commands.
 */
export enum NamedShortcut {
  Undo = '_|undo|_',
  Redo = '_|redo|_',
  Bold = '_|bold|_',
  Italic = '_|italic|_',
  Underline = '_|underline|_',
  Strike = '_|strike|_',
  Code = '_|code|_',
  Paragraph = '_|paragraph|_',
  H1 = '_|h1|_',
  H2 = '_|h2|_',
  H3 = '_|h3|_',
  H4 = '_|h4|_',
  H5 = '_|h5|_',
  H6 = '_|h6|_',
  TaskList = '_|task|_',
  BulletList = '_|bullet|_',
  OrderedList = '_|number|_',
  Quote = '_|quote|_',
  Divider = '_|divider|_',
  Codeblock = '_|codeblock|_',
  ClearFormatting = '_|clear|_',
  Superscript = '_|sup|_',
  Subscript = '_|sub|_',
  LeftAlignment = '_|left-align|_',
  CenterAlignment = '_|center-align|_',
  RightAlignment = '_|right-align|_',
  JustifyAlignment = '_|justify-align|_',
  InsertLink = '_|link|_',
  Find = '_|find|_',
  FindBackwards = '_|find-backwards|_',
  FindReplace = '_|find-replace|_',
  AddFootnote = '_|footnote|_',
  AddComment = '_|comment|_',
  ContextMenu = '_|context-menu|_',
  IncreaseFontSize = '_|inc-font-size|_',
  DecreaseFontSize = '_|dec-font-size|_',
  IncreaseIndent = '_|indent|_',
  DecreaseIndent = '_|dedent|_',
  Shortcuts = '_|shortcuts|_',
  Copy = '_|copy|_',
  Cut = '_|cut|_',
  Paste = '_|paste|_',
  PastePlain = '_|paste-plain|_',
  SelectAll = '_|select-all|_',

  /**
   * A keyboard shortcut to trigger formatting the current block.
   *
   * @default 'Alt-Shift-F' (Mac) | 'Shift-Ctrl-F' (PC)
   */
  Format = '_|format|_',
}

/**
 * Helpful empty array for use when a default array value is needed.
 *
 * DO NOT MUTATE!
 */
export const EMPTY_ARRAY: never[] = [];

declare global {
  namespace Remirror {
    /**
     * This interface is for extending the default `ExtensionTag`'s in your
     * codebase with full type checking support.
     */
    interface ExtensionTags {}
  }
}
