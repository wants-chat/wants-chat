import { Blueprint } from './blueprint.interface';

/**
 * Bar / Pub / Nightclub Blueprint
 */
export const barBlueprint: Blueprint = {
  appType: 'bar',
  description: 'Bar/pub app with drink menu, tabs, events, and table reservations',

  coreEntities: ['drink', 'tab', 'customer', 'event', 'reservation', 'staff'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Open Tabs', path: '/tabs', icon: 'Receipt' },
        { label: 'Drink Menu', path: '/menu', icon: 'Beer' },
        { label: 'Events', path: '/events', icon: 'PartyPopper' },
        { label: 'Reservations', path: '/reservations', icon: 'Calendar' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Staff', path: '/staff', icon: 'UserCheck' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'open-tabs', component: 'data-table', entity: 'tab', position: 'main' },
    ]},
    { path: '/tabs', name: 'Open Tabs', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'tab-grid', component: 'data-table', entity: 'tab', position: 'main' },
    ]},
    { path: '/menu', name: 'Drink Menu', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'menu-categories', component: 'menu-categories', entity: 'drink', position: 'main' },
      { id: 'menu-grid', component: 'menu-grid', entity: 'drink', position: 'main' },
    ]},
    { path: '/events', name: 'Events', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'event-calendar', component: 'appointment-calendar', entity: 'event', position: 'main' },
      { id: 'event-table', component: 'data-table', entity: 'event', position: 'main' },
    ]},
    { path: '/reservations', name: 'Reservations', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'reservation-table', component: 'data-table', entity: 'reservation', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/staff', name: 'Staff', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'staff-grid', component: 'staff-grid', entity: 'staff', position: 'main' },
    ]},
    { path: '/drinks', name: 'Our Menu', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'public-menu', component: 'menu-grid', entity: 'drink', position: 'main' },
    ]},
    { path: '/upcoming', name: 'Events', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'public-events', component: 'event-list', entity: 'event', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/tabs', entity: 'tab', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/tabs', entity: 'tab', operation: 'create', requiresAuth: true },
    { method: 'PUT', path: '/tabs/:id', entity: 'tab', operation: 'update', requiresAuth: true },
    { method: 'GET', path: '/menu', entity: 'drink', operation: 'list' },
    { method: 'POST', path: '/menu', entity: 'drink', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/events', entity: 'event', operation: 'list' },
    { method: 'POST', path: '/events', entity: 'event', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/reservations', entity: 'reservation', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/reservations', entity: 'reservation', operation: 'create' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/staff', entity: 'staff', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    drink: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'category', type: 'enum', required: true },
        { name: 'price', type: 'decimal', required: true },
        { name: 'ingredients', type: 'json' },
        { name: 'spirit_base', type: 'string' },
        { name: 'abv', type: 'decimal' },
        { name: 'is_signature', type: 'boolean' },
        { name: 'is_happy_hour', type: 'boolean' },
        { name: 'happy_hour_price', type: 'decimal' },
        { name: 'image_url', type: 'image' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [],
    },
    tab: {
      defaultFields: [
        { name: 'tab_number', type: 'string', required: true },
        { name: 'opened_at', type: 'datetime', required: true },
        { name: 'closed_at', type: 'datetime' },
        { name: 'table_number', type: 'string' },
        { name: 'items', type: 'json', required: true },
        { name: 'subtotal', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'tip', type: 'decimal' },
        { name: 'total', type: 'decimal' },
        { name: 'card_on_file', type: 'json' },
        { name: 'status', type: 'enum', required: true },
        { name: 'payment_status', type: 'enum' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'staff' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string' },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'date_of_birth', type: 'date' },
        { name: 'id_verified', type: 'boolean' },
        { name: 'favorite_drinks', type: 'json' },
        { name: 'total_visits', type: 'integer' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'vip_status', type: 'boolean' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'tab' },
        { type: 'hasMany', target: 'reservation' },
      ],
    },
    event: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'event_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'event_type', type: 'enum' },
        { name: 'cover_charge', type: 'decimal' },
        { name: 'capacity', type: 'integer' },
        { name: 'tickets_sold', type: 'integer' },
        { name: 'performer', type: 'string' },
        { name: 'image_url', type: 'image' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
    reservation: {
      defaultFields: [
        { name: 'reservation_date', type: 'date', required: true },
        { name: 'reservation_time', type: 'datetime', required: true },
        { name: 'party_size', type: 'integer', required: true },
        { name: 'table_type', type: 'enum' },
        { name: 'bottle_service', type: 'boolean' },
        { name: 'minimum_spend', type: 'decimal' },
        { name: 'deposit_paid', type: 'decimal' },
        { name: 'special_requests', type: 'text' },
        { name: 'status', type: 'enum', required: true },
        { name: 'contact_name', type: 'string', required: true },
        { name: 'contact_phone', type: 'phone', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    staff: {
      defaultFields: [
        { name: 'employee_id', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'role', type: 'enum', required: true },
        { name: 'hire_date', type: 'date' },
        { name: 'schedule', type: 'json' },
        { name: 'tips_earned', type: 'decimal' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'tab' },
      ],
    },
  },
};

export default barBlueprint;
