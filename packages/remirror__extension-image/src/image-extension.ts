import {
  AnyExtension,
  ApplySchemaAttributes,
  command,
  CommandFunction,
  DelayedPromiseCreator,
  EditorView,
  ErrorConstant,
  extension,
  ExtensionTag,
  getTextSelection,
  invariant,
  isElementDomNode,
  NodeExtension,
  NodeExtensionSpec,
  NodeSpecOverride,
  NodeViewMethod,
  omitExtraAttributes,
  PrimitiveSelection,
  ProsemirrorAttributes,
  ProsemirrorNode,
} from '@remirror/core';
import { CaptionExtension } from '@remirror/extension-caption';
import { PasteRule } from '@remirror/pm/paste-rules';
import { insertPoint } from '@remirror/pm/transform';
import { ExtensionImageTheme } from '@remirror/theme';

import { ResizableImageView } from './resizable-image-view';

type DelayedImage = DelayedPromiseCreator<ImageAttributes>;

export interface ImageOptions {
  createPlaceholder?: (view: EditorView, pos: number) => HTMLElement;
  updatePlaceholder?: (
    view: EditorView,
    pos: number,
    element: HTMLElement,
    progress: number,
  ) => void;
  destroyPlaceholder?: (view: EditorView, element: HTMLElement) => void;

  /**
   * The upload handler for the image extension.
   *
   * It receives a list of dropped or pasted files and returns a promise for the
   * attributes which should be used to insert the image into the editor.
   *
   * @param files - a list of files to upload.
   * @param setProgress - the progress handler.
   */
  uploadHandler?: (files: FileWithProgress[]) => DelayedImage[];

  /**
   * Enable resizing.
   *
   * If true, the image node will be rendered by `nodeView` instead of `toDOM`.
   *
   * @default false
   */
  enableResizing?: boolean;
}

interface FileWithProgress {
  file: File;
  progress: SetProgress;
}

/**
 * Set the progress.
 *
 * @param progress - a value between `0` and `1`.
 */
type SetProgress = (progress: number) => void;

/**
 * The image extension for placing images into your editor.
 *
 * TODO ->
 * - Captions https://glitch.com/edit/#!/pet-figcaption?path=index.js%3A27%3A1 into a preset
 *
 * TODO => Split this into an image upload extension and image extension.
 * - Add a base64 image
 */
@extension<ImageOptions>({
  defaultOptions: {
    createPlaceholder,
    updatePlaceholder: () => {},
    destroyPlaceholder: () => {},
    uploadHandler,
    enableResizing: false,
  },
})
export class ImageExtension extends NodeExtension<ImageOptions> {
  get name() {
    return 'image' as const;
  }

  createTags() {
    // I don't like this at all, would very much appreciate feedback here
    const hasCaption = this.store.extensions.find(
      (e: AnyExtension) => e instanceof CaptionExtension,
    );

    if (hasCaption) {
      return [ExtensionTag.BlockNode, ExtensionTag.Media, ExtensionTag.CaptionCompatible];
    }

    return [ExtensionTag.InlineNode, ExtensionTag.Media];
  }

  createNodeSpec(extra: ApplySchemaAttributes, override: NodeSpecOverride): NodeExtensionSpec {
    return {
      inline: true,
      draggable: true,
      selectable: false,
      ...override,
      attrs: {
        ...extra.defaults(),
        alt: { default: '' },
        crop: { default: null },
        height: { default: null },
        width: { default: null },
        rotate: { default: null },
        src: { default: null },
        title: { default: '' },
        fileName: { default: null },

        resizable: { default: false },
      },
      parseDOM: [
        {
          tag: 'img[src]',
          getAttrs: (element) =>
            isElementDomNode(element) ? getImageAttributes({ element, parse: extra.parse }) : {},
        },
        ...(override.parseDOM ?? []),
      ],
      toDOM: (node) => {
        const attrs = omitExtraAttributes(node.attrs, extra);
        return ['img', { ...extra.dom(node), ...attrs }];
      },
    };
  }

  @command()
  insertImage(attributes: ImageAttributes, selection?: PrimitiveSelection): CommandFunction {
    return ({ tr, dispatch }) => {
      const { from, to } = getTextSelection(selection ?? tr.selection, tr.doc);
      const node = this.type.create(attributes);

      dispatch?.(tr.replaceRangeWith(from, to, node));

      return true;
    };
  }

  /**
   * Insert an image once the provide promise resolves.
   */
  @command()
  uploadImage(
    value: DelayedPromiseCreator<ImageAttributes>,
    onElement?: (element: HTMLElement) => void,
  ): CommandFunction {
    const { updatePlaceholder, destroyPlaceholder, createPlaceholder } = this.options;
    return (props) => {
      const { tr } = props;

      // This is update in the validate hook
      let pos = tr.selection.from;

      return this.store
        .createPlaceholderCommand({
          promise: value,
          placeholder: {
            type: 'widget',
            get pos() {
              return pos;
            },
            createElement: (view, pos) => {
              const element = createPlaceholder(view, pos);
              onElement?.(element);
              return element;
            },
            onUpdate: (view, pos, element, data) => {
              updatePlaceholder(view, pos, element, data);
            },
            onDestroy: (view, element) => {
              destroyPlaceholder(view, element);
            },
          },
          onSuccess: (value, range, commandProps) => {
            return this.insertImage(value, range)(commandProps);
          },
        })
        .validate(({ tr, dispatch }) => {
          const insertPos = insertPoint(tr.doc, pos, this.type);

          if (insertPos == null) {
            return false;
          }

          pos = insertPos;

          if (!tr.selection.empty) {
            dispatch?.(tr.deleteSelection());
          }

          return true;
        }, 'unshift')

        .generateCommand()(props);
    };
  }

  private fileUploadHandler(files: File[]) {
    const { commands, chain } = this.store;
    const filesWithProgress: FileWithProgress[] = files.map((file, index) => ({
      file,
      progress: (progress) => {
        commands.updatePlaceholder(uploads[index], progress);
      },
    }));

    const uploads = this.options.uploadHandler(filesWithProgress);

    for (const upload of uploads) {
      chain.uploadImage(upload);
    }

    chain.run();

    return true;
  }

  createPasteRules(): PasteRule[] {
    return [
      {
        type: 'file',
        regexp: /image/i,
        fileHandler: ({ files }) => this.fileUploadHandler(files),
      },
    ];
  }

  createNodeViews(): NodeViewMethod | Record<string, NodeViewMethod> {
    if (this.options.enableResizing) {
      return (node: ProsemirrorNode, view: EditorView, getPos: boolean | (() => number)) => {
        return new ResizableImageView(node, view, getPos as () => number);
      };
    }

    return {};
  }
}

export type ImageAttributes = ProsemirrorAttributes<ImageExtensionAttributes>;

export interface ImageExtensionAttributes {
  align?: 'center' | 'end' | 'justify' | 'left' | 'match-parent' | 'right' | 'start';
  alt?: string;
  height?: string;
  width?: string;
  rotate?: string;
  src: string;
  title?: string;

  /** The file name used to create the image. */
  fileName?: string;
}

/**
 * The set of valid image files.
 */
const IMAGE_FILE_TYPES = new Set([
  'image/jpeg',
  'image/gif',
  'image/png',
  'image/jpg',
  'image/svg',
  'image/webp',
]);

/**
 * True when the provided file is an image file.
 */
export function isImageFileType(file: File): boolean {
  return IMAGE_FILE_TYPES.has(file.type);
}

/**
 * Get the width and the height of the image.
 */
function getDimensions(element: HTMLElement) {
  let { width, height } = element.style;
  width = width ?? element.getAttribute('width') ?? '';
  height = height ?? element.getAttribute('height') ?? '';

  return { width, height };
}

/**
 * Retrieve attributes from the dom for the image extension.
 */
function getImageAttributes({
  element,
  parse,
}: {
  element: HTMLElement;
  parse: ApplySchemaAttributes['parse'];
}) {
  const { width, height } = getDimensions(element);

  return {
    ...parse(element),
    alt: element.getAttribute('alt') ?? '',
    height: Number.parseInt(height || '0', 10) || null,
    src: element.getAttribute('src') ?? null,
    title: element.getAttribute('title') ?? '',
    width: Number.parseInt(width || '0', 10) || null,
    fileName: element.getAttribute('data-file-name') ?? null,
  };
}

function createPlaceholder(_: EditorView, __: number): HTMLElement {
  const element = document.createElement('div');
  element.classList.add(ExtensionImageTheme.IMAGE_LOADER);

  return element;
}

/**
 * The default handler converts the files into their `base64` representations
 * and adds the attributes before inserting them into the editor.
 */
function uploadHandler(files: FileWithProgress[]): DelayedImage[] {
  invariant(files.length > 0, {
    code: ErrorConstant.EXTENSION,
    message: 'The upload handler was applied for the image extension without any valid files',
  });

  let completed = 0;
  const promises: Array<DelayedPromiseCreator<ImageAttributes>> = [];

  for (const { file, progress } of files) {
    promises.push(
      () =>
        new Promise<ImageAttributes>((resolve) => {
          const reader = new FileReader();

          reader.addEventListener(
            'load',
            (readerEvent) => {
              completed += 1;
              progress(completed / files.length);
              resolve({ src: readerEvent.target?.result as string, fileName: file.name });
            },
            { once: true },
          );

          reader.readAsDataURL(file);
        }),
    );
  }

  return promises;
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      image: ImageExtension;
    }

    interface BaseExtension {
      /**
       * Awesome stuff
       */
      a: string;
    }
  }
}
