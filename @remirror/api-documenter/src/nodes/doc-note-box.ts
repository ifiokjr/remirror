/* eslint-disable @typescript-eslint/no-empty-interface */
import { DocNode, DocSection, IDocNodeParameters } from '@microsoft/tsdoc';
import { CustomDocNodeKind } from './doc-enum';

/**
 * Constructor parameters for {@link DocNoteBox}.
 */
export interface IDocNoteBoxParameters extends IDocNodeParameters {}

/**
 * Represents a note box, which is typically displayed as a bordered box containing informational text.
 */
export class DocNoteBox extends DocNode {
  public readonly content: DocSection;

  public constructor(parameters: IDocNoteBoxParameters, sectionChildNodes?: readonly DocNode[]) {
    super(parameters);
    this.content = new DocSection({ configuration: this.configuration }, sectionChildNodes);
  }

  /** @override */
  public get kind(): string {
    return CustomDocNodeKind.NoteBox;
  }

  /** @override */
  protected onGetChildNodes(): readonly (DocNode | undefined)[] {
    return [this.content];
  }
}
