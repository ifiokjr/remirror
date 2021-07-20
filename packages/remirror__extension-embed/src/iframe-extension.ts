import { parse, stringify } from 'querystringify';
import {
  ApplySchemaAttributes,
  command,
  CommandFunction,
  cx,
  EditorView,
  extension,
  ExtensionTag,
  findSelectedNodeOfType,
  LiteralUnion,
  NodeExtension,
  NodeExtensionSpec,
  NodeSpecOverride,
  NodeViewMethod,
  object,
  omitExtraAttributes,
  ProsemirrorAttributes,
  ProsemirrorNode,
  Shape,
} from '@remirror/core';

import { IframeOptions } from './iframe-types';
import { ResizableIframeView } from './resizable-iframe-view';

export type IframeAttributes = ProsemirrorAttributes<{
  src: string;
  frameBorder?: number | string;
  allowFullScreen?: 'true';
  width?: string | number;
  height?: string | number;
  type?: LiteralUnion<'youtube', string>;
}>;

/**
 * An extension for the remirror editor.
 */
@extension<IframeOptions>({
  defaultOptions: {
    defaultSource: '',
    class: 'remirror-iframe',
    enableResizing: false,
  },
  staticKeys: ['defaultSource', 'class'],
})
export class IframeExtension extends NodeExtension<IframeOptions> {
  get name() {
    return 'iframe' as const;
  }

  createTags() {
    return [ExtensionTag.Block];
  }

  createNodeViews(): NodeViewMethod | Record<string, NodeViewMethod> {
    const iframeOptions = {
      ...this.options,
    };

    if (this.options.enableResizing) {
      return (node: ProsemirrorNode, view: EditorView, getPos: boolean | (() => number)) => {
        return new ResizableIframeView(node, view, getPos as () => number, iframeOptions);
      };
    }

    return {};
  }

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): NodeExtensionSpec {
    const { defaultSource } = this.options;

    return {
      selectable: false,
      ...override,
      attrs: {
        ...extra.defaults(),
        src: defaultSource ? { default: defaultSource } : {},
        allowFullScreen: { default: true },
        frameBorder: { default: 0 },
        type: { default: 'custom' },
        width: { default: null },
        height: { default: null },
      },
      parseDOM: [
        {
          tag: 'iframe',
          getAttrs: (dom) => {
            const frameBorder = (dom as HTMLElement).getAttribute('frameborder');
            return {
              ...extra.parse(dom),
              type: (dom as HTMLElement).getAttribute('data-embed-type'),
              height: (dom as HTMLElement).getAttribute('height'),
              width: (dom as HTMLElement).getAttribute('width'),
              allowFullScreen:
                (dom as HTMLElement).getAttribute('allowfullscreen') === 'false' ? false : true,
              frameBorder: frameBorder ? Number.parseInt(frameBorder, 10) : 0,
              src: (dom as HTMLElement).getAttribute('src'),
            };
          },
        },
        ...(override.parseDOM ?? []),
      ],
      toDOM: (node) => {
        const { frameBorder, allowFullScreen, src, type, ...rest } = omitExtraAttributes(
          node.attrs,
          extra,
        );
        const { class: className } = this.options;

        return [
          'iframe',
          {
            ...extra.dom(node),
            ...rest,
            class: cx(className, `${className}-${type as string}`),
            src,
            'data-embed-type': type,
            allowfullscreen: allowFullScreen ? 'true' : 'false',
            frameBorder: frameBorder?.toString(),
          },
        ];
      },
    };
  }

  /**
   * Add a custom iFrame to the editor.
   */
  @command()
  addIframe(attributes: IframeAttributes): CommandFunction {
    return ({ tr, dispatch }) => {
      dispatch?.(tr.replaceSelectionWith(this.type.create(attributes)));

      return true;
    };
  }

  /**
   * Add a YouTube embedded iFrame to the editor.
   */
  @command()
  addYouTubeVideo(props: CreateYouTubeIframeProps): CommandFunction {
    return this.addIframe({
      src: createYouTubeUrl(props),
      frameBorder: 0,
      type: 'youtube',
      allowFullScreen: 'true',
    });
  }

  /**
   * Update the iFrame source for the currently selected video.
   */
  @command()
  updateIframeSource(src: string): CommandFunction {
    return ({ tr, dispatch }) => {
      const found = findSelectedNodeOfType({ selection: tr.selection, types: this.type });

      if (!found) {
        return false;
      }

      dispatch?.(tr.setNodeMarkup(found.pos, undefined, { ...found.node.attrs, src }));

      return true;
    };
  }

  /**
   * Update the YouTube video iFrame.
   */
  @command()
  updateYouTubeVideo(props: CreateYouTubeIframeProps): CommandFunction {
    return this.updateIframeSource(createYouTubeUrl(props));
  }
}

interface CreateYouTubeIframeProps {
  /**
   * The video id (dQw4w9WgXcQ) or full link
   * (https://www.youtube.com/watch?v=dQw4w9WgXcQ).
   */
  video: string;

  /**
   * The number os seconds in to start at.
   * @default 0
   */
  startAt?: number;

  /**
   * When true will show the player controls.
   *
   * @default true
   */
  showControls?: boolean;

  /**
   * According to YouTube: _When you turn on privacy-enhanced mode, YouTube
   * won't store information about visitors on your website unless they play the
   * video._
   *
   * @default true
   */
  enhancedPrivacy?: boolean;
}

/**
 * A Url parser that relies on the browser for the majority of the work.
 */
function parseUrl<Query extends Shape = Shape>(url: string) {
  const parser = document.createElement('a');

  // Let the browser do the work
  parser.href = url;

  const searchObject = parse(parser.search) as Query;

  return {
    protocol: parser.protocol,
    host: parser.host,
    hostname: parser.hostname,
    port: parser.port,
    pathname: parser.pathname,
    search: parser.search,
    searchObject,
    hash: parser.hash,
  };
}

function createYouTubeUrl(props: CreateYouTubeIframeProps) {
  const { video, enhancedPrivacy = true, showControls = true, startAt = 0 } = props;
  const id: string = parseUrl<{ v?: string }>(video)?.searchObject?.v ?? video;
  const urlStart = enhancedPrivacy ? 'https://www.youtube-nocookie.com' : 'https://www.youtube.com';
  const searchObject = object<Shape>();

  if (!showControls) {
    searchObject.controls = '0';
  }

  if (startAt) {
    searchObject['amp;start'] = startAt;
  }

  return `${urlStart}/embed/${id}?${stringify(searchObject)}`;
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      iframe: IframeExtension;
    }
  }
}
