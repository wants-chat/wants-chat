import { Blueprint } from './blueprint.interface';

/**
 * Boat Rental Blueprint
 */
export const boatrentalBlueprint: Blueprint = {
  appType: 'boatrental',
  description: 'Boat rental service with boats, reservations, customers, and safety equipment',

  coreEntities: ['boat', 'reservation', 'customer', 'equipment', 'maintenance', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Boats', path: '/boats', icon: 'Ship' },
        { label: 'Reservations', path: '/reservations', icon: 'Calendar' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Equipment', path: '/equipment', icon: 'LifeBuoy' },
        { label: 'Maintenance', path: '/maintenance', icon: 'Wrench' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'todays-rentals', component: 'appointment-list', entity: 'reservation', position: 'main' },
    ]},
    { path: '/boats', name: 'Boats', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'boat-grid', component: 'product-grid', entity: 'boat', position: 'main' },
    ]},
    { path: '/reservations', name: 'Reservations', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'reservation-calendar', component: 'appointment-calendar', entity: 'reservation', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/equipment', name: 'Equipment', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'equipment-table', component: 'data-table', entity: 'equipment', position: 'main' },
    ]},
    { path: '/maintenance', name: 'Maintenance', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'maintenance-table', component: 'data-table', entity: 'maintenance', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
    { path: '/rent', name: 'Rent', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'booking-wizard', component: 'booking-wizard', entity: 'reservation', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/boats', entity: 'boat', operation: 'list' },
    { method: 'GET', path: '/reservations', entity: 'reservation', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/reservations', entity: 'reservation', operation: 'create' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/equipment', entity: 'equipment', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/maintenance', entity: 'maintenance', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    boat: {
      defaultFields: [
        { name: 'boat_name', type: 'string', required: true },
        { name: 'boat_type', type: 'enum', required: true },
        { name: 'manufacturer', type: 'string' },
        { name: 'model', type: 'string' },
        { name: 'year', type: 'integer' },
        { name: 'length_feet', type: 'decimal' },
        { name: 'capacity', type: 'integer', required: true },
        { name: 'engine_info', type: 'json' },
        { name: 'features', type: 'json' },
        { name: 'safety_equipment', type: 'json' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'half_day_rate', type: 'decimal' },
        { name: 'full_day_rate', type: 'decimal', required: true },
        { name: 'deposit_required', type: 'decimal' },
        { name: 'fuel_policy', type: 'enum' },
        { name: 'images', type: 'json' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'reservation' },
        { type: 'hasMany', target: 'maintenance' },
      ],
    },
    reservation: {
      defaultFields: [
        { name: 'reservation_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime', required: true },
        { name: 'rental_type', type: 'enum' },
        { name: 'passenger_count', type: 'integer' },
        { name: 'captain_needed', type: 'boolean' },
        { name: 'equipment_rented', type: 'json' },
        { name: 'destination', type: 'string' },
        { name: 'special_requests', type: 'text' },
        { name: 'rental_fee', type: 'decimal' },
        { name: 'equipment_fee', type: 'decimal' },
        { name: 'captain_fee', type: 'decimal' },
        { name: 'deposit', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'waiver_signed', type: 'boolean' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'boat' },
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'drivers_license', type: 'string' },
        { name: 'boating_license', type: 'string' },
        { name: 'experience_level', type: 'enum' },
        { name: 'emergency_contact', type: 'json' },
        { name: 'waiver_on_file', type: 'boolean' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'reservation' },
      ],
    },
    equipment: {
      defaultFields: [
        { name: 'equipment_name', type: 'string', required: true },
        { name: 'equipment_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'quantity_available', type: 'integer' },
        { name: 'rental_rate', type: 'decimal' },
        { name: 'deposit_required', type: 'decimal' },
        { name: 'condition', type: 'enum' },
        { name: 'last_inspected', type: 'date' },
        { name: 'notes', type: 'text' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [],
    },
    maintenance: {
      defaultFields: [
        { name: 'maintenance_type', type: 'enum', required: true },
        { name: 'description', type: 'text', required: true },
        { name: 'scheduled_date', type: 'date' },
        { name: 'completed_date', type: 'date' },
        { name: 'performed_by', type: 'string' },
        { name: 'parts_used', type: 'json' },
        { name: 'labor_hours', type: 'decimal' },
        { name: 'parts_cost', type: 'decimal' },
        { name: 'labor_cost', type: 'decimal' },
        { name: 'total_cost', type: 'decimal' },
        { name: 'next_service_date', type: 'date' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'boat' },
      ],
    },
    invoice: {
      defaultFields: [
        { name: 'invoice_number', type: 'string', required: true },
        { name: 'invoice_date', type: 'date', required: true },
        { name: 'due_date', type: 'date' },
        { name: 'line_items', type: 'json' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'deposit_collected', type: 'decimal' },
        { name: 'deposit_returned', type: 'decimal' },
        { name: 'amount_paid', type: 'decimal' },
        { name: 'balance_due', type: 'decimal' },
        { name: 'payment_method', type: 'enum' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'reservation' },
      ],
    },
  },
};

export default boatrentalBlueprint;
