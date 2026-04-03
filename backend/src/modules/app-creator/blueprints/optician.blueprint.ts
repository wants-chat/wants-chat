import { Blueprint } from './blueprint.interface';

/**
 * Optical Store Blueprint
 */
export const opticianBlueprint: Blueprint = {
  appType: 'optician',
  description: 'Optical store with eyewear, eye exams, prescriptions, and lens orders',

  coreEntities: ['product', 'exam', 'prescription', 'order', 'customer', 'appointment'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Appointments', path: '/appointments', icon: 'Calendar' },
        { label: 'Exams', path: '/exams', icon: 'Eye' },
        { label: 'Eyewear', path: '/eyewear', icon: 'Glasses' },
        { label: 'Orders', path: '/orders', icon: 'ShoppingBag' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
      ]}},
      { id: 'optician-stats', component: 'optician-stats', position: 'main' },
      { id: 'today-appointments', component: 'appointment-list-today-optician', entity: 'appointment', position: 'main' },
      { id: 'pending-orders', component: 'order-list-pending-optician', entity: 'order', position: 'main' },
    ]},
    { path: '/appointments', name: 'Appointments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'appointment-calendar', component: 'appointment-calendar-optician', entity: 'appointment', position: 'main' },
    ]},
    { path: '/exams', name: 'Eye Exams', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'exam-table', component: 'exam-table', entity: 'exam', position: 'main' },
    ]},
    { path: '/exams/:id', name: 'Exam Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'exam-detail', component: 'exam-detail', entity: 'exam', position: 'main' },
      { id: 'prescription-form', component: 'prescription-form-optician', entity: 'prescription', position: 'main' },
    ]},
    { path: '/eyewear', name: 'Eyewear', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'eyewear-filters', component: 'eyewear-filters', entity: 'product', position: 'main' },
      { id: 'eyewear-grid', component: 'eyewear-grid', entity: 'product', position: 'main' },
    ]},
    { path: '/orders', name: 'Orders', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'order-filters', component: 'order-filters-optician', entity: 'order', position: 'main' },
      { id: 'order-table', component: 'order-table-optician', entity: 'order', position: 'main' },
    ]},
    { path: '/orders/:id', name: 'Order Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'order-detail', component: 'order-detail-optician', entity: 'order', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'customer-table-optician', entity: 'customer', position: 'main' },
    ]},
    { path: '/customers/:id', name: 'Customer Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-profile', component: 'customer-profile-optician', entity: 'customer', position: 'main' },
      { id: 'customer-prescriptions', component: 'customer-prescriptions-optician', entity: 'prescription', position: 'main' },
      { id: 'customer-orders', component: 'customer-orders-optician', entity: 'order', position: 'main' },
    ]},
    { path: '/book', name: 'Book Exam', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'booking-form', component: 'public-booking-optician', entity: 'appointment', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/appointments', entity: 'appointment', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/appointments', entity: 'appointment', operation: 'create' },
    { method: 'GET', path: '/exams', entity: 'exam', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/eyewear', entity: 'product', operation: 'list' },
    { method: 'GET', path: '/orders', entity: 'order', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    appointment: {
      defaultFields: [
        { name: 'appointment_date', type: 'datetime', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'duration', type: 'integer' },
        { name: 'status', type: 'enum', required: true },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'hasOne', target: 'exam' },
      ],
    },
    exam: {
      defaultFields: [
        { name: 'exam_date', type: 'datetime', required: true },
        { name: 'exam_type', type: 'enum', required: true },
        { name: 'visual_acuity_od', type: 'string' },
        { name: 'visual_acuity_os', type: 'string' },
        { name: 'findings', type: 'json' },
        { name: 'recommendations', type: 'text' },
        { name: 'next_exam_date', type: 'date' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'appointment' },
        { type: 'hasOne', target: 'prescription' },
      ],
    },
    prescription: {
      defaultFields: [
        { name: 'rx_date', type: 'date', required: true },
        { name: 'expiry_date', type: 'date' },
        { name: 'sphere_od', type: 'string' },
        { name: 'sphere_os', type: 'string' },
        { name: 'cylinder_od', type: 'string' },
        { name: 'cylinder_os', type: 'string' },
        { name: 'axis_od', type: 'string' },
        { name: 'axis_os', type: 'string' },
        { name: 'add_od', type: 'string' },
        { name: 'add_os', type: 'string' },
        { name: 'pd', type: 'string' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'exam' },
      ],
    },
    product: {
      defaultFields: [
        { name: 'sku', type: 'string', required: true },
        { name: 'name', type: 'string', required: true },
        { name: 'brand', type: 'string' },
        { name: 'category', type: 'enum', required: true },
        { name: 'frame_type', type: 'enum' },
        { name: 'material', type: 'string' },
        { name: 'color', type: 'string' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'images', type: 'json' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [],
    },
    order: {
      defaultFields: [
        { name: 'order_number', type: 'string', required: true },
        { name: 'order_date', type: 'datetime', required: true },
        { name: 'frame', type: 'json' },
        { name: 'lenses', type: 'json' },
        { name: 'lens_options', type: 'json' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'insurance_coverage', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'deposit', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
        { name: 'lab_order_date', type: 'date' },
        { name: 'ready_date', type: 'date' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'prescription' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'date_of_birth', type: 'date' },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone', required: true },
        { name: 'address', type: 'json' },
        { name: 'insurance_info', type: 'json' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'appointment' },
        { type: 'hasMany', target: 'exam' },
        { type: 'hasMany', target: 'prescription' },
        { type: 'hasMany', target: 'order' },
      ],
    },
  },
};

export default opticianBlueprint;
