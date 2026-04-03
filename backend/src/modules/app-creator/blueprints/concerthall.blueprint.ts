import { Blueprint } from './blueprint.interface';

/**
 * Concert Hall Blueprint
 */
export const concerthallBlueprint: Blueprint = {
  appType: 'concerthall',
  description: 'Concert hall app with events, tickets, seating, subscriptions, and rentals',

  coreEntities: ['event', 'ticket', 'seating_section', 'subscription', 'rental', 'artist'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Events', path: '/events', icon: 'Music' },
        { label: 'Tickets', path: '/tickets', icon: 'Ticket' },
        { label: 'Seating', path: '/seating', icon: 'Armchair' },
        { label: 'Subscriptions', path: '/subscriptions', icon: 'CalendarCheck' },
        { label: 'Rentals', path: '/rentals', icon: 'Building' },
        { label: 'Artists', path: '/artists', icon: 'Mic2' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'upcoming-events', component: 'appointment-list', entity: 'event', position: 'main' },
    ]},
    { path: '/events', name: 'Events', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'event-calendar', component: 'appointment-calendar', entity: 'event', position: 'main' },
      { id: 'event-table', component: 'data-table', entity: 'event', position: 'main' },
    ]},
    { path: '/tickets', name: 'Tickets', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'ticket-table', component: 'data-table', entity: 'ticket', position: 'main' },
    ]},
    { path: '/seating', name: 'Seating', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'seating-table', component: 'data-table', entity: 'seating_section', position: 'main' },
    ]},
    { path: '/subscriptions', name: 'Subscriptions', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'subscription-table', component: 'data-table', entity: 'subscription', position: 'main' },
    ]},
    { path: '/rentals', name: 'Venue Rentals', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'rental-calendar', component: 'appointment-calendar', entity: 'rental', position: 'main' },
      { id: 'rental-table', component: 'data-table', entity: 'rental', position: 'main' },
    ]},
    { path: '/artists', name: 'Artists', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'artist-grid', component: 'staff-grid', entity: 'artist', position: 'main' },
    ]},
    { path: '/calendar', name: 'Event Calendar', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'event-display', component: 'product-grid', entity: 'event', position: 'main' },
    ]},
    { path: '/buy-tickets', name: 'Buy Tickets', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'ticket-form', component: 'booking-wizard', entity: 'ticket', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/events', entity: 'event', operation: 'list' },
    { method: 'GET', path: '/tickets', entity: 'ticket', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/tickets', entity: 'ticket', operation: 'create' },
    { method: 'GET', path: '/seating', entity: 'seating_section', operation: 'list' },
    { method: 'GET', path: '/subscriptions', entity: 'subscription', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/subscriptions', entity: 'subscription', operation: 'create' },
    { method: 'GET', path: '/rentals', entity: 'rental', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/rentals', entity: 'rental', operation: 'create' },
    { method: 'GET', path: '/artists', entity: 'artist', operation: 'list' },
  ],

  entityConfig: {
    event: {
      defaultFields: [
        { name: 'event_name', type: 'string', required: true },
        { name: 'event_type', type: 'enum', required: true },
        { name: 'event_date', type: 'date', required: true },
        { name: 'doors_open', type: 'datetime' },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'description', type: 'text' },
        { name: 'program', type: 'json' },
        { name: 'intermission', type: 'boolean' },
        { name: 'run_time', type: 'integer' },
        { name: 'age_recommendation', type: 'string' },
        { name: 'ticket_prices', type: 'json' },
        { name: 'tickets_sold', type: 'integer' },
        { name: 'image_url', type: 'image' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
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
        { name: 'quantity', type: 'integer', required: true },
        { name: 'section', type: 'string' },
        { name: 'row', type: 'string' },
        { name: 'seats', type: 'json' },
        { name: 'price_per_ticket', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'payment_method', type: 'enum' },
        { name: 'is_subscriber', type: 'boolean' },
        { name: 'checked_in', type: 'boolean' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'event' },
        { type: 'belongsTo', target: 'seating_section' },
      ],
    },
    seating_section: {
      defaultFields: [
        { name: 'section_name', type: 'string', required: true },
        { name: 'section_type', type: 'enum', required: true },
        { name: 'total_seats', type: 'integer', required: true },
        { name: 'rows', type: 'integer' },
        { name: 'seats_per_row', type: 'integer' },
        { name: 'base_price', type: 'decimal', required: true },
        { name: 'premium_price', type: 'decimal' },
        { name: 'accessibility_seats', type: 'integer' },
        { name: 'view_quality', type: 'enum' },
        { name: 'amenities', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
    subscription: {
      defaultFields: [
        { name: 'subscription_number', type: 'string', required: true },
        { name: 'subscriber_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'subscription_type', type: 'enum', required: true },
        { name: 'season', type: 'string', required: true },
        { name: 'seat_selection', type: 'json' },
        { name: 'events_included', type: 'json' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'payment_plan', type: 'json' },
        { name: 'renewal_date', type: 'date' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
    rental: {
      defaultFields: [
        { name: 'rental_number', type: 'string', required: true },
        { name: 'rental_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime', required: true },
        { name: 'event_type', type: 'enum', required: true },
        { name: 'organization', type: 'string', required: true },
        { name: 'contact_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'expected_attendance', type: 'integer' },
        { name: 'services_needed', type: 'json' },
        { name: 'equipment_needed', type: 'json' },
        { name: 'catering', type: 'boolean' },
        { name: 'rental_fee', type: 'decimal', required: true },
        { name: 'deposit', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
    artist: {
      defaultFields: [
        { name: 'artist_name', type: 'string', required: true },
        { name: 'artist_type', type: 'enum', required: true },
        { name: 'genre', type: 'json' },
        { name: 'bio', type: 'text' },
        { name: 'website', type: 'string' },
        { name: 'social_media', type: 'json' },
        { name: 'booking_contact', type: 'json' },
        { name: 'past_performances', type: 'json' },
        { name: 'photo_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
  },
};

export default concerthallBlueprint;
