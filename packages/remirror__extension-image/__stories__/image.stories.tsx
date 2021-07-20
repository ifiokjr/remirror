import 'remirror/styles/all.css';

import React from 'react';
import { ImageExtension } from 'remirror/extensions';
import { htmlToProsemirrorNode } from '@remirror/core';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';

export default { title: 'Image' };

const basicExtensions = () => [new ImageExtension()];

export const Basic: React.FC = () => {
  const { manager, state, onChange } = useRemirror({
    extensions: basicExtensions,
    content:
      '<p>You can see a green image below.</p><img src="https://dummyimage.com/200x80/479e0c/fafafa">',
    stringHandler: htmlToProsemirrorNode,
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} autoFocus onChange={onChange} state={state} autoRender='end' />
    </ThemeProvider>
  );
};

const resizableExtensions = () => [new ImageExtension({ enableResizing: true })];

export const Resizable: React.FC = () => {
  const { manager, state, onChange } = useRemirror({
    extensions: resizableExtensions,
    content:
      '<p>You can see a resizable image below. Move you mouse over the image and drag the resizing handler to resize it.</p>' +
      '<p style="display:flex; align-items: center; justify-content: center;"><img src="https://dummyimage.com/200x80/479e0c/fafafa"></div>',
    stringHandler: htmlToProsemirrorNode,
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} autoFocus onChange={onChange} state={state} autoRender='end' />
    </ThemeProvider>
  );
};
