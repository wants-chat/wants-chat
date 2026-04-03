/**
 * Finance Component Generators Index (React Native)
 *
 * Central export for all finance-related React Native component generators.
 * Includes account management, budgeting, invoicing, and payment components.
 */

// Account Components
export {
  generateAccountOverview,
  generateAccountCards,
  generateTransactionList,
  type AccountOptions,
} from './account.generator';

// Budget Components
export {
  generateBudgetTracker,
  generateBudgetCategories,
  generateSpendingChart,
  type BudgetOptions,
} from './budget.generator';

// Invoice Components
export {
  generateInvoiceList,
  generateInvoiceDetail,
  generateInvoiceForm,
  type InvoiceOptions,
} from './invoice.generator';

// Payment Components
export {
  generatePaymentForm,
  generatePaymentMethods,
  generatePaymentHistory,
  type PaymentOptions,
} from './payment.generator';
