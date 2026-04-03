/**
 * Banking Component Generators Index
 */

export {
  generateAccountBalanceCards,
  generateAccountDetail,
  generateAccountList,
  type AccountOptions,
} from './account.generator';

export {
  generateCardDetail,
  generateCardList,
  type CardOptions,
} from './card.generator';

export {
  generateBillList,
  generateBillPaymentForm,
  type BillOptions,
} from './bill.generator';

export {
  generateTransferForm,
  generateTransferHistory,
  generateBeneficiaryList,
  type TransferOptions,
} from './transfer.generator';

export {
  generateTransactionTable,
  generateTransactionFilters,
  type TransactionOptions,
} from './transaction.generator';

export {
  generateBudgetForm,
  generateBudgetOverview,
  type BudgetOptions as BankingBudgetOptions,
} from './budget.generator';
