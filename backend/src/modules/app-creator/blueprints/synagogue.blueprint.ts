import { Blueprint } from './blueprint.interface';

/**
 * Synagogue Blueprint
 */
export const synagogueBlueprint: Blueprint = {
  appType: 'synagogue',
  description: 'Synagogue app with services, education, events, and community management',

  coreEntities: ['service', 'class', 'member', 'event', 'donation', 'mitzvah'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Services', path: '/services', icon: 'Calendar' },
        { label: 'Education', path: '/classes', icon: 'BookOpen' },
        { label: 'Members', path: '/members', icon: 'Users' },
        { label: 'Events', path: '/events', icon: 'Star' },
        { label: 'Donations', path: '/donations', icon: 'Heart' },
        { label: 'B\'nai Mitzvah', path: '/mitzvah', icon: 'Award' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'upcoming-services', component: 'appointment-list', entity: 'service', position: 'main' },
    ]},
    { path: '/services', name: 'Services', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'service-calendar', component: 'appointment-calendar', entity: 'service', position: 'main' },
    ]},
    { path: '/classes', name: 'Education', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'class-grid', component: 'product-grid', entity: 'class', position: 'main' },
    ]},
    { path: '/members', name: 'Members', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'member-table', component: 'data-table', entity: 'member', position: 'main' },
    ]},
    { path: '/events', name: 'Events', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'event-calendar', component: 'appointment-calendar', entity: 'event', position: 'main' },
    ]},
    { path: '/donations', name: 'Donations', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'donation-table', component: 'data-table', entity: 'donation', position: 'main' },
    ]},
    { path: '/mitzvah', name: 'B\'nai Mitzvah', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'mitzvah-table', component: 'data-table', entity: 'mitzvah', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/services', entity: 'service', operation: 'list' },
    { method: 'POST', path: '/services', entity: 'service', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/classes', entity: 'class', operation: 'list' },
    { method: 'GET', path: '/members', entity: 'member', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/members', entity: 'member', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/events', entity: 'event', operation: 'list' },
    { method: 'GET', path: '/donations', entity: 'donation', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/donations', entity: 'donation', operation: 'create' },
    { method: 'GET', path: '/mitzvah', entity: 'mitzvah', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    service: {
      defaultFields: [
        { name: 'service_name', type: 'string', required: true },
        { name: 'service_type', type: 'enum', required: true },
        { name: 'service_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'rabbi', type: 'string' },
        { name: 'cantor', type: 'string' },
        { name: 'torah_portion', type: 'string' },
        { name: 'haftarah', type: 'string' },
        { name: 'location', type: 'string' },
        { name: 'is_shabbat', type: 'boolean' },
        { name: 'is_holiday', type: 'boolean' },
        { name: 'holiday_name', type: 'string' },
        { name: 'special_notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
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
        { name: 'grade_level', type: 'string' },
        { name: 'location', type: 'string' },
        { name: 'max_students', type: 'integer' },
        { name: 'enrolled', type: 'integer' },
        { name: 'tuition', type: 'decimal' },
        { name: 'curriculum', type: 'json' },
        { name: 'is_hebrew_school', type: 'boolean' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
    member: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'hebrew_name', type: 'string' },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'family_members', type: 'json' },
        { name: 'membership_type', type: 'enum' },
        { name: 'membership_date', type: 'date' },
        { name: 'dues_status', type: 'enum' },
        { name: 'yahrzeit_dates', type: 'json' },
        { name: 'committee_participation', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'donation' },
        { type: 'hasMany', target: 'mitzvah' },
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
        { name: 'location', type: 'string' },
        { name: 'organizer', type: 'string' },
        { name: 'capacity', type: 'integer' },
        { name: 'rsvp_required', type: 'boolean' },
        { name: 'fee', type: 'decimal' },
        { name: 'is_kosher', type: 'boolean' },
        { name: 'attendees', type: 'json' },
        { name: 'image_url', type: 'image' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
    donation: {
      defaultFields: [
        { name: 'donation_date', type: 'date', required: true },
        { name: 'amount', type: 'decimal', required: true },
        { name: 'donation_type', type: 'enum', required: true },
        { name: 'fund', type: 'enum' },
        { name: 'payment_method', type: 'enum' },
        { name: 'is_pledge', type: 'boolean' },
        { name: 'pledge_frequency', type: 'enum' },
        { name: 'in_honor_of', type: 'string' },
        { name: 'in_memory_of', type: 'string' },
        { name: 'acknowledgment_sent', type: 'boolean' },
        { name: 'is_tax_deductible', type: 'boolean' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'member' },
      ],
    },
    mitzvah: {
      defaultFields: [
        { name: 'student_name', type: 'string', required: true },
        { name: 'hebrew_name', type: 'string' },
        { name: 'mitzvah_type', type: 'enum', required: true },
        { name: 'mitzvah_date', type: 'date', required: true },
        { name: 'torah_portion', type: 'string' },
        { name: 'haftarah', type: 'string' },
        { name: 'tutor', type: 'string' },
        { name: 'mitzvah_project', type: 'text' },
        { name: 'service_time', type: 'datetime' },
        { name: 'reception_location', type: 'string' },
        { name: 'guest_count', type: 'integer' },
        { name: 'preparation_notes', type: 'json' },
        { name: 'photo_url', type: 'image' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'member' },
      ],
    },
  },
};

export default synagogueBlueprint;
