/**
 * Search Feature Definition
 *
 * Global search functionality across entities.
 */

import { FeatureDefinition } from '../../interfaces/feature.interface';

export const SEARCH_FEATURE: FeatureDefinition = {
  id: 'search',
  name: 'Search',
  category: 'utility',
  description: 'Global search across all content',
  icon: 'search',

  includedInAppTypes: [
    'ecommerce', 'marketplace', 'blog', 'crm', 'booking',
  ],

  activationKeywords: [
    'search', 'find', 'lookup', 'query', 'filter',
  ],

  enabledByDefault: true,
  optional: true,

  dependencies: [],
  conflicts: [],

  pages: [
    {
      id: 'search-results',
      route: '/search',
      section: 'frontend',
      title: 'Search Results',
      authRequired: false,
      templateId: 'list-page',
      components: ['search-bar', 'search-results', 'search-filters'],
      layout: 'default',
    },
  ],

  components: [
    'search-bar',
    'search-results',
    'search-filters',
    'search-suggestions',
  ],

  entities: [],

  apiRoutes: [
    {
      method: 'GET',
      path: '/search',
      auth: false,
      handler: 'custom',
      entity: 'products', // Primary search entity
      description: 'Global search',
    },
    {
      method: 'GET',
      path: '/search/suggestions',
      auth: false,
      handler: 'custom',
      entity: 'products',
      description: 'Search suggestions/autocomplete',
    },
  ],

  config: [
    {
      key: 'searchEntities',
      label: 'Entities to Search',
      type: 'select',
      default: 'products',
      options: [
        { value: 'products', label: 'Products' },
        { value: 'posts', label: 'Posts' },
        { value: 'all', label: 'All Content' },
      ],
      description: 'What content to include in search',
    },
  ],
};
