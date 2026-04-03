/**
 * React Native Food Component Generators Index
 *
 * Provides generators for React Native food-related components:
 * - Menu grid and categories
 * - Food cart and ordering
 * - Order tracking and lists
 * - Reservations
 * - Recipes (header, steps, ingredients, nutrition)
 * - Bakery, Brewery, Catering, Food Truck, Florist, Nursery components
 */

// Menu components
export {
  generateMenuGrid,
  generateMenuCategories,
  type MenuGridOptions,
} from './menu-grid.generator';

// Cart components
export {
  generateFoodCart,
  type FoodCartOptions,
} from './cart.generator';

// Order tracking components
export {
  generateOrderTracking,
  generateOrderList,
  generateOrderQueue,
  type OrderTrackingOptions,
} from './order-tracking.generator';

// Reservation components
export {
  generateReservationForm,
  generateRestaurantInfo,
  type ReservationOptions,
} from './reservation.generator';

// Recipe components
export {
  generateRecipeHeader,
  generateRecipeSteps,
  generateIngredientList,
  generateNutritionInfo,
  type RecipeOptions,
} from './recipe.generator';

// Bakery components
export {
  generateBakeryStats,
  generateProductListFeatured,
  generateOrderListRecent,
  type BakeryOptions,
} from './bakery.generator';

// Brewery components
export {
  generateBreweryStats,
  generateTapList,
  generateBeerListFeatured,
  type BreweryOptions,
} from './brewery.generator';

// Catering components
export {
  generateCateringStats,
  generateCateringMenuGrid,
  generateEventList,
  type CateringOptions,
} from './catering.generator';

// Food Truck components
export {
  generateFoodTruckStats,
  generateLocationSchedule,
  type FoodTruckOptions,
} from './foodtruck.generator';

// Florist components
export {
  generateFloristStats,
  generateFlowerGrid,
  generateArrangementList,
  type FloristOptions,
} from './florist.generator';

// Nursery/Garden Center components
export {
  generateNurseryStats,
  generatePlantListFeatured,
  generateOrderListRecentNursery,
  type NurseryOptions,
} from './nursery.generator';
