import { pmBuild } from 'jest-prosemirror';
import { extensionValidityTest, renderEditor } from 'jest-remirror';

import { fromHtml, toHtml } from '@remirror/core';
import { createCoreManager } from '@remirror/testing';

import { CodeExtension } from '..';

extensionValidityTest(CodeExtension);

describe('schema', () => {
  const codeTester = () => {
    const { schema } = createCoreManager([new CodeExtension()]);
    const { code, doc, p } = pmBuild(schema, {
      code: { markType: 'code' },
    });

    return { schema, code, doc, p };
  };

  it('returns the correct html', () => {
    const expected = 'Brilliant';
    const { p, code, schema } = codeTester();

    expect(toHtml({ node: p(code(expected)), schema })).toBe(`<p><code>${expected}</code></p>`);
  });

  it('it can parse content', () => {
    const { p, code, schema, doc } = codeTester();
    const parsedString = 'Test';
    const node = fromHtml({
      content: `<p><code>${parsedString}</code></p>`,
      schema,
    });
    const expected = doc(p(code(parsedString)));

    expect(node).toEqualProsemirrorNode(expected);
  });
});

describe('inputRules', () => {
  const {
    add,
    nodes: { p, doc },
    marks: { code },
  } = renderEditor([new CodeExtension()]);

  it('should match input rule', () => {
    add(doc(p('Start<cursor>')))
      .insertText(' `code here!` for input rule match')
      .callback((content) => {
        expect(content.state.doc).toEqualRemirrorDocument(
          doc(p('Start ', code('code here!'), ' for input rule match')),
        );
      });
  });

  it('should ignore whitespace', () => {
    add(doc(p('<cursor>')))
      .insertText('` `\n   `')
      .callback((content) => {
        expect(content.state.doc).toEqualRemirrorDocument(doc(p('` `\n'), p('   `')));
      });
  });
});

describe('commands', () => {
  const {
    add,
    view,
    nodes: { p, doc },
    marks: { code },
    commands,
  } = renderEditor([new CodeExtension()]);

  it('#toggleBold', () => {
    add(doc(p('Hello <start>code<end>, lets dance.')));
    commands.toggleCode();

    expect(view.dom.innerHTML).toMatchInlineSnapshot(`
          <p>
            Hello
            <code>
              code
            </code>
            , lets dance.
          </p>
        `);
    expect(view.state.doc).toEqualRemirrorDocument(doc(p('Hello ', code('code'), ', lets dance.')));

    commands.toggleCode();

    expect(view.dom.innerHTML).toMatchInlineSnapshot(`
          <p>
            Hello code, lets dance.
          </p>
        `);
    expect(view.state.doc).toEqualRemirrorDocument(doc(p('Hello code, lets dance.')));
  });
});
