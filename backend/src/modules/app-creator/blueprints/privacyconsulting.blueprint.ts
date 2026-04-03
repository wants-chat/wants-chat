import { Blueprint } from './blueprint.interface';

/**
 * Privacy Consulting Blueprint
 */
export const privacyconsultingBlueprint: Blueprint = {
  appType: 'privacyconsulting',
  description: 'Privacy/GDPR consulting app with assessments, compliance tracking, and client management',

  coreEntities: ['assessment', 'client', 'regulation', 'consultant', 'finding', 'remediation'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Assessments', path: '/assessments', icon: 'ClipboardCheck' },
        { label: 'Clients', path: '/clients', icon: 'Briefcase' },
        { label: 'Regulations', path: '/regulations', icon: 'Book' },
        { label: 'Consultants', path: '/consultants', icon: 'Users' },
        { label: 'Findings', path: '/findings', icon: 'AlertTriangle' },
        { label: 'Remediation', path: '/remediation', icon: 'CheckSquare' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'active-assessments', component: 'data-table', entity: 'assessment', position: 'main' },
    ]},
    { path: '/assessments', name: 'Assessments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'assessment-board', component: 'kanban-board', entity: 'assessment', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-table', component: 'data-table', entity: 'client', position: 'main' },
    ]},
    { path: '/regulations', name: 'Regulations', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'regulation-table', component: 'data-table', entity: 'regulation', position: 'main' },
    ]},
    { path: '/consultants', name: 'Consultants', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'consultant-grid', component: 'staff-grid', entity: 'consultant', position: 'main' },
    ]},
    { path: '/findings', name: 'Findings', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'finding-table', component: 'data-table', entity: 'finding', position: 'main' },
    ]},
    { path: '/remediation', name: 'Remediation', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'remediation-board', component: 'kanban-board', entity: 'remediation', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/assessments', entity: 'assessment', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/assessments', entity: 'assessment', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/regulations', entity: 'regulation', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/consultants', entity: 'consultant', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/findings', entity: 'finding', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/remediation', entity: 'remediation', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    assessment: {
      defaultFields: [
        { name: 'assessment_name', type: 'string', required: true },
        { name: 'assessment_type', type: 'enum', required: true },
        { name: 'start_date', type: 'date', required: true },
        { name: 'target_completion', type: 'date' },
        { name: 'actual_completion', type: 'date' },
        { name: 'scope', type: 'text' },
        { name: 'regulations_covered', type: 'json' },
        { name: 'methodology', type: 'text' },
        { name: 'data_inventory', type: 'json' },
        { name: 'systems_reviewed', type: 'json' },
        { name: 'overall_score', type: 'decimal' },
        { name: 'risk_level', type: 'enum' },
        { name: 'findings_count', type: 'integer' },
        { name: 'report_url', type: 'string' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'consultant' },
        { type: 'hasMany', target: 'finding' },
      ],
    },
    client: {
      defaultFields: [
        { name: 'company_name', type: 'string', required: true },
        { name: 'contact_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'industry', type: 'string' },
        { name: 'company_size', type: 'enum' },
        { name: 'jurisdictions', type: 'json' },
        { name: 'regulations_applicable', type: 'json' },
        { name: 'dpo_contact', type: 'json' },
        { name: 'last_assessment', type: 'date' },
        { name: 'compliance_score', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'assessment' },
      ],
    },
    regulation: {
      defaultFields: [
        { name: 'regulation_name', type: 'string', required: true },
        { name: 'abbreviation', type: 'string' },
        { name: 'jurisdiction', type: 'string', required: true },
        { name: 'effective_date', type: 'date' },
        { name: 'description', type: 'text' },
        { name: 'requirements', type: 'json' },
        { name: 'penalties', type: 'text' },
        { name: 'key_principles', type: 'json' },
        { name: 'documentation_url', type: 'string' },
        { name: 'template_questions', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
    consultant: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'title', type: 'string' },
        { name: 'certifications', type: 'json' },
        { name: 'specializations', type: 'json' },
        { name: 'regulations_expertise', type: 'json' },
        { name: 'years_experience', type: 'integer' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'bio', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'availability', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'assessment' },
      ],
    },
    finding: {
      defaultFields: [
        { name: 'finding_title', type: 'string', required: true },
        { name: 'finding_type', type: 'enum', required: true },
        { name: 'severity', type: 'enum', required: true },
        { name: 'regulation_reference', type: 'string' },
        { name: 'requirement', type: 'text' },
        { name: 'current_state', type: 'text' },
        { name: 'gap_description', type: 'text' },
        { name: 'risk_description', type: 'text' },
        { name: 'evidence', type: 'json' },
        { name: 'recommendation', type: 'text' },
        { name: 'priority', type: 'enum' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'assessment' },
        { type: 'hasOne', target: 'remediation' },
      ],
    },
    remediation: {
      defaultFields: [
        { name: 'remediation_name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'action_items', type: 'json' },
        { name: 'owner', type: 'string' },
        { name: 'priority', type: 'enum' },
        { name: 'start_date', type: 'date' },
        { name: 'target_date', type: 'date' },
        { name: 'actual_completion', type: 'date' },
        { name: 'resources_needed', type: 'json' },
        { name: 'budget', type: 'decimal' },
        { name: 'progress_percent', type: 'integer' },
        { name: 'verification_notes', type: 'text' },
        { name: 'evidence_url', type: 'string' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'finding' },
      ],
    },
  },
};

export default privacyconsultingBlueprint;
