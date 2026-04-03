/**
 * Invoicing Feature Definition
 *
 * Complete invoicing functionality for generating invoices,
 * billing management, and payment tracking.
 */

import { FeatureDefinition } from '../../interfaces/feature.interface';

export const INVOICING_FEATURE: FeatureDefinition = {
  id: 'invoicing',
  name: 'Invoicing',
  category: 'commerce',
  description: 'Invoice generation, billing management, and payment tracking',
  icon: 'file-text',

  includedInAppTypes: [
    'saas',
    'freelance',
    'agency',
    'consulting',
    'service-business',
    'accounting',
    'crm',
    'project-management',
    'legal',
    'healthcare',
    'real-estate',
    'construction',
    'professional-services',
    'subscription-business',
    'b2b-marketplace',
    'erp',
  ],

  activationKeywords: [
    'invoicing',
    'invoices',
    'billing',
    'bills',
    'receipts',
    'payment requests',
    'invoice generator',
    'invoice management',
    'billing system',
    'payment tracking',
    'accounts receivable',
    'invoice templates',
    'send invoice',
    'create invoice',
    'client billing',
    'professional invoices',
  ],

  enabledByDefault: false,
  optional: true,

  dependencies: ['user-auth'],
  conflicts: [],

  pages: [
    {
      id: 'invoices',
      route: '/invoices',
      section: 'frontend',
      title: 'Invoices',
      authRequired: true,
      templateId: 'invoices-list',
      components: [
        'invoice-list',
        'invoice-status-badge',
        'invoice-filters',
        'invoice-stats-cards',
      ],
      layout: 'dashboard',
    },
    {
      id: 'invoice-detail',
      route: '/invoices/:id',
      section: 'frontend',
      title: 'Invoice Detail',
      authRequired: true,
      templateId: 'invoice-detail',
      components: [
        'invoice-preview',
        'invoice-status-badge',
        'invoice-actions',
        'payment-history',
      ],
      layout: 'default',
    },
    {
      id: 'create-invoice',
      route: '/invoices/new',
      section: 'frontend',
      title: 'Create Invoice',
      authRequired: true,
      templateId: 'invoice-create',
      components: [
        'invoice-form',
        'line-item-editor',
        'client-selector',
        'invoice-preview',
      ],
      layout: 'default',
    },
    {
      id: 'edit-invoice',
      route: '/invoices/:id/edit',
      section: 'frontend',
      title: 'Edit Invoice',
      authRequired: true,
      templateId: 'invoice-edit',
      components: [
        'invoice-form',
        'line-item-editor',
        'client-selector',
        'invoice-preview',
      ],
      layout: 'default',
    },
    {
      id: 'invoice-settings',
      route: '/invoices/settings',
      section: 'frontend',
      title: 'Invoice Settings',
      authRequired: true,
      templateId: 'invoice-settings',
      components: [
        'invoice-defaults-form',
        'invoice-template-selector',
        'payment-methods-config',
        'reminder-settings',
      ],
      layout: 'dashboard',
    },
  ],

  components: [
    // List components
    'invoice-list',
    'invoice-table',
    'invoice-card',
    'invoice-filters',
    'invoice-stats-cards',

    // Form components
    'invoice-form',
    'line-item-editor',
    'line-item-row',
    'client-selector',
    'tax-calculator',
    'discount-input',

    // Preview and display components
    'invoice-preview',
    'invoice-pdf',
    'invoice-status-badge',
    'invoice-actions',

    // Payment components
    'payment-history',
    'record-payment-modal',
    'payment-form',

    // Settings components
    'invoice-defaults-form',
    'invoice-template-selector',
    'payment-methods-config',
    'reminder-settings',
  ],

  entities: [
    {
      name: 'invoices',
      displayName: 'Invoices',
      description: 'Invoice records with billing details',
      isCore: true,
    },
    {
      name: 'invoice_items',
      displayName: 'Invoice Items',
      description: 'Line items within an invoice',
      isCore: true,
    },
    {
      name: 'invoice_payments',
      displayName: 'Invoice Payments',
      description: 'Payment records for invoices',
      isCore: true,
    },
  ],

  apiRoutes: [
    // Invoice CRUD Routes
    {
      method: 'GET',
      path: '/invoices',
      auth: true,
      handler: 'crud',
      entity: 'invoices',
      operation: 'list',
      description: 'List invoices with filters and pagination',
    },
    {
      method: 'POST',
      path: '/invoices',
      auth: true,
      handler: 'crud',
      entity: 'invoices',
      operation: 'create',
      description: 'Create a new invoice',
    },
    {
      method: 'GET',
      path: '/invoices/:id',
      auth: true,
      handler: 'crud',
      entity: 'invoices',
      operation: 'get',
      description: 'Get invoice details',
    },
    {
      method: 'PUT',
      path: '/invoices/:id',
      auth: true,
      handler: 'crud',
      entity: 'invoices',
      operation: 'update',
      description: 'Update an invoice',
    },
    {
      method: 'DELETE',
      path: '/invoices/:id',
      auth: true,
      handler: 'crud',
      entity: 'invoices',
      operation: 'delete',
      description: 'Delete an invoice',
    },

    // Custom Invoice Routes
    {
      method: 'POST',
      path: '/invoices/:id/send',
      auth: true,
      handler: 'custom',
      entity: 'invoices',
      description: 'Send invoice to client via email',
    },
    {
      method: 'GET',
      path: '/invoices/:id/pdf',
      auth: true,
      handler: 'custom',
      entity: 'invoices',
      description: 'Generate and download invoice PDF',
    },
    {
      method: 'POST',
      path: '/invoices/:id/duplicate',
      auth: true,
      handler: 'custom',
      entity: 'invoices',
      description: 'Duplicate an existing invoice',
    },
    {
      method: 'POST',
      path: '/invoices/:id/mark-paid',
      auth: true,
      handler: 'custom',
      entity: 'invoices',
      description: 'Mark invoice as fully paid',
    },
    {
      method: 'POST',
      path: '/invoices/:id/void',
      auth: true,
      handler: 'custom',
      entity: 'invoices',
      description: 'Void an invoice',
    },

    // Invoice Items Routes
    {
      method: 'GET',
      path: '/invoices/:invoiceId/items',
      auth: true,
      handler: 'crud',
      entity: 'invoice_items',
      operation: 'list',
      description: 'List items for an invoice',
    },
    {
      method: 'POST',
      path: '/invoices/:invoiceId/items',
      auth: true,
      handler: 'crud',
      entity: 'invoice_items',
      operation: 'create',
      description: 'Add item to invoice',
    },
    {
      method: 'PUT',
      path: '/invoices/:invoiceId/items/:id',
      auth: true,
      handler: 'crud',
      entity: 'invoice_items',
      operation: 'update',
      description: 'Update invoice item',
    },
    {
      method: 'DELETE',
      path: '/invoices/:invoiceId/items/:id',
      auth: true,
      handler: 'crud',
      entity: 'invoice_items',
      operation: 'delete',
      description: 'Remove item from invoice',
    },

    // Payment Routes
    {
      method: 'GET',
      path: '/invoices/:invoiceId/payments',
      auth: true,
      handler: 'crud',
      entity: 'invoice_payments',
      operation: 'list',
      description: 'List payments for an invoice',
    },
    {
      method: 'POST',
      path: '/invoices/:invoiceId/payments',
      auth: true,
      handler: 'crud',
      entity: 'invoice_payments',
      operation: 'create',
      description: 'Record a payment for an invoice',
    },
    {
      method: 'DELETE',
      path: '/invoices/:invoiceId/payments/:id',
      auth: true,
      handler: 'crud',
      entity: 'invoice_payments',
      operation: 'delete',
      description: 'Delete a payment record',
    },

    // Stats and Reports
    {
      method: 'GET',
      path: '/invoices/stats/summary',
      auth: true,
      handler: 'aggregate',
      entity: 'invoices',
      description: 'Get invoicing summary statistics',
    },
    {
      method: 'GET',
      path: '/invoices/stats/overdue',
      auth: true,
      handler: 'aggregate',
      entity: 'invoices',
      description: 'Get overdue invoices summary',
    },
  ],

  config: [
    {
      key: 'defaultDueDays',
      label: 'Default Due Days',
      type: 'number',
      default: 30,
      description: 'Number of days until invoice is due by default',
    },
    {
      key: 'invoicePrefix',
      label: 'Invoice Number Prefix',
      type: 'string',
      default: 'INV-',
      description: 'Prefix for invoice numbers (e.g., INV-001)',
    },
    {
      key: 'enableAutoReminders',
      label: 'Enable Auto Reminders',
      type: 'boolean',
      default: false,
      description: 'Automatically send payment reminders for overdue invoices',
    },
    {
      key: 'defaultCurrency',
      label: 'Default Currency',
      type: 'string',
      default: 'USD',
      description: 'Default currency for invoices',
    },
    {
      key: 'defaultTaxRate',
      label: 'Default Tax Rate (%)',
      type: 'number',
      default: 0,
      description: 'Default tax rate applied to invoice items',
    },
    {
      key: 'showPaymentInstructions',
      label: 'Show Payment Instructions',
      type: 'boolean',
      default: true,
      description: 'Display payment instructions on invoices',
    },
  ],
};
