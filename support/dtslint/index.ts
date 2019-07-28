import { ActionsFromExtension, Extension, NodeExtension } from '@remirror/core';
import { HistoryExtension } from '@remirror/core-extensions';

class BestExtension extends Extension {
  get name() {
    return 'base' as 'base';
  }

  // $ExpectError
  public commands() {
    return {
      nothing: (param: string) => () => 'true',
    };
  }
}

type HistoryExtensionActions = ActionsFromExtension<HistoryExtension>;
const historyActions: HistoryExtensionActions = {} as any;
historyActions.redo(); // $ExpectType void
historyActions.undo(); // $ExpectType void
historyActions.undo({}); // $ExpectError
