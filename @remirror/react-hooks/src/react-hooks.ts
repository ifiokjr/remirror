import { isFunction } from '@remirror/core-helpers';
import {
  EffectCallback,
  SetStateAction,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import ResizeObserver from 'resize-observer-polyfill';

/**
 * Preserves the previous version of a provided value.
 *
 * ```tsx
 * const [isOpen, setOpen] = useState<boolean>(false)
 * const previous = usePrevious(isOpen)
 *
 * return <span onClick={() => setOpen(!isOpen)}>{isOpen && previous === isOpen ? 'Stable' : 'Unstable' }</span>
 * ```
 */
export const usePrevious = <GValue>(value: GValue) => {
  const ref = useRef<GValue>();
  useEffect(() => void (ref.current = value), [value]);
  return ref.current;
};

export interface DOMRectReadOnlyLike {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly left: number;
}

const defaultBounds = { x: 0, y: 0, width: 0, height: 0, top: 0, right: 0, bottom: 0, left: 0 };

/**
 * Provides the measurements for a react element at the point of layout.
 *
 * @remarks
 *
 * Taken from https://codesandbox.io/embed/lp80n9z7v9
 *
 * ```tsx
 * const [bindRef, { height }] = useMeasure()
 *
 * return <div {...bindRef}>Height: {height}</div>
 * ```
 */
export const useMeasure = <GRef extends HTMLElement = any>() => {
  const ref = useRef<GRef>(null);
  const [bounds, setBounds] = useState<DOMRectReadOnlyLike>(defaultBounds);

  useLayoutEffect(() => {
    const resizeObserver = new ResizeObserver(([entry]) => setBounds(entry.contentRect));

    if (ref.current) {
      resizeObserver.observe(ref.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  return [{ ref }, bounds] as const;
};

export type DispatchWithCallback<GValue> = (value: GValue, callback?: () => void) => void;

interface UseStateWithCallback {
  <GType = undefined>(): readonly [
    GType | undefined,
    DispatchWithCallback<SetStateAction<GType | undefined>>,
  ];
  <GType>(value: GType): readonly [GType, DispatchWithCallback<SetStateAction<GType>>];
}

/**
 * Enables the use of state with an optional callback parameter in the setState
 * value.
 *
 * @remarks
 *
 * The callback is called once when the state next updates.
 */
export const useStateWithCallback: UseStateWithCallback = <GState>(
  initialState?: GState | (() => GState),
) => {
  const [[state, callback], setState] = useState<[GState | undefined, (() => void) | undefined]>([
    isFunction(initialState) ? initialState() : initialState,
    undefined,
  ]);

  useEffect(() => {
    if (callback) {
      callback();
      setState([state, undefined]);
    }
  }, [callback, state]);

  const setStateWithCallback = useCallback(
    (value: SetStateAction<GState | undefined>, cb?: () => void) => {
      setState(prevState => [isFunction(value) ? value(prevState[0]) : value, cb]);
    },
    [setState],
  );

  return [state, setStateWithCallback] as const;
};

export type PartialSetStateAction<GState> = Partial<GState> | ((prevState: GState) => Partial<GState>);

/**
 * A replication of the setState from class Components.
 *
 * @remarks
 *
 * It also åaccepts partial updates to the state object and a callback which
 * runs when the state has updated.
 *
 * It also returns a 3rd argument which resets the state to the original
 * initialState.
 *
 * ```ts
 * const [state, setState, resetState] = useSetState({a: 'initial', b: 'initial'});
 *
 * setState({a: 'A'});
 * log(state); // => { a: 'A', b: 'initial' }
 *
 * setState(prevState => ({b: 'B'}));
 * log(state); // => { a: 'A', b: 'B' }
 *
 * resetState();
 * log(state); // => { a: 'initial', b: 'initial' }
 * ```
 */
export const useSetState = <GState extends object>(
  initialState: GState | (() => GState) = Object.create(null),
): readonly [
  GState,
  DispatchWithCallback<PartialSetStateAction<GState>>,
  (callback?: () => void) => void,
] => {
  const [state, setStateWithCallback] = useStateWithCallback<GState>(
    isFunction(initialState) ? initialState() : initialState,
  );

  const resetState = useCallback(
    (cb?: () => void) => {
      setStateWithCallback(initialState, cb);
    },
    [initialState, setStateWithCallback],
  );

  const setState = useCallback(
    (patch: PartialSetStateAction<GState>, cb?: () => void) => {
      setStateWithCallback(
        (prevState: GState) => ({ ...prevState, ...(isFunction(patch) ? patch(prevState) : patch) }),
        cb,
      );
    },
    [setStateWithCallback],
  );

  return [state, setState, resetState] as const;
};

/**
 * React effect hook that ignores the first invocation (e.g. on mount).
 *
 * @remarks
 *
 * The signature is exactly the same as the useEffect hook.
 *
 * ```tsx
 * import React from 'react'
 * import { useEffectOnUpdate } from 'react-use';
 *
 * const Demo = () => {
 *   const [count, setCount] = React.useState(0);
 *
 *   React.useEffect(() => {
 *     const interval = setInterval(() => {
 *       setCount(count => count + 1)
 *     }, 1000)
 *
 *     return () => {
 *       clearInterval(interval)
 *     }
 *   }, [])
 *
 *   useEffectOnUpdate(() => {
 *     log('count', count) // will only show 1 and beyond
 *
 *     return () => { // *OPTIONAL*
 *       // do something on unmount
 *     }
 *   }) // you can include deps array if necessary
 *
 *   return <div>Count: {count}</div>
 * };
 * ```
 */
export const useEffectOnUpdate: typeof useEffect = effect => {
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      return effect();
    }
  }, [effect]);
};

/**
 * React lifecycle hook that runs an effect only once.
 *
 * @remarks
 *
 * ```ts
 * import {useEffectOnce} from 'react-use';
 *
 * const Demo = () => {
 *   useEffectOnce(() => {
 *     log('Running effect once on mount')
 *
 *     return () => {
 *       log('Running clean-up of effect on unmount')
 *     }
 *   });
 *
 *   return null;
 * };
 * ```
 */
export const useEffectOnce = (effect: EffectCallback) => {
  useEffect(effect, []);
};

/**
 * React lifecycle hook that calls a function when the component will unmount.
 *
 * @remaarks
 *
 * Try `useEffectOnce` if you need both a mount and unmount function.
 *
 * ```jsx
 * import {useUnmount} from 'react-use';
 *
 * const Demo = () => {
 *   useUnmount(() => log('UNMOUNTED'));
 *   return null;
 * };
 * ```
 */
export const useUnmount = (fn: () => void | undefined) => {
  useEffectOnce(() => fn);
};

/**
 * A hook for managing multiple timeouts.
 *
 * @remarks
 *
 * All timeouts are automatically cleared when unmounting.
 */
export const useTimeouts = () => {
  const timeoutIds = useRef<any[]>([]);

  const setHookTimeout = (fn: () => void, time = 1) => {
    const id = setTimeout(() => {
      timeoutIds.current = timeoutIds.current.filter(timeoutId => timeoutId !== id);
      fn();
    }, time);

    timeoutIds.current.push(id);
  };

  const clearHookTimeouts = () => {
    timeoutIds.current.forEach(id => {
      clearTimeout(id);
    });

    timeoutIds.current = [];
  };

  // Clear the timeouts on dismount
  useEffectOnce(() => clearHookTimeouts);

  return [setHookTimeout, clearHookTimeouts] as const;
};
