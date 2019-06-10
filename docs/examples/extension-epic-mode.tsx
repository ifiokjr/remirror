import React, { FC, FunctionComponent } from 'react';

import { EDITOR_CLASS_SELECTOR } from '@remirror/core';
import { Bold, Italic, Underline } from '@remirror/core-extensions';
import {
  defaultEffect,
  EpicMode,
  heartEffect,
  ParticleEffect,
  spawningEffect,
} from '@remirror/extension-epic-mode';
import { ManagedRemirrorEditor, RemirrorExtension, RemirrorManager } from '@remirror/react';

const editorStyles = {
  [EDITOR_CLASS_SELECTOR]: {
    border: '1px solid grey',
    minHeight: '50px',
    borderRadius: '10px',
    padding: '10px',
  },
};

interface EpicModeComponentProps {
  particleEffect: ParticleEffect;
  placeholder?: string;
  shake?: boolean;
}

const EpicModeComponent: FC<EpicModeComponentProps> = ({
  particleEffect,
  placeholder = 'Type for epic...',
  shake,
}) => {
  return (
    <div style={{ gridArea: 'editor' }} placeholder={placeholder}>
      <RemirrorManager>
        <RemirrorExtension Constructor={Bold} />
        <RemirrorExtension Constructor={Italic} />
        <RemirrorExtension Constructor={Underline} />
        <RemirrorExtension Constructor={EpicMode} particleEffect={particleEffect} shake={shake} />
        <ManagedRemirrorEditor
          autoFocus={true}
          attributes={{ 'data-test-id': 'editor-instance' }}
          editorStyles={editorStyles}
        />
      </RemirrorManager>
    </div>
  );
};

export const EpicModeDefault: FunctionComponent = () => (
  <EpicModeComponent particleEffect={defaultEffect} shake={true} />
);
export const EpicModeSpawning: FunctionComponent = () => (
  <EpicModeComponent particleEffect={spawningEffect} shake={true} />
);
export const EpicModeHeart: FunctionComponent = () => (
  <EpicModeComponent particleEffect={heartEffect} shake={false} placeholder='Type for hearts' />
);
