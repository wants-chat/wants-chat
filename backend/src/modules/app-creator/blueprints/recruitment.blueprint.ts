import { Blueprint } from './blueprint.interface';

/**
 * Recruitment/HR Blueprint
 */
export const recruitmentBlueprint: Blueprint = {
  appType: 'recruitment',
  description: 'Recruitment agency with job postings, candidates, applications, and pipeline management',

  coreEntities: ['job', 'candidate', 'application', 'interview', 'client', 'placement'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Jobs', path: '/jobs', icon: 'Briefcase' },
        { label: 'Candidates', path: '/candidates', icon: 'Users' },
        { label: 'Applications', path: '/applications', icon: 'FileText' },
        { label: 'Interviews', path: '/interviews', icon: 'Calendar' },
        { label: 'Clients', path: '/clients', icon: 'Building2' },
        { label: 'Placements', path: '/placements', icon: 'CheckCircle' },
      ]}},
      { id: 'recruitment-stats', component: 'recruitment-stats', position: 'main' },
      { id: 'pipeline-overview', component: 'pipeline-overview', entity: 'application', position: 'main' },
      { id: 'upcoming-interviews', component: 'interview-list-upcoming', entity: 'interview', position: 'main' },
    ]},
    { path: '/jobs', name: 'Jobs', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'job-filters', component: 'job-filters-recruitment', entity: 'job', position: 'main' },
      { id: 'job-table', component: 'job-table-recruitment', entity: 'job', position: 'main' },
    ]},
    { path: '/jobs/:id', name: 'Job Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'job-header', component: 'job-header-recruitment', entity: 'job', position: 'main' },
      { id: 'job-pipeline', component: 'job-pipeline', entity: 'application', position: 'main' },
    ]},
    { path: '/jobs/new', name: 'New Job', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'job-form', component: 'job-form-recruitment', entity: 'job', position: 'main' },
    ]},
    { path: '/candidates', name: 'Candidates', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'candidate-filters', component: 'candidate-filters', entity: 'candidate', position: 'main' },
      { id: 'candidate-table', component: 'candidate-table', entity: 'candidate', position: 'main' },
    ]},
    { path: '/candidates/:id', name: 'Candidate Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'candidate-profile', component: 'candidate-profile', entity: 'candidate', position: 'main' },
      { id: 'candidate-applications', component: 'candidate-applications', entity: 'application', position: 'main' },
    ]},
    { path: '/applications', name: 'Applications', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'application-pipeline', component: 'application-pipeline', entity: 'application', position: 'main' },
    ]},
    { path: '/applications/:id', name: 'Application Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'application-detail', component: 'application-detail', entity: 'application', position: 'main' },
    ]},
    { path: '/interviews', name: 'Interviews', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'interview-calendar', component: 'interview-calendar', entity: 'interview', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-table', component: 'client-table-recruitment', entity: 'client', position: 'main' },
    ]},
    { path: '/clients/:id', name: 'Client Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-profile', component: 'client-profile-recruitment', entity: 'client', position: 'main' },
      { id: 'client-jobs', component: 'client-jobs', entity: 'job', position: 'main' },
    ]},
    { path: '/placements', name: 'Placements', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'placement-table', component: 'placement-table', entity: 'placement', position: 'main' },
    ]},
    { path: '/careers', name: 'Career Page', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'public-jobs', component: 'public-job-board', entity: 'job', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/jobs', entity: 'job', operation: 'list' },
    { method: 'POST', path: '/jobs', entity: 'job', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/candidates', entity: 'candidate', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/candidates', entity: 'candidate', operation: 'create' },
    { method: 'GET', path: '/applications', entity: 'application', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/applications', entity: 'application', operation: 'create' },
    { method: 'GET', path: '/interviews', entity: 'interview', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/placements', entity: 'placement', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    job: {
      defaultFields: [
        { name: 'title', type: 'string', required: true },
        { name: 'department', type: 'string' },
        { name: 'type', type: 'enum', required: true },
        { name: 'location', type: 'string' },
        { name: 'remote', type: 'enum' },
        { name: 'salary_min', type: 'decimal' },
        { name: 'salary_max', type: 'decimal' },
        { name: 'description', type: 'text', required: true },
        { name: 'requirements', type: 'json' },
        { name: 'benefits', type: 'json' },
        { name: 'status', type: 'enum', required: true },
        { name: 'posted_date', type: 'date' },
        { name: 'closing_date', type: 'date' },
        { name: 'openings', type: 'integer' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'hasMany', target: 'application' },
      ],
    },
    candidate: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'location', type: 'string' },
        { name: 'resume_url', type: 'url' },
        { name: 'linkedin_url', type: 'url' },
        { name: 'skills', type: 'json' },
        { name: 'experience_years', type: 'integer' },
        { name: 'current_company', type: 'string' },
        { name: 'current_title', type: 'string' },
        { name: 'expected_salary', type: 'decimal' },
        { name: 'availability', type: 'string' },
        { name: 'source', type: 'enum' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [{ type: 'hasMany', target: 'application' }],
    },
    application: {
      defaultFields: [
        { name: 'status', type: 'enum', required: true },
        { name: 'stage', type: 'enum', required: true },
        { name: 'applied_date', type: 'date', required: true },
        { name: 'cover_letter', type: 'text' },
        { name: 'rating', type: 'integer' },
        { name: 'feedback', type: 'text' },
        { name: 'disqualification_reason', type: 'string' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'job' },
        { type: 'belongsTo', target: 'candidate' },
        { type: 'hasMany', target: 'interview' },
      ],
    },
    interview: {
      defaultFields: [
        { name: 'type', type: 'enum', required: true },
        { name: 'date', type: 'date', required: true },
        { name: 'time', type: 'datetime', required: true },
        { name: 'duration_minutes', type: 'integer' },
        { name: 'location', type: 'string' },
        { name: 'video_link', type: 'url' },
        { name: 'interviewers', type: 'json' },
        { name: 'status', type: 'enum', required: true },
        { name: 'feedback', type: 'text' },
        { name: 'rating', type: 'integer' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [{ type: 'belongsTo', target: 'application' }],
    },
    client: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'industry', type: 'string' },
        { name: 'size', type: 'enum' },
        { name: 'website', type: 'url' },
        { name: 'contact_name', type: 'string' },
        { name: 'contact_email', type: 'email' },
        { name: 'contact_phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'contract_terms', type: 'json' },
        { name: 'status', type: 'enum' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'job' },
        { type: 'hasMany', target: 'placement' },
      ],
    },
    placement: {
      defaultFields: [
        { name: 'start_date', type: 'date', required: true },
        { name: 'salary', type: 'decimal', required: true },
        { name: 'fee', type: 'decimal' },
        { name: 'fee_type', type: 'enum' },
        { name: 'guarantee_period', type: 'integer' },
        { name: 'status', type: 'enum', required: true },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'job' },
        { type: 'belongsTo', target: 'candidate' },
        { type: 'belongsTo', target: 'client' },
      ],
    },
  },
};

export default recruitmentBlueprint;
