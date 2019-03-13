import { Extension, ProsemirrorPlugin } from '@remirror/core';
import { CompositionOptions } from '../types';
import { createCompositionPlugin, patchDeleteContentBackward } from './plugin';

export class Composition extends Extension<CompositionOptions> {
  get name(): 'composition' {
    return 'composition';
  }

  get defaultOptions() {
    return {
      ensureNodeDeletion: ['emoji', (name: string) => name.includes('mentions')],
    };
  }

  public plugin(): ProsemirrorPlugin {
    return createCompositionPlugin(this);
  }
}

export { patchDeleteContentBackward };
