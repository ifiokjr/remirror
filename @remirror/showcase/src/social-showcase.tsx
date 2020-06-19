import matchSorter from 'match-sorter';
import React, { useCallback, useMemo, useState } from 'react';

import { startCase, take } from '@remirror/core';
import {
  createSocialManager,
  MentionChangeParameter,
  SocialEditor,
  SocialEditorProps,
  UserData,
} from '@remirror/editor-social';

import { fakeUsers } from './data/fake-users';

const fakeTags = [
  'Tags',
  'Fake',
  'Help',
  'TypingByHand',
  'DontDoThisAgain',
  'ZoroIsAwesome',
  'ThisIsATagList',
  'NeedsStylingSoon',
  'LondonHits',
  'MCM',
];

const userData: UserData[] = fakeUsers.results.map(
  (user): UserData => ({
    avatarUrl: user.picture.thumbnail,
    displayName: startCase(`${user.name.first} ${user.name.last}`),
    id: user.login.uuid,
    username: user.login.username,
    href: `/u/${user.login.username}`,
  }),
);

const manager = createSocialManager([]);

export const ExampleSocialEditor = (props: Partial<SocialEditorProps>) => {
  const [mention, setMention] = useState<MentionChangeParameter>();

  const onChange = useCallback((parameter?: MentionChangeParameter) => {
    setMention(parameter);
  }, []);

  const userMatches = useMemo(
    () =>
      mention && mention.name === 'at' && mention.query
        ? take(
            matchSorter(userData, mention.query, { keys: ['username', 'displayName'] }),
            6,
          ).map((user) => ({ ...user }))
        : [],
    [mention],
  );

  const tagMatches = useMemo(
    () =>
      mention && mention.name === 'tag' && mention.query
        ? take(matchSorter(fakeTags, mention.query), 6).map((tag) => ({
            tag,
          }))
        : [],
    [mention],
  );

  return (
    <SocialEditor
      {...props}
      manager={manager}
      attributes={{ 'data-testid': 'editor-social' }}
      userData={userMatches}
      tagData={tagMatches}
      onMentionChange={onChange}
    />
  );
};

export const SOCIAL_SHOWCASE_CONTENT = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          marks: [
            {
              type: 'mention',
              attrs: {
                id: 'blueladybug185',
                label: '@blueladybug185',
                name: 'at',
                href: '/blueladybug185',
                role: 'presentation',
              },
            },
          ],
          text: '@blueladybug185',
        },
        {
          type: 'text',
          text: ' has proven to me most helpful!',
        },
      ],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          marks: [
            {
              type: 'autoLink',
              attrs: {
                href: 'http://Random.com',
              },
            },
          ],
          text: 'Random.com',
        },
        {
          type: 'text',
          text: ' on the other hand has not.',
        },
      ],
    },
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Emojis still make me smile 😋 🙈',
        },
        {
          type: 'text',
          text: " and I'm here for that.",
        },
      ],
    },
  ],
};

export { fakeUsers, fakeTags, userData };
