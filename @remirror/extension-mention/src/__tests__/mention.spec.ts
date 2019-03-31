import { fromHTML, toHTML } from '@remirror/core';
import { createBaseTestManager } from '@test-fixtures/schema-helpers';
import { pmBuild } from 'jest-prosemirror';
import { renderEditor } from 'jest-remirror';
import { Mention, MentionOptions } from '../';
import { MentionNodeAttrs } from '../types';

describe('schema', () => {
  const schema = createBaseTestManager([{ extension: new Mention(), priority: 1 }]).createSchema();
  const attrs = { id: 'test', label: '@test' };

  const { mention, p, doc } = pmBuild(schema, {
    mention: { nodeType: 'mention', ...attrs },
  });

  it('creates the correct dom node', () => {
    expect(toHTML({ node: mention(), schema })).toBe(
      `<a class="mention mention-at" data-mention-id="${attrs.id}">${attrs.label}</a>`,
    );
  });

  it('parses the dom structure and finds itself', () => {
    const node = fromHTML({
      schema,
      content: `<a class="mention mention-at" data-mention-id="${attrs.id}">${attrs.label}</a>`,
    });
    const expected = doc(p(mention()));
    expect(node).toEqualPMNode(expected);
  });

  it('does not support nested content tags', () => {
    expect(toHTML({ node: mention(p('Content here')), schema })).toBe(
      `<a class="mention mention-at" data-mention-id="${attrs.id}">${attrs.label}</a>`,
    );
  });
});

describe('constructor', () => {
  it('is created with the correct options', () => {
    const matcher = {
      char: '@',
      allowSpaces: false,
      startOfLine: false,
      name: 'at',
    };
    const mentions = new Mention({
      matchers: [matcher],
    });

    expect(mentions.options.matchers).toEqual([matcher]);
    expect(mentions.name).toEqual('mention');
  });

  it('uses can be created with partial matchers', () => {
    const mentionOne = new Mention({
      matchers: [{ char: '#', name: 'tag' }],
    });
    expect(mentionOne.options.matchers).toEqual([{ char: '#', name: 'tag' }]);
  });
});

const create = (params: MentionOptions = {}) =>
  renderEditor({
    attrNodes: [new Mention({ mentionClassName: 'custom', ...params })],
  });

describe('plugin', () => {
  const options = {
    mentionClassName: 'custom',
    matchers: [{ char: '#', name: 'tag' }, { char: '@', name: 'at' }, { char: '+', name: 'plus' }],
  };

  const mocks = {
    onEnter: jest.fn(),
    onChange: jest.fn(),
    onKeyDown: jest.fn(),
    onExit: jest.fn(),
  };

  it('uses default noop callbacks', () => {
    const id = 'mention';
    const label = `@${id}`;
    const {
      add,
      nodes: { doc, paragraph: p },
      view,
    } = create(options);

    add(doc(p('<cursor>'))).insertText(`This ${label} `);
    expect(view.state).toContainRemirrorDocument(p(`This ${label} `));
  });

  it('injects the mention at the correct place', () => {
    const id = 'mention';
    const label = `@${id}`;
    const {
      add,
      nodes: { doc, paragraph: p },
      attrNodes: { mention },
      view,
    } = create({
      ...options,
      ...mocks,
      onExit: ({ command, query, char }) => {
        command({ id: query!, label: `${char}${query}`, appendText: '' });
      },
    });

    const mentionNode = mention({ id, label });

    add(doc(p('<cursor>'))).insertText(`This ${label} `);
    expect(view.state).toContainRemirrorDocument(p('This ', mentionNode(), ' '));
    expect(mocks.onEnter).toHaveBeenCalledTimes(1);
    expect(mocks.onChange).toHaveBeenCalledTimes(id.length - 1);
    expect(mocks.onKeyDown).toHaveBeenCalledTimes(id.length);
  });

  it('support multiple characters', () => {
    const id = 'mention';
    const label = (char: string) => `${char}${id}`;
    const {
      add,
      nodes: { doc, paragraph: p },
      attrNodes: { mention },
      view,
    } = create({
      ...options,
      ...mocks,
      onExit: ({ command, query, char }) => {
        command({ id: query!, label: `${char}${query}`, appendText: '' });
      },
    });

    const hashNode = mention({ id, label: label('#'), name: 'tag' });
    const plusNode = mention({ id, label: label('+'), name: 'plus' });

    add(doc(p('<cursor>'))).insertText(`This ${label('#')} `);
    expect(view.state).toContainRemirrorDocument(p('This ', hashNode(), ' '));

    add(doc(p('<cursor>'))).insertText(`This ${label('+')} `);
    expect(view.state).toContainRemirrorDocument(p('This ', plusNode(), ' '));
  });
});

describe('commands', () => {
  let {
    nodes: { doc, paragraph },
    view,
    attrNodes: { mention },
    actions,
    add,
  } = create({
    matchers: [{ char: '#', name: 'tag' }, { char: '@', name: 'at' }, { char: '+', name: 'plus' }],
  });

  beforeEach(() => {
    ({
      nodes: { doc, paragraph },
      view,
      attrNodes: { mention },
      actions,
      add,
    } = create());
  });

  it('replaces text at the current position', () => {
    add(doc(paragraph('This is ', '<cursor>')));
    const attrs: MentionNodeAttrs = { id: 'test', label: '@test', name: 'at' };

    actions.mention.command(attrs);

    expect(view.state).toContainRemirrorDocument(paragraph('This is ', mention(attrs)()));
  });
});
