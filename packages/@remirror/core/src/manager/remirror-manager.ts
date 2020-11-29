import { createNanoEvents, Unsubscribe } from 'nanoevents';

import {
  __INTERNAL_REMIRROR_IDENTIFIER_KEY__,
  ErrorConstant,
  ExtensionPriority,
  ManagerPhase,
  RemirrorIdentifier,
} from '@remirror/core-constants';
import {
  freeze,
  getLazyArray,
  includes,
  invariant,
  isIdentifierOfType,
  isNullOrUndefined,
  isRemirrorType,
  isString,
  object,
} from '@remirror/core-helpers';
import type {
  Dispose,
  EditorSchema,
  EditorView,
  MarkExtensionSpec,
  NodeExtensionSpec,
  ProsemirrorNode,
  Replace,
  Transaction,
} from '@remirror/core-types';
import type { InvalidContentHandler, StringHandlerParameter } from '@remirror/core-utils';
import {
  createDocumentNode,
  CreateDocumentNodeParameter,
  getTextSelection,
} from '@remirror/core-utils';
import { EditorState } from '@remirror/pm/state';

import { BuiltinPreset, CombinedTags } from '../builtins';
import type {
  AnyExtension,
  AnyExtensionConstructor,
  AnyManagerStore,
  GetMarkNameUnion,
  GetNodeNameUnion,
  ManagerStoreKeys,
  SchemaFromExtensionUnion,
} from '../extension';
import type { BaseFramework, FrameworkOutput } from '../framework';
import type {
  AnyCombinedUnion,
  AnyPreset,
  AnyPresetConstructor,
  InferCombinedExtensions,
  InferCombinedPresets,
  SchemaFromCombined,
} from '../preset';
import { privacySymbol } from '../privacy';
import type {
  GetConstructor,
  GetExtensions,
  GetNameUnion,
  StateUpdateLifecycleParameter,
} from '../types';
import { extractLifecycleMethods, transformCombinedUnion } from './remirror-manager-helpers';

/**
 * The `Manager` has multiple hook phases which are able to hook into the
 * extension manager flow and add new functionality to the editor.
 *
 * The `ExtensionEventMethod`s
 *
 * - onCreate - when the extension manager is created and after the schema is
 *   made available.
 * - onView - when the view has been received from the dom ref.
 */

/**
 * A class to manage the extensions and prosemirror interactions within the
 * editor.
 *
 * @remarks
 *
 * The RemirrorManager enables the lifecycle methods of the extensions by
 * calling each method in the distinct phases of the lifecycle.
 *
 * - `onCreate` - This happens when the manager is constructed. It calls on the
 *   extension which have an `onCreate` method and allows them to do their work.
 *
 * For the built in methods, this is when the `SchemaExtension` creates the
 * Schema and when the `TagsExtension` combines the tags for the editor
 * instance.
 *
 * ```ts
 * const manager = Manager.create([
 *   new DocExtension(),
 *   new TextExtension(),
 *   new ParagraphExtension(),
 * ])
 * ```
 *
 * At this point all the `onCreate` methods have been called. Including the
 * `onCreate` for the `Schema`.
 *
 * - `onView` - This is called the framework instance connects the
 *   `RemirrorManager` to the ProseMirror EditorView.
 *
 * ```ts
 * manager.addView(new EditorView(...))
 * manager.store.commands.insertText('Hello world');.
 * ```
 *
 * - `onStateUpdate` - This is the method called every time the ProseMirror
 *   state changes. Both the extensions and the `Framework` listen to this event
 *   and can provide updates in response.
 */
export class RemirrorManager<Combined extends AnyCombinedUnion> {
  /**
   * The main static method for creating a manager.
   */
  static create<Combined extends AnyCombinedUnion>(
    combined: Combined[] | (() => Combined[]),
    settings: Remirror.ManagerSettings = {},
  ): RemirrorManager<Combined | BuiltinPreset> {
    return new RemirrorManager<Combined | BuiltinPreset>(
      [...getLazyArray(combined), new BuiltinPreset(settings.builtin)],
      {
        ...settings,
        privacy: privacySymbol,
      },
    );
  }

  /**
   * A static method to create the editor manager from an object.
   */
  static fromObject<ExtensionUnion extends AnyExtension, PresetUnion extends AnyPreset>({
    extensions,
    presets,
    settings = {},
  }: RemirrorManagerParameter<ExtensionUnion, PresetUnion>): RemirrorManager<
    ExtensionUnion | PresetUnion | BuiltinPreset
  > {
    return RemirrorManager.create<ExtensionUnion | PresetUnion>(
      [...extensions, ...presets],
      settings,
    );
  }

  /**
   * Utility getter for storing the base method parameter which is available to
   * all extensions.
   */
  #extensionStore: Remirror.ExtensionStore;

  #extensions: ReadonlyArray<this['~E']>;
  #extensionMap: WeakMap<AnyExtensionConstructor, this['~E']>;

  #presets: ReadonlyArray<this['~P']>;
  #presetMap: WeakMap<GetConstructor<this['~P']>, this['~P']>;

  /**
   * The extension manager store.
   */
  #store: Remirror.ManagerStore<Combined> = object();

  /**
   * The stage the manager is currently running.
   */
  #phase: ManagerPhase = ManagerPhase.None;

  /**
   * The settings used to create the manager.
   */
  #settings: Remirror.ManagerSettings;

  /**
   * The original combined array passed into the editor..
   */
  #combined: readonly Combined[];

  /**
   * When true this identifies this as the first state update since the view was
   * added to the editor.
   */
  #firstStateUpdate = true;

  /**
   * Store the handlers that will be run when for each event method.
   */
  #handlers: {
    create: Array<() => Dispose | void>;
    view: Array<(view: EditorView) => Dispose | void>;
    update: Array<(param: StateUpdateLifecycleParameter) => void>;
    destroy: Array<() => void>;
    disposers: Array<() => void>;
  } = {
    create: [],
    view: [],
    update: [],
    destroy: [],
    disposers: [],
  };

  /**
   * The event listener which allows consumers to subscribe to the different
   * events without using props.
   */
  #events = createNanoEvents<ManagerEvents>();

  /**
   * The active framework for this manager if it exists.
   */
  #framework?: BaseFramework<Combined>;

  /**
   * A method for disposing the state update event listeners on the active
   * framework.
   */
  #disposeFramework?: Dispose;

  /**
   * Identifies this as a `Manager`.
   *
   * @internal
   */
  get [__INTERNAL_REMIRROR_IDENTIFIER_KEY__](): RemirrorIdentifier.Manager {
    return RemirrorIdentifier.Manager;
  }

  /**
   * Returns `true` if the manager has been destroyed.
   */
  get destroyed(): boolean {
    return this.#phase === ManagerPhase.Destroy;
  }

  /**
   * `true` when the view has been added to the UI layer and the editor is
   * running.
   */
  get mounted(): boolean {
    return this.#phase >= ManagerPhase.EditorView && this.#phase < ManagerPhase.Destroy;
  }

  /**
   * Retrieve the framework output.
   *
   * This will throw an error if used before a framework has been attached to
   * the manager.
   *
   * With synchronous frameworks this means that it should only be used after
   * the manager has been applied to the editor creation function.
   *
   * For frameworks like react, the following example will throw an error since
   * the framework hasn't been attached yet by `RemirrorProvider`
   *
   * ```tsx
   * import React from 'react';
   * import { useManager } from 'remirror/react';
   *
   * const Editor = () => {
   *   const manager = useManager(() => [], {});
   *   log(manager.output); // ❌ Throws error
   *
   *   const callback = () => {
   *     return manager.output; // ✅ This is fine.
   *   }
   *
   *   return <RemirrorProvider manager={manager} />
   * }
   * ```
   *
   * A safe way to use this is to check if the framework is attached first.
   *
   * const Editor = () => {
   *   const manager = useManager(() => [], {});
   *
   *   if (manager.frameworkAttached) {
   *     log(manager.output); // ✅ This is fine.
   *   }
   *
   *   return <RemirrorProvider manager={manager} />
   * }
   * ```
   */
  get output(): FrameworkOutput<Combined> {
    invariant(this.#framework, {
      code: ErrorConstant.MANAGER_PHASE_ERROR,
      message:
        'Access to the manager context is only possible after the framework has been attached.',
    });

    return this.#framework?.frameworkOutput;
  }

  /**
   * Returns true when a framework is attached to the manager.
   *
   * This can be used to check if it is safe to call `manager.output`.
   */
  get frameworkAttached(): boolean {
    return !!this.#framework;
  }

  /**
   * The extensions stored by this manager
   */
  get extensions(): ReadonlyArray<GetExtensions<this>> {
    return this.#extensions;
  }

  /**
   * The preset stored by this manager
   */
  get presets(): ReadonlyArray<this['~P']> {
    return this.#presets;
  }

  /**
   * Get the original combined presets used to create this manager.
   */
  get combined(): readonly Combined[] {
    return freeze(this.#combined);
  }

  /**
   * Get the extension manager store which is accessible at initialization.
   */
  get store(): Remirror.ManagerStore<Combined> {
    return freeze(this.#store);
  }

  /**
   * Provides access to the extension store.
   */
  get extensionStore(): Remirror.ExtensionStore {
    return freeze(this.#extensionStore);
  }

  /**
   * Shorthand access to the active transaction from the manager. This is the
   * shared transaction available to all commands and should be used when you
   * need to make your commands chainable.
   *
   * If working with react and setting up your editor as a controlled component
   * then this is the preferred way to run custom commands, otherwise your
   * commands will end up being non-chainable and be overwritten by anything
   * that comes after.
   */
  get tr(): Transaction<SchemaFromCombined<Combined>> {
    return this.extensionStore.getTransaction();
  }

  /**
   * Returns the stored nodes
   */
  get nodes(): Record<GetNodeNameUnion<InferCombinedExtensions<Combined>>, NodeExtensionSpec> {
    return this.#store.nodes;
  }

  /**
   * Returns the store marks.
   */
  get marks(): Record<GetMarkNameUnion<InferCombinedExtensions<Combined>>, MarkExtensionSpec> {
    return this.#store.marks;
  }

  /**
   * A shorthand method for retrieving the schema for this extension manager
   * from the data.
   */
  get schema(): SchemaFromExtensionUnion<InferCombinedExtensions<Combined>> {
    return this.#store.schema;
  }

  /**
   * A shorthand getter for retrieving the tags from the extension manager.
   */
  get extensionTags(): Readonly<CombinedTags<GetNameUnion<Combined>>> {
    return this.#store.tags;
  }

  /**
   * A shorthand way of retrieving the editor view.
   */
  get view(): EditorView<SchemaFromCombined<Combined>> {
    return this.#store.view;
  }

  /**
   * Retrieve the settings used when creating the manager.
   */
  get settings(): Remirror.ManagerSettings {
    return this.#settings;
  }

  /**
   * Creates the extension manager which is used to simplify the management of
   * the prosemirror editor.
   *
   * This should not be called directly if you want to use prioritized
   * extensions. Instead use `RemirrorManager.create([])`.
   */
  private constructor(
    combined: readonly Combined[],
    { privacy, ...settings }: SettingsWithPrivacy = {},
  ) {
    this.#settings = settings;
    this.#combined = combined;

    invariant(privacy === privacySymbol, {
      message: `The extension manager can only be invoked via one of it's static methods. e.g 'RemirrorManager.create([...extensions])'.`,
      code: ErrorConstant.NEW_EDITOR_MANAGER,
    });

    const { extensions, extensionMap, presets, presetMap } = transformCombinedUnion<Combined>(
      combined,
      settings,
    );

    this.#extensions = freeze(extensions);
    this.#extensionMap = extensionMap;
    this.#presets = freeze(presets);
    this.#presetMap = presetMap;

    this.#extensionStore = this.createExtensionStore();

    this.setupLifecycleHandlers();

    this.#phase = ManagerPhase.Create;

    for (const handler of this.#handlers.create) {
      const disposer = handler();
      this.#handlers.disposers.push(...(disposer ? [disposer] : []));
    }
  }

  /**
   * Loops through all extensions to set up the lifecycle handlers.
   */
  private setupLifecycleHandlers(): void {
    const store = this.#extensionStore;
    const handlers = this.#handlers;

    // Add the extension store to presets so they are able to handle it
    // properly.
    for (const preset of this.#presets) {
      preset.setExtensionStore(store);
    }

    const nodeNames: string[] = [];
    const markNames: string[] = [];
    const plainNames: string[] = [];

    // The names are stored as readonly arrays - which is the reason for not
    // just saying `store.nodeNames = []`.
    store.nodeNames = nodeNames;
    store.markNames = markNames;
    store.plainNames = plainNames;

    for (const extension of this.#extensions) {
      extractLifecycleMethods({ extension, nodeNames, markNames, plainNames, handlers, store });
    }
  }

  /**
   * Set the store key.
   */
  private readonly setStoreKey = <Key extends ManagerStoreKeys>(
    key: Key,
    value: AnyManagerStore[Key],
  ) => {
    this.#store[key] = value;
  };

  private readonly getStoreKey = <Key extends ManagerStoreKeys>(key: Key): AnyManagerStore[Key] => {
    const value = this.#store[key];

    invariant(!isNullOrUndefined(value), {
      code: ErrorConstant.MANAGER_PHASE_ERROR,
      message: '`getStoreKey` should not be called before the values are available.',
    });

    return value;
  };

  /**
   * A method to set values in the extension store which is made available to
   * extension.
   *
   * **NOTE** This method should only be used in the `onCreate` extension method
   * or it will throw an error.
   */
  private readonly setExtensionStore = <Key extends keyof Remirror.ExtensionStore>(
    key: Key,
    value: Remirror.ExtensionStore[Key],
  ) => {
    invariant(this.#phase <= ManagerPhase.EditorView, {
      code: ErrorConstant.MANAGER_PHASE_ERROR,
      message:
        '`setExtensionStore` should only be called during the `onCreate` lifecycle hook. Make sure to only call it within the returned methods.',
    });

    this.#extensionStore[key] = value;
  };

  /**
   * Create the initial store.
   */
  private createExtensionStore(): Remirror.ExtensionStore {
    const store: Remirror.ExtensionStore = object();
    const enumerable = true;

    // Allow current state to default to `getState` for first access.
    // This fixed an issue with #814
    let currentState: EditorState | undefined;

    Object.defineProperties(store, {
      extensions: { get: () => this.#extensions, enumerable },
      phase: { get: () => this.#phase, enumerable },
      view: { get: () => this.view, enumerable },
      managerSettings: { get: () => freeze(this.#settings), enumerable },
      getState: { value: this.getState, enumerable },
      updateState: { value: this.updateState, enumerable },
      isMounted: { value: () => this.mounted, enumerable },
      getExtension: { value: this.getExtension.bind(this), enumerable },
      getPreset: { value: this.getPreset.bind(this), enumerable },
      currentState: {
        get: () => (currentState ??= this.getState()),
        set: (state: EditorState) => {
          currentState = state;
        },
        enumerable,
      },
    });

    store.getStoreKey = this.getStoreKey;
    store.setStoreKey = this.setStoreKey;
    store.setExtensionStore = this.setExtensionStore;

    return store;
  }

  /**
   * A state getter method which is passed into the params.
   */
  private readonly getState = (): EditorState => {
    if (this.#phase >= ManagerPhase.EditorView) {
      return this.view.state;
    }

    invariant(this.#framework, {
      code: ErrorConstant.MANAGER_PHASE_ERROR,
      message:
        '`getState` can only be called after the `Framework` or the `EditorView` has been added to the manager`. Check your plugins to make sure that the decorations callback uses the state argument.',
    });

    return this.#framework?.initialEditorState;
  };

  /**
   * Stores the editor view on the manager
   *
   * @param view - the editor view
   */
  addView(view: EditorView<this['~Sch']>): this {
    if (this.#phase >= ManagerPhase.EditorView) {
      // Do nothing since a view has already been added.
      return this;
    }
    // invariant(this.#phase < ManagerPhase.EditorView, {code:
    //   ErrorConstant.MANAGER_PHASE_ERROR, message: 'A view has already been
    //   added to this manager. A view should only be added once.',
    // });

    this.#firstStateUpdate = true;

    // Update the lifecycle phase.
    this.#phase = ManagerPhase.EditorView;

    // Store the view.
    this.#store.view = view;

    for (const handler of this.#handlers.view) {
      const disposer = handler(view);
      this.#handlers.disposers.push(...(disposer ? [disposer] : []));
    }

    return this;
  }

  /**
   * Attach a framework to the manager.
   */
  attachFramework(
    framework: BaseFramework<Combined>,
    updateHandler: (parameter: StateUpdateLifecycleParameter) => void,
  ): void {
    if (this.#framework === framework) {
      // Do nothing if the instances are identical.
      return;
    }

    if (this.#framework) {
      // Destroy the old instance.
      this.#framework.destroy();

      // Remove the event listener. This should exist.
      this.#disposeFramework?.();
    }

    // Replace with the new instance.
    this.#framework = framework;
    this.#disposeFramework = this.addHandler('stateUpdate', updateHandler);
  }

  /* Public Methods */

  /**
   * Create an empty document for the editor based on the current schema.
   *
   * This automatically looks at the supported content for the doc and the
   * available nodes which fulfil that content in order to create a document
   * with only the minimal required content.
   *
   * This can be used in conjunction with the create state to reset the current
   * value of the editor.
   */
  createEmptyDoc(): ProsemirrorNode<SchemaFromCombined<Combined>> {
    const doc = this.schema.nodes.doc.createAndFill();

    // Make sure the `doc` was created.
    invariant(doc, {
      code: ErrorConstant.INVALID_CONTENT,
      message: `An empty node could not be created due to an invalid schema.`,
    });

    return doc;
  }

  /**
   * Create the editor state from content passed to this extension manager.
   */
  createState(
    parameter: Omit<CreateDocumentNodeParameter, 'schema' | 'attempts'>,
  ): EditorState<SchemaFromCombined<Combined>> {
    const {
      content,
      document,
      stringHandler = this.settings.stringHandler,
      onError = this.settings.onError,
      selection,
    } = parameter;
    const { schema, plugins } = this.store;
    const doc = createDocumentNode({
      content,
      document,
      schema,
      stringHandler,
      onError,
      selection,
    });

    const state = EditorState.create({ schema, doc, plugins });

    if (!selection) {
      return state;
    }

    const tr = state.tr.setSelection(getTextSelection(selection, state.doc));

    return state.applyTransaction(tr).state;
  }

  /**
   * Add a handler to the manager.
   *
   * Currently the only event that can be listened to is the `destroy` event.
   */
  addHandler<Key extends keyof ManagerEvents>(event: Key, cb: ManagerEvents[Key]): Unsubscribe {
    return this.#events.on(event, cb);
  }

  /**
   * Update the state of the view and trigger the `onStateUpdate` lifecyle
   * method as well.
   */
  private readonly updateState = (state: EditorState<this['~Sch']>) => {
    const previousState = this.getState();

    this.view.updateState(state);
    this.onStateUpdate({ previousState, state });
  };

  /**
   * This method should be called by the view layer every time the state is
   * updated.
   *
   * An example usage of this is within the collaboration extension.
   */
  onStateUpdate(parameter: Omit<StateUpdateLifecycleParameter, 'firstUpdate'>): void {
    const firstUpdate = this.#firstStateUpdate;

    this.#extensionStore.currentState = parameter.state;
    this.#extensionStore.previousState = parameter.previousState;

    if (this.#firstStateUpdate) {
      this.#phase = ManagerPhase.Runtime;
      this.#firstStateUpdate = false;
    }

    const parameterWithUpdate = { ...parameter, firstUpdate };

    for (const handler of this.#handlers.update) {
      handler(parameterWithUpdate);
    }

    this.#events.emit('stateUpdate', parameterWithUpdate);
  }

  /**
   * Get the extension instance matching the provided constructor from the
   * manager.
   *
   * This will throw an error if non existent.
   */
  getExtension<ExtensionConstructor extends AnyExtensionConstructor>(
    Constructor: ExtensionConstructor,
  ): InstanceType<ExtensionConstructor> {
    const extension = this.#extensionMap.get(Constructor);

    // Throws an error if attempting to get an extension which is not present in
    // the manager.
    invariant(extension, {
      code: ErrorConstant.INVALID_MANAGER_EXTENSION,
      message: `'${Constructor.name}' doesn't exist within this manager. Make sure it is properly added before attempting to use it.`,
    });

    return extension as InstanceType<ExtensionConstructor>;
  }

  /**
   * Get the requested preset from the manager. This will throw if the preset
   * doesn't exist within this manager.
   */
  getPreset<PresetConstructor extends AnyPresetConstructor>(
    Constructor: PresetConstructor,
  ): InstanceType<PresetConstructor> {
    const preset = this.#presetMap.get(Constructor);

    // Throws an error if attempting to retrieve a preset which is not present
    // in the manager.
    invariant(preset, {
      code: ErrorConstant.INVALID_MANAGER_PRESET,
      message: `'${Constructor.name}' doesn't exist within this manager. Make sure it is properly added before attempting to use it.`,
    });

    return preset as InstanceType<PresetConstructor>;
  }

  /**
   * Make a clone of the manager.
   *
   * @internalremarks What about the state stored in the extensions and presets,
   * does this need to be recreated as well?
   */
  clone(): RemirrorManager<Combined> {
    const currentCombined = this.#combined.map((e) => e.clone(e.options));
    return RemirrorManager.create(currentCombined, this.#settings);
  }

  /**
   * Recreate the manager.
   */
  recreate<ExtraCombined extends AnyCombinedUnion>(
    combined: ExtraCombined[] = [],
    settings: Remirror.ManagerSettings = {},
  ): RemirrorManager<Combined | ExtraCombined> {
    const currentCombined = this.#combined.map((e) => e.clone(e.initialOptions as any));

    return RemirrorManager.create([...currentCombined, ...combined], settings) as RemirrorManager<
      Combined | ExtraCombined
    >;
  }

  /**
   * This method should be called to destroy the manager and remove the view.
   */
  destroy(): void {
    this.#phase = ManagerPhase.Destroy;

    for (const plugin of this.view?.state.plugins ?? []) {
      plugin.getState(this.view.state)?.destroy?.();
    }

    // Make sure to destroy the framework and it's state update listener if it
    // exists.
    this.#framework?.destroy();
    this.#disposeFramework?.();

    // Run all cleanup methods returned by the `onView` and `onCreate` methods.
    for (const dispose of this.#handlers.disposers) {
      dispose();
    }

    // TODO: prevent `dispatchTransaction` from being called again
    for (const onDestroy of this.#handlers.destroy) {
      onDestroy();
    }

    this.view?.destroy();

    this.#events.emit('destroy');
  }

  /**
   * Check whether the manager includes the names or constructors provided for
   * the preset and extensions.
   *
   * Returns true if all are included, returns false otherwise.
   */
  includes(
    mustIncludeList: Array<AnyExtensionConstructor | AnyPresetConstructor | string>,
  ): boolean {
    // Searches can be made by either the name of the extension / preset or the
    // names of the constructor. We gather the values to check in separate
    // arrays
    const names: string[] = [];
    const extensionsAndPresets: Array<AnyExtensionConstructor | AnyPresetConstructor> = [];

    for (const item of this.combined) {
      names.push(item.name, item.constructorName);
      extensionsAndPresets.push(item.constructor);
    }

    return mustIncludeList.every((item) =>
      isString(item) ? includes(names, item) : includes(extensionsAndPresets, item),
    );
  }
}

export interface ManagerEvents {
  /**
   * Called when the state is updated.
   */
  stateUpdate: (parameter: StateUpdateLifecycleParameter) => void;

  /**
   * An event listener which is called whenever the manager is destroyed.
   */
  destroy: () => void;
}

export type AnyRemirrorManager = Replace<
  RemirrorManager<AnyCombinedUnion>,
  {
    clone: () => AnyRemirrorManager;
    store: Replace<Remirror.ManagerStore<any>, { chain: any }>;
    output: Replace<FrameworkOutput<any>, { chain: any }>;
    ['~E']: AnyExtension;
    ['~P']: AnyPreset;
    ['~Sch']: EditorSchema;
    ['~N']: string;
    ['~M']: string;
    ['~EP']: AnyCombinedUnion;
    view: EditorView;
    addView: (view: EditorView) => void;
    attachFramework: (
      framework: BaseFramework<any>,
      updateHandler: (parameter: StateUpdateLifecycleParameter) => void,
    ) => void;
  }
>;

/**
 * Checks to see whether the provided value is a `RemirrorManager` instance.
 *
 * An optional parameter `mustIncludeList` is available if you want to check
 * that the manager includes all the listed extensions.
 *
 * @param value - the value to check
 * @param mustIncludeList - an array of presets and extension the manager must
 * include to pass the test. The identifier can either be the Extension / Preset
 * name e.g. `bold`, or the Extension / Preset constructor `BoldExtension`
 */
export function isRemirrorManager<Combined extends AnyCombinedUnion = AnyCombinedUnion>(
  value: unknown,
  mustIncludeList?: Array<AnyExtensionConstructor | AnyPresetConstructor | string>,
): value is RemirrorManager<Combined> {
  if (!isRemirrorType(value) || !isIdentifierOfType(value, RemirrorIdentifier.Manager)) {
    return false;
  }

  // We can return true since there are no other checks to make.
  if (!mustIncludeList) {
    return true;
  }

  return (value as AnyRemirrorManager).includes(mustIncludeList);
}

export interface RemirrorManagerParameter<
  ExtensionUnion extends AnyExtension,
  PresetUnion extends AnyPreset
> {
  /**
   * The extensions so use when creating the editor.
   *
   * @remarks
   *
   * This is a required even when just an empty array to improve type inference.
   */
  extensions: ExtensionUnion[];

  /**
   * The presets to include with the editor.
   *
   * @remarks
   *
   * This is required even when just an empty array to improve type inference.
   */
  presets: PresetUnion[];

  /**
   * Settings to customise the behaviour of the editor.
   */
  settings?: Remirror.ManagerSettings;
}

interface SettingsWithPrivacy extends Remirror.ManagerSettings {
  /**
   * A symbol value that prevents the RemirrorManager constructor from being
   * called directly.
   *
   * @internal
   */
  privacy?: symbol;
}

export type GetCombined<Manager extends AnyRemirrorManager> = Manager['~EP'];

interface RemirrorManagerConstructor extends Function, Remirror.RemirrorManagerConstructor {
  fromObject<Combined extends AnyCombinedUnion>(
    parameter: RemirrorManagerParameter<
      InferCombinedExtensions<Combined>,
      InferCombinedPresets<Combined>
    >,
  ): RemirrorManager<
    InferCombinedExtensions<Combined> | InferCombinedPresets<Combined> | BuiltinPreset
  >;
  create<Combined extends AnyCombinedUnion>(
    combined: Combined[],
    settings?: Remirror.ManagerSettings,
  ): RemirrorManager<Combined | BuiltinPreset>;
}

export interface RemirrorManager<Combined extends AnyCombinedUnion> {
  /**
   * The constructor for the editor manager.
   */
  constructor: RemirrorManagerConstructor;

  /**
   * Pseudo property which is a small hack to store the type of the extension
   * union.
   */
  ['~E']: InferCombinedExtensions<Combined>;

  /**
   * Pseudo property which is a small hack to store the type of the presets
   * available from this manager..
   */
  ['~P']: InferCombinedPresets<Combined>;

  /**
   * Pseudo property which is a small hack to store the type of the schema
   * available from this manager..
   */
  ['~Sch']: SchemaFromCombined<Combined>;

  /**
   * `NodeNames`
   *
   * Type inference hack for node extension names. This is the only way I know
   * to store types on a class.
   *
   * @internal
   */
  ['~N']: GetNodeNameUnion<this['~E']>;

  /**
   * `MarkNames`
   *
   * Type inference hack for mark extension names. This is the only way I know
   * to store types on a class.
   *
   * @internal
   */
  ['~M']: GetMarkNameUnion<this['~E']>;

  ['~EP']: Combined;
}

declare global {
  namespace Remirror {
    /**
     * Extend this to add extra static methods to the
     * `RemirrorManagerConstructor`.
     */
    interface RemirrorManagerConstructor {}

    /**
     * Settings which can be passed into the manager.
     */
    interface ManagerSettings extends StringHandlerParameter {
      /**
       * Set the extension priority for extension's by their name.
       */
      priority?: Record<string, ExtensionPriority>;

      /**
       * An object which excludes certain functionality from all extensions
       * within the manager.
       */
      exclude?: ExcludeOptions;

      /**
       * The error handler which is called when the JSON passed is invalid.
       *
       * @remarks
       *
       * The following can be used to setup the `onError` handler on the the
       * manager.
       *
       * ```tsx
       * import React from 'react';
       * import { RemirrorProvider, InvalidContentHandler } from 'remirror/core';
       * import { RemirrorProvider, useManager } from 'remirror/react';
       * import { WysiwygPreset } from 'remirror/preset/wysiwyg';
       *
       * const Editor = () => {
       *   const onError: InvalidContentHandler = useCallback(({ json, invalidContent, transformers }) => {
       *     // Automatically remove all invalid nodes and marks.
       *     return transformers.remove(json, invalidContent);
       *   }, []);
       *
       *   const manager = useManager(() => [new WysiwygPreset()], { onError });
       *
       *   return (
       *     <RemirrorProvider manager={manager}>
       *       <div />
       *     </RemirrorProvider>
       *   );
       * };
       * ```
       */
      onError?: InvalidContentHandler;
    }

    /**
     * Describes the object where the extension manager stores it's data.
     *
     * @remarks
     *
     * Since this is a global namespace, you can extend the store if your
     * extension is modifying the shape of the `Manager.store` property.
     */
    interface ManagerStore<Combined extends AnyCombinedUnion> {
      /**
       * The editor view stored by this instance.
       */
      view: EditorView<SchemaFromCombined<Combined>>;
    }

    /**
     * The initialization params which are passed by the view layer into the
     * extension manager. This can be added to by the requesting framework
     * layer.
     */
    interface ManagerInitializationParameter<
      ExtensionUnion extends AnyExtension,
      PresetUnion extends AnyPreset
    > {}

    interface ExtensionStore {
      /**
       * The list of all extensions included in the editor.
       */
      readonly extensions: AnyExtension[];

      /**
       * The stage the manager is currently at.
       */
      readonly phase: ManagerPhase;

      /**
       * The view available to extensions once `addView` has been called on the
       * `RemirrorManager` instance.
       */
      readonly view: EditorView;

      /**
       * The latest state.
       */
      currentState: EditorState<EditorSchema>;

      /**
       * The previous state. Will be undefined when the view is first created.
       */
      previousState?: EditorState<EditorSchema>;

      /**
       * The settings passed to the manager.
       */
      readonly managerSettings: ManagerSettings;

      /**
       * The names of every node extension.
       */
      nodeNames: readonly string[];

      /**
       * The names of every mark extension.
       */
      markNames: readonly string[];

      /**
       * The names of every plain extension.
       */
      plainNames: readonly string[];

      /**
       * Return true when the editor view has been created.
       */
      readonly isMounted: () => boolean;

      /**
       * A helper method for retrieving the state of the editor
       */
      readonly getState: () => EditorState<EditorSchema>;

      /**
       * Allow extensions to trigger an update in the prosemirror state. This
       * should only be used in rarely as it is easy to get in trouble without
       * the necessary thought.
       */
      readonly updateState: (state: EditorState<EditorSchema>) => void;

      /**
       * Get the extension instance matching the provided constructor from the
       * manager.
       *
       * This will throw an error if not defined.
       */
      readonly getExtension: <ExtensionConstructor extends AnyExtensionConstructor>(
        Constructor: ExtensionConstructor,
      ) => InstanceType<ExtensionConstructor>;

      /**
       * Get the requested preset from the manager. This will throw if the preset
       * doesn't exist within the current editor.
       */
      readonly getPreset: <PresetConstructor extends AnyPresetConstructor>(
        Constructor: PresetConstructor,
      ) => InstanceType<PresetConstructor>;

      /**
       * Get the value of a key from the manager store.
       */
      getStoreKey: <Key extends ManagerStoreKeys>(key: Key) => AnyManagerStore[Key];

      /**
       * Update the store with a specific key.
       */
      setStoreKey: <Key extends ManagerStoreKeys>(key: Key, value: AnyManagerStore[Key]) => void;

      /**
       * Set a custom manager method parameter.
       */
      setExtensionStore: <Key extends keyof Remirror.ExtensionStore>(
        key: Key,
        value: Remirror.ExtensionStore[Key],
      ) => void;
    }
  }
}
