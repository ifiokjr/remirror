import { absoluteCoordinates, isEmptyParagraphNode, selectionEmpty } from '@remirror/core';
import { Positioner } from '@remirror/react-utils';

export const defaultPositioner: Positioner = {
  initialPosition: { top: -9999, left: -9999, right: -9999, bottom: -9999 },
  hasChanged({ prevState, newState }) {
    const hasChanged = !(
      prevState &&
      prevState.doc.eq(newState.doc) &&
      prevState.selection.eq(newState.selection)
    );
    return hasChanged;
  },

  isActive({ newState }) {
    const isActive = !selectionEmpty(newState);
    return isActive;
  },

  getPosition({ element, view, newState }) {
    return absoluteCoordinates({
      view,
      element,
      coords: view.coordsAtPos(newState.selection.$anchor.pos),
    });
  },
};

/**
 * Render a menu which floats to the right at the beginning of an empty paragraph
 */
export const floatingPositioner: Positioner = {
  ...defaultPositioner,

  isActive({ newState }) {
    return selectionEmpty(newState) && isEmptyParagraphNode(newState.selection.$anchor.parent);
  },

  getPosition({ view, element, newState }) {
    const editorRect = element.offsetParent!.getBoundingClientRect();
    const cursorRect = view.coordsAtPos(newState.selection.$anchor.pos);
    const top = cursorRect.top - editorRect.top;
    return { ...floatingPositioner.initialPosition, top };
  },
};

/**
 * Render a bubble menu which becomes active whenever a selection is made.
 *
 * The relevant positions are `bottom` and `left` which can be used to absolutely positioned your PositionerComponent
 * `top` and `right` aren't used and always equal the default off screen position
 */
export const bubblePositioner: Positioner = {
  ...defaultPositioner,

  getPosition({ view, element, newState }) {
    const { from, to } = newState.selection;

    // These are in screen coordinates
    const start = view.coordsAtPos(from);
    const end = view.coordsAtPos(to);

    // The box in which the tooltip is positioned, to use as base
    const parentBox = element.offsetParent!.getBoundingClientRect();
    const elementBox = element.getBoundingClientRect();

    const left = (start.left + end.left) / 2 - parentBox.left;

    return {
      ...bubblePositioner.initialPosition,
      left: Math.min(parentBox.width - elementBox.width / 2, Math.max(left, elementBox.width / 2)),
      bottom: Math.trunc(parentBox.bottom - start.top),
    };
  },
};
