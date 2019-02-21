/* tslint:disable:no-implicit-dependencies */

import React, { FunctionComponent } from 'react';

import { Mentions, MentionsNodeExtensionOptions } from '@remirror/mentions-extension';
import { Remirror, RemirrorProps } from '@remirror/react';
import { CharacterCountIndicator } from './character-count.component';
import { TwitterLink, TwitterLinkOptions } from './marks/twitter-link';
import { defaultStyles } from './styles';

export interface TwitterUIProps extends TwitterLinkOptions {
  hashMention?: MentionsNodeExtensionOptions;
  atMention?: MentionsNodeExtensionOptions;
}

export const TwitterUI: FunctionComponent<TwitterUIProps> = ({ onUrlsChange }) => {
  const onChange: RemirrorProps['onChange'] = () => undefined;
  const extensions = [
    new TwitterLink({ onUrlsChange }),
    new Mentions({
      type: 'user',
      matcher: { char: '@' },
      onKeyDown: arg => {
        console.log('key down for user', arg);
        return false;
      },
    }),
    new Mentions({
      type: 'tag',
      matcher: { char: '#' },
      onChange: arg => console.log(arg.query),
    }),
  ];

  return (
    <Remirror
      onChange={onChange}
      placeholder="What's happening?"
      styles={defaultStyles}
      extensions={extensions}
    >
      {({ getRootProps, view }) => {
        const content = view.state.doc.textContent;

        return (
          <div {...getRootProps()} style={{ position: 'relative' }}>
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                margin: '0 8px 4px 4px',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
              }}
            >
              <CharacterCountIndicator characters={{ total: 140, used: content.length }} />
            </div>
          </div>
        );
      }}
    </Remirror>
  );
};

/* Character count -
- emoji 2
- url 20
- character 1
*/
