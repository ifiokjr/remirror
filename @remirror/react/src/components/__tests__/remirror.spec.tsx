import { fromHTML } from '@remirror/core';
import { createTestManager } from '@remirror/test-fixtures';
import { fireEvent, render } from '@testing-library/react';
import { axe } from 'jest-axe';
import React from 'react';
import { renderToString } from 'react-dom/server';

import { InjectedRemirrorProps } from '../../react-types';
import { Remirror } from '../';

const textContent = `This is editor text`;
const label = 'Remirror editor';
const handlers = {
  onChange: jest.fn(),
  onBlur: jest.fn(),
  onFocus: jest.fn(),
  onFirstRender: jest.fn(),
};

test('should be called via a render prop', () => {
  const mock = jest.fn(() => <div />);
  const { getByLabelText } = render(
    <Remirror manager={createTestManager()} label={label} {...handlers}>
      {mock}
    </Remirror>,
  );
  expect(mock).toHaveBeenCalledWith(expect.any(Object));
  expect(handlers.onFirstRender).toHaveBeenCalledWith(expect.any(Object));
  expect(handlers.onFirstRender.mock.calls[0][0].getText()).toBe('');
  expect(handlers.onFirstRender.mock.calls[0][0].getJSON().doc.type).toBe('doc');
  expect(handlers.onFirstRender.mock.calls[0][0].getHTML().type).toBe(undefined);
  const editorNode = getByLabelText(label);
  expect(editorNode).toHaveAttribute('role', 'textbox');
});

test('can suppressHydrationWarning without breaking', () => {
  const mock = jest.fn(() => <div />);
  const { getByLabelText } = render(
    <Remirror manager={createTestManager()} label={label} {...handlers} suppressHydrationWarning={true}>
      {mock}
    </Remirror>,
  );
  expect(mock).toHaveBeenCalledWith(expect.any(Object));
  expect(handlers.onFirstRender).toHaveBeenCalledWith(expect.any(Object));
  expect(handlers.onFirstRender.mock.calls[0][0].getText()).toBe('');
  expect(handlers.onFirstRender.mock.calls[0][0].getJSON().doc.type).toBe('doc');
  expect(handlers.onFirstRender.mock.calls[0][0].getHTML().type).toBe(undefined);
  const editorNode = getByLabelText(label);
  expect(editorNode).toHaveAttribute('role', 'textbox');
});

describe('basic functionality', () => {
  it('is accessible', async () => {
    const results = await axe(
      renderToString(<Remirror manager={createTestManager()}>{() => <div />}</Remirror>),
    );

    expect(results).toHaveNoViolations();
  });

  it("doesn't render the editor without `children` as a render prop", () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() =>
      // @ts-ignore
      render(<Remirror label={label} manager={createTestManager()} />),
    ).toThrowErrorMatchingInlineSnapshot(
      `"The child argument to the Remirror component must be a function."`,
    );
    expect(spy).toHaveBeenCalledTimes(2);
    spy.mockRestore();
  });

  it('should allow text input and fire all handlers', () => {
    let setContent: InjectedRemirrorProps['setContent'] = jest.fn();
    const mock = jest.fn((value: InjectedRemirrorProps) => {
      setContent = value.setContent;
      return <div />;
    });
    const { getByLabelText } = render(
      <Remirror label={label} {...handlers} manager={createTestManager()} stringHandler={fromHTML}>
        {mock}
      </Remirror>,
    );

    setContent(`<p>${textContent}</p>`, true);
    const editorNode = getByLabelText(label);
    expect(handlers.onChange).toHaveBeenCalledTimes(1);
    expect(handlers.onFirstRender.mock.calls[0][0].getText()).toBe(textContent);

    fireEvent.blur(editorNode);
    expect(handlers.onBlur).toHaveBeenCalledTimes(1);

    fireEvent.focus(editorNode);
    expect(handlers.onFocus).toHaveBeenCalledTimes(1);
  });

  it('changes when the editable prop changes', () => {
    const mock = jest.fn(() => <div />);
    const manager = createTestManager();
    const El = ({ editable }: { editable: boolean }) => (
      <Remirror editable={editable} label={label} manager={manager}>
        {mock}
      </Remirror>
    );
    const { rerender, getByLabelText } = render(<El editable={true} />);
    expect(getByLabelText(label)).toHaveAttribute('contenteditable', 'true');
    rerender(<El editable={false} />);
    expect(getByLabelText(label)).toHaveAttribute('contenteditable', 'false');
  });
});

describe('initialContent', () => {
  it('should render with string content', () => {
    const { container } = render(
      <Remirror
        label={label}
        {...handlers}
        manager={createTestManager()}
        initialContent={'<p>Hello</p>'}
        stringHandler={fromHTML}
      >
        {() => <div />}
      </Remirror>,
    );
    expect(container.innerHTML).toInclude('Hello');
  });

  it('renders with json', () => {
    const content = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }],
    };

    const { container } = render(
      <Remirror label={label} {...handlers} manager={createTestManager()} initialContent={content}>
        {() => <div />}
      </Remirror>,
    );
    expect(container.innerHTML).toInclude('Hello');
  });
});

test('focus', () => {
  jest.useFakeTimers();
  const content = {
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text: 'A sentence here' }] }],
  };

  let props!: InjectedRemirrorProps<any>;
  const { getByRole } = render(
    <Remirror
      label={label}
      {...handlers}
      manager={createTestManager()}
      initialContent={content}
      autoFocus={true}
    >
      {context => {
        props = context;
        return <div />;
      }}
    </Remirror>,
  );

  const editorNode = getByRole('textbox');

  // Focusing on a focused editor without a new position should be idempotent (do nothing).
  expect(props.state.newState.selection.from).toBe(1);
  props.focus();
  jest.runAllTimers();
  expect(props.state.newState.selection.from).toBe(1);

  // Can focus on the end
  fireEvent.blur(editorNode);
  props.focus('end');
  jest.runAllTimers();
  expect(props.state.newState.selection.from).toBe(16);

  // Can focus on the start even when already focused.
  props.focus('start');
  jest.runAllTimers();
  expect(props.state.newState.selection.from).toBe(1);

  // Can specify the exact position for the blurred editor
  fireEvent.blur(editorNode);
  props.focus(10);
  jest.runAllTimers();
  expect(props.state.newState.selection.from).toBe(10);

  // Can specify the selection for the editor
  fireEvent.blur(editorNode);
  const expected = { from: 2, to: 5 };
  props.focus(expected);
  jest.runAllTimers();
  {
    const { from, to } = props.state.newState.selection;
    expect({ from, to }).toEqual(expected);
  }

  // Restores the previous selection when focused without a paramter.
  fireEvent.blur(editorNode);
  props.focus();
  {
    const { from, to } = props.state.newState.selection;
    expect({ from, to }).toEqual(expected);
  }

  // expect(props.state.newState.selection.from).toBe(10);
  jest.useRealTimers();
});
