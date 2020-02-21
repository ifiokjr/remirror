import { RemirrorTheme } from '@remirror/core';
import { BaseExtensions, NodeCursorExtension, PlaceholderExtension } from '@remirror/core-extensions';
import { EmojiExtension } from '@remirror/extension-emoji';
import { EnhancedLinkExtension } from '@remirror/extension-enhanced-link';
import { MentionExtension, MentionExtensionMatcher } from '@remirror/extension-mention';
import { ManagedRemirrorProviderProps, RemirrorManagerProps } from '@remirror/react';
import { SuggestStateMatch } from 'prosemirror-suggest';
import { Except } from 'type-fest';

export type OnMentionChangeParams = MentionState & {
  /**
   * The currently active matching index
   */
  activeIndex: number;
};

export interface SocialEditorProps
  extends Partial<ManagedRemirrorProviderProps<SocialExtensions>>,
    Pick<RemirrorManagerProps, 'extensions'> {
  /**
   * Display a typing hint that limits the number of characters to this number. Defaults to 140, set to `null` to disable.
   */
  characterLimit?: number | null;

  /**
   * The message to show when the editor is empty.
   */
  placeholder?: string;

  /**
   * onUrlChange
   */
  onUrlsChange?(params: { set: Set<string>; urls: string[] }): void;

  /**
   * List of users
   */
  userData: UserData[];

  /**
   * List of tags
   */
  tagData: TagData[];

  /**
   * Called any time there is a change in the mention
   */
  onMentionChange(params?: OnMentionChangeParams): void;

  /**
   * The theme to be used for setting .
   */
  theme?: Partial<RemirrorTheme & Partial<RemirrorTheme['colors']>>;

  /**
   * The matcher options for the `@` mention character.
   */
  atMatcherOptions?: Except<MentionExtensionMatcher, 'name' | 'char'>;

  /**
   * The matcher options for the `#` mention character/
   */
  tagMatcherOptions?: Except<MentionExtensionMatcher, 'name' | 'char'>;
}

interface BaseMentionState {
  /**
   * The currently matched query which can be used to search and populate data.
   */
  query: string;
}

interface NameParams<GName extends string> {
  /**
   * The name of the currently active suggestion.
   * This is the name passed into the suggestionsMatcher config object.
   */
  name: GName;
}

interface AtMentionState extends BaseMentionState, NameParams<'at'> {}

interface HashMentionState extends BaseMentionState, NameParams<'tag'> {}

/**
 * The possible active suggestion names.
 */
export type MatchName = 'at' | 'tag';

export type MentionState = AtMentionState | HashMentionState;

export interface UserData {
  id?: string;
  href?: string;
  username: string;
  displayName: string;
  avatarUrl: string;
}

export interface TagData {
  id?: string;
  href?: string;
  tag: string;
}

export interface ActiveUserData extends UserData {
  active: boolean;
}

export interface ActiveTagData extends TagData {
  active: boolean;
}

/**
 * A method for retrieving the most up to date mention data.
 */
export type MentionGetter = () => SuggestStateMatch;

export interface SetExitTriggeredInternallyParams {
  /**
   * Identifies the command as an internal exit inducing command.
   * Prevents a second onExit from being dispatched.
   */
  setExitTriggeredInternally: () => void;
}

export interface MentionGetterParams {
  /**
   * Provides access to the most recent mention data.
   */
  getMention: MentionGetter;
}

export interface DataParams<GData> {
  /**
   * A list of data items.
   */
  data: GData[];
}

export interface UserSuggestionsProps
  extends MentionGetterParams,
    DataParams<ActiveUserData>,
    SetExitTriggeredInternallyParams {}

export interface TagSuggestionsProps
  extends MentionGetterParams,
    DataParams<ActiveTagData>,
    SetExitTriggeredInternallyParams {}

export type DivProps = JSX.IntrinsicElements['div'];
export type SpanProps = JSX.IntrinsicElements['span'];
export type ImgProps = JSX.IntrinsicElements['img'];

/**
 * The extensions used by the social editor.
 *
 * Using this as a generic value allows for better type inference in the editor.
 */
export type SocialExtensions =
  | BaseExtensions
  | NodeCursorExtension
  | PlaceholderExtension
  | EmojiExtension
  | EnhancedLinkExtension
  | MentionExtension;
