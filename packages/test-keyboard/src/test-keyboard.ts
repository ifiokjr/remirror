import { includes, take } from '@remirror/core-helpers';

import {
  KeyboardConstructorParams,
  KeyboardEventName,
  ModifierInformation,
  OptionsParams,
  OptionsWithTypingParams,
  TextInputParams,
  TypingInputParams,
} from './test-keyboard-types';
import { cleanKey, createKeyboardEvent, getModifierInformation } from './test-keyboard-utils';
import {
  isUSKeyboardCharacter,
  noKeyPress,
  noKeyUp,
  SupportedCharacters,
  usKeyboardLayout,
} from './us-keyboard-layout';

export interface BatchedKeyboardAction {
  /**
   * When called will dispatched the stored event.
   */
  dispatch: () => void;

  /**
   * The event that will be dispatched.
   */
  event: KeyboardEvent;

  /**
   * The type of the event.
   */
  type: KeyboardEventName;
}

/**
 * The callback function signature for the `eachEvent` which is available when `batch` is true.
 */
export type BatchedCallback = (
  action: BatchedKeyboardAction,
  index: number,
  actions: BatchedKeyboardAction[],
) => void;

export class Keyboard {
  public static create(params: KeyboardConstructorParams) {
    return new Keyboard(params);
  }

  static get defaultOptions(): KeyboardEventInit {
    return {
      bubbles: true,
      cancelable: true,
      composed: true,
    };
  }

  public status: 'started' | 'ended' | 'idle' = 'idle';

  private readonly target: HTMLElement;
  private readonly defaultOptions: KeyboardEventInit;
  private readonly isMac: boolean;
  private readonly batch: boolean;
  private readonly onEventDispatch?: (event: KeyboardEvent) => void;
  private actions: BatchedKeyboardAction[] = [];

  private get started() {
    return this.status === 'started';
  }

  constructor({
    target,
    defaultOptions = Keyboard.defaultOptions,
    isMac = false,
    batch = false,
    onEventDispatch,
  }: KeyboardConstructorParams) {
    this.target = target as HTMLElement;
    this.defaultOptions = defaultOptions;
    this.isMac = isMac;
    this.batch = batch;
    this.onEventDispatch = onEventDispatch;
  }

  /**
   * Starts the fake timers and sets the keyboard status to 'started'
   */
  public start() {
    if (this.started) {
      return this;
    }

    this.status = 'started';

    return this;
  }

  /**
   * Ends the fake timers and sets the keyboard status to 'ended'
   */
  public end() {
    if (!this.started) {
      return this;
    }

    if (this.batch) {
      this.runBatchedEvents();
      this.actions = [];
    }

    this.status = 'ended';

    return this;
  }

  /**
   * When batched is true the user can run through each event and fire as they please.
   */
  public forEach(fn: BatchedCallback) {
    if (!this.started) {
      return this;
    }

    if (!this.batch) {
      throw new Error(`'forEach' is only available when 'batched' is set to 'true'.`);
    }

    this.actions.forEach(fn);
    this.actions = [];
    this.status = 'ended';
    return this;
  }

  /**
   * Runs all the batched events.
   */
  private runBatchedEvents() {
    this.actions.forEach(action => {
      action.dispatch();
    });
  }

  /**
   * Like `this.char` but only supports US Keyboard Characters. This is mainly
   * a utility for TypeScript and autocomplete support when typing characters.
   *
   * @param params - see {@link TextInputParams}
   */
  public usChar({
    text,
    options = Object.create(null),
    typing = false,
  }: TextInputParams<SupportedCharacters>) {
    if (!isUSKeyboardCharacter(text)) {
      throw new Error(
        'This is not a supported character. For generic characters use the `keyboard.char` method instead',
      );
    }
    return this.char({ text, options, typing });
  }

  /**
   * Dispatches an event for a keyboard character
   *
   * @param params - see {@link TextInputParams}
   */
  public char({ text, options, typing }: TextInputParams) {
    options = {
      ...options,
      ...(isUSKeyboardCharacter(text) ? cleanKey(text) : { key: text }),
    };

    this.fireAllEvents({ options, typing });

    return this;
  }

  /**
   * Triggers a keydown event with provided options
   *
   * @param params - see {@link OptionsParams}
   */
  public keyDown = ({ options }: OptionsParams) => {
    return this.dispatchEvent('keydown', options);
  };

  /**
   * Trigger a keypress event with the provided options
   *
   * @param params - see {@link OptionsParams}
   */
  public keyPress = ({ options }: OptionsParams) => {
    return this.dispatchEvent('keypress', options);
  };

  /**
   * Trigger a keyup event with the provided options
   *
   * @param params - see {@link OptionsParams}
   */
  public keyUp = ({ options }: OptionsParams) => {
    return this.dispatchEvent('keyup', options);
  };

  /**
   * Breaks a string into single characters and fires a keyboard into the target node
   *
   * @param params - see {@link TypingInputParams}
   */
  public type({ text, options = Object.create(null) }: TypingInputParams) {
    for (const char of text) {
      this.char({ text: char, options, typing: true });
    }

    return this;
  }

  /**
   * Enables typing modifier commands
   *
   * ```ts
   * const editor = document.getElementById('editor');
   * const keyboard = new Keyboard({ target: editor });
   * keyboard
   *   .mod({text: 'Shift-Meta-A'})
   *   .end();
   * ```
   *
   * @param params - see {@link TextInputParams}
   */
  public mod({ text, options = Object.create(null) }: TextInputParams) {
    let modifiers = text.split(/-(?!$)/);
    let result = modifiers[modifiers.length - 1];
    modifiers = take(modifiers, modifiers.length - 1);

    if (result === 'Space') {
      result = ' ';
    }

    const info = getModifierInformation({ modifiers, isMac: this.isMac });

    this.fireModifierEvents(info, 'keydown');
    this.type({ text: result, options: { ...options, ...info } });
    this.fireModifierEvents(info, 'keyup');

    return this;
  }

  /**
   * Fires events where valid.
   *
   * @param options - see {@link OptionsWithTypingParams}
   */
  private fireAllEvents({ options, typing = false }: OptionsWithTypingParams) {
    this.keyDown({ options });
    if (
      !includes(noKeyPress, options.key) ||
      (typing && isUSKeyboardCharacter(options.key) && usKeyboardLayout[options.key].text)
    ) {
      this.keyPress({ options });
    }
    if (!includes(noKeyUp, options.key)) {
      this.keyUp({ options });
    }

    return this;
  }

  /**
   * Fires all modifier events
   *
   * @param info - the modifier information for the keys see {@link ModifierInformation}
   * @param type - the keyboard event type
   *
   */
  private fireModifierEvents(
    { altKey, ctrlKey, metaKey, shiftKey }: ModifierInformation,
    type: 'keydown' | 'keyup',
  ) {
    const event = type === 'keydown' ? this.keyDown : this.keyUp;
    if (shiftKey) {
      event({ options: { ...this.defaultOptions, ...cleanKey('Shift') } });
    }

    if (metaKey) {
      if (this.isMac) {
        event({ options: { ...this.defaultOptions, ...cleanKey('Meta') } });
      } else {
        event({ options: { ...this.defaultOptions, ...cleanKey('Control') } });
      }
    }

    if (ctrlKey) {
      event({ options: { ...this.defaultOptions, ...cleanKey('Control') } });
    }

    if (altKey) {
      event({ options: { ...this.defaultOptions, ...cleanKey('Alt') } });
    }
  }

  /**
   * Dispatches the action or adds it to the queue when batching is enabled.
   *
   * @param type - the keyboard event name
   * @param options - options passed to the keyboard event. See {@link KeyboardEventInit}
   */
  private dispatchEvent(type: KeyboardEventName, options: KeyboardEventInit) {
    if (!this.started) {
      this.start();
    }
    const event = createKeyboardEvent(type, { ...this.defaultOptions, ...options });

    const dispatch = () => {
      this.target.dispatchEvent(event);

      if (this.onEventDispatch) {
        this.onEventDispatch(event);
      }
    };

    if (this.batch) {
      this.actions.push({ dispatch, event, type });
    } else {
      dispatch();
    }

    return this;
  }
}
