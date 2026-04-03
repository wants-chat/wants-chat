/**
 * React Native Component Catalog - Main Export File
 *
 * This file exports all React Native component generators organized by category.
 * Similar to the React catalog structure for consistency.
 *
 * Total Components: 25+
 */

// ===========================
// FORMS COMPONENTS (3)
// ===========================
export * from './forms';

// ===========================
// BLOG COMPONENTS (2+)
// ===========================
export * from './blog';

// ===========================
// E-COMMERCE COMPONENTS (20+)
// ===========================
export * from './ecommerce';

// ===========================
// TABLES COMPONENTS (1)
// ===========================
export * from './tables';

// ===========================
// CHARTS COMPONENTS (1)
// ===========================
export * from './charts';

// ===========================
// NAVIGATION COMPONENTS (2)
// ===========================
export * from './navigation';

// ===========================
// USER COMPONENTS (1)
// ===========================
export * from './user';

// ===========================
// COMMON COMPONENTS (2)
// ===========================
export * from './common';

// ===========================
// FOOD DELIVERY COMPONENTS (1)
// ===========================
export * from './food';

// ===========================
// BUDGET & EXPENSE TRACKER COMPONENTS (3)
// ===========================
export * from './budget';

// ===========================
// MEDIA COMPONENTS (1)
// ===========================
export * from './media';

// ===========================
// WIDGETS COMPONENTS (20+)
// ===========================
export * from './widgets';

// ===========================
// TRAVEL COMPONENTS (10+)
// ===========================
export * from './travel';

// ===========================
// HEALTHCARE COMPONENTS (4)
// ===========================
export * from './healthcare';

// ===========================
// AUTH COMPONENTS (10+)
// ===========================
export * from './auth';

// ===========================
// MODALS COMPONENTS (4)
// ===========================
export * from './modals';

// ===========================
// SOCIAL COMPONENTS (15+)
// ===========================
export * from './social';

// ===========================
// HELP COMPONENTS (15+)
// ===========================
export * from './help';

// ===========================
// ERROR COMPONENTS (7)
// ===========================
export * from './error';

// ===========================
// LEGAL COMPONENTS (7)
// ===========================
export * from './legal';

// ===========================
// DETAIL COMPONENTS (1)
// ===========================
export * from './detail';

/**
 * Get component generator function by type (kebab-case)
 *
 * @param type - Component type in kebab-case (e.g., 'login-form', 'product-grid')
 * @returns Generator function or undefined
 *
 * @example
 * const generator = getComponentGenerator('login-form');
 * if (generator) {
 *   const { code, imports } = generator();
 * }
 */
export function getComponentGenerator(type: string): (() => { code: string; imports: string[] }) | undefined {
  // Component registry mapping kebab-case names to generator functions
  const componentRegistry: Record<string, () => { code: string; imports: string[] }> = {
    // Forms
    'login-form': require('./forms/login-form.generator').generateRNLoginForm,
    'register-form': require('./forms/register-form.generator').generateRNRegisterForm,
    'search-bar': require('./forms/search-bar.generator').generateRNSearchBar,

    // Blog
    'blog-card': require('./blog/blog-card.generator').generateRNBlogCard,
    'blog-list': require('./blog/blog-list.generator').generateRNBlogList,

    // E-commerce - Products
    'product-grid': require('./ecommerce/product-grid.generator').generateRNProductGrid,
    'product-grid-two-column': require('./ecommerce/product-grid-two-column.generator').generateRNProductGridTwoColumn,
    'product-grid-three-column': require('./ecommerce/product-grid-three-column.generator').generateRNProductGridThreeColumn,
    'product-grid-four-column': require('./ecommerce/product-grid-four-column.generator').generateRNProductGridFourColumn,
    'product-card': require('./ecommerce/product-card.generator').generateRNProductCard,
    'product-card-compact': require('./ecommerce/product-card-compact.generator').generateRNProductCardCompact,
    'product-card-detailed': require('./ecommerce/product-card-detailed.generator').generateRNProductCardDetailed,
    'product-detail-page': require('./ecommerce/product-detail-page.generator').generateRNProductDetailPage,

    // E-commerce - Categories
    'category-grid': require('./ecommerce/category-grid.generator').generateRNCategoryGrid,

    // E-commerce - Cart
    'cart': require('./ecommerce/cart-full-page.generator').generateRNCartFullPage,
    'cart-full-page': require('./ecommerce/cart-full-page.generator').generateRNCartFullPage,
    'cart-summary': require('./ecommerce/cart-summary-sidebar.generator').generateRNCartSummarySidebar,
    'cart-summary-sidebar': require('./ecommerce/cart-summary-sidebar.generator').generateRNCartSummarySidebar,
    'shopping-cart': require('./ecommerce/shopping-cart.generator').generateRNShoppingCart,
    'empty-cart-state': require('./ecommerce/empty-cart-state.generator').generateRNEmptyCartState,

    // E-commerce - Checkout
    'checkout-form': require('./ecommerce/checkout-steps.generator').generateRNCheckoutSteps,
    'checkout-steps': require('./ecommerce/checkout-steps.generator').generateRNCheckoutSteps,
    'payment-method': require('./ecommerce/payment-method.generator').generateRNPaymentMethod,
    'order-review': require('./ecommerce/order-review.generator').generateRNOrderReview,

    // E-commerce - Orders
    'order-summary': require('./ecommerce/order-summary.generator').generateRNOrderSummary,
    'order-details': require('./ecommerce/order-details-view.generator').generateRNOrderDetailsView,
    'order-details-view': require('./ecommerce/order-details-view.generator').generateRNOrderDetailsView,
    'order-confirmation': require('./ecommerce/order-confirmation.generator').generateRNOrderConfirmation,

    // Tables
    'data-table': require('./tables/data-table.generator').generateRNDataTable,

    // Charts
    'kpi-card': require('./charts/kpi-card.generator').generateRNKpiCard,
    'stats-widget': require('./charts/kpi-card.generator').generateRNKpiCard, // Alias
    'bar-chart': require('./charts/bar-chart.generator').generateRNBarChart,
    'data-viz-bar-chart': require('./charts/bar-chart.generator').generateRNBarChart, // Alias

    // Navigation
    'navbar': require('./navigation/navbar.generator').generateRNNavbar,
    'footer': require('./navigation/footer.generator').generateRNFooter,

    // User
    'profile-card': require('./user/profile-card.generator').generateRNProfileCard,
    'profile-edit-form': require('./user/profile-edit-form.generator').generateRNProfileEditForm,

    // Common
    'button': require('./common/button.generator').generateRNButton,
    'card': require('./common/card.generator').generateRNCard,
    'hero-section': require('./common/hero-section.generator').generateRNHeroSection,
    'detail-page-header': require('./common/detail-page-header.generator').generateRNDetailPageHeader,

    // Food Delivery
    'restaurant-detail-header': require('./food/restaurant-detail-header.generator').generateRNRestaurantDetailHeader,
    'driver-card': require('./food/driver-card.generator').generateRNDriverCard,

    // Budget & Expense Tracker
    'expense-card': require('./budget/expense-card.generator').generateRNExpenseCard,
    'budget-progress-card': require('./budget/budget-progress-card.generator').generateRNBudgetProgressCard,
    'financial-goal-card': require('./budget/financial-goal-card.generator').generateRNFinancialGoalCard,
    'expense-list': require('./budget/expense-card.generator').generateRNExpenseCard,
    'budget-overview': require('./budget/budget-progress-card.generator').generateRNBudgetProgressCard,
    'category-spending': require('./budget/expense-card.generator').generateRNExpenseCard,
    'transaction-history': require('./budget/expense-card.generator').generateRNExpenseCard,

    // Media
    'track-detail-page': require('./media/track-detail-page.generator').generateRNTrackDetailPage,

    // Education
    'course-modules-list': require('./widgets').generateRNCourseModulesList,

    // Fitness
    'trainer-grid': require('./widgets').generateRNTrainerGrid,
    'class-schedule-grid': require('./widgets').generateRNClassScheduleGrid,

    // Calendar & Events
    'countdown-timer-event': require('./widgets').generateRNCountdownTimerEvent,
    'countdown-timer-offer': require('./widgets').generateRNCountdownTimerOffer,

    // Event Ticketing
    'event-grid': require('./widgets').generateRNEventGrid,
    'event-card': require('./widgets').generateRNEventCard,
    'event-detail-page': require('./widgets').generateRNEventDetailPage,
    'ticket-selector': require('./widgets').generateRNTicketSelector,
    'ticket-list': require('./widgets').generateRNTicketList,
    'ticket-detail-view': require('./widgets').generateRNTicketDetailView,
    'ticket-card': require('./widgets').generateRNTicketCard,

    // Hero & Landing
    'hero-full-width': require('./widgets').generateRNHeroFullWidth,
    'hero-split-layout': require('./widgets').generateRNHeroSplitLayout,

    // Real Estate
    'property-card': require('./widgets').generateRNPropertyCard,
    'property-search': require('./widgets').generateRNPropertySearch,

    // Automotive
    'vehicle-card': require('./widgets').generateRNVehicleCard,
    'service-booking': require('./widgets').generateRNServiceBooking,

    // Booking
    'time-slot-picker': require('./widgets').generateRNTimeSlotPicker,
    'booking-summary': require('./widgets').generateRNBookingSummary,

    // Pet Care
    'pet-profile-card': require('./widgets').generateRNPetProfileCard,
    'pet-service-card': require('./widgets').generateRNPetServiceCard,
  };

  return componentRegistry[type];
}

/**
 * Get all available component types in the catalog
 *
 * @returns Array of component type names (kebab-case)
 */
export function getAvailableComponents(): string[] {
  return [
    // Forms (3)
    'login-form',
    'register-form',
    'search-bar',

    // Blog (2)
    'blog-card',
    'blog-list',

    // E-commerce - Products (8)
    'product-grid',
    'product-grid-two-column',
    'product-grid-three-column',
    'product-grid-four-column',
    'product-card',
    'product-card-compact',
    'product-card-detailed',
    'product-detail-page',

    // E-commerce - Categories (1)
    'category-grid',

    // E-commerce - Cart (4)
    'cart',
    'cart-full-page',
    'cart-summary',
    'cart-summary-sidebar',
    'shopping-cart',
    'empty-cart-state',

    // E-commerce - Checkout (3)
    'checkout-form',
    'checkout-steps',
    'payment-method',
    'order-review',

    // E-commerce - Orders (3)
    'order-summary',
    'order-details',
    'order-details-view',
    'order-confirmation',

    // Tables (1)
    'data-table',

    // Charts (3)
    'kpi-card',
    'stats-widget',
    'bar-chart',
    'data-viz-bar-chart',

    // Navigation (2)
    'navbar',
    'footer',

    // User (2)
    'profile-card',
    'profile-edit-form',

    // Common (4)
    'button',
    'card',
    'hero-section',
    'detail-page-header',

    // Food Delivery (2)
    'restaurant-detail-header',
    'driver-card',

    // Budget & Expense Tracker (7)
    'expense-card',
    'budget-progress-card',
    'financial-goal-card',
    'expense-list',
    'budget-overview',
    'category-spending',
    'transaction-history',

    // Media (1)
    'track-detail-page',

    // Education (1)
    'course-modules-list',

    // Fitness (2)
    'trainer-grid',
    'class-schedule-grid',

    // Calendar & Events (2)
    'countdown-timer-event',
    'countdown-timer-offer',

    // Event Ticketing (7)
    'event-grid',
    'event-card',
    'event-detail-page',
    'ticket-selector',
    'ticket-list',
    'ticket-detail-view',
    'ticket-card',

    // Hero & Landing (2)
    'hero-full-width',
    'hero-split-layout',

    // Real Estate (2)
    'property-card',
    'property-search',

    // Automotive (2)
    'vehicle-card',
    'service-booking',

    // Booking (2)
    'time-slot-picker',
    'booking-summary',

    // Pet Care (2)
    'pet-profile-card',
    'pet-service-card',
  ];
}

/**
 * Get component category by type
 *
 * @param type - Component type in kebab-case
 * @returns Category name
 */
export function getComponentCategory(type: string): string {
  // Forms
  if (['login-form', 'register-form', 'search-bar'].includes(type)) {
    return 'forms';
  }

  // Blog
  if (type.startsWith('blog-')) {
    return 'blog';
  }

  // E-commerce
  if (
    type.startsWith('product-') ||
    type.startsWith('cart-') ||
    type.startsWith('checkout-') ||
    type.startsWith('order-') ||
    type.startsWith('category-') ||
    type.startsWith('payment-') ||
    type === 'shopping-cart' ||
    type === 'empty-cart-state'
  ) {
    return 'ecommerce';
  }

  // Tables
  if (type.includes('table')) {
    return 'tables';
  }

  // Charts
  if (['kpi-card', 'stats-widget'].includes(type)) {
    return 'charts';
  }

  // Navigation
  if (['navbar', 'footer'].includes(type)) {
    return 'navigation';
  }

  // User
  if (type.includes('profile')) {
    return 'user';
  }

  // Food Delivery
  if (type.startsWith('restaurant-') || type.startsWith('menu-') || type.startsWith('driver-')) {
    return 'food';
  }

  // Budget & Expense Tracker
  if (type.startsWith('expense-') || type.startsWith('budget-') || type.startsWith('financial-') ||
      type.startsWith('transaction-') || type === 'category-spending') {
    return 'budget';
  }

  // Media
  if (type.startsWith('track-') || type.startsWith('album-') || type.startsWith('playlist-') ||
      type.includes('player') || type.includes('audio') || type.includes('video')) {
    return 'media';
  }

  // Education
  if (type.startsWith('course-') || type.startsWith('lesson-')) {
    return 'education';
  }

  // Fitness
  if (type.startsWith('trainer-') || type.startsWith('class-schedule-')) {
    return 'fitness';
  }

  // Events & Ticketing
  if (type.startsWith('event-') || type.startsWith('ticket-') || type.startsWith('countdown-timer-')) {
    return 'events';
  }

  // Real Estate
  if (type.startsWith('property-')) {
    return 'real-estate';
  }

  // Automotive
  if (type.startsWith('vehicle-') || type === 'service-booking') {
    return 'automotive';
  }

  // Booking
  if (type.startsWith('time-slot-') || type === 'booking-summary') {
    return 'booking';
  }

  // Pet Care
  if (type.startsWith('pet-')) {
    return 'pet-care';
  }

  // Hero
  if (type.startsWith('hero-')) {
    return 'hero';
  }

  return 'common';
}

/**
 * Get component count by category
 *
 * @returns Object with category counts
 */
export function getComponentCountByCategory(): Record<string, number> {
  return {
    forms: 3,
    blog: 2,
    ecommerce: 22,
    tables: 1,
    charts: 1,
    navigation: 2,
    user: 1,
    common: 3,
    food: 1,
    budget: 7,
    media: 1,
    education: 1,
    fitness: 2,
    events: 9,
    hero: 2,
    'real-estate': 2,
    automotive: 2,
    booking: 2,
    'pet-care': 2,
  };
}

/**
 * Get total component count in catalog
 *
 * @returns Total number of components
 */
export function getTotalComponentCount(): number {
  const counts = getComponentCountByCategory();
  return Object.values(counts).reduce((sum, count) => sum + count, 0);
}
