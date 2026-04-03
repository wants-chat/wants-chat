import { Blueprint } from './blueprint.interface';

/**
 * Comedy Club Blueprint
 */
export const comedyclubBlueprint: Blueprint = {
  appType: 'comedyclub',
  description: 'Comedy club app with shows, tickets, comedians, food/drinks, and open mic',

  coreEntities: ['show', 'ticket', 'comedian', 'menu_item', 'open_mic', 'reservation'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Shows', path: '/shows', icon: 'Mic' },
        { label: 'Tickets', path: '/tickets', icon: 'Ticket' },
        { label: 'Comedians', path: '/comedians', icon: 'Smile' },
        { label: 'Menu', path: '/menu', icon: 'UtensilsCrossed' },
        { label: 'Open Mic', path: '/openmic', icon: 'MicVocal' },
        { label: 'Reservations', path: '/reservations', icon: 'Calendar' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'tonight-shows', component: 'appointment-list', entity: 'show', position: 'main' },
    ]},
    { path: '/shows', name: 'Shows', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'show-calendar', component: 'appointment-calendar', entity: 'show', position: 'main' },
      { id: 'show-table', component: 'data-table', entity: 'show', position: 'main' },
    ]},
    { path: '/tickets', name: 'Tickets', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'ticket-table', component: 'data-table', entity: 'ticket', position: 'main' },
    ]},
    { path: '/comedians', name: 'Comedians', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'comedian-grid', component: 'staff-grid', entity: 'comedian', position: 'main' },
    ]},
    { path: '/menu', name: 'Menu', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'menu-grid', component: 'product-grid', entity: 'menu_item', position: 'main' },
    ]},
    { path: '/openmic', name: 'Open Mic', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'openmic-table', component: 'data-table', entity: 'open_mic', position: 'main' },
    ]},
    { path: '/reservations', name: 'Reservations', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'reservation-calendar', component: 'appointment-calendar', entity: 'reservation', position: 'main' },
      { id: 'reservation-table', component: 'data-table', entity: 'reservation', position: 'main' },
    ]},
    { path: '/upcoming', name: 'Upcoming Shows', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'show-display', component: 'product-grid', entity: 'show', position: 'main' },
    ]},
    { path: '/buy-tickets', name: 'Buy Tickets', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'ticket-form', component: 'booking-wizard', entity: 'reservation', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/shows', entity: 'show', operation: 'list' },
    { method: 'GET', path: '/tickets', entity: 'ticket', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/tickets', entity: 'ticket', operation: 'create' },
    { method: 'GET', path: '/comedians', entity: 'comedian', operation: 'list' },
    { method: 'GET', path: '/menu', entity: 'menu_item', operation: 'list' },
    { method: 'GET', path: '/openmic', entity: 'open_mic', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/openmic', entity: 'open_mic', operation: 'create' },
    { method: 'GET', path: '/reservations', entity: 'reservation', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/reservations', entity: 'reservation', operation: 'create' },
  ],

  entityConfig: {
    show: {
      defaultFields: [
        { name: 'show_name', type: 'string', required: true },
        { name: 'show_type', type: 'enum', required: true },
        { name: 'show_date', type: 'date', required: true },
        { name: 'doors_open', type: 'datetime' },
        { name: 'show_time', type: 'datetime', required: true },
        { name: 'description', type: 'text' },
        { name: 'headliner', type: 'string' },
        { name: 'lineup', type: 'json' },
        { name: 'duration', type: 'integer' },
        { name: 'age_requirement', type: 'integer' },
        { name: 'drink_minimum', type: 'integer' },
        { name: 'ticket_price', type: 'decimal', required: true },
        { name: 'vip_price', type: 'decimal' },
        { name: 'capacity', type: 'integer' },
        { name: 'tickets_sold', type: 'integer' },
        { name: 'image_url', type: 'image' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'hasMany', target: 'ticket' },
        { type: 'hasMany', target: 'reservation' },
      ],
    },
    ticket: {
      defaultFields: [
        { name: 'ticket_number', type: 'string', required: true },
        { name: 'purchase_date', type: 'date', required: true },
        { name: 'customer_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'quantity', type: 'integer', required: true },
        { name: 'ticket_type', type: 'enum', required: true },
        { name: 'table_number', type: 'string' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'payment_method', type: 'enum' },
        { name: 'checked_in', type: 'boolean' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'show' },
      ],
    },
    comedian: {
      defaultFields: [
        { name: 'stage_name', type: 'string', required: true },
        { name: 'real_name', type: 'string' },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'bio', type: 'text' },
        { name: 'style', type: 'json' },
        { name: 'credits', type: 'json' },
        { name: 'social_media', type: 'json' },
        { name: 'booking_fee', type: 'decimal' },
        { name: 'availability', type: 'json' },
        { name: 'past_shows', type: 'json' },
        { name: 'photo_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
    menu_item: {
      defaultFields: [
        { name: 'item_name', type: 'string', required: true },
        { name: 'category', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'ingredients', type: 'json' },
        { name: 'allergens', type: 'json' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'show_special', type: 'boolean' },
        { name: 'image_url', type: 'image' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [],
    },
    open_mic: {
      defaultFields: [
        { name: 'signup_number', type: 'string', required: true },
        { name: 'event_date', type: 'date', required: true },
        { name: 'performer_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'experience_level', type: 'enum' },
        { name: 'set_length', type: 'integer' },
        { name: 'slot_number', type: 'integer' },
        { name: 'performed', type: 'boolean' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
    reservation: {
      defaultFields: [
        { name: 'reservation_number', type: 'string', required: true },
        { name: 'reservation_date', type: 'date', required: true },
        { name: 'guest_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone', required: true },
        { name: 'party_size', type: 'integer', required: true },
        { name: 'table_preference', type: 'enum' },
        { name: 'special_occasion', type: 'string' },
        { name: 'special_requests', type: 'text' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'show' },
      ],
    },
  },
};

export default comedyclubBlueprint;
