import { Blueprint } from './blueprint.interface';

/**
 * Water Park Blueprint
 */
export const waterparkBlueprint: Blueprint = {
  appType: 'waterpark',
  description: 'Water park app with tickets, cabanas, attractions, and seasonal passes',

  coreEntities: ['ticket', 'customer', 'cabana', 'attraction', 'season_pass', 'event'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Tickets', path: '/tickets', icon: 'Ticket' },
        { label: 'Cabanas', path: '/cabanas', icon: 'Umbrella' },
        { label: 'Attractions', path: '/attractions', icon: 'Waves' },
        { label: 'Season Passes', path: '/passes', icon: 'CreditCard' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Events', path: '/events', icon: 'Calendar' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'capacity-chart', component: 'chart-widget', position: 'main' },
      { id: 'today-attendance', component: 'appointment-list', entity: 'ticket', position: 'main' },
    ]},
    { path: '/tickets', name: 'Tickets', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'ticket-table', component: 'data-table', entity: 'ticket', position: 'main' },
    ]},
    { path: '/cabanas', name: 'Cabanas', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'cabana-calendar', component: 'appointment-calendar', entity: 'cabana', position: 'main' },
      { id: 'cabana-table', component: 'data-table', entity: 'cabana', position: 'main' },
    ]},
    { path: '/attractions', name: 'Attractions', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'attraction-grid', component: 'product-grid', entity: 'attraction', position: 'main' },
    ]},
    { path: '/passes', name: 'Season Passes', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'pass-table', component: 'data-table', entity: 'season_pass', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/events', name: 'Events', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'event-table', component: 'data-table', entity: 'event', position: 'main' },
    ]},
    { path: '/buy', name: 'Buy Tickets', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'ticket-form', component: 'booking-wizard', entity: 'ticket', position: 'main' },
    ]},
    { path: '/cabana-rental', name: 'Reserve Cabana', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'cabana-form', component: 'booking-wizard', entity: 'cabana', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/tickets', entity: 'ticket', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/tickets', entity: 'ticket', operation: 'create' },
    { method: 'GET', path: '/cabanas', entity: 'cabana', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/cabanas', entity: 'cabana', operation: 'create' },
    { method: 'GET', path: '/attractions', entity: 'attraction', operation: 'list' },
    { method: 'GET', path: '/passes', entity: 'season_pass', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/passes', entity: 'season_pass', operation: 'create' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/events', entity: 'event', operation: 'list' },
  ],

  entityConfig: {
    ticket: {
      defaultFields: [
        { name: 'ticket_number', type: 'string', required: true },
        { name: 'visit_date', type: 'date', required: true },
        { name: 'ticket_type', type: 'enum', required: true },
        { name: 'num_adults', type: 'integer' },
        { name: 'num_children', type: 'integer' },
        { name: 'num_seniors', type: 'integer' },
        { name: 'addons', type: 'json' },
        { name: 'total', type: 'decimal' },
        { name: 'payment_status', type: 'enum' },
        { name: 'checked_in', type: 'boolean' },
        { name: 'checkin_time', type: 'datetime' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string' },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'total_visits', type: 'integer' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'ticket' },
        { type: 'hasMany', target: 'cabana' },
        { type: 'hasMany', target: 'season_pass' },
      ],
    },
    cabana: {
      defaultFields: [
        { name: 'reservation_number', type: 'string', required: true },
        { name: 'cabana_number', type: 'string', required: true },
        { name: 'cabana_type', type: 'enum', required: true },
        { name: 'reservation_date', type: 'date', required: true },
        { name: 'location', type: 'string' },
        { name: 'capacity', type: 'integer' },
        { name: 'amenities', type: 'json' },
        { name: 'food_service', type: 'json' },
        { name: 'price', type: 'decimal' },
        { name: 'deposit', type: 'decimal' },
        { name: 'total', type: 'decimal' },
        { name: 'special_requests', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    attraction: {
      defaultFields: [
        { name: 'attraction_name', type: 'string', required: true },
        { name: 'attraction_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'height_requirement', type: 'string' },
        { name: 'age_requirement', type: 'string' },
        { name: 'thrill_level', type: 'enum' },
        { name: 'capacity_per_hour', type: 'integer' },
        { name: 'wait_time_minutes', type: 'integer' },
        { name: 'image_url', type: 'image' },
        { name: 'location', type: 'string' },
        { name: 'is_open', type: 'boolean' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
    season_pass: {
      defaultFields: [
        { name: 'pass_number', type: 'string', required: true },
        { name: 'pass_type', type: 'enum', required: true },
        { name: 'holder_name', type: 'string', required: true },
        { name: 'holder_photo', type: 'image' },
        { name: 'start_date', type: 'date', required: true },
        { name: 'expiry_date', type: 'date' },
        { name: 'price', type: 'decimal' },
        { name: 'visits_used', type: 'integer' },
        { name: 'parking_included', type: 'boolean' },
        { name: 'cabana_discount', type: 'decimal' },
        { name: 'food_discount', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    event: {
      defaultFields: [
        { name: 'event_name', type: 'string', required: true },
        { name: 'event_type', type: 'enum', required: true },
        { name: 'event_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime' },
        { name: 'end_time', type: 'datetime' },
        { name: 'description', type: 'text' },
        { name: 'capacity', type: 'integer' },
        { name: 'ticket_price', type: 'decimal' },
        { name: 'image_url', type: 'image' },
        { name: 'is_public', type: 'boolean' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
  },
};

export default waterparkBlueprint;
