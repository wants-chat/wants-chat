import { Blueprint } from './blueprint.interface';

/**
 * Referral/Affiliate Blueprint
 */
export const referralBlueprint: Blueprint = {
  appType: 'referral',
  description: 'Referral and affiliate marketing app with tracking, commissions, and payouts',

  coreEntities: ['affiliate', 'referral', 'commission', 'payout', 'campaign', 'link'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Referrals', path: '/referrals', icon: 'Users' },
        { label: 'Commissions', path: '/commissions', icon: 'DollarSign' },
        { label: 'Links', path: '/links', icon: 'Link' },
        { label: 'Payouts', path: '/payouts', icon: 'Wallet' },
        { label: 'Campaigns', path: '/campaigns', icon: 'Megaphone' },
      ]}},
      { id: 'affiliate-stats', component: 'affiliate-stats', position: 'main' },
      { id: 'earnings-chart', component: 'earnings-chart', position: 'main' },
      { id: 'recent-referrals', component: 'referral-list', entity: 'referral', position: 'main', props: { title: 'Recent Referrals' }},
    ]},
    { path: '/referrals', name: 'Referrals', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'referral-filters', component: 'referral-filters', entity: 'referral', position: 'main' },
      { id: 'referral-table', component: 'referral-table', entity: 'referral', position: 'main' },
    ]},
    { path: '/commissions', name: 'Commissions', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'commission-summary', component: 'commission-summary', position: 'main' },
      { id: 'commission-table', component: 'commission-table', entity: 'commission', position: 'main' },
    ]},
    { path: '/links', name: 'Referral Links', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'link-generator', component: 'link-generator', entity: 'link', position: 'main' },
      { id: 'link-list', component: 'link-list', entity: 'link', position: 'main' },
    ]},
    { path: '/payouts', name: 'Payouts', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'payout-balance', component: 'payout-balance', position: 'main' },
      { id: 'payout-history', component: 'payout-history', entity: 'payout', position: 'main' },
      { id: 'payout-request', component: 'payout-request', entity: 'payout', position: 'main' },
    ]},
    { path: '/campaigns', name: 'Campaigns', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'campaign-list', component: 'campaign-list', entity: 'campaign', position: 'main' },
    ]},
    { path: '/campaigns/:id', name: 'Campaign Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'campaign-detail', component: 'campaign-detail', entity: 'campaign', position: 'main' },
      { id: 'campaign-stats', component: 'campaign-stats', entity: 'campaign', position: 'main' },
    ]},
    { path: '/leaderboard', name: 'Leaderboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'affiliate-leaderboard', component: 'affiliate-leaderboard', entity: 'affiliate', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/referrals', entity: 'referral', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/referrals/:id', entity: 'referral', operation: 'get', requiresAuth: true },
    { method: 'GET', path: '/commissions', entity: 'commission', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/links', entity: 'link', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/links', entity: 'link', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/payouts', entity: 'payout', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/payouts/request', entity: 'payout', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/campaigns', entity: 'campaign', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/analytics/earnings', entity: 'commission', operation: 'custom', requiresAuth: true },
    { method: 'POST', path: '/track/:code', entity: 'referral', operation: 'create' },
  ],

  entityConfig: {
    affiliate: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'code', type: 'string', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'tier', type: 'enum' },
        { name: 'commission_rate', type: 'decimal' },
        { name: 'total_referrals', type: 'integer' },
        { name: 'total_earnings', type: 'decimal' },
        { name: 'pending_balance', type: 'decimal' },
        { name: 'payment_info', type: 'json' },
      ],
      relationships: [
        { type: 'hasMany', target: 'referral' },
        { type: 'hasMany', target: 'commission' },
        { type: 'hasMany', target: 'payout' },
      ],
    },
    referral: {
      defaultFields: [
        { name: 'status', type: 'enum', required: true },
        { name: 'referred_email', type: 'email' },
        { name: 'converted_at', type: 'datetime' },
        { name: 'order_value', type: 'decimal' },
        { name: 'ip_address', type: 'string' },
        { name: 'source', type: 'string' },
        { name: 'metadata', type: 'json' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'affiliate' },
        { type: 'belongsTo', target: 'link' },
        { type: 'belongsTo', target: 'campaign' },
      ],
    },
    commission: {
      defaultFields: [
        { name: 'amount', type: 'decimal', required: true },
        { name: 'rate', type: 'decimal', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'order_id', type: 'string' },
        { name: 'order_value', type: 'decimal' },
        { name: 'approved_at', type: 'datetime' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'affiliate' },
        { type: 'belongsTo', target: 'referral' },
      ],
    },
  },
};

export default referralBlueprint;
