/**
 * Clients Feature Definition
 *
 * Client management with client portal, contacts,
 * and relationship tracking.
 */

import { FeatureDefinition } from '../../interfaces/feature.interface';

export const CLIENTS_FEATURE: FeatureDefinition = {
  id: 'clients',
  name: 'Clients',
  category: 'business',
  description: 'Client management with portal, contacts, and relationship tracking',
  icon: 'briefcase',

  includedInAppTypes: [
    'agency',
    'consulting',
    'freelance',
    'legal',
    'accounting',
    'financial-services',
    'insurance',
    'real-estate',
    'architecture',
    'design-agency',
  ],

  activationKeywords: [
    'clients',
    'client management',
    'client portal',
    'customer management',
    'accounts',
    'client relationships',
    'client database',
  ],

  enabledByDefault: false,
  optional: true,

  dependencies: ['user-auth'],
  conflicts: [],

  pages: [
    {
      id: 'clients-list',
      route: '/clients',
      section: 'frontend',
      title: 'Clients',
      authRequired: true,
      templateId: 'clients-list',
      components: [
        'clients-table',
        'client-card',
        'search-bar',
        'add-client-button',
      ],
      layout: 'default',
    },
    {
      id: 'client-detail',
      route: '/clients/:id',
      section: 'frontend',
      title: 'Client',
      authRequired: true,
      templateId: 'client-detail',
      components: [
        'client-header',
        'client-info',
        'contacts-list',
        'client-projects',
        'client-invoices',
        'activity-log',
      ],
      layout: 'default',
    },
    {
      id: 'client-portal',
      route: '/portal',
      section: 'frontend',
      title: 'Client Portal',
      authRequired: true,
      templateId: 'client-portal',
      components: [
        'portal-dashboard',
        'my-projects',
        'my-invoices',
        'my-documents',
        'support-widget',
      ],
      layout: 'default',
    },
    {
      id: 'add-client',
      route: '/clients/new',
      section: 'frontend',
      title: 'Add Client',
      authRequired: true,
      templateId: 'add-client',
      components: [
        'client-form',
        'contact-form',
        'billing-info-form',
      ],
      layout: 'default',
    },
  ],

  components: [
    // List
    'clients-table',
    'client-card',
    'search-bar',
    'add-client-button',

    // Detail
    'client-header',
    'client-info',
    'contacts-list',
    'client-projects',
    'client-invoices',
    'activity-log',

    // Portal
    'portal-dashboard',
    'my-projects',
    'my-invoices',
    'my-documents',
    'support-widget',

    // Form
    'client-form',
    'contact-form',
    'billing-info-form',
  ],

  entities: [
    {
      name: 'clients',
      displayName: 'Clients',
      description: 'Client accounts',
      isCore: true,
    },
    {
      name: 'client_contacts',
      displayName: 'Contacts',
      description: 'Client contacts',
      isCore: true,
    },
    {
      name: 'client_notes',
      displayName: 'Notes',
      description: 'Client notes',
      isCore: false,
    },
  ],

  apiRoutes: [
    {
      method: 'GET',
      path: '/clients',
      auth: true,
      handler: 'crud',
      entity: 'clients',
      description: 'List clients',
    },
    {
      method: 'GET',
      path: '/clients/:id',
      auth: true,
      handler: 'crud',
      entity: 'clients',
      description: 'Get client',
    },
    {
      method: 'POST',
      path: '/clients',
      auth: true,
      handler: 'crud',
      entity: 'clients',
      description: 'Create client',
    },
    {
      method: 'PUT',
      path: '/clients/:id',
      auth: true,
      handler: 'crud',
      entity: 'clients',
      description: 'Update client',
    },
    {
      method: 'DELETE',
      path: '/clients/:id',
      auth: true,
      handler: 'crud',
      entity: 'clients',
      description: 'Delete client',
    },
    {
      method: 'GET',
      path: '/clients/:id/contacts',
      auth: true,
      handler: 'crud',
      entity: 'client_contacts',
      description: 'List contacts',
    },
    {
      method: 'POST',
      path: '/clients/:id/contacts',
      auth: true,
      handler: 'crud',
      entity: 'client_contacts',
      description: 'Add contact',
    },
    {
      method: 'PUT',
      path: '/contacts/:id',
      auth: true,
      handler: 'crud',
      entity: 'client_contacts',
      description: 'Update contact',
    },
    {
      method: 'DELETE',
      path: '/contacts/:id',
      auth: true,
      handler: 'crud',
      entity: 'client_contacts',
      description: 'Delete contact',
    },
    {
      method: 'POST',
      path: '/clients/:id/portal-access',
      auth: true,
      handler: 'custom',
      entity: 'clients',
      description: 'Grant portal access',
    },
  ],

  config: [
    {
      key: 'enablePortal',
      label: 'Enable Client Portal',
      type: 'boolean',
      default: true,
      description: 'Allow client portal access',
    },
    {
      key: 'portalFeatures',
      label: 'Portal Features',
      type: 'string',
      default: 'projects,invoices,documents',
      description: 'Portal sections to show',
    },
    {
      key: 'requireApproval',
      label: 'Require Portal Approval',
      type: 'boolean',
      default: true,
      description: 'Approve portal access requests',
    },
    {
      key: 'defaultStatus',
      label: 'Default Client Status',
      type: 'string',
      default: 'active',
      description: 'Default status for new clients',
    },
  ],
};
