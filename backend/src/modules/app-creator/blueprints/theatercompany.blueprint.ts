import { Blueprint } from './blueprint.interface';

/**
 * Theater Company Blueprint
 */
export const theatercompanyBlueprint: Blueprint = {
  appType: 'theatercompany',
  description: 'Theater company app with productions, performances, tickets, and subscriptions',

  coreEntities: ['production', 'performance', 'ticket', 'subscription', 'cast_member', 'venue'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Productions', path: '/productions', icon: 'Theater' },
        { label: 'Performances', path: '/performances', icon: 'Calendar' },
        { label: 'Tickets', path: '/tickets', icon: 'Ticket' },
        { label: 'Subscribers', path: '/subscribers', icon: 'Users' },
        { label: 'Cast & Crew', path: '/cast', icon: 'UserCheck' },
        { label: 'Venues', path: '/venues', icon: 'Building' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'upcoming-performances', component: 'appointment-list', entity: 'performance', position: 'main' },
    ]},
    { path: '/productions', name: 'Productions', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'production-grid', component: 'product-grid', entity: 'production', position: 'main' },
    ]},
    { path: '/performances', name: 'Performances', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'performance-calendar', component: 'appointment-calendar', entity: 'performance', position: 'main' },
    ]},
    { path: '/tickets', name: 'Tickets', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'ticket-table', component: 'data-table', entity: 'ticket', position: 'main' },
    ]},
    { path: '/subscribers', name: 'Subscribers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'subscriber-table', component: 'data-table', entity: 'subscription', position: 'main' },
    ]},
    { path: '/cast', name: 'Cast & Crew', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'cast-grid', component: 'staff-grid', entity: 'cast_member', position: 'main' },
    ]},
    { path: '/venues', name: 'Venues', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'venue-grid', component: 'product-grid', entity: 'venue', position: 'main' },
    ]},
    { path: '/shows', name: 'Current Season', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'production-grid', component: 'product-grid', entity: 'production', position: 'main' },
    ]},
    { path: '/buy-tickets', name: 'Buy Tickets', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'ticket-form', component: 'booking-wizard', entity: 'ticket', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/productions', entity: 'production', operation: 'list' },
    { method: 'POST', path: '/productions', entity: 'production', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/performances', entity: 'performance', operation: 'list' },
    { method: 'POST', path: '/performances', entity: 'performance', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/tickets', entity: 'ticket', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/tickets', entity: 'ticket', operation: 'create' },
    { method: 'GET', path: '/subscribers', entity: 'subscription', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/subscribers', entity: 'subscription', operation: 'create' },
    { method: 'GET', path: '/cast', entity: 'cast_member', operation: 'list' },
    { method: 'GET', path: '/venues', entity: 'venue', operation: 'list' },
  ],

  entityConfig: {
    production: {
      defaultFields: [
        { name: 'production_name', type: 'string', required: true },
        { name: 'playwright', type: 'string' },
        { name: 'director', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'genre', type: 'enum' },
        { name: 'rating', type: 'enum' },
        { name: 'runtime', type: 'integer' },
        { name: 'intermissions', type: 'integer' },
        { name: 'opening_night', type: 'date' },
        { name: 'closing_night', type: 'date' },
        { name: 'content_advisory', type: 'text' },
        { name: 'cast', type: 'json' },
        { name: 'creative_team', type: 'json' },
        { name: 'sponsors', type: 'json' },
        { name: 'poster_url', type: 'image' },
        { name: 'photos', type: 'json' },
        { name: 'trailer_url', type: 'string' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'hasMany', target: 'performance' },
        { type: 'belongsTo', target: 'venue' },
      ],
    },
    performance: {
      defaultFields: [
        { name: 'performance_date', type: 'date', required: true },
        { name: 'performance_time', type: 'datetime', required: true },
        { name: 'performance_type', type: 'enum' },
        { name: 'total_seats', type: 'integer' },
        { name: 'available_seats', type: 'integer' },
        { name: 'tickets_sold', type: 'integer' },
        { name: 'revenue', type: 'decimal' },
        { name: 'special_event', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'production' },
        { type: 'belongsTo', target: 'venue' },
        { type: 'hasMany', target: 'ticket' },
      ],
    },
    ticket: {
      defaultFields: [
        { name: 'ticket_number', type: 'string', required: true },
        { name: 'purchase_date', type: 'date', required: true },
        { name: 'customer_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'section', type: 'string' },
        { name: 'row', type: 'string' },
        { name: 'seats', type: 'json' },
        { name: 'ticket_type', type: 'enum' },
        { name: 'quantity', type: 'integer', required: true },
        { name: 'price_per_ticket', type: 'decimal' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'fees', type: 'decimal' },
        { name: 'discount', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'payment_method', type: 'enum' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'performance' },
        { type: 'belongsTo', target: 'subscription' },
      ],
    },
    subscription: {
      defaultFields: [
        { name: 'subscriber_number', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'subscription_type', type: 'enum', required: true },
        { name: 'season', type: 'string' },
        { name: 'seats_preference', type: 'json' },
        { name: 'day_preference', type: 'enum' },
        { name: 'price', type: 'decimal' },
        { name: 'payment_status', type: 'enum' },
        { name: 'benefits', type: 'json' },
        { name: 'renewal_date', type: 'date' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'ticket' },
      ],
    },
    cast_member: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'stage_name', type: 'string' },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'role_type', type: 'enum', required: true },
        { name: 'roles', type: 'json' },
        { name: 'bio', type: 'text' },
        { name: 'headshot_url', type: 'image' },
        { name: 'resume_url', type: 'string' },
        { name: 'union_affiliation', type: 'string' },
        { name: 'emergency_contact', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
    venue: {
      defaultFields: [
        { name: 'venue_name', type: 'string', required: true },
        { name: 'venue_type', type: 'enum' },
        { name: 'address', type: 'json', required: true },
        { name: 'seating_capacity', type: 'integer' },
        { name: 'seating_chart', type: 'json' },
        { name: 'sections', type: 'json' },
        { name: 'accessibility', type: 'json' },
        { name: 'amenities', type: 'json' },
        { name: 'technical_specs', type: 'json' },
        { name: 'rental_rate', type: 'decimal' },
        { name: 'contact_name', type: 'string' },
        { name: 'contact_phone', type: 'phone' },
        { name: 'photos', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'production' },
        { type: 'hasMany', target: 'performance' },
      ],
    },
  },
};

export default theatercompanyBlueprint;
