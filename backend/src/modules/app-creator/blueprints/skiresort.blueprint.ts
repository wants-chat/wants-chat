import { Blueprint } from './blueprint.interface';

/**
 * Ski Resort Blueprint
 */
export const skiresortBlueprint: Blueprint = {
  appType: 'skiresort',
  description: 'Ski resort with lift tickets, rentals, lessons, and trail conditions',

  coreEntities: ['lift_ticket', 'rental', 'lesson', 'trail', 'pass', 'customer'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Lift Tickets', path: '/tickets', icon: 'Ticket' },
        { label: 'Rentals', path: '/rentals', icon: 'Package' },
        { label: 'Lessons', path: '/lessons', icon: 'GraduationCap' },
        { label: 'Trail Map', path: '/trails', icon: 'Mountain' },
        { label: 'Season Passes', path: '/passes', icon: 'CreditCard' },
      ]}},
      { id: 'skiresort-stats', component: 'skiresort-stats', position: 'main' },
      { id: 'trail-status', component: 'trail-status-overview', entity: 'trail', position: 'main' },
      { id: 'today-sales', component: 'ticket-sales-today', entity: 'lift_ticket', position: 'main' },
    ]},
    { path: '/tickets', name: 'Lift Tickets', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'ticket-sales', component: 'ticket-sales-ski', entity: 'lift_ticket', position: 'main' },
    ]},
    { path: '/rentals', name: 'Rentals', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'rental-table', component: 'rental-table-ski', entity: 'rental', position: 'main' },
    ]},
    { path: '/rentals/:id', name: 'Rental Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'rental-detail', component: 'rental-detail-ski', entity: 'rental', position: 'main' },
    ]},
    { path: '/lessons', name: 'Lessons', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'lesson-calendar', component: 'lesson-calendar-ski', entity: 'lesson', position: 'main' },
    ]},
    { path: '/trails', name: 'Trail Map', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'trail-map', component: 'trail-map', entity: 'trail', position: 'main' },
      { id: 'trail-conditions', component: 'trail-conditions', entity: 'trail', position: 'main' },
    ]},
    { path: '/passes', name: 'Season Passes', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'pass-table', component: 'pass-table', entity: 'pass', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'customer-table-ski', entity: 'customer', position: 'main' },
    ]},
    { path: '/buy', name: 'Buy Tickets', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'public-tickets', component: 'public-tickets-ski', entity: 'lift_ticket', position: 'main' },
    ]},
    { path: '/conditions', name: 'Conditions', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'public-conditions', component: 'public-conditions-ski', entity: 'trail', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/tickets', entity: 'lift_ticket', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/tickets', entity: 'lift_ticket', operation: 'create' },
    { method: 'GET', path: '/rentals', entity: 'rental', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/rentals', entity: 'rental', operation: 'create' },
    { method: 'GET', path: '/lessons', entity: 'lesson', operation: 'list' },
    { method: 'GET', path: '/trails', entity: 'trail', operation: 'list' },
    { method: 'GET', path: '/passes', entity: 'pass', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    lift_ticket: {
      defaultFields: [
        { name: 'ticket_number', type: 'string', required: true },
        { name: 'date', type: 'date', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'duration', type: 'enum', required: true },
        { name: 'price', type: 'decimal', required: true },
        { name: 'guest_name', type: 'string' },
        { name: 'age_group', type: 'enum' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [{ type: 'belongsTo', target: 'customer' }],
    },
    rental: {
      defaultFields: [
        { name: 'rental_number', type: 'string', required: true },
        { name: 'date', type: 'date', required: true },
        { name: 'equipment_type', type: 'enum', required: true },
        { name: 'equipment_details', type: 'json' },
        { name: 'size', type: 'string' },
        { name: 'skill_level', type: 'enum' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'deposit', type: 'decimal' },
        { name: 'pickup_time', type: 'datetime' },
        { name: 'return_time', type: 'datetime' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [{ type: 'belongsTo', target: 'customer' }],
    },
    lesson: {
      defaultFields: [
        { name: 'date', type: 'date', required: true },
        { name: 'time', type: 'string', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'level', type: 'enum', required: true },
        { name: 'duration_hours', type: 'decimal' },
        { name: 'instructor', type: 'string' },
        { name: 'max_students', type: 'integer' },
        { name: 'current_students', type: 'integer' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
    trail: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'difficulty', type: 'enum', required: true },
        { name: 'type', type: 'enum' },
        { name: 'vertical_drop', type: 'integer' },
        { name: 'length', type: 'decimal' },
        { name: 'groomed', type: 'boolean' },
        { name: 'snowmaking', type: 'boolean' },
        { name: 'status', type: 'enum', required: true },
        { name: 'conditions', type: 'text' },
        { name: 'last_updated', type: 'datetime' },
      ],
      relationships: [],
    },
    pass: {
      defaultFields: [
        { name: 'pass_number', type: 'string', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'season', type: 'string', required: true },
        { name: 'holder_name', type: 'string', required: true },
        { name: 'photo', type: 'image' },
        { name: 'start_date', type: 'date' },
        { name: 'end_date', type: 'date' },
        { name: 'price', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [{ type: 'belongsTo', target: 'customer' }],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'date_of_birth', type: 'date' },
        { name: 'emergency_contact', type: 'json' },
        { name: 'waiver_signed', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'lift_ticket' },
        { type: 'hasMany', target: 'rental' },
        { type: 'hasMany', target: 'pass' },
      ],
    },
  },
};

export default skiresortBlueprint;
