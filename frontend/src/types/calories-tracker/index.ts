export interface Food {
  id: string;
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  servingSize: string;
  servingUnit: string;
  barcode?: string;
  category: FoodCategory;
  imageUrl?: string;
}

export interface FoodEntry {
  id: string;
  food: Food;
  quantity: number;
  meal: MealType;
  date: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WaterEntry {
  id: string;
  amount: number; // in ml
  date: Date;
  time: string;
}

export interface CalorieGoal {
  id: string;
  dailyCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number; // in ml
  activityLevel: ActivityLevel;
  goal: GoalType;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCalorieProfile {
  id: string;
  userId: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number; // in cm
  weight: number; // in kg
  targetWeight?: number;
  activityLevel: ActivityLevel;
  goal: GoalType;
  dietaryRestrictions: DietaryRestriction[];
  allergies: string[];
  currentGoal: CalorieGoal;
  createdAt: Date;
  updatedAt: Date;
}

export interface NutritionSummary {
  date: Date;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  totalSugar: number;
  totalSodium: number;
  totalWater: number;
  goalCalories: number;
  goalProtein: number;
  goalCarbs: number;
  goalFat: number;
  goalWater: number;
  mealBreakdown: {
    breakfast: MealSummary;
    lunch: MealSummary;
    dinner: MealSummary;
    snacks: MealSummary;
  };
}

export interface MealSummary {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  entries: FoodEntry[];
}

export interface WeightEntry {
  id: string;
  weight: number;
  date: Date;
  notes?: string;
}

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
  servings: number;
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  difficulty: 'easy' | 'medium' | 'hard';
  category: RecipeCategory;
  tags: string[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecipeIngredient {
  food: Food;
  quantity: number;
  unit: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export type FoodCategory = 
  | 'vegetables'
  | 'fruits'
  | 'grains'
  | 'protein'
  | 'dairy'
  | 'fats'
  | 'beverages'
  | 'snacks'
  | 'condiments'
  | 'supplements'
  | 'prepared_foods'
  | 'fast_food'
  | 'restaurant';

export type ActivityLevel = 
  | 'sedentary'
  | 'lightly_active'
  | 'moderately_active'
  | 'very_active'
  | 'extremely_active';

export type GoalType = 
  | 'lose_weight'
  | 'maintain_weight'
  | 'gain_weight'
  | 'gain_muscle'
  | 'improve_health';

export type DietaryRestriction = 
  | 'vegetarian'
  | 'vegan'
  | 'gluten_free'
  | 'dairy_free'
  | 'nut_free'
  | 'low_carb'
  | 'keto'
  | 'paleo'
  | 'halal'
  | 'kosher';

export type RecipeCategory = 
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'snack'
  | 'dessert'
  | 'beverage'
  | 'appetizer'
  | 'salad'
  | 'soup'
  | 'main_course'
  | 'side_dish';

export interface CalorieTrackerStats {
  currentStreak: number;
  longestStreak: number;
  totalDaysTracked: number;
  averageCalories: number;
  averageProtein: number;
  averageCarbs: number;
  averageFat: number;
  averageWater: number;
  weeklyAverage: number;
  monthlyAverage: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'tracking' | 'nutrition' | 'streak' | 'weight' | 'water';
  requirement: number;
  progress: number;
  unlocked: boolean;
  unlockedAt?: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
}