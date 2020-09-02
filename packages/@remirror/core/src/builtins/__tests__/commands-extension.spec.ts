import { extensionValidityTest, renderEditor } from 'jest-remirror';

import { AllSelection } from '@remirror/pm/state';
import { BoldExtension, ItalicExtension } from '@remirror/testing';

import { CommandsExtension } from '..';

extensionValidityTest(CommandsExtension);

test('can call multiple commands', () => {
  const editor = renderEditor([new BoldExtension(), new ItalicExtension()]);
  const { doc, p } = editor.nodes;
  const { bold, italic } = editor.marks;
  const { commands } = editor;

  editor.add(doc(p('<start>my content<end>')));
  commands.toggleBold();
  commands.toggleItalic();

  expect(editor.state.doc).toEqualRemirrorDocument(doc(p(bold(italic('my content')))));
});

test('can chain commands', () => {
  const editor = renderEditor([new BoldExtension(), new ItalicExtension()]);
  const { doc, p } = editor.nodes;
  const { bold, italic } = editor.marks;
  const { chain } = editor;

  editor.add(doc(p('<start>my content<end>')));
  chain.toggleBold().toggleItalic().run();

  expect(editor.state.doc).toEqualRemirrorDocument(doc(p(bold(italic('my content')))));
});

test('clears range selection', () => {
  const text = 'my content';

  const editor = renderEditor([]);
  const { doc, p } = editor.nodes;
  const { commands } = editor;

  editor.add(doc(p(`<start>${text}<end>`)));

  // Pre-condition: range selection covers complete text
  expect(editor.state.selection.to).toBe(editor.state.selection.from + text.length);

  expect(commands.clearRangeSelection()).toBeTrue();

  expect(editor.state.selection.to).toBe(editor.state.selection.from);
  expect(editor.state.doc).toEqualRemirrorDocument(doc(p(text)));
});

test('rejects clearing range selection if there is none', () => {
  const editor = renderEditor([]);
  const { doc, p } = editor.nodes;
  const { commands } = editor;

  editor.add(doc(p('my content')));

  expect(commands.clearRangeSelection()).toBeFalse();
});

test('it can insert a range of text', () => {
  const editor = renderEditor([]);
  const { doc, p } = editor.nodes;

  editor.add(doc(p('my <cursor>content')));
  editor.commands.insertText('awesome ');

  expect(editor.doc).toEqualProsemirrorNode(doc(p('my awesome content')));

  editor.commands.insertText('all ', { from: 1 });

  expect(editor.doc).toEqualProsemirrorNode(doc(p('all my awesome content')));
});

test('it can select text', () => {
  const editor = renderEditor([]);
  const { doc, p } = editor.nodes;

  editor.add(doc(p('my <cursor>content')));

  editor.commands.selectText('all');
  expect(editor.state.selection).toBeInstanceOf(AllSelection);

  editor.commands.selectText('end');
  expect(editor.state.selection.from).toBe(11);

  editor.commands.selectText('start');
  expect(editor.state.selection.from).toBe(1);

  editor.commands.selectText(2);
  expect(editor.state.selection.from).toBe(2);

  editor.commands.selectText({ from: 1, to: 3 });
  expect(editor.state.selection.empty).toBeFalse();
});
