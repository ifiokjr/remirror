import {
  DOMParser,
  DOMSerializer,
  Fragment,
  Mark,
  MarkType,
  Node as PMNode,
  NodeType,
  Slice,
} from 'prosemirror-model';
import {
  EditorState as PMEditorState,
  Plugin,
  Selection as PMSelection,
  TextSelection,
} from 'prosemirror-state';
import { EMPTY_PARAGRAPH_NODE } from '../constants';
import {
  EditorSchema,
  EditorState,
  EditorViewParams,
  ElementParams,
  FixedCoordsParams,
  FromToParams,
  NodeMatch,
  ObjectNode,
  PlainObject,
  PluginKey,
  ProsemirrorNode,
  RegexTuple,
  RemirrorContentType,
  ResolvedPos,
  SchemaParams,
  Selection,
  Transaction,
} from '../types';
import { bool, Cast, isFunction, isNumber, isObject, isString } from './base';

/**
 * Checks to see if the passed value is a ProsemirrorNode
 *
 * @param value - the value to check
 *
 * @public
 */
export const isProsemirrorNode = (value: unknown): value is ProsemirrorNode =>
  isObject(value) && value instanceof PMNode;

/**
 * Checks to see if the passed value is a Prosemirror Editor State
 *
 * @param value - the value to check
 *
 * @public
 */
export const isEditorState = (value: unknown): value is EditorState =>
  isObject(value) && value instanceof PMEditorState;

/**
 * Predicate checking whether the selection is a TextSelection
 *
 * @param value - the value to check
 *
 * @public
 */
export const isTextSelection = (value: unknown): value is TextSelection<EditorSchema> =>
  isObject(value) && value instanceof TextSelection;

/**
 * Predicate checking whether the selection is a Selection
 *
 * @param value - the value to check
 *
 * @public
 */
export const isSelection = (value: unknown): value is Selection =>
  isObject(value) && value instanceof PMSelection;

/**
 * Checks that a mark is active within the selected region, or the current selection point is within a
 * region with the mark active. Used by extensions to implement their active methods.
 *
 * @remarks
 * "Borrowed" from [tiptap](https://github.com/scrumpy/tiptap)
 *
 * @param state - the editor state
 * @param type - the mark type
 *
 * @public
 */
export const markActive = (state: EditorState, type: MarkType) => {
  const { from, $from, to, empty } = state.selection;
  return bool(
    empty ? type.isInSet(state.storedMarks || $from.marks()) : state.doc.rangeHasMark(from, to, type),
  );
};

/**
 * Check if the specified type (NodeType) can be inserted at the current selection point.
 *
 * @remarks
 * "Borrowed" from [tiptap](https://github.com/scrumpy/tiptap)
 *
 * @param state - the editor state
 * @param type - the node type
 *
 * @public
 */
export const canInsertNode = (state: EditorState, type: NodeType) => {
  const { $from } = state.selection;
  for (let d = $from.depth; d >= 0; d--) {
    const index = $from.index(d);
    try {
      if ($from.node(d).canReplaceWith(index, index, type)) {
        return true;
      }
    } catch {
      return false;
    }
  }
  return false;
};

/**
 * Checks if a node looks like an empty document
 *
 * @param node - the prosemirror node
 *
 * @public
 */
export const isDocNodeEmpty = (node: ProsemirrorNode) => {
  const nodeChild = node.content.firstChild;

  if (node.childCount !== 1 || !nodeChild) {
    return false;
  }

  return (
    nodeChild.type.isBlock &&
    !nodeChild.childCount &&
    nodeChild.nodeSize === 2 &&
    (!nodeChild.marks || nodeChild.marks.length === 0)
  );
};

/**
 * Checks if the current node a paragraph node and empty
 *
 * @param node - the prosemirror node
 *
 * @public
 */
export const isEmptyParagraphNode = (node: ProsemirrorNode | null | undefined) => {
  return (
    !isProsemirrorNode(node) || (node.type.name === 'paragraph' && !node.textContent && !node.childCount)
  );
};

/**
 * Retrieve the attributes for a mark.
 *
 * "Borrowed" from [tiptap](https://github.com/scrumpy/tiptap)
 *
 * @param state - the editor state
 * @param type - the mark type
 */
export const getMarkAttrs = (state: EditorState, type: MarkType) => {
  const { from, to } = state.selection;
  let marks: Mark[] = [];

  state.doc.nodesBetween(from, to, node => {
    marks = [...marks, ...node.marks];
  });

  const mark = marks.find(markItem => markItem.type.name === type.name);

  if (mark) {
    return mark.attrs;
  }

  return {};
};

/**
 * Retrieve the start and end position of a mark
 *
 * @remarks
 * "Borrowed" from [tiptap](https://github.com/scrumpy/tiptap)
 *
 * @param pmPosition - the resolved prosemirror position
 * @param type - the mark type
 */
export const getMarkRange = (
  pmPosition: ResolvedPos | null = null,
  type: MarkType | null | undefined = null,
): FromToParams | false => {
  if (!pmPosition || !type) {
    return false;
  }

  const start = pmPosition.parent.childAfter(pmPosition.parentOffset);

  if (!start.node) {
    return false;
  }

  const mark = start.node.marks.find(({ type: markType }) => markType === type);
  if (!mark) {
    return false;
  }

  let startIndex = pmPosition.index();
  let startPos = pmPosition.start() + start.offset;
  while (startIndex > 0 && mark.isInSet(pmPosition.parent.child(startIndex - 1).marks)) {
    startIndex -= 1;
    startPos -= pmPosition.parent.child(startIndex).nodeSize;
  }

  const endPos = startPos + start.node.nodeSize;

  return { from: startPos, to: endPos };
};

/**
 * Retrieves the text content from a slice
 *
 * @remarks
 * A utility that's useful for pulling text content from a slice which is usually created via `selection.content()`
 *
 * @param slice - the prosemirror slice
 *
 * @public
 */
export const getTextContentFromSlice = (slice: Slice) => {
  const node = slice.content.firstChild;
  return node ? node.textContent : '';
};

/**
 * Takes an empty selection and expands it out to the nearest group not matching the excluded characters.
 *
 * @remarks
 * Can be used to find the nearest selected word. See {@link getSelectedWord}
 *
 * @param state - the editor state
 * @param exclude - the regex pattern to exclude
 * @returns false if not a text selection or if no expansion available
 *
 * @public
 */
export const getSelectedGroup = (state: EditorState, exclude: RegExp): FromToParams | false => {
  if (!isTextSelection(state.selection)) {
    return false;
  }

  let { from, to } = state.selection;

  const createChar = (start: number, end: number) =>
    getTextContentFromSlice(TextSelection.create(state.doc, start, end).content());

  // Keep going until reaching first excluded character or empty text content.
  for (
    let char = createChar(from - 1, from);
    char && !exclude.test(char);
    from--, char = createChar(from - 1, from)
  ) {}

  for (let char = createChar(to, to + 1); char && !exclude.test(char); to++, char = createChar(to, to + 1)) {}

  if (from === to) {
    return false;
  }

  return { from, to };
};

/**
 * Retrieves the nearest space separated word from the current selection.
 *
 * @remarks
 * This always expands outward so that given:
 * `The tw<start>o words<end>`
 * The selection would become
 * `The <start>two words<end>`
 *
 * In other words it expands until it meets an invalid character.
 *
 * @param state - the editor state
 *
 * @public
 */
export const getSelectedWord = (state: EditorState) => {
  return getSelectedGroup(state, /[\s\0]/);
};

/**
 * Retrieve plugin state of specified type
 *
 * @param plugin - the plugin or plugin key
 * @param state - the editor state
 *
 * @public
 */
export const getPluginState = <GState>(plugin: Plugin | PluginKey, state: EditorState): GState =>
  plugin.getState(state);

/**
 * Retrieve plugin meta data of specified type
 *
 * @param key - the plugin key
 * @param tr - the transaction to retrieve from
 *
 * @public
 */
export const getPluginMeta = <GMeta>(key: PluginKey | Plugin | string, tr: Transaction): GMeta =>
  tr.getMeta(key);

/**
 * Set the plugin meta data
 *
 * @param key - the plugin key
 * @param tr - the transaction
 * @param data - the data to set
 *
 * @public
 */
export const setPluginMeta = <GMeta>(
  key: PluginKey | Plugin | string,
  tr: Transaction,
  data: GMeta,
): Transaction => tr.setMeta(key, data);

/**
 * Get matching string from a list or single value
 *
 * @remarks
 * Get attrs can be called with a direct match string or array of string matches.
 * This method should be used to retrieve the required string.
 *
 * The index of the matched array used defaults to 0 but can be updated via the second parameter.
 *
 * @param match - the match(es)
 * @param index - the zero-index point from which to start
 *
 * @public
 */
export const getMatchString = (match: string | string[], index = 0) =>
  Array.isArray(match) ? match[index] : match;

/**
 * Checks whether the passed value is a valid dom node
 *
 * @param domNode - the dom node
 *
 * @public
 */
export const isDOMNode = (domNode: unknown): domNode is Node =>
  isObject(Node)
    ? domNode instanceof Node
    : isObject(domNode) && isNumber(Cast(domNode).nodeType) && isString(Cast(domNode).nodeName);

/**
 * Finds the closest element which matches the passed selector
 *
 * @param domNode - the dom node
 * @param selector - the selector
 *
 * @public
 */
export const closestElement = (domNode: Node | null | undefined, selector: string): HTMLElement | null => {
  if (!isElementDOMNode(domNode)) {
    return null;
  }
  if (!document.documentElement || !document.documentElement.contains(domNode)) {
    return null;
  }
  const matches = domNode.matches ? 'matches' : Cast<'matches'>('msMatchesSelector');

  do {
    if (domNode[matches] && domNode[matches](selector)) {
      return domNode;
    }
    domNode = (domNode.parentElement || domNode.parentNode) as HTMLElement;
  } while (isElementDOMNode(domNode));
  return null;
};

/**
 * Checks for an element node like `<p>` or `<div>`.
 *
 * @param domNode - the dom node
 *
 * @public
 */
export const isElementDOMNode = (domNode: unknown): domNode is HTMLElement =>
  isDOMNode(domNode) && domNode.nodeType === Node.ELEMENT_NODE;

/**
 * Checks for a text node.
 *
 * @param domNode - the dom node
 *
 * @public
 */
export const isTextDOMNode = (domNode: unknown): domNode is Text => {
  return isDOMNode(domNode) && domNode.nodeType === Node.TEXT_NODE;
};

interface GetOffsetParentParams extends EditorViewParams, ElementParams {}

export const getOffsetParent = ({ view, element }: GetOffsetParentParams): HTMLElement =>
  element ? (element.offsetParent as HTMLElement) : ((view.dom as HTMLElement).offsetParent as HTMLElement);

/**
 * Retrieve the line height from a an element
 *
 * @param params - the element params
 */
export const getLineHeight = ({ element }: ElementParams) =>
  parseFloat(window.getComputedStyle(element, undefined).lineHeight || '');

interface AbsoluteCoordinatesParams extends EditorViewParams, ElementParams, FixedCoordsParams {
  /**
   * The height offset of the parent
   */
  cursorHeight?: number;
}

/**
 * Retrieve the absolute coordinates
 *
 * @remarks
 * We need to translate the co-ordinates because `coordsAtPos` returns co-ordinates
 * relative to `window`. And, also need to adjust the cursor container height.
 * (0, 0)
 * +--------------------- [window] ---------------------+
 * |   (left, top) +-------- [Offset Parent] --------+  |
 * | {coordsAtPos} | [Cursor]   <- cursorHeight      |  |
 * |               | [FloatingToolbar]               |  |
 *
 * @param params - the absolute coordinate parameters
 */
export const absoluteCoordinates = ({
  view,
  element,
  coords,
  cursorHeight = getLineHeight({ element }),
}: AbsoluteCoordinatesParams) => {
  const offsetParent = getOffsetParent({ view, element });
  const box = offsetParent.getBoundingClientRect();

  return {
    left: coords.left - box.left,
    right: coords.right - box.left,
    top: coords.top - (box.top - cursorHeight) + offsetParent.scrollTop,
    bottom: box.height - (coords.top - (box.top - cursorHeight) - offsetParent.scrollTop),
  };
};

/**
 * Retrieve the nearest non-text node
 *
 * @param domNode - the dom node
 */
export const getNearestNonTextNode = (domNode: Node) =>
  isTextDOMNode(domNode) ? (domNode.parentNode as HTMLElement) : (domNode as HTMLElement);

/**
 * Checks whether the cursor is at the end of the state.doc
 *
 * @param state - the editor state
 */
export function atDocEnd(state: EditorState): boolean {
  const { selection, doc } = state;
  return doc.nodeSize - selection.$to.pos - 2 === selection.$to.depth;
}

/**
 * Checks whether the cursor is at the beginning of the state.doc
 *
 * @param state - the editor state
 */
export function atDocStart(state: EditorState): boolean {
  const { selection } = state;
  return selection.$from.pos === selection.$from.depth;
}

/**
 * Get the start position of the parent of the current resolve position
 *
 * @param pmPosition - the resolved prosemirror position
 */
export function startPositionOfParent(pmPosition: ResolvedPos): number {
  return pmPosition.start(pmPosition.depth);
}

/**
 * Get the end position of the parent of the current resolve position
 *
 * @param pmPosition - the resolved prosemirror position
 *
 * @public
 */
export function endPositionOfParent(pmPosition: ResolvedPos): number {
  return pmPosition.end(pmPosition.depth) + 1;
}

/**
 * Retrieve the current position of the cursor
 *
 * @param selection - the editor selection
 * @returns a resolved position only when the selection is a text selection
 *
 * @public
 */
export function getCursor(selection: Selection): ResolvedPos | null | undefined {
  return isTextSelection(selection) ? selection.$cursor : undefined;
}

/**
 * Checks to see whether a nodeMatch checker is a tuple
 *
 * @remarks
 * A node matcher can either be a string, a function a regex or a regex tuple. This check for the latter two.
 *
 * @param nodeMatch - the node match
 *
 * @public
 */
const isRegexTuple = (nodeMatch: NodeMatch): nodeMatch is RegexTuple =>
  Array.isArray(nodeMatch) && nodeMatch.length > 0 && nodeMatch.length <= 2;

/**
 * Test the passed in regexp tuple
 *
 * @param tuple - a regex tuple
 * @param value - the string to test against
 *
 * @public
 */
const regexTest = (tuple: RegexTuple, value: string) => {
  const regex = new RegExp(...tuple);
  return regex.test(value);
};

/**
 * Checks to see whether the name of the passed node matches anything in the list provided.
 *
 * @param node - the prosemirror node
 * @param nodeMatches - the node matches array
 * @returns true if the node name is a match to any of the items in the nodeMatches array
 *
 * @public
 */
export const nodeNameMatchesList = (
  node: ProsemirrorNode | null | undefined,
  nodeMatches: NodeMatch[],
): node is ProsemirrorNode => {
  let outcome = false;
  if (!node) {
    return outcome;
  }
  const name = node.type.name;
  for (const checker of nodeMatches) {
    outcome = isRegexTuple(checker)
      ? regexTest(checker, name)
      : isFunction(checker)
      ? checker(name, node)
      : checker === name;

    if (outcome) {
      return outcome;
    }
  }
  return outcome;
};

/**
 * Checks whether a Prosemirror node is the top level `doc` node
 *
 * @param node - the prosemirror node
 * @param schema - the prosemirror schema
 *
 * @public
 */
export const isDocNode = (node: ProsemirrorNode | null | undefined, schema?: EditorSchema) => {
  return isProsemirrorNode(node) && (schema ? node.type === schema.nodes.doc : node.type.name === 'doc');
};

/**
 * Checks whether the passed in JSON is a valid object node
 *
 * @param value - the value to check
 *
 * @public
 */
export const isObjectNode = (value: unknown): value is ObjectNode =>
  isObject(value) && (value as PlainObject).type === 'doc' && Array.isArray((value as PlainObject).content);

export interface CreateDocumentNodeParams
  extends SchemaParams,
    Partial<CustomDocParams>,
    StringHandlerParams {
  /** The content to render */
  content: RemirrorContentType;
}

export interface StringHandlerParams {
  /**
   * A function which transforms a string into a prosemirror node.
   * Can be used to transform markdown / html or any other string format.
   *
   * For an example {@link fromHTML}
   */
  stringHandler?(params: FromStringParams): ProsemirrorNode;
}

/**
 * Creates a document node from the passed in content and schema.
 *
 * @param params - the destructured create document node params
 *
 * @public
 */
export const createDocumentNode = ({
  content,
  schema,
  doc = document,
  stringHandler,
}: CreateDocumentNodeParams): ProsemirrorNode => {
  // if (isEditorState(content)) {
  //   return content.doc;
  // }

  if (isProsemirrorNode(content)) {
    return content;
  }

  if (isObjectNode(content)) {
    try {
      return schema.nodeFromJSON(content);
    } catch (e) {
      console.error(e);
      return schema.nodeFromJSON(EMPTY_PARAGRAPH_NODE);
    }
  }

  if (isString(content) && stringHandler) {
    // TODO fix this in SSR
    return stringHandler({ doc, content, schema });
  }

  return schema.nodeFromJSON(EMPTY_PARAGRAPH_NODE);
};

interface CustomDocParams {
  /** The custom document to use (allows for ssr rendering) */
  doc: Document;
}

interface ProsemirrorNodeParams {
  /** The prosemirror node */
  node: ProsemirrorNode;
}

interface FromNodeParams extends SchemaParams, ProsemirrorNodeParams, Partial<CustomDocParams> {}

/**
 * Convert a prosemirror node into it's HTML contents
 *
 * @param params - the from node params
 *
 * @public
 */
export const toHTML = ({ node, schema, doc = document }: FromNodeParams) => {
  const element = doc.createElement('div');
  element.appendChild(toDOM({ node, schema, doc }));

  return element.innerHTML;
};

/**
 * Convert a node into its DOM representative
 *
 * @param params - the from node params
 *
 * @public
 */
export const toDOM = ({ node, schema, doc }: FromNodeParams): DocumentFragment => {
  const fragment = isDocNode(node, schema) ? node.content : Fragment.from(node);
  return DOMSerializer.fromSchema(schema).serializeFragment(fragment, { document: doc });
};

interface FromStringParams extends Partial<CustomDocParams>, SchemaParams {
  /** The content  passed in an a string */
  content: string;
}

/**
 * Convert a HTML string into Prosemirror node
 *
 * @param params - the from html params
 *
 * @public
 */
export const fromHTML = ({ content, schema, doc = document }: FromStringParams): ProsemirrorNode => {
  const element = doc.createElement('div');
  element.innerHTML = content.trim();
  return DOMParser.fromSchema(schema).parse(element);
};
