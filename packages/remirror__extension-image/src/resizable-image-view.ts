import { ResizableNodeView, ResizableRatioType } from 'prosemirror-resizable-view';
import { EditorView, NodeView, ProsemirrorNode } from '@remirror/pm';

/**
 * ResizableImageView is a NodeView for image. You can resize the image by
 * dragging the handle over the image.
 */
export class ResizableImageView extends ResizableNodeView implements NodeView {
  constructor(node: ProsemirrorNode, view: EditorView, getPos: () => number) {
    super({ node, view, getPos, aspectRatio: ResizableRatioType.Fixed });
  }

  createElement({ node }: { node: ProsemirrorNode }): HTMLImageElement {
    const inner = document.createElement('img');
    inner.setAttribute('src', node.attrs.src);
    inner.style.width = '100%';

    inner.style.minWidth = '50px';
    inner.style.minHeight = '30px';

    inner.style.objectFit = 'contain'; // maintain image's aspect ratio
    return inner;
  }
}
