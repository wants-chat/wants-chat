import { Blueprint } from './blueprint.interface';

/**
 * Survey/Poll Blueprint
 */
export const surveyBlueprint: Blueprint = {
  appType: 'survey',
  description: 'Survey and poll app with forms, responses, analytics, and reporting',

  coreEntities: ['survey', 'question', 'response', 'answer', 'respondent', 'report'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Surveys', path: '/surveys', icon: 'ClipboardList' },
        { label: 'Responses', path: '/responses', icon: 'MessageSquare' },
        { label: 'Analytics', path: '/analytics', icon: 'BarChart' },
        { label: 'Templates', path: '/templates', icon: 'FileText' },
      ]}},
      { id: 'survey-stats', component: 'survey-stats', position: 'main' },
      { id: 'recent-surveys', component: 'survey-list', entity: 'survey', position: 'main', props: { title: 'Recent Surveys' }},
      { id: 'response-chart', component: 'response-chart', position: 'main' },
    ]},
    { path: '/surveys', name: 'Surveys', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'survey-filters', component: 'survey-filters', entity: 'survey', position: 'main' },
      { id: 'survey-grid', component: 'survey-grid', entity: 'survey', position: 'main' },
    ]},
    { path: '/surveys/new', name: 'Create Survey', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'survey-builder', component: 'survey-builder', entity: 'survey', position: 'main' },
    ]},
    { path: '/surveys/:id', name: 'Survey Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'survey-header', component: 'survey-header', entity: 'survey', position: 'main' },
      { id: 'question-list', component: 'question-list', entity: 'question', position: 'main' },
      { id: 'survey-settings', component: 'survey-settings', entity: 'survey', position: 'main' },
    ]},
    { path: '/surveys/:id/edit', name: 'Edit Survey', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'survey-editor', component: 'survey-editor', entity: 'survey', position: 'main' },
    ]},
    { path: '/surveys/:id/responses', name: 'Survey Responses', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'response-table', component: 'response-table', entity: 'response', position: 'main' },
      { id: 'response-summary', component: 'response-summary', entity: 'response', position: 'main' },
    ]},
    { path: '/s/:slug', name: 'Take Survey', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'survey-form', component: 'survey-form', entity: 'survey', position: 'main' },
    ]},
    { path: '/analytics', name: 'Analytics', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'analytics-overview', component: 'analytics-overview', position: 'main' },
      { id: 'question-analytics', component: 'question-analytics', entity: 'question', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/surveys', entity: 'survey', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/surveys/:id', entity: 'survey', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/surveys', entity: 'survey', operation: 'create', requiresAuth: true },
    { method: 'PUT', path: '/surveys/:id', entity: 'survey', operation: 'update', requiresAuth: true },
    { method: 'DELETE', path: '/surveys/:id', entity: 'survey', operation: 'delete', requiresAuth: true },
    { method: 'GET', path: '/surveys/:id/responses', entity: 'response', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/surveys/:id/responses', entity: 'response', operation: 'create' },
    { method: 'GET', path: '/surveys/:id/analytics', entity: 'survey', operation: 'custom', requiresAuth: true },
    { method: 'GET', path: '/public/surveys/:slug', entity: 'survey', operation: 'get' },
  ],

  entityConfig: {
    survey: {
      defaultFields: [
        { name: 'title', type: 'string', required: true },
        { name: 'slug', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'status', type: 'enum', required: true },
        { name: 'type', type: 'enum' },
        { name: 'start_date', type: 'datetime' },
        { name: 'end_date', type: 'datetime' },
        { name: 'is_anonymous', type: 'boolean' },
        { name: 'requires_login', type: 'boolean' },
        { name: 'max_responses', type: 'integer' },
        { name: 'response_count', type: 'integer' },
        { name: 'settings', type: 'json' },
      ],
      relationships: [
        { type: 'hasMany', target: 'question' },
        { type: 'hasMany', target: 'response' },
      ],
    },
    question: {
      defaultFields: [
        { name: 'text', type: 'string', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'required', type: 'boolean' },
        { name: 'order', type: 'integer' },
        { name: 'options', type: 'json' },
        { name: 'validation', type: 'json' },
        { name: 'logic', type: 'json' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'survey' },
        { type: 'hasMany', target: 'answer' },
      ],
    },
    response: {
      defaultFields: [
        { name: 'started_at', type: 'datetime', required: true },
        { name: 'completed_at', type: 'datetime' },
        { name: 'ip_address', type: 'string' },
        { name: 'user_agent', type: 'string' },
        { name: 'metadata', type: 'json' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'survey' },
        { type: 'belongsTo', target: 'respondent' },
        { type: 'hasMany', target: 'answer' },
      ],
    },
  },
};

export default surveyBlueprint;
