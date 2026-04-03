import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsArray, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Recipe Generation DTOs
export enum CuisineType {
  ITALIAN = 'italian',
  CHINESE = 'chinese',
  MEXICAN = 'mexican',
  INDIAN = 'indian',
  FRENCH = 'french',
  JAPANESE = 'japanese',
  THAI = 'thai',
  MEDITERRANEAN = 'mediterranean',
  AMERICAN = 'american',
  KOREAN = 'korean',
  VIETNAMESE = 'vietnamese',
  GREEK = 'greek',
  SPANISH = 'spanish',
  MIDDLE_EASTERN = 'middle_eastern',
  AFRICAN = 'african',
  CARIBBEAN = 'caribbean',
  FUSION = 'fusion',
  INTERNATIONAL = 'international'
}

export enum DietaryRestriction {
  VEGETARIAN = 'vegetarian',
  VEGAN = 'vegan',
  GLUTEN_FREE = 'gluten_free',
  DAIRY_FREE = 'dairy_free',
  NUT_FREE = 'nut_free',
  LOW_CARB = 'low_carb',
  KETO = 'keto',
  PALEO = 'paleo',
  HALAL = 'halal',
  KOSHER = 'kosher',
  LOW_SODIUM = 'low_sodium',
  DIABETIC_FRIENDLY = 'diabetic_friendly',
  HEART_HEALTHY = 'heart_healthy'
}

export enum MealType {
  BREAKFAST = 'breakfast',
  BRUNCH = 'brunch',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  SNACK = 'snack',
  DESSERT = 'dessert',
  APPETIZER = 'appetizer',
  BEVERAGE = 'beverage'
}

export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export class GenerateRecipeDto {
  @ApiProperty({ description: 'Recipe request or type of dish', example: 'chocolate chip cookies' })
  @IsString()
  recipe_request: string;

  @ApiPropertyOptional({ 
    description: 'Cuisine type',
    enum: CuisineType,
    example: CuisineType.AMERICAN
  })
  @IsOptional()
  @IsEnum(CuisineType)
  cuisine?: CuisineType;

  @ApiPropertyOptional({ 
    description: 'Meal type',
    enum: MealType,
    example: MealType.DESSERT
  })
  @IsOptional()
  @IsEnum(MealType)
  meal_type?: MealType;

  @ApiPropertyOptional({ 
    description: 'Dietary restrictions',
    enum: DietaryRestriction,
    isArray: true,
    example: [DietaryRestriction.VEGETARIAN]
  })
  @IsOptional()
  @IsArray()
  @IsEnum(DietaryRestriction, { each: true })
  dietary_restrictions?: DietaryRestriction[];

  @ApiPropertyOptional({ description: 'Number of servings', example: 4, default: 4 })
  @IsOptional()
  @IsNumber()
  servings?: number;

  @ApiPropertyOptional({ description: 'Cooking time in minutes', example: 30 })
  @IsOptional()
  @IsNumber()
  cooking_time?: number;

  @ApiPropertyOptional({ 
    description: 'Recipe difficulty level',
    enum: DifficultyLevel,
    example: DifficultyLevel.INTERMEDIATE,
    default: DifficultyLevel.INTERMEDIATE
  })
  @IsOptional()
  @IsEnum(DifficultyLevel)
  difficulty?: DifficultyLevel;

  @ApiPropertyOptional({ description: 'Available ingredients', example: ['flour', 'eggs', 'milk', 'sugar'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  available_ingredients?: string[];

  @ApiPropertyOptional({ description: 'Ingredients to avoid', example: ['nuts', 'shellfish'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  avoid_ingredients?: string[];

  @ApiPropertyOptional({ description: 'Include nutritional information', default: false })
  @IsOptional()
  @IsBoolean()
  include_nutrition?: boolean;

  @ApiPropertyOptional({ description: 'Include cooking tips', default: true })
  @IsOptional()
  @IsBoolean()
  include_tips?: boolean;

  @ApiPropertyOptional({ description: 'Include variations or substitutions', default: true })
  @IsOptional()
  @IsBoolean()
  include_variations?: boolean;

  @ApiPropertyOptional({ description: 'Additional preferences or notes' })
  @IsOptional()
  @IsString()
  additional_notes?: string;
}

// Workout Plan Generation DTOs
export enum FitnessGoal {
  WEIGHT_LOSS = 'weight_loss',
  MUSCLE_GAIN = 'muscle_gain',
  STRENGTH = 'strength',
  ENDURANCE = 'endurance',
  FLEXIBILITY = 'flexibility',
  GENERAL_FITNESS = 'general_fitness',
  TONING = 'toning',
  REHABILITATION = 'rehabilitation',
  SPORTS_PERFORMANCE = 'sports_performance',
  MAINTENANCE = 'maintenance'
}

export enum FitnessLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export enum WorkoutType {
  STRENGTH_TRAINING = 'strength_training',
  CARDIO = 'cardio',
  HIIT = 'hiit',
  YOGA = 'yoga',
  PILATES = 'pilates',
  CROSSFIT = 'crossfit',
  BODYWEIGHT = 'bodyweight',
  STRETCHING = 'stretching',
  MARTIAL_ARTS = 'martial_arts',
  DANCE = 'dance',
  SPORTS = 'sports',
  MIXED = 'mixed'
}

export enum Equipment {
  NONE = 'none',
  BASIC_HOME = 'basic_home',
  DUMBBELLS = 'dumbbells',
  BARBELL = 'barbell',
  RESISTANCE_BANDS = 'resistance_bands',
  KETTLEBELLS = 'kettlebells',
  FULL_GYM = 'full_gym',
  CARDIO_MACHINE = 'cardio_machine',
  YOGA_MAT = 'yoga_mat',
  PULL_UP_BAR = 'pull_up_bar'
}

export class GenerateWorkoutPlanDto {
  @ApiProperty({ 
    description: 'Primary fitness goal',
    enum: FitnessGoal,
    example: FitnessGoal.MUSCLE_GAIN
  })
  @IsEnum(FitnessGoal)
  fitness_goal: FitnessGoal;

  @ApiProperty({ 
    description: 'Current fitness level',
    enum: FitnessLevel,
    example: FitnessLevel.INTERMEDIATE
  })
  @IsEnum(FitnessLevel)
  fitness_level: FitnessLevel;

  @ApiPropertyOptional({ description: 'Age of the person', example: 25 })
  @IsOptional()
  @IsNumber()
  age?: number;

  @ApiPropertyOptional({ description: 'Days per week to workout', example: 4, default: 3 })
  @IsOptional()
  @IsNumber()
  days_per_week?: number;

  @ApiPropertyOptional({ description: 'Minutes per workout session', example: 60, default: 45 })
  @IsOptional()
  @IsNumber()
  session_duration?: number;

  @ApiPropertyOptional({ 
    description: 'Preferred workout types',
    enum: WorkoutType,
    isArray: true,
    example: [WorkoutType.STRENGTH_TRAINING, WorkoutType.CARDIO]
  })
  @IsOptional()
  @IsArray()
  @IsEnum(WorkoutType, { each: true })
  preferred_workouts?: WorkoutType[];

  @ApiPropertyOptional({ 
    description: 'Available equipment',
    enum: Equipment,
    isArray: true,
    example: [Equipment.DUMBBELLS, Equipment.YOGA_MAT]
  })
  @IsOptional()
  @IsArray()
  @IsEnum(Equipment, { each: true })
  available_equipment?: Equipment[];

  @ApiPropertyOptional({ description: 'Focus areas or muscle groups', example: ['chest', 'shoulders', 'core'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  focus_areas?: string[];

  @ApiPropertyOptional({ description: 'Injuries or physical limitations', example: ['lower back pain', 'knee issues'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  limitations?: string[];

  @ApiPropertyOptional({ description: 'Duration of the plan in weeks', example: 8, default: 4 })
  @IsOptional()
  @IsNumber()
  plan_duration_weeks?: number;

  @ApiPropertyOptional({ description: 'Include warm-up and cool-down', default: true })
  @IsOptional()
  @IsBoolean()
  include_warmup_cooldown?: boolean;

  @ApiPropertyOptional({ description: 'Include progression guidelines', default: true })
  @IsOptional()
  @IsBoolean()
  include_progression?: boolean;

  @ApiPropertyOptional({ description: 'Additional preferences or requirements' })
  @IsOptional()
  @IsString()
  additional_notes?: string;
}

// Meal Plan Generation DTOs
export class GenerateMealPlanDto {
  @ApiPropertyOptional({ description: 'Number of days to plan for', example: 7, default: 7 })
  @IsOptional()
  @IsNumber()
  days?: number;

  @ApiPropertyOptional({ description: 'Daily calorie target', example: 2000 })
  @IsOptional()
  @IsNumber()
  daily_calories?: number;

  @ApiPropertyOptional({ description: 'Number of meals per day', example: 3, default: 3 })
  @IsOptional()
  @IsNumber()
  meals_per_day?: number;

  @ApiPropertyOptional({ description: 'Include snacks', default: false })
  @IsOptional()
  @IsBoolean()
  include_snacks?: boolean;

  @ApiPropertyOptional({ 
    description: 'Dietary restrictions',
    enum: DietaryRestriction,
    isArray: true,
    example: [DietaryRestriction.VEGETARIAN]
  })
  @IsOptional()
  @IsArray()
  @IsEnum(DietaryRestriction, { each: true })
  dietary_restrictions?: DietaryRestriction[];

  @ApiPropertyOptional({ 
    description: 'Preferred cuisines',
    enum: CuisineType,
    isArray: true,
    example: [CuisineType.MEDITERRANEAN, CuisineType.CHINESE]
  })
  @IsOptional()
  @IsArray()
  @IsEnum(CuisineType, { each: true })
  preferred_cuisines?: CuisineType[];

  @ApiPropertyOptional({ description: 'Foods to include', example: ['salmon', 'quinoa', 'avocado'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  foods_to_include?: string[];

  @ApiPropertyOptional({ description: 'Foods to avoid', example: ['processed meat', 'sugar'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  foods_to_avoid?: string[];

  @ApiPropertyOptional({ description: 'Cooking skill level', enum: DifficultyLevel, example: DifficultyLevel.INTERMEDIATE })
  @IsOptional()
  @IsEnum(DifficultyLevel)
  cooking_skill?: DifficultyLevel;

  @ApiPropertyOptional({ description: 'Maximum prep time per meal in minutes', example: 30 })
  @IsOptional()
  @IsNumber()
  max_prep_time?: number;

  @ApiPropertyOptional({ description: 'Budget per day (optional)', example: 25.00 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  daily_budget?: number;

  @ApiPropertyOptional({ description: 'Include grocery list', default: true })
  @IsOptional()
  @IsBoolean()
  include_grocery_list?: boolean;

  @ApiPropertyOptional({ description: 'Include nutritional breakdown', default: false })
  @IsOptional()
  @IsBoolean()
  include_nutrition?: boolean;

  @ApiPropertyOptional({ description: 'Additional preferences or goals' })
  @IsOptional()
  @IsString()
  additional_notes?: string;
}