import { Blueprint } from './blueprint.interface';

/**
 * Banking/Finance Blueprint
 *
 * Defines the structure for a banking/finance application:
 * - Account management
 * - Transactions
 * - Transfers
 * - Cards
 * - Bills & Payments
 * - Budgets
 */
export const bankingBlueprint: Blueprint = {
  appType: 'banking',
  description: 'Banking app with accounts, transactions, transfers, and budgets',

  coreEntities: ['account', 'transaction', 'transfer', 'card', 'bill', 'budget', 'beneficiary'],

  commonFields: {
    timestamps: true,
    softDelete: true,
    userOwnership: true,
  },

  pages: [
    // Dashboard
    {
      path: '/',
      name: 'Dashboard',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
          props: {
            links: [
              { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
              { label: 'Accounts', path: '/accounts', icon: 'Wallet' },
              { label: 'Transactions', path: '/transactions', icon: 'ArrowLeftRight' },
              { label: 'Transfers', path: '/transfers', icon: 'Send' },
              { label: 'Cards', path: '/cards', icon: 'CreditCard' },
              { label: 'Bills', path: '/bills', icon: 'Receipt' },
              { label: 'Budgets', path: '/budgets', icon: 'PieChart' },
            ],
          },
        },
        {
          id: 'balance-cards',
          component: 'account-balance-cards',
          entity: 'account',
          position: 'main',
        },
        {
          id: 'spending-chart',
          component: 'spending-chart',
          entity: 'transaction',
          position: 'main',
          props: {
            title: 'Spending Overview',
          },
        },
        {
          id: 'recent-transactions',
          component: 'transaction-list',
          entity: 'transaction',
          position: 'main',
          props: {
            title: 'Recent Transactions',
            limit: 5,
          },
        },
      ],
    },
    // Accounts
    {
      path: '/accounts',
      name: 'Accounts',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'accounts-list',
          component: 'account-list',
          entity: 'account',
          position: 'main',
        },
      ],
    },
    // Account Detail
    {
      path: '/accounts/:id',
      name: 'Account Detail',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'account-detail',
          component: 'account-detail',
          entity: 'account',
          position: 'main',
        },
        {
          id: 'account-transactions',
          component: 'transaction-list',
          entity: 'transaction',
          position: 'main',
          props: {
            title: 'Account Transactions',
          },
        },
      ],
    },
    // Transactions
    {
      path: '/transactions',
      name: 'Transactions',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'transaction-filters',
          component: 'transaction-filters',
          entity: 'transaction',
          position: 'main',
        },
        {
          id: 'transactions-table',
          component: 'transaction-table',
          entity: 'transaction',
          position: 'main',
        },
      ],
    },
    // Transfers
    {
      path: '/transfers',
      name: 'Transfers',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'transfer-form',
          component: 'transfer-form',
          entity: 'transfer',
          position: 'main',
        },
        {
          id: 'beneficiaries',
          component: 'beneficiary-list',
          entity: 'beneficiary',
          position: 'main',
          props: {
            title: 'Saved Beneficiaries',
          },
        },
        {
          id: 'transfer-history',
          component: 'transfer-history',
          entity: 'transfer',
          position: 'main',
        },
      ],
    },
    // Cards
    {
      path: '/cards',
      name: 'Cards',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'cards-list',
          component: 'card-list',
          entity: 'card',
          position: 'main',
        },
      ],
    },
    // Card Detail
    {
      path: '/cards/:id',
      name: 'Card Detail',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'card-detail',
          component: 'card-detail',
          entity: 'card',
          position: 'main',
        },
        {
          id: 'card-transactions',
          component: 'transaction-list',
          entity: 'transaction',
          position: 'main',
          props: {
            title: 'Card Transactions',
          },
        },
      ],
    },
    // Bills
    {
      path: '/bills',
      name: 'Bills & Payments',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'upcoming-bills',
          component: 'bill-list',
          entity: 'bill',
          position: 'main',
          props: {
            title: 'Upcoming Bills',
            status: 'pending',
          },
        },
        {
          id: 'bill-payment',
          component: 'bill-payment-form',
          entity: 'bill',
          position: 'main',
        },
      ],
    },
    // Budgets
    {
      path: '/budgets',
      name: 'Budgets',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'budget-overview',
          component: 'budget-overview',
          entity: 'budget',
          position: 'main',
        },
        {
          id: 'budget-categories',
          component: 'budget-categories',
          entity: 'budget',
          position: 'main',
        },
      ],
    },
    // Create Budget
    {
      path: '/budgets/new',
      name: 'Create Budget',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'budget-form',
          component: 'budget-form',
          entity: 'budget',
          position: 'main',
        },
      ],
    },
  ],

  endpoints: [
    // Accounts
    { method: 'GET', path: '/accounts', entity: 'account', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/accounts/:id', entity: 'account', operation: 'get', requiresAuth: true },
    { method: 'GET', path: '/accounts/:id/transactions', entity: 'transaction', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/accounts/:id/balance', entity: 'account', operation: 'get', requiresAuth: true },

    // Transactions
    { method: 'GET', path: '/transactions', entity: 'transaction', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/transactions/:id', entity: 'transaction', operation: 'get', requiresAuth: true },
    { method: 'GET', path: '/transactions/summary', entity: 'transaction', operation: 'custom', requiresAuth: true },

    // Transfers
    { method: 'GET', path: '/transfers', entity: 'transfer', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/transfers', entity: 'transfer', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/transfers/:id', entity: 'transfer', operation: 'get', requiresAuth: true },

    // Beneficiaries
    { method: 'GET', path: '/beneficiaries', entity: 'beneficiary', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/beneficiaries', entity: 'beneficiary', operation: 'create', requiresAuth: true },
    { method: 'DELETE', path: '/beneficiaries/:id', entity: 'beneficiary', operation: 'delete', requiresAuth: true },

    // Cards
    { method: 'GET', path: '/cards', entity: 'card', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/cards/:id', entity: 'card', operation: 'get', requiresAuth: true },
    { method: 'PATCH', path: '/cards/:id/freeze', entity: 'card', operation: 'update', requiresAuth: true },
    { method: 'PATCH', path: '/cards/:id/limit', entity: 'card', operation: 'update', requiresAuth: true },

    // Bills
    { method: 'GET', path: '/bills', entity: 'bill', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/bills', entity: 'bill', operation: 'create', requiresAuth: true },
    { method: 'POST', path: '/bills/:id/pay', entity: 'bill', operation: 'custom', requiresAuth: true },

    // Budgets
    { method: 'GET', path: '/budgets', entity: 'budget', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/budgets', entity: 'budget', operation: 'create', requiresAuth: true },
    { method: 'PUT', path: '/budgets/:id', entity: 'budget', operation: 'update', requiresAuth: true },
    { method: 'DELETE', path: '/budgets/:id', entity: 'budget', operation: 'delete', requiresAuth: true },
  ],

  entityConfig: {
    account: {
      defaultFields: [
        { name: 'account_number', type: 'string', required: true },
        { name: 'account_type', type: 'enum', required: true },
        { name: 'name', type: 'string', required: true },
        { name: 'balance', type: 'decimal', required: true },
        { name: 'currency', type: 'string', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'is_primary', type: 'boolean' },
        { name: 'interest_rate', type: 'decimal' },
        { name: 'opened_date', type: 'date' },
      ],
      relationships: [
        { type: 'hasMany', target: 'transaction' },
        { type: 'hasMany', target: 'card' },
        { type: 'hasMany', target: 'transfer' },
      ],
    },
    transaction: {
      defaultFields: [
        { name: 'type', type: 'enum', required: true },
        { name: 'amount', type: 'decimal', required: true },
        { name: 'currency', type: 'string', required: true },
        { name: 'description', type: 'string' },
        { name: 'category', type: 'string' },
        { name: 'merchant_name', type: 'string' },
        { name: 'merchant_logo', type: 'image' },
        { name: 'status', type: 'enum', required: true },
        { name: 'reference', type: 'string' },
        { name: 'date', type: 'datetime', required: true },
        { name: 'balance_after', type: 'decimal' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'account' },
        { type: 'belongsTo', target: 'card' },
      ],
    },
    transfer: {
      defaultFields: [
        { name: 'amount', type: 'decimal', required: true },
        { name: 'currency', type: 'string', required: true },
        { name: 'description', type: 'string' },
        { name: 'recipient_name', type: 'string', required: true },
        { name: 'recipient_account', type: 'string', required: true },
        { name: 'recipient_bank', type: 'string' },
        { name: 'status', type: 'enum', required: true },
        { name: 'reference', type: 'string' },
        { name: 'scheduled_date', type: 'datetime' },
        { name: 'completed_date', type: 'datetime' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'account' },
        { type: 'belongsTo', target: 'beneficiary' },
      ],
    },
    card: {
      defaultFields: [
        { name: 'card_number', type: 'string', required: true },
        { name: 'card_type', type: 'enum', required: true },
        { name: 'brand', type: 'enum', required: true },
        { name: 'holder_name', type: 'string', required: true },
        { name: 'expiry_date', type: 'string', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'is_frozen', type: 'boolean' },
        { name: 'daily_limit', type: 'decimal' },
        { name: 'monthly_limit', type: 'decimal' },
        { name: 'current_spending', type: 'decimal' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'account' },
        { type: 'hasMany', target: 'transaction' },
      ],
    },
    bill: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'biller_name', type: 'string', required: true },
        { name: 'category', type: 'enum', required: true },
        { name: 'amount', type: 'decimal', required: true },
        { name: 'due_date', type: 'date', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'is_recurring', type: 'boolean' },
        { name: 'recurring_interval', type: 'enum' },
        { name: 'auto_pay', type: 'boolean' },
        { name: 'biller_account', type: 'string' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'account' },
      ],
    },
    budget: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'category', type: 'string', required: true },
        { name: 'limit_amount', type: 'decimal', required: true },
        { name: 'spent_amount', type: 'decimal' },
        { name: 'period', type: 'enum', required: true },
        { name: 'start_date', type: 'date', required: true },
        { name: 'end_date', type: 'date' },
        { name: 'alert_threshold', type: 'integer' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
    beneficiary: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'account_number', type: 'string', required: true },
        { name: 'bank_name', type: 'string' },
        { name: 'bank_code', type: 'string' },
        { name: 'nickname', type: 'string' },
        { name: 'is_verified', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'transfer' },
      ],
    },
  },
};

export default bankingBlueprint;
