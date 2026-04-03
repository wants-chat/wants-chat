import { Blueprint } from './blueprint.interface';

/**
 * Hindu Temple Blueprint
 */
export const hindutempleBlueprint: Blueprint = {
  appType: 'hindutemple',
  description: 'Hindu temple app with puja services, events, classes, and devotee management',

  coreEntities: ['puja', 'event', 'class', 'devotee', 'priest', 'donation'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Puja Services', path: '/pujas', icon: 'Flame' },
        { label: 'Events', path: '/events', icon: 'Calendar' },
        { label: 'Classes', path: '/classes', icon: 'BookOpen' },
        { label: 'Devotees', path: '/devotees', icon: 'Users' },
        { label: 'Priests', path: '/priests', icon: 'UserCheck' },
        { label: 'Donations', path: '/donations', icon: 'Heart' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'upcoming-pujas', component: 'appointment-list', entity: 'puja', position: 'main' },
    ]},
    { path: '/pujas', name: 'Puja Services', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'puja-grid', component: 'product-grid', entity: 'puja', position: 'main' },
    ]},
    { path: '/events', name: 'Events', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'event-calendar', component: 'appointment-calendar', entity: 'event', position: 'main' },
    ]},
    { path: '/classes', name: 'Classes', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'class-grid', component: 'product-grid', entity: 'class', position: 'main' },
    ]},
    { path: '/devotees', name: 'Devotees', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'devotee-table', component: 'data-table', entity: 'devotee', position: 'main' },
    ]},
    { path: '/priests', name: 'Priests', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'priest-grid', component: 'staff-grid', entity: 'priest', position: 'main' },
    ]},
    { path: '/donations', name: 'Donations', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'donation-table', component: 'data-table', entity: 'donation', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/pujas', entity: 'puja', operation: 'list' },
    { method: 'POST', path: '/pujas', entity: 'puja', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/events', entity: 'event', operation: 'list' },
    { method: 'POST', path: '/events', entity: 'event', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/classes', entity: 'class', operation: 'list' },
    { method: 'GET', path: '/devotees', entity: 'devotee', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/devotees', entity: 'devotee', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/priests', entity: 'priest', operation: 'list' },
    { method: 'GET', path: '/donations', entity: 'donation', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/donations', entity: 'donation', operation: 'create' },
  ],

  entityConfig: {
    puja: {
      defaultFields: [
        { name: 'puja_name', type: 'string', required: true },
        { name: 'deity', type: 'string', required: true },
        { name: 'puja_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'regular_schedule', type: 'json' },
        { name: 'duration_minutes', type: 'integer' },
        { name: 'offerings_required', type: 'json' },
        { name: 'dakshina_amount', type: 'decimal' },
        { name: 'significance', type: 'text' },
        { name: 'mantras', type: 'json' },
        { name: 'home_puja_available', type: 'boolean' },
        { name: 'image_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'priest' },
      ],
    },
    event: {
      defaultFields: [
        { name: 'event_name', type: 'string', required: true },
        { name: 'event_type', type: 'enum', required: true },
        { name: 'event_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime' },
        { name: 'end_time', type: 'datetime' },
        { name: 'deity', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'hindu_calendar_date', type: 'string' },
        { name: 'nakshatra', type: 'string' },
        { name: 'tithi', type: 'string' },
        { name: 'special_pujas', type: 'json' },
        { name: 'prasadam_distribution', type: 'boolean' },
        { name: 'cultural_program', type: 'json' },
        { name: 'image_url', type: 'image' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
    class: {
      defaultFields: [
        { name: 'class_name', type: 'string', required: true },
        { name: 'class_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'teacher', type: 'string' },
        { name: 'day_of_week', type: 'enum' },
        { name: 'start_time', type: 'datetime' },
        { name: 'end_time', type: 'datetime' },
        { name: 'age_group', type: 'string' },
        { name: 'location', type: 'string' },
        { name: 'max_students', type: 'integer' },
        { name: 'enrolled', type: 'integer' },
        { name: 'fee', type: 'decimal' },
        { name: 'curriculum', type: 'json' },
        { name: 'language', type: 'string' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
    devotee: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'family_members', type: 'json' },
        { name: 'gotra', type: 'string' },
        { name: 'nakshatra', type: 'string' },
        { name: 'rashi', type: 'string' },
        { name: 'membership_type', type: 'enum' },
        { name: 'membership_date', type: 'date' },
        { name: 'favorite_deities', type: 'json' },
        { name: 'preferred_pujas', type: 'json' },
        { name: 'volunteer_interests', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'donation' },
      ],
    },
    priest: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'title', type: 'string' },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'specializations', type: 'json' },
        { name: 'vedic_training', type: 'json' },
        { name: 'languages', type: 'json' },
        { name: 'home_visits', type: 'boolean' },
        { name: 'availability', type: 'json' },
        { name: 'bio', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'puja' },
      ],
    },
    donation: {
      defaultFields: [
        { name: 'donation_date', type: 'date', required: true },
        { name: 'amount', type: 'decimal', required: true },
        { name: 'donation_type', type: 'enum', required: true },
        { name: 'purpose', type: 'enum' },
        { name: 'deity', type: 'string' },
        { name: 'payment_method', type: 'enum' },
        { name: 'is_recurring', type: 'boolean' },
        { name: 'recurring_frequency', type: 'enum' },
        { name: 'in_memory_of', type: 'string' },
        { name: 'for_occasion', type: 'string' },
        { name: 'anonymous', type: 'boolean' },
        { name: 'receipt_sent', type: 'boolean' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'devotee' },
      ],
    },
  },
};

export default hindutempleBlueprint;
