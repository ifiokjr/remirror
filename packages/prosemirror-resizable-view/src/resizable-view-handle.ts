export enum ResizableHandleType {
  Right,
  Left,
  Bottom,
  BottomRight,
  BottomLeft,
}

export class ResizableHandle {
  dom: HTMLDivElement;
  #handle: HTMLDivElement;
  type: ResizableHandleType;

  constructor(type: ResizableHandleType) {
    const wrapper = document.createElement('div');
    const handle = document.createElement('div');
    this.dom = wrapper;
    this.#handle = handle;
    this.type = type;
    this.createHandle(type);
  }

  createHandle(type: ResizableHandleType): void {
    Object.assign(this.dom.style, {
      position: 'absolute',
      pointerEvents: 'auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: '100',
    });

    Object.assign(this.#handle.style, {
      opacity: '0',
      transition: 'opacity 300ms ease-in 0s',
    });

    this.#handle.dataset.dragging = '';

    switch (type) {
      case ResizableHandleType.Right:
        Object.assign(this.dom.style, {
          right: '0px',
          top: '0px',
          height: '100%',
          width: '15px',
          cursor: 'col-resize',
        });

        Object.assign(this.#handle.style, {
          width: ' 4px',
          height: '36px',
          maxHeight: '50%',
          background: 'rgba(15, 15, 15, 0.5)',
        });

        break;
      case ResizableHandleType.Left:
        Object.assign(this.dom.style, {
          left: '0px',
          top: '0px',
          height: '100%',
          width: '15px',
          cursor: 'col-resize',
        });

        Object.assign(this.#handle.style, {
          width: ' 4px',
          height: '36px',
          maxHeight: '50%',
          background: 'rgba(15, 15, 15, 0.5)',
        });

        break;
      case ResizableHandleType.Bottom:
        Object.assign(this.dom.style, {
          bottom: '0px',
          width: '100%',
          height: '14px',
          cursor: 'row-resize',
        });

        Object.assign(this.#handle.style, {
          width: ' 36px',
          height: '4px',
          maxWidth: '50%',
          background: 'rgba(15, 15, 15, 0.5)',
        });

        break;
      case ResizableHandleType.BottomRight:
        Object.assign(this.dom.style, {
          right: '0px',
          bottom: '0px',
          width: '30px',
          height: '30px',
          cursor: 'nwse-resize',
          zIndex: '101',
        });

        Object.assign(this.#handle.style, {
          width: '18px',
          height: '18px',
          borderBottom: '4px solid rgba(15, 15, 15, 0.5)',
          borderRight: '4px solid rgba(15, 15, 15, 0.5)',
        });

        break;
      case ResizableHandleType.BottomLeft:
        Object.assign(this.dom.style, {
          left: '0px',
          bottom: '0px',
          width: '30px',
          height: '30px',
          cursor: 'nesw-resize',
          zIndex: '101',
        });

        Object.assign(this.#handle.style, {
          width: '18px',
          height: '18px',
          borderBottom: '4px solid rgba(15, 15, 15, 0.5)',
          borderLeft: '4px solid rgba(15, 15, 15, 0.5)',
        });

        break;
    }

    this.dom.append(this.#handle);
  }

  setHandleVisibility(visible: boolean): void {
    const isVisible = visible || !!this.#handle.dataset.dragging;
    this.#handle.style.opacity = isVisible ? '1' : '0';
  }

  dataSetDragging(isDraging: boolean): void {
    this.#handle.dataset.dragging = isDraging ? 'true' : '';
  }
}
