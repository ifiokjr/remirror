import { Cast, OffsetCalculator, PlainObject, Position, Predicate, ShouldRenderMenu } from '@remirror/core';
import is from '@sindresorhus/is';
import { Children, isValidElement, ReactNode } from 'react';
import { AttributePropFunction, RenderPropFunction } from './types';

export const isAttributeFunction = Cast<Predicate<AttributePropFunction>>(is.function_);

export const isRenderProp = Cast<Predicate<RenderPropFunction>>(is.function_);

export const isDOMElement = (element: ReactNode) => {
  return isValidElement(element) && is.string(element.type);
};

export const getElementProps = (element: JSX.Element): PlainObject & { children: JSX.Element } => {
  return element ? element.props : {};
};

export const baseOffsetCalculator: Required<OffsetCalculator> = {
  top: () => 0,
  left: () => 0,
  right: () => 0,
  bottom: () => 0,
};

export const simpleOffsetCalculator: OffsetCalculator = {
  left: props => props.left,
  top: props => props.top,
  right: props => props.right,
  bottom: props => props.bottom,
};

export const defaultShouldRender: ShouldRenderMenu = props => props.selection && !props.selection.empty;

export const defaultOffscreenPosition: Position = { left: -1000, top: 0, bottom: 0, right: 0 };

export const uniqueClass = (uid: string, className: string) => `${className}-${uid}`;

/**
 * Utility for properly typechecking static defaultProps for a class component in react.
 */
export const asDefaultProps = <GProps extends {}>() => <GDefaultProps extends Partial<GProps>>(
  defaultProps: GDefaultProps,
): GDefaultProps => defaultProps;

/**
 * Finds a deeply nested child by the key provided.
 *
 * @params children
 * @params key
 */
export const findChildWithKey = (children: ReactNode, key: string): ReactNode => {
  for (const child of Children.toArray(children)) {
    if (!isValidElement(child)) {
      continue;
    }

    if (child.key === key) {
      return child;
    }
    const subChildren = child.props && Cast(child.props).children;

    if (subChildren) {
      return findChildWithKey(subChildren, key);
    }
  }
  return null;
};

/**
 * Searches the react tree for a child node with the requested key and updates
 * it using the updater function once found
 *
 * @params children
 * @params key
 * @params updateFunction
 */
export const updateChildWithKey = (
  children: ReactNode,
  key: string,
  updateFunction: (child: JSX.Element) => JSX.Element,
): ReactNode[] => {
  let keyFound = false;
  return Children.map(children, child => {
    if (keyFound) {
      return child;
    }

    if (!isValidElement(child)) {
      return child;
    }

    if (child.key === key) {
      keyFound = true;
      return updateFunction(child);
    }

    const subChildren = child.props && Cast(child.props).children;
    if (subChildren) {
      return updateChildWithKey(subChildren, key, updateFunction);
    }

    return child;
  });
};
