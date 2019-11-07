/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useRemirrorTheme } from '@remirror/ui';
import { forwardRef } from 'react';

export type ResetButtonProps = JSX.IntrinsicElements['button'];

/**
 * This component renders a button with all styling removed.
 */
export const ResetButton = forwardRef<HTMLButtonElement, ResetButtonProps>((props, ref) => {
  const { sxx } = useRemirrorTheme();

  return (
    <button
      {...props}
      ref={ref}
      css={sxx({
        padding: 0,
        border: 'none',
        font: 'inherit',
        color: 'inherit',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        textTransform: 'none',
        userSelect: 'none',
        display: 'inline-block',
      })}
    />
  );
});
ResetButton.displayName = 'ResetButton';
