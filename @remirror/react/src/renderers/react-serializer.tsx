import React, { ComponentType, createElement, Fragment, ReactNode } from 'react';

import {
  AnyCombinedUnion,
  bool,
  DOMOutputSpec,
  RemirrorManager,
  ErrorConstant,
  Fragment as ProsemirrorFragment,
  invariant,
  isArray,
  isPlainObject,
  isString,
  Mark,
  MarkExtensionSpec,
  NodeExtensionSpec,
  object,
  ProsemirrorNode,
  Shape,
} from '@remirror/core';

import { gatherDomMethods, mapProps } from './renderer-utils';

type NodeToDOM = NodeExtensionSpec['toDOM'];
type MarkToDOM = MarkExtensionSpec['toDOM'];

/**
 * Serialize the extension provided schema into a JSX element that can be displayed node and non-dom environments.
 */
export class ReactSerializer<Combined extends AnyCombinedUnion> {
  /**
   * Receives the return value from toDOM defined in the node schema and transforms it
   * into JSX
   *
   * @param structure - The DOMOutput spec for the current node
   * @param wraps - passed through any elements that this component should be parent of
   */
  static renderSpec(structure: DOMOutputSpec, wraps?: ReactNode): ReactNode {
    if (isString(structure)) {
      return structure;
    }

    const Component = structure[0];
    const props: Shape = object();
    const attributes = structure[1];
    const children: ReactNode[] = [];

    let currentIndex = 1;

    if (isPlainObject(attributes) && !isArray(attributes)) {
      currentIndex = 2;
      for (const name in attributes) {
        if (attributes[name] != null) {
          props[name] = attributes[name];
        }
      }
    }

    for (let ii = currentIndex; ii < structure.length; ii++) {
      const child = structure[ii];

      if (child === 0) {
        invariant(!(ii < structure.length - 1 || ii > currentIndex), {
          message: 'Content hole (0) must be the only child of its parent node',
          code: ErrorConstant.INTERNAL,
        });

        return createElement(Component, mapProps(props), wraps);
      }

      children.push(ReactSerializer.renderSpec(child as DOMOutputSpec, wraps));
    }

    return createElement(Component, mapProps(props), ...children);
  }

  /**
   * Create a serializer from the extension manager
   *
   * @param manager
   */
  static fromManager<Combined extends AnyCombinedUnion>(manager: RemirrorManager<Combined>) {
    return new ReactSerializer(
      this.nodesFromManager(manager),
      this.marksFromManager(manager),
      manager,
    );
  }

  /**
   * Pluck nodes from the extension manager
   *
   * @param manager
   */
  private static nodesFromManager<Combined extends AnyCombinedUnion>(
    manager: RemirrorManager<Combined>,
  ) {
    const result = gatherDomMethods(manager.nodes);
    if (!result.text) {
      result.text = (node) => (node.text ? node.text : '');
    }
    return result;
  }

  /**
   * Pluck marks from the extension manager
   *
   * @param manager
   */
  private static marksFromManager<Combined extends AnyCombinedUnion>(
    manager: RemirrorManager<Combined>,
  ) {
    return gatherDomMethods(manager.marks);
  }

  nodes: Record<string, NodeToDOM>;
  marks: Record<string, MarkToDOM>;

  readonly #components: Record<string, ComponentType<any>>;

  constructor(
    nodes: Record<string, NodeToDOM>,
    marks: Record<string, MarkToDOM>,
    manager: RemirrorManager<Combined>,
  ) {
    this.nodes = nodes;
    this.marks = marks;
    this.#components = manager.store.components ?? object();
  }

  /**
   * The main entry method on this class for traversing through a schema tree and creating JSx.
   *
   * ```ts
   * reactSerializer.serializeFragment(fragment)
   * ```
   *
   * @param fragment
   */
  serializeFragment(fragment: ProsemirrorFragment): JSX.Element {
    const children: ReactNode[] = [];

    fragment.forEach((node) => {
      let child: ReactNode;
      child = this.serializeNode(node);
      node.marks.reverse().forEach((mark) => {
        // TODO test behaviour expectations for `spanning` marks. Currently not HANDLED.
        child = this.serializeMark(mark, node.isInline, child);
      });

      children.push(child);
    });

    return createElement(Fragment, {}, ...children);
  }

  /**
   * Transform the passed in node into a JSX Element
   *
   * @param node
   */
  serializeNode(node: ProsemirrorNode): ReactNode {
    const Component = this.#components[node.type.name];
    const toDOM = this.nodes[node.type.name];

    let children: ReactNode;

    if (node.content.childCount > 0) {
      children = this.serializeFragment(node.content);
    }
    return bool(Component) ? (
      <Component node={node}>{children}</Component>
    ) : (
      toDOM && ReactSerializer.renderSpec(toDOM(node), children)
    );
  }

  /**
   * Transform the provided mark into a JSX Element that wraps the current node
   *
   * @param mark
   * @param inline
   * @param wrappedElement
   */
  serializeMark(mark: Mark, inline: boolean, wrappedElement: ReactNode): ReactNode {
    const toDOM = this.marks[mark.type.name];
    const Component = this.#components[mark.type.name];

    return bool(Component) ? (
      <Component mark={mark}>{wrappedElement}</Component>
    ) : (
      toDOM && ReactSerializer.renderSpec(toDOM(mark, inline), wrappedElement)
    );
  }
}
