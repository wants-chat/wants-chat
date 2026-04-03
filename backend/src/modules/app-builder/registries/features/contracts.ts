/**
 * Contracts Feature Definition
 *
 * Contract management with templates, e-signatures,
 * and document tracking.
 */

import { FeatureDefinition } from '../../interfaces/feature.interface';

export const CONTRACTS_FEATURE: FeatureDefinition = {
  id: 'contracts',
  name: 'Contracts',
  category: 'business',
  description: 'Contract management with templates and e-signatures',
  icon: 'file-signature',

  includedInAppTypes: [
    'legal',
    'agency',
    'consulting',
    'freelance',
    'real-estate',
    'hr-management',
    'procurement',
    'sales',
    'b2b-saas',
  ],

  activationKeywords: [
    'contracts',
    'contract management',
    'e-signature',
    'electronic signature',
    'docusign',
    'hellosign',
    'agreements',
    'legal documents',
    'proposals',
  ],

  enabledByDefault: false,
  optional: true,

  dependencies: ['user-auth'],
  conflicts: [],

  pages: [
    {
      id: 'contracts-list',
      route: '/contracts',
      section: 'frontend',
      title: 'Contracts',
      authRequired: true,
      templateId: 'contracts-list',
      components: [
        'contracts-table',
        'contract-card',
        'status-filter',
        'create-contract-button',
      ],
      layout: 'default',
    },
    {
      id: 'contract-detail',
      route: '/contracts/:id',
      section: 'frontend',
      title: 'Contract',
      authRequired: true,
      templateId: 'contract-detail',
      components: [
        'contract-header',
        'contract-viewer',
        'signature-status',
        'audit-trail',
        'contract-actions',
      ],
      layout: 'default',
    },
    {
      id: 'contract-editor',
      route: '/contracts/:id/edit',
      section: 'frontend',
      title: 'Edit Contract',
      authRequired: true,
      templateId: 'contract-editor',
      components: [
        'document-editor',
        'variable-fields',
        'signature-placements',
        'recipient-picker',
      ],
      layout: 'default',
    },
    {
      id: 'sign-contract',
      route: '/sign/:token',
      section: 'frontend',
      title: 'Sign Contract',
      authRequired: false,
      templateId: 'sign-contract',
      components: [
        'document-viewer',
        'signature-pad',
        'initial-fields',
        'date-fields',
        'submit-signature',
      ],
      layout: 'minimal',
    },
    {
      id: 'templates-list',
      route: '/contracts/templates',
      section: 'frontend',
      title: 'Templates',
      authRequired: true,
      templateId: 'templates-list',
      components: [
        'templates-grid',
        'template-card',
        'create-template-button',
      ],
      layout: 'default',
    },
  ],

  components: [
    // List
    'contracts-table',
    'contract-card',
    'status-filter',
    'create-contract-button',

    // Detail
    'contract-header',
    'contract-viewer',
    'signature-status',
    'audit-trail',
    'contract-actions',

    // Editor
    'document-editor',
    'variable-fields',
    'signature-placements',
    'recipient-picker',

    // Signing
    'signature-pad',
    'initial-fields',
    'date-fields',
    'submit-signature',

    // Templates
    'templates-grid',
    'template-card',
    'create-template-button',
    'template-editor',
  ],

  entities: [
    {
      name: 'contracts',
      displayName: 'Contracts',
      description: 'Contract documents',
      isCore: true,
    },
    {
      name: 'contract_templates',
      displayName: 'Templates',
      description: 'Contract templates',
      isCore: true,
    },
    {
      name: 'signatures',
      displayName: 'Signatures',
      description: 'E-signatures',
      isCore: true,
    },
    {
      name: 'contract_audit',
      displayName: 'Audit Trail',
      description: 'Activity log',
      isCore: false,
    },
  ],

  apiRoutes: [
    {
      method: 'GET',
      path: '/contracts',
      auth: true,
      handler: 'crud',
      entity: 'contracts',
      description: 'List contracts',
    },
    {
      method: 'GET',
      path: '/contracts/:id',
      auth: true,
      handler: 'crud',
      entity: 'contracts',
      description: 'Get contract',
    },
    {
      method: 'POST',
      path: '/contracts',
      auth: true,
      handler: 'crud',
      entity: 'contracts',
      description: 'Create contract',
    },
    {
      method: 'PUT',
      path: '/contracts/:id',
      auth: true,
      handler: 'crud',
      entity: 'contracts',
      description: 'Update contract',
    },
    {
      method: 'DELETE',
      path: '/contracts/:id',
      auth: true,
      handler: 'crud',
      entity: 'contracts',
      description: 'Delete contract',
    },
    {
      method: 'POST',
      path: '/contracts/:id/send',
      auth: true,
      handler: 'custom',
      entity: 'contracts',
      description: 'Send for signature',
    },
    {
      method: 'GET',
      path: '/sign/:token',
      auth: false,
      handler: 'custom',
      entity: 'contracts',
      description: 'Get contract for signing',
    },
    {
      method: 'POST',
      path: '/sign/:token',
      auth: false,
      handler: 'custom',
      entity: 'signatures',
      description: 'Submit signature',
    },
    {
      method: 'GET',
      path: '/contract-templates',
      auth: true,
      handler: 'crud',
      entity: 'contract_templates',
      description: 'List templates',
    },
    {
      method: 'POST',
      path: '/contract-templates',
      auth: true,
      handler: 'crud',
      entity: 'contract_templates',
      description: 'Create template',
    },
    {
      method: 'POST',
      path: '/contracts/:id/void',
      auth: true,
      handler: 'custom',
      entity: 'contracts',
      description: 'Void contract',
    },
    {
      method: 'GET',
      path: '/contracts/:id/audit',
      auth: true,
      handler: 'crud',
      entity: 'contract_audit',
      description: 'Get audit trail',
    },
  ],

  config: [
    {
      key: 'expirationDays',
      label: 'Signature Expiration (days)',
      type: 'number',
      default: 14,
      description: 'Days until signature request expires',
    },
    {
      key: 'reminderFrequency',
      label: 'Reminder Frequency (days)',
      type: 'number',
      default: 3,
      description: 'Days between reminders',
    },
    {
      key: 'allowDownload',
      label: 'Allow PDF Download',
      type: 'boolean',
      default: true,
      description: 'Allow downloading signed PDFs',
    },
    {
      key: 'requireAuthentication',
      label: 'Require Signer Authentication',
      type: 'boolean',
      default: false,
      description: 'Verify signer identity',
    },
  ],
};
