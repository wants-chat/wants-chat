import { Blueprint } from './blueprint.interface';

/**
 * Museum Blueprint
 */
export const museumBlueprint: Blueprint = {
  appType: 'museum',
  description: 'Museum app with exhibitions, collections, tours, events, and memberships',

  coreEntities: ['exhibition', 'artifact', 'tour', 'event', 'membership', 'ticket'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Exhibitions', path: '/exhibitions', icon: 'Image' },
        { label: 'Collections', path: '/collections', icon: 'Archive' },
        { label: 'Tours', path: '/tours', icon: 'Map' },
        { label: 'Events', path: '/events', icon: 'Calendar' },
        { label: 'Members', path: '/members', icon: 'Users' },
        { label: 'Tickets', path: '/tickets', icon: 'Ticket' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'upcoming-events', component: 'appointment-list', entity: 'event', position: 'main' },
    ]},
    { path: '/exhibitions', name: 'Exhibitions', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'exhibition-grid', component: 'product-grid', entity: 'exhibition', position: 'main' },
    ]},
    { path: '/collections', name: 'Collections', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'filters', component: 'filter-form', entity: 'artifact', position: 'main' },
      { id: 'artifact-grid', component: 'product-grid', entity: 'artifact', position: 'main' },
    ]},
    { path: '/tours', name: 'Tours', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'tour-calendar', component: 'appointment-calendar', entity: 'tour', position: 'main' },
      { id: 'tour-table', component: 'data-table', entity: 'tour', position: 'main' },
    ]},
    { path: '/events', name: 'Events', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'event-calendar', component: 'appointment-calendar', entity: 'event', position: 'main' },
    ]},
    { path: '/members', name: 'Members', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'member-table', component: 'data-table', entity: 'membership', position: 'main' },
    ]},
    { path: '/tickets', name: 'Tickets', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'ticket-table', component: 'data-table', entity: 'ticket', position: 'main' },
    ]},
    { path: '/visit', name: 'Plan Your Visit', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'exhibition-grid', component: 'product-grid', entity: 'exhibition', position: 'main' },
    ]},
    { path: '/buy-tickets', name: 'Buy Tickets', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'ticket-form', component: 'booking-wizard', entity: 'ticket', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/exhibitions', entity: 'exhibition', operation: 'list' },
    { method: 'POST', path: '/exhibitions', entity: 'exhibition', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/collections', entity: 'artifact', operation: 'list' },
    { method: 'POST', path: '/collections', entity: 'artifact', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/tours', entity: 'tour', operation: 'list' },
    { method: 'POST', path: '/tours', entity: 'tour', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/events', entity: 'event', operation: 'list' },
    { method: 'GET', path: '/members', entity: 'membership', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/members', entity: 'membership', operation: 'create' },
    { method: 'GET', path: '/tickets', entity: 'ticket', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/tickets', entity: 'ticket', operation: 'create' },
  ],

  entityConfig: {
    exhibition: {
      defaultFields: [
        { name: 'exhibition_name', type: 'string', required: true },
        { name: 'exhibition_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'curator', type: 'string' },
        { name: 'start_date', type: 'date', required: true },
        { name: 'end_date', type: 'date' },
        { name: 'gallery', type: 'string' },
        { name: 'featured_artifacts', type: 'json' },
        { name: 'themes', type: 'json' },
        { name: 'audio_guide', type: 'boolean' },
        { name: 'special_requirements', type: 'json' },
        { name: 'image_url', type: 'image' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'hasMany', target: 'artifact' },
        { type: 'hasMany', target: 'tour' },
      ],
    },
    artifact: {
      defaultFields: [
        { name: 'accession_number', type: 'string', required: true },
        { name: 'artifact_name', type: 'string', required: true },
        { name: 'category', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'artist_creator', type: 'string' },
        { name: 'date_created', type: 'string' },
        { name: 'period', type: 'string' },
        { name: 'origin', type: 'string' },
        { name: 'medium', type: 'string' },
        { name: 'dimensions', type: 'json' },
        { name: 'provenance', type: 'text' },
        { name: 'acquisition_date', type: 'date' },
        { name: 'acquisition_method', type: 'enum' },
        { name: 'donor', type: 'string' },
        { name: 'condition', type: 'enum' },
        { name: 'location', type: 'string' },
        { name: 'on_display', type: 'boolean' },
        { name: 'images', type: 'json' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'exhibition' },
      ],
    },
    tour: {
      defaultFields: [
        { name: 'tour_name', type: 'string', required: true },
        { name: 'tour_type', type: 'enum', required: true },
        { name: 'tour_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'duration', type: 'integer' },
        { name: 'guide', type: 'string' },
        { name: 'language', type: 'string' },
        { name: 'capacity', type: 'integer' },
        { name: 'registered', type: 'integer' },
        { name: 'meeting_point', type: 'string' },
        { name: 'fee', type: 'decimal' },
        { name: 'member_fee', type: 'decimal' },
        { name: 'description', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'exhibition' },
      ],
    },
    event: {
      defaultFields: [
        { name: 'event_name', type: 'string', required: true },
        { name: 'event_type', type: 'enum', required: true },
        { name: 'event_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'location', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'speaker', type: 'string' },
        { name: 'capacity', type: 'integer' },
        { name: 'registered', type: 'integer' },
        { name: 'fee', type: 'decimal' },
        { name: 'member_fee', type: 'decimal' },
        { name: 'image_url', type: 'image' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
    membership: {
      defaultFields: [
        { name: 'member_number', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'membership_type', type: 'enum', required: true },
        { name: 'start_date', type: 'date', required: true },
        { name: 'expiry_date', type: 'date' },
        { name: 'additional_members', type: 'json' },
        { name: 'auto_renew', type: 'boolean' },
        { name: 'benefits', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
    ticket: {
      defaultFields: [
        { name: 'ticket_number', type: 'string', required: true },
        { name: 'purchase_date', type: 'date', required: true },
        { name: 'visit_date', type: 'date', required: true },
        { name: 'ticket_type', type: 'enum', required: true },
        { name: 'visitor_name', type: 'string' },
        { name: 'email', type: 'email' },
        { name: 'adult_count', type: 'integer' },
        { name: 'child_count', type: 'integer' },
        { name: 'senior_count', type: 'integer' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'discount', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'payment_method', type: 'enum' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
  },
};

export default museumBlueprint;
