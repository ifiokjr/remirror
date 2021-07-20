import 'remirror/styles/all.css';

import React, { useState } from 'react';
import { IframeExtension } from 'remirror/extensions';
import { htmlToProsemirrorNode } from '@remirror/core';
import { Remirror, ThemeProvider, useCommands, useRemirror } from '@remirror/react';

export default { title: 'Iframe' };

export const Basic: React.FC = () => {
  const { manager, state, onChange } = useRemirror({
    extensions: () => [new IframeExtension()],
    content: '<p>click to add a fixed-size iframe</p>',
    stringHandler: htmlToProsemirrorNode,
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} autoFocus onChange={onChange} state={state} autoRender='end'>
        <AddIframe />
      </Remirror>
    </ThemeProvider>
  );
};

const AddIframe = () => {
  const commands = useCommands();
  const [src, setSrc] = useState('https://remirror.io/');
  const handleClick = () => commands.addIframe({ src, height: 250, width: 500 });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSrc(e.target.value);
  };
  return (
    <>
      <button onClick={handleClick}> Add iframe</button>
      <input type='text' value={src} onChange={handleChange} />
    </>
  );
};

export const Resizable: React.FC = () => {
  const { manager, state, onChange } = useRemirror({
    extensions: () => [new IframeExtension({ enableResizing: true })],
    content: '<p>click to add a resizable iframe</p>',
    stringHandler: htmlToProsemirrorNode,
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} autoFocus onChange={onChange} state={state} autoRender='end'>
        <AddResizableIframe />
      </Remirror>
    </ThemeProvider>
  );
};

const AddResizableIframe = () => {
  const commands = useCommands();
  const [src, setSrc] = useState('https://remirror.io/');
  const onclick = () => commands.addIframe({ src, height: 250, width: 500 });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSrc(e.target.value);
  };
  return (
    <>
      <button onClick={onclick}> Add resizable iframe</button>
      <input type='text' value={src} onChange={handleChange} />
    </>
  );
};
