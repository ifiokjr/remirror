import { renderEditor } from 'jest-remirror';

import { object } from '@remirror/core';
import { SuggestKeyBindingParameter } from '@remirror/pm/suggest';

import { EmojiExtension } from '../emoji-extension';
import {
  EmojiObject,
  EmojiOptions,
  EmojiSuggestCommand,
  EmojiSuggestionChangeHandlerParameter,
} from '../emoji-types';

function create(options: EmojiOptions = object()) {
  const extension = new EmojiExtension(options);

  extension.addHandler('onExit', onExit);
  extension.addHandler('onChange', onChange);
  extension.addCustomHandler('keyBindings', keyBindings);

  return renderEditor([extension]);
}

let emoji: EmojiObject | undefined;

const onChange = jest.fn((params: EmojiSuggestionChangeHandlerParameter) => {
  emoji = params.emojiMatches[0];
});

const onExit = jest.fn(() => {
  emoji = undefined;
});

const keyBindings = {
  Enter: jest.fn((params: SuggestKeyBindingParameter<EmojiSuggestCommand>) => {
    params.command(emoji!);
    return true;
  }),
};

afterEach(() => {
  emoji = undefined;
});

describe('inputRules', () => {
  it('replaces emoticons with emoji', () => {
    const {
      nodes: { p, doc },
      add,
    } = create();

    add(doc(p('<cursor>')))
      .insertText(':-) ')
      .callback((content) => {
        expect(content.state.doc).toEqualRemirrorDocument(doc(p('😃 ')));
      })
      .insertText('hello :@ ')
      .callback((content) => {
        expect(content.state.doc).toEqualRemirrorDocument(doc(p('😃 hello 😡 ')));
      })
      .insertText(':o')
      .callback((content) => {
        expect(content.state.doc).toEqualRemirrorDocument(doc(p('😃 hello 😡 :o')));
      })
      .insertText(' ')
      .callback((content) => {
        expect(content.state.doc).toEqualRemirrorDocument(doc(p('😃 hello 😡 😮 ')));
      });
  });

  it('replaces colons with the exact name match', () => {
    const {
      nodes: { p, doc },
      add,
    } = create();

    add(doc(p('<cursor>')))
      .insertText(':smiley:')
      .callback((content) => {
        expect(content.state.doc).toEqualRemirrorDocument(doc(p('😃')));
      })
      .insertText(' :frowning:')
      .callback((content) => {
        expect(content.state.doc).toEqualRemirrorDocument(doc(p('😃 😦')));
      });
  });
});

describe('suggestions', () => {
  it('creates suggestions from the defaultList first', () => {
    const {
      nodes: { doc, p },
      add,
    } = create();

    add(doc(p('<cursor>')))
      .insertText(':')
      .callback(() => {
        expect(onChange).toHaveBeenCalledTimes(1);
      })
      .press('Enter')
      .callback((content) => {
        expect(keyBindings.Enter).toHaveBeenCalledTimes(1);
        expect(content.state.doc).toEqualRemirrorDocument(doc(p('👍')));
        expect(onExit).toHaveBeenCalledTimes(1);
      });
  });

  it('supports a custom defaultList', () => {
    const {
      nodes: { doc, p },
      add,
    } = create({ defaultEmoji: ['heart'] });

    add(doc(p('<cursor>')))
      .insertText(':')
      .press('Enter')
      .callback((content) => {
        expect(content.state.doc).toEqualRemirrorDocument(doc(p('❤️')));
      });
  });

  it('suggests emoji after another emoji', () => {
    const {
      nodes: { doc, p },
      add,
    } = create();

    add(doc(p('<cursor>')))
      .insertText('😃')
      .insertText(':')
      .callback(() => {
        expect(onChange).toHaveBeenCalledTimes(1);
      })
      .press('Enter')
      .callback((content) => {
        expect(content.state.doc).toEqualRemirrorDocument(doc(p('😃👍')));
      });
  });

  it('does not suggest emoji mid-word', () => {
    const {
      nodes: { doc, p },
      add,
    } = create();

    add(doc(p('a<cursor>')))
      .insertText(':')
      .callback(() => {
        expect(onChange).not.toHaveBeenCalled();
      })
      .press('Enter')
      .callback((content) => {
        expect(content.state.doc).toEqualRemirrorDocument(doc(p('a:'), p('')));
      });
  });
});

describe('commands', () => {
  test('`suggestEmoji`', () => {
    const {
      nodes: { doc, p },
      add,
    } = create();

    add(doc(p('<cursor>')))
      .callback(({ commands, view }) => {
        commands.suggestEmoji();

        expect(view.state.doc).toEqualRemirrorDocument(doc(p(':')));
        expect(onChange).toHaveBeenCalledTimes(1);
      })
      .overwrite(doc(p('abcde')))
      .callback(({ commands, view }) => {
        commands.suggestEmoji({ from: 3, to: 4 });

        expect(view.state.doc).toEqualRemirrorDocument(doc(p('ab:de')));
      });
  });

  test('`insertEmojiByName`', () => {
    const {
      nodes: { doc, p },
      add,
    } = create();

    add(doc(p('<cursor>')))
      .callback(({ commands, view }) => {
        commands.insertEmojiByName('heart');
        expect(view.state.doc).toEqualRemirrorDocument(doc(p('❤️')));
      })
      .overwrite(doc(p('abcde')))
      .callback(({ commands, view }) => {
        commands.insertEmojiByName('heart', { from: 3, to: 4 });
        expect(view.state.doc).toEqualRemirrorDocument(doc(p('ab❤️de')));
      });
  });
});

describe('helpers', () => {
  test('`updateFrequentlyUsed`', () => {
    const {
      nodes: { doc, p },
      add,
    } = create();

    add(doc(p('<cursor>')))
      .callback(({ helpers }) => {
        helpers.updateFrequentlyUsed(['heart']);
      })
      .insertText(':')
      .press('Enter')
      .callback((content) => {
        expect(content.state.doc).toEqualRemirrorDocument(doc(p('❤️')));
      });
  });
});
