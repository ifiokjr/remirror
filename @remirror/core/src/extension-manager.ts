import { Interpolation } from 'emotion';
import { InputRule } from 'prosemirror-inputrules';
import { keymap } from 'prosemirror-keymap';
import { Schema } from 'prosemirror-model';
import { EditorState, PluginKey } from 'prosemirror-state';
import { AnyExtension } from './extension';
import {
  createFlexibleFunctionMap,
  extensionPropertyMapper,
  hasExtensionProperty,
  isMarkExtension,
  isNodeExtension,
} from './extension-manager.helpers';
import { getPluginState } from './helpers/document';
import { NodeViewPortalContainer } from './portal-container';
import {
  ActionMethods,
  Attrs,
  CommandFunction,
  CommandParams,
  EditorSchema,
  ExtensionBooleanFunction,
  ExtensionCommandFunction,
  MarkExtensionSpec,
  NodeExtensionSpec,
  ProsemirrorPlugin,
  RemirrorActions,
  SchemaParams,
} from './types';

export class ExtensionManager {
  constructor(
    public readonly extensions: AnyExtension[],
    public readonly getEditorState: () => EditorState,
    public readonly getPortalContainer: () => NodeViewPortalContainer,
  ) {}

  /**
   * Filters through all provided extensions and picks the nodes
   */
  public get nodes() {
    const nodes: Record<string, NodeExtensionSpec> = {};
    this.extensions.filter(isNodeExtension).forEach(({ name, schema }) => {
      nodes[name] = schema;
    });
    return nodes;
  }

  /**
   * Filters through all provided extensions and picks the marks
   */
  public get marks() {
    const marks: Record<string, MarkExtensionSpec> = {};
    this.extensions.filter(isMarkExtension).forEach(({ name, schema }) => {
      marks[name] = schema;
    });
    return marks;
  }

  /**
   * Dynamically create the editor schema based on the extensions that have been passed in.
   */
  public createSchema(): EditorSchema {
    return new Schema({ nodes: this.nodes, marks: this.marks });
  }

  /**
   * Get all the extension plugin keys
   */
  public get pluginKeys() {
    const pluginKeys: Record<string, PluginKey> = {};
    this.extensions
      .filter(extension => extension.plugin)
      .forEach(({ pluginKey, name }) => {
        pluginKeys[name] = pluginKey;
      });

    return pluginKeys;
  }

  /**
   * Retrieve all plugins from the passed in extensions
   */
  public plugins(params: SchemaParams) {
    const plugins: ProsemirrorPlugin[] = [];
    const extensionPlugins = this.extensions
      .filter(hasExtensionProperty('plugin'))
      .map(extensionPropertyMapper('plugin', params)) as ProsemirrorPlugin[];

    extensionPlugins.forEach(plugin => {
      plugins.push(plugin);
    });

    return plugins;
  }

  public styles(params: SchemaParams): Interpolation[] {
    const extensionStyles = this.extensions
      .filter(hasExtensionProperty('styles'))
      .map(extensionPropertyMapper('styles', params));

    return extensionStyles;
  }

  /**
   * Retrieve all keymaps (how the editor responds to keyboard commands).
   */
  public keymaps(params: SchemaParams) {
    const extensionKeymaps = this.extensions
      .filter(hasExtensionProperty('keys'))
      .map(extensionPropertyMapper('keys', params));

    const mappedKeys: Record<string, CommandFunction> = {};

    for (const extensionKeymap of extensionKeymaps) {
      for (const key in extensionKeymap) {
        if (!extensionKeymap.hasOwnProperty(key)) {
          continue;
        }
        const oldCmd = mappedKeys[key];
        let newCmd = extensionKeymap[key];
        if (oldCmd) {
          newCmd = (state, dispatch, view) => {
            return oldCmd(state, dispatch, view) || extensionKeymap[key](state, dispatch, view);
          };
        }
        mappedKeys[key] = newCmd;
      }
    }
    return [keymap(mappedKeys)];
  }

  /**
   * Retrieve all inputRules (how the editor responds to text matching certain rules).
   */
  public inputRules(params: SchemaParams) {
    const inputRules: InputRule[] = [];
    const extensionInputRules = this.extensions
      .filter(hasExtensionProperty('inputRules'))
      .map(extensionPropertyMapper('inputRules', params)) as InputRule[][];

    extensionInputRules.forEach(rules => {
      inputRules.push(...rules);
    });

    return inputRules;
  }

  /**
   * Retrieve all pasteRules (rules for how the editor responds to pastedText).
   */
  public pasteRules(params: SchemaParams): ProsemirrorPlugin[] {
    const pasteRules: ProsemirrorPlugin[] = [];
    const extensionPasteRules = this.extensions
      .filter(hasExtensionProperty('pasteRules'))
      .map(extensionPropertyMapper('pasteRules', params)) as ProsemirrorPlugin[][];

    extensionPasteRules.forEach(rules => {
      pasteRules.push(...rules);
    });

    return pasteRules;
  }

  /**
   * Create the actions which are passed into the render props.
   *
   * RemirrorActions allow for checking if a node / mark is active, enabled, and also running the command.
   *
   * - `isActive` defaults to a function returning false
   * - `isEnabled` defaults to a function returning true
   */
  public actions(params: CommandParams): RemirrorActions {
    const actions: RemirrorActions = {};
    const commands = this.commands(params);
    const active = this.active(params);
    const enabled = this.enabled(params);

    Object.entries(commands).forEach(([name, command]) => {
      const action: ActionMethods = {
        command,
        isActive: active[name] ? active[name] : () => false,
        isEnabled: enabled[name] ? enabled[name] : () => true,
      };
      actions[name] = action;
    });

    return actions;
  }

  /**
   * Retrieve the state for a given extension name. This will throw an error if the extension doesn't exist.
   */
  public getPluginState<GState>(name: string): GState {
    const key = this.pluginKeys[name];
    if (!key) {
      throw new Error(`Cannot retrieve state for an extension: ${name} which doesn\'t exist`);
    }
    return getPluginState<GState>(key, this.getEditorState());
  }

  /**
   * Generate all the actions for usage within the UI.
   *
   * Typically actions are used to create interactive menus.
   * For example a menu can use a command to toggle bold.
   */
  private commands = createFlexibleFunctionMap<'commands', (attrs?: Attrs) => void, ExtensionCommandFunction>(
    {
      ctx: this,
      key: 'commands',
      methodFactory: (params, method) => (attrs?: Attrs) => {
        if (!params.isEditable()) {
          return false;
        }
        params.view.focus();
        return method(attrs)(params.view.state, params.view.dispatch, params.view);
      },
      checkUniqueness: true,
      arrayTransformer: (fns, params, methodFactory) => () => {
        fns.forEach(callback => {
          methodFactory(params, callback);
        });
      },
      getItemParams: (ext, params) =>
        ext.commands({
          schema: params.schema,
          getEditorState: this.getEditorState,
          getPortalContainer: this.getPortalContainer,
          ...(isMarkExtension(ext)
            ? { type: params.schema.marks[ext.name] }
            : isNodeExtension(ext)
            ? { type: params.schema.nodes[ext.name] }
            : {}),
        }),
    },
  );

  /**
   * Creates methods determining whether a node is active or inactive
   */
  private active = booleanFlexibleFunctionMap('active', this);

  /**
   * Creates methods determining whether a node / mark is enabled
   */
  private enabled = booleanFlexibleFunctionMap('enabled', this);
}

/**
 * A helper specifically for generating RemirrorActions active and enabled methods
 */
const booleanFlexibleFunctionMap = <GKey extends 'enabled' | 'active'>(key: GKey, ctx: ExtensionManager) => {
  return createFlexibleFunctionMap<GKey, () => boolean, ExtensionBooleanFunction>({
    ctx,
    key,
    methodFactory: (_, method) => () => {
      return method();
    },
    checkUniqueness: false,
    arrayTransformer: (functions, params, methodFactory) => () => {
      return functions
        .map(callback => {
          methodFactory(params, callback);
        })
        .every(Boolean);
    },
    getItemParams: (extension, params) =>
      extension[key]({
        schema: params.schema,
        getEditorState: ctx.getEditorState,
        getPortalContainer: ctx.getPortalContainer,
      }),
  });
};
