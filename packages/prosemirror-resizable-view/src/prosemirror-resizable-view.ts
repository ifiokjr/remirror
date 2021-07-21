import { Node as ProsemirrorNode } from 'prosemirror-model';
import { EditorView, NodeView } from 'prosemirror-view';
import { throttle } from '@remirror/core-helpers';

import { ResizableHandle, ResizableHandleType } from './resizable-view-handle';

export enum ResizableRatioType {
  Fixed,
  Flexible,
}

interface OptionShape {
  [key: string]: any;
}
/**
 * ResizableNodeView serves as a base NodeView for resizable element,
 * and cannot be directly instantiated.
 * With this base NodeView, you can resize the DOM element by dragging the handle over the image.
 *
 * @param node - the node which uses this nodeView. Must have `width` and `height` in the attrs.
 * @param view - the editor view used by this nodeView.
 * @param getPos - a utility method to get the absolute cursor position of the node.
 * @param aspectRatio? - to determine which type of aspect ratio should be used.
 * @param options? - extra options to pass to `createElement` method.
 * @param initialSize? - initial view size.
 */
export abstract class ResizableNodeView implements NodeView {
  dom: HTMLElement;

  #element: HTMLElement;
  #node: ProsemirrorNode;

  readonly aspectRatio: ResizableRatioType;

  // cache the current element's size so that we can compare with new node's
  // size when `update` method is called.
  #width = '';
  #height = '';

  constructor({
    node,
    view,
    getPos,
    aspectRatio = ResizableRatioType.Fixed,
    options,
    initialSize,
  }: {
    node: ProsemirrorNode;
    view: EditorView;
    getPos: () => number;
    aspectRatio?: ResizableRatioType;
    options?: OptionShape;
    initialSize?: { width: number; height: number };
  }) {
    const outer = this.createWrapper(node, initialSize);
    const element = this.createElement({ node, view, getPos, options });

    /**
     * Only initialize `handleBottom`, `handleBottomRight`, and `handleBottomLeft` in
     * `ResizableRatioType.Flexible` mode
     */
    const types =
      aspectRatio === ResizableRatioType.Flexible
        ? [
            ResizableHandleType.Right,
            ResizableHandleType.Left,
            ResizableHandleType.Bottom,
            ResizableHandleType.BottomRight,
            ResizableHandleType.BottomLeft,
          ]
        : [ResizableHandleType.Right, ResizableHandleType.Left];

    const handles = types.map((type) => new ResizableHandle(type));

    for (const handle of handles) {
      handle.dom.addEventListener('mousedown', (e) => this.resizeHandler(e, view, getPos, handle));
      outer.append(handle.dom);
    }

    outer.addEventListener('mouseover', () => {
      handles.forEach((handle) => handle.setHandleVisibility(true));
    });

    outer.addEventListener('mouseout', () => {
      handles.forEach((handle) => handle.setHandleVisibility(false));
    });

    outer.append(element);

    this.dom = outer;
    this.#node = node;
    this.#element = element;
    this.aspectRatio = aspectRatio;
  }

  /**
   * `createElement` - a method to produce the element DOM element for this prosemirror node.
   * The subclasses have to implement this abstract method.
   */
  abstract createElement(props: {
    node: ProsemirrorNode;
    view: EditorView;
    getPos: () => number;
    options?: OptionShape;
  }): HTMLElement;

  createWrapper(
    node: ProsemirrorNode,
    initialSize?: { width: number; height: number },
  ): HTMLElement {
    const outer = document.createElement('div');
    outer.classList.add('remirror-resizable-view');
    outer.style.position = 'relative';

    if (initialSize) {
      outer.style.width = `${initialSize.width}px`;
      outer.style.height = `${initialSize.height}px`;
    } else {
      outer.style.width = node.attrs.width;
      outer.style.height = node.attrs.height;
    }

    outer.style.maxWidth = '100%';
    outer.style.minWidth = '50px';
    outer.style.display = 'inline-block';
    outer.style.lineHeight = '0'; // necessary so the bottom right handle is aligned nicely
    outer.style.transition = 'width 0.15s ease-out, height 0.15s ease-out'; // make sure transition time is larger then mousemove event's throttle time

    return outer;
  }

  resizeHandler(
    e: MouseEvent,
    view: EditorView,
    getPos: () => number,
    handle: ResizableHandle,
  ): void {
    e.preventDefault();
    handle.dataSetDragging(true);
    this.#element.style.pointerEvents = 'none';

    const startX = e.pageX;
    const startY = e.pageY;
    const startWidth = this.#element?.getBoundingClientRect().width || 0;
    const startHeight = this.#element?.getBoundingClientRect().height || 0;

    const onMouseMove = throttle(100, false, (e: MouseEvent) => {
      const currentX = e.pageX;
      const currentY = e.pageY;
      const diffX = currentX - startX;
      const diffY = currentY - startY;

      switch (handle.type) {
        case ResizableHandleType.Right:
          this.dom.style.width = `${startWidth + diffX}px`;
          break;
        case ResizableHandleType.Left:
          this.dom.style.width = `${startWidth - diffX}px`;
          break;
        case ResizableHandleType.Bottom:
          this.dom.style.height = `${startHeight + diffY}px`;
          break;
        case ResizableHandleType.BottomRight:
          this.dom.style.width = `${startWidth + diffX}px`;
          this.dom.style.height = `${startHeight + diffY}px`;

          break;
        case ResizableHandleType.BottomLeft:
          this.dom.style.width = `${startWidth - diffX}px`;
          this.dom.style.height = `${startHeight + diffY}px`;
          break;
      }
    });

    const onMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      handle.dataSetDragging(false);
      handle.setHandleVisibility(false);
      this.#element.style.pointerEvents = 'auto';

      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      const transaction = view.state.tr.setNodeMarkup(getPos(), undefined, {
        src: this.#node.attrs.src,
        width: this.dom.style.width,
        height: this.dom.style.height,
      });

      this.#width = this.dom.style.width;
      this.#height = this.dom.style.height;

      view.dispatch(transaction);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  /**
   * `update` will be called by Prosemirror, when the view is updating itself.
   */
  update(node: ProsemirrorNode): boolean {
    if (node.type !== this.#node.type) {
      return false;
    }

    if (
      this.aspectRatio === ResizableRatioType.Fixed &&
      node.attrs.width &&
      node.attrs.width !== this.#width
    ) {
      return false;
    }

    if (
      this.aspectRatio === ResizableRatioType.Flexible &&
      node.attrs.width &&
      node.attrs.height &&
      node.attrs.width !== this.#width &&
      node.attrs.height !== this.#height
    ) {
      return false;
    }

    if (!isEqualWithoutAttrs(this.#node, node, ['width', 'height'])) {
      return false;
    }

    this.#node = node;

    this.#width = node.attrs.width;
    this.#height = node.attrs.height;

    return true;
  }
}

// Check if two nodes are equal by ignore some attributes
function isEqualWithoutAttrs(
  node1: ProsemirrorNode,
  node2: ProsemirrorNode,
  ignoreAttrs: string[],
): boolean {
  return (
    node1 === node2 || (sameMarkup(node1, node2, ignoreAttrs) && node1.content.eq(node2.content))
  );
}

// Compare the markup (type, attributes, and marks) of one node to those of
// another. Returns `true` if both have the same markup except some attributes.
function sameMarkup(node1: ProsemirrorNode, node2: ProsemirrorNode, ignoreAttrs: string[]) {
  const node1Attrs = node1.attrs;
  const node2Attrs = node2.attrs;
  const deltaAttrs: Record<string, null> = {};

  for (const attr of ignoreAttrs) {
    deltaAttrs[attr] = null;
  }

  node1.attrs = { ...node1Attrs, ...deltaAttrs };
  node2.attrs = { ...node2Attrs, ...deltaAttrs };

  const same = node1.sameMarkup(node2);

  node1.attrs = node1Attrs;
  node2.attrs = node2Attrs;

  return same;
}
