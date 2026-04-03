import { Blueprint } from './blueprint.interface';

/**
 * Coding Bootcamp / Tech School Blueprint
 */
export const codingbootcampBlueprint: Blueprint = {
  appType: 'codingbootcamp',
  description: 'Coding bootcamp app with cohorts, students, curriculum, projects, and job placement',

  coreEntities: ['cohort', 'student', 'instructor', 'curriculum', 'project', 'job_placement'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Cohorts', path: '/cohorts', icon: 'GraduationCap' },
        { label: 'Students', path: '/students', icon: 'Users' },
        { label: 'Instructors', path: '/instructors', icon: 'UserCheck' },
        { label: 'Curriculum', path: '/curriculum', icon: 'BookOpen' },
        { label: 'Projects', path: '/projects', icon: 'Code' },
        { label: 'Placements', path: '/placements', icon: 'Briefcase' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'active-cohorts', component: 'appointment-list', entity: 'cohort', position: 'main' },
    ]},
    { path: '/cohorts', name: 'Cohorts', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'cohort-table', component: 'data-table', entity: 'cohort', position: 'main' },
    ]},
    { path: '/students', name: 'Students', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'student-table', component: 'data-table', entity: 'student', position: 'main' },
    ]},
    { path: '/instructors', name: 'Instructors', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'instructor-grid', component: 'staff-grid', entity: 'instructor', position: 'main' },
    ]},
    { path: '/curriculum', name: 'Curriculum', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'curriculum-table', component: 'data-table', entity: 'curriculum', position: 'main' },
    ]},
    { path: '/projects', name: 'Projects', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'project-grid', component: 'product-grid', entity: 'project', position: 'main' },
    ]},
    { path: '/placements', name: 'Job Placements', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'placement-table', component: 'data-table', entity: 'job_placement', position: 'main' },
    ]},
    { path: '/apply', name: 'Apply', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'apply-form', component: 'booking-wizard', entity: 'student', position: 'main' },
    ]},
    { path: '/programs', name: 'Programs', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'program-grid', component: 'product-grid', entity: 'curriculum', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/cohorts', entity: 'cohort', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/students', entity: 'student', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/students', entity: 'student', operation: 'create' },
    { method: 'GET', path: '/instructors', entity: 'instructor', operation: 'list' },
    { method: 'GET', path: '/curriculum', entity: 'curriculum', operation: 'list' },
    { method: 'GET', path: '/projects', entity: 'project', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/placements', entity: 'job_placement', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    cohort: {
      defaultFields: [
        { name: 'cohort_name', type: 'string', required: true },
        { name: 'program', type: 'enum', required: true },
        { name: 'format', type: 'enum', required: true },
        { name: 'start_date', type: 'date', required: true },
        { name: 'end_date', type: 'date' },
        { name: 'duration_weeks', type: 'integer' },
        { name: 'capacity', type: 'integer' },
        { name: 'enrolled', type: 'integer' },
        { name: 'schedule', type: 'json' },
        { name: 'tuition', type: 'decimal' },
        { name: 'location', type: 'string' },
        { name: 'graduation_rate', type: 'decimal' },
        { name: 'job_placement_rate', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'curriculum' },
        { type: 'hasMany', target: 'student' },
      ],
    },
    student: {
      defaultFields: [
        { name: 'student_id', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'github_username', type: 'string' },
        { name: 'linkedin_url', type: 'string' },
        { name: 'portfolio_url', type: 'string' },
        { name: 'prior_experience', type: 'enum' },
        { name: 'education', type: 'json' },
        { name: 'enrollment_date', type: 'date' },
        { name: 'payment_plan', type: 'enum' },
        { name: 'scholarship', type: 'json' },
        { name: 'attendance', type: 'json' },
        { name: 'grades', type: 'json' },
        { name: 'projects_completed', type: 'json' },
        { name: 'graduation_date', type: 'date' },
        { name: 'photo_url', type: 'image' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'cohort' },
        { type: 'hasMany', target: 'project' },
        { type: 'hasOne', target: 'job_placement' },
      ],
    },
    instructor: {
      defaultFields: [
        { name: 'instructor_id', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'title', type: 'string' },
        { name: 'specializations', type: 'json' },
        { name: 'technologies', type: 'json' },
        { name: 'industry_experience', type: 'json' },
        { name: 'years_teaching', type: 'integer' },
        { name: 'bio', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'github_url', type: 'string' },
        { name: 'linkedin_url', type: 'string' },
        { name: 'schedule', type: 'json' },
        { name: 'rating', type: 'decimal' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'cohort' },
      ],
    },
    curriculum: {
      defaultFields: [
        { name: 'program_name', type: 'string', required: true },
        { name: 'program_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'duration_weeks', type: 'integer', required: true },
        { name: 'format_options', type: 'json' },
        { name: 'modules', type: 'json' },
        { name: 'technologies', type: 'json' },
        { name: 'prerequisites', type: 'json' },
        { name: 'learning_outcomes', type: 'json' },
        { name: 'projects_required', type: 'integer' },
        { name: 'tuition', type: 'decimal' },
        { name: 'financing_options', type: 'json' },
        { name: 'career_paths', type: 'json' },
        { name: 'image_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'cohort' },
      ],
    },
    project: {
      defaultFields: [
        { name: 'project_name', type: 'string', required: true },
        { name: 'project_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'technologies_used', type: 'json' },
        { name: 'github_url', type: 'string' },
        { name: 'live_url', type: 'string' },
        { name: 'demo_video_url', type: 'string' },
        { name: 'screenshots', type: 'json' },
        { name: 'submission_date', type: 'date' },
        { name: 'grade', type: 'decimal' },
        { name: 'feedback', type: 'text' },
        { name: 'is_featured', type: 'boolean' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'student' },
      ],
    },
    job_placement: {
      defaultFields: [
        { name: 'placement_date', type: 'date', required: true },
        { name: 'company_name', type: 'string', required: true },
        { name: 'job_title', type: 'string', required: true },
        { name: 'salary', type: 'decimal' },
        { name: 'location', type: 'string' },
        { name: 'remote', type: 'boolean' },
        { name: 'job_type', type: 'enum' },
        { name: 'days_to_placement', type: 'integer' },
        { name: 'offer_details', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'student' },
      ],
    },
  },
};

export default codingbootcampBlueprint;
