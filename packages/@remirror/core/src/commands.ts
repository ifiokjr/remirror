import { bool } from '@remirror/core-helpers';
import type {
  AttributesParameter,
  CommandFunction,
  DocParameter,
  EditorSchema,
  MarkTypeParameter,
  RangeParameter,
  TransactionParameter,
} from '@remirror/core-types';
import { isMarkActive, isTextSelection } from '@remirror/core-utils';
import type { ResolvedPos } from '@remirror/pm/model';
import type { Selection, SelectionRange, TextSelection } from '@remirror/pm/state';

/**
 * Check if the active selection has a cursor available.
 */
function selectionHasCursor<Schema extends EditorSchema = EditorSchema>(
  selection: Selection,
): selection is TextSelection<Schema> & { $cursor: ResolvedPos<Schema> } {
  return isTextSelection(selection) ? bool(selection.$cursor) : false;
}

interface MarkAppliesParameter<Schema extends EditorSchema = EditorSchema>
  extends DocParameter,
    MarkTypeParameter<Schema> {
  ranges: Array<SelectionRange<Schema>>;
}

/**
 * Verifies that the mark can be applied
 */
function markApplies(parameter: MarkAppliesParameter) {
  const { doc, ranges, type } = parameter;

  for (const { $from, $to } of ranges) {
    let can = $from.depth === 0 ? doc.type.allowsMarkType(type) : false;

    doc.nodesBetween($from.pos, $to.pos, (node) => {
      if (can) {
        return false;
      }

      can = node.inlineContent && node.type.allowsMarkType(type);
      return;
    });

    if (can) {
      return true;
    }
  }

  return false;
}

interface ToggleActiveMarkSelectionParameter
  extends TransactionParameter,
    Partial<AttributesParameter>,
    MarkTypeParameter {}

function toggleActiveMarkSelection(parameter: ToggleActiveMarkSelectionParameter) {
  const { tr, type, attrs } = parameter;
  const { ranges } = tr.selection;
  let selectionHasActiveMark = false;

  for (let rangesIndex = 0; !selectionHasActiveMark && rangesIndex < ranges.length; rangesIndex++) {
    const { $from, $to } = ranges[rangesIndex];
    selectionHasActiveMark = tr.doc.rangeHasMark($from.pos, $to.pos, type);
  }

  for (const { $from, $to } of ranges) {
    if (selectionHasActiveMark) {
      tr.removeMark($from.pos, $to.pos, type);
      continue;
    }

    tr.addMark($from.pos, $to.pos, type.create(attrs));
  }
}

export interface ToggleMarkParameter<Schema extends EditorSchema = EditorSchema>
  extends MarkTypeParameter<Schema>,
    Partial<AttributesParameter>,
    Partial<RangeParameter> {}

/**
 * A command function that works for the remirror codebase.
 *
 * Create a command function that toggles the given mark with the given
 * attributes. Will return `false` when the current selection doesn't support
 * that mark. This will remove the mark if any marks of that type exist in the
 * selection, or add it otherwise. If the selection is empty, this applies to
 * the [stored marks](#state.EditorState.storedMarks) instead of a range of the
 * document.
 *
 * The differences from the `prosemirror-commands` version.
 * - Acts on the transaction rather than the state to allow for commands to be
 *   chained together.
 * - Uses the ONE parameter function signature for compatibility with remirror.
 * - Supports passing a custom range.
 */
export function toggleMark(parameter: ToggleMarkParameter): CommandFunction {
  const { type, attrs, range } = parameter;

  return ({ dispatch, tr }) => {
    const { selection } = tr; // Selection picked from transaction to allow for chaining.
    const { empty, ranges } = selection;
    const useCurrentSelection = !range;

    if (
      // When using the current selection
      useCurrentSelection &&
      // Check that this is a valid and usable selection
      ((empty && !selectionHasCursor(selection)) ||
        // If not make sure that the mark can be applied.
        !markApplies({ doc: tr.doc, ranges, type }))
    ) {
      // Otherwise return false
      return false;
    }

    // This keeps the method idempotent. The transaction should not be mutated
    // if no dispatch is available.
    if (!dispatch) {
      return true;
    }

    // Wrap dispatch with an automatic true return. This removes the need for
    // even more `return true` statements.
    const done = () => {
      dispatch(tr);

      return true;
    };

    if (range) {
      isMarkActive({ trState: tr, type, ...range })
        ? tr.removeMark(range.from, range.to, type)
        : tr.addMark(range.from, range.to, type.create(attrs));

      return done();
    }

    if (selectionHasCursor(selection)) {
      if (type.isInSet(tr.storedMarks || selection.$cursor.marks())) {
        tr.removeStoredMark(type);
        return done();
      }

      tr.addStoredMark(type.create(attrs));
      return done();
    }

    toggleActiveMarkSelection({ tr, type, attrs });

    // Scroll into view is needed for very long selections.
    tr.scrollIntoView();
    return done();
  };
}
