import { Blueprint } from './blueprint.interface';

/**
 * Job Board Blueprint
 *
 * Defines the structure for a job board application:
 * - Job listings
 * - Company profiles
 * - Job applications
 * - Candidate profiles
 * - Search and filters
 */
export const jobboardBlueprint: Blueprint = {
  appType: 'jobboard',
  description: 'Job board with listings, applications, and company profiles',

  coreEntities: ['job', 'company', 'application', 'candidate', 'saved_job', 'review'],

  commonFields: {
    timestamps: true,
    softDelete: true,
    userOwnership: true,
  },

  pages: [
    // Home
    {
      path: '/',
      name: 'Home',
      layout: 'landing',
      sections: [
        {
          id: 'hero',
          component: 'hero',
          position: 'full',
          props: {
            title: 'Find Your Dream Job',
            subtitle: 'Thousands of jobs from top companies',
            primaryCTA: 'Search Jobs',
            primaryCTALink: '/jobs',
          },
        },
        {
          id: 'search',
          component: 'job-search',
          entity: 'job',
          position: 'main',
        },
        {
          id: 'featured-jobs',
          component: 'job-list',
          entity: 'job',
          position: 'main',
          props: {
            title: 'Featured Jobs',
            limit: 6,
            featured: true,
          },
        },
        {
          id: 'top-companies',
          component: 'company-grid',
          entity: 'company',
          position: 'main',
          props: {
            title: 'Top Companies Hiring',
            limit: 8,
          },
        },
        {
          id: 'categories',
          component: 'category-grid',
          position: 'main',
          props: {
            title: 'Browse by Category',
          },
        },
      ],
    },
    // Job Listings
    {
      path: '/jobs',
      name: 'Jobs',
      layout: 'two-column',
      sections: [
        {
          id: 'filters',
          component: 'job-filters',
          entity: 'job',
          position: 'sidebar',
          props: {
            filters: ['category', 'location', 'type', 'experience', 'salary_range', 'remote'],
          },
        },
        {
          id: 'job-list',
          component: 'job-list',
          entity: 'job',
          position: 'main',
          props: {
            showPagination: true,
            showSort: true,
          },
        },
      ],
    },
    // Job Detail
    {
      path: '/jobs/:id',
      name: 'Job Detail',
      layout: 'two-column',
      sections: [
        {
          id: 'job-detail',
          component: 'job-detail',
          entity: 'job',
          position: 'main',
        },
        {
          id: 'apply-card',
          component: 'apply-card',
          entity: 'application',
          position: 'sidebar',
        },
        {
          id: 'company-card',
          component: 'company-card',
          entity: 'company',
          position: 'sidebar',
        },
        {
          id: 'similar-jobs',
          component: 'job-list',
          entity: 'job',
          position: 'main',
          props: {
            title: 'Similar Jobs',
            limit: 4,
            similar: true,
          },
        },
      ],
    },
    // Companies
    {
      path: '/companies',
      name: 'Companies',
      layout: 'single-column',
      sections: [
        {
          id: 'search',
          component: 'search-bar',
          position: 'main',
        },
        {
          id: 'companies',
          component: 'company-grid',
          entity: 'company',
          position: 'main',
          props: {
            showPagination: true,
          },
        },
      ],
    },
    // Company Profile
    {
      path: '/companies/:id',
      name: 'Company Profile',
      layout: 'single-column',
      sections: [
        {
          id: 'company-profile',
          component: 'company-profile',
          entity: 'company',
          position: 'main',
        },
        {
          id: 'company-jobs',
          component: 'job-list',
          entity: 'job',
          position: 'main',
          props: {
            title: 'Open Positions',
          },
        },
        {
          id: 'reviews',
          component: 'review-list',
          entity: 'review',
          position: 'main',
          props: {
            title: 'Company Reviews',
          },
        },
      ],
    },
    // Apply
    {
      path: '/jobs/:id/apply',
      name: 'Apply',
      layout: 'single-column',
      requiresAuth: true,
      sections: [
        {
          id: 'application-form',
          component: 'application-form',
          entity: 'application',
          position: 'main',
        },
      ],
    },
    // My Applications
    {
      path: '/applications',
      name: 'My Applications',
      layout: 'single-column',
      requiresAuth: true,
      sections: [
        {
          id: 'applications',
          component: 'application-list',
          entity: 'application',
          position: 'main',
          props: {
            title: 'My Applications',
            userScoped: true,
          },
        },
      ],
    },
    // Saved Jobs
    {
      path: '/saved',
      name: 'Saved Jobs',
      layout: 'single-column',
      requiresAuth: true,
      sections: [
        {
          id: 'saved-jobs',
          component: 'job-list',
          entity: 'saved_job',
          position: 'main',
          props: {
            title: 'Saved Jobs',
            userScoped: true,
          },
        },
      ],
    },
    // Candidate Profile
    {
      path: '/profile',
      name: 'My Profile',
      layout: 'single-column',
      requiresAuth: true,
      sections: [
        {
          id: 'profile-form',
          component: 'candidate-profile-form',
          entity: 'candidate',
          position: 'main',
        },
      ],
    },
    // Employer Dashboard
    {
      path: '/employer',
      name: 'Employer Dashboard',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
          props: {
            links: [
              { label: 'Dashboard', path: '/employer', icon: 'LayoutDashboard' },
              { label: 'Jobs', path: '/employer/jobs', icon: 'Briefcase' },
              { label: 'Applications', path: '/employer/applications', icon: 'FileText' },
              { label: 'Company', path: '/employer/company', icon: 'Building' },
            ],
          },
        },
        {
          id: 'stats',
          component: 'stats-cards',
          position: 'main',
          props: {
            stats: ['active_jobs', 'total_applications', 'new_applications', 'views'],
          },
        },
        {
          id: 'recent-applications',
          component: 'application-list',
          entity: 'application',
          position: 'main',
          props: {
            title: 'Recent Applications',
            limit: 10,
          },
        },
      ],
    },
    // Employer Jobs
    {
      path: '/employer/jobs',
      name: 'Manage Jobs',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'jobs-table',
          component: 'data-table',
          entity: 'job',
          position: 'main',
          props: {
            title: 'Your Jobs',
            showCreate: true,
            showEdit: true,
            showDelete: true,
            columns: ['title', 'location', 'type', 'applications_count', 'status', 'created_at'],
          },
        },
      ],
    },
    // Employer Applications
    {
      path: '/employer/applications',
      name: 'Applications',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'applications-table',
          component: 'data-table',
          entity: 'application',
          position: 'main',
          props: {
            title: 'Applications',
            showStatusDropdown: true,
            columns: ['candidate', 'job', 'status', 'applied_at'],
          },
        },
      ],
    },
  ],

  endpoints: [
    // Jobs
    { method: 'GET', path: '/jobs', entity: 'job', operation: 'list' },
    { method: 'GET', path: '/jobs/:id', entity: 'job', operation: 'get' },
    { method: 'POST', path: '/jobs', entity: 'job', operation: 'create', requiresAuth: true },
    { method: 'PUT', path: '/jobs/:id', entity: 'job', operation: 'update', requiresAuth: true },
    { method: 'DELETE', path: '/jobs/:id', entity: 'job', operation: 'delete', requiresAuth: true },

    // Companies
    { method: 'GET', path: '/companies', entity: 'company', operation: 'list' },
    { method: 'GET', path: '/companies/:id', entity: 'company', operation: 'get' },
    { method: 'GET', path: '/companies/:id/jobs', entity: 'job', operation: 'list' },
    { method: 'POST', path: '/companies', entity: 'company', operation: 'create', requiresAuth: true },
    { method: 'PUT', path: '/companies/:id', entity: 'company', operation: 'update', requiresAuth: true },

    // Applications
    { method: 'GET', path: '/applications', entity: 'application', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/applications/:id', entity: 'application', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/jobs/:id/apply', entity: 'application', operation: 'create', requiresAuth: true },
    { method: 'PATCH', path: '/applications/:id/status', entity: 'application', operation: 'update', requiresAuth: true },

    // Candidates
    { method: 'GET', path: '/candidates/:id', entity: 'candidate', operation: 'get', requiresAuth: true },
    { method: 'PUT', path: '/candidates/:id', entity: 'candidate', operation: 'update', requiresAuth: true },

    // Saved Jobs
    { method: 'GET', path: '/saved-jobs', entity: 'saved_job', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/jobs/:id/save', entity: 'saved_job', operation: 'create', requiresAuth: true },
    { method: 'DELETE', path: '/jobs/:id/save', entity: 'saved_job', operation: 'delete', requiresAuth: true },

    // Reviews
    { method: 'GET', path: '/companies/:id/reviews', entity: 'review', operation: 'list' },
    { method: 'POST', path: '/reviews', entity: 'review', operation: 'create', requiresAuth: true },
  ],

  entityConfig: {
    job: {
      defaultFields: [
        { name: 'title', type: 'string', required: true },
        { name: 'slug', type: 'string', required: true },
        { name: 'description', type: 'text', required: true },
        { name: 'requirements', type: 'text' },
        { name: 'responsibilities', type: 'text' },
        { name: 'benefits', type: 'json' },
        { name: 'type', type: 'enum', required: true },
        { name: 'experience_level', type: 'enum' },
        { name: 'location', type: 'string' },
        { name: 'is_remote', type: 'boolean' },
        { name: 'salary_min', type: 'decimal' },
        { name: 'salary_max', type: 'decimal' },
        { name: 'salary_currency', type: 'string' },
        { name: 'salary_period', type: 'enum' },
        { name: 'category', type: 'string' },
        { name: 'skills', type: 'json' },
        { name: 'status', type: 'enum', required: true },
        { name: 'is_featured', type: 'boolean' },
        { name: 'applications_count', type: 'integer' },
        { name: 'views_count', type: 'integer' },
        { name: 'expires_at', type: 'date' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'company' },
        { type: 'hasMany', target: 'application' },
        { type: 'hasMany', target: 'saved_job' },
      ],
    },
    company: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'slug', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'logo_url', type: 'image' },
        { name: 'cover_url', type: 'image' },
        { name: 'website', type: 'url' },
        { name: 'industry', type: 'string' },
        { name: 'size', type: 'enum' },
        { name: 'founded_year', type: 'integer' },
        { name: 'headquarters', type: 'string' },
        { name: 'locations', type: 'json' },
        { name: 'tech_stack', type: 'json' },
        { name: 'culture', type: 'text' },
        { name: 'benefits', type: 'json' },
        { name: 'social_links', type: 'json' },
        { name: 'is_verified', type: 'boolean' },
        { name: 'rating', type: 'decimal' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'user' },
        { type: 'hasMany', target: 'job' },
        { type: 'hasMany', target: 'review' },
      ],
    },
    application: {
      defaultFields: [
        { name: 'status', type: 'enum', required: true },
        { name: 'cover_letter', type: 'text' },
        { name: 'resume_url', type: 'file' },
        { name: 'portfolio_url', type: 'url' },
        { name: 'linkedin_url', type: 'url' },
        { name: 'answers', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'rating', type: 'integer' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'job' },
        { type: 'belongsTo', target: 'candidate' },
        { type: 'belongsTo', target: 'user' },
      ],
    },
    candidate: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'headline', type: 'string' },
        { name: 'bio', type: 'text' },
        { name: 'avatar_url', type: 'image' },
        { name: 'resume_url', type: 'file' },
        { name: 'location', type: 'string' },
        { name: 'experience_years', type: 'integer' },
        { name: 'skills', type: 'json' },
        { name: 'experience', type: 'json' },
        { name: 'education', type: 'json' },
        { name: 'certifications', type: 'json' },
        { name: 'linkedin_url', type: 'url' },
        { name: 'portfolio_url', type: 'url' },
        { name: 'github_url', type: 'url' },
        { name: 'is_open_to_work', type: 'boolean' },
        { name: 'preferred_job_types', type: 'json' },
        { name: 'salary_expectation', type: 'decimal' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'user' },
        { type: 'hasMany', target: 'application' },
      ],
    },
    saved_job: {
      defaultFields: [
        { name: 'saved_at', type: 'datetime', required: true },
        { name: 'notes', type: 'text' },
        { name: 'reminder_date', type: 'datetime' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'job' },
        { type: 'belongsTo', target: 'user' },
      ],
    },
    review: {
      defaultFields: [
        { name: 'rating', type: 'integer', required: true },
        { name: 'title', type: 'string' },
        { name: 'pros', type: 'text' },
        { name: 'cons', type: 'text' },
        { name: 'advice', type: 'text' },
        { name: 'job_title', type: 'string' },
        { name: 'employment_status', type: 'enum' },
        { name: 'is_current', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'company' },
        { type: 'belongsTo', target: 'user' },
      ],
    },
  },
};

export default jobboardBlueprint;
