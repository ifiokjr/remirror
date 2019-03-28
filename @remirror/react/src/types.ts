import {
  CompareStateParams,
  EditorSchema,
  EditorState,
  EditorViewParams,
  ElementParams,
  Extension,
  ExtensionConstructor,
  ExtensionManager,
  NodeExtension,
  NodeExtensionConstructor,
  NodeExtensionOptions,
  ObjectNode,
  Omit,
  PlainObject,
  Position,
  PositionParams,
  RemirrorActions,
  RemirrorContentType,
  Transaction,
} from '@remirror/core';
import { RenderEnvironment } from '@remirror/react-ssr';
import { Interpolation, ObjectInterpolation } from 'emotion';
import { EditorView } from 'prosemirror-view';
import { ComponentClass, ComponentType, FC } from 'react';

export interface Positioner {
  /**
   * The default and initial position value. This is used at the start and whenever isActive becomes false
   */

  initialPosition: Position;
  /**
   * Determines whether anything has changed and whether to continue with
   * a recalculation
   *
   * @param params
   */
  hasChanged(params: CompareStateParams): boolean;

  /**
   * Determines whether the positioner should be active
   */
  isActive(params: GetPositionParams): boolean;

  /**
   * Calculate and return a new position (only called when `hasChanged` and `isActive` return true)
   */
  getPosition(params: GetPositionParams): Position;
}

export type CalculatePositionerParams = PositionerIdParams & Positioner;

export type GetPositionerPropsConfig<GRefKey extends string = 'ref'> = RefParams<GRefKey> &
  Partial<Omit<CalculatePositionerParams, 'positionerId'>> &
  PositionerIdParams;

export interface RefParams<GRefKey extends string = 'ref'> {
  /**
   * A custom ref key which allows a reference to be obtained from non standard components.
   *
   * @default 'ref'
   */
  refKey?: GRefKey;
}

export type PositionerProps = IsActiveParams & Position;

export interface GetRootPropsConfig<GRefKey extends string = 'ref'> extends RefParams<GRefKey>, PlainObject {
  editorStyles?: Interpolation<RemirrorProps>;
}

export type RefKeyRootProps<GRefKey extends string = 'ref'> = {
  [P in Exclude<GRefKey, 'children' | 'key'>]: React.Ref<any>
} & { css: Interpolation; key: string } & PlainObject;

export type GetPositionerReturn<GRefKey extends string = 'ref'> = PositionerProps &
  { [P in GRefKey]: React.Ref<any> };

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

  /**
   * Attach these props to a component to inject it with position data. Typically this is used
   * for creating menu components.
   *
   * A custom positioner can be passed in to update the method used to calculate the position.
   */
  getPositionerProps<GRefKey extends string = 'ref'>(
    options: GetPositionerPropsConfig<GRefKey>,
  ): GetPositionerReturn<GRefKey>;

  /**
   * The previous and next state
   */
  state: CompareStateParams;
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
   * Pass in the extension manager.
   *
   */
  manager: ExtensionManager;

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

  /**
   * Let's the editor know that custom root props will be manually applied. This allows for the
   * Providers which depend on this element to specify that the nested components will be responsible
   * for calling `getRootProps()` on the root element.
   *
   * @default false
   */
  customRootProp: boolean;
}

export interface PlaceholderConfig {
  text: string;
  className: string;
  style: ObjectInterpolation<undefined>;
}

export type PositionerMapValue = ElementParams & {
  prev: PositionerProps;
};

export interface PositionerRefFactoryParams extends PositionerIdParams, PositionParams {}

export interface GetPositionParams extends EditorViewParams, ElementParams {}
export interface PositionerIdParams {
  /**
   * A unique id for the positioner.
   *
   * This is used to map the ref of the tracked component to a unique id and cant be updated without losing track of the
   * component's reference element.
   */
  positionerId: string;
}

export interface IsActiveParams {
  /**
   * A boolean value determining whether the positioner should be active.
   */
  isActive: boolean;
}

export interface PositionerParams {
  /**
   * The positioner object which determines how the changes in the view impact the calculated position.
   */
  positioner: Partial<Positioner>;
}

export interface UsePositionerParams<GRefKey extends string = 'ref'>
  extends PositionerIdParams,
    PositionerParams,
    RefParams<GRefKey> {}

/**
 * Used to mark a remirror specific component to determine it's behaviour.
 */
export enum RemirrorElementType {
  Extension = 'extension',
  SSR = 'ssr',
  EditorProvider = 'editor-provider',
  ManagedEditorProvider = 'managed-editor-provider',
  Editor = 'editor',
  Manager = 'manager',
  ManagerProvider = 'manager-provider',
}

export type RemirrorNodeExtensionProps<
  GOptions extends NodeExtensionOptions = NodeExtensionOptions,
  GExtension extends NodeExtension<GOptions> = NodeExtension<GOptions>,
  GConstructor extends ExtensionConstructor<GOptions, GExtension> = ExtensionConstructor<GOptions, GExtension>
> = GOptions & BaseExtensionProps & NodeExtensionConstructorProps<GOptions, GExtension, GConstructor>;

export interface NodeExtensionConstructorProps<
  GOptions extends NodeExtensionOptions = NodeExtensionOptions,
  GExtension extends NodeExtension<GOptions> = NodeExtension<GOptions>,
  GConstructor extends NodeExtensionConstructor<GOptions, GExtension> = NodeExtensionConstructor<
    GOptions,
    GExtension
  >
> {
  /**
   * The constructor for the remirror extension.
   * Will be instantiated with the options passed through as props.
   */
  Constructor: GConstructor;
}

export type RemirrorExtensionProps<
  GOptions extends {},
  GExtension extends Extension<GOptions, any> = Extension<GOptions, any>,
  GConstructor = ExtensionConstructor<GOptions, GExtension>
> = GOptions & BaseExtensionProps & ExtensionConstructorProps<GOptions, GExtension, GConstructor>;

export interface ExtensionConstructorProps<
  GOptions extends {},
  GExtension extends Extension<GOptions, any> = Extension<GOptions, any>,
  GConstructor = ExtensionConstructor<GOptions, GExtension>
> {
  /**
   * The constructor for the remirror extension.
   * Will be instantiated with the options passed through as props.
   */
  Constructor: GConstructor;
}

export interface BaseExtensionProps {
  /**
   * Sets the priority for the extension. Lower number means the extension is loaded first and gives it priority.
   * `-1` is loaded before `0` and will overwrite any conflicting configuration.
   *
   * Base extensions are loaded with a priority of 1.
   *
   * @default 2
   */
  priority?: number;
  children?: never;
}

export interface RegisterExtensionParams<GOptions extends {}> {
  /** The extension identifier */
  id: symbol;
  /** The instance of the extension with the options applied */
  extension: Extension<GOptions, any>;
  /**
   * The priority index for the extension
   * @default 2
   */
  priority: number;
}

/**
 * An extension component registration function which returns a function for un-registering the component
 */
export type RegisterExtension<GOptions extends {}> = (
  params: RegisterExtensionParams<GOptions>,
) => () => void;

export interface RemirrorComponentStaticProperties {
  /**
   * Identifies this as a remirror specific component
   */
  $$remirrorType: RemirrorElementType;
}

export type RemirrorComponentType<P extends {}> = ComponentType<P> & RemirrorComponentStaticProperties;
export type RemirrorFC<P extends {}> = FC<P> & RemirrorComponentStaticProperties;
export type RemirrorComponentClass<P extends {}> = ComponentClass<P> & RemirrorComponentStaticProperties;

export interface RemirrorManagerProps {
  /**
   * Whether to use base extensions
   */
  useBaseExtensions?: boolean;
}
