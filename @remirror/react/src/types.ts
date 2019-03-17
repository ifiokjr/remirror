import {
  AnyExtension,
  EditorSchema,
  EditorState,
  ExtensionManager,
  ObjectNode,
  OffsetCalculator,
  PlainObject,
  Position,
  RawMenuPositionData,
  RemirrorActions,
  RemirrorContentType,
  ShouldRenderMenu,
  Transaction,
} from '@remirror/core';
import { RenderEnvironment } from '@remirror/react-ssr';
import { Interpolation, ObjectInterpolation } from 'emotion';
import { EditorView } from 'prosemirror-view';

export interface GetMenuPropsConfig<GRefKey extends string = 'ref'> extends BaseGetterConfig<GRefKey> {
  offset?: OffsetCalculator;
  shouldRender?: ShouldRenderMenu;
  offscreenPosition?: Partial<Position>;
  name: string;
}

export interface BaseGetterConfig<GRefKey extends string = 'ref'> {
  refKey?: GRefKey;
}

export interface GetRootPropsConfig<GRefKey extends string = 'ref'>
  extends BaseGetterConfig<GRefKey>,
    PlainObject {
  editorStyles?: Interpolation<RemirrorProps>;
}

export type RefKeyRootProps<GRefKey extends string = 'ref'> = {
  [P in Exclude<GRefKey, 'children' | 'key'>]: React.Ref<any>
} & { className: string; key: string } & PlainObject;

/**
 * These are the props passed to the render function provided when setting up your editor.
 */
export interface InjectedRemirrorProps {
  /**
   * An instance of the extension manager
   */
  manager: ExtensionManager;
  /**
   * The prosemirror view
   */
  view: EditorView<EditorSchema>;

  /**
   * A map of actions available the
   */
  actions: RemirrorActions;

  /**
   * A unique id for the editor instance. Useful for styling with the format `.remirror-{NUM}`
   */
  uid: string;
  getMarkAttr(type: string): Record<string, string>;
  clearContent(triggerOnChange?: boolean): void;
  setContent(content: RemirrorContentType, triggerOnChange?: boolean): void;
  getRootProps<GRefKey extends string = 'ref'>(
    options?: GetRootPropsConfig<GRefKey>,
  ): RefKeyRootProps<GRefKey>;
  getMenuProps<GRefKey extends string = 'ref'>(
    options: GetMenuPropsConfig<GRefKey>,
  ): {
    position: Position;
    rawData: RawMenuPositionData | null;
    offscreen: boolean;
  } & { [P in Exclude<GRefKey, 'children' | 'key' | 'position' | 'rawData' | 'offscreen'>]: React.Ref<any> };
}

export type RenderPropFunction = (params: InjectedRemirrorProps) => JSX.Element;

export interface RemirrorEventListenerParams {
  state: EditorState<EditorSchema>;
  view: EditorView<EditorSchema>;
  getHTML(): string;
  getText(lineBreakDivider?: string): string;
  getJSON(): ObjectNode;
  getDocJSON(): ObjectNode;
}

export type RemirrorEventListener = (params: RemirrorEventListenerParams) => void;

export type AttributePropFunction = (params: RemirrorEventListenerParams) => Record<string, string>;

export interface RemirrorProps {
  /**
   * Pass in extension instances which determine the behaviour of the editor.
   *
   * @default []
   */
  extensions: AnyExtension[];

  /**
   * Set the starting value object of the editor.
   *
   * Remirror exports an uncontrolled component. Value changes are passed back out of the editor and there is now way to
   * set the value via props. As a result this is the only opportunity to directly control the rendered text.
   *
   * @default "{ type: 'doc', content: [{ type: 'paragraph' }] }"
   */
  initialContent: ObjectNode | string;

  /**
   * Adds attributes directly to the prosemirror html element.
   *
   * @default {}
   */
  attributes: Record<string, string> | AttributePropFunction;

  /**
   * Determines whether this editor is editable or not.
   *
   * @default true
   */
  editable: boolean;

  /**
   * Set to true to force the focus on the editor when the editor first loads.
   *
   * @default false
   */
  autoFocus?: boolean;

  /**
   * Sets the placeholder for the editor. Can pass in a tuple to set the text of the placeholder and the styles at the same time.
   * ```tsx
   * <Remirror placeholder={['Please enter your message', { color: 'red' }]} {...props} />
   * ```
   *
   * @default undefined
   */
  placeholder?: string | [string, ObjectInterpolation<undefined>];
  /**
   * Called on every change in the Prosemirror state
   */
  onChange?: RemirrorEventListener;

  /**
   * Method called onFocus
   */
  onFocus?: RemirrorEventListener;

  /**
   * Method called onBlur
   */
  onBlur?: RemirrorEventListener;

  /**
   * Called on the first render when the prosemirror instance first becomes available
   */
  onFirstRender?: RemirrorEventListener;

  /**
   * Render function.
   */
  children: RenderPropFunction;
  /**
   * Hook called when the editor is dispatching an actions. Use this to attach additional actions or to update outside state
   * based on what's changed within the editor component.
   */
  dispatchTransaction?: ((tr: Transaction) => void) | null;

  /**
   * Sets the accessibility label for the editor instance.
   *
   * @default ''
   */
  label: string;

  /**
   * Determines whether or not to use the built in extensions.
   * ```ts
   * const builtInExtensions = [new Placeholder(), new Doc(), new Text(), new Paragraph()]
   * ```
   * Use this only if you would like to take full control of all your extensions and if you know what you're doing.
   *
   * @default true
   */
  usesBuiltInExtensions: boolean;

  /**
   * Determine whether the editor should use default styles.
   *
   * @default true
   */
  usesDefaultStyles: boolean;

  /**
   * Additional editor styles passed into prosemirror. Used to provide styles for the text, nodes and marks
   * rendered in the editor.
   *
   * @default {}
   */
  editorStyles: Interpolation;

  /**
   * Determine whether the Prosemirror view is inserted as first in the holding html element or last.
   *
   * Last means that any elements added to the holding react component will actually be inserted before and as a result would lose
   * click access.
   *
   * @default end
   */
  insertPosition: 'start' | 'end';

  /**
   * By default remirror will work out whether this is a dom environment or server environment for SSR rendering
   * This can be overridden with this property
   */
  forceEnvironment?: RenderEnvironment;
}

export interface PlaceholderConfig {
  text: string;
  className: string;
  style: ObjectInterpolation<undefined>;
}
