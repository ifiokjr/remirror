import { Schema } from 'prosemirror-model';
import { AnyFunc } from 'simplytyped';
import {
  CommandParams,
  ExtensionType,
  FlexibleConfig,
  IExtension,
  IMarkExtension,
  INodeExtension,
} from './types';

type MethodFactory<GMappedFunc extends AnyFunc, GFunc extends AnyFunc> = (
  params: CommandParams,
  method: GFunc,
) => GMappedFunc;

interface IsNameUniqueParams {
  name: string;
  set: Set<string>;
  shouldThrow?: boolean;
  type?: string;
}

/**
 * Checks whether a given string is unique to the set.
 * Add the name if it doesn't already exist, or throw an error when `shouldThrow` is true.
 */
export const isNameUnique = ({
  name,
  set,
  shouldThrow = false,
  type = 'extension',
}: IsNameUniqueParams) => {
  if (set.has(name)) {
    const message = `There is a naming conflict for the name: ${name} used in this type: ${type}. Please rename to avoid runtime errors.`;
    if (shouldThrow) {
      throw new Error(message);
    } else {
      console.error(message);
    }
  } else {
    set.add(name);
  }
};

export interface HasExtensions {
  extensions: IExtension[];
}

/**
 * This creates a flexible function mapper.
 *
 * The reason is that extensions can have commands / enabled / active methods that return a very complex type signature
 *
 * ```ts
 * type FlexibleConfig<Func> = Func | Func[] | Record<string, Func | Func[]>
 * ```
 *
 * This creates a function that is able to step through each possibility and perform the action required.
 */
export const createFlexibleFunctionMap = <
  GKey extends keyof IExtension,
  GMappedFunc extends AnyFunc,
  GFunc extends AnyFunc
>({
  key,
  checkUniqueness,
  getItemParams,
  methodFactory,
  arrayTransformer,
  ctx,
}: {
  checkUniqueness: boolean;
  key: GKey;
  getItemParams: (
    ext: IExtension & Pick<Required<IExtension>, GKey>,
    params: CommandParams,
  ) => FlexibleConfig<GFunc>;
  methodFactory: MethodFactory<GMappedFunc, GFunc>;
  arrayTransformer: (
    fns: GFunc[],
    params: CommandParams,
    methodFactory: MethodFactory<GMappedFunc, GFunc>,
  ) => GMappedFunc;
  ctx: HasExtensions;
}) => (params: CommandParams): Record<string, GMappedFunc> => {
  const initialItems: Record<string, GMappedFunc> = {};
  const names = new Set<string>();
  return ctx.extensions.filter(hasExtensionProperty(key)).reduce((prevItems, currentExtension) => {
    const { name } = currentExtension;
    if (checkUniqueness) {
      isNameUnique({ name, set: names, shouldThrow: true });
    }
    const items: Record<string, GMappedFunc> = {};
    const item = getItemParams(currentExtension, params);
    if (Array.isArray(item)) {
      items[name] = arrayTransformer(item, params, methodFactory);
    } else if (typeof item === 'function') {
      items[name] = methodFactory(params, item);
    } else {
      Object.entries(item).forEach(([commandName, commandValue]) => {
        if (checkUniqueness) {
          isNameUnique({ name: commandName, set: names, shouldThrow: true });
        }
        items[commandName] = Array.isArray(commandValue)
          ? arrayTransformer(commandValue, params, methodFactory)
          : methodFactory(params, commandValue);
      });
    }
    return {
      ...prevItems,
      ...items,
    };
  }, initialItems);
};

/**
 * Determines if the passed in extension is a node extension. Useful as a type guard where a particular type of extension is needed.
 * @param extension
 */
export const isNodeExtension = (extension: IExtension): extension is INodeExtension =>
  extension.type === ExtensionType.NODE;

/**
 * Determines if the passed in extension is a mark extension. Useful as a type guard where a particular type of extension is needed.
 * @param extension
 */
export const isMarkExtension = (extension: IExtension): extension is IMarkExtension =>
  extension.type === ExtensionType.MARK;

/**
 * Checks to see if an optional property exists on an extension.
 * Used by the extension manager to build the plugins, keymaps etc...
 */
export const hasExtensionProperty = <GExt extends IExtension, GKey extends keyof GExt>(
  property: GKey,
) => (extension: GExt): extension is GExt & Pick<Required<GExt>, GKey> =>
  Boolean(extension[property]);

type ExtensionMethodProperties = 'inputRules' | 'pasteRules' | 'keys';

/**
 * Looks at the passed property and calls the extension with the required parameters.
 */
export const extensionPropertyMapper = <
  GExt extends IExtension,
  GExtMethodProp extends ExtensionMethodProperties
>(
  property: GExtMethodProp,
  schema: Schema,
) => (extension: GExt) =>
  isNodeExtension(extension)
    ? extension[property]({ schema, type: schema.nodes[extension.name] })
    : isMarkExtension(extension)
    ? extension[property]({ schema, type: schema.marks[extension.name] })
    : extension[property]({ schema });
