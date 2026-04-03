/**
 * Data Table Component Definition
 *
 * Full-featured data table with sorting, filtering, and pagination.
 */

import { ComponentDefinition } from '../../../interfaces/component.interface';

export const DATA_TABLE_COMPONENT: ComponentDefinition = {
  id: 'data-table',
  name: 'Data Table',
  category: 'data-display',
  description: 'Full-featured data table with sorting and filtering',
  icon: 'table',

  allowedIn: ['admin', 'vendor', 'frontend'],

  requiredFields: [
    {
      name: 'columns',
      type: 'json',
      label: 'Columns',
      default: [],
    },
    {
      name: 'data',
      type: 'json',
      label: 'Data',
      default: [],
    },
  ],

  optionalFields: [
    {
      name: 'sortable',
      type: 'boolean',
      label: 'Enable Sorting',
      default: true,
    },
    {
      name: 'filterable',
      type: 'boolean',
      label: 'Enable Filtering',
      default: true,
    },
    {
      name: 'paginated',
      type: 'boolean',
      label: 'Enable Pagination',
      default: true,
    },
    {
      name: 'pageSize',
      type: 'number',
      label: 'Page Size',
      default: 20,
    },
    {
      name: 'selectable',
      type: 'boolean',
      label: 'Row Selection',
      default: false,
    },
    {
      name: 'loading',
      type: 'boolean',
      label: 'Loading State',
      default: false,
    },
    {
      name: 'emptyMessage',
      type: 'text',
      label: 'Empty State Message',
      default: 'No data available',
    },
    {
      name: 'actions',
      type: 'json',
      label: 'Row Actions',
      default: [],
    },
    {
      name: 'bulkActions',
      type: 'json',
      label: 'Bulk Actions',
      default: [],
    },
  ],

  fieldSynonyms: {
    columns: ['headers', 'fields', 'cols'],
    data: ['rows', 'items', 'records'],
    pageSize: ['limit', 'perPage'],
    actions: ['rowActions', 'operations'],
  },

  apiEndpoints: [
    {
      method: 'GET',
      path: '/:entity',
      purpose: 'list',
      responseFields: ['data', 'total', 'page', 'pageSize'],
    },
    {
      method: 'DELETE',
      path: '/:entity/:id',
      purpose: 'delete',
      conditional: 'actions',
    },
  ],

  events: [
    { name: 'onSort', description: 'Triggered when column is sorted' },
    { name: 'onFilter', description: 'Triggered when filter changes' },
    { name: 'onPageChange', description: 'Triggered when page changes' },
    { name: 'onRowClick', description: 'Triggered when row is clicked' },
    { name: 'onRowSelect', description: 'Triggered when row selection changes' },
    { name: 'onBulkAction', description: 'Triggered when bulk action is performed' },
  ],

  templatePath: 'templates/components/data-display/data-table',
};
