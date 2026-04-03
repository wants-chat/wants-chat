/**
 * Support Tickets Feature Definition
 *
 * Helpdesk and support ticket system for customer service
 * with ticket management, priorities, and SLA tracking.
 */

import { FeatureDefinition } from '../../interfaces/feature.interface';

export const SUPPORT_TICKETS_FEATURE: FeatureDefinition = {
  id: 'support-tickets',
  name: 'Support Tickets',
  category: 'communication',
  description: 'Helpdesk and support tickets with priorities and SLA tracking',
  icon: 'life-buoy',

  includedInAppTypes: [
    'saas',
    'helpdesk',
    'customer-support',
    'it-service',
    'ecommerce',
    'enterprise',
    'software',
    'agency',
    'managed-services',
  ],

  activationKeywords: [
    'support tickets',
    'helpdesk',
    'customer support',
    'ticketing',
    'zendesk',
    'freshdesk',
    'intercom',
    'help desk',
    'service desk',
  ],

  enabledByDefault: false,
  optional: true,

  dependencies: ['user-auth'],
  conflicts: [],

  pages: [
    {
      id: 'tickets-list',
      route: '/support',
      section: 'frontend',
      title: 'Support',
      authRequired: true,
      templateId: 'tickets-list',
      components: [
        'tickets-list',
        'ticket-card',
        'status-filter',
        'create-ticket-button',
      ],
      layout: 'default',
    },
    {
      id: 'ticket-detail',
      route: '/support/:id',
      section: 'frontend',
      title: 'Ticket',
      authRequired: true,
      templateId: 'ticket-detail',
      components: [
        'ticket-header',
        'ticket-conversation',
        'reply-form',
        'ticket-sidebar',
      ],
      layout: 'default',
    },
    {
      id: 'create-ticket',
      route: '/support/new',
      section: 'frontend',
      title: 'Create Ticket',
      authRequired: true,
      templateId: 'create-ticket',
      components: [
        'ticket-form',
        'category-selector',
        'priority-selector',
        'attachment-uploader',
      ],
      layout: 'default',
    },
    {
      id: 'admin-tickets',
      route: '/admin/tickets',
      section: 'admin',
      title: 'Support Queue',
      authRequired: true,
      templateId: 'admin-tickets',
      components: [
        'tickets-table',
        'queue-filters',
        'agent-assignment',
        'ticket-stats',
        'sla-monitor',
      ],
      layout: 'admin',
    },
    {
      id: 'admin-ticket-view',
      route: '/admin/tickets/:id',
      section: 'admin',
      title: 'Ticket Details',
      authRequired: true,
      templateId: 'admin-ticket-view',
      components: [
        'ticket-header',
        'ticket-conversation',
        'internal-notes',
        'reply-form',
        'ticket-actions',
        'customer-info',
      ],
      layout: 'admin',
    },
  ],

  components: [
    // Customer components
    'tickets-list',
    'ticket-card',
    'ticket-form',
    'create-ticket-button',

    // Ticket view
    'ticket-header',
    'ticket-conversation',
    'reply-form',
    'ticket-sidebar',
    'message-bubble',

    // Form
    'category-selector',
    'priority-selector',
    'attachment-uploader',

    // Admin
    'tickets-table',
    'queue-filters',
    'agent-assignment',
    'ticket-stats',
    'sla-monitor',
    'internal-notes',
    'ticket-actions',
    'customer-info',
    'canned-responses',

    // Filters
    'status-filter',
    'priority-filter',
    'agent-filter',
  ],

  entities: [
    {
      name: 'tickets',
      displayName: 'Tickets',
      description: 'Support tickets',
      isCore: true,
    },
    {
      name: 'ticket_messages',
      displayName: 'Messages',
      description: 'Ticket messages',
      isCore: true,
    },
    {
      name: 'ticket_categories',
      displayName: 'Categories',
      description: 'Ticket categories',
      isCore: false,
    },
    {
      name: 'canned_responses',
      displayName: 'Canned Responses',
      description: 'Pre-written replies',
      isCore: false,
    },
  ],

  apiRoutes: [
    {
      method: 'GET',
      path: '/tickets',
      auth: true,
      handler: 'crud',
      entity: 'tickets',
      description: 'List tickets',
    },
    {
      method: 'GET',
      path: '/tickets/:id',
      auth: true,
      handler: 'crud',
      entity: 'tickets',
      description: 'Get ticket',
    },
    {
      method: 'POST',
      path: '/tickets',
      auth: true,
      handler: 'crud',
      entity: 'tickets',
      description: 'Create ticket',
    },
    {
      method: 'PUT',
      path: '/tickets/:id',
      auth: true,
      handler: 'crud',
      entity: 'tickets',
      description: 'Update ticket',
    },
    {
      method: 'DELETE',
      path: '/tickets/:id',
      auth: true,
      handler: 'crud',
      entity: 'tickets',
      description: 'Delete ticket',
    },
    {
      method: 'GET',
      path: '/tickets/:id/messages',
      auth: true,
      handler: 'crud',
      entity: 'ticket_messages',
      description: 'Get messages',
    },
    {
      method: 'POST',
      path: '/tickets/:id/messages',
      auth: true,
      handler: 'crud',
      entity: 'ticket_messages',
      description: 'Add message',
    },
    {
      method: 'POST',
      path: '/tickets/:id/assign',
      auth: true,
      handler: 'custom',
      entity: 'tickets',
      description: 'Assign ticket',
    },
    {
      method: 'POST',
      path: '/tickets/:id/close',
      auth: true,
      handler: 'custom',
      entity: 'tickets',
      description: 'Close ticket',
    },
    {
      method: 'POST',
      path: '/tickets/:id/reopen',
      auth: true,
      handler: 'custom',
      entity: 'tickets',
      description: 'Reopen ticket',
    },
    {
      method: 'GET',
      path: '/tickets/stats',
      auth: true,
      handler: 'custom',
      entity: 'tickets',
      description: 'Get ticket stats',
    },
  ],

  config: [
    {
      key: 'slaResponseHours',
      label: 'SLA Response Time (hours)',
      type: 'number',
      default: 24,
      description: 'Target first response time',
    },
    {
      key: 'slaResolutionHours',
      label: 'SLA Resolution Time (hours)',
      type: 'number',
      default: 72,
      description: 'Target resolution time',
    },
    {
      key: 'autoCloseHours',
      label: 'Auto-close Inactive (hours)',
      type: 'number',
      default: 168,
      description: 'Close after inactivity',
    },
    {
      key: 'enableSatisfactionSurvey',
      label: 'Enable Satisfaction Survey',
      type: 'boolean',
      default: true,
      description: 'Send survey after close',
    },
  ],
};
