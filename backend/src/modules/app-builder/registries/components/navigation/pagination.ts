/**
 * Pagination Component Definition
 *
 * Page navigation for lists and tables.
 */

import { ComponentDefinition } from '../../../interfaces/component.interface';

export const PAGINATION_COMPONENT: ComponentDefinition = {
  id: 'pagination',
  name: 'Pagination',
  category: 'navigation',
  description: 'Page navigation for lists',
  icon: 'more-horizontal',

  allowedIn: ['frontend', 'admin', 'vendor'],

  requiredFields: [
    {
      name: 'currentPage',
      type: 'number',
      label: 'Current Page',
      default: 1,
    },
    {
      name: 'totalPages',
      type: 'number',
      label: 'Total Pages',
    },
  ],

  optionalFields: [
    {
      name: 'pageSize',
      type: 'number',
      label: 'Page Size',
      default: 20,
    },
    {
      name: 'showFirstLast',
      type: 'boolean',
      label: 'Show First/Last',
      default: true,
    },
    {
      name: 'showPageSize',
      type: 'boolean',
      label: 'Show Page Size Selector',
      default: false,
    },
    {
      name: 'pageSizeOptions',
      type: 'json',
      label: 'Page Size Options',
      default: [10, 20, 50, 100],
    },
    {
      name: 'siblingCount',
      type: 'number',
      label: 'Sibling Count',
      default: 1,
    },
  ],

  fieldSynonyms: {
    currentPage: ['page', 'pageNumber', 'activePage'],
    totalPages: ['pages', 'pageCount', 'total'],
    pageSize: ['limit', 'perPage', 'itemsPerPage'],
  },

  apiEndpoints: [],

  events: [
    { name: 'onPageChange', description: 'Triggered when page changes' },
    { name: 'onPageSizeChange', description: 'Triggered when page size changes' },
  ],

  templatePath: 'templates/components/navigation/pagination',
};
