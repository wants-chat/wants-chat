import { Blueprint } from './blueprint.interface';

/**
 * Arcade/Gaming Center Blueprint
 */
export const arcadeBlueprint: Blueprint = {
  appType: 'arcade',
  description: 'Arcade/gaming center with games, tokens/cards, parties, and prizes',

  coreEntities: ['game', 'card', 'transaction', 'party', 'prize', 'customer'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Games', path: '/games', icon: 'Gamepad2' },
        { label: 'Cards', path: '/cards', icon: 'CreditCard' },
        { label: 'Parties', path: '/parties', icon: 'PartyPopper' },
        { label: 'Prizes', path: '/prizes', icon: 'Gift' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
      ]}},
      { id: 'arcade-stats', component: 'arcade-stats', position: 'main' },
      { id: 'today-parties', component: 'party-list-today', entity: 'party', position: 'main' },
      { id: 'popular-games', component: 'game-list-popular', entity: 'game', position: 'main' },
    ]},
    { path: '/games', name: 'Games', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'game-grid', component: 'game-grid-arcade', entity: 'game', position: 'main' },
    ]},
    { path: '/games/:id', name: 'Game Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'game-detail', component: 'game-detail-arcade', entity: 'game', position: 'main' },
      { id: 'game-stats', component: 'game-stats-arcade', entity: 'game', position: 'main' },
    ]},
    { path: '/cards', name: 'Game Cards', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'card-table', component: 'card-table-arcade', entity: 'card', position: 'main' },
    ]},
    { path: '/cards/:id', name: 'Card Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'card-detail', component: 'card-detail-arcade', entity: 'card', position: 'main' },
      { id: 'card-history', component: 'card-history-arcade', entity: 'transaction', position: 'main' },
    ]},
    { path: '/parties', name: 'Parties', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'party-calendar', component: 'party-calendar-arcade', entity: 'party', position: 'main' },
    ]},
    { path: '/parties/:id', name: 'Party Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'party-detail', component: 'party-detail-arcade', entity: 'party', position: 'main' },
    ]},
    { path: '/prizes', name: 'Prizes', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'prize-grid', component: 'prize-grid', entity: 'prize', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'customer-table-arcade', entity: 'customer', position: 'main' },
    ]},
    { path: '/book-party', name: 'Book Party', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'public-party', component: 'public-party-booking-arcade', entity: 'party', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/games', entity: 'game', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/cards', entity: 'card', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/cards', entity: 'card', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/parties', entity: 'party', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/parties', entity: 'party', operation: 'create' },
    { method: 'GET', path: '/prizes', entity: 'prize', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    game: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'category', type: 'enum' },
        { name: 'description', type: 'text' },
        { name: 'credits_per_play', type: 'integer', required: true },
        { name: 'tickets_per_play', type: 'integer' },
        { name: 'location', type: 'string' },
        { name: 'image', type: 'image' },
        { name: 'status', type: 'enum', required: true },
        { name: 'total_plays', type: 'integer' },
      ],
      relationships: [],
    },
    card: {
      defaultFields: [
        { name: 'card_number', type: 'string', required: true },
        { name: 'credits', type: 'integer', required: true },
        { name: 'tickets', type: 'integer' },
        { name: 'status', type: 'enum', required: true },
        { name: 'issued_date', type: 'datetime' },
        { name: 'last_used', type: 'datetime' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'hasMany', target: 'transaction' },
      ],
    },
    transaction: {
      defaultFields: [
        { name: 'type', type: 'enum', required: true },
        { name: 'amount', type: 'integer', required: true },
        { name: 'credits_change', type: 'integer' },
        { name: 'tickets_change', type: 'integer' },
        { name: 'timestamp', type: 'datetime', required: true },
        { name: 'description', type: 'string' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'card' },
        { type: 'belongsTo', target: 'game' },
      ],
    },
    party: {
      defaultFields: [
        { name: 'booking_number', type: 'string', required: true },
        { name: 'date', type: 'date', required: true },
        { name: 'start_time', type: 'string', required: true },
        { name: 'duration_hours', type: 'decimal', required: true },
        { name: 'package', type: 'enum', required: true },
        { name: 'child_name', type: 'string', required: true },
        { name: 'child_age', type: 'integer' },
        { name: 'guests', type: 'integer', required: true },
        { name: 'total', type: 'decimal', required: true },
        { name: 'deposit', type: 'decimal' },
        { name: 'add_ons', type: 'json' },
        { name: 'special_requests', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [{ type: 'belongsTo', target: 'customer' }],
    },
    prize: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'category', type: 'enum' },
        { name: 'description', type: 'text' },
        { name: 'tickets_required', type: 'integer', required: true },
        { name: 'quantity', type: 'integer' },
        { name: 'image', type: 'image' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'birthday', type: 'date' },
        { name: 'total_visits', type: 'integer' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'card' },
        { type: 'hasMany', target: 'party' },
      ],
    },
  },
};

export default arcadeBlueprint;
