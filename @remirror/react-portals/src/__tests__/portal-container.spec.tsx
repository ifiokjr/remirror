import React from 'react';

import { PortalContainer } from '..';

test('PortalContainer', () => {
  const portalContainer = new PortalContainer();

  const mockListener = jest.fn();
  portalContainer.on(mockListener);

  const mockRender = jest.fn(() => <div data-testid='test' />);
  const element = document.createElement('span');
  document.body.appendChild(element);
  portalContainer.render({ render: mockRender, container: element });

  expect(Array.from(portalContainer.portals.entries())).toHaveLength(1);
  expect(mockListener).toHaveBeenCalledWith(portalContainer.portals);

  portalContainer.remove(element);

  expect(Array.from(portalContainer.portals.entries())).toHaveLength(0);
});
