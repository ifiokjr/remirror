/** @jsx jsx */

import { capitalize, isString } from '@remirror/core-helpers';
import CodeBlock from '@theme-ui/prism';
import { ElementType, FC, Fragment } from 'react';
import { jsx } from 'theme-ui';

const heading = (Tag: ElementType) => {
  const Component: FC<{ id: string }> = props =>
    props.id ? (
      <Tag {...props}>
        <a
          href={`#${props.id}`}
          sx={{
            color: 'inherit',
            textDecoration: 'none',
            ':hover': {
              textDecoration: 'underline',
            },
          }}
        >
          {props.children}
        </a>
      </Tag>
    ) : (
      <Tag {...props} />
    );
  Component.displayName = isString(Tag) ? capitalize(Tag) : 'Heading';

  return Component;
};

const Pre: FC = ({ children }) => <Fragment>{children}</Fragment>;

export default {
  code: CodeBlock,
  pre: Pre,
  h2: heading('h2'),
  h3: heading('h3'),
  h4: heading('h4'),
  h5: heading('h5'),
  h6: heading('h6'),
};
