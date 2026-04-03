import { Blueprint } from './blueprint.interface';

/**
 * Wealth Management Blueprint
 */
export const wealthmanagementBlueprint: Blueprint = {
  appType: 'wealthmanagement',
  description: 'Wealth management app with clients, portfolios, investments, and financial planning',

  coreEntities: ['client', 'portfolio', 'investment', 'financial_plan', 'meeting', 'transaction'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Clients', path: '/clients', icon: 'Users' },
        { label: 'Portfolios', path: '/portfolios', icon: 'PieChart' },
        { label: 'Investments', path: '/investments', icon: 'TrendingUp' },
        { label: 'Financial Plans', path: '/plans', icon: 'FileText' },
        { label: 'Meetings', path: '/meetings', icon: 'Calendar' },
        { label: 'Transactions', path: '/transactions', icon: 'ArrowLeftRight' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'portfolio-summary', component: 'data-table', entity: 'portfolio', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'client-table', component: 'data-table', entity: 'client', position: 'main' },
    ]},
    { path: '/portfolios', name: 'Portfolios', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'portfolio-table', component: 'data-table', entity: 'portfolio', position: 'main' },
    ]},
    { path: '/investments', name: 'Investments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'filters', component: 'filter-form', entity: 'investment', position: 'main' },
      { id: 'investment-table', component: 'data-table', entity: 'investment', position: 'main' },
    ]},
    { path: '/plans', name: 'Financial Plans', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'plan-table', component: 'data-table', entity: 'financial_plan', position: 'main' },
    ]},
    { path: '/meetings', name: 'Meetings', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'meeting-calendar', component: 'appointment-calendar', entity: 'meeting', position: 'main' },
      { id: 'meeting-list', component: 'appointment-list', entity: 'meeting', position: 'main' },
    ]},
    { path: '/transactions', name: 'Transactions', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'transaction-table', component: 'data-table', entity: 'transaction', position: 'main' },
    ]},
    { path: '/schedule', name: 'Schedule Consultation', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'booking-form', component: 'booking-wizard', entity: 'meeting', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/clients', entity: 'client', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/portfolios', entity: 'portfolio', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/portfolios', entity: 'portfolio', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/investments', entity: 'investment', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/investments', entity: 'investment', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/plans', entity: 'financial_plan', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/plans', entity: 'financial_plan', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/meetings', entity: 'meeting', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/meetings', entity: 'meeting', operation: 'create' },
    { method: 'GET', path: '/transactions', entity: 'transaction', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    client: {
      defaultFields: [
        { name: 'client_number', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'date_of_birth', type: 'date' },
        { name: 'ssn_last_four', type: 'string' },
        { name: 'address', type: 'json' },
        { name: 'employment_status', type: 'enum' },
        { name: 'annual_income', type: 'decimal' },
        { name: 'net_worth', type: 'decimal' },
        { name: 'risk_tolerance', type: 'enum' },
        { name: 'investment_goals', type: 'json' },
        { name: 'advisor', type: 'string' },
        { name: 'referral_source', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'portfolio' },
        { type: 'hasMany', target: 'financial_plan' },
        { type: 'hasMany', target: 'meeting' },
      ],
    },
    portfolio: {
      defaultFields: [
        { name: 'portfolio_name', type: 'string', required: true },
        { name: 'portfolio_type', type: 'enum', required: true },
        { name: 'account_number', type: 'string' },
        { name: 'custodian', type: 'string' },
        { name: 'inception_date', type: 'date' },
        { name: 'initial_value', type: 'decimal' },
        { name: 'current_value', type: 'decimal' },
        { name: 'cash_balance', type: 'decimal' },
        { name: 'total_return', type: 'decimal' },
        { name: 'allocation', type: 'json' },
        { name: 'benchmark', type: 'string' },
        { name: 'management_fee', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'hasMany', target: 'investment' },
        { type: 'hasMany', target: 'transaction' },
      ],
    },
    investment: {
      defaultFields: [
        { name: 'symbol', type: 'string', required: true },
        { name: 'security_name', type: 'string', required: true },
        { name: 'asset_class', type: 'enum', required: true },
        { name: 'quantity', type: 'decimal', required: true },
        { name: 'cost_basis', type: 'decimal' },
        { name: 'current_price', type: 'decimal' },
        { name: 'market_value', type: 'decimal' },
        { name: 'unrealized_gain', type: 'decimal' },
        { name: 'weight', type: 'decimal' },
        { name: 'dividend_yield', type: 'decimal' },
        { name: 'purchase_date', type: 'date' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'portfolio' },
      ],
    },
    financial_plan: {
      defaultFields: [
        { name: 'plan_name', type: 'string', required: true },
        { name: 'plan_type', type: 'enum', required: true },
        { name: 'created_date', type: 'date', required: true },
        { name: 'goals', type: 'json' },
        { name: 'current_situation', type: 'json' },
        { name: 'recommendations', type: 'json' },
        { name: 'projections', type: 'json' },
        { name: 'retirement_age', type: 'integer' },
        { name: 'retirement_income_goal', type: 'decimal' },
        { name: 'estate_planning', type: 'json' },
        { name: 'insurance_review', type: 'json' },
        { name: 'next_review_date', type: 'date' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
      ],
    },
    meeting: {
      defaultFields: [
        { name: 'meeting_date', type: 'date', required: true },
        { name: 'meeting_time', type: 'datetime', required: true },
        { name: 'duration', type: 'integer' },
        { name: 'meeting_type', type: 'enum', required: true },
        { name: 'client_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'advisor', type: 'string' },
        { name: 'location', type: 'string' },
        { name: 'agenda', type: 'text' },
        { name: 'notes', type: 'text' },
        { name: 'follow_up_items', type: 'json' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
      ],
    },
    transaction: {
      defaultFields: [
        { name: 'transaction_date', type: 'date', required: true },
        { name: 'transaction_type', type: 'enum', required: true },
        { name: 'symbol', type: 'string' },
        { name: 'security_name', type: 'string' },
        { name: 'quantity', type: 'decimal' },
        { name: 'price', type: 'decimal' },
        { name: 'amount', type: 'decimal', required: true },
        { name: 'fees', type: 'decimal' },
        { name: 'net_amount', type: 'decimal' },
        { name: 'description', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'portfolio' },
      ],
    },
  },
};

export default wealthmanagementBlueprint;
