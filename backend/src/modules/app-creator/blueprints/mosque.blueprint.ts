import { Blueprint } from './blueprint.interface';

/**
 * Mosque/Islamic Center Blueprint
 */
export const mosqueBlueprint: Blueprint = {
  appType: 'mosque',
  description: 'Islamic center app with prayers, classes, events, and community services',

  coreEntities: ['prayer', 'class', 'member', 'event', 'donation', 'announcement'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Prayer Times', path: '/prayers', icon: 'Clock' },
        { label: 'Classes', path: '/classes', icon: 'BookOpen' },
        { label: 'Members', path: '/members', icon: 'Users' },
        { label: 'Events', path: '/events', icon: 'Calendar' },
        { label: 'Donations', path: '/donations', icon: 'Heart' },
        { label: 'Announcements', path: '/announcements', icon: 'Bell' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'prayer-times', component: 'appointment-list', entity: 'prayer', position: 'main' },
    ]},
    { path: '/prayers', name: 'Prayer Times', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'prayer-table', component: 'data-table', entity: 'prayer', position: 'main' },
    ]},
    { path: '/classes', name: 'Classes', layout: 'dashboard', requiresAuth: true, sections: [
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
    { path: '/announcements', name: 'Announcements', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'announcement-table', component: 'data-table', entity: 'announcement', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/prayers', entity: 'prayer', operation: 'list' },
    { method: 'POST', path: '/prayers', entity: 'prayer', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/classes', entity: 'class', operation: 'list' },
    { method: 'GET', path: '/members', entity: 'member', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/members', entity: 'member', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/events', entity: 'event', operation: 'list' },
    { method: 'POST', path: '/events', entity: 'event', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/donations', entity: 'donation', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/donations', entity: 'donation', operation: 'create' },
    { method: 'GET', path: '/announcements', entity: 'announcement', operation: 'list' },
  ],

  entityConfig: {
    prayer: {
      defaultFields: [
        { name: 'prayer_name', type: 'enum', required: true },
        { name: 'prayer_date', type: 'date', required: true },
        { name: 'adhan_time', type: 'datetime', required: true },
        { name: 'iqama_time', type: 'datetime', required: true },
        { name: 'imam', type: 'string' },
        { name: 'khutbah_topic', type: 'string' },
        { name: 'special_notes', type: 'text' },
        { name: 'is_jumuah', type: 'boolean' },
        { name: 'is_eid', type: 'boolean' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
    class: {
      defaultFields: [
        { name: 'class_name', type: 'string', required: true },
        { name: 'class_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'instructor', type: 'string' },
        { name: 'day_of_week', type: 'enum' },
        { name: 'start_time', type: 'datetime' },
        { name: 'end_time', type: 'datetime' },
        { name: 'age_group', type: 'string' },
        { name: 'gender', type: 'enum' },
        { name: 'location', type: 'string' },
        { name: 'max_students', type: 'integer' },
        { name: 'enrolled', type: 'integer' },
        { name: 'fee', type: 'decimal' },
        { name: 'materials', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
    member: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'family_members', type: 'json' },
        { name: 'membership_type', type: 'enum' },
        { name: 'membership_date', type: 'date' },
        { name: 'classes_enrolled', type: 'json' },
        { name: 'volunteer_interests', type: 'json' },
        { name: 'skills', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'donation' },
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
        { name: 'speaker', type: 'string' },
        { name: 'capacity', type: 'integer' },
        { name: 'registration_required', type: 'boolean' },
        { name: 'fee', type: 'decimal' },
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
        { name: 'purpose', type: 'enum' },
        { name: 'payment_method', type: 'enum' },
        { name: 'is_recurring', type: 'boolean' },
        { name: 'recurring_frequency', type: 'enum' },
        { name: 'is_zakat', type: 'boolean' },
        { name: 'is_sadaqah', type: 'boolean' },
        { name: 'donor_name', type: 'string' },
        { name: 'donor_anonymous', type: 'boolean' },
        { name: 'receipt_sent', type: 'boolean' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'member' },
      ],
    },
    announcement: {
      defaultFields: [
        { name: 'title', type: 'string', required: true },
        { name: 'content', type: 'text', required: true },
        { name: 'announcement_date', type: 'date', required: true },
        { name: 'announcement_type', type: 'enum' },
        { name: 'priority', type: 'enum' },
        { name: 'display_until', type: 'date' },
        { name: 'send_email', type: 'boolean' },
        { name: 'send_sms', type: 'boolean' },
        { name: 'attachment_url', type: 'string' },
        { name: 'is_published', type: 'boolean' },
      ],
      relationships: [],
    },
  },
};

export default mosqueBlueprint;
