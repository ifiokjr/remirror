import {
  Attrs,
  MarkTypeParams,
  NodeTypeParams,
  NullablePMNodeParams,
  PMNodeParams,
  PosParams,
  ProsemirrorNode,
} from '../types';
import { bool } from './base';
import { isProsemirrorNode } from './document';

/** @internal */
interface DescendParams {
  /**
   * Whether to descend into a node.
   *
   * @default true
   */
  descend: boolean;
}

/** @internal */
interface NodePredicateParams {
  /**
   * A predicate which receives the node and determines whether it is a match.
   */
  predicate(node: ProsemirrorNode): boolean;
}

/**
 * A node with it's start position.
 *
 * @public
 */
export interface NodeWithPosition extends PMNodeParams, PosParams {}

/** @internal */
interface FlattenParams extends NullablePMNodeParams, Partial<DescendParams> {}

/**
 * Flattens descendants of a given `node`.
 *
 * @remarks
 * It doesn't descend into a node when descend argument is `false` (defaults to `true`).
 *
 * ```ts
 * const children = flatten(node);
 * ```
 */
export const flatten = ({ node, descend = true }: FlattenParams): NodeWithPosition[] => {
  if (!isProsemirrorNode(node)) {
    throw new Error('Invalid "node" parameter');
  }
  const result: NodeWithPosition[] = [];
  node.descendants((child, pos) => {
    result.push({ node: child, pos });
    if (!descend) {
      return false;
    }
    return;
  });
  return result;
};

/** @internal */
interface FindChildrenParams extends FlattenParams, NodePredicateParams {}

/**
 * Iterates over descendants of a given `node`, returning child nodes predicate returns truthy for.
 *
 * @remarks
 * It doesn't descend into a node when descend argument is `false` (defaults to `true`).
 *
 * ```ts
 * const textNodes = findChildren(node, child => child.isText, false);
 * ```
 */
export const findChildren = ({ node, predicate, descend }: FindChildrenParams) => {
  if (!node) {
    throw new Error('Invalid "node" parameter');
  } else if (!predicate) {
    throw new Error('Invalid "predicate" parameter');
  }
  return flatten({ node, descend }).filter(child => predicate(child.node));
};

/**
 * Returns text nodes of a given `node`.
 *
 * @remarks
 * It doesn't descend into a node when descend argument is `false` (defaults to `true`).
 *
 * ```ts
 * const textNodes = findTextNodes(node);
 * ```
 */
export const findTextNodes = ({ node, descend }: FlattenParams) => {
  return findChildren({ node, predicate: child => child.isText, descend });
};

/**
 * Returns inline nodes of a given `node`.
 *
 * @remarks
 * It doesn't descend into a node when descend argument is `false` (defaults to `true`).
 *
 * ```ts
 * const inlineNodes = findInlineNodes(node);
 * ```
 */
export const findInlineNodes = ({ node, descend }: FlattenParams) => {
  return findChildren({ node, predicate: child => child.isInline, descend });
};

/**
 * Returns block descendants of a given `node`.
 *
 * @remarks
 * It doesn't descend into a node when descend argument is `false` (defaults to `true`).
 *
 * ```ts
 * const blockNodes = findBlockNodes(node);
 * ```
 */
export const findBlockNodes = ({ node, descend }: FlattenParams) => {
  return findChildren({ node, predicate: child => child.isBlock, descend });
};

/** @internal */
interface FindChildrenByAttrParams extends FlattenParams {
  /**
   * Runs a predicate check after receiving the attrs for the found node.
   */
  predicate(attrs: Attrs): boolean;
}

/**
 * Iterates over descendants of a given `node`, returning child nodes predicate returns truthy for.
 *
 * @remarks
 * It doesn't descend into a node when descend argument is `false` (defaults to `true`).
 *
 * ```ts
 * const mergedCells = findChildrenByAttr(table, attrs => attrs.colspan === 2);
 * ```
 */
export const findChildrenByAttr = ({ node, predicate, descend }: FindChildrenByAttrParams) => {
  return findChildren({ node, predicate: child => predicate(child.attrs), descend });
};

/** @internal */
interface FindChildrenByNodeParams extends FlattenParams, NodeTypeParams {}

/**
 * Iterates over descendants of a given `node`, returning child nodes of a given nodeType.
 *
 * @remarks
 * It doesn't descend into a node when descend argument is `false` (defaults to `true`).
 *
 * ```ts
 * const cells = findChildrenByNode(table, schema.nodes.tableCell);
 * ```
 */
export const findChildrenByNode = ({ node, type, descend }: FindChildrenByNodeParams) => {
  return findChildren({ node, predicate: child => child.type === type, descend });
};

/** @internal */
interface FindChildrenByMarkParams extends FlattenParams, MarkTypeParams {}

/**
 * Iterates over descendants of a given `node`, returning child nodes that have a mark of a given markType.
 *
 * @remarks
 * It doesn't descend into a `node` when descend argument is `false` (defaults to `true`).
 *
 * ```ts
 * const nodes = findChildrenByMark(state.doc, schema.marks.strong);
 * ```
 */
export const findChildrenByMark = ({ node, type, descend }: FindChildrenByMarkParams) => {
  return findChildren({ node, predicate: child => bool(type.isInSet(child.marks)), descend });
};

/** @internal */
interface ContainsParams extends PMNodeParams, NodeTypeParams {}

/**
 * Returns `true` if a given node contains nodes of a given `nodeType`
 *
 * @remarks
 * ```ts
 * if (contains(panel, schema.nodes.listItem)) {
 *     // ...
 * }
 * ```
 */
export const contains = ({ node, type }: ContainsParams) => {
  return !!findChildrenByNode({ node, type }).length;
};
