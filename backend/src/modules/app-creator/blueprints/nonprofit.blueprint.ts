import { Blueprint } from './blueprint.interface';

/**
 * Nonprofit/Charity Blueprint
 */
export const nonprofitBlueprint: Blueprint = {
  appType: 'nonprofit',
  description: 'Nonprofit organization app with donations, volunteers, campaigns, and events',

  coreEntities: ['donation', 'donor', 'volunteer', 'campaign', 'event', 'program', 'grant'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Donations', path: '/donations', icon: 'Heart' },
        { label: 'Donors', path: '/donors', icon: 'Users' },
        { label: 'Campaigns', path: '/campaigns', icon: 'Target' },
        { label: 'Volunteers', path: '/volunteers', icon: 'HandHeart' },
        { label: 'Events', path: '/events', icon: 'Calendar' },
        { label: 'Programs', path: '/programs', icon: 'Briefcase' },
      ]}},
      { id: 'nonprofit-stats', component: 'nonprofit-stats', position: 'main' },
      { id: 'donation-chart', component: 'donation-chart', position: 'main' },
      { id: 'active-campaigns', component: 'campaign-list-nonprofit', entity: 'campaign', position: 'main' },
    ]},
    { path: '/donations', name: 'Donations', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'donation-filters', component: 'donation-filters-nonprofit', entity: 'donation', position: 'main' },
      { id: 'donation-table', component: 'donation-table-nonprofit', entity: 'donation', position: 'main' },
    ]},
    { path: '/donors', name: 'Donors', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'donor-table', component: 'donor-table', entity: 'donor', position: 'main' },
    ]},
    { path: '/donors/:id', name: 'Donor Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'donor-profile', component: 'donor-profile', entity: 'donor', position: 'main' },
      { id: 'donor-history', component: 'donor-history', entity: 'donation', position: 'main' },
    ]},
    { path: '/campaigns', name: 'Campaigns', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'campaign-grid', component: 'campaign-grid-nonprofit', entity: 'campaign', position: 'main' },
    ]},
    { path: '/campaigns/:id', name: 'Campaign Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'campaign-header', component: 'campaign-header-nonprofit', entity: 'campaign', position: 'main' },
      { id: 'campaign-progress', component: 'campaign-progress-nonprofit', entity: 'campaign', position: 'main' },
      { id: 'campaign-donors', component: 'campaign-donors', entity: 'donor', position: 'main' },
    ]},
    { path: '/volunteers', name: 'Volunteers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'volunteer-table', component: 'volunteer-table', entity: 'volunteer', position: 'main' },
    ]},
    { path: '/donate', name: 'Donate', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'donate-form', component: 'donate-form', entity: 'donation', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/donations', entity: 'donation', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/donations', entity: 'donation', operation: 'create' },
    { method: 'GET', path: '/donors', entity: 'donor', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/donors/:id', entity: 'donor', operation: 'get', requiresAuth: true },
    { method: 'GET', path: '/campaigns', entity: 'campaign', operation: 'list' },
    { method: 'GET', path: '/campaigns/:id', entity: 'campaign', operation: 'get' },
    { method: 'POST', path: '/campaigns', entity: 'campaign', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/volunteers', entity: 'volunteer', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/volunteers', entity: 'volunteer', operation: 'create' },
  ],

  entityConfig: {
    donation: {
      defaultFields: [
        { name: 'amount', type: 'decimal', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'payment_method', type: 'enum' },
        { name: 'transaction_id', type: 'string' },
        { name: 'is_recurring', type: 'boolean' },
        { name: 'frequency', type: 'enum' },
        { name: 'designation', type: 'string' },
        { name: 'is_anonymous', type: 'boolean' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'donor' },
        { type: 'belongsTo', target: 'campaign' },
      ],
    },
    donor: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'total_donated', type: 'decimal' },
        { name: 'donation_count', type: 'integer' },
        { name: 'first_donation_date', type: 'date' },
        { name: 'last_donation_date', type: 'date' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [{ type: 'hasMany', target: 'donation' }],
    },
    campaign: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'goal_amount', type: 'decimal', required: true },
        { name: 'raised_amount', type: 'decimal' },
        { name: 'start_date', type: 'date' },
        { name: 'end_date', type: 'date' },
        { name: 'status', type: 'enum' },
        { name: 'image_url', type: 'image' },
      ],
      relationships: [{ type: 'hasMany', target: 'donation' }],
    },
    volunteer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'skills', type: 'json' },
        { name: 'availability', type: 'json' },
        { name: 'hours_logged', type: 'decimal' },
        { name: 'status', type: 'enum' },
      ],
      relationships: [],
    },
  },
};

export default nonprofitBlueprint;
