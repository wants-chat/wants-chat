/**
 * Food/Restaurant Component Generators Index
 */

// Core food/restaurant components
export { generateMenuGrid, generateMenuCategories, type MenuGridOptions } from './menu-grid.generator';
export { generateCartPreview, generateCheckoutForm, generateOrderConfirmation, type FoodCartOptions } from './cart.generator';
export { generateOrderTracking, generateOrderList, generateOrderQueue, type OrderTrackingOptions } from './order-tracking.generator';
export { generateReservationForm, generateRestaurantInfo, type ReservationOptions } from './reservation.generator';

// Bakery components
export {
  generateBakeryStats,
  generateOrderFiltersBakery,
  generateCustomerProfileBakery,
  type BakeryOptions,
} from './bakery.generator';

// Brewery components
export {
  generateBreweryStats,
  generateEventCalendarBrewery,
  generateTourCalendarBrewery,
  generateTourListToday,
  generateMemberProfileBrewery,
  generateOrderListRecentBrewery,
  type BreweryOptions,
} from './brewery.generator';

// Catering components
export {
  generateCateringStats,
  generateEventCalendarCatering,
  generateClientProfileCatering,
  type CateringOptions,
} from './catering.generator';

// Florist components
export {
  generateFloristStats,
  generateOrderFiltersFlorist,
  generateDeliveryListFlorist,
  generateDeliveryScheduleFlorist,
  generatePendingOrdersFlorist,
  generateCustomerProfileFlorist,
  type FloristOptions,
} from './florist.generator';

// Food truck components
export {
  generateFoodtruckStats,
  generateScheduleCalendarFoodtruck,
  generateOrderQueueFoodtruck,
  type FoodtruckOptions,
} from './foodtruck.generator';

// Nursery/Garden center components
export {
  generateNurseryStats,
  generatePlantListFeatured,
  generateOrderListRecentNursery,
  type NurseryOptions,
} from './nursery.generator';

// Recipe components
export {
  generateRecipeHeader,
  generateRecipeSteps,
  generateIngredientList,
  generateShoppingList,
  generateNutritionInfo,
  generateMealPlanner,
  type RecipeOptions,
} from './recipe.generator';
