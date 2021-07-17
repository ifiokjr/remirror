import 'remirror/styles/all.css';

import React from 'react';
import { CaptionExtension, ImageExtension } from 'remirror/extensions';
import { htmlToProsemirrorNode } from '@remirror/core';
import { Remirror, ThemeProvider, useCommands, useRemirror } from '@remirror/react';

export default { title: 'Captions' };

const basicExtensions = () => [
  new CaptionExtension(),
  new ImageExtension({
    nodeOverride: {
      inline: false,
      atom: true,
      selectable: true,
    },
  }),
];

const Buttons = () => {
  const { toggleCaption } = useCommands();

  return (
    <div style={{ display: 'flex' }}>
      <button onClick={() => toggleCaption()}>
        Caption {Boolean(toggleCaption.enabled()).toString()}
      </button>
    </div>
  );
};

export const Basic: React.FC = () => {
  const { manager, state, onChange } = useRemirror({
    extensions: basicExtensions,
    content:
      '<p>You can see a green image below. Click on it, and begin typing to add a caption.</p>' +
      '<img src="https://dummyimage.com/200x80/479e0c/fafafa">',
    stringHandler: htmlToProsemirrorNode,
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} autoFocus onChange={onChange} state={state} autoRender='end'>
        <Buttons />
      </Remirror>
    </ThemeProvider>
  );
};
