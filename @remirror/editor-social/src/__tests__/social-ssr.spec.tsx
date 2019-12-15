/**
 * @jest-environment node
 */

/** @jsx jsx */

import { jsx } from '@emotion/core';
import { noop } from '@remirror/core';
import { docNodeBasicJSON } from '@remirror/test-fixtures';
import { renderToString } from 'react-dom/server';

import { SocialEditor } from '..';

test('it renders within an ssr environment', () => {
  // global.renderToString = renderToString;
  const reactString = renderToString(
    <SocialEditor userData={[]} tagData={[]} onMentionChange={noop} initialContent={docNodeBasicJSON} />,
  );
  expect(reactString).toInclude('basic');
});
