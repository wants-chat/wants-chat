import { Blueprint } from './blueprint.interface';

/**
 * Homeschool Co-op Blueprint
 */
export const homeschoolBlueprint: Blueprint = {
  appType: 'homeschool',
  description: 'Homeschool co-op with families, classes, curriculum, and resource sharing',

  coreEntities: ['family', 'student', 'class', 'curriculum', 'resource', 'event'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Families', path: '/families', icon: 'Home' },
        { label: 'Students', path: '/students', icon: 'Users' },
        { label: 'Classes', path: '/classes', icon: 'BookOpen' },
        { label: 'Curriculum', path: '/curriculum', icon: 'Library' },
        { label: 'Resources', path: '/resources', icon: 'FolderOpen' },
        { label: 'Events', path: '/events', icon: 'Calendar' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'upcoming-events', component: 'appointment-list', entity: 'event', position: 'main' },
    ]},
    { path: '/families', name: 'Families', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'family-table', component: 'data-table', entity: 'family', position: 'main' },
    ]},
    { path: '/students', name: 'Students', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'student-table', component: 'data-table', entity: 'student', position: 'main' },
    ]},
    { path: '/classes', name: 'Classes', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'class-grid', component: 'product-grid', entity: 'class', position: 'main' },
    ]},
    { path: '/curriculum', name: 'Curriculum', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'curriculum-grid', component: 'product-grid', entity: 'curriculum', position: 'main' },
    ]},
    { path: '/resources', name: 'Resources', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'resource-grid', component: 'product-grid', entity: 'resource', position: 'main' },
    ]},
    { path: '/events', name: 'Events', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'event-calendar', component: 'appointment-calendar', entity: 'event', position: 'main' },
    ]},
    { path: '/join', name: 'Join', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'registration-form', component: 'booking-wizard', entity: 'family', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/families', entity: 'family', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/families', entity: 'family', operation: 'create' },
    { method: 'GET', path: '/students', entity: 'student', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/classes', entity: 'class', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/curriculum', entity: 'curriculum', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/resources', entity: 'resource', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/events', entity: 'event', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    family: {
      defaultFields: [
        { name: 'family_name', type: 'string', required: true },
        { name: 'parent1_name', type: 'string', required: true },
        { name: 'parent1_email', type: 'email', required: true },
        { name: 'parent1_phone', type: 'phone' },
        { name: 'parent2_name', type: 'string' },
        { name: 'parent2_email', type: 'email' },
        { name: 'parent2_phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'join_date', type: 'date' },
        { name: 'homeschool_philosophy', type: 'text' },
        { name: 'willing_to_teach', type: 'json' },
        { name: 'available_days', type: 'json' },
        { name: 'membership_type', type: 'enum' },
        { name: 'dues_paid', type: 'boolean' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'student' },
      ],
    },
    student: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'date_of_birth', type: 'date', required: true },
        { name: 'grade_level', type: 'enum' },
        { name: 'learning_style', type: 'enum' },
        { name: 'interests', type: 'json' },
        { name: 'strengths', type: 'json' },
        { name: 'challenges', type: 'json' },
        { name: 'allergies', type: 'json' },
        { name: 'special_needs', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'family' },
      ],
    },
    class: {
      defaultFields: [
        { name: 'class_name', type: 'string', required: true },
        { name: 'subject', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'grade_levels', type: 'json' },
        { name: 'age_range', type: 'json' },
        { name: 'teacher_name', type: 'string' },
        { name: 'schedule', type: 'json' },
        { name: 'location', type: 'string' },
        { name: 'max_students', type: 'integer' },
        { name: 'enrolled_count', type: 'integer' },
        { name: 'materials_needed', type: 'json' },
        { name: 'fee', type: 'decimal' },
        { name: 'semester', type: 'enum' },
        { name: 'year', type: 'integer' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'curriculum' },
      ],
    },
    curriculum: {
      defaultFields: [
        { name: 'curriculum_name', type: 'string', required: true },
        { name: 'publisher', type: 'string' },
        { name: 'subject', type: 'enum', required: true },
        { name: 'grade_levels', type: 'json' },
        { name: 'description', type: 'text' },
        { name: 'philosophy', type: 'text' },
        { name: 'components', type: 'json' },
        { name: 'cost', type: 'decimal' },
        { name: 'website_url', type: 'string' },
        { name: 'reviews', type: 'json' },
        { name: 'rating', type: 'decimal' },
        { name: 'image_url', type: 'image' },
        { name: 'is_recommended', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'class' },
      ],
    },
    resource: {
      defaultFields: [
        { name: 'resource_name', type: 'string', required: true },
        { name: 'resource_type', type: 'enum', required: true },
        { name: 'category', type: 'enum' },
        { name: 'description', type: 'text' },
        { name: 'subject', type: 'enum' },
        { name: 'grade_levels', type: 'json' },
        { name: 'file_url', type: 'string' },
        { name: 'external_url', type: 'string' },
        { name: 'is_free', type: 'boolean' },
        { name: 'uploaded_by', type: 'string' },
        { name: 'upload_date', type: 'date' },
        { name: 'download_count', type: 'integer' },
        { name: 'is_approved', type: 'boolean' },
      ],
      relationships: [],
    },
    event: {
      defaultFields: [
        { name: 'event_name', type: 'string', required: true },
        { name: 'event_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'event_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime' },
        { name: 'end_time', type: 'datetime' },
        { name: 'location', type: 'string' },
        { name: 'age_range', type: 'json' },
        { name: 'max_attendees', type: 'integer' },
        { name: 'registered_count', type: 'integer' },
        { name: 'cost', type: 'decimal' },
        { name: 'organizer', type: 'string' },
        { name: 'requirements', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
  },
};

export default homeschoolBlueprint;
