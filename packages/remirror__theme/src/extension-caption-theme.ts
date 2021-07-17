import { css } from '@linaria/core';

import { getTheme } from './utils';

/**
 * This is compiled into the class name `remirror-editor` and the css is
 * automatically generated and placed into the `@remirror/styles/core.css` via
 * a `linaria` build script.
 */
export const EDITOR = css`
  figure {
    margin: 1em;
    width: fit-content;
  }

  figure > *:first-child {
    display: block;
  }

  figure > figcaption {
    background: ${getTheme((t) => t.color.shadow3)};
    padding: 0.25rem 1rem;
  }
` as 'remirror-editor';
