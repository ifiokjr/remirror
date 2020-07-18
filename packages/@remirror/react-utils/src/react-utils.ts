import React, {
  Children,
  ComponentClass,
  ComponentType,
  FC,
  Fragment,
  isValidElement as isValidReactElement,
  ReactElement,
  ReactNode,
} from 'react';

import { ErrorConstant } from '@remirror/core-constants';
import { bool, invariant, isFunction, isObject, isString } from '@remirror/core-helpers';
import { AnyFunction, UnknownShape } from '@remirror/core-types';

export interface RemirrorComponentStaticProperties {
  /**
   * Identifies this as a remirror specific component
   */
  $$remirrorType: RemirrorType;
}

export type RemirrorFC<Props extends object = object> = FC<Props> &
  RemirrorComponentStaticProperties;
export type RemirrorComponentClass<Props extends object = object> = ComponentClass<Props> &
  RemirrorComponentStaticProperties;

export type RemirrorComponentType<Props extends object = object> = ComponentType<Props> &
  RemirrorComponentStaticProperties;
export type RemirrorElement<Options extends object = any> = ReactElement & {
  type: RemirrorComponentType<Options>;
};

/**
 * These are the constants used to determine whether an element is a remirror constant.
 */
export enum RemirrorType {
  SSR = 'ssr',
  Editor = 'editor',

  /**
   * The `RemirrorProvider` component.
   */
  Provider = 'provider',

  /**
   * Used to identify the ContextProviderWrapper
   */
  ContextProvider = 'context-provider',

  /**
   * Marks the provider for i18n.
   */
  I18nProvider = 'i18n-provider',

  /**
   * Marks this as a provider for the remirror theme.
   */
  ThemeProvider = 'theme-provider',
}

/**
 * A drop in replacement for built in React.isValidElement which accepts a test value of any type
 *
 * @param value - the value to check
 */
export function isValidElement<Props extends object = any>(
  value: unknown,
): value is ReactElement<Props> {
  return isObject(value) && isValidReactElement(value);
}

/**
 * Check whether a react node is a built in dom element (i.e. `div`, `span`)
 *
 * @param value - the value to check
 */
export function isReactDOMElement<Props extends object = any>(
  value: unknown,
): value is ReactElement<Props> & { type: string } {
  return isValidElement(value) && isString(value.type);
}

/**
 * Checks whether the element is a react fragment
 *
 * @param value - the value to check
 */
export function isReactFragment<Props extends object = any>(
  value: unknown,
): value is ReactElement<Props> & { type: typeof Fragment } {
  return isObject(value) && isValidElement(value) && value.type === Fragment;
}

/**
 * Retrieve the element props for JSX Element
 *
 * @param element
 */
export function getElementProps<Type = UnknownShape>(
  element: JSX.Element,
): UnknownShape & Type & { children: JSX.Element } {
  return isValidElement(element) ? element.props : {};
}

/**
 * Utility for properly typechecking static defaultProps for a class component in react.
 *
 * ```ts
 * static defaultProps = asDefaultProps<RemirrorProps>()({
 *   initialContent: EMPTY_PARAGRAPH_NODE,
 * });
 * ```
 */
export const asDefaultProps = <Props extends object>() => <DefaultProps extends Partial<Props>>(
  props: DefaultProps,
): DefaultProps => props;

/**
 * Checks if this element has a type of any RemirrorComponent
 *
 * @param value - the value to check
 */
export const isRemirrorElement = <Options extends object = any>(
  value: unknown,
): value is RemirrorElement<Options> => {
  return bool(
    isObject(value) &&
      isValidElement(value) &&
      (value.type as RemirrorComponentType<Options>).$$remirrorType,
  );
};

const isRemirrorElementOfType = (type: RemirrorType) => <Options extends object = any>(
  value: unknown,
): value is RemirrorElement<Options> =>
  isRemirrorElement(value) && value.type.$$remirrorType === type;

/**
 * Checks to see if this is the wrapper we've created around the RemirrorContent.Provider component.
 *
 * This is used to help determine how the Remirror component will be rendered. `getRootProps` is the main reason
 * for this, and I'm not even sure the effort is worth it.
 *
 * @param value - the value to check
 */
export const isRemirrorContextProvider = isRemirrorElementOfType(RemirrorType.ContextProvider);

/**
 * Finds if this is a RemirrorProvider (which provides the RemirrorInjectedProps into the context);
 *
 * @param value - the value to check
 */
export const isRemirrorProvider = isRemirrorElementOfType(RemirrorType.Provider);

/**
 * Will throw an error if the child provided is not a function.
 *
 * @remarks
 * This is currently used in the remirror component to throw an error when the element children
 * are not a render prop. It should be called outside of render for class Components.
 *
 * @param prop - the prop to test
 */
export const propIsFunction = (value: unknown): value is AnyFunction => {
  invariant(isFunction(value), {
    code: ErrorConstant.INTERNAL,
    message: 'The child argument to the Remirror component must be a function.',
  });

  return true;
};

/**
 * A drop in replacement for React.Children.only which provides more readable errors
 * when the child is not a react element or undefined.
 */
export const oneChildOnly = <Props extends object = any>(value: unknown): ReactElement<Props> => {
  if (!value) {
    throw new Error('This component requires ONE child component - Nothing was provided');
  }

  if (!isValidElement(value)) {
    throw new Error(
      'This component requires ONE child component - An invalid element was provided',
    );
  }

  return Children.only(value);
};

/**
 * Add the specified key to an element when it is a valid react element.
 *
 * This is useful when returning an array of components because a fragment isn't sufficient.
 */
export const addKeyToElement = (element: ReactNode, key: string | number) => {
  if (!isValidElement(element)) {
    return element;
  }

  return React.cloneElement(element, { ...element.props, key });
};
