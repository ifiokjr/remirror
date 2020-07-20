import { EditorState, isEditorState, isProsemirrorNode, ProsemirrorNode } from '@remirror/core';

import { TaggedProsemirrorNode } from './jest-remirror-types';

export const remirrorMatchers: jest.ExpectExtendMap = {
  toContainRemirrorDocument(state: EditorState, expected: TaggedProsemirrorNode) {
    if (!isProsemirrorNode(expected)) {
      return {
        pass: false,
        actual: state,
        expected,
        name: 'toContainRemirrorDocument',
        message: () => 'The expected value should be an instance of ProsemirrorNode.',
      };
    }

    if (!isEditorState(state)) {
      return {
        pass: false,
        actual: state,
        expected,
        name: 'toContainRemirrorDocument',
        message: () => 'Expected the value passed in to be an EditorState',
      };
    }

    if (expected.type.schema !== state.schema) {
      return {
        pass: false,
        actual: state,
        expected,
        name: 'toContainRemirrorDocument',
        message: () => 'Expected both values to be using the same schema.',
      };
    }

    const pass = this.equals(state.doc.content.child(0).toJSON(), expected.toJSON());
    const message = pass
      ? () =>
          `${this.utils.matcherHint('.not.toContainRemirrorDocument')}\n\n` +
          `Expected JSON value of document to not contain:\n  ${this.utils.printExpected(
            expected,
          )}\n` +
          `Actual JSON:\n  ${this.utils.printReceived(state.doc.content.child(0))}`
      : () => {
          const diffString = this.utils.diff(expected, state.doc.content.child(0), {
            expand: this.expand,
          });
          return (
            `${this.utils.matcherHint('.toContainRemirrorDocument')}\n\n` +
            `Expected JSON value of document to contain:\n${this.utils.printExpected(expected)}\n` +
            `Actual JSON:\n  ${this.utils.printReceived(state.doc.content.child(0))}` +
            `${diffString ? `\n\nDifference:\n\n${diffString}` : ''}`
          );
        };

    return {
      pass,
      actual: state,
      expected,
      message,
      name: 'toContainRemirrorDocument',
    };
  },

  toEqualRemirrorDocument(actual: ProsemirrorNode, expected: TaggedProsemirrorNode) {
    // Because schema is created dynamically, expected value is a function (schema) => PMNode;
    // That's why this magic is necessary. It simplifies writing assertions, so
    // instead of expect(doc).toEqualRemirrorDocument(doc(p())(schema)) we can just do:
    // expect(doc).toEqualRemirrorDocument(doc(p())).

    // Also it fixes issues that happens sometimes when actual schema and expected schema
    // are different objects, making this case impossible by always using actual schema to create expected node.

    if (!isProsemirrorNode(expected) || !isProsemirrorNode(actual)) {
      return {
        pass: false,
        actual,
        expected,
        name: 'toEqualRemirrorDocument',
        message: () => 'Expected both values to be instance of prosemirror-model Node.',
      };
    }

    if (expected.type.schema !== actual.type.schema) {
      return {
        pass: false,
        actual,
        expected,
        name: 'toEqualRemirrorDocument',
        message: () => 'Expected both values to be using the same schema.',
      };
    }

    const pass = this.equals(actual.toJSON(), expected.toJSON());
    const message = pass
      ? () =>
          `${this.utils.matcherHint('.not.toEqualRemirrorDocument')}\n\n` +
          `Expected JSON value of document to not equal:\n  ${this.utils.printExpected(
            expected,
          )}\n` +
          `Actual JSON:\n  ${this.utils.printReceived(actual)}`
      : () => {
          const diffString = this.utils.diff(expected, actual, {
            expand: this.expand,
          });
          return (
            `${this.utils.matcherHint('.toEqualRemirrorDocument')}\n\n` +
            `Expected JSON value of document to equal:\n${this.utils.printExpected(expected)}\n` +
            `Actual JSON:\n  ${this.utils.printReceived(actual)}` +
            `${diffString ? `\n\nDifference:\n\n${diffString}` : ''}`
          );
        };

    return {
      pass,
      actual,
      expected,
      message,
      name: 'toEqualRemirrorDocument',
    };
  },
};

declare global {
  namespace jest {
    interface Matchers<R, T> {
      /**
       * Checks that EditorState passed in has this as it's top level parent node.
       *
       * ```ts
       * expect(view.state).toContainRemirrorDocument(p(`This is SPARTA`));
       * ```
       */
      toContainRemirrorDocument: (builder: TaggedProsemirrorNode) => R;
      /**
       * Checks that two prosemirror documents are identical.
       */
      toEqualRemirrorDocument: (builder: TaggedProsemirrorNode) => R;
    }
  }
}
