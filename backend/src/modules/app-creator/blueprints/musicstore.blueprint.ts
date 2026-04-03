import { Blueprint } from './blueprint.interface';

/**
 * Musical Instrument Store Blueprint
 */
export const musicstoreBlueprint: Blueprint = {
  appType: 'musicstore',
  description: 'Musical instrument store app with instruments, rentals, lessons, repairs, and sheet music',

  coreEntities: ['instrument', 'rental', 'lesson', 'repair', 'customer', 'sheet_music'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Instruments', path: '/instruments', icon: 'Music' },
        { label: 'Rentals', path: '/rentals', icon: 'Clock' },
        { label: 'Lessons', path: '/lessons', icon: 'GraduationCap' },
        { label: 'Repairs', path: '/repairs', icon: 'Wrench' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Sheet Music', path: '/sheet-music', icon: 'FileText' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'today-lessons', component: 'appointment-list', entity: 'lesson', position: 'main' },
    ]},
    { path: '/instruments', name: 'Instruments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'filters', component: 'filter-form', entity: 'instrument', position: 'main' },
      { id: 'instrument-grid', component: 'product-grid', entity: 'instrument', position: 'main' },
    ]},
    { path: '/rentals', name: 'Rentals', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'rental-table', component: 'data-table', entity: 'rental', position: 'main' },
    ]},
    { path: '/lessons', name: 'Lessons', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'lesson-calendar', component: 'appointment-calendar', entity: 'lesson', position: 'main' },
      { id: 'lesson-table', component: 'data-table', entity: 'lesson', position: 'main' },
    ]},
    { path: '/repairs', name: 'Repairs', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'repair-board', component: 'kanban-board', entity: 'repair', position: 'main' },
      { id: 'repair-table', component: 'data-table', entity: 'repair', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/sheet-music', name: 'Sheet Music', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'sheet-grid', component: 'product-grid', entity: 'sheet_music', position: 'main' },
    ]},
    { path: '/shop', name: 'Shop', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'filters', component: 'filter-form', entity: 'instrument', position: 'main' },
      { id: 'instrument-display', component: 'product-grid', entity: 'instrument', position: 'main' },
    ]},
    { path: '/book-lesson', name: 'Book Lesson', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'lesson-form', component: 'booking-wizard', entity: 'lesson', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/instruments', entity: 'instrument', operation: 'list' },
    { method: 'GET', path: '/rentals', entity: 'rental', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/rentals', entity: 'rental', operation: 'create' },
    { method: 'GET', path: '/lessons', entity: 'lesson', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/lessons', entity: 'lesson', operation: 'create' },
    { method: 'GET', path: '/repairs', entity: 'repair', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/repairs', entity: 'repair', operation: 'create' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/sheet-music', entity: 'sheet_music', operation: 'list' },
  ],

  entityConfig: {
    instrument: {
      defaultFields: [
        { name: 'instrument_name', type: 'string', required: true },
        { name: 'sku', type: 'string' },
        { name: 'brand', type: 'string', required: true },
        { name: 'model', type: 'string' },
        { name: 'instrument_type', type: 'enum', required: true },
        { name: 'family', type: 'enum' },
        { name: 'condition', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'specifications', type: 'json' },
        { name: 'finish', type: 'string' },
        { name: 'year', type: 'integer' },
        { name: 'serial_number', type: 'string' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'cost', type: 'decimal' },
        { name: 'quantity', type: 'integer' },
        { name: 'is_rentable', type: 'boolean' },
        { name: 'rental_price', type: 'decimal' },
        { name: 'images', type: 'json' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [],
    },
    rental: {
      defaultFields: [
        { name: 'rental_number', type: 'string', required: true },
        { name: 'rental_start', type: 'date', required: true },
        { name: 'rental_term', type: 'enum', required: true },
        { name: 'instrument_info', type: 'json', required: true },
        { name: 'serial_number', type: 'string' },
        { name: 'student_name', type: 'string', required: true },
        { name: 'parent_name', type: 'string' },
        { name: 'school', type: 'string' },
        { name: 'grade', type: 'string' },
        { name: 'monthly_rate', type: 'decimal', required: true },
        { name: 'rent_to_own', type: 'boolean' },
        { name: 'maintenance_plan', type: 'boolean' },
        { name: 'deposit', type: 'decimal' },
        { name: 'payments_made', type: 'integer' },
        { name: 'next_payment', type: 'date' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    lesson: {
      defaultFields: [
        { name: 'lesson_number', type: 'string', required: true },
        { name: 'lesson_date', type: 'date', required: true },
        { name: 'lesson_time', type: 'datetime', required: true },
        { name: 'duration_minutes', type: 'integer', required: true },
        { name: 'instrument', type: 'enum', required: true },
        { name: 'teacher', type: 'string', required: true },
        { name: 'student_name', type: 'string', required: true },
        { name: 'skill_level', type: 'enum' },
        { name: 'lesson_type', type: 'enum' },
        { name: 'is_recurring', type: 'boolean' },
        { name: 'price', type: 'decimal' },
        { name: 'topics_covered', type: 'json' },
        { name: 'homework', type: 'text' },
        { name: 'progress_notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    repair: {
      defaultFields: [
        { name: 'repair_number', type: 'string', required: true },
        { name: 'intake_date', type: 'date', required: true },
        { name: 'instrument_info', type: 'json', required: true },
        { name: 'serial_number', type: 'string' },
        { name: 'issue_description', type: 'text', required: true },
        { name: 'diagnosis', type: 'text' },
        { name: 'work_performed', type: 'text' },
        { name: 'parts_used', type: 'json' },
        { name: 'technician', type: 'string' },
        { name: 'labor_cost', type: 'decimal' },
        { name: 'parts_cost', type: 'decimal' },
        { name: 'total', type: 'decimal' },
        { name: 'warranty_repair', type: 'boolean' },
        { name: 'estimated_completion', type: 'date' },
        { name: 'completed_date', type: 'date' },
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
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone', required: true },
        { name: 'address', type: 'json' },
        { name: 'instruments_played', type: 'json' },
        { name: 'skill_level', type: 'enum' },
        { name: 'school', type: 'string' },
        { name: 'total_purchases', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'rental' },
        { type: 'hasMany', target: 'lesson' },
        { type: 'hasMany', target: 'repair' },
      ],
    },
    sheet_music: {
      defaultFields: [
        { name: 'title', type: 'string', required: true },
        { name: 'composer', type: 'string' },
        { name: 'arranger', type: 'string' },
        { name: 'publisher', type: 'string' },
        { name: 'instrument', type: 'enum' },
        { name: 'ensemble_type', type: 'enum' },
        { name: 'difficulty', type: 'enum' },
        { name: 'genre', type: 'enum' },
        { name: 'description', type: 'text' },
        { name: 'sku', type: 'string' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'quantity', type: 'integer' },
        { name: 'image_url', type: 'image' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [],
    },
  },
};

export default musicstoreBlueprint;
