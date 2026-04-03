import { Blueprint } from './blueprint.interface';

/**
 * HR Outsourcing/PEO Blueprint
 */
export const hroutsourcingBlueprint: Blueprint = {
  appType: 'hroutsourcing',
  description: 'HR outsourcing/PEO app with employees, payroll, benefits, and compliance',

  coreEntities: ['client', 'employee', 'payroll', 'benefit', 'compliance', 'service'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Clients', path: '/clients', icon: 'Briefcase' },
        { label: 'Employees', path: '/employees', icon: 'Users' },
        { label: 'Payroll', path: '/payroll', icon: 'DollarSign' },
        { label: 'Benefits', path: '/benefits', icon: 'Heart' },
        { label: 'Compliance', path: '/compliance', icon: 'Shield' },
        { label: 'Services', path: '/services', icon: 'Settings' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'pending-tasks', component: 'data-table', entity: 'compliance', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-table', component: 'data-table', entity: 'client', position: 'main' },
    ]},
    { path: '/employees', name: 'Employees', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'employee-table', component: 'data-table', entity: 'employee', position: 'main' },
    ]},
    { path: '/payroll', name: 'Payroll', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'payroll-table', component: 'data-table', entity: 'payroll', position: 'main' },
    ]},
    { path: '/benefits', name: 'Benefits', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'benefit-grid', component: 'product-grid', entity: 'benefit', position: 'main' },
    ]},
    { path: '/compliance', name: 'Compliance', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'compliance-table', component: 'data-table', entity: 'compliance', position: 'main' },
    ]},
    { path: '/services', name: 'Services', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'service-grid', component: 'plan-grid', entity: 'service', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/clients', entity: 'client', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/employees', entity: 'employee', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/employees', entity: 'employee', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/payroll', entity: 'payroll', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/benefits', entity: 'benefit', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/compliance', entity: 'compliance', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/services', entity: 'service', operation: 'list' },
  ],

  entityConfig: {
    client: {
      defaultFields: [
        { name: 'company_name', type: 'string', required: true },
        { name: 'contact_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'industry', type: 'string' },
        { name: 'employee_count', type: 'integer' },
        { name: 'states_operating', type: 'json' },
        { name: 'ein', type: 'string' },
        { name: 'contract_start', type: 'date' },
        { name: 'contract_end', type: 'date' },
        { name: 'services_selected', type: 'json' },
        { name: 'monthly_fee', type: 'decimal' },
        { name: 'per_employee_fee', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'employee' },
        { type: 'hasMany', target: 'payroll' },
      ],
    },
    employee: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'ssn_last_four', type: 'string' },
        { name: 'date_of_birth', type: 'date' },
        { name: 'address', type: 'json' },
        { name: 'hire_date', type: 'date', required: true },
        { name: 'termination_date', type: 'date' },
        { name: 'job_title', type: 'string' },
        { name: 'department', type: 'string' },
        { name: 'employment_type', type: 'enum' },
        { name: 'pay_type', type: 'enum' },
        { name: 'pay_rate', type: 'decimal' },
        { name: 'work_state', type: 'string' },
        { name: 'benefits_enrolled', type: 'json' },
        { name: 'w4_info', type: 'json' },
        { name: 'direct_deposit', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'hasMany', target: 'payroll' },
      ],
    },
    payroll: {
      defaultFields: [
        { name: 'pay_period_start', type: 'date', required: true },
        { name: 'pay_period_end', type: 'date', required: true },
        { name: 'pay_date', type: 'date', required: true },
        { name: 'regular_hours', type: 'decimal' },
        { name: 'overtime_hours', type: 'decimal' },
        { name: 'gross_pay', type: 'decimal', required: true },
        { name: 'federal_tax', type: 'decimal' },
        { name: 'state_tax', type: 'decimal' },
        { name: 'local_tax', type: 'decimal' },
        { name: 'social_security', type: 'decimal' },
        { name: 'medicare', type: 'decimal' },
        { name: 'benefit_deductions', type: 'json' },
        { name: 'other_deductions', type: 'json' },
        { name: 'net_pay', type: 'decimal', required: true },
        { name: 'employer_taxes', type: 'json' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'employee' },
      ],
    },
    benefit: {
      defaultFields: [
        { name: 'benefit_name', type: 'string', required: true },
        { name: 'benefit_type', type: 'enum', required: true },
        { name: 'carrier', type: 'string' },
        { name: 'plan_name', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'coverage_levels', type: 'json' },
        { name: 'employee_contribution', type: 'json' },
        { name: 'employer_contribution', type: 'json' },
        { name: 'eligibility_rules', type: 'json' },
        { name: 'waiting_period_days', type: 'integer' },
        { name: 'plan_documents', type: 'json' },
        { name: 'effective_date', type: 'date' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
    compliance: {
      defaultFields: [
        { name: 'compliance_name', type: 'string', required: true },
        { name: 'compliance_type', type: 'enum', required: true },
        { name: 'jurisdiction', type: 'string' },
        { name: 'requirement', type: 'text' },
        { name: 'due_date', type: 'date' },
        { name: 'frequency', type: 'enum' },
        { name: 'responsible_party', type: 'string' },
        { name: 'documentation', type: 'json' },
        { name: 'last_completed', type: 'date' },
        { name: 'next_due', type: 'date' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
      ],
    },
    service: {
      defaultFields: [
        { name: 'service_name', type: 'string', required: true },
        { name: 'service_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'features', type: 'json' },
        { name: 'pricing_model', type: 'enum' },
        { name: 'base_price', type: 'decimal' },
        { name: 'per_employee_price', type: 'decimal' },
        { name: 'min_employees', type: 'integer' },
        { name: 'setup_fee', type: 'decimal' },
        { name: 'is_addon', type: 'boolean' },
        { name: 'is_featured', type: 'boolean' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
  },
};

export default hroutsourcingBlueprint;
