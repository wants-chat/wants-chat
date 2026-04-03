import { Blueprint } from './blueprint.interface';

/**
 * Cybersecurity Firm Blueprint
 */
export const cybersecurityBlueprint: Blueprint = {
  appType: 'cybersecurity',
  description: 'Cybersecurity firm app with assessments, incidents, clients, and compliance',

  coreEntities: ['assessment', 'incident', 'vulnerability', 'client', 'consultant', 'compliance'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Assessments', path: '/assessments', icon: 'Shield' },
        { label: 'Incidents', path: '/incidents', icon: 'AlertTriangle' },
        { label: 'Vulnerabilities', path: '/vulnerabilities', icon: 'Bug' },
        { label: 'Clients', path: '/clients', icon: 'Building' },
        { label: 'Consultants', path: '/consultants', icon: 'UserCheck' },
        { label: 'Compliance', path: '/compliance', icon: 'CheckCircle' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'active-incidents', component: 'data-table', entity: 'incident', position: 'main' },
    ]},
    { path: '/assessments', name: 'Assessments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'assessment-board', component: 'kanban-board', entity: 'assessment', position: 'main' },
    ]},
    { path: '/incidents', name: 'Incidents', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'incident-table', component: 'data-table', entity: 'incident', position: 'main' },
    ]},
    { path: '/vulnerabilities', name: 'Vulnerabilities', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'vulnerability-table', component: 'data-table', entity: 'vulnerability', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-table', component: 'data-table', entity: 'client', position: 'main' },
    ]},
    { path: '/consultants', name: 'Consultants', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'consultant-grid', component: 'staff-grid', entity: 'consultant', position: 'main' },
    ]},
    { path: '/compliance', name: 'Compliance', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'compliance-table', component: 'data-table', entity: 'compliance', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/assessments', entity: 'assessment', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/assessments', entity: 'assessment', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/incidents', entity: 'incident', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/incidents', entity: 'incident', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/vulnerabilities', entity: 'vulnerability', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/consultants', entity: 'consultant', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/compliance', entity: 'compliance', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    assessment: {
      defaultFields: [
        { name: 'assessment_name', type: 'string', required: true },
        { name: 'assessment_type', type: 'enum', required: true },
        { name: 'scope', type: 'text' },
        { name: 'methodology', type: 'json' },
        { name: 'start_date', type: 'date' },
        { name: 'end_date', type: 'date' },
        { name: 'findings_count', type: 'integer' },
        { name: 'critical_count', type: 'integer' },
        { name: 'high_count', type: 'integer' },
        { name: 'medium_count', type: 'integer' },
        { name: 'low_count', type: 'integer' },
        { name: 'executive_summary', type: 'text' },
        { name: 'recommendations', type: 'json' },
        { name: 'report_url', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'consultant' },
        { type: 'hasMany', target: 'vulnerability' },
      ],
    },
    incident: {
      defaultFields: [
        { name: 'incident_number', type: 'string', required: true },
        { name: 'incident_type', type: 'enum', required: true },
        { name: 'severity', type: 'enum', required: true },
        { name: 'title', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'detected_at', type: 'datetime', required: true },
        { name: 'reported_by', type: 'string' },
        { name: 'attack_vector', type: 'string' },
        { name: 'affected_systems', type: 'json' },
        { name: 'impact', type: 'text' },
        { name: 'containment_actions', type: 'json' },
        { name: 'remediation_steps', type: 'json' },
        { name: 'lessons_learned', type: 'text' },
        { name: 'resolved_at', type: 'datetime' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'consultant' },
      ],
    },
    vulnerability: {
      defaultFields: [
        { name: 'vulnerability_id', type: 'string', required: true },
        { name: 'title', type: 'string', required: true },
        { name: 'severity', type: 'enum', required: true },
        { name: 'cvss_score', type: 'decimal' },
        { name: 'cve_id', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'affected_asset', type: 'string' },
        { name: 'proof_of_concept', type: 'text' },
        { name: 'remediation', type: 'text' },
        { name: 'references', type: 'json' },
        { name: 'verified', type: 'boolean' },
        { name: 'fixed', type: 'boolean' },
        { name: 'fixed_date', type: 'date' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'assessment' },
        { type: 'belongsTo', target: 'client' },
      ],
    },
    client: {
      defaultFields: [
        { name: 'company_name', type: 'string', required: true },
        { name: 'industry', type: 'string' },
        { name: 'contact_name', type: 'string' },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'security_contact', type: 'json' },
        { name: 'compliance_requirements', type: 'json' },
        { name: 'retainer_type', type: 'enum' },
        { name: 'retainer_hours', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'assessment' },
        { type: 'hasMany', target: 'incident' },
        { type: 'hasMany', target: 'compliance' },
      ],
    },
    consultant: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'role', type: 'enum', required: true },
        { name: 'specialties', type: 'json' },
        { name: 'certifications', type: 'json' },
        { name: 'clearance_level', type: 'string' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'bio', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'availability', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'assessment' },
        { type: 'hasMany', target: 'incident' },
      ],
    },
    compliance: {
      defaultFields: [
        { name: 'framework', type: 'enum', required: true },
        { name: 'scope', type: 'text' },
        { name: 'assessment_date', type: 'date' },
        { name: 'next_assessment', type: 'date' },
        { name: 'controls_total', type: 'integer' },
        { name: 'controls_compliant', type: 'integer' },
        { name: 'controls_partial', type: 'integer' },
        { name: 'controls_noncompliant', type: 'integer' },
        { name: 'compliance_percentage', type: 'decimal' },
        { name: 'gaps', type: 'json' },
        { name: 'remediation_plan', type: 'json' },
        { name: 'report_url', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
      ],
    },
  },
};

export default cybersecurityBlueprint;
