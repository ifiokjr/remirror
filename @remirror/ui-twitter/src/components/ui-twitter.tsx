import React, { PureComponent } from 'react';

import { css, Interpolation } from '@emotion/core';
import { AnyExtension, EditorSchema, Omit } from '@remirror/core';
import { EnhancedLink, EnhancedLinkOptions } from '@remirror/extension-enhanced-link';
import { MentionNode, NodeAttrs, OnKeyDownParams } from '@remirror/extension-mention';
import { Remirror, RemirrorProps } from '@remirror/react';
import { ThemeProvider } from 'emotion-theming';
import keyCode from 'keycode';
import { omit } from 'lodash';
import { EditorView } from 'prosemirror-view';
import { styled, UITwitterTheme, uiTwitterTheme } from '../theme';
import { ActiveTwitterTagData, ActiveTwitterUserData, TwitterTagData, TwitterUserData } from '../types';
import { CharacterCountIndicator } from './character-count';
import { AtSuggestions, HashSuggestions } from './suggestions';

export type OnQueryChangeParams = Omit<MentionState, 'submitFactory'> & { activeIndex: number };

export interface TwitterUIProps extends EnhancedLinkOptions, Partial<RemirrorProps> {
  /**
   * The number of matches to display
   */
  userData: TwitterUserData[];
  tagData: TwitterTagData[];
  onMentionStateChange(params?: OnQueryChangeParams): void;
  theme: UITwitterTheme;
}

interface AtMentionState {
  type: 'at';
  query: string;
  submitFactory(user: TwitterUserData): () => void;
}
interface HashMentionState {
  type: 'hash';
  query: string;
  submitFactory(tag: TwitterTagData): () => void;
}

type MentionState = AtMentionState | HashMentionState;

interface State {
  mention?: MentionState;
  activeIndex: number;
}

export class TwitterUI extends PureComponent<TwitterUIProps, State> {
  public static defaultProps = {
    theme: { colors: {} },
  };

  public readonly state: State = { activeIndex: 0 };
  private readonly extensions: AnyExtension[];
  private view?: EditorView;

  constructor(props: TwitterUIProps) {
    super(props);
    this.extensions = this.createExtensions();
  }

  private createExtensions() {
    return [
      new MentionNode({
        type: 'at',
        extraAttrs: ['href', 'role'],
        matcher: { char: '@' },
        onKeyDown: this.keyDownHandler,
        onEnter: ({ query, command }) => {
          this.setMention({
            type: 'at',
            query: query || '',
            submitFactory: this.atMentionSubmitFactory(command),
          });
          this.props.onMentionStateChange({
            type: 'at',
            query: query || '',
            activeIndex: this.state.activeIndex,
          });
          this.setActiveIndex(0);
        },
        onChange: ({ query, command }) => {
          this.setMention({
            type: 'at',
            query: query || '',
            submitFactory: this.atMentionSubmitFactory(command),
          });
          this.props.onMentionStateChange({
            type: 'at',
            query: query || '',
            activeIndex: this.state.activeIndex,
          });
          this.setActiveIndex(0);
        },
        onExit: params => {
          console.log('exiting', params);
          this.setMention(undefined);
          this.props.onMentionStateChange(undefined);
        },
      }),
      new MentionNode({
        type: 'hash',
        matcher: { char: '#' },
        onKeyDown: this.keyDownHandler,
        onEnter: ({ query, command }) => {
          this.setMention({
            type: 'hash',
            query: query || '',
            submitFactory: this.hashMentionSubmitFactory(command),
          });
          this.props.onMentionStateChange({
            type: 'hash',
            query: query || '',
            activeIndex: this.state.activeIndex,
          });
          this.setActiveIndex(0);
        },
        onChange: ({ query, command }) => {
          this.setMention({
            type: 'hash',
            query: query || '',
            submitFactory: this.hashMentionSubmitFactory(command),
          });
          this.props.onMentionStateChange({
            type: 'hash',
            query: query || '',
            activeIndex: this.state.activeIndex,
          });
          this.setActiveIndex(0);
        },
        onExit: () => {
          this.setMention(undefined);
          this.props.onMentionStateChange(undefined);
        },
      }),
      new EnhancedLink({ onUrlsChange: this.props.onUrlsChange }),
    ];
  }

  /**
   * Keeps a copy of the editor view for commands
   * @param view
   */
  private storeView(view: EditorView<EditorSchema>): void {
    if (view !== this.view) {
      this.view = view;
    }
  }

  private onChange() {
    //
  }

  get userMatches(): ActiveTwitterUserData[] {
    return this.props.userData.map((user, index) => ({
      ...user,
      active: index === this.state.activeIndex,
    }));
  }

  get tagMatches(): ActiveTwitterTagData[] {
    return this.props.tagData.map((data, index) => ({
      ...data,
      active: index === this.state.activeIndex,
    }));
  }

  private atMentionSubmitFactory(command: (attrs: NodeAttrs) => void) {
    return (user: TwitterUserData) => () => {
      command({
        id: user.username,
        label: user.username,
        role: 'presentation',
        href: `/${user.username}`,
      });
      // Refocus the editor
      if (this.view) {
        this.view.focus();
      }
    };
  }

  private hashMentionSubmitFactory(command: (attrs: NodeAttrs) => void) {
    return ({ tag }: TwitterTagData) => () => {
      command({
        id: tag,
        label: tag,
        role: 'presentation',
        href: `/search?query=${tag}`,
      });
      // Refocus the editor
      if (this.view) {
        this.view.focus();
      }
    };
  }

  private setActiveIndex(activeIndex: number) {
    this.setState({ activeIndex });
  }

  private setMention(mention?: MentionState) {
    this.setState({ mention });
  }

  private keyDownHandler = ({ event }: OnKeyDownParams) => {
    const enter = keyCode.isEventKey(event, 'enter');
    const down = keyCode.isEventKey(event, 'down');
    const up = keyCode.isEventKey(event, 'up');
    const esc = keyCode.isEventKey(event, 'esc');

    const { mention, activeIndex } = this.state;
    const { onMentionStateChange } = this.props;

    if (!mention) {
      return false;
    }

    const { type, query } = mention;
    const matches = type === 'at' ? this.userMatches : this.tagMatches;

    // pressed up arrow
    if (up) {
      console.log('up pressed');
      const newIndex = activeIndex - 1 < 0 ? matches.length - 1 : activeIndex - 1;
      this.setActiveIndex(newIndex);
      onMentionStateChange({ type, query, activeIndex: newIndex });
      return true;
    }

    // pressed down arrow
    if (down) {
      console.log('down pressed');
      const newIndex = activeIndex + 1 > matches.length - 1 ? 0 : activeIndex + 1;
      this.setActiveIndex(newIndex);
      onMentionStateChange({ type, query, activeIndex: newIndex });
      return true;
    }

    // pressed enter
    if (enter) {
      if (mention.type === 'at') {
        mention.submitFactory(this.userMatches[activeIndex])();
      } else {
        mention.submitFactory(this.tagMatches[activeIndex])();
      }

      return true;
    }

    if (esc) {
      // ? Perhaps add a remove text action for esc - for now nothing happens
    }

    return false;
  };

  private get theme(): UITwitterTheme {
    const { theme: propTheme = { colors: {} } } = this.props;
    return { ...uiTwitterTheme, ...propTheme, colors: { ...uiTwitterTheme.colors, ...propTheme.colors } };
  }

  private get remirrorProps(): Partial<RemirrorProps> {
    return omit(this.props, ['userData', 'tagData', 'onMentionStateChange', 'theme']);
  }

  public render() {
    const { mention } = this.state;
    return (
      <ThemeProvider theme={this.theme}>
        <Remirror
          placeholder={[
            "What's happening?",
            {
              color: '#aab8c2',
              fontStyle: 'normal',
              position: 'absolute',
              fontWeight: 300,
              letterSpacing: '0.5px',
            },
          ]}
          {...this.remirrorProps}
          extensions={this.extensions}
          onChange={this.onChange}
        >
          {({ getRootProps, view }) => {
            const content = view.state.doc.textContent;
            this.storeView(view);

            const { css: extra, ...rest } = getRootProps();
            return (
              <div>
                <RemirrorWrapper {...rest} extra={extra}>
                  <CharacterCountWrapper>
                    <CharacterCountIndicator characters={{ total: 140, used: content.length }} />
                  </CharacterCountWrapper>
                </RemirrorWrapper>
                <div>
                  {!mention ? null : mention.type === 'at' ? (
                    <AtSuggestions data={this.userMatches} submitFactory={mention.submitFactory} />
                  ) : (
                    <HashSuggestions data={this.tagMatches} submitFactory={mention.submitFactory} />
                  )}
                </div>
              </div>
            );
          }}
        </Remirror>
      </ThemeProvider>
    );
  }
}

/* Styled Components */

const CharacterCountWrapper = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  margin: 0 8px 4px 4px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

const RemirrorWrapper = styled.div<{ extra: Interpolation[] }>`
  ${props => css(props.extra)};

  position: relative;

  .remirror-editor:focus {
    outline: none;
  }

  .remirror-editor p {
    margin: 0;
    letter-spacing: 0.6px;
    color: black;
  }

  .remirror-editor {
    box-sizing: border-box;
    position: relative;
    border: 1px solid ${({ theme }) => theme.colors.border};
    box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.border};
    line-height: 20px;
    border-radius: 8px;
    width: 100%;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 14px;
    max-height: calc(90vh - 124px);
    min-height: 142px;
    padding: 8px;
    padding-right: 31px;
    font-weight: 400;
  }

  .remirror-editor a {
    text-decoration: none !important;
    color: ${props => props.theme.colors.primary};
  }

  .remirror-editor a.mention {
    pointer-events: none;
    cursor: default;
  }

  .remirror-editor .ProseMirror-selectednode {
    background-color: rgb(245, 248, 250);
  }
`;

/* Character count -
- emoji 2
- url 20
- character 1
*/
