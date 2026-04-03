import { Blueprint } from './blueprint.interface';

/**
 * Membership/Club Blueprint
 */
export const membershipBlueprint: Blueprint = {
  appType: 'membership',
  description: 'Membership and club management app with members, dues, events, and benefits',

  coreEntities: ['member', 'membership_plan', 'payment', 'event', 'benefit', 'activity'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Members', path: '/members', icon: 'Users' },
        { label: 'Plans', path: '/plans', icon: 'CreditCard' },
        { label: 'Payments', path: '/payments', icon: 'DollarSign' },
        { label: 'Events', path: '/events', icon: 'Calendar' },
        { label: 'Benefits', path: '/benefits', icon: 'Gift' },
      ]}},
      { id: 'membership-stats', component: 'membership-stats', position: 'main' },
      { id: 'member-growth', component: 'member-growth-chart', position: 'main' },
      { id: 'upcoming-renewals', component: 'renewal-list', entity: 'member', position: 'main' },
    ]},
    { path: '/members', name: 'Members', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'member-filters', component: 'member-filters-club', entity: 'member', position: 'main' },
      { id: 'member-table', component: 'member-table-club', entity: 'member', position: 'main' },
    ]},
    { path: '/members/:id', name: 'Member Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'member-profile', component: 'member-profile-club', entity: 'member', position: 'main' },
      { id: 'member-payments', component: 'member-payments', entity: 'payment', position: 'main' },
      { id: 'member-activity', component: 'member-activity', entity: 'activity', position: 'main' },
    ]},
    { path: '/plans', name: 'Membership Plans', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'plan-grid', component: 'membership-plan-grid', entity: 'membership_plan', position: 'main' },
    ]},
    { path: '/payments', name: 'Payments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'payment-table', component: 'payment-table-club', entity: 'payment', position: 'main' },
    ]},
    { path: '/events', name: 'Events', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'event-calendar', component: 'event-calendar-club', entity: 'event', position: 'main' },
    ]},
    { path: '/join', name: 'Join', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'join-form', component: 'join-form', entity: 'member', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/members', entity: 'member', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/members/:id', entity: 'member', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/members', entity: 'member', operation: 'create' },
    { method: 'PUT', path: '/members/:id', entity: 'member', operation: 'update', requiresAuth: true },
    { method: 'GET', path: '/plans', entity: 'membership_plan', operation: 'list' },
    { method: 'GET', path: '/payments', entity: 'payment', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/payments', entity: 'payment', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/events', entity: 'event', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    member: {
      defaultFields: [
        { name: 'member_number', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'join_date', type: 'date', required: true },
        { name: 'expiry_date', type: 'date' },
        { name: 'status', type: 'enum', required: true },
        { name: 'photo_url', type: 'image' },
        { name: 'address', type: 'json' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'membership_plan' },
        { type: 'hasMany', target: 'payment' },
      ],
    },
    membership_plan: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'duration_months', type: 'integer', required: true },
        { name: 'benefits', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [{ type: 'hasMany', target: 'member' }],
    },
    payment: {
      defaultFields: [
        { name: 'amount', type: 'decimal', required: true },
        { name: 'payment_date', type: 'date', required: true },
        { name: 'payment_method', type: 'enum' },
        { name: 'transaction_id', type: 'string' },
        { name: 'status', type: 'enum' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [{ type: 'belongsTo', target: 'member' }],
    },
  },
};

export default membershipBlueprint;
