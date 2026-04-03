/**
 * Ecommerce Component Generators Index
 */

// Product components
export { generateProductGrid, generateFeaturedProducts } from './product-grid.generator';
export { generateProductDetail, type ProductDetailOptions } from './product-detail.generator';

// Cart & Checkout components
export { generateCart, generateMiniCart, type CartOptions } from './cart.generator';
export { generateCheckout, generateOrderSummary, type CheckoutOptions } from './checkout.generator';

// Filter components
export {
  generateProductFilters,
  generateProductFiltersDesign,
  generateCategoryHeader,
  generateCategoryPills,
  type ProductFiltersOptions,
  type ProductFiltersDesignOptions,
  type CategoryHeaderOptions,
  type CategoryPillsOptions,
} from './filters.generator';

// Vendor components
export {
  generateVendorCard,
  generateVendorHeader,
  type VendorCardOptions,
  type VendorHeaderOptions,
} from './vendor.generator';

// Inventory components
export {
  generateLowStockAlerts,
  generateStockLevels,
  generateInventoryFilters,
  generateInventoryReport,
  type LowStockAlertsOptions,
  type StockLevelsOptions,
  type InventoryFiltersOptions,
  type InventoryReportOptions,
} from './inventory.generator';

// Order components
export {
  generateOrderHeader,
  generateOrderItems,
  generateOrderFilters,
  generateOrderListReady,
  generateOrderQueue,
  type OrderHeaderOptions,
  type OrderItemsOptions,
  type OrderFiltersOptions,
  type OrderListReadyOptions,
  type OrderQueueOptions,
} from './order.generator';

// Custom components
export {
  generateCustomOrderList,
  type CustomOrderListOptions,
} from './custom.generator';
