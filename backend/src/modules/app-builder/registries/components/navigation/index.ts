/**
 * Navigation Components Registry Index
 */

export { NAVBAR_COMPONENT } from './navbar';
export { SIDEBAR_COMPONENT } from './sidebar';
export { BREADCRUMBS_COMPONENT } from './breadcrumbs';
export { TABS_COMPONENT } from './tabs';
export { PAGINATION_COMPONENT } from './pagination';
export { FOOTER_COMPONENT } from './footer';

import { ComponentDefinition } from '../../../interfaces/component.interface';
import { NAVBAR_COMPONENT } from './navbar';
import { SIDEBAR_COMPONENT } from './sidebar';
import { BREADCRUMBS_COMPONENT } from './breadcrumbs';
import { TABS_COMPONENT } from './tabs';
import { PAGINATION_COMPONENT } from './pagination';
import { FOOTER_COMPONENT } from './footer';

export const NAVIGATION_COMPONENTS: ComponentDefinition[] = [
  NAVBAR_COMPONENT,
  SIDEBAR_COMPONENT,
  BREADCRUMBS_COMPONENT,
  TABS_COMPONENT,
  PAGINATION_COMPONENT,
  FOOTER_COMPONENT,
];
