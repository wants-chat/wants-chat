/**
 * Workflow Feature Definition
 *
 * Workflow automation, approval processes, and business
 * process management with triggers and actions.
 */

import { FeatureDefinition } from '../../interfaces/feature.interface';

export const WORKFLOW_FEATURE: FeatureDefinition = {
  id: 'workflow',
  name: 'Workflow',
  category: 'business',
  description: 'Workflow automation with approvals, triggers, and actions',
  icon: 'git-branch',

  includedInAppTypes: [
    'enterprise',
    'hr-management',
    'project-management',
    'crm',
    'erp',
    'legal',
    'finance',
    'procurement',
    'document-management',
  ],

  activationKeywords: [
    'workflow',
    'automation',
    'approvals',
    'approval workflow',
    'business process',
    'triggers',
    'zapier',
    'n8n',
    'automate',
  ],

  enabledByDefault: false,
  optional: true,

  dependencies: ['user-auth'],
  conflicts: [],

  pages: [
    {
      id: 'workflows-list',
      route: '/workflows',
      section: 'frontend',
      title: 'Workflows',
      authRequired: true,
      templateId: 'workflows-list',
      components: [
        'workflows-grid',
        'workflow-card',
        'status-filter',
        'create-workflow-button',
      ],
      layout: 'default',
    },
    {
      id: 'workflow-builder',
      route: '/workflows/:id/edit',
      section: 'frontend',
      title: 'Workflow Builder',
      authRequired: true,
      templateId: 'workflow-builder',
      components: [
        'workflow-canvas',
        'node-palette',
        'node-config',
        'trigger-picker',
        'action-picker',
      ],
      layout: 'fullscreen',
    },
    {
      id: 'my-approvals',
      route: '/approvals',
      section: 'frontend',
      title: 'My Approvals',
      authRequired: true,
      templateId: 'my-approvals',
      components: [
        'pending-approvals',
        'approval-card',
        'approval-history',
      ],
      layout: 'default',
    },
    {
      id: 'workflow-runs',
      route: '/workflows/:id/runs',
      section: 'frontend',
      title: 'Run History',
      authRequired: true,
      templateId: 'workflow-runs',
      components: [
        'runs-table',
        'run-detail',
        'run-logs',
      ],
      layout: 'default',
    },
  ],

  components: [
    // List
    'workflows-grid',
    'workflow-card',
    'status-filter',
    'create-workflow-button',

    // Builder
    'workflow-canvas',
    'node-palette',
    'node-config',
    'trigger-picker',
    'action-picker',
    'condition-builder',
    'connection-line',

    // Approvals
    'pending-approvals',
    'approval-card',
    'approval-history',
    'approve-button',
    'reject-button',

    // Runs
    'runs-table',
    'run-detail',
    'run-logs',
    'run-status',
  ],

  entities: [
    {
      name: 'workflows',
      displayName: 'Workflows',
      description: 'Workflow definitions',
      isCore: true,
    },
    {
      name: 'workflow_runs',
      displayName: 'Workflow Runs',
      description: 'Execution history',
      isCore: true,
    },
    {
      name: 'approval_requests',
      displayName: 'Approvals',
      description: 'Pending approvals',
      isCore: false,
    },
  ],

  apiRoutes: [
    {
      method: 'GET',
      path: '/workflows',
      auth: true,
      handler: 'crud',
      entity: 'workflows',
      description: 'List workflows',
    },
    {
      method: 'GET',
      path: '/workflows/:id',
      auth: true,
      handler: 'crud',
      entity: 'workflows',
      description: 'Get workflow',
    },
    {
      method: 'POST',
      path: '/workflows',
      auth: true,
      handler: 'crud',
      entity: 'workflows',
      description: 'Create workflow',
    },
    {
      method: 'PUT',
      path: '/workflows/:id',
      auth: true,
      handler: 'crud',
      entity: 'workflows',
      description: 'Update workflow',
    },
    {
      method: 'DELETE',
      path: '/workflows/:id',
      auth: true,
      handler: 'crud',
      entity: 'workflows',
      description: 'Delete workflow',
    },
    {
      method: 'POST',
      path: '/workflows/:id/activate',
      auth: true,
      handler: 'custom',
      entity: 'workflows',
      description: 'Activate workflow',
    },
    {
      method: 'POST',
      path: '/workflows/:id/run',
      auth: true,
      handler: 'custom',
      entity: 'workflow_runs',
      description: 'Run workflow',
    },
    {
      method: 'GET',
      path: '/workflows/:id/runs',
      auth: true,
      handler: 'crud',
      entity: 'workflow_runs',
      description: 'Get run history',
    },
    {
      method: 'GET',
      path: '/approvals',
      auth: true,
      handler: 'crud',
      entity: 'approval_requests',
      description: 'List approvals',
    },
    {
      method: 'POST',
      path: '/approvals/:id/approve',
      auth: true,
      handler: 'custom',
      entity: 'approval_requests',
      description: 'Approve request',
    },
    {
      method: 'POST',
      path: '/approvals/:id/reject',
      auth: true,
      handler: 'custom',
      entity: 'approval_requests',
      description: 'Reject request',
    },
  ],

  config: [
    {
      key: 'maxActiveWorkflows',
      label: 'Max Active Workflows',
      type: 'number',
      default: 50,
      description: 'Maximum active workflows',
    },
    {
      key: 'runRetentionDays',
      label: 'Run History Retention (days)',
      type: 'number',
      default: 90,
      description: 'Days to keep run history',
    },
    {
      key: 'approvalTimeoutHours',
      label: 'Approval Timeout (hours)',
      type: 'number',
      default: 72,
      description: 'Hours before approval expires',
    },
    {
      key: 'enableWebhooks',
      label: 'Enable Webhooks',
      type: 'boolean',
      default: true,
      description: 'Allow webhook triggers',
    },
  ],
};
