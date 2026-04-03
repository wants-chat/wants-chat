/**
 * Data Display Components Registry Index
 */

export { DATA_TABLE_COMPONENT } from './data-table';
export { CARD_COMPONENT } from './card';
export { STATS_CARD_COMPONENT } from './stats-card';
export { LIST_COMPONENT } from './list';
export { MODAL_COMPONENT } from './modal';
export { AVATAR_COMPONENT } from './avatar';
export { BADGE_COMPONENT } from './badge';
export { EMPTY_STATE_COMPONENT } from './empty-state';
export { CHART_COMPONENT } from './chart';

import { ComponentDefinition } from '../../../interfaces/component.interface';
import { DATA_TABLE_COMPONENT } from './data-table';
import { CARD_COMPONENT } from './card';
import { STATS_CARD_COMPONENT } from './stats-card';
import { LIST_COMPONENT } from './list';
import { MODAL_COMPONENT } from './modal';
import { AVATAR_COMPONENT } from './avatar';
import { BADGE_COMPONENT } from './badge';
import { EMPTY_STATE_COMPONENT } from './empty-state';
import { CHART_COMPONENT } from './chart';

export const DATA_DISPLAY_COMPONENTS: ComponentDefinition[] = [
  DATA_TABLE_COMPONENT,
  CARD_COMPONENT,
  STATS_CARD_COMPONENT,
  LIST_COMPONENT,
  MODAL_COMPONENT,
  AVATAR_COMPONENT,
  BADGE_COMPONENT,
  EMPTY_STATE_COMPONENT,
  CHART_COMPONENT,
];
