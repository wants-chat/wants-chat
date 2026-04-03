import { Blueprint } from './blueprint.interface';

/**
 * Investment Advisor Blueprint
 */
export const investmentadvisorBlueprint: Blueprint = {
  appType: 'investmentadvisor',
  description: 'Investment advisory practice with clients, portfolios, strategies, and performance tracking',

  coreEntities: ['client', 'portfolio', 'meeting', 'investment', 'strategy', 'report'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Clients', path: '/clients', icon: 'Users' },
        { label: 'Portfolios', path: '/portfolios', icon: 'PieChart' },
        { label: 'Meetings', path: '/meetings', icon: 'Calendar' },
        { label: 'Investments', path: '/investments', icon: 'TrendingUp' },
        { label: 'Strategies', path: '/strategies', icon: 'Target' },
        { label: 'Reports', path: '/reports', icon: 'FileText' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'upcoming-meetings', component: 'appointment-list', entity: 'meeting', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-table', component: 'data-table', entity: 'client', position: 'main' },
    ]},
    { path: '/portfolios', name: 'Portfolios', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'portfolio-table', component: 'data-table', entity: 'portfolio', position: 'main' },
    ]},
    { path: '/meetings', name: 'Meetings', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'meeting-calendar', component: 'appointment-calendar', entity: 'meeting', position: 'main' },
    ]},
    { path: '/investments', name: 'Investments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'investment-table', component: 'data-table', entity: 'investment', position: 'main' },
    ]},
    { path: '/strategies', name: 'Strategies', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'strategy-grid', component: 'product-grid', entity: 'strategy', position: 'main' },
    ]},
    { path: '/reports', name: 'Reports', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'report-table', component: 'data-table', entity: 'report', position: 'main' },
    ]},
    { path: '/schedule', name: 'Schedule', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'booking-wizard', component: 'booking-wizard', entity: 'meeting', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/clients', entity: 'client', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/portfolios', entity: 'portfolio', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/meetings', entity: 'meeting', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/meetings', entity: 'meeting', operation: 'create' },
    { method: 'GET', path: '/investments', entity: 'investment', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/strategies', entity: 'strategy', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/reports', entity: 'report', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    client: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'date_of_birth', type: 'date' },
        { name: 'address', type: 'json' },
        { name: 'occupation', type: 'string' },
        { name: 'employer', type: 'string' },
        { name: 'annual_income', type: 'decimal' },
        { name: 'net_worth', type: 'decimal' },
        { name: 'risk_tolerance', type: 'enum' },
        { name: 'investment_experience', type: 'enum' },
        { name: 'investment_goals', type: 'json' },
        { name: 'time_horizon', type: 'enum' },
        { name: 'liquidity_needs', type: 'enum' },
        { name: 'tax_situation', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'portfolio' },
        { type: 'hasMany', target: 'meeting' },
      ],
    },
    portfolio: {
      defaultFields: [
        { name: 'portfolio_name', type: 'string', required: true },
        { name: 'account_type', type: 'enum', required: true },
        { name: 'custodian', type: 'string' },
        { name: 'account_number', type: 'string' },
        { name: 'initial_value', type: 'decimal' },
        { name: 'current_value', type: 'decimal' },
        { name: 'cash_balance', type: 'decimal' },
        { name: 'target_allocation', type: 'json' },
        { name: 'current_allocation', type: 'json' },
        { name: 'performance_ytd', type: 'decimal' },
        { name: 'performance_inception', type: 'decimal' },
        { name: 'benchmark', type: 'string' },
        { name: 'rebalance_threshold', type: 'decimal' },
        { name: 'last_rebalance', type: 'date' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'strategy' },
        { type: 'hasMany', target: 'investment' },
      ],
    },
    meeting: {
      defaultFields: [
        { name: 'meeting_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'meeting_type', type: 'enum', required: true },
        { name: 'location', type: 'string' },
        { name: 'agenda', type: 'json' },
        { name: 'topics_discussed', type: 'json' },
        { name: 'recommendations', type: 'json' },
        { name: 'action_items', type: 'json' },
        { name: 'documents_shared', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'follow_up_date', type: 'date' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
      ],
    },
    investment: {
      defaultFields: [
        { name: 'symbol', type: 'string', required: true },
        { name: 'name', type: 'string', required: true },
        { name: 'asset_class', type: 'enum', required: true },
        { name: 'sector', type: 'string' },
        { name: 'shares', type: 'decimal' },
        { name: 'cost_basis', type: 'decimal' },
        { name: 'current_price', type: 'decimal' },
        { name: 'market_value', type: 'decimal' },
        { name: 'unrealized_gain', type: 'decimal' },
        { name: 'purchase_date', type: 'date' },
        { name: 'dividend_yield', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'portfolio' },
      ],
    },
    strategy: {
      defaultFields: [
        { name: 'strategy_name', type: 'string', required: true },
        { name: 'strategy_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'risk_level', type: 'enum' },
        { name: 'target_allocation', type: 'json' },
        { name: 'expected_return', type: 'decimal' },
        { name: 'minimum_investment', type: 'decimal' },
        { name: 'management_fee', type: 'decimal' },
        { name: 'rebalancing_frequency', type: 'enum' },
        { name: 'suitable_for', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'portfolio' },
      ],
    },
    report: {
      defaultFields: [
        { name: 'report_name', type: 'string', required: true },
        { name: 'report_type', type: 'enum', required: true },
        { name: 'period_start', type: 'date', required: true },
        { name: 'period_end', type: 'date', required: true },
        { name: 'generated_date', type: 'date' },
        { name: 'summary', type: 'text' },
        { name: 'performance_data', type: 'json' },
        { name: 'holdings_data', type: 'json' },
        { name: 'transactions', type: 'json' },
        { name: 'file_url', type: 'string' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'portfolio' },
      ],
    },
  },
};

export default investmentadvisorBlueprint;
