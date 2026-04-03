import { Blueprint } from './blueprint.interface';

/**
 * Freelance Marketplace Blueprint
 */
export const freelanceBlueprint: Blueprint = {
  appType: 'freelance',
  description: 'Freelance marketplace with gigs, proposals, contracts, and payments',

  coreEntities: ['gig', 'proposal', 'contract', 'freelancer', 'client', 'review', 'payment'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Find Work', layout: 'dashboard', requiresAuth: false, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Find Work', path: '/', icon: 'Search' },
        { label: 'My Proposals', path: '/proposals', icon: 'FileText' },
        { label: 'Contracts', path: '/contracts', icon: 'File' },
        { label: 'Messages', path: '/messages', icon: 'MessageSquare' },
        { label: 'Profile', path: '/profile', icon: 'User' },
      ]}},
      { id: 'gig-filters', component: 'gig-filters', entity: 'gig', position: 'main' },
      { id: 'gig-list', component: 'gig-list', entity: 'gig', position: 'main' },
    ]},
    { path: '/gigs/:id', name: 'Gig Detail', layout: 'dashboard', requiresAuth: false, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'gig-detail', component: 'gig-detail', entity: 'gig', position: 'main' },
      { id: 'submit-proposal', component: 'proposal-form', entity: 'proposal', position: 'main' },
    ]},
    { path: '/proposals', name: 'My Proposals', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'proposal-list', component: 'proposal-list', entity: 'proposal', position: 'main' },
    ]},
    { path: '/contracts', name: 'Contracts', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'contract-list', component: 'contract-list', entity: 'contract', position: 'main' },
    ]},
    { path: '/contracts/:id', name: 'Contract Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'contract-detail', component: 'contract-detail', entity: 'contract', position: 'main' },
      { id: 'milestones', component: 'milestone-list', entity: 'contract', position: 'main' },
    ]},
    { path: '/freelancers/:id', name: 'Freelancer Profile', layout: 'dashboard', requiresAuth: false, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'freelancer-profile', component: 'freelancer-profile', entity: 'freelancer', position: 'main' },
      { id: 'portfolio', component: 'portfolio-grid', entity: 'freelancer', position: 'main' },
      { id: 'reviews', component: 'review-list', entity: 'review', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/gigs', entity: 'gig', operation: 'list' },
    { method: 'GET', path: '/gigs/:id', entity: 'gig', operation: 'get' },
    { method: 'POST', path: '/gigs', entity: 'gig', operation: 'create', requiresAuth: true },
    { method: 'POST', path: '/proposals', entity: 'proposal', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/proposals', entity: 'proposal', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/contracts', entity: 'contract', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/contracts', entity: 'contract', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/freelancers/:id', entity: 'freelancer', operation: 'get' },
  ],

  entityConfig: {
    gig: {
      defaultFields: [
        { name: 'title', type: 'string', required: true },
        { name: 'description', type: 'text', required: true },
        { name: 'budget_min', type: 'decimal' },
        { name: 'budget_max', type: 'decimal' },
        { name: 'budget_type', type: 'enum' },
        { name: 'skills', type: 'json' },
        { name: 'duration', type: 'string' },
        { name: 'experience_level', type: 'enum' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'hasMany', target: 'proposal' },
      ],
    },
    proposal: {
      defaultFields: [
        { name: 'cover_letter', type: 'text', required: true },
        { name: 'bid_amount', type: 'decimal', required: true },
        { name: 'estimated_duration', type: 'string' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'gig' },
        { type: 'belongsTo', target: 'freelancer' },
      ],
    },
    contract: {
      defaultFields: [
        { name: 'title', type: 'string', required: true },
        { name: 'amount', type: 'decimal', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'start_date', type: 'date' },
        { name: 'end_date', type: 'date' },
        { name: 'milestones', type: 'json' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'freelancer' },
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'gig' },
      ],
    },
  },
};

export default freelanceBlueprint;
