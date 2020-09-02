import { isFunction, object } from '@remirror/core-helpers';
import type { NodeViewMethod } from '@remirror/core-types';

import { PlainExtension } from '../extension';
import type { AnyCombinedUnion } from '../preset';

/**
 * This extension allows others extension to add the `createNodeView` method
 * for creating nodeViews which alter how the dom is rendered for the node.
 *
 * @remarks
 *
 * This is an example of adding custom functionality to an extension via the
 * `ExtensionParameterMethods`.
 *
 * @builtin
 */
export class NodeViewExtension extends PlainExtension {
  get name() {
    return 'nodeView' as const;
  }

  /**
   * Ensure that all SSR transformers are run.
   */
  onCreate(): void {
    const nodeViewList: Array<Record<string, NodeViewMethod>> = [];
    const nodeViews: Record<string, NodeViewMethod> = object();

    for (const extension of this.store.extensions) {
      if (
        // managerSettings excluded this from running
        this.store.managerSettings.exclude?.nodeViews ||
        // Method doesn't exist
        !extension.createNodeViews ||
        // Extension settings exclude it
        extension.options.exclude?.nodeViews
      ) {
        continue;
      }

      const nodeView = extension.createNodeViews();

      // `.unshift` ensures higher priority extensions can overwrite the lower
      // priority nodeViews.
      nodeViewList.unshift(isFunction(nodeView) ? { [extension.name]: nodeView } : nodeView);
    }

    // Insert the `nodeViews` provided via the manager.
    nodeViewList.unshift(this.store.managerSettings.nodeViews ?? {});

    for (const nodeView of nodeViewList) {
      Object.assign(nodeViews, nodeView);
    }

    this.store.setStoreKey('nodeViews', nodeViews);
  }
}

declare global {
  namespace Remirror {
    interface ManagerSettings {
      /**
       * Add custom node views to the manager which will take priority over the
       * nodeViews provided by the extensions and plugins.
       */
      nodeViews?: Record<string, NodeViewMethod>;
    }

    interface ManagerStore<Combined extends AnyCombinedUnion> {
      /**
       * The custom nodeView which can be used to replace the nodes or marks in
       * the DOM and change their browser behavior.
       */
      nodeViews: Record<string, NodeViewMethod>;
    }

    interface ExcludeOptions {
      /**
       * Whether to exclude the extension's nodeView
       *
       * @default undefined
       */
      nodeViews?: boolean;
    }

    interface ExtensionCreatorMethods {
      /**
       * Registers one or multiple nodeViews for the extension.
       *
       * This is a shorthand way of registering a nodeView without the need to
       * create a prosemirror plugin. It allows for the registration of one nodeView
       * which has the same name as the extension.
       *
       * To register more than one you would need to use a custom plugin returned
       * from the `plugin` method.
       *
       * @param parameter - schema parameter with type included
       *
       * @alpha
       */
      createNodeViews?(): NodeViewMethod | Record<string, NodeViewMethod>;
    }
  }
}
