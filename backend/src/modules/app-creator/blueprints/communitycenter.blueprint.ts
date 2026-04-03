import { Blueprint } from './blueprint.interface';

/**
 * Community Center Blueprint
 */
export const communitycenterBlueprint: Blueprint = {
  appType: 'communitycenter',
  description: 'Community center app with programs, facilities, memberships, and event bookings',

  coreEntities: ['program', 'facility', 'membership', 'event', 'booking', 'instructor'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Programs', path: '/programs', icon: 'GraduationCap' },
        { label: 'Facilities', path: '/facilities', icon: 'Building' },
        { label: 'Members', path: '/members', icon: 'Users' },
        { label: 'Events', path: '/events', icon: 'Calendar' },
        { label: 'Bookings', path: '/bookings', icon: 'CalendarCheck' },
        { label: 'Instructors', path: '/instructors', icon: 'UserCheck' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'upcoming-events', component: 'appointment-list', entity: 'event', position: 'main' },
    ]},
    { path: '/programs', name: 'Programs', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'filters', component: 'filter-form', entity: 'program', position: 'main' },
      { id: 'program-grid', component: 'product-grid', entity: 'program', position: 'main' },
    ]},
    { path: '/facilities', name: 'Facilities', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'facility-grid', component: 'product-grid', entity: 'facility', position: 'main' },
    ]},
    { path: '/members', name: 'Members', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'member-table', component: 'data-table', entity: 'membership', position: 'main' },
    ]},
    { path: '/events', name: 'Events', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'event-calendar', component: 'appointment-calendar', entity: 'event', position: 'main' },
    ]},
    { path: '/bookings', name: 'Bookings', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'booking-calendar', component: 'appointment-calendar', entity: 'booking', position: 'main' },
      { id: 'booking-table', component: 'data-table', entity: 'booking', position: 'main' },
    ]},
    { path: '/instructors', name: 'Instructors', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'instructor-grid', component: 'staff-grid', entity: 'instructor', position: 'main' },
    ]},
    { path: '/activities', name: 'Activities', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'program-grid', component: 'product-grid', entity: 'program', position: 'main' },
    ]},
    { path: '/register', name: 'Register', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'registration-form', component: 'booking-wizard', entity: 'membership', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/programs', entity: 'program', operation: 'list' },
    { method: 'POST', path: '/programs', entity: 'program', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/facilities', entity: 'facility', operation: 'list' },
    { method: 'GET', path: '/members', entity: 'membership', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/members', entity: 'membership', operation: 'create' },
    { method: 'GET', path: '/events', entity: 'event', operation: 'list' },
    { method: 'POST', path: '/events', entity: 'event', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/bookings', entity: 'booking', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/bookings', entity: 'booking', operation: 'create' },
    { method: 'GET', path: '/instructors', entity: 'instructor', operation: 'list' },
  ],

  entityConfig: {
    program: {
      defaultFields: [
        { name: 'program_name', type: 'string', required: true },
        { name: 'category', type: 'enum', required: true },
        { name: 'age_group', type: 'enum' },
        { name: 'description', type: 'text' },
        { name: 'schedule', type: 'json' },
        { name: 'start_date', type: 'date' },
        { name: 'end_date', type: 'date' },
        { name: 'capacity', type: 'integer' },
        { name: 'enrolled', type: 'integer' },
        { name: 'member_fee', type: 'decimal' },
        { name: 'nonmember_fee', type: 'decimal' },
        { name: 'location', type: 'string' },
        { name: 'image_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'instructor' },
        { type: 'belongsTo', target: 'facility' },
      ],
    },
    facility: {
      defaultFields: [
        { name: 'facility_name', type: 'string', required: true },
        { name: 'facility_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'capacity', type: 'integer' },
        { name: 'amenities', type: 'json' },
        { name: 'equipment', type: 'json' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'member_rate', type: 'decimal' },
        { name: 'availability', type: 'json' },
        { name: 'image_url', type: 'image' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'booking' },
        { type: 'hasMany', target: 'program' },
      ],
    },
    membership: {
      defaultFields: [
        { name: 'member_number', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'date_of_birth', type: 'date' },
        { name: 'membership_type', type: 'enum', required: true },
        { name: 'start_date', type: 'date' },
        { name: 'expiry_date', type: 'date' },
        { name: 'family_members', type: 'json' },
        { name: 'emergency_contact', type: 'json' },
        { name: 'programs_enrolled', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'booking' },
      ],
    },
    event: {
      defaultFields: [
        { name: 'event_name', type: 'string', required: true },
        { name: 'event_type', type: 'enum', required: true },
        { name: 'event_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'description', type: 'text' },
        { name: 'location', type: 'string' },
        { name: 'capacity', type: 'integer' },
        { name: 'registered', type: 'integer' },
        { name: 'fee', type: 'decimal' },
        { name: 'image_url', type: 'image' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'facility' },
      ],
    },
    booking: {
      defaultFields: [
        { name: 'booking_number', type: 'string', required: true },
        { name: 'booking_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime', required: true },
        { name: 'contact_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone', required: true },
        { name: 'purpose', type: 'string' },
        { name: 'attendees', type: 'integer' },
        { name: 'equipment_needed', type: 'json' },
        { name: 'fee', type: 'decimal' },
        { name: 'deposit', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'facility' },
        { type: 'belongsTo', target: 'membership' },
      ],
    },
    instructor: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'specialties', type: 'json' },
        { name: 'certifications', type: 'json' },
        { name: 'bio', type: 'text' },
        { name: 'availability', type: 'json' },
        { name: 'photo_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'program' },
      ],
    },
  },
};

export default communitycenterBlueprint;
