/**
 * React Native Banking Component Generators Index
 *
 * Provides generators for React Native banking components:
 * - Account management (balance cards, detail, list)
 * - Bill payments (list, payment form)
 * - Budget tracking (form, overview)
 * - Card management (detail, list)
 * - Transactions (list, filters)
 * - Transfers (form, history, beneficiaries)
 */

// Account components
export {
  generateAccountBalanceCards,
  generateAccountDetail,
  generateAccountList,
  type AccountOptions,
} from './account.generator';

// Bill components
export {
  generateBillList,
  generateBillPaymentForm,
  type BillOptions,
} from './bill.generator';

// Budget components
export {
  generateBudgetForm,
  generateBudgetOverview,
  type BudgetOptions,
} from './budget.generator';

// Card components
export {
  generateCardDetail,
  generateCardList,
  type CardOptions,
} from './card.generator';

// Transaction components
export {
  generateTransactionList,
  generateTransactionFilters,
  type TransactionOptions,
} from './transaction.generator';

// Transfer components
export {
  generateTransferForm,
  generateTransferHistory,
  generateBeneficiaryList,
  type TransferOptions,
} from './transfer.generator';
