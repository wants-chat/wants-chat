/**
 * UI Registry
 *
 * This file maps all contextual UIs to their field requirements, onboarding mappings,
 * and entity type associations. This enables the context system to know which data
 * to pre-fill for each UI.
 *
 * Structure:
 * - uiType: Unique identifier for the UI
 * - name: Human-readable name
 * - category: UI category for grouping
 * - fields: List of fields the UI accepts
 * - onboardingMapping: Maps UI fields to onboarding data fields
 * - entityMapping: Maps UI fields to entity types from chat extraction
 * - defaults: Default values for fields
 */

import { EntityType } from './dto';

export interface UIFieldDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'enum' | 'array' | 'object';
  required: boolean;
  prefillable: boolean;
  onboardingField?: string;
  entityTypes?: EntityType[];
  defaultValue?: any;
  description?: string;
}

export interface UIRegistryEntry {
  uiType: string;
  name: string;
  category: string;
  description?: string;
  fields: UIFieldDefinition[];
  onboardingMapping: Record<string, string>;
  entityMapping: Record<string, EntityType[]>;
  defaults: Record<string, any>;
  intentPatterns?: string[];  // Phrases that indicate user wants this tool
  attachmentFields?: Record<string, string>;  // Maps MIME type to field name
  primaryAction?: string;  // Main action verb (resize, convert, calculate, etc.)
}

// ============================================
// UI CATEGORIES
// ============================================

export const UI_CATEGORIES = {
  ASTROLOGY: 'Astrology & Spirituality',
  HEALTH: 'Health & Fitness',
  FINANCE: 'Finance & Business',
  HOME: 'Home & Garden',
  WEATHER: 'Weather & Environment',
  COOKING: 'Cooking & Food',
  SPORTS: 'Sports & Recreation',
  TRAVEL: 'Travel & Transportation',
  ENTERTAINMENT: 'Entertainment & Games',
  EDUCATION: 'Education & Learning',
  PETS: 'Pets & Animals',
  CRAFTS: 'Crafts & DIY',
  MUSIC: 'Music & Audio',
  PROFESSIONAL: 'Professional Services',
  BEAUTY: 'Beauty & Self-Care',
  AUTOMOTIVE: 'Automotive',
  REAL_ESTATE: 'Real Estate',
  EVENTS: 'Events & Planning',
  HOUSEHOLD: 'Household Management',
};

// ============================================
// COMMON FIELD MAPPINGS
// ============================================

const COMMON_ONBOARDING_FIELDS = {
  weight: 'weight_kg',
  height: 'height_cm',
  gender: 'gender',
  date_of_birth: 'date_of_birth',
  currency: 'preferred_currency',
  language: 'preferred_language',
  country: 'country',
  timezone: 'timezone',
  measurement_system: 'measurement_system',
  company_name: 'company_name',
  industry: 'industry',
  tone: 'tone_preference',
  output_length: 'output_length',
};

const COMMON_ENTITY_MAPPINGS = {
  budget: [EntityType.BUDGET, EntityType.CURRENCY],
  company_name: [EntityType.COMPANY_NAME],
  client_name: [EntityType.PERSON_NAME, EntityType.COMPANY_NAME],
  email: [EntityType.EMAIL],
  phone: [EntityType.PHONE],
  location: [EntityType.LOCATION],
  deadline: [EntityType.DEADLINE],
  project_name: [EntityType.PROJECT_NAME],
  target_audience: [EntityType.TARGET_AUDIENCE],
  industry: [EntityType.INDUSTRY],
};

// ============================================
// UI REGISTRY - Contextual UI definitions
// Total: 1000+ UI entries across all categories
// ============================================

export const UI_REGISTRY: Record<string, UIRegistryEntry> = {
  // ----------------------------------------
  // ASTROLOGY & SPIRITUALITY
  // ----------------------------------------
  birthstone_finder: {
    uiType: 'birthstone_finder',
    name: 'Birthstone Finder',
    category: UI_CATEGORIES.ASTROLOGY,
    fields: [
      { name: 'date_of_birth', type: 'date', required: true, prefillable: true, onboardingField: 'date_of_birth' },
      { name: 'month', type: 'number', required: false, prefillable: true },
    ],
    onboardingMapping: { date_of_birth: 'date_of_birth' },
    entityMapping: {},
    defaults: {},
  },
  chinese_zodiac: {
    uiType: 'chinese_zodiac',
    name: 'Chinese Zodiac Calculator',
    category: UI_CATEGORIES.ASTROLOGY,
    fields: [
      { name: 'birth_year', type: 'number', required: true, prefillable: true },
      { name: 'date_of_birth', type: 'date', required: false, prefillable: true, onboardingField: 'date_of_birth' },
    ],
    onboardingMapping: { date_of_birth: 'date_of_birth' },
    entityMapping: {},
    defaults: {},
  },
  life_path_number: {
    uiType: 'life_path_number',
    name: 'Life Path Number Calculator',
    category: UI_CATEGORIES.ASTROLOGY,
    fields: [
      { name: 'date_of_birth', type: 'date', required: true, prefillable: true, onboardingField: 'date_of_birth' },
    ],
    onboardingMapping: { date_of_birth: 'date_of_birth' },
    entityMapping: {},
    defaults: {},
  },
  moon_phase: {
    uiType: 'moon_phase',
    name: 'Moon Phase Calculator',
    category: UI_CATEGORIES.ASTROLOGY,
    fields: [
      { name: 'date', type: 'date', required: true, prefillable: false },
      { name: 'location', type: 'string', required: false, prefillable: true, onboardingField: 'country' },
    ],
    onboardingMapping: { location: 'country' },
    entityMapping: { location: [EntityType.LOCATION] },
    defaults: {},
  },

  // ----------------------------------------
  // HEALTH & FITNESS
  // ----------------------------------------
  macro_calculator: {
    uiType: 'macro_calculator',
    name: 'Macro Calculator',
    category: UI_CATEGORIES.HEALTH,
    fields: [
      { name: 'weight', type: 'number', required: true, prefillable: true, onboardingField: 'weight_kg' },
      { name: 'height', type: 'number', required: true, prefillable: true, onboardingField: 'height_cm' },
      { name: 'age', type: 'number', required: true, prefillable: false },
      { name: 'gender', type: 'enum', required: true, prefillable: true, onboardingField: 'gender' },
      { name: 'activity_level', type: 'enum', required: true, prefillable: false },
      { name: 'goal', type: 'enum', required: true, prefillable: true, onboardingField: 'fitness_goal' },
      { name: 'measurement_system', type: 'enum', required: false, prefillable: true, onboardingField: 'measurement_system' },
    ],
    onboardingMapping: {
      weight: 'weight_kg',
      height: 'height_cm',
      gender: 'gender',
      goal: 'fitness_goal',
      measurement_system: 'measurement_system',
    },
    entityMapping: {},
    defaults: { measurement_system: 'metric' },
  },
  hydration_calculator: {
    uiType: 'hydration_calculator',
    name: 'Hydration Calculator',
    category: UI_CATEGORIES.HEALTH,
    fields: [
      { name: 'weight', type: 'number', required: true, prefillable: true, onboardingField: 'weight_kg' },
      { name: 'activity_level', type: 'enum', required: true, prefillable: false },
      { name: 'climate', type: 'enum', required: false, prefillable: false },
      { name: 'measurement_system', type: 'enum', required: false, prefillable: true, onboardingField: 'measurement_system' },
    ],
    onboardingMapping: { weight: 'weight_kg', measurement_system: 'measurement_system' },
    entityMapping: {},
    defaults: { measurement_system: 'metric' },
  },
  protein_calculator: {
    uiType: 'protein_calculator',
    name: 'Protein Calculator',
    category: UI_CATEGORIES.HEALTH,
    fields: [
      { name: 'weight', type: 'number', required: true, prefillable: true, onboardingField: 'weight_kg' },
      { name: 'goal', type: 'enum', required: true, prefillable: true, onboardingField: 'fitness_goal' },
      { name: 'activity_level', type: 'enum', required: true, prefillable: false },
    ],
    onboardingMapping: { weight: 'weight_kg', goal: 'fitness_goal' },
    entityMapping: {},
    defaults: {},
  },
  caffeine_calculator: {
    uiType: 'caffeine_calculator',
    name: 'Caffeine Calculator',
    category: UI_CATEGORIES.HEALTH,
    fields: [
      { name: 'weight', type: 'number', required: true, prefillable: true, onboardingField: 'weight_kg' },
      { name: 'sensitivity', type: 'enum', required: false, prefillable: false },
    ],
    onboardingMapping: { weight: 'weight_kg' },
    entityMapping: {},
    defaults: { sensitivity: 'normal' },
  },
  alcohol_calculator: {
    uiType: 'alcohol_calculator',
    name: 'BAC Calculator',
    category: UI_CATEGORIES.HEALTH,
    fields: [
      { name: 'weight', type: 'number', required: true, prefillable: true, onboardingField: 'weight_kg' },
      { name: 'gender', type: 'enum', required: true, prefillable: true, onboardingField: 'gender' },
    ],
    onboardingMapping: { weight: 'weight_kg', gender: 'gender' },
    entityMapping: {},
    defaults: {},
  },

  // ----------------------------------------
  // FINANCE & BUSINESS
  // ----------------------------------------
  budget_planner: {
    uiType: 'budget_planner',
    name: 'Budget Planner',
    category: UI_CATEGORIES.FINANCE,
    fields: [
      { name: 'currency', type: 'string', required: true, prefillable: true, onboardingField: 'preferred_currency' },
      { name: 'income', type: 'number', required: true, prefillable: false },
      { name: 'financial_goal', type: 'enum', required: false, prefillable: true, onboardingField: 'financial_goal' },
    ],
    onboardingMapping: { currency: 'preferred_currency', financial_goal: 'financial_goal' },
    entityMapping: { income: [EntityType.BUDGET] },
    defaults: { currency: 'USD' },
  },
  invoice_generator: {
    uiType: 'invoice_generator',
    name: 'Invoice Generator',
    category: UI_CATEGORIES.FINANCE,
    fields: [
      { name: 'company_name', type: 'string', required: true, prefillable: true, onboardingField: 'company_name' },
      { name: 'currency', type: 'string', required: true, prefillable: true, onboardingField: 'preferred_currency' },
      { name: 'client_name', type: 'string', required: true, prefillable: true },
      { name: 'client_email', type: 'string', required: false, prefillable: true },
      { name: 'amount', type: 'number', required: true, prefillable: false },
    ],
    onboardingMapping: { company_name: 'company_name', currency: 'preferred_currency' },
    entityMapping: {
      client_name: [EntityType.COMPANY_NAME, EntityType.PERSON_NAME],
      client_email: [EntityType.EMAIL],
      amount: [EntityType.BUDGET],
    },
    defaults: { currency: 'USD' },
    intentPatterns: ['create invoice', 'generate invoice', 'make invoice', 'invoice generator', 'bill client', 'send invoice'],
    primaryAction: 'generate',
  },
  proposal_generator: {
    uiType: 'proposal_generator',
    name: 'Proposal Generator',
    category: UI_CATEGORIES.FINANCE,
    fields: [
      { name: 'company_name', type: 'string', required: true, prefillable: true, onboardingField: 'company_name' },
      { name: 'industry', type: 'string', required: false, prefillable: true, onboardingField: 'industry' },
      { name: 'project_name', type: 'string', required: true, prefillable: true },
      { name: 'client_name', type: 'string', required: true, prefillable: true },
      { name: 'budget', type: 'number', required: false, prefillable: true },
      { name: 'deadline', type: 'date', required: false, prefillable: true },
      { name: 'tone', type: 'enum', required: false, prefillable: true, onboardingField: 'tone_preference' },
    ],
    onboardingMapping: {
      company_name: 'company_name',
      industry: 'industry',
      tone: 'tone_preference',
    },
    entityMapping: {
      project_name: [EntityType.PROJECT_NAME],
      client_name: [EntityType.COMPANY_NAME, EntityType.PERSON_NAME],
      budget: [EntityType.BUDGET],
      deadline: [EntityType.DEADLINE],
    },
    defaults: { tone: 'professional' },
  },
  car_loan_calculator: {
    uiType: 'car_loan_calculator',
    name: 'Car Loan Calculator',
    category: UI_CATEGORIES.FINANCE,
    fields: [
      { name: 'currency', type: 'string', required: true, prefillable: true, onboardingField: 'preferred_currency' },
      { name: 'vehicle_price', type: 'number', required: true, prefillable: false },
      { name: 'down_payment', type: 'number', required: true, prefillable: false },
      { name: 'loan_term', type: 'number', required: true, prefillable: false },
      { name: 'interest_rate', type: 'number', required: true, prefillable: false },
    ],
    onboardingMapping: { currency: 'preferred_currency' },
    entityMapping: { vehicle_price: [EntityType.BUDGET] },
    defaults: { currency: 'USD' },
  },

  // ----------------------------------------
  // COOKING & FOOD
  // ----------------------------------------
  grilling_timer: {
    uiType: 'grilling_timer',
    name: 'Grilling Timer',
    category: UI_CATEGORIES.COOKING,
    fields: [
      { name: 'meat_type', type: 'enum', required: true, prefillable: false },
      { name: 'thickness', type: 'number', required: true, prefillable: false },
      { name: 'doneness', type: 'enum', required: true, prefillable: false },
      { name: 'measurement_system', type: 'enum', required: false, prefillable: true, onboardingField: 'measurement_system' },
    ],
    onboardingMapping: { measurement_system: 'measurement_system' },
    entityMapping: {},
    defaults: { measurement_system: 'metric' },
  },
  meat_thawing: {
    uiType: 'meat_thawing',
    name: 'Meat Thawing Calculator',
    category: UI_CATEGORIES.COOKING,
    fields: [
      { name: 'meat_weight', type: 'number', required: true, prefillable: false },
      { name: 'meat_type', type: 'enum', required: true, prefillable: false },
      { name: 'method', type: 'enum', required: true, prefillable: false },
      { name: 'measurement_system', type: 'enum', required: false, prefillable: true, onboardingField: 'measurement_system' },
    ],
    onboardingMapping: { measurement_system: 'measurement_system' },
    entityMapping: {},
    defaults: { measurement_system: 'metric', method: 'refrigerator' },
  },
  steak_doneness: {
    uiType: 'steak_doneness',
    name: 'Steak Doneness Guide',
    category: UI_CATEGORIES.COOKING,
    fields: [
      { name: 'cut', type: 'enum', required: true, prefillable: false },
      { name: 'thickness', type: 'number', required: true, prefillable: false },
      { name: 'doneness', type: 'enum', required: true, prefillable: false },
      { name: 'measurement_system', type: 'enum', required: false, prefillable: true, onboardingField: 'measurement_system' },
    ],
    onboardingMapping: { measurement_system: 'measurement_system' },
    entityMapping: {},
    defaults: { measurement_system: 'metric', doneness: 'medium' },
  },

  // ----------------------------------------
  // HOME & GARDEN
  // ----------------------------------------
  pool_volume: {
    uiType: 'pool_volume',
    name: 'Pool Volume Calculator',
    category: UI_CATEGORIES.HOME,
    fields: [
      { name: 'shape', type: 'enum', required: true, prefillable: false },
      { name: 'length', type: 'number', required: true, prefillable: false },
      { name: 'width', type: 'number', required: true, prefillable: false },
      { name: 'depth', type: 'number', required: true, prefillable: false },
      { name: 'measurement_system', type: 'enum', required: false, prefillable: true, onboardingField: 'measurement_system' },
    ],
    onboardingMapping: { measurement_system: 'measurement_system' },
    entityMapping: {},
    defaults: { measurement_system: 'metric', shape: 'rectangular' },
  },
  concrete_calculator: {
    uiType: 'concrete_calculator',
    name: 'Concrete Calculator',
    category: UI_CATEGORIES.HOME,
    fields: [
      { name: 'length', type: 'number', required: true, prefillable: false },
      { name: 'width', type: 'number', required: true, prefillable: false },
      { name: 'depth', type: 'number', required: true, prefillable: false },
      { name: 'measurement_system', type: 'enum', required: false, prefillable: true, onboardingField: 'measurement_system' },
    ],
    onboardingMapping: { measurement_system: 'measurement_system' },
    entityMapping: {},
    defaults: { measurement_system: 'metric' },
  },
  mulch_calculator: {
    uiType: 'mulch_calculator',
    name: 'Mulch Calculator',
    category: UI_CATEGORIES.HOME,
    fields: [
      { name: 'area', type: 'number', required: true, prefillable: false },
      { name: 'depth', type: 'number', required: true, prefillable: false },
      { name: 'measurement_system', type: 'enum', required: false, prefillable: true, onboardingField: 'measurement_system' },
    ],
    onboardingMapping: { measurement_system: 'measurement_system' },
    entityMapping: {},
    defaults: { measurement_system: 'metric', depth: 3 },
  },

  // ----------------------------------------
  // TRAVEL
  // ----------------------------------------
  jet_lag_calculator: {
    uiType: 'jet_lag_calculator',
    name: 'Jet Lag Calculator',
    category: UI_CATEGORIES.TRAVEL,
    fields: [
      { name: 'departure_timezone', type: 'string', required: true, prefillable: true, onboardingField: 'timezone' },
      { name: 'arrival_timezone', type: 'string', required: true, prefillable: false },
      { name: 'travel_date', type: 'date', required: true, prefillable: false },
    ],
    onboardingMapping: { departure_timezone: 'timezone' },
    entityMapping: { arrival_timezone: [EntityType.LOCATION] },
    defaults: {},
  },
  luggage_weight: {
    uiType: 'luggage_weight',
    name: 'Luggage Weight Calculator',
    category: UI_CATEGORIES.TRAVEL,
    fields: [
      { name: 'items', type: 'array', required: true, prefillable: false },
      { name: 'weight_limit', type: 'number', required: true, prefillable: false },
      { name: 'measurement_system', type: 'enum', required: false, prefillable: true, onboardingField: 'measurement_system' },
    ],
    onboardingMapping: { measurement_system: 'measurement_system' },
    entityMapping: {},
    defaults: { measurement_system: 'metric' },
  },

  // ----------------------------------------
  // PROFESSIONAL SERVICES
  // ----------------------------------------
  freelance_timer: {
    uiType: 'freelance_timer',
    name: 'Freelance Time Tracker',
    category: UI_CATEGORIES.PROFESSIONAL,
    fields: [
      { name: 'project_name', type: 'string', required: true, prefillable: true },
      { name: 'client_name', type: 'string', required: true, prefillable: true },
      { name: 'hourly_rate', type: 'number', required: true, prefillable: false },
      { name: 'currency', type: 'string', required: true, prefillable: true, onboardingField: 'preferred_currency' },
    ],
    onboardingMapping: { currency: 'preferred_currency' },
    entityMapping: {
      project_name: [EntityType.PROJECT_NAME],
      client_name: [EntityType.COMPANY_NAME, EntityType.PERSON_NAME],
      hourly_rate: [EntityType.BUDGET],
    },
    defaults: { currency: 'USD' },
  },
  legal_billing: {
    uiType: 'legal_billing',
    name: 'Legal Billing Tracker',
    category: UI_CATEGORIES.PROFESSIONAL,
    fields: [
      { name: 'client_name', type: 'string', required: true, prefillable: true },
      { name: 'matter_name', type: 'string', required: true, prefillable: true },
      { name: 'hourly_rate', type: 'number', required: true, prefillable: false },
      { name: 'currency', type: 'string', required: true, prefillable: true, onboardingField: 'preferred_currency' },
    ],
    onboardingMapping: { currency: 'preferred_currency' },
    entityMapping: {
      client_name: [EntityType.COMPANY_NAME, EntityType.PERSON_NAME],
      matter_name: [EntityType.PROJECT_NAME],
    },
    defaults: { currency: 'USD' },
  },

  // ----------------------------------------
  // HEALTH & FITNESS (Extended)
  // ----------------------------------------
  bmi_calculator: {
    uiType: 'bmi_calculator',
    name: 'BMI Calculator',
    category: UI_CATEGORIES.HEALTH,
    fields: [
      { name: 'weight', type: 'number', required: true, prefillable: true, onboardingField: 'weight_kg' },
      { name: 'height', type: 'number', required: true, prefillable: true, onboardingField: 'height_cm' },
      { name: 'measurement_system', type: 'enum', required: false, prefillable: true, onboardingField: 'measurement_system' },
    ],
    onboardingMapping: { weight: 'weight_kg', height: 'height_cm', measurement_system: 'measurement_system' },
    entityMapping: {},
    defaults: { measurement_system: 'metric' },
    intentPatterns: ['calculate bmi', 'body mass index', 'check bmi', 'what is my bmi', 'bmi calculator', 'am i overweight', 'healthy weight'],
    primaryAction: 'calculate',
  },
  bmr_calculator: {
    uiType: 'bmr_calculator',
    name: 'BMR Calculator',
    category: UI_CATEGORIES.HEALTH,
    intentPatterns: ['calculate bmr', 'basal metabolic rate', 'bmr calculator', 'resting calories', 'metabolism calculator'],
    primaryAction: 'calculate',
    fields: [
      { name: 'weight', type: 'number', required: true, prefillable: true, onboardingField: 'weight_kg' },
      { name: 'height', type: 'number', required: true, prefillable: true, onboardingField: 'height_cm' },
      { name: 'age', type: 'number', required: true, prefillable: false },
      { name: 'gender', type: 'enum', required: true, prefillable: true, onboardingField: 'gender' },
    ],
    onboardingMapping: { weight: 'weight_kg', height: 'height_cm', gender: 'gender' },
    entityMapping: {},
    defaults: {},
  },
  tdee_calculator: {
    uiType: 'tdee_calculator',
    name: 'TDEE Calculator',
    category: UI_CATEGORIES.HEALTH,
    fields: [
      { name: 'weight', type: 'number', required: true, prefillable: true, onboardingField: 'weight_kg' },
      { name: 'height', type: 'number', required: true, prefillable: true, onboardingField: 'height_cm' },
      { name: 'age', type: 'number', required: true, prefillable: false },
      { name: 'gender', type: 'enum', required: true, prefillable: true, onboardingField: 'gender' },
      { name: 'activity_level', type: 'enum', required: true, prefillable: false },
    ],
    onboardingMapping: { weight: 'weight_kg', height: 'height_cm', gender: 'gender' },
    entityMapping: {},
    defaults: { activity_level: 'moderate' },
  },
  body_fat_calculator: {
    uiType: 'body_fat_calculator',
    name: 'Body Fat Calculator',
    category: UI_CATEGORIES.HEALTH,
    intentPatterns: ['calculate body fat', 'body fat percentage', 'body fat calculator', 'fat percentage'],
    primaryAction: 'calculate',
    fields: [
      { name: 'weight', type: 'number', required: true, prefillable: true, onboardingField: 'weight_kg' },
      { name: 'height', type: 'number', required: true, prefillable: true, onboardingField: 'height_cm' },
      { name: 'gender', type: 'enum', required: true, prefillable: true, onboardingField: 'gender' },
      { name: 'waist', type: 'number', required: true, prefillable: false },
      { name: 'neck', type: 'number', required: true, prefillable: false },
    ],
    onboardingMapping: { weight: 'weight_kg', height: 'height_cm', gender: 'gender' },
    entityMapping: {},
    defaults: {},
  },
  ideal_weight_calculator: {
    uiType: 'ideal_weight_calculator',
    name: 'Ideal Weight Calculator',
    category: UI_CATEGORIES.HEALTH,
    fields: [
      { name: 'height', type: 'number', required: true, prefillable: true, onboardingField: 'height_cm' },
      { name: 'gender', type: 'enum', required: true, prefillable: true, onboardingField: 'gender' },
      { name: 'frame_size', type: 'enum', required: false, prefillable: false },
    ],
    onboardingMapping: { height: 'height_cm', gender: 'gender' },
    entityMapping: {},
    defaults: { frame_size: 'medium' },
  },
  calorie_calculator: {
    uiType: 'calorie_calculator',
    name: 'Calorie Calculator',
    category: UI_CATEGORIES.HEALTH,
    fields: [
      { name: 'weight', type: 'number', required: true, prefillable: true, onboardingField: 'weight_kg' },
      { name: 'height', type: 'number', required: true, prefillable: true, onboardingField: 'height_cm' },
      { name: 'age', type: 'number', required: true, prefillable: false },
      { name: 'gender', type: 'enum', required: true, prefillable: true, onboardingField: 'gender' },
      { name: 'goal', type: 'enum', required: true, prefillable: true, onboardingField: 'fitness_goal' },
    ],
    onboardingMapping: { weight: 'weight_kg', height: 'height_cm', gender: 'gender', goal: 'fitness_goal' },
    entityMapping: {},
    defaults: {},
    intentPatterns: ['calculate calories', 'calorie calculator', 'daily calories', 'how many calories', 'calorie needs', 'caloric intake'],
    primaryAction: 'calculate',
  },
  water_intake_calculator: {
    uiType: 'water_intake_calculator',
    name: 'Water Intake Calculator',
    category: UI_CATEGORIES.HEALTH,
    fields: [
      { name: 'weight', type: 'number', required: true, prefillable: true, onboardingField: 'weight_kg' },
      { name: 'activity_level', type: 'enum', required: true, prefillable: false },
      { name: 'climate', type: 'enum', required: false, prefillable: false },
    ],
    onboardingMapping: { weight: 'weight_kg' },
    entityMapping: {},
    defaults: { climate: 'temperate' },
  },
  sleep_calculator: {
    uiType: 'sleep_calculator',
    name: 'Sleep Calculator',
    category: UI_CATEGORIES.HEALTH,
    fields: [
      { name: 'wake_time', type: 'string', required: true, prefillable: false },
      { name: 'age', type: 'number', required: false, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
    intentPatterns: ['sleep calculator', 'when to sleep', 'bedtime calculator', 'sleep cycles', 'when should i sleep'],
    primaryAction: 'calculate',
  },
  heart_rate_zone_calculator: {
    uiType: 'heart_rate_zone_calculator',
    name: 'Heart Rate Zone Calculator',
    category: UI_CATEGORIES.HEALTH,
    fields: [
      { name: 'age', type: 'number', required: true, prefillable: false },
      { name: 'resting_heart_rate', type: 'number', required: false, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
    intentPatterns: ['heart rate zone', 'calculate heart rate', 'target heart rate', 'cardio zone', 'fat burning zone'],
    primaryAction: 'calculate',
  },
  one_rep_max_calculator: {
    uiType: 'one_rep_max_calculator',
    name: 'One Rep Max Calculator',
    category: UI_CATEGORIES.HEALTH,
    fields: [
      { name: 'weight_lifted', type: 'number', required: true, prefillable: false },
      { name: 'reps', type: 'number', required: true, prefillable: false },
      { name: 'measurement_system', type: 'enum', required: false, prefillable: true, onboardingField: 'measurement_system' },
    ],
    onboardingMapping: { measurement_system: 'measurement_system' },
    entityMapping: {},
    defaults: { measurement_system: 'metric' },
    intentPatterns: ['one rep max', '1rm calculator', 'max lift', 'calculate 1rm', 'strength calculator'],
    primaryAction: 'calculate',
  },
  pace_calculator: {
    uiType: 'pace_calculator',
    name: 'Running Pace Calculator',
    category: UI_CATEGORIES.HEALTH,
    fields: [
      { name: 'distance', type: 'number', required: true, prefillable: false },
      { name: 'time', type: 'string', required: true, prefillable: false },
      { name: 'measurement_system', type: 'enum', required: false, prefillable: true, onboardingField: 'measurement_system' },
    ],
    onboardingMapping: { measurement_system: 'measurement_system' },
    entityMapping: {},
    defaults: { measurement_system: 'metric' },
    intentPatterns: ['calculate pace', 'running pace', 'pace calculator', 'min per km', 'min per mile', 'running speed'],
    primaryAction: 'calculate',
  },
  vo2_max_calculator: {
    uiType: 'vo2_max_calculator',
    name: 'VO2 Max Calculator',
    category: UI_CATEGORIES.HEALTH,
    fields: [
      { name: 'age', type: 'number', required: true, prefillable: false },
      { name: 'gender', type: 'enum', required: true, prefillable: true, onboardingField: 'gender' },
      { name: 'weight', type: 'number', required: true, prefillable: true, onboardingField: 'weight_kg' },
      { name: 'time_12min', type: 'number', required: true, prefillable: false },
    ],
    onboardingMapping: { gender: 'gender', weight: 'weight_kg' },
    entityMapping: {},
    defaults: {},
  },
  pregnancy_calculator: {
    uiType: 'pregnancy_calculator',
    name: 'Pregnancy Due Date Calculator',
    category: UI_CATEGORIES.HEALTH,
    fields: [
      { name: 'last_period_date', type: 'date', required: true, prefillable: false },
      { name: 'cycle_length', type: 'number', required: false, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: { cycle_length: 28 },
  },
  ovulation_calculator: {
    uiType: 'ovulation_calculator',
    name: 'Ovulation Calculator',
    category: UI_CATEGORIES.HEALTH,
    fields: [
      { name: 'last_period_date', type: 'date', required: true, prefillable: false },
      { name: 'cycle_length', type: 'number', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: { cycle_length: 28 },
  },
  blood_type_calculator: {
    uiType: 'blood_type_calculator',
    name: 'Blood Type Calculator',
    category: UI_CATEGORIES.HEALTH,
    fields: [
      { name: 'parent1_type', type: 'enum', required: true, prefillable: false },
      { name: 'parent2_type', type: 'enum', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  medication_dosage_calculator: {
    uiType: 'medication_dosage_calculator',
    name: 'Medication Dosage Calculator',
    category: UI_CATEGORIES.HEALTH,
    fields: [
      { name: 'weight', type: 'number', required: true, prefillable: true, onboardingField: 'weight_kg' },
      { name: 'medication', type: 'string', required: true, prefillable: false },
      { name: 'dose_per_kg', type: 'number', required: true, prefillable: false },
    ],
    onboardingMapping: { weight: 'weight_kg' },
    entityMapping: {},
    defaults: {},
  },
  waist_to_hip_ratio: {
    uiType: 'waist_to_hip_ratio',
    name: 'Waist to Hip Ratio Calculator',
    category: UI_CATEGORIES.HEALTH,
    fields: [
      { name: 'waist', type: 'number', required: true, prefillable: false },
      { name: 'hip', type: 'number', required: true, prefillable: false },
      { name: 'gender', type: 'enum', required: true, prefillable: true, onboardingField: 'gender' },
    ],
    onboardingMapping: { gender: 'gender' },
    entityMapping: {},
    defaults: {},
  },
  lean_body_mass_calculator: {
    uiType: 'lean_body_mass_calculator',
    name: 'Lean Body Mass Calculator',
    category: UI_CATEGORIES.HEALTH,
    fields: [
      { name: 'weight', type: 'number', required: true, prefillable: true, onboardingField: 'weight_kg' },
      { name: 'body_fat_percentage', type: 'number', required: true, prefillable: false },
    ],
    onboardingMapping: { weight: 'weight_kg' },
    entityMapping: {},
    defaults: {},
  },

  // ----------------------------------------
  // FINANCE & BUSINESS (Extended)
  // ----------------------------------------
  mortgage_calculator: {
    uiType: 'mortgage_calculator',
    name: 'Mortgage Calculator',
    category: UI_CATEGORIES.FINANCE,
    fields: [
      { name: 'loan_amount', type: 'number', required: true, prefillable: false },
      { name: 'interest_rate', type: 'number', required: true, prefillable: false },
      { name: 'loan_term', type: 'number', required: true, prefillable: false },
      { name: 'currency', type: 'string', required: true, prefillable: true, onboardingField: 'preferred_currency' },
    ],
    onboardingMapping: { currency: 'preferred_currency' },
    entityMapping: { loan_amount: [EntityType.BUDGET] },
    defaults: { currency: 'USD', loan_term: 30 },
    intentPatterns: ['calculate mortgage', 'mortgage calculator', 'home loan', 'monthly payment', 'house payment', 'mortgage payment'],
    primaryAction: 'calculate',
  },
  loan_calculator: {
    uiType: 'loan_calculator',
    name: 'Loan Calculator',
    category: UI_CATEGORIES.FINANCE,
    fields: [
      { name: 'principal', type: 'number', required: true, prefillable: false },
      { name: 'interest_rate', type: 'number', required: true, prefillable: false },
      { name: 'term_months', type: 'number', required: true, prefillable: false },
      { name: 'currency', type: 'string', required: true, prefillable: true, onboardingField: 'preferred_currency' },
    ],
    onboardingMapping: { currency: 'preferred_currency' },
    entityMapping: { principal: [EntityType.BUDGET] },
    defaults: { currency: 'USD' },
    intentPatterns: ['calculate loan', 'loan calculator', 'loan payment', 'loan interest', 'loan amortization'],
    primaryAction: 'calculate',
  },
  compound_interest_calculator: {
    uiType: 'compound_interest_calculator',
    name: 'Compound Interest Calculator',
    category: UI_CATEGORIES.FINANCE,
    fields: [
      { name: 'principal', type: 'number', required: true, prefillable: false },
      { name: 'rate', type: 'number', required: true, prefillable: false },
      { name: 'time_years', type: 'number', required: true, prefillable: false },
      { name: 'compounds_per_year', type: 'number', required: false, prefillable: false },
      { name: 'currency', type: 'string', required: true, prefillable: true, onboardingField: 'preferred_currency' },
    ],
    onboardingMapping: { currency: 'preferred_currency' },
    entityMapping: {},
    defaults: { currency: 'USD', compounds_per_year: 12 },
    intentPatterns: ['compound interest', 'interest calculator', 'investment growth', 'how much will i have', 'savings interest'],
    primaryAction: 'calculate',
  },
  roi_calculator: {
    uiType: 'roi_calculator',
    name: 'ROI Calculator',
    category: UI_CATEGORIES.FINANCE,
    intentPatterns: ['calculate roi', 'return on investment', 'roi calculator', 'investment return'],
    primaryAction: 'calculate',
    fields: [
      { name: 'initial_investment', type: 'number', required: true, prefillable: false },
      { name: 'final_value', type: 'number', required: true, prefillable: false },
      { name: 'currency', type: 'string', required: true, prefillable: true, onboardingField: 'preferred_currency' },
    ],
    onboardingMapping: { currency: 'preferred_currency' },
    entityMapping: {},
    defaults: { currency: 'USD' },
  },
  profit_margin_calculator: {
    uiType: 'profit_margin_calculator',
    name: 'Profit Margin Calculator',
    category: UI_CATEGORIES.FINANCE,
    fields: [
      { name: 'cost', type: 'number', required: true, prefillable: false },
      { name: 'revenue', type: 'number', required: true, prefillable: false },
      { name: 'currency', type: 'string', required: true, prefillable: true, onboardingField: 'preferred_currency' },
    ],
    onboardingMapping: { currency: 'preferred_currency' },
    entityMapping: {},
    defaults: { currency: 'USD' },
  },
  break_even_calculator: {
    uiType: 'break_even_calculator',
    name: 'Break Even Calculator',
    category: UI_CATEGORIES.FINANCE,
    fields: [
      { name: 'fixed_costs', type: 'number', required: true, prefillable: false },
      { name: 'price_per_unit', type: 'number', required: true, prefillable: false },
      { name: 'variable_cost_per_unit', type: 'number', required: true, prefillable: false },
      { name: 'currency', type: 'string', required: true, prefillable: true, onboardingField: 'preferred_currency' },
    ],
    onboardingMapping: { currency: 'preferred_currency' },
    entityMapping: {},
    defaults: { currency: 'USD' },
  },
  tip_calculator: {
    uiType: 'tip_calculator',
    name: 'Tip Calculator',
    category: UI_CATEGORIES.FINANCE,
    fields: [
      { name: 'bill_amount', type: 'number', required: true, prefillable: false },
      { name: 'tip_percentage', type: 'number', required: true, prefillable: false },
      { name: 'split_count', type: 'number', required: false, prefillable: false },
      { name: 'currency', type: 'string', required: true, prefillable: true, onboardingField: 'preferred_currency' },
    ],
    onboardingMapping: { currency: 'preferred_currency' },
    entityMapping: {},
    defaults: { currency: 'USD', tip_percentage: 15 },
    intentPatterns: ['calculate tip', 'how much tip', 'tip for', 'tip calculator', 'gratuity calculator', 'how much to tip', 'restaurant tip'],
    primaryAction: 'calculate',
  },
  salary_calculator: {
    uiType: 'salary_calculator',
    name: 'Salary Calculator',
    category: UI_CATEGORIES.FINANCE,
    fields: [
      { name: 'salary', type: 'number', required: true, prefillable: false },
      { name: 'pay_period', type: 'enum', required: true, prefillable: false },
      { name: 'currency', type: 'string', required: true, prefillable: true, onboardingField: 'preferred_currency' },
    ],
    onboardingMapping: { currency: 'preferred_currency' },
    entityMapping: { salary: [EntityType.BUDGET] },
    defaults: { currency: 'USD', pay_period: 'annual' },
  },
  tax_calculator: {
    uiType: 'tax_calculator',
    name: 'Tax Calculator',
    category: UI_CATEGORIES.FINANCE,
    fields: [
      { name: 'income', type: 'number', required: true, prefillable: false },
      { name: 'filing_status', type: 'enum', required: true, prefillable: false },
      { name: 'country', type: 'string', required: true, prefillable: true, onboardingField: 'country' },
      { name: 'currency', type: 'string', required: true, prefillable: true, onboardingField: 'preferred_currency' },
    ],
    onboardingMapping: { country: 'country', currency: 'preferred_currency' },
    entityMapping: { income: [EntityType.BUDGET] },
    defaults: { currency: 'USD' },
    intentPatterns: ['calculate tax', 'tax calculator', 'income tax', 'how much tax', 'tax estimation'],
    primaryAction: 'calculate',
  },
  savings_goal_calculator: {
    uiType: 'savings_goal_calculator',
    name: 'Savings Goal Calculator',
    category: UI_CATEGORIES.FINANCE,
    fields: [
      { name: 'goal_amount', type: 'number', required: true, prefillable: false },
      { name: 'current_savings', type: 'number', required: false, prefillable: false },
      { name: 'monthly_contribution', type: 'number', required: true, prefillable: false },
      { name: 'currency', type: 'string', required: true, prefillable: true, onboardingField: 'preferred_currency' },
    ],
    onboardingMapping: { currency: 'preferred_currency' },
    entityMapping: { goal_amount: [EntityType.BUDGET] },
    defaults: { currency: 'USD', current_savings: 0 },
  },
  net_worth_calculator: {
    uiType: 'net_worth_calculator',
    name: 'Net Worth Calculator',
    category: UI_CATEGORIES.FINANCE,
    fields: [
      { name: 'assets', type: 'array', required: true, prefillable: false },
      { name: 'liabilities', type: 'array', required: true, prefillable: false },
      { name: 'currency', type: 'string', required: true, prefillable: true, onboardingField: 'preferred_currency' },
    ],
    onboardingMapping: { currency: 'preferred_currency' },
    entityMapping: {},
    defaults: { currency: 'USD' },
  },
  retirement_calculator: {
    uiType: 'retirement_calculator',
    name: 'Retirement Calculator',
    category: UI_CATEGORIES.FINANCE,
    fields: [
      { name: 'current_age', type: 'number', required: true, prefillable: false },
      { name: 'retirement_age', type: 'number', required: true, prefillable: false },
      { name: 'current_savings', type: 'number', required: true, prefillable: false },
      { name: 'monthly_contribution', type: 'number', required: true, prefillable: false },
      { name: 'currency', type: 'string', required: true, prefillable: true, onboardingField: 'preferred_currency' },
    ],
    onboardingMapping: { currency: 'preferred_currency' },
    entityMapping: {},
    defaults: { currency: 'USD', retirement_age: 65 },
    intentPatterns: ['retirement calculator', 'retirement savings', 'when can i retire', 'retirement planning', '401k calculator'],
    primaryAction: 'calculate',
  },
  expense_tracker: {
    uiType: 'expense_tracker',
    name: 'Expense Tracker',
    category: UI_CATEGORIES.FINANCE,
    fields: [
      { name: 'amount', type: 'number', required: true, prefillable: false },
      { name: 'category', type: 'enum', required: true, prefillable: false },
      { name: 'date', type: 'date', required: true, prefillable: false },
      { name: 'currency', type: 'string', required: true, prefillable: true, onboardingField: 'preferred_currency' },
    ],
    onboardingMapping: { currency: 'preferred_currency' },
    entityMapping: { amount: [EntityType.BUDGET] },
    defaults: { currency: 'USD' },
  },
  discount_calculator: {
    uiType: 'discount_calculator',
    name: 'Discount Calculator',
    category: UI_CATEGORIES.FINANCE,
    fields: [
      { name: 'original_price', type: 'number', required: true, prefillable: false },
      { name: 'discount_percentage', type: 'number', required: true, prefillable: false },
      { name: 'currency', type: 'string', required: true, prefillable: true, onboardingField: 'preferred_currency' },
    ],
    onboardingMapping: { currency: 'preferred_currency' },
    entityMapping: {},
    defaults: { currency: 'USD' },
    intentPatterns: ['calculate discount', 'discount calculator', 'sale price', 'percent off', 'price after discount'],
    primaryAction: 'calculate',
  },
  percentage_calculator: {
    uiType: 'percentage_calculator',
    name: 'Percentage Calculator',
    category: UI_CATEGORIES.FINANCE,
    fields: [
      { name: 'value', type: 'number', required: true, prefillable: false },
      { name: 'percentage', type: 'number', required: true, prefillable: false },
      { name: 'calculation_type', type: 'enum', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: { calculation_type: 'of' },
    intentPatterns: ['calculate percentage', 'percent calculator', 'what percent', 'percentage of', 'find percentage'],
    primaryAction: 'calculate',
  },
  currency_converter: {
    uiType: 'currency_converter',
    name: 'Currency Converter',
    category: UI_CATEGORIES.FINANCE,
    fields: [
      { name: 'amount', type: 'number', required: true, prefillable: false },
      { name: 'from_currency', type: 'string', required: true, prefillable: true, onboardingField: 'preferred_currency' },
      { name: 'to_currency', type: 'string', required: true, prefillable: false },
    ],
    onboardingMapping: { from_currency: 'preferred_currency' },
    entityMapping: { amount: [EntityType.BUDGET] },
    defaults: {},
    intentPatterns: ['convert currency', 'exchange rate', 'usd to eur', 'dollars to euros', 'currency converter', 'money conversion', 'forex', 'how much is'],
    primaryAction: 'convert',
  },
  unit_price_calculator: {
    uiType: 'unit_price_calculator',
    name: 'Unit Price Calculator',
    category: UI_CATEGORIES.FINANCE,
    fields: [
      { name: 'price', type: 'number', required: true, prefillable: false },
      { name: 'quantity', type: 'number', required: true, prefillable: false },
      { name: 'unit', type: 'string', required: true, prefillable: false },
      { name: 'currency', type: 'string', required: true, prefillable: true, onboardingField: 'preferred_currency' },
    ],
    onboardingMapping: { currency: 'preferred_currency' },
    entityMapping: {},
    defaults: { currency: 'USD' },
  },
  split_bill_calculator: {
    uiType: 'split_bill_calculator',
    name: 'Split Bill Calculator',
    category: UI_CATEGORIES.FINANCE,
    fields: [
      { name: 'total_bill', type: 'number', required: true, prefillable: false },
      { name: 'number_of_people', type: 'number', required: true, prefillable: false },
      { name: 'tip_percentage', type: 'number', required: false, prefillable: false },
      { name: 'currency', type: 'string', required: true, prefillable: true, onboardingField: 'preferred_currency' },
    ],
    onboardingMapping: { currency: 'preferred_currency' },
    entityMapping: {},
    defaults: { currency: 'USD', tip_percentage: 0 },
    intentPatterns: ['split bill', 'split the bill', 'divide bill', 'split check', 'bill splitter'],
    primaryAction: 'calculate',
  },

  // ----------------------------------------
  // HOME & GARDEN (Extended)
  // ----------------------------------------
  paint_calculator: {
    uiType: 'paint_calculator',
    name: 'Paint Calculator',
    category: UI_CATEGORIES.HOME,
    fields: [
      { name: 'wall_area', type: 'number', required: true, prefillable: false },
      { name: 'coats', type: 'number', required: true, prefillable: false },
      { name: 'measurement_system', type: 'enum', required: false, prefillable: true, onboardingField: 'measurement_system' },
    ],
    onboardingMapping: { measurement_system: 'measurement_system' },
    entityMapping: {},
    defaults: { measurement_system: 'metric', coats: 2 },
    intentPatterns: ['calculate paint', 'how much paint', 'paint calculator', 'gallons of paint', 'wall paint needed'],
    primaryAction: 'calculate',
  },
  flooring_calculator: {
    uiType: 'flooring_calculator',
    name: 'Flooring Calculator',
    category: UI_CATEGORIES.HOME,
    fields: [
      { name: 'room_length', type: 'number', required: true, prefillable: false },
      { name: 'room_width', type: 'number', required: true, prefillable: false },
      { name: 'waste_percentage', type: 'number', required: false, prefillable: false },
      { name: 'measurement_system', type: 'enum', required: false, prefillable: true, onboardingField: 'measurement_system' },
    ],
    onboardingMapping: { measurement_system: 'measurement_system' },
    entityMapping: {},
    defaults: { measurement_system: 'metric', waste_percentage: 10 },
    intentPatterns: ['calculate flooring', 'flooring calculator', 'how much flooring', 'floor area', 'hardwood needed'],
    primaryAction: 'calculate',
  },
  tile_calculator: {
    uiType: 'tile_calculator',
    name: 'Tile Calculator',
    category: UI_CATEGORIES.HOME,
    fields: [
      { name: 'area', type: 'number', required: true, prefillable: false },
      { name: 'tile_size', type: 'number', required: true, prefillable: false },
      { name: 'measurement_system', type: 'enum', required: false, prefillable: true, onboardingField: 'measurement_system' },
    ],
    onboardingMapping: { measurement_system: 'measurement_system' },
    entityMapping: {},
    defaults: { measurement_system: 'metric' },
    intentPatterns: ['calculate tiles', 'tile calculator', 'how many tiles', 'tiles needed', 'tile for bathroom'],
    primaryAction: 'calculate',
  },
  wallpaper_calculator: {
    uiType: 'wallpaper_calculator',
    name: 'Wallpaper Calculator',
    category: UI_CATEGORIES.HOME,
    fields: [
      { name: 'wall_height', type: 'number', required: true, prefillable: false },
      { name: 'wall_width', type: 'number', required: true, prefillable: false },
      { name: 'roll_width', type: 'number', required: true, prefillable: false },
      { name: 'roll_length', type: 'number', required: true, prefillable: false },
      { name: 'measurement_system', type: 'enum', required: false, prefillable: true, onboardingField: 'measurement_system' },
    ],
    onboardingMapping: { measurement_system: 'measurement_system' },
    entityMapping: {},
    defaults: { measurement_system: 'metric' },
  },
  fence_calculator: {
    uiType: 'fence_calculator',
    name: 'Fence Calculator',
    category: UI_CATEGORIES.HOME,
    fields: [
      { name: 'perimeter', type: 'number', required: true, prefillable: false },
      { name: 'fence_height', type: 'number', required: true, prefillable: false },
      { name: 'post_spacing', type: 'number', required: true, prefillable: false },
      { name: 'measurement_system', type: 'enum', required: false, prefillable: true, onboardingField: 'measurement_system' },
    ],
    onboardingMapping: { measurement_system: 'measurement_system' },
    entityMapping: {},
    defaults: { measurement_system: 'metric' },
  },
  deck_calculator: {
    uiType: 'deck_calculator',
    name: 'Deck Calculator',
    category: UI_CATEGORIES.HOME,
    fields: [
      { name: 'length', type: 'number', required: true, prefillable: false },
      { name: 'width', type: 'number', required: true, prefillable: false },
      { name: 'board_width', type: 'number', required: true, prefillable: false },
      { name: 'measurement_system', type: 'enum', required: false, prefillable: true, onboardingField: 'measurement_system' },
    ],
    onboardingMapping: { measurement_system: 'measurement_system' },
    entityMapping: {},
    defaults: { measurement_system: 'metric' },
  },
  gravel_calculator: {
    uiType: 'gravel_calculator',
    name: 'Gravel Calculator',
    category: UI_CATEGORIES.HOME,
    fields: [
      { name: 'length', type: 'number', required: true, prefillable: false },
      { name: 'width', type: 'number', required: true, prefillable: false },
      { name: 'depth', type: 'number', required: true, prefillable: false },
      { name: 'measurement_system', type: 'enum', required: false, prefillable: true, onboardingField: 'measurement_system' },
    ],
    onboardingMapping: { measurement_system: 'measurement_system' },
    entityMapping: {},
    defaults: { measurement_system: 'metric' },
  },
  soil_calculator: {
    uiType: 'soil_calculator',
    name: 'Soil Calculator',
    category: UI_CATEGORIES.HOME,
    fields: [
      { name: 'area', type: 'number', required: true, prefillable: false },
      { name: 'depth', type: 'number', required: true, prefillable: false },
      { name: 'measurement_system', type: 'enum', required: false, prefillable: true, onboardingField: 'measurement_system' },
    ],
    onboardingMapping: { measurement_system: 'measurement_system' },
    entityMapping: {},
    defaults: { measurement_system: 'metric' },
  },
  lawn_fertilizer_calculator: {
    uiType: 'lawn_fertilizer_calculator',
    name: 'Lawn Fertilizer Calculator',
    category: UI_CATEGORIES.HOME,
    fields: [
      { name: 'lawn_area', type: 'number', required: true, prefillable: false },
      { name: 'fertilizer_rate', type: 'number', required: true, prefillable: false },
      { name: 'measurement_system', type: 'enum', required: false, prefillable: true, onboardingField: 'measurement_system' },
    ],
    onboardingMapping: { measurement_system: 'measurement_system' },
    entityMapping: {},
    defaults: { measurement_system: 'metric' },
  },
  seed_calculator: {
    uiType: 'seed_calculator',
    name: 'Seed Calculator',
    category: UI_CATEGORIES.HOME,
    fields: [
      { name: 'area', type: 'number', required: true, prefillable: false },
      { name: 'seed_rate', type: 'number', required: true, prefillable: false },
      { name: 'measurement_system', type: 'enum', required: false, prefillable: true, onboardingField: 'measurement_system' },
    ],
    onboardingMapping: { measurement_system: 'measurement_system' },
    entityMapping: {},
    defaults: { measurement_system: 'metric' },
  },
  btu_calculator: {
    uiType: 'btu_calculator',
    name: 'BTU Calculator',
    category: UI_CATEGORIES.HOME,
    fields: [
      { name: 'room_area', type: 'number', required: true, prefillable: false },
      { name: 'ceiling_height', type: 'number', required: true, prefillable: false },
      { name: 'insulation_level', type: 'enum', required: true, prefillable: false },
      { name: 'measurement_system', type: 'enum', required: false, prefillable: true, onboardingField: 'measurement_system' },
    ],
    onboardingMapping: { measurement_system: 'measurement_system' },
    entityMapping: {},
    defaults: { measurement_system: 'metric', insulation_level: 'average' },
  },
  electricity_cost_calculator: {
    uiType: 'electricity_cost_calculator',
    name: 'Electricity Cost Calculator',
    category: UI_CATEGORIES.HOME,
    fields: [
      { name: 'wattage', type: 'number', required: true, prefillable: false },
      { name: 'hours_per_day', type: 'number', required: true, prefillable: false },
      { name: 'cost_per_kwh', type: 'number', required: true, prefillable: false },
      { name: 'currency', type: 'string', required: true, prefillable: true, onboardingField: 'preferred_currency' },
    ],
    onboardingMapping: { currency: 'preferred_currency' },
    entityMapping: {},
    defaults: { currency: 'USD' },
  },
  room_area_calculator: {
    uiType: 'room_area_calculator',
    name: 'Room Area Calculator',
    category: UI_CATEGORIES.HOME,
    fields: [
      { name: 'length', type: 'number', required: true, prefillable: false },
      { name: 'width', type: 'number', required: true, prefillable: false },
      { name: 'measurement_system', type: 'enum', required: false, prefillable: true, onboardingField: 'measurement_system' },
    ],
    onboardingMapping: { measurement_system: 'measurement_system' },
    entityMapping: {},
    defaults: { measurement_system: 'metric' },
  },
  stair_calculator: {
    uiType: 'stair_calculator',
    name: 'Stair Calculator',
    category: UI_CATEGORIES.HOME,
    fields: [
      { name: 'total_rise', type: 'number', required: true, prefillable: false },
      { name: 'riser_height', type: 'number', required: false, prefillable: false },
      { name: 'measurement_system', type: 'enum', required: false, prefillable: true, onboardingField: 'measurement_system' },
    ],
    onboardingMapping: { measurement_system: 'measurement_system' },
    entityMapping: {},
    defaults: { measurement_system: 'metric' },
  },
  moving_cost_calculator: {
    uiType: 'moving_cost_calculator',
    name: 'Moving Cost Calculator',
    category: UI_CATEGORIES.HOME,
    fields: [
      { name: 'distance', type: 'number', required: true, prefillable: false },
      { name: 'home_size', type: 'enum', required: true, prefillable: false },
      { name: 'currency', type: 'string', required: true, prefillable: true, onboardingField: 'preferred_currency' },
    ],
    onboardingMapping: { currency: 'preferred_currency' },
    entityMapping: { distance: [EntityType.LOCATION] },
    defaults: { currency: 'USD' },
  },

  // ----------------------------------------
  // COOKING & FOOD (Extended)
  // ----------------------------------------
  recipe_scaler: {
    uiType: 'recipe_scaler',
    name: 'Recipe Scaler',
    category: UI_CATEGORIES.COOKING,
    fields: [
      { name: 'original_servings', type: 'number', required: true, prefillable: false },
      { name: 'desired_servings', type: 'number', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
    intentPatterns: ['scale recipe', 'recipe scaler', 'adjust servings', 'double recipe', 'half recipe', 'resize recipe'],
    primaryAction: 'scale',
  },
  cooking_conversion: {
    uiType: 'cooking_conversion',
    name: 'Cooking Measurement Converter',
    category: UI_CATEGORIES.COOKING,
    fields: [
      { name: 'amount', type: 'number', required: true, prefillable: false },
      { name: 'from_unit', type: 'enum', required: true, prefillable: false },
      { name: 'to_unit', type: 'enum', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
    intentPatterns: ['convert cooking measurement', 'cups to grams', 'tablespoon to ml', 'cooking conversion', 'kitchen measurements'],
    primaryAction: 'convert',
  },
  oven_temperature_converter: {
    uiType: 'oven_temperature_converter',
    name: 'Oven Temperature Converter',
    category: UI_CATEGORIES.COOKING,
    fields: [
      { name: 'temperature', type: 'number', required: true, prefillable: false },
      { name: 'from_unit', type: 'enum', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  baking_substitution: {
    uiType: 'baking_substitution',
    name: 'Baking Substitution Calculator',
    category: UI_CATEGORIES.COOKING,
    fields: [
      { name: 'ingredient', type: 'string', required: true, prefillable: false },
      { name: 'amount', type: 'number', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  cooking_timer: {
    uiType: 'cooking_timer',
    name: 'Cooking Timer',
    category: UI_CATEGORIES.COOKING,
    fields: [
      { name: 'food_type', type: 'enum', required: true, prefillable: false },
      { name: 'weight', type: 'number', required: true, prefillable: false },
      { name: 'cooking_method', type: 'enum', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  turkey_cooking_time: {
    uiType: 'turkey_cooking_time',
    name: 'Turkey Cooking Time Calculator',
    category: UI_CATEGORIES.COOKING,
    fields: [
      { name: 'weight', type: 'number', required: true, prefillable: false },
      { name: 'stuffed', type: 'boolean', required: true, prefillable: false },
      { name: 'measurement_system', type: 'enum', required: false, prefillable: true, onboardingField: 'measurement_system' },
    ],
    onboardingMapping: { measurement_system: 'measurement_system' },
    entityMapping: {},
    defaults: { measurement_system: 'metric', stuffed: false },
  },
  roast_calculator: {
    uiType: 'roast_calculator',
    name: 'Roast Calculator',
    category: UI_CATEGORIES.COOKING,
    fields: [
      { name: 'meat_type', type: 'enum', required: true, prefillable: false },
      { name: 'weight', type: 'number', required: true, prefillable: false },
      { name: 'doneness', type: 'enum', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: { doneness: 'medium' },
  },
  coffee_ratio_calculator: {
    uiType: 'coffee_ratio_calculator',
    name: 'Coffee Ratio Calculator',
    category: UI_CATEGORIES.COOKING,
    fields: [
      { name: 'cups', type: 'number', required: true, prefillable: false },
      { name: 'strength', type: 'enum', required: true, prefillable: false },
      { name: 'brew_method', type: 'enum', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: { strength: 'medium' },
  },
  bread_calculator: {
    uiType: 'bread_calculator',
    name: 'Bread Calculator',
    category: UI_CATEGORIES.COOKING,
    fields: [
      { name: 'flour_amount', type: 'number', required: true, prefillable: false },
      { name: 'hydration_percentage', type: 'number', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: { hydration_percentage: 65 },
  },
  pasta_portion_calculator: {
    uiType: 'pasta_portion_calculator',
    name: 'Pasta Portion Calculator',
    category: UI_CATEGORIES.COOKING,
    fields: [
      { name: 'servings', type: 'number', required: true, prefillable: false },
      { name: 'pasta_type', type: 'enum', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  rice_water_ratio: {
    uiType: 'rice_water_ratio',
    name: 'Rice Water Ratio Calculator',
    category: UI_CATEGORIES.COOKING,
    fields: [
      { name: 'rice_cups', type: 'number', required: true, prefillable: false },
      { name: 'rice_type', type: 'enum', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  cake_pan_converter: {
    uiType: 'cake_pan_converter',
    name: 'Cake Pan Converter',
    category: UI_CATEGORIES.COOKING,
    fields: [
      { name: 'original_pan_size', type: 'string', required: true, prefillable: false },
      { name: 'new_pan_size', type: 'string', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },

  // ----------------------------------------
  // TRAVEL (Extended)
  // ----------------------------------------
  flight_time_calculator: {
    uiType: 'flight_time_calculator',
    name: 'Flight Time Calculator',
    category: UI_CATEGORIES.TRAVEL,
    fields: [
      { name: 'origin', type: 'string', required: true, prefillable: true, onboardingField: 'country' },
      { name: 'destination', type: 'string', required: true, prefillable: false },
    ],
    onboardingMapping: { origin: 'country' },
    entityMapping: { origin: [EntityType.LOCATION], destination: [EntityType.LOCATION] },
    defaults: {},
  },
  travel_budget_calculator: {
    uiType: 'travel_budget_calculator',
    name: 'Travel Budget Calculator',
    category: UI_CATEGORIES.TRAVEL,
    fields: [
      { name: 'destination', type: 'string', required: true, prefillable: false },
      { name: 'duration_days', type: 'number', required: true, prefillable: false },
      { name: 'travel_style', type: 'enum', required: true, prefillable: false },
      { name: 'currency', type: 'string', required: true, prefillable: true, onboardingField: 'preferred_currency' },
    ],
    onboardingMapping: { currency: 'preferred_currency' },
    entityMapping: { destination: [EntityType.LOCATION] },
    defaults: { currency: 'USD', travel_style: 'moderate' },
  },
  packing_list_generator: {
    uiType: 'packing_list_generator',
    name: 'Packing List Generator',
    category: UI_CATEGORIES.TRAVEL,
    fields: [
      { name: 'destination', type: 'string', required: true, prefillable: false },
      { name: 'duration_days', type: 'number', required: true, prefillable: false },
      { name: 'trip_type', type: 'enum', required: true, prefillable: false },
      { name: 'climate', type: 'enum', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: { destination: [EntityType.LOCATION] },
    defaults: {},
  },
  time_zone_converter: {
    uiType: 'time_zone_converter',
    name: 'Time Zone Converter',
    category: UI_CATEGORIES.TRAVEL,
    fields: [
      { name: 'time', type: 'string', required: true, prefillable: false },
      { name: 'from_timezone', type: 'string', required: true, prefillable: true, onboardingField: 'timezone' },
      { name: 'to_timezone', type: 'string', required: true, prefillable: false },
    ],
    onboardingMapping: { from_timezone: 'timezone' },
    entityMapping: {},
    defaults: {},
    intentPatterns: ['convert timezone', 'time zone converter', 'what time is it in', 'time difference', 'world time'],
    primaryAction: 'convert',
  },
  driving_distance_calculator: {
    uiType: 'driving_distance_calculator',
    name: 'Driving Distance Calculator',
    category: UI_CATEGORIES.TRAVEL,
    fields: [
      { name: 'origin', type: 'string', required: true, prefillable: true, onboardingField: 'country' },
      { name: 'destination', type: 'string', required: true, prefillable: false },
    ],
    onboardingMapping: { origin: 'country' },
    entityMapping: { origin: [EntityType.LOCATION], destination: [EntityType.LOCATION] },
    defaults: {},
  },
  fuel_cost_calculator: {
    uiType: 'fuel_cost_calculator',
    name: 'Fuel Cost Calculator',
    category: UI_CATEGORIES.TRAVEL,
    fields: [
      { name: 'distance', type: 'number', required: true, prefillable: false },
      { name: 'fuel_efficiency', type: 'number', required: true, prefillable: false },
      { name: 'fuel_price', type: 'number', required: true, prefillable: false },
      { name: 'currency', type: 'string', required: true, prefillable: true, onboardingField: 'preferred_currency' },
    ],
    onboardingMapping: { currency: 'preferred_currency' },
    entityMapping: {},
    defaults: { currency: 'USD' },
    intentPatterns: ['fuel cost', 'gas cost', 'trip fuel cost', 'how much gas', 'fuel calculator'],
    primaryAction: 'calculate',
  },
  visa_requirement_checker: {
    uiType: 'visa_requirement_checker',
    name: 'Visa Requirement Checker',
    category: UI_CATEGORIES.TRAVEL,
    fields: [
      { name: 'passport_country', type: 'string', required: true, prefillable: true, onboardingField: 'country' },
      { name: 'destination_country', type: 'string', required: true, prefillable: false },
    ],
    onboardingMapping: { passport_country: 'country' },
    intentPatterns: ['visa requirement', 'do i need visa', 'visa checker', 'travel visa', 'visa for'],
    primaryAction: 'check',
    entityMapping: { destination_country: [EntityType.LOCATION] },
    defaults: {},
  },
  tip_etiquette_guide: {
    uiType: 'tip_etiquette_guide',
    name: 'Tip Etiquette Guide',
    category: UI_CATEGORIES.TRAVEL,
    fields: [
      { name: 'country', type: 'string', required: true, prefillable: false },
      { name: 'service_type', type: 'enum', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: { country: [EntityType.LOCATION] },
    defaults: {},
  },

  // ----------------------------------------
  // AUTOMOTIVE (Extended)
  // ----------------------------------------
  mpg_calculator: {
    uiType: 'mpg_calculator',
    name: 'MPG Calculator',
    category: UI_CATEGORIES.AUTOMOTIVE,
    fields: [
      { name: 'distance', type: 'number', required: true, prefillable: false },
      { name: 'fuel_used', type: 'number', required: true, prefillable: false },
      { name: 'measurement_system', type: 'enum', required: false, prefillable: true, onboardingField: 'measurement_system' },
    ],
    onboardingMapping: { measurement_system: 'measurement_system' },
    entityMapping: {},
    defaults: { measurement_system: 'metric' },
  },
  tire_size_calculator: {
    uiType: 'tire_size_calculator',
    name: 'Tire Size Calculator',
    category: UI_CATEGORIES.AUTOMOTIVE,
    fields: [
      { name: 'tire_width', type: 'number', required: true, prefillable: false },
      { name: 'aspect_ratio', type: 'number', required: true, prefillable: false },
      { name: 'rim_diameter', type: 'number', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  car_depreciation_calculator: {
    uiType: 'car_depreciation_calculator',
    name: 'Car Depreciation Calculator',
    category: UI_CATEGORIES.AUTOMOTIVE,
    fields: [
      { name: 'purchase_price', type: 'number', required: true, prefillable: false },
      { name: 'years', type: 'number', required: true, prefillable: false },
      { name: 'currency', type: 'string', required: true, prefillable: true, onboardingField: 'preferred_currency' },
    ],
    onboardingMapping: { currency: 'preferred_currency' },
    entityMapping: {},
    defaults: { currency: 'USD' },
  },
  oil_change_tracker: {
    uiType: 'oil_change_tracker',
    name: 'Oil Change Tracker',
    category: UI_CATEGORIES.AUTOMOTIVE,
    fields: [
      { name: 'last_change_mileage', type: 'number', required: true, prefillable: false },
      { name: 'current_mileage', type: 'number', required: true, prefillable: false },
      { name: 'change_interval', type: 'number', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: { change_interval: 5000 },
  },
  engine_horsepower_calculator: {
    uiType: 'engine_horsepower_calculator',
    name: 'Engine Horsepower Calculator',
    category: UI_CATEGORIES.AUTOMOTIVE,
    fields: [
      { name: 'torque', type: 'number', required: true, prefillable: false },
      { name: 'rpm', type: 'number', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  car_lease_calculator: {
    uiType: 'car_lease_calculator',
    name: 'Car Lease Calculator',
    category: UI_CATEGORIES.AUTOMOTIVE,
    fields: [
      { name: 'msrp', type: 'number', required: true, prefillable: false },
      { name: 'residual_value', type: 'number', required: true, prefillable: false },
      { name: 'lease_term', type: 'number', required: true, prefillable: false },
      { name: 'money_factor', type: 'number', required: true, prefillable: false },
      { name: 'currency', type: 'string', required: true, prefillable: true, onboardingField: 'preferred_currency' },
    ],
    onboardingMapping: { currency: 'preferred_currency' },
    entityMapping: {},
    defaults: { currency: 'USD' },
  },

  // ----------------------------------------
  // PETS (Extended)
  // ----------------------------------------
  pet_age_calculator: {
    uiType: 'pet_age_calculator',
    name: 'Pet Age Calculator',
    category: UI_CATEGORIES.PETS,
    fields: [
      { name: 'pet_type', type: 'enum', required: true, prefillable: false },
      { name: 'pet_age', type: 'number', required: true, prefillable: false },
      { name: 'breed_size', type: 'enum', required: false, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  pet_food_calculator: {
    uiType: 'pet_food_calculator',
    name: 'Pet Food Calculator',
    category: UI_CATEGORIES.PETS,
    fields: [
      { name: 'pet_type', type: 'enum', required: true, prefillable: false },
      { name: 'weight', type: 'number', required: true, prefillable: false },
      { name: 'activity_level', type: 'enum', required: true, prefillable: false },
      { name: 'age', type: 'enum', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  pet_medication_dosage: {
    uiType: 'pet_medication_dosage',
    name: 'Pet Medication Dosage',
    category: UI_CATEGORIES.PETS,
    fields: [
      { name: 'pet_weight', type: 'number', required: true, prefillable: false },
      { name: 'medication', type: 'string', required: true, prefillable: false },
      { name: 'dose_per_kg', type: 'number', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  aquarium_calculator: {
    uiType: 'aquarium_calculator',
    name: 'Aquarium Calculator',
    category: UI_CATEGORIES.PETS,
    fields: [
      { name: 'length', type: 'number', required: true, prefillable: false },
      { name: 'width', type: 'number', required: true, prefillable: false },
      { name: 'height', type: 'number', required: true, prefillable: false },
      { name: 'measurement_system', type: 'enum', required: false, prefillable: true, onboardingField: 'measurement_system' },
    ],
    onboardingMapping: { measurement_system: 'measurement_system' },
    entityMapping: {},
    defaults: { measurement_system: 'metric' },
  },
  dog_pregnancy_calculator: {
    uiType: 'dog_pregnancy_calculator',
    name: 'Dog Pregnancy Calculator',
    category: UI_CATEGORIES.PETS,
    fields: [
      { name: 'breeding_date', type: 'date', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  cat_pregnancy_calculator: {
    uiType: 'cat_pregnancy_calculator',
    name: 'Cat Pregnancy Calculator',
    category: UI_CATEGORIES.PETS,
    fields: [
      { name: 'breeding_date', type: 'date', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },

  // ----------------------------------------
  // EDUCATION (Extended)
  // ----------------------------------------
  gpa_calculator: {
    uiType: 'gpa_calculator',
    name: 'GPA Calculator',
    category: UI_CATEGORIES.EDUCATION,
    fields: [
      { name: 'grades', type: 'array', required: true, prefillable: false },
      { name: 'credit_hours', type: 'array', required: true, prefillable: false },
      { name: 'scale', type: 'enum', required: false, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: { scale: '4.0' },
    intentPatterns: ['calculate gpa', 'gpa calculator', 'grade point average', 'what is my gpa', 'college gpa'],
    primaryAction: 'calculate',
  },
  grade_calculator: {
    uiType: 'grade_calculator',
    name: 'Grade Calculator',
    category: UI_CATEGORIES.EDUCATION,
    fields: [
      { name: 'current_grade', type: 'number', required: true, prefillable: false },
      { name: 'desired_grade', type: 'number', required: true, prefillable: false },
      { name: 'final_weight', type: 'number', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
    intentPatterns: ['calculate grade', 'grade calculator', 'final exam grade', 'what grade do i need', 'final grade needed'],
    primaryAction: 'calculate',
  },
  study_time_calculator: {
    uiType: 'study_time_calculator',
    name: 'Study Time Calculator',
    category: UI_CATEGORIES.EDUCATION,
    fields: [
      { name: 'pages_to_read', type: 'number', required: true, prefillable: false },
      { name: 'reading_speed', type: 'number', required: false, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: { reading_speed: 250 },
  },
  typing_speed_test: {
    uiType: 'typing_speed_test',
    name: 'Typing Speed Test',
    category: UI_CATEGORIES.EDUCATION,
    fields: [
      { name: 'duration', type: 'number', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: { duration: 60 },
  },
  reading_level_calculator: {
    uiType: 'reading_level_calculator',
    name: 'Reading Level Calculator',
    category: UI_CATEGORIES.EDUCATION,
    fields: [
      { name: 'text', type: 'string', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  flashcard_generator: {
    uiType: 'flashcard_generator',
    name: 'Flashcard Generator',
    category: UI_CATEGORIES.EDUCATION,
    fields: [
      { name: 'topic', type: 'string', required: true, prefillable: false },
      { name: 'number_of_cards', type: 'number', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: { topic: [EntityType.TOPIC] },
    defaults: { number_of_cards: 10 },
  },
  citation_generator: {
    uiType: 'citation_generator',
    name: 'Citation Generator',
    category: UI_CATEGORIES.EDUCATION,
    fields: [
      { name: 'source_type', type: 'enum', required: true, prefillable: false },
      { name: 'citation_style', type: 'enum', required: true, prefillable: false },
      { name: 'title', type: 'string', required: true, prefillable: false },
      { name: 'author', type: 'string', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: { title: [EntityType.TITLE], author: [EntityType.PERSON_NAME] },
    defaults: { citation_style: 'APA' },
  },

  // ----------------------------------------
  // ENTERTAINMENT & GAMES
  // ----------------------------------------
  dice_roller: {
    uiType: 'dice_roller',
    name: 'Dice Roller',
    category: UI_CATEGORIES.ENTERTAINMENT,
    fields: [
      { name: 'number_of_dice', type: 'number', required: true, prefillable: false },
      { name: 'sides', type: 'number', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: { number_of_dice: 2, sides: 6 },
    intentPatterns: ['roll dice', 'dice roller', 'random dice', 'd20 roll', 'roll d6'],
    primaryAction: 'roll',
  },
  coin_flip: {
    uiType: 'coin_flip',
    name: 'Coin Flip',
    category: UI_CATEGORIES.ENTERTAINMENT,
    fields: [
      { name: 'number_of_flips', type: 'number', required: false, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: { number_of_flips: 1 },
    intentPatterns: ['flip coin', 'coin flip', 'heads or tails', 'flip a coin', 'toss coin'],
    primaryAction: 'flip',
  },
  random_name_picker: {
    uiType: 'random_name_picker',
    name: 'Random Name Picker',
    category: UI_CATEGORIES.ENTERTAINMENT,
    fields: [
      { name: 'names', type: 'array', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
    intentPatterns: ['pick random name', 'random name picker', 'choose random person', 'select random', 'random winner'],
    primaryAction: 'pick',
  },
  team_generator: {
    uiType: 'team_generator',
    name: 'Team Generator',
    category: UI_CATEGORIES.ENTERTAINMENT,
    fields: [
      { name: 'participants', type: 'array', required: true, prefillable: false },
      { name: 'number_of_teams', type: 'number', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: { number_of_teams: 2 },
    intentPatterns: ['generate teams', 'team generator', 'split into teams', 'random teams', 'create teams'],
    primaryAction: 'generate',
  },
  trivia_generator: {
    uiType: 'trivia_generator',
    name: 'Trivia Generator',
    category: UI_CATEGORIES.ENTERTAINMENT,
    fields: [
      { name: 'category', type: 'enum', required: true, prefillable: false },
      { name: 'difficulty', type: 'enum', required: true, prefillable: false },
      { name: 'number_of_questions', type: 'number', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: { difficulty: 'medium', number_of_questions: 10 },
  },
  movie_runtime_calculator: {
    uiType: 'movie_runtime_calculator',
    name: 'Movie Runtime Calculator',
    category: UI_CATEGORIES.ENTERTAINMENT,
    fields: [
      { name: 'movies', type: 'array', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  binge_watch_calculator: {
    uiType: 'binge_watch_calculator',
    name: 'Binge Watch Calculator',
    category: UI_CATEGORIES.ENTERTAINMENT,
    fields: [
      { name: 'episodes', type: 'number', required: true, prefillable: false },
      { name: 'episode_length', type: 'number', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },

  // ----------------------------------------
  // SPORTS & RECREATION
  // ----------------------------------------
  golf_handicap_calculator: {
    uiType: 'golf_handicap_calculator',
    name: 'Golf Handicap Calculator',
    category: UI_CATEGORIES.SPORTS,
    fields: [
      { name: 'scores', type: 'array', required: true, prefillable: false },
      { name: 'course_ratings', type: 'array', required: true, prefillable: false },
      { name: 'slope_ratings', type: 'array', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  bowling_score_calculator: {
    uiType: 'bowling_score_calculator',
    name: 'Bowling Score Calculator',
    category: UI_CATEGORIES.SPORTS,
    fields: [
      { name: 'frames', type: 'array', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  baseball_stats_calculator: {
    uiType: 'baseball_stats_calculator',
    name: 'Baseball Stats Calculator',
    category: UI_CATEGORIES.SPORTS,
    fields: [
      { name: 'at_bats', type: 'number', required: true, prefillable: false },
      { name: 'hits', type: 'number', required: true, prefillable: false },
      { name: 'walks', type: 'number', required: false, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  cycling_calorie_calculator: {
    uiType: 'cycling_calorie_calculator',
    name: 'Cycling Calorie Calculator',
    category: UI_CATEGORIES.SPORTS,
    fields: [
      { name: 'weight', type: 'number', required: true, prefillable: true, onboardingField: 'weight_kg' },
      { name: 'distance', type: 'number', required: true, prefillable: false },
      { name: 'time', type: 'number', required: true, prefillable: false },
    ],
    onboardingMapping: { weight: 'weight_kg' },
    entityMapping: {},
    defaults: {},
  },
  swimming_calorie_calculator: {
    uiType: 'swimming_calorie_calculator',
    name: 'Swimming Calorie Calculator',
    category: UI_CATEGORIES.SPORTS,
    fields: [
      { name: 'weight', type: 'number', required: true, prefillable: true, onboardingField: 'weight_kg' },
      { name: 'stroke_type', type: 'enum', required: true, prefillable: false },
      { name: 'duration', type: 'number', required: true, prefillable: false },
    ],
    onboardingMapping: { weight: 'weight_kg' },
    entityMapping: {},
    defaults: {},
  },
  running_calorie_calculator: {
    uiType: 'running_calorie_calculator',
    name: 'Running Calorie Calculator',
    category: UI_CATEGORIES.SPORTS,
    fields: [
      { name: 'weight', type: 'number', required: true, prefillable: true, onboardingField: 'weight_kg' },
      { name: 'distance', type: 'number', required: true, prefillable: false },
      { name: 'time', type: 'number', required: true, prefillable: false },
    ],
    onboardingMapping: { weight: 'weight_kg' },
    entityMapping: {},
    defaults: {},
  },

  // ----------------------------------------
  // BEAUTY & SELF-CARE
  // ----------------------------------------
  skin_type_analyzer: {
    uiType: 'skin_type_analyzer',
    name: 'Skin Type Analyzer',
    category: UI_CATEGORIES.BEAUTY,
    fields: [
      { name: 'oiliness', type: 'enum', required: true, prefillable: false },
      { name: 'sensitivity', type: 'enum', required: true, prefillable: false },
      { name: 'hydration', type: 'enum', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  hair_type_analyzer: {
    uiType: 'hair_type_analyzer',
    name: 'Hair Type Analyzer',
    category: UI_CATEGORIES.BEAUTY,
    fields: [
      { name: 'texture', type: 'enum', required: true, prefillable: false },
      { name: 'porosity', type: 'enum', required: true, prefillable: false },
      { name: 'density', type: 'enum', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  sunscreen_calculator: {
    uiType: 'sunscreen_calculator',
    name: 'Sunscreen Calculator',
    category: UI_CATEGORIES.BEAUTY,
    fields: [
      { name: 'skin_type', type: 'enum', required: true, prefillable: false },
      { name: 'uv_index', type: 'number', required: true, prefillable: false },
      { name: 'activity', type: 'enum', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  ring_size_converter: {
    uiType: 'ring_size_converter',
    name: 'Ring Size Converter',
    category: UI_CATEGORIES.BEAUTY,
    fields: [
      { name: 'size', type: 'number', required: true, prefillable: false },
      { name: 'from_system', type: 'enum', required: true, prefillable: false },
      { name: 'to_system', type: 'enum', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  dress_size_converter: {
    uiType: 'dress_size_converter',
    name: 'Dress Size Converter',
    category: UI_CATEGORIES.BEAUTY,
    fields: [
      { name: 'size', type: 'number', required: true, prefillable: false },
      { name: 'from_country', type: 'string', required: true, prefillable: true, onboardingField: 'country' },
      { name: 'to_country', type: 'string', required: true, prefillable: false },
    ],
    onboardingMapping: { from_country: 'country' },
    entityMapping: {},
    defaults: {},
  },
  bra_size_calculator: {
    uiType: 'bra_size_calculator',
    name: 'Bra Size Calculator',
    category: UI_CATEGORIES.BEAUTY,
    fields: [
      { name: 'band_measurement', type: 'number', required: true, prefillable: false },
      { name: 'bust_measurement', type: 'number', required: true, prefillable: false },
      { name: 'measurement_system', type: 'enum', required: false, prefillable: true, onboardingField: 'measurement_system' },
    ],
    onboardingMapping: { measurement_system: 'measurement_system' },
    entityMapping: {},
    defaults: { measurement_system: 'metric' },
  },

  // ----------------------------------------
  // EVENTS & PLANNING
  // ----------------------------------------
  wedding_budget_calculator: {
    uiType: 'wedding_budget_calculator',
    name: 'Wedding Budget Calculator',
    category: UI_CATEGORIES.EVENTS,
    fields: [
      { name: 'total_budget', type: 'number', required: true, prefillable: false },
      { name: 'guest_count', type: 'number', required: true, prefillable: false },
      { name: 'currency', type: 'string', required: true, prefillable: true, onboardingField: 'preferred_currency' },
    ],
    onboardingMapping: { currency: 'preferred_currency' },
    entityMapping: { total_budget: [EntityType.BUDGET] },
    defaults: { currency: 'USD' },
  },
  party_food_calculator: {
    uiType: 'party_food_calculator',
    name: 'Party Food Calculator',
    category: UI_CATEGORIES.EVENTS,
    fields: [
      { name: 'guest_count', type: 'number', required: true, prefillable: false },
      { name: 'event_duration', type: 'number', required: true, prefillable: false },
      { name: 'meal_type', type: 'enum', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  drink_calculator: {
    uiType: 'drink_calculator',
    name: 'Drink Calculator',
    category: UI_CATEGORIES.EVENTS,
    fields: [
      { name: 'guest_count', type: 'number', required: true, prefillable: false },
      { name: 'event_duration', type: 'number', required: true, prefillable: false },
      { name: 'drink_types', type: 'array', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  seating_chart_generator: {
    uiType: 'seating_chart_generator',
    name: 'Seating Chart Generator',
    category: UI_CATEGORIES.EVENTS,
    fields: [
      { name: 'guests', type: 'array', required: true, prefillable: false },
      { name: 'tables', type: 'number', required: true, prefillable: false },
      { name: 'seats_per_table', type: 'number', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  event_countdown: {
    uiType: 'event_countdown',
    name: 'Event Countdown',
    category: UI_CATEGORIES.EVENTS,
    fields: [
      { name: 'event_name', type: 'string', required: true, prefillable: false },
      { name: 'event_date', type: 'date', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  birthday_countdown: {
    uiType: 'birthday_countdown',
    name: 'Birthday Countdown',
    category: UI_CATEGORIES.EVENTS,
    fields: [
      { name: 'birth_date', type: 'date', required: true, prefillable: true, onboardingField: 'date_of_birth' },
    ],
    onboardingMapping: { birth_date: 'date_of_birth' },
    entityMapping: {},
    defaults: {},
  },

  // ----------------------------------------
  // REAL ESTATE
  // ----------------------------------------
  rent_vs_buy_calculator: {
    uiType: 'rent_vs_buy_calculator',
    name: 'Rent vs Buy Calculator',
    category: UI_CATEGORIES.REAL_ESTATE,
    fields: [
      { name: 'home_price', type: 'number', required: true, prefillable: false },
      { name: 'monthly_rent', type: 'number', required: true, prefillable: false },
      { name: 'down_payment', type: 'number', required: true, prefillable: false },
      { name: 'interest_rate', type: 'number', required: true, prefillable: false },
      { name: 'currency', type: 'string', required: true, prefillable: true, onboardingField: 'preferred_currency' },
    ],
    onboardingMapping: { currency: 'preferred_currency' },
    entityMapping: {},
    defaults: { currency: 'USD' },
  },
  affordability_calculator: {
    uiType: 'affordability_calculator',
    name: 'Home Affordability Calculator',
    category: UI_CATEGORIES.REAL_ESTATE,
    fields: [
      { name: 'annual_income', type: 'number', required: true, prefillable: false },
      { name: 'monthly_debts', type: 'number', required: true, prefillable: false },
      { name: 'down_payment', type: 'number', required: true, prefillable: false },
      { name: 'currency', type: 'string', required: true, prefillable: true, onboardingField: 'preferred_currency' },
    ],
    onboardingMapping: { currency: 'preferred_currency' },
    entityMapping: { annual_income: [EntityType.BUDGET] },
    defaults: { currency: 'USD' },
  },
  property_tax_calculator: {
    uiType: 'property_tax_calculator',
    name: 'Property Tax Calculator',
    category: UI_CATEGORIES.REAL_ESTATE,
    fields: [
      { name: 'property_value', type: 'number', required: true, prefillable: false },
      { name: 'tax_rate', type: 'number', required: true, prefillable: false },
      { name: 'currency', type: 'string', required: true, prefillable: true, onboardingField: 'preferred_currency' },
    ],
    onboardingMapping: { currency: 'preferred_currency' },
    entityMapping: {},
    defaults: { currency: 'USD' },
  },
  rental_yield_calculator: {
    uiType: 'rental_yield_calculator',
    name: 'Rental Yield Calculator',
    category: UI_CATEGORIES.REAL_ESTATE,
    fields: [
      { name: 'property_value', type: 'number', required: true, prefillable: false },
      { name: 'annual_rent', type: 'number', required: true, prefillable: false },
      { name: 'currency', type: 'string', required: true, prefillable: true, onboardingField: 'preferred_currency' },
    ],
    onboardingMapping: { currency: 'preferred_currency' },
    entityMapping: {},
    defaults: { currency: 'USD' },
  },
  square_footage_calculator: {
    uiType: 'square_footage_calculator',
    name: 'Square Footage Calculator',
    category: UI_CATEGORIES.REAL_ESTATE,
    fields: [
      { name: 'rooms', type: 'array', required: true, prefillable: false },
      { name: 'measurement_system', type: 'enum', required: false, prefillable: true, onboardingField: 'measurement_system' },
    ],
    onboardingMapping: { measurement_system: 'measurement_system' },
    entityMapping: {},
    defaults: { measurement_system: 'metric' },
  },

  // ----------------------------------------
  // MUSIC & AUDIO
  // ----------------------------------------
  bpm_calculator: {
    uiType: 'bpm_calculator',
    name: 'BPM Calculator',
    category: UI_CATEGORIES.MUSIC,
    fields: [
      { name: 'beats', type: 'number', required: true, prefillable: false },
      { name: 'seconds', type: 'number', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
    intentPatterns: ['calculate bpm', 'bpm calculator', 'beats per minute', 'song tempo', 'find bpm'],
    primaryAction: 'calculate',
  },
  metronome: {
    uiType: 'metronome',
    name: 'Metronome',
    category: UI_CATEGORIES.MUSIC,
    fields: [
      { name: 'bpm', type: 'number', required: true, prefillable: false },
      { name: 'time_signature', type: 'string', required: false, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: { bpm: 120, time_signature: '4/4' },
    intentPatterns: ['metronome', 'start metronome', 'beat keeper', 'tempo click', 'music timer'],
    primaryAction: 'start',
  },
  chord_progression_generator: {
    uiType: 'chord_progression_generator',
    name: 'Chord Progression Generator',
    category: UI_CATEGORIES.MUSIC,
    fields: [
      { name: 'key', type: 'enum', required: true, prefillable: false },
      { name: 'mode', type: 'enum', required: true, prefillable: false },
      { name: 'style', type: 'enum', required: false, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: { mode: 'major' },
  },
  guitar_tuner: {
    uiType: 'guitar_tuner',
    name: 'Guitar Tuner',
    category: UI_CATEGORIES.MUSIC,
    fields: [
      { name: 'tuning', type: 'enum', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: { tuning: 'standard' },
  },
  key_signature_finder: {
    uiType: 'key_signature_finder',
    name: 'Key Signature Finder',
    category: UI_CATEGORIES.MUSIC,
    fields: [
      { name: 'notes', type: 'array', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },

  // ----------------------------------------
  // DATE & TIME
  // ----------------------------------------
  age_calculator: {
    uiType: 'age_calculator',
    name: 'Age Calculator',
    category: UI_CATEGORIES.HOUSEHOLD,
    fields: [
      { name: 'birth_date', type: 'date', required: true, prefillable: true, onboardingField: 'date_of_birth' },
    ],
    onboardingMapping: { birth_date: 'date_of_birth' },
    entityMapping: {},
    defaults: {},
    intentPatterns: ['calculate age', 'how old am i', 'age calculator', 'what is my age', 'age from birthday'],
    primaryAction: 'calculate',
  },
  date_difference_calculator: {
    uiType: 'date_difference_calculator',
    name: 'Date Difference Calculator',
    category: UI_CATEGORIES.HOUSEHOLD,
    fields: [
      { name: 'start_date', type: 'date', required: true, prefillable: false },
      { name: 'end_date', type: 'date', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
    intentPatterns: ['days between dates', 'date difference', 'how many days', 'calculate date difference', 'days until'],
    primaryAction: 'calculate',
  },
  workday_calculator: {
    uiType: 'workday_calculator',
    name: 'Workday Calculator',
    category: UI_CATEGORIES.HOUSEHOLD,
    fields: [
      { name: 'start_date', type: 'date', required: true, prefillable: false },
      { name: 'days_to_add', type: 'number', required: true, prefillable: false },
      { name: 'exclude_weekends', type: 'boolean', required: false, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: { exclude_weekends: true },
  },
  stopwatch: {
    uiType: 'stopwatch',
    name: 'Stopwatch',
    category: UI_CATEGORIES.HOUSEHOLD,
    fields: [],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
    intentPatterns: ['start stopwatch', 'stopwatch', 'timer', 'start timer', 'time something'],
    primaryAction: 'start',
  },
  pomodoro_timer: {
    uiType: 'pomodoro_timer',
    name: 'Pomodoro Timer',
    category: UI_CATEGORIES.HOUSEHOLD,
    intentPatterns: ['pomodoro timer', 'focus timer', 'productivity timer', 'pomodoro technique', 'work timer'],
    primaryAction: 'start',
    fields: [
      { name: 'work_duration', type: 'number', required: false, prefillable: false },
      { name: 'break_duration', type: 'number', required: false, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: { work_duration: 25, break_duration: 5 },
  },
  world_clock: {
    uiType: 'world_clock',
    name: 'World Clock',
    category: UI_CATEGORIES.HOUSEHOLD,
    fields: [
      { name: 'timezones', type: 'array', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },

  // ----------------------------------------
  // GENERATORS & CONVERTERS
  // ----------------------------------------
  qr_code_generator: {
    uiType: 'qr_code_generator',
    name: 'QR Code Generator',
    category: UI_CATEGORIES.PROFESSIONAL,
    fields: [
      { name: 'content', type: 'string', required: true, prefillable: false },
      { name: 'size', type: 'number', required: false, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: { size: 256 },
    intentPatterns: ['generate qr', 'create qr code', 'make qr', 'qr code generator', 'qr for url', 'generate qr code'],
    primaryAction: 'generate',
  },
  barcode_generator: {
    uiType: 'barcode_generator',
    name: 'Barcode Generator',
    category: UI_CATEGORIES.PROFESSIONAL,
    fields: [
      { name: 'content', type: 'string', required: true, prefillable: false },
      { name: 'format', type: 'enum', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: { format: 'CODE128' },
    intentPatterns: ['generate barcode', 'create barcode', 'make barcode', 'barcode generator', 'upc code', 'ean code'],
    primaryAction: 'generate',
  },
  password_generator: {
    uiType: 'password_generator',
    name: 'Password Generator',
    category: UI_CATEGORIES.PROFESSIONAL,
    fields: [
      { name: 'length', type: 'number', required: true, prefillable: false },
      { name: 'include_uppercase', type: 'boolean', required: false, prefillable: false },
      { name: 'include_numbers', type: 'boolean', required: false, prefillable: false },
      { name: 'include_symbols', type: 'boolean', required: false, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: { length: 16, include_uppercase: true, include_numbers: true, include_symbols: true },
    intentPatterns: ['generate password', 'create password', 'random password', 'secure password', 'strong password', 'password generator'],
    primaryAction: 'generate',
  },
  uuid_generator: {
    uiType: 'uuid_generator',
    name: 'UUID Generator',
    category: UI_CATEGORIES.PROFESSIONAL,
    fields: [
      { name: 'version', type: 'enum', required: false, prefillable: false },
      { name: 'count', type: 'number', required: false, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: { version: 'v4', count: 1 },
    intentPatterns: ['generate uuid', 'create uuid', 'random uuid', 'guid generator', 'unique id'],
    primaryAction: 'generate',
  },
  lorem_ipsum_generator: {
    uiType: 'lorem_ipsum_generator',
    name: 'Lorem Ipsum Generator',
    category: UI_CATEGORIES.PROFESSIONAL,
    fields: [
      { name: 'paragraphs', type: 'number', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: { paragraphs: 3 },
    intentPatterns: ['generate lorem ipsum', 'placeholder text', 'dummy text', 'lorem ipsum generator', 'filler text'],
    primaryAction: 'generate',
  },
  color_picker: {
    uiType: 'color_picker',
    name: 'Color Picker',
    category: UI_CATEGORIES.PROFESSIONAL,
    fields: [
      { name: 'color', type: 'string', required: false, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
    intentPatterns: ['pick color', 'color picker', 'choose color', 'hex color', 'rgb color', 'color code'],
    primaryAction: 'pick',
  },
  gradient_generator: {
    uiType: 'gradient_generator',
    name: 'Gradient Generator',
    category: UI_CATEGORIES.PROFESSIONAL,
    fields: [
      { name: 'color1', type: 'string', required: true, prefillable: false },
      { name: 'color2', type: 'string', required: true, prefillable: false },
      { name: 'direction', type: 'enum', required: false, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: { direction: 'to-right' },
    intentPatterns: ['create gradient', 'gradient generator', 'color gradient', 'css gradient', 'make gradient'],
    primaryAction: 'generate',
  },
  hash_generator: {
    uiType: 'hash_generator',
    name: 'Hash Generator',
    category: UI_CATEGORIES.PROFESSIONAL,
    fields: [
      { name: 'input', type: 'string', required: true, prefillable: false },
      { name: 'algorithm', type: 'enum', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: { algorithm: 'SHA256' },
    intentPatterns: ['generate hash', 'md5 hash', 'sha256 hash', 'hash text', 'create hash', 'checksum'],
    primaryAction: 'generate',
  },
  base64_encoder: {
    uiType: 'base64_encoder',
    name: 'Base64 Encoder/Decoder',
    category: UI_CATEGORIES.PROFESSIONAL,
    fields: [
      { name: 'input', type: 'string', required: true, prefillable: false },
      { name: 'mode', type: 'enum', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: { mode: 'encode' },
    intentPatterns: ['encode base64', 'decode base64', 'base64 converter', 'convert to base64', 'base64 encoder'],
    primaryAction: 'encode',
  },
  url_encoder: {
    uiType: 'url_encoder',
    name: 'URL Encoder/Decoder',
    category: UI_CATEGORIES.PROFESSIONAL,
    fields: [
      { name: 'input', type: 'string', required: true, prefillable: false },
      { name: 'mode', type: 'enum', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: { mode: 'encode' },
    intentPatterns: ['encode url', 'decode url', 'url encoder', 'percent encode', 'uri encode'],
    primaryAction: 'encode',
  },
  json_formatter: {
    uiType: 'json_formatter',
    name: 'JSON Formatter',
    category: UI_CATEGORIES.PROFESSIONAL,
    fields: [
      { name: 'json', type: 'string', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
    intentPatterns: ['format json', 'beautify json', 'json formatter', 'pretty print json', 'validate json'],
    primaryAction: 'format',
  },
  markdown_preview: {
    uiType: 'markdown_preview',
    name: 'Markdown Preview',
    category: UI_CATEGORIES.PROFESSIONAL,
    fields: [
      { name: 'markdown', type: 'string', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
    intentPatterns: ['preview markdown', 'markdown editor', 'render markdown', 'markdown viewer'],
    primaryAction: 'preview',
  },
  word_counter: {
    uiType: 'word_counter',
    name: 'Word Counter',
    category: UI_CATEGORIES.PROFESSIONAL,
    fields: [
      { name: 'text', type: 'string', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
    intentPatterns: ['count words', 'word counter', 'character count', 'text length', 'how many words'],
    primaryAction: 'count',
  },
  case_converter: {
    uiType: 'case_converter',
    name: 'Case Converter',
    category: UI_CATEGORIES.PROFESSIONAL,
    fields: [
      { name: 'text', type: 'string', required: true, prefillable: false },
      { name: 'case_type', type: 'enum', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
    intentPatterns: ['convert case', 'uppercase', 'lowercase', 'title case', 'case converter', 'change case'],
    primaryAction: 'convert',
  },
  diff_checker: {
    uiType: 'diff_checker',
    name: 'Diff Checker',
    category: UI_CATEGORIES.PROFESSIONAL,
    fields: [
      { name: 'text1', type: 'string', required: true, prefillable: false },
      { name: 'text2', type: 'string', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
    intentPatterns: ['compare text', 'diff checker', 'find differences', 'text comparison', 'compare files'],
    primaryAction: 'compare',
  },
  regex_tester: {
    uiType: 'regex_tester',
    name: 'Regex Tester',
    category: UI_CATEGORIES.PROFESSIONAL,
    fields: [
      { name: 'pattern', type: 'string', required: true, prefillable: false },
      { name: 'test_string', type: 'string', required: true, prefillable: false },
      { name: 'flags', type: 'string', required: false, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: { flags: 'g' },
    intentPatterns: ['test regex', 'regex tester', 'regular expression', 'pattern match', 'regex validator'],
    primaryAction: 'test',
  },

  // ----------------------------------------
  // WEATHER & ENVIRONMENT
  // ----------------------------------------
  wind_chill_calculator: {
    uiType: 'wind_chill_calculator',
    name: 'Wind Chill Calculator',
    category: UI_CATEGORIES.WEATHER,
    fields: [
      { name: 'temperature', type: 'number', required: true, prefillable: false },
      { name: 'wind_speed', type: 'number', required: true, prefillable: false },
      { name: 'measurement_system', type: 'enum', required: false, prefillable: true, onboardingField: 'measurement_system' },
    ],
    onboardingMapping: { measurement_system: 'measurement_system' },
    entityMapping: {},
    defaults: { measurement_system: 'metric' },
  },
  heat_index_calculator: {
    uiType: 'heat_index_calculator',
    name: 'Heat Index Calculator',
    category: UI_CATEGORIES.WEATHER,
    fields: [
      { name: 'temperature', type: 'number', required: true, prefillable: false },
      { name: 'humidity', type: 'number', required: true, prefillable: false },
      { name: 'measurement_system', type: 'enum', required: false, prefillable: true, onboardingField: 'measurement_system' },
    ],
    onboardingMapping: { measurement_system: 'measurement_system' },
    entityMapping: {},
    defaults: { measurement_system: 'metric' },
  },
  dew_point_calculator: {
    uiType: 'dew_point_calculator',
    name: 'Dew Point Calculator',
    category: UI_CATEGORIES.WEATHER,
    fields: [
      { name: 'temperature', type: 'number', required: true, prefillable: false },
      { name: 'humidity', type: 'number', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  sunrise_sunset_calculator: {
    uiType: 'sunrise_sunset_calculator',
    name: 'Sunrise Sunset Calculator',
    category: UI_CATEGORIES.WEATHER,
    fields: [
      { name: 'location', type: 'string', required: true, prefillable: true, onboardingField: 'country' },
      { name: 'date', type: 'date', required: true, prefillable: false },
    ],
    onboardingMapping: { location: 'country' },
    entityMapping: { location: [EntityType.LOCATION] },
    defaults: {},
  },
  carbon_footprint_calculator: {
    uiType: 'carbon_footprint_calculator',
    name: 'Carbon Footprint Calculator',
    category: UI_CATEGORIES.WEATHER,
    fields: [
      { name: 'car_miles', type: 'number', required: false, prefillable: false },
      { name: 'flights_per_year', type: 'number', required: false, prefillable: false },
      { name: 'electricity_kwh', type: 'number', required: false, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },

  // ----------------------------------------
  // CRAFTS & DIY
  // ----------------------------------------
  yarn_calculator: {
    uiType: 'yarn_calculator',
    name: 'Yarn Calculator',
    category: UI_CATEGORIES.CRAFTS,
    fields: [
      { name: 'project_type', type: 'enum', required: true, prefillable: false },
      { name: 'size', type: 'enum', required: true, prefillable: false },
      { name: 'yarn_weight', type: 'enum', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  fabric_calculator: {
    uiType: 'fabric_calculator',
    name: 'Fabric Calculator',
    category: UI_CATEGORIES.CRAFTS,
    fields: [
      { name: 'project_type', type: 'enum', required: true, prefillable: false },
      { name: 'measurements', type: 'object', required: true, prefillable: false },
      { name: 'fabric_width', type: 'number', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  cross_stitch_calculator: {
    uiType: 'cross_stitch_calculator',
    name: 'Cross Stitch Calculator',
    category: UI_CATEGORIES.CRAFTS,
    fields: [
      { name: 'design_width', type: 'number', required: true, prefillable: false },
      { name: 'design_height', type: 'number', required: true, prefillable: false },
      { name: 'fabric_count', type: 'number', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  candle_wax_calculator: {
    uiType: 'candle_wax_calculator',
    name: 'Candle Wax Calculator',
    category: UI_CATEGORIES.CRAFTS,
    fields: [
      { name: 'container_volume', type: 'number', required: true, prefillable: false },
      { name: 'number_of_candles', type: 'number', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  resin_calculator: {
    uiType: 'resin_calculator',
    name: 'Resin Calculator',
    category: UI_CATEGORIES.CRAFTS,
    fields: [
      { name: 'length', type: 'number', required: true, prefillable: false },
      { name: 'width', type: 'number', required: true, prefillable: false },
      { name: 'depth', type: 'number', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },

  // ----------------------------------------
  // AI TOOLS
  // ----------------------------------------
  ai_email_composer: {
    uiType: 'ai_email_composer',
    name: 'AI Email Composer',
    category: UI_CATEGORIES.PROFESSIONAL,
    fields: [
      { name: 'recipient', type: 'string', required: true, prefillable: false },
      { name: 'subject', type: 'string', required: true, prefillable: false },
      { name: 'tone', type: 'enum', required: true, prefillable: true, onboardingField: 'tone_preference' },
      { name: 'key_points', type: 'string', required: true, prefillable: false },
    ],
    onboardingMapping: { tone: 'tone_preference' },
    entityMapping: { recipient: [EntityType.PERSON_NAME, EntityType.EMAIL], subject: [EntityType.SUBJECT] },
    defaults: { tone: 'professional' },
  },
  ai_blog_writer: {
    uiType: 'ai_blog_writer',
    name: 'AI Blog Writer',
    category: UI_CATEGORIES.PROFESSIONAL,
    fields: [
      { name: 'topic', type: 'string', required: true, prefillable: false },
      { name: 'tone', type: 'enum', required: true, prefillable: true, onboardingField: 'tone_preference' },
      { name: 'word_count', type: 'number', required: false, prefillable: false },
      { name: 'keywords', type: 'array', required: false, prefillable: false },
    ],
    onboardingMapping: { tone: 'tone_preference' },
    entityMapping: { topic: [EntityType.TOPIC] },
    defaults: { word_count: 800 },
  },
  ai_social_caption: {
    uiType: 'ai_social_caption',
    name: 'AI Social Caption Generator',
    category: UI_CATEGORIES.PROFESSIONAL,
    fields: [
      { name: 'platform', type: 'enum', required: true, prefillable: false },
      { name: 'content_type', type: 'string', required: true, prefillable: false },
      { name: 'tone', type: 'enum', required: true, prefillable: true, onboardingField: 'tone_preference' },
    ],
    onboardingMapping: { tone: 'tone_preference' },
    entityMapping: {},
    defaults: {},
  },
  ai_resume_builder: {
    uiType: 'ai_resume_builder',
    name: 'AI Resume Builder',
    category: UI_CATEGORIES.PROFESSIONAL,
    fields: [
      { name: 'job_title', type: 'string', required: true, prefillable: false },
      { name: 'experience_years', type: 'number', required: true, prefillable: false },
      { name: 'skills', type: 'array', required: true, prefillable: false },
      { name: 'industry', type: 'string', required: true, prefillable: true, onboardingField: 'industry' },
    ],
    onboardingMapping: { industry: 'industry' },
    entityMapping: { industry: [EntityType.INDUSTRY] },
    defaults: {},
  },
  ai_cover_letter: {
    uiType: 'ai_cover_letter',
    name: 'AI Cover Letter Generator',
    category: UI_CATEGORIES.PROFESSIONAL,
    fields: [
      { name: 'job_title', type: 'string', required: true, prefillable: false },
      { name: 'company_name', type: 'string', required: true, prefillable: true, onboardingField: 'company_name' },
      { name: 'key_qualifications', type: 'array', required: true, prefillable: false },
    ],
    onboardingMapping: { company_name: 'company_name' },
    entityMapping: { company_name: [EntityType.COMPANY_NAME] },
    defaults: {},
  },
  ai_meeting_notes: {
    uiType: 'ai_meeting_notes',
    name: 'AI Meeting Notes',
    category: UI_CATEGORIES.PROFESSIONAL,
    fields: [
      { name: 'meeting_topic', type: 'string', required: true, prefillable: false },
      { name: 'participants', type: 'array', required: false, prefillable: false },
      { name: 'transcript', type: 'string', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: { meeting_topic: [EntityType.TOPIC] },
    defaults: {},
  },
  ai_study_notes: {
    uiType: 'ai_study_notes',
    name: 'AI Study Notes Generator',
    category: UI_CATEGORIES.EDUCATION,
    fields: [
      { name: 'subject', type: 'string', required: true, prefillable: false },
      { name: 'topic', type: 'string', required: true, prefillable: false },
      { name: 'difficulty_level', type: 'enum', required: false, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: { subject: [EntityType.SUBJECT], topic: [EntityType.TOPIC] },
    defaults: { difficulty_level: 'intermediate' },
  },
  ai_speech_writer: {
    uiType: 'ai_speech_writer',
    name: 'AI Speech Writer',
    category: UI_CATEGORIES.PROFESSIONAL,
    fields: [
      { name: 'occasion', type: 'enum', required: true, prefillable: false },
      { name: 'duration_minutes', type: 'number', required: true, prefillable: false },
      { name: 'tone', type: 'enum', required: true, prefillable: true, onboardingField: 'tone_preference' },
      { name: 'key_messages', type: 'array', required: true, prefillable: false },
    ],
    onboardingMapping: { tone: 'tone_preference' },
    entityMapping: {},
    defaults: {},
  },
  ai_product_description: {
    uiType: 'ai_product_description',
    name: 'AI Product Description',
    category: UI_CATEGORIES.PROFESSIONAL,
    fields: [
      { name: 'product_name', type: 'string', required: true, prefillable: false },
      { name: 'features', type: 'array', required: true, prefillable: false },
      { name: 'target_audience', type: 'string', required: true, prefillable: false },
      { name: 'tone', type: 'enum', required: true, prefillable: true, onboardingField: 'tone_preference' },
    ],
    onboardingMapping: { tone: 'tone_preference' },
    entityMapping: { product_name: [EntityType.PRODUCT_NAME], target_audience: [EntityType.TARGET_AUDIENCE] },
    defaults: {},
  },
  ai_slogan_generator: {
    uiType: 'ai_slogan_generator',
    name: 'AI Slogan Generator',
    category: UI_CATEGORIES.PROFESSIONAL,
    fields: [
      { name: 'brand_name', type: 'string', required: true, prefillable: true, onboardingField: 'company_name' },
      { name: 'industry', type: 'string', required: true, prefillable: true, onboardingField: 'industry' },
      { name: 'brand_values', type: 'array', required: true, prefillable: false },
    ],
    onboardingMapping: { brand_name: 'company_name', industry: 'industry' },
    entityMapping: { brand_name: [EntityType.COMPANY_NAME], industry: [EntityType.INDUSTRY] },
    defaults: {},
  },
  ai_hashtag_generator: {
    uiType: 'ai_hashtag_generator',
    name: 'AI Hashtag Generator',
    category: UI_CATEGORIES.PROFESSIONAL,
    fields: [
      { name: 'topic', type: 'string', required: true, prefillable: false },
      { name: 'platform', type: 'enum', required: true, prefillable: false },
      { name: 'count', type: 'number', required: false, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: { topic: [EntityType.TOPIC] },
    defaults: { count: 10 },
  },
  ai_contract_analyzer: {
    uiType: 'ai_contract_analyzer',
    name: 'AI Contract Analyzer',
    category: UI_CATEGORIES.PROFESSIONAL,
    fields: [
      { name: 'contract_text', type: 'string', required: true, prefillable: false },
      { name: 'contract_type', type: 'enum', required: false, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  ai_translator: {
    uiType: 'ai_translator',
    name: 'AI Translator',
    category: UI_CATEGORIES.PROFESSIONAL,
    fields: [
      { name: 'text', type: 'string', required: true, prefillable: false },
      { name: 'source_language', type: 'string', required: false, prefillable: true, onboardingField: 'preferred_language' },
      { name: 'target_language', type: 'string', required: true, prefillable: false },
    ],
    onboardingMapping: { source_language: 'preferred_language' },
    entityMapping: { target_language: [EntityType.LANGUAGE] },
    defaults: {},
  },
  ai_summarizer: {
    uiType: 'ai_summarizer',
    name: 'AI Text Summarizer',
    category: UI_CATEGORIES.PROFESSIONAL,
    fields: [
      { name: 'text', type: 'string', required: true, prefillable: false },
      { name: 'length', type: 'enum', required: true, prefillable: true, onboardingField: 'output_length' },
    ],
    onboardingMapping: { length: 'output_length' },
    entityMapping: {},
    defaults: { length: 'balanced' },
  },
  ai_paraphraser: {
    uiType: 'ai_paraphraser',
    name: 'AI Paraphraser',
    category: UI_CATEGORIES.PROFESSIONAL,
    fields: [
      { name: 'text', type: 'string', required: true, prefillable: false },
      { name: 'style', type: 'enum', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: { style: 'standard' },
  },
  ai_grammar_checker: {
    uiType: 'ai_grammar_checker',
    name: 'AI Grammar Checker',
    category: UI_CATEGORIES.PROFESSIONAL,
    fields: [
      { name: 'text', type: 'string', required: true, prefillable: false },
      { name: 'language', type: 'string', required: false, prefillable: true, onboardingField: 'preferred_language' },
    ],
    onboardingMapping: { language: 'preferred_language' },
    entityMapping: {},
    defaults: {},
  },
  ai_story_generator: {
    uiType: 'ai_story_generator',
    name: 'AI Story Generator',
    category: UI_CATEGORIES.ENTERTAINMENT,
    fields: [
      { name: 'genre', type: 'enum', required: true, prefillable: false },
      { name: 'setting', type: 'string', required: false, prefillable: false },
      { name: 'characters', type: 'array', required: false, prefillable: false },
      { name: 'length', type: 'enum', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: { length: 'short' },
  },
  ai_poem_generator: {
    uiType: 'ai_poem_generator',
    name: 'AI Poem Generator',
    category: UI_CATEGORIES.ENTERTAINMENT,
    fields: [
      { name: 'theme', type: 'string', required: true, prefillable: false },
      { name: 'style', type: 'enum', required: true, prefillable: false },
      { name: 'length', type: 'enum', required: false, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: { theme: [EntityType.TOPIC] },
    defaults: { style: 'free_verse' },
  },
  ai_joke_generator: {
    uiType: 'ai_joke_generator',
    name: 'AI Joke Generator',
    category: UI_CATEGORIES.ENTERTAINMENT,
    fields: [
      { name: 'topic', type: 'string', required: false, prefillable: false },
      { name: 'style', type: 'enum', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: { style: 'pun' },
  },
  ai_name_generator: {
    uiType: 'ai_name_generator',
    name: 'AI Name Generator',
    category: UI_CATEGORIES.ENTERTAINMENT,
    fields: [
      { name: 'type', type: 'enum', required: true, prefillable: false },
      { name: 'style', type: 'enum', required: false, prefillable: false },
      { name: 'count', type: 'number', required: false, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: { count: 10 },
  },
  ai_business_name_generator: {
    uiType: 'ai_business_name_generator',
    name: 'AI Business Name Generator',
    category: UI_CATEGORIES.FINANCE,
    fields: [
      { name: 'industry', type: 'string', required: true, prefillable: true, onboardingField: 'industry' },
      { name: 'keywords', type: 'array', required: true, prefillable: false },
      { name: 'style', type: 'enum', required: false, prefillable: false },
    ],
    onboardingMapping: { industry: 'industry' },
    entityMapping: { industry: [EntityType.INDUSTRY] },
    defaults: {},
  },

  // ----------------------------------------
  // TEMPERATURE & UNIT CONVERTERS
  // ----------------------------------------
  temperature_converter: {
    uiType: 'temperature_converter',
    name: 'Temperature Converter',
    category: UI_CATEGORIES.HOUSEHOLD,
    fields: [
      { name: 'value', type: 'number', required: true, prefillable: false },
      { name: 'from_unit', type: 'enum', required: true, prefillable: false },
      { name: 'to_unit', type: 'enum', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
    intentPatterns: ['convert temperature', 'celsius to fahrenheit', 'fahrenheit to celsius', 'temperature converter'],
    primaryAction: 'convert',
  },
  length_converter: {
    uiType: 'length_converter',
    name: 'Length Converter',
    category: UI_CATEGORIES.HOUSEHOLD,
    fields: [
      { name: 'value', type: 'number', required: true, prefillable: false },
      { name: 'from_unit', type: 'enum', required: true, prefillable: false },
      { name: 'to_unit', type: 'enum', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
    intentPatterns: ['convert length', 'meters to feet', 'feet to meters', 'inches to cm', 'length converter'],
    primaryAction: 'convert',
  },
  weight_converter: {
    uiType: 'weight_converter',
    name: 'Weight Converter',
    category: UI_CATEGORIES.HOUSEHOLD,
    fields: [
      { name: 'value', type: 'number', required: true, prefillable: false },
      { name: 'from_unit', type: 'enum', required: true, prefillable: false },
      { name: 'to_unit', type: 'enum', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
    intentPatterns: ['convert weight', 'kg to pounds', 'pounds to kg', 'weight converter', 'lbs to kg'],
    primaryAction: 'convert',
  },
  volume_converter: {
    uiType: 'volume_converter',
    name: 'Volume Converter',
    category: UI_CATEGORIES.HOUSEHOLD,
    intentPatterns: ['convert volume', 'liters to gallons', 'gallons to liters', 'volume converter', 'ml to oz'],
    primaryAction: 'convert',
    fields: [
      { name: 'value', type: 'number', required: true, prefillable: false },
      { name: 'from_unit', type: 'enum', required: true, prefillable: false },
      { name: 'to_unit', type: 'enum', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  area_converter: {
    uiType: 'area_converter',
    name: 'Area Converter',
    category: UI_CATEGORIES.HOUSEHOLD,
    fields: [
      { name: 'value', type: 'number', required: true, prefillable: false },
      { name: 'from_unit', type: 'enum', required: true, prefillable: false },
      { name: 'to_unit', type: 'enum', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  speed_converter: {
    uiType: 'speed_converter',
    name: 'Speed Converter',
    category: UI_CATEGORIES.HOUSEHOLD,
    fields: [
      { name: 'value', type: 'number', required: true, prefillable: false },
      { name: 'from_unit', type: 'enum', required: true, prefillable: false },
      { name: 'to_unit', type: 'enum', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  pressure_converter: {
    uiType: 'pressure_converter',
    name: 'Pressure Converter',
    category: UI_CATEGORIES.HOUSEHOLD,
    fields: [
      { name: 'value', type: 'number', required: true, prefillable: false },
      { name: 'from_unit', type: 'enum', required: true, prefillable: false },
      { name: 'to_unit', type: 'enum', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  energy_converter: {
    uiType: 'energy_converter',
    name: 'Energy Converter',
    category: UI_CATEGORIES.HOUSEHOLD,
    fields: [
      { name: 'value', type: 'number', required: true, prefillable: false },
      { name: 'from_unit', type: 'enum', required: true, prefillable: false },
      { name: 'to_unit', type: 'enum', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  power_converter: {
    uiType: 'power_converter',
    name: 'Power Converter',
    category: UI_CATEGORIES.HOUSEHOLD,
    fields: [
      { name: 'value', type: 'number', required: true, prefillable: false },
      { name: 'from_unit', type: 'enum', required: true, prefillable: false },
      { name: 'to_unit', type: 'enum', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  data_storage_converter: {
    uiType: 'data_storage_converter',
    name: 'Data Storage Converter',
    category: UI_CATEGORIES.PROFESSIONAL,
    fields: [
      { name: 'value', type: 'number', required: true, prefillable: false },
      { name: 'from_unit', type: 'enum', required: true, prefillable: false },
      { name: 'to_unit', type: 'enum', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  angle_converter: {
    uiType: 'angle_converter',
    name: 'Angle Converter',
    category: UI_CATEGORIES.HOUSEHOLD,
    fields: [
      { name: 'value', type: 'number', required: true, prefillable: false },
      { name: 'from_unit', type: 'enum', required: true, prefillable: false },
      { name: 'to_unit', type: 'enum', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  time_unit_converter: {
    uiType: 'time_unit_converter',
    intentPatterns: ['convert time', 'time converter', 'hours to minutes', 'days to hours', 'time unit'],
    primaryAction: 'convert',
    name: 'Time Unit Converter',
    category: UI_CATEGORIES.HOUSEHOLD,
    fields: [
      { name: 'value', type: 'number', required: true, prefillable: false },
      { name: 'from_unit', type: 'enum', required: true, prefillable: false },
      { name: 'to_unit', type: 'enum', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  fuel_economy_converter: {
    uiType: 'fuel_economy_converter',
    name: 'Fuel Economy Converter',
    category: UI_CATEGORIES.AUTOMOTIVE,
    fields: [
      { name: 'value', type: 'number', required: true, prefillable: false },
      { name: 'from_unit', type: 'enum', required: true, prefillable: false },
      { name: 'to_unit', type: 'enum', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },

  // ----------------------------------------
  // MATH & SCIENCE CALCULATORS
  // ----------------------------------------
  scientific_calculator: {
    uiType: 'scientific_calculator',
    name: 'Scientific Calculator',
    category: UI_CATEGORIES.EDUCATION,
    fields: [
      { name: 'expression', type: 'string', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  matrix_calculator: {
    uiType: 'matrix_calculator',
    name: 'Matrix Calculator',
    category: UI_CATEGORIES.EDUCATION,
    fields: [
      { name: 'matrix_a', type: 'array', required: true, prefillable: false },
      { name: 'matrix_b', type: 'array', required: false, prefillable: false },
      { name: 'operation', type: 'enum', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  quadratic_solver: {
    uiType: 'quadratic_solver',
    name: 'Quadratic Equation Solver',
    category: UI_CATEGORIES.EDUCATION,
    fields: [
      { name: 'a', type: 'number', required: true, prefillable: false },
      { name: 'b', type: 'number', required: true, prefillable: false },
      { name: 'c', type: 'number', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  logarithm_calculator: {
    uiType: 'logarithm_calculator',
    name: 'Logarithm Calculator',
    category: UI_CATEGORIES.EDUCATION,
    fields: [
      { name: 'value', type: 'number', required: true, prefillable: false },
      { name: 'base', type: 'number', required: false, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: { base: 10 },
  },
  prime_factorization: {
    uiType: 'prime_factorization',
    name: 'Prime Factorization',
    category: UI_CATEGORIES.EDUCATION,
    fields: [
      { name: 'number', type: 'number', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  gcd_lcm_calculator: {
    uiType: 'gcd_lcm_calculator',
    name: 'GCD/LCM Calculator',
    category: UI_CATEGORIES.EDUCATION,
    fields: [
      { name: 'numbers', type: 'array', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  pythagorean_calculator: {
    uiType: 'pythagorean_calculator',
    name: 'Pythagorean Theorem Calculator',
    category: UI_CATEGORIES.EDUCATION,
    fields: [
      { name: 'side_a', type: 'number', required: false, prefillable: false },
      { name: 'side_b', type: 'number', required: false, prefillable: false },
      { name: 'hypotenuse', type: 'number', required: false, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  circle_calculator: {
    uiType: 'circle_calculator',
    name: 'Circle Calculator',
    category: UI_CATEGORIES.EDUCATION,
    fields: [
      { name: 'radius', type: 'number', required: false, prefillable: false },
      { name: 'diameter', type: 'number', required: false, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  triangle_calculator: {
    uiType: 'triangle_calculator',
    name: 'Triangle Calculator',
    category: UI_CATEGORIES.EDUCATION,
    fields: [
      { name: 'base', type: 'number', required: true, prefillable: false },
      { name: 'height', type: 'number', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  sphere_calculator: {
    uiType: 'sphere_calculator',
    name: 'Sphere Calculator',
    category: UI_CATEGORIES.EDUCATION,
    fields: [
      { name: 'radius', type: 'number', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  cylinder_calculator: {
    uiType: 'cylinder_calculator',
    name: 'Cylinder Calculator',
    category: UI_CATEGORIES.EDUCATION,
    fields: [
      { name: 'radius', type: 'number', required: true, prefillable: false },
      { name: 'height', type: 'number', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  cone_calculator: {
    uiType: 'cone_calculator',
    name: 'Cone Calculator',
    category: UI_CATEGORIES.EDUCATION,
    fields: [
      { name: 'radius', type: 'number', required: true, prefillable: false },
      { name: 'height', type: 'number', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  standard_deviation_calculator: {
    uiType: 'standard_deviation_calculator',
    name: 'Standard Deviation Calculator',
    category: UI_CATEGORIES.EDUCATION,
    fields: [
      { name: 'values', type: 'array', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  probability_calculator: {
    uiType: 'probability_calculator',
    name: 'Probability Calculator',
    category: UI_CATEGORIES.EDUCATION,
    fields: [
      { name: 'favorable_outcomes', type: 'number', required: true, prefillable: false },
      { name: 'total_outcomes', type: 'number', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  permutation_calculator: {
    uiType: 'permutation_calculator',
    name: 'Permutation Calculator',
    category: UI_CATEGORIES.EDUCATION,
    fields: [
      { name: 'n', type: 'number', required: true, prefillable: false },
      { name: 'r', type: 'number', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  combination_calculator: {
    uiType: 'combination_calculator',
    name: 'Combination Calculator',
    category: UI_CATEGORIES.EDUCATION,
    fields: [
      { name: 'n', type: 'number', required: true, prefillable: false },
      { name: 'r', type: 'number', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  factorial_calculator: {
    uiType: 'factorial_calculator',
    name: 'Factorial Calculator',
    category: UI_CATEGORIES.EDUCATION,
    fields: [
      { name: 'number', type: 'number', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },

  // ----------------------------------------
  // ADDITIONAL HEALTH CALCULATORS
  // ----------------------------------------
  blood_pressure_tracker: {
    uiType: 'blood_pressure_tracker',
    name: 'Blood Pressure Tracker',
    category: UI_CATEGORIES.HEALTH,
    fields: [
      { name: 'systolic', type: 'number', required: true, prefillable: false },
      { name: 'diastolic', type: 'number', required: true, prefillable: false },
      { name: 'pulse', type: 'number', required: false, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  blood_sugar_tracker: {
    uiType: 'blood_sugar_tracker',
    name: 'Blood Sugar Tracker',
    category: UI_CATEGORIES.HEALTH,
    fields: [
      { name: 'reading', type: 'number', required: true, prefillable: false },
      { name: 'reading_type', type: 'enum', required: true, prefillable: false },
      { name: 'unit', type: 'enum', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: { unit: 'mg/dL' },
  },
  vitamin_calculator: {
    uiType: 'vitamin_calculator',
    name: 'Vitamin Calculator',
    category: UI_CATEGORIES.HEALTH,
    fields: [
      { name: 'age', type: 'number', required: true, prefillable: false },
      { name: 'gender', type: 'enum', required: true, prefillable: true, onboardingField: 'gender' },
      { name: 'pregnancy_status', type: 'enum', required: false, prefillable: false },
    ],
    onboardingMapping: { gender: 'gender' },
    entityMapping: {},
    defaults: {},
  },
  fiber_calculator: {
    uiType: 'fiber_calculator',
    name: 'Fiber Intake Calculator',
    category: UI_CATEGORIES.HEALTH,
    fields: [
      { name: 'age', type: 'number', required: true, prefillable: false },
      { name: 'gender', type: 'enum', required: true, prefillable: true, onboardingField: 'gender' },
    ],
    onboardingMapping: { gender: 'gender' },
    entityMapping: {},
    defaults: {},
  },
  sodium_calculator: {
    uiType: 'sodium_calculator',
    name: 'Sodium Intake Calculator',
    category: UI_CATEGORIES.HEALTH,
    fields: [
      { name: 'age', type: 'number', required: true, prefillable: false },
      { name: 'health_conditions', type: 'array', required: false, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  sugar_calculator: {
    uiType: 'sugar_calculator',
    name: 'Sugar Intake Calculator',
    category: UI_CATEGORIES.HEALTH,
    fields: [
      { name: 'age', type: 'number', required: true, prefillable: false },
      { name: 'gender', type: 'enum', required: true, prefillable: true, onboardingField: 'gender' },
    ],
    onboardingMapping: { gender: 'gender' },
    entityMapping: {},
    defaults: {},
  },
  fat_calculator: {
    uiType: 'fat_calculator',
    name: 'Fat Intake Calculator',
    category: UI_CATEGORIES.HEALTH,
    fields: [
      { name: 'daily_calories', type: 'number', required: true, prefillable: false },
      { name: 'goal', type: 'enum', required: true, prefillable: true, onboardingField: 'fitness_goal' },
    ],
    onboardingMapping: { goal: 'fitness_goal' },
    entityMapping: {},
    defaults: {},
  },
  carb_calculator: {
    uiType: 'carb_calculator',
    name: 'Carb Intake Calculator',
    category: UI_CATEGORIES.HEALTH,
    fields: [
      { name: 'daily_calories', type: 'number', required: true, prefillable: false },
      { name: 'goal', type: 'enum', required: true, prefillable: true, onboardingField: 'fitness_goal' },
      { name: 'diet_type', type: 'enum', required: false, prefillable: false },
    ],
    onboardingMapping: { goal: 'fitness_goal' },
    entityMapping: {},
    defaults: {},
  },
  walking_calorie_calculator: {
    uiType: 'walking_calorie_calculator',
    name: 'Walking Calorie Calculator',
    category: UI_CATEGORIES.HEALTH,
    fields: [
      { name: 'weight', type: 'number', required: true, prefillable: true, onboardingField: 'weight_kg' },
      { name: 'distance', type: 'number', required: true, prefillable: false },
      { name: 'time', type: 'number', required: false, prefillable: false },
    ],
    onboardingMapping: { weight: 'weight_kg' },
    entityMapping: {},
    defaults: {},
  },
  steps_to_distance: {
    uiType: 'steps_to_distance',
    name: 'Steps to Distance Calculator',
    category: UI_CATEGORIES.HEALTH,
    fields: [
      { name: 'steps', type: 'number', required: true, prefillable: false },
      { name: 'stride_length', type: 'number', required: false, prefillable: false },
      { name: 'height', type: 'number', required: false, prefillable: true, onboardingField: 'height_cm' },
    ],
    onboardingMapping: { height: 'height_cm' },
    entityMapping: {},
    defaults: {},
  },
  bac_calculator: {
    uiType: 'bac_calculator',
    name: 'Blood Alcohol Calculator',
    category: UI_CATEGORIES.HEALTH,
    fields: [
      { name: 'weight', type: 'number', required: true, prefillable: true, onboardingField: 'weight_kg' },
      { name: 'gender', type: 'enum', required: true, prefillable: true, onboardingField: 'gender' },
      { name: 'drinks', type: 'number', required: true, prefillable: false },
      { name: 'hours', type: 'number', required: true, prefillable: false },
    ],
    onboardingMapping: { weight: 'weight_kg', gender: 'gender' },
    entityMapping: {},
    defaults: {},
  },
  smoking_cost_calculator: {
    uiType: 'smoking_cost_calculator',
    name: 'Smoking Cost Calculator',
    category: UI_CATEGORIES.HEALTH,
    fields: [
      { name: 'cigarettes_per_day', type: 'number', required: true, prefillable: false },
      { name: 'pack_price', type: 'number', required: true, prefillable: false },
      { name: 'currency', type: 'string', required: true, prefillable: true, onboardingField: 'preferred_currency' },
    ],
    onboardingMapping: { currency: 'preferred_currency' },
    entityMapping: {},
    defaults: { currency: 'USD' },
  },
  target_heart_rate: {
    uiType: 'target_heart_rate',
    name: 'Target Heart Rate Calculator',
    category: UI_CATEGORIES.HEALTH,
    fields: [
      { name: 'age', type: 'number', required: true, prefillable: false },
      { name: 'resting_heart_rate', type: 'number', required: false, prefillable: false },
      { name: 'fitness_level', type: 'enum', required: false, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  army_body_fat_calculator: {
    uiType: 'army_body_fat_calculator',
    name: 'Army Body Fat Calculator',
    category: UI_CATEGORIES.HEALTH,
    fields: [
      { name: 'gender', type: 'enum', required: true, prefillable: true, onboardingField: 'gender' },
      { name: 'height', type: 'number', required: true, prefillable: true, onboardingField: 'height_cm' },
      { name: 'waist', type: 'number', required: true, prefillable: false },
      { name: 'neck', type: 'number', required: true, prefillable: false },
      { name: 'hip', type: 'number', required: false, prefillable: false },
    ],
    onboardingMapping: { gender: 'gender', height: 'height_cm' },
    entityMapping: {},
    defaults: {},
  },

  // ----------------------------------------
  // ADDITIONAL FINANCE CALCULATORS
  // ----------------------------------------
  amortization_calculator: {
    uiType: 'amortization_calculator',
    name: 'Amortization Calculator',
    category: UI_CATEGORIES.FINANCE,
    fields: [
      { name: 'loan_amount', type: 'number', required: true, prefillable: false },
      { name: 'interest_rate', type: 'number', required: true, prefillable: false },
      { name: 'loan_term', type: 'number', required: true, prefillable: false },
      { name: 'currency', type: 'string', required: true, prefillable: true, onboardingField: 'preferred_currency' },
    ],
    onboardingMapping: { currency: 'preferred_currency' },
    entityMapping: {},
    defaults: { currency: 'USD' },
  },
  debt_payoff_calculator: {
    uiType: 'debt_payoff_calculator',
    name: 'Debt Payoff Calculator',
    category: UI_CATEGORIES.FINANCE,
    fields: [
      { name: 'balance', type: 'number', required: true, prefillable: false },
      { name: 'interest_rate', type: 'number', required: true, prefillable: false },
      { name: 'monthly_payment', type: 'number', required: true, prefillable: false },
      { name: 'currency', type: 'string', required: true, prefillable: true, onboardingField: 'preferred_currency' },
    ],
    onboardingMapping: { currency: 'preferred_currency' },
    entityMapping: {},
    defaults: { currency: 'USD' },
  },
  debt_consolidation_calculator: {
    uiType: 'debt_consolidation_calculator',
    name: 'Debt Consolidation Calculator',
    category: UI_CATEGORIES.FINANCE,
    fields: [
      { name: 'debts', type: 'array', required: true, prefillable: false },
      { name: 'new_interest_rate', type: 'number', required: true, prefillable: false },
      { name: 'currency', type: 'string', required: true, prefillable: true, onboardingField: 'preferred_currency' },
    ],
    onboardingMapping: { currency: 'preferred_currency' },
    entityMapping: {},
    defaults: { currency: 'USD' },
  },
  emergency_fund_calculator: {
    uiType: 'emergency_fund_calculator',
    name: 'Emergency Fund Calculator',
    category: UI_CATEGORIES.FINANCE,
    fields: [
      { name: 'monthly_expenses', type: 'number', required: true, prefillable: false },
      { name: 'months_coverage', type: 'number', required: true, prefillable: false },
      { name: 'currency', type: 'string', required: true, prefillable: true, onboardingField: 'preferred_currency' },
    ],
    onboardingMapping: { currency: 'preferred_currency' },
    entityMapping: {},
    defaults: { currency: 'USD', months_coverage: 6 },
  },
  college_savings_calculator: {
    uiType: 'college_savings_calculator',
    name: 'College Savings Calculator',
    category: UI_CATEGORIES.FINANCE,
    fields: [
      { name: 'child_age', type: 'number', required: true, prefillable: false },
      { name: 'current_savings', type: 'number', required: false, prefillable: false },
      { name: 'monthly_contribution', type: 'number', required: true, prefillable: false },
      { name: 'currency', type: 'string', required: true, prefillable: true, onboardingField: 'preferred_currency' },
    ],
    onboardingMapping: { currency: 'preferred_currency' },
    entityMapping: {},
    defaults: { currency: 'USD', current_savings: 0 },
  },
  hourly_to_salary: {
    uiType: 'hourly_to_salary',
    name: 'Hourly to Salary Calculator',
    category: UI_CATEGORIES.FINANCE,
    fields: [
      { name: 'hourly_rate', type: 'number', required: true, prefillable: false },
      { name: 'hours_per_week', type: 'number', required: true, prefillable: false },
      { name: 'currency', type: 'string', required: true, prefillable: true, onboardingField: 'preferred_currency' },
    ],
    onboardingMapping: { currency: 'preferred_currency' },
    entityMapping: {},
    defaults: { currency: 'USD', hours_per_week: 40 },
  },
  paycheck_calculator: {
    uiType: 'paycheck_calculator',
    name: 'Paycheck Calculator',
    category: UI_CATEGORIES.FINANCE,
    fields: [
      { name: 'gross_pay', type: 'number', required: true, prefillable: false },
      { name: 'pay_frequency', type: 'enum', required: true, prefillable: false },
      { name: 'filing_status', type: 'enum', required: true, prefillable: false },
      { name: 'country', type: 'string', required: true, prefillable: true, onboardingField: 'country' },
      { name: 'currency', type: 'string', required: true, prefillable: true, onboardingField: 'preferred_currency' },
    ],
    onboardingMapping: { country: 'country', currency: 'preferred_currency' },
    entityMapping: {},
    defaults: { currency: 'USD' },
  },
  self_employment_tax: {
    uiType: 'self_employment_tax',
    name: 'Self Employment Tax Calculator',
    category: UI_CATEGORIES.FINANCE,
    fields: [
      { name: 'net_income', type: 'number', required: true, prefillable: false },
      { name: 'country', type: 'string', required: true, prefillable: true, onboardingField: 'country' },
      { name: 'currency', type: 'string', required: true, prefillable: true, onboardingField: 'preferred_currency' },
    ],
    onboardingMapping: { country: 'country', currency: 'preferred_currency' },
    entityMapping: {},
    defaults: { currency: 'USD' },
  },
  capital_gains_calculator: {
    uiType: 'capital_gains_calculator',
    name: 'Capital Gains Tax Calculator',
    category: UI_CATEGORIES.FINANCE,
    fields: [
      { name: 'purchase_price', type: 'number', required: true, prefillable: false },
      { name: 'sale_price', type: 'number', required: true, prefillable: false },
      { name: 'holding_period', type: 'enum', required: true, prefillable: false },
      { name: 'currency', type: 'string', required: true, prefillable: true, onboardingField: 'preferred_currency' },
    ],
    onboardingMapping: { currency: 'preferred_currency' },
    entityMapping: {},
    defaults: { currency: 'USD' },
  },
  stock_average_calculator: {
    uiType: 'stock_average_calculator',
    name: 'Stock Average Calculator',
    category: UI_CATEGORIES.FINANCE,
    fields: [
      { name: 'purchases', type: 'array', required: true, prefillable: false },
      { name: 'currency', type: 'string', required: true, prefillable: true, onboardingField: 'preferred_currency' },
    ],
    onboardingMapping: { currency: 'preferred_currency' },
    entityMapping: {},
    defaults: { currency: 'USD' },
  },
  dividend_calculator: {
    uiType: 'dividend_calculator',
    name: 'Dividend Calculator',
    category: UI_CATEGORIES.FINANCE,
    fields: [
      { name: 'shares', type: 'number', required: true, prefillable: false },
      { name: 'dividend_per_share', type: 'number', required: true, prefillable: false },
      { name: 'frequency', type: 'enum', required: true, prefillable: false },
      { name: 'currency', type: 'string', required: true, prefillable: true, onboardingField: 'preferred_currency' },
    ],
    onboardingMapping: { currency: 'preferred_currency' },
    entityMapping: {},
    defaults: { currency: 'USD' },
  },
  bond_yield_calculator: {
    uiType: 'bond_yield_calculator',
    name: 'Bond Yield Calculator',
    category: UI_CATEGORIES.FINANCE,
    fields: [
      { name: 'face_value', type: 'number', required: true, prefillable: false },
      { name: 'coupon_rate', type: 'number', required: true, prefillable: false },
      { name: 'current_price', type: 'number', required: true, prefillable: false },
      { name: 'years_to_maturity', type: 'number', required: true, prefillable: false },
      { name: 'currency', type: 'string', required: true, prefillable: true, onboardingField: 'preferred_currency' },
    ],
    onboardingMapping: { currency: 'preferred_currency' },
    entityMapping: {},
    defaults: { currency: 'USD' },
  },
  inflation_calculator: {
    uiType: 'inflation_calculator',
    name: 'Inflation Calculator',
    category: UI_CATEGORIES.FINANCE,
    fields: [
      { name: 'amount', type: 'number', required: true, prefillable: false },
      { name: 'years', type: 'number', required: true, prefillable: false },
      { name: 'inflation_rate', type: 'number', required: true, prefillable: false },
      { name: 'currency', type: 'string', required: true, prefillable: true, onboardingField: 'preferred_currency' },
    ],
    onboardingMapping: { currency: 'preferred_currency' },
    entityMapping: {},
    defaults: { currency: 'USD', inflation_rate: 3 },
  },
  present_value_calculator: {
    uiType: 'present_value_calculator',
    name: 'Present Value Calculator',
    category: UI_CATEGORIES.FINANCE,
    fields: [
      { name: 'future_value', type: 'number', required: true, prefillable: false },
      { name: 'interest_rate', type: 'number', required: true, prefillable: false },
      { name: 'periods', type: 'number', required: true, prefillable: false },
      { name: 'currency', type: 'string', required: true, prefillable: true, onboardingField: 'preferred_currency' },
    ],
    onboardingMapping: { currency: 'preferred_currency' },
    entityMapping: {},
    defaults: { currency: 'USD' },
  },
  future_value_calculator: {
    uiType: 'future_value_calculator',
    name: 'Future Value Calculator',
    category: UI_CATEGORIES.FINANCE,
    fields: [
      { name: 'present_value', type: 'number', required: true, prefillable: false },
      { name: 'interest_rate', type: 'number', required: true, prefillable: false },
      { name: 'periods', type: 'number', required: true, prefillable: false },
      { name: 'currency', type: 'string', required: true, prefillable: true, onboardingField: 'preferred_currency' },
    ],
    onboardingMapping: { currency: 'preferred_currency' },
    entityMapping: {},
    defaults: { currency: 'USD' },
  },
  cagr_calculator: {
    uiType: 'cagr_calculator',
    name: 'CAGR Calculator',
    category: UI_CATEGORIES.FINANCE,
    fields: [
      { name: 'beginning_value', type: 'number', required: true, prefillable: false },
      { name: 'ending_value', type: 'number', required: true, prefillable: false },
      { name: 'years', type: 'number', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  rule_of_72: {
    uiType: 'rule_of_72',
    name: 'Rule of 72 Calculator',
    category: UI_CATEGORIES.FINANCE,
    fields: [
      { name: 'interest_rate', type: 'number', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  fire_calculator: {
    uiType: 'fire_calculator',
    name: 'FIRE Calculator',
    category: UI_CATEGORIES.FINANCE,
    fields: [
      { name: 'annual_expenses', type: 'number', required: true, prefillable: false },
      { name: 'current_savings', type: 'number', required: true, prefillable: false },
      { name: 'annual_savings', type: 'number', required: true, prefillable: false },
      { name: 'expected_return', type: 'number', required: true, prefillable: false },
      { name: 'currency', type: 'string', required: true, prefillable: true, onboardingField: 'preferred_currency' },
    ],
    onboardingMapping: { currency: 'preferred_currency' },
    entityMapping: {},
    defaults: { currency: 'USD', expected_return: 7 },
  },
  coast_fire_calculator: {
    uiType: 'coast_fire_calculator',
    name: 'Coast FIRE Calculator',
    category: UI_CATEGORIES.FINANCE,
    fields: [
      { name: 'current_age', type: 'number', required: true, prefillable: false },
      { name: 'retirement_age', type: 'number', required: true, prefillable: false },
      { name: 'current_savings', type: 'number', required: true, prefillable: false },
      { name: 'expected_return', type: 'number', required: true, prefillable: false },
      { name: 'currency', type: 'string', required: true, prefillable: true, onboardingField: 'preferred_currency' },
    ],
    onboardingMapping: { currency: 'preferred_currency' },
    entityMapping: {},
    defaults: { currency: 'USD', retirement_age: 65, expected_return: 7 },
  },

  // ----------------------------------------
  // ADDITIONAL HOME & DIY
  // ----------------------------------------
  brick_calculator: {
    uiType: 'brick_calculator',
    name: 'Brick Calculator',
    category: UI_CATEGORIES.HOME,
    fields: [
      { name: 'wall_length', type: 'number', required: true, prefillable: false },
      { name: 'wall_height', type: 'number', required: true, prefillable: false },
      { name: 'brick_size', type: 'enum', required: true, prefillable: false },
      { name: 'measurement_system', type: 'enum', required: false, prefillable: true, onboardingField: 'measurement_system' },
    ],
    onboardingMapping: { measurement_system: 'measurement_system' },
    entityMapping: {},
    defaults: { measurement_system: 'metric' },
  },
  drywall_calculator: {
    uiType: 'drywall_calculator',
    name: 'Drywall Calculator',
    category: UI_CATEGORIES.HOME,
    fields: [
      { name: 'room_length', type: 'number', required: true, prefillable: false },
      { name: 'room_width', type: 'number', required: true, prefillable: false },
      { name: 'ceiling_height', type: 'number', required: true, prefillable: false },
      { name: 'measurement_system', type: 'enum', required: false, prefillable: true, onboardingField: 'measurement_system' },
    ],
    onboardingMapping: { measurement_system: 'measurement_system' },
    entityMapping: {},
    defaults: { measurement_system: 'metric' },
  },
  roofing_calculator: {
    uiType: 'roofing_calculator',
    name: 'Roofing Calculator',
    category: UI_CATEGORIES.HOME,
    fields: [
      { name: 'roof_length', type: 'number', required: true, prefillable: false },
      { name: 'roof_width', type: 'number', required: true, prefillable: false },
      { name: 'pitch', type: 'number', required: true, prefillable: false },
      { name: 'measurement_system', type: 'enum', required: false, prefillable: true, onboardingField: 'measurement_system' },
    ],
    onboardingMapping: { measurement_system: 'measurement_system' },
    entityMapping: {},
    defaults: { measurement_system: 'metric' },
  },
  insulation_calculator: {
    uiType: 'insulation_calculator',
    name: 'Insulation Calculator',
    category: UI_CATEGORIES.HOME,
    fields: [
      { name: 'area', type: 'number', required: true, prefillable: false },
      { name: 'r_value', type: 'number', required: true, prefillable: false },
      { name: 'measurement_system', type: 'enum', required: false, prefillable: true, onboardingField: 'measurement_system' },
    ],
    onboardingMapping: { measurement_system: 'measurement_system' },
    entityMapping: {},
    defaults: { measurement_system: 'metric' },
  },
  lumber_calculator: {
    uiType: 'lumber_calculator',
    name: 'Lumber Calculator',
    category: UI_CATEGORIES.HOME,
    fields: [
      { name: 'length', type: 'number', required: true, prefillable: false },
      { name: 'width', type: 'number', required: true, prefillable: false },
      { name: 'thickness', type: 'number', required: true, prefillable: false },
      { name: 'quantity', type: 'number', required: true, prefillable: false },
      { name: 'measurement_system', type: 'enum', required: false, prefillable: true, onboardingField: 'measurement_system' },
    ],
    onboardingMapping: { measurement_system: 'measurement_system' },
    entityMapping: {},
    defaults: { measurement_system: 'metric' },
  },
  paver_calculator: {
    uiType: 'paver_calculator',
    name: 'Paver Calculator',
    category: UI_CATEGORIES.HOME,
    fields: [
      { name: 'area', type: 'number', required: true, prefillable: false },
      { name: 'paver_length', type: 'number', required: true, prefillable: false },
      { name: 'paver_width', type: 'number', required: true, prefillable: false },
      { name: 'measurement_system', type: 'enum', required: false, prefillable: true, onboardingField: 'measurement_system' },
    ],
    onboardingMapping: { measurement_system: 'measurement_system' },
    entityMapping: {},
    defaults: { measurement_system: 'metric' },
  },
  siding_calculator: {
    uiType: 'siding_calculator',
    name: 'Siding Calculator',
    category: UI_CATEGORIES.HOME,
    fields: [
      { name: 'wall_area', type: 'number', required: true, prefillable: false },
      { name: 'waste_percentage', type: 'number', required: false, prefillable: false },
      { name: 'measurement_system', type: 'enum', required: false, prefillable: true, onboardingField: 'measurement_system' },
    ],
    onboardingMapping: { measurement_system: 'measurement_system' },
    entityMapping: {},
    defaults: { measurement_system: 'metric', waste_percentage: 10 },
  },
  gutter_calculator: {
    uiType: 'gutter_calculator',
    name: 'Gutter Calculator',
    category: UI_CATEGORIES.HOME,
    fields: [
      { name: 'roof_perimeter', type: 'number', required: true, prefillable: false },
      { name: 'gutter_size', type: 'enum', required: true, prefillable: false },
      { name: 'measurement_system', type: 'enum', required: false, prefillable: true, onboardingField: 'measurement_system' },
    ],
    onboardingMapping: { measurement_system: 'measurement_system' },
    entityMapping: {},
    defaults: { measurement_system: 'metric' },
  },
  water_heater_size: {
    uiType: 'water_heater_size',
    name: 'Water Heater Size Calculator',
    category: UI_CATEGORIES.HOME,
    fields: [
      { name: 'household_size', type: 'number', required: true, prefillable: false },
      { name: 'usage_level', type: 'enum', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  ac_size_calculator: {
    uiType: 'ac_size_calculator',
    name: 'AC Size Calculator',
    category: UI_CATEGORIES.HOME,
    fields: [
      { name: 'room_area', type: 'number', required: true, prefillable: false },
      { name: 'ceiling_height', type: 'number', required: true, prefillable: false },
      { name: 'insulation_level', type: 'enum', required: true, prefillable: false },
      { name: 'measurement_system', type: 'enum', required: false, prefillable: true, onboardingField: 'measurement_system' },
    ],
    onboardingMapping: { measurement_system: 'measurement_system' },
    entityMapping: {},
    defaults: { measurement_system: 'metric' },
  },
  solar_panel_calculator: {
    uiType: 'solar_panel_calculator',
    name: 'Solar Panel Calculator',
    category: UI_CATEGORIES.HOME,
    fields: [
      { name: 'monthly_kwh', type: 'number', required: true, prefillable: false },
      { name: 'peak_sun_hours', type: 'number', required: true, prefillable: false },
      { name: 'location', type: 'string', required: false, prefillable: true, onboardingField: 'country' },
    ],
    onboardingMapping: { location: 'country' },
    entityMapping: { location: [EntityType.LOCATION] },
    defaults: {},
  },
  rain_barrel_calculator: {
    uiType: 'rain_barrel_calculator',
    name: 'Rain Barrel Calculator',
    category: UI_CATEGORIES.HOME,
    fields: [
      { name: 'roof_area', type: 'number', required: true, prefillable: false },
      { name: 'rainfall', type: 'number', required: true, prefillable: false },
      { name: 'measurement_system', type: 'enum', required: false, prefillable: true, onboardingField: 'measurement_system' },
    ],
    onboardingMapping: { measurement_system: 'measurement_system' },
    entityMapping: {},
    defaults: { measurement_system: 'metric' },
  },
  sprinkler_calculator: {
    uiType: 'sprinkler_calculator',
    name: 'Sprinkler Calculator',
    category: UI_CATEGORIES.HOME,
    fields: [
      { name: 'lawn_area', type: 'number', required: true, prefillable: false },
      { name: 'water_pressure', type: 'number', required: true, prefillable: false },
      { name: 'measurement_system', type: 'enum', required: false, prefillable: true, onboardingField: 'measurement_system' },
    ],
    onboardingMapping: { measurement_system: 'measurement_system' },
    entityMapping: {},
    defaults: { measurement_system: 'metric' },
  },
  planting_calendar: {
    uiType: 'planting_calendar',
    name: 'Planting Calendar',
    category: UI_CATEGORIES.HOME,
    fields: [
      { name: 'location', type: 'string', required: true, prefillable: true, onboardingField: 'country' },
      { name: 'plant_type', type: 'enum', required: true, prefillable: false },
    ],
    onboardingMapping: { location: 'country' },
    entityMapping: { location: [EntityType.LOCATION] },
    defaults: {},
  },
  compost_calculator: {
    uiType: 'compost_calculator',
    name: 'Compost Calculator',
    category: UI_CATEGORIES.HOME,
    fields: [
      { name: 'green_waste', type: 'number', required: true, prefillable: false },
      { name: 'brown_waste', type: 'number', required: true, prefillable: false },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
  },
  lawn_watering_calculator: {
    uiType: 'lawn_watering_calculator',
    name: 'Lawn Watering Calculator',
    category: UI_CATEGORIES.HOME,
    fields: [
      { name: 'lawn_area', type: 'number', required: true, prefillable: false },
      { name: 'grass_type', type: 'enum', required: true, prefillable: false },
      { name: 'climate', type: 'enum', required: true, prefillable: false },
      { name: 'measurement_system', type: 'enum', required: false, prefillable: true, onboardingField: 'measurement_system' },
    ],
    onboardingMapping: { measurement_system: 'measurement_system' },
    entityMapping: {},
    defaults: { measurement_system: 'metric' },
  },
  raised_bed_calculator: {
    uiType: 'raised_bed_calculator',
    name: 'Raised Bed Soil Calculator',
    category: UI_CATEGORIES.HOME,
    fields: [
      { name: 'length', type: 'number', required: true, prefillable: false },
      { name: 'width', type: 'number', required: true, prefillable: false },
      { name: 'depth', type: 'number', required: true, prefillable: false },
      { name: 'measurement_system', type: 'enum', required: false, prefillable: true, onboardingField: 'measurement_system' },
    ],
    onboardingMapping: { measurement_system: 'measurement_system' },
    entityMapping: {},
    defaults: { measurement_system: 'metric' },
  },

  // ============================================
  // AI CONTENT & WRITING TOOLS (Extended)
  // ============================================
  ai_meta_description: { uiType: 'ai_meta_description', name: 'AI SEO Meta Description', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'page_title', type: 'string', required: true, prefillable: false }, { name: 'keywords', type: 'array', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  ai_ad_copy: { uiType: 'ai_ad_copy', name: 'AI Ad Copy Generator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'product', type: 'string', required: true, prefillable: false }, { name: 'platform', type: 'enum', required: true, prefillable: false }, { name: 'target_audience', type: 'string', required: false, prefillable: false }], onboardingMapping: {}, entityMapping: { target_audience: [EntityType.TARGET_AUDIENCE] }, defaults: {} },
  ai_press_release: { uiType: 'ai_press_release', name: 'AI Press Release Writer', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'company_name', type: 'string', required: true, prefillable: true, onboardingField: 'company_name' }, { name: 'announcement', type: 'string', required: true, prefillable: false }], onboardingMapping: { company_name: 'company_name' }, entityMapping: { company_name: [EntityType.COMPANY_NAME] }, defaults: {} },
  ai_newsletter: { uiType: 'ai_newsletter', name: 'AI Newsletter Generator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'company_name', type: 'string', required: true, prefillable: true, onboardingField: 'company_name' }, { name: 'topics', type: 'array', required: true, prefillable: false }], onboardingMapping: { company_name: 'company_name' }, entityMapping: {}, defaults: {} },
  ai_video_script: { uiType: 'ai_video_script', name: 'AI Video Script Writer', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'topic', type: 'string', required: true, prefillable: false }, { name: 'duration', type: 'number', required: true, prefillable: false }, { name: 'style', type: 'enum', required: false, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: { style: 'engaging' } },
  ai_podcast_script: { uiType: 'ai_podcast_script', name: 'AI Podcast Script Generator', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'topic', type: 'string', required: true, prefillable: false }, { name: 'format', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  ai_thank_you_note: { uiType: 'ai_thank_you_note', name: 'AI Thank You Note Generator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'recipient', type: 'string', required: true, prefillable: false }, { name: 'occasion', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: { recipient: [EntityType.PERSON_NAME] }, defaults: {} },
  ai_apology_letter: { uiType: 'ai_apology_letter', name: 'AI Apology Letter Writer', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'recipient', type: 'string', required: true, prefillable: false }, { name: 'situation', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  ai_complaint_letter: { uiType: 'ai_complaint_letter', name: 'AI Complaint Letter Generator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'company', type: 'string', required: true, prefillable: false }, { name: 'issue', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: { company: [EntityType.COMPANY_NAME] }, defaults: {} },
  ai_recommendation_letter: { uiType: 'ai_recommendation_letter', name: 'AI Recommendation Letter', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'candidate_name', type: 'string', required: true, prefillable: false }, { name: 'relationship', type: 'enum', required: true, prefillable: false }, { name: 'position', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: { candidate_name: [EntityType.PERSON_NAME] }, defaults: {} },
  ai_bio_generator: { uiType: 'ai_bio_generator', name: 'AI Bio Generator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'name', type: 'string', required: true, prefillable: false }, { name: 'profession', type: 'string', required: true, prefillable: false }, { name: 'platform', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: { name: [EntityType.PERSON_NAME] }, defaults: {} },
  ai_tagline_generator: { uiType: 'ai_tagline_generator', name: 'AI Tagline Generator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'business_name', type: 'string', required: true, prefillable: true, onboardingField: 'company_name' }, { name: 'industry', type: 'enum', required: true, prefillable: true, onboardingField: 'industry' }], onboardingMapping: { business_name: 'company_name', industry: 'industry' }, entityMapping: {}, defaults: {} },
  ai_faq_generator: { uiType: 'ai_faq_generator', name: 'AI FAQ Generator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'topic', type: 'string', required: true, prefillable: false }, { name: 'count', type: 'number', required: false, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: { count: 10 } },
  ai_interview_questions: { uiType: 'ai_interview_questions', name: 'AI Interview Questions Generator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'role', type: 'string', required: true, prefillable: false }, { name: 'level', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  ai_job_posting: { uiType: 'ai_job_posting', name: 'AI Job Posting Writer', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'title', type: 'string', required: true, prefillable: false }, { name: 'company', type: 'string', required: true, prefillable: true, onboardingField: 'company_name' }, { name: 'requirements', type: 'array', required: true, prefillable: false }], onboardingMapping: { company: 'company_name' }, entityMapping: { company: [EntityType.COMPANY_NAME] }, defaults: {} },
  ai_linkedin_post: { uiType: 'ai_linkedin_post', name: 'AI LinkedIn Post Generator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'topic', type: 'string', required: true, prefillable: false }, { name: 'type', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  ai_twitter_thread: { uiType: 'ai_twitter_thread', name: 'AI Twitter Thread Creator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'topic', type: 'string', required: true, prefillable: false }, { name: 'tweet_count', type: 'number', required: false, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: { tweet_count: 5 } },
  ai_instagram_caption: { uiType: 'ai_instagram_caption', name: 'AI Instagram Caption', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'image_description', type: 'string', required: true, prefillable: false }, { name: 'tone', type: 'enum', required: false, prefillable: true, onboardingField: 'tone_preference' }], onboardingMapping: { tone: 'tone_preference' }, entityMapping: {}, defaults: {} },
  ai_youtube_description: { uiType: 'ai_youtube_description', name: 'AI YouTube Description', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'video_title', type: 'string', required: true, prefillable: false }, { name: 'video_summary', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  ai_tiktok_script: { uiType: 'ai_tiktok_script', name: 'AI TikTok Script', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'concept', type: 'string', required: true, prefillable: false }, { name: 'duration', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  ai_book_summary: { uiType: 'ai_book_summary', name: 'AI Book Summary Generator', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'book_title', type: 'string', required: true, prefillable: false }, { name: 'author', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: { author: [EntityType.PERSON_NAME] }, defaults: {} },
  ai_essay_writer: { uiType: 'ai_essay_writer', name: 'AI Essay Writer', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'topic', type: 'string', required: true, prefillable: false }, { name: 'word_count', type: 'number', required: true, prefillable: false }, { name: 'type', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  ai_thesis_generator: { uiType: 'ai_thesis_generator', name: 'AI Thesis Statement Generator', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'topic', type: 'string', required: true, prefillable: false }, { name: 'position', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  ai_outline_generator: { uiType: 'ai_outline_generator', name: 'AI Outline Generator', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'topic', type: 'string', required: true, prefillable: false }, { name: 'type', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  ai_study_guide: { uiType: 'ai_study_guide', name: 'AI Study Guide Creator', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'subject', type: 'string', required: true, prefillable: false }, { name: 'topic', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  ai_flashcard_generator: { uiType: 'ai_flashcard_generator', name: 'AI Flashcard Generator', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'topic', type: 'string', required: true, prefillable: false }, { name: 'count', type: 'number', required: false, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: { count: 20 } },
  ai_quiz_generator: { uiType: 'ai_quiz_generator', name: 'AI Quiz Generator', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'topic', type: 'string', required: true, prefillable: false }, { name: 'difficulty', type: 'enum', required: true, prefillable: false }, { name: 'question_count', type: 'number', required: false, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: { question_count: 10 } },
  ai_lesson_plan: { uiType: 'ai_lesson_plan', name: 'AI Lesson Plan Generator', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'subject', type: 'string', required: true, prefillable: false }, { name: 'grade_level', type: 'enum', required: true, prefillable: false }, { name: 'duration', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  ai_song_lyrics: { uiType: 'ai_song_lyrics', name: 'AI Song Lyrics Generator', category: UI_CATEGORIES.MUSIC, fields: [{ name: 'theme', type: 'string', required: true, prefillable: false }, { name: 'genre', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  ai_rap_generator: { uiType: 'ai_rap_generator', name: 'AI Rap Lyrics Generator', category: UI_CATEGORIES.MUSIC, fields: [{ name: 'topic', type: 'string', required: true, prefillable: false }, { name: 'style', type: 'enum', required: false, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  ai_haiku_generator: { uiType: 'ai_haiku_generator', name: 'AI Haiku Generator', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'theme', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  ai_pickup_line: { uiType: 'ai_pickup_line', name: 'AI Pickup Line Generator', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'style', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  ai_tongue_twister: { uiType: 'ai_tongue_twister', name: 'AI Tongue Twister Generator', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'difficulty', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  ai_riddle_generator: { uiType: 'ai_riddle_generator', name: 'AI Riddle Generator', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'difficulty', type: 'enum', required: true, prefillable: false }, { name: 'category', type: 'enum', required: false, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  ai_trivia_generator: { uiType: 'ai_trivia_generator', name: 'AI Trivia Generator', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'category', type: 'enum', required: true, prefillable: false }, { name: 'difficulty', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },

  // ============================================
  // CHILDCARE & PARENTING CALCULATORS
  // ============================================
  baby_age_calculator: { uiType: 'baby_age_calculator', name: 'Baby Age Calculator', category: UI_CATEGORIES.HEALTH, fields: [{ name: 'birth_date', type: 'date', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  due_date_calculator: { uiType: 'due_date_calculator', name: 'Pregnancy Due Date Calculator', category: UI_CATEGORIES.HEALTH, fields: [{ name: 'last_period', type: 'date', required: true, prefillable: false }, { name: 'cycle_length', type: 'number', required: false, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: { cycle_length: 28 } },
  conception_calculator: { uiType: 'conception_calculator', name: 'Conception Date Calculator', category: UI_CATEGORIES.HEALTH, fields: [{ name: 'due_date', type: 'date', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  baby_growth_chart: { uiType: 'baby_growth_chart', name: 'Baby Growth Percentile Chart', category: UI_CATEGORIES.HEALTH, fields: [{ name: 'weight', type: 'number', required: true, prefillable: false }, { name: 'height', type: 'number', required: true, prefillable: false }, { name: 'age_months', type: 'number', required: true, prefillable: false }, { name: 'gender', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  baby_feeding_calculator: { uiType: 'baby_feeding_calculator', name: 'Baby Feeding Amount Calculator', category: UI_CATEGORIES.HEALTH, fields: [{ name: 'age_months', type: 'number', required: true, prefillable: false }, { name: 'weight', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  diaper_calculator: { uiType: 'diaper_calculator', name: 'Diaper Cost Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'diapers_per_day', type: 'number', required: true, prefillable: false }, { name: 'cost_per_diaper', type: 'number', required: true, prefillable: false }, { name: 'currency', type: 'enum', required: false, prefillable: true, onboardingField: 'preferred_currency' }], onboardingMapping: { currency: 'preferred_currency' }, entityMapping: {}, defaults: {} },
  baby_name_generator: { uiType: 'baby_name_generator', name: 'Baby Name Generator', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'gender', type: 'enum', required: true, prefillable: false }, { name: 'origin', type: 'enum', required: false, prefillable: false }, { name: 'starting_letter', type: 'string', required: false, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  child_height_predictor: { uiType: 'child_height_predictor', name: 'Child Adult Height Predictor', category: UI_CATEGORIES.HEALTH, fields: [{ name: 'child_age', type: 'number', required: true, prefillable: false }, { name: 'current_height', type: 'number', required: true, prefillable: false }, { name: 'mother_height', type: 'number', required: true, prefillable: false }, { name: 'father_height', type: 'number', required: true, prefillable: false }, { name: 'gender', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  sleep_schedule_calculator: { uiType: 'sleep_schedule_calculator', name: 'Baby Sleep Schedule Calculator', category: UI_CATEGORIES.HEALTH, fields: [{ name: 'age_months', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  vaccination_schedule: { uiType: 'vaccination_schedule', name: 'Vaccination Schedule Tracker', category: UI_CATEGORIES.HEALTH, fields: [{ name: 'birth_date', type: 'date', required: true, prefillable: false }, { name: 'country', type: 'enum', required: true, prefillable: true, onboardingField: 'country' }], onboardingMapping: { country: 'country' }, entityMapping: {}, defaults: {} },
  baby_milestone_tracker: { uiType: 'baby_milestone_tracker', name: 'Baby Milestone Tracker', category: UI_CATEGORIES.HEALTH, fields: [{ name: 'birth_date', type: 'date', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  child_bmi_calculator: { uiType: 'child_bmi_calculator', name: 'Child BMI Percentile Calculator', category: UI_CATEGORIES.HEALTH, fields: [{ name: 'weight', type: 'number', required: true, prefillable: false }, { name: 'height', type: 'number', required: true, prefillable: false }, { name: 'age', type: 'number', required: true, prefillable: false }, { name: 'gender', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  potty_training_readiness: { uiType: 'potty_training_readiness', name: 'Potty Training Readiness Quiz', category: UI_CATEGORIES.HEALTH, fields: [{ name: 'age_months', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  breastfeeding_tracker: { uiType: 'breastfeeding_tracker', name: 'Breastfeeding Tracker', category: UI_CATEGORIES.HEALTH, fields: [{ name: 'session_start', type: 'date', required: true, prefillable: false }, { name: 'duration_minutes', type: 'number', required: true, prefillable: false }, { name: 'side', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  formula_mixing_calculator: { uiType: 'formula_mixing_calculator', name: 'Formula Mixing Calculator', category: UI_CATEGORIES.HEALTH, fields: [{ name: 'ounces_needed', type: 'number', required: true, prefillable: false }, { name: 'formula_type', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  child_allowance_calculator: { uiType: 'child_allowance_calculator', name: 'Child Allowance Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'child_age', type: 'number', required: true, prefillable: false }, { name: 'currency', type: 'enum', required: false, prefillable: true, onboardingField: 'preferred_currency' }], onboardingMapping: { currency: 'preferred_currency' }, entityMapping: {}, defaults: {} },
  child_education_cost: { uiType: 'child_education_cost', name: 'Child Education Cost Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'child_age', type: 'number', required: true, prefillable: false }, { name: 'education_type', type: 'enum', required: true, prefillable: false }, { name: 'currency', type: 'enum', required: false, prefillable: true, onboardingField: 'preferred_currency' }], onboardingMapping: { currency: 'preferred_currency' }, entityMapping: { currency: [EntityType.CURRENCY] }, defaults: {} },
  nanny_cost_calculator: { uiType: 'nanny_cost_calculator', name: 'Nanny Cost Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'hours_per_week', type: 'number', required: true, prefillable: false }, { name: 'hourly_rate', type: 'number', required: true, prefillable: false }, { name: 'currency', type: 'enum', required: false, prefillable: true, onboardingField: 'preferred_currency' }], onboardingMapping: { currency: 'preferred_currency' }, entityMapping: {}, defaults: {} },
  daycare_cost_calculator: { uiType: 'daycare_cost_calculator', name: 'Daycare Cost Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'hours_per_week', type: 'number', required: true, prefillable: false }, { name: 'location', type: 'string', required: true, prefillable: true, onboardingField: 'city' }], onboardingMapping: { location: 'city' }, entityMapping: { location: [EntityType.LOCATION] }, defaults: {} },

  // ============================================
  // RELIGIOUS & SPIRITUAL CALCULATORS
  // ============================================
  prayer_time_calculator: { uiType: 'prayer_time_calculator', name: 'Prayer Time Calculator', category: UI_CATEGORIES.ASTROLOGY, fields: [{ name: 'location', type: 'string', required: true, prefillable: true, onboardingField: 'city' }, { name: 'date', type: 'date', required: false, prefillable: false }], onboardingMapping: { location: 'city' }, entityMapping: { location: [EntityType.LOCATION] }, defaults: {} },
  zakat_calculator: { uiType: 'zakat_calculator', name: 'Zakat Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'assets', type: 'number', required: true, prefillable: false }, { name: 'liabilities', type: 'number', required: true, prefillable: false }, { name: 'currency', type: 'enum', required: false, prefillable: true, onboardingField: 'preferred_currency' }], onboardingMapping: { currency: 'preferred_currency' }, entityMapping: { currency: [EntityType.CURRENCY] }, defaults: {} },
  hebrew_date_converter: { uiType: 'hebrew_date_converter', name: 'Hebrew Date Converter', category: UI_CATEGORIES.ASTROLOGY, fields: [{ name: 'gregorian_date', type: 'date', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  hijri_date_converter: { uiType: 'hijri_date_converter', name: 'Hijri Date Converter', category: UI_CATEGORIES.ASTROLOGY, fields: [{ name: 'gregorian_date', type: 'date', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  tithe_calculator: { uiType: 'tithe_calculator', name: 'Tithe Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'income', type: 'number', required: true, prefillable: false }, { name: 'tithe_percentage', type: 'number', required: false, prefillable: false }, { name: 'currency', type: 'enum', required: false, prefillable: true, onboardingField: 'preferred_currency' }], onboardingMapping: { currency: 'preferred_currency' }, entityMapping: {}, defaults: { tithe_percentage: 10 } },
  ramadan_calendar: { uiType: 'ramadan_calendar', name: 'Ramadan Calendar', category: UI_CATEGORIES.ASTROLOGY, fields: [{ name: 'year', type: 'number', required: true, prefillable: false }, { name: 'location', type: 'string', required: true, prefillable: true, onboardingField: 'city' }], onboardingMapping: { location: 'city' }, entityMapping: { location: [EntityType.LOCATION] }, defaults: {} },
  easter_date_calculator: { uiType: 'easter_date_calculator', name: 'Easter Date Calculator', category: UI_CATEGORIES.ASTROLOGY, fields: [{ name: 'year', type: 'number', required: true, prefillable: false }, { name: 'tradition', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  bible_verse_finder: { uiType: 'bible_verse_finder', name: 'Bible Verse Finder', category: UI_CATEGORIES.ASTROLOGY, fields: [{ name: 'book', type: 'enum', required: true, prefillable: false }, { name: 'chapter', type: 'number', required: true, prefillable: false }, { name: 'verse', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  quran_verse_finder: { uiType: 'quran_verse_finder', name: 'Quran Verse Finder', category: UI_CATEGORIES.ASTROLOGY, fields: [{ name: 'surah', type: 'number', required: true, prefillable: false }, { name: 'ayah', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  church_donation_tracker: { uiType: 'church_donation_tracker', name: 'Church Donation Tracker', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'amount', type: 'number', required: true, prefillable: false }, { name: 'date', type: 'date', required: true, prefillable: false }, { name: 'currency', type: 'enum', required: false, prefillable: true, onboardingField: 'preferred_currency' }], onboardingMapping: { currency: 'preferred_currency' }, entityMapping: {}, defaults: {} },

  // ============================================
  // MANUFACTURING & INDUSTRIAL
  // ============================================
  production_rate_calculator: { uiType: 'production_rate_calculator', name: 'Production Rate Calculator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'units_produced', type: 'number', required: true, prefillable: false }, { name: 'time_hours', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  machine_efficiency: { uiType: 'machine_efficiency', name: 'Machine Efficiency Calculator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'actual_output', type: 'number', required: true, prefillable: false }, { name: 'theoretical_output', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  oee_calculator: { uiType: 'oee_calculator', name: 'OEE Calculator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'availability', type: 'number', required: true, prefillable: false }, { name: 'performance', type: 'number', required: true, prefillable: false }, { name: 'quality', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  cycle_time_calculator: { uiType: 'cycle_time_calculator', name: 'Cycle Time Calculator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'total_time', type: 'number', required: true, prefillable: false }, { name: 'units_produced', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  takt_time_calculator: { uiType: 'takt_time_calculator', name: 'Takt Time Calculator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'available_time', type: 'number', required: true, prefillable: false }, { name: 'customer_demand', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  scrap_rate_calculator: { uiType: 'scrap_rate_calculator', name: 'Scrap Rate Calculator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'defective_units', type: 'number', required: true, prefillable: false }, { name: 'total_units', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  inventory_turnover: { uiType: 'inventory_turnover', name: 'Inventory Turnover Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'cogs', type: 'number', required: true, prefillable: false }, { name: 'average_inventory', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  safety_stock_calculator: { uiType: 'safety_stock_calculator', name: 'Safety Stock Calculator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'max_daily_usage', type: 'number', required: true, prefillable: false }, { name: 'max_lead_time', type: 'number', required: true, prefillable: false }, { name: 'avg_daily_usage', type: 'number', required: true, prefillable: false }, { name: 'avg_lead_time', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  reorder_point_calculator: { uiType: 'reorder_point_calculator', name: 'Reorder Point Calculator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'avg_daily_usage', type: 'number', required: true, prefillable: false }, { name: 'lead_time_days', type: 'number', required: true, prefillable: false }, { name: 'safety_stock', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  eoq_calculator: { uiType: 'eoq_calculator', name: 'Economic Order Quantity Calculator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'annual_demand', type: 'number', required: true, prefillable: false }, { name: 'order_cost', type: 'number', required: true, prefillable: false }, { name: 'holding_cost', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  lead_time_calculator: { uiType: 'lead_time_calculator', name: 'Lead Time Calculator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'order_date', type: 'date', required: true, prefillable: false }, { name: 'delivery_date', type: 'date', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  capacity_utilization: { uiType: 'capacity_utilization', name: 'Capacity Utilization Calculator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'actual_output', type: 'number', required: true, prefillable: false }, { name: 'potential_output', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },

  // ============================================
  // LOGISTICS & TRANSPORTATION
  // ============================================
  shipping_cost_calculator: { uiType: 'shipping_cost_calculator', name: 'Shipping Cost Calculator', category: UI_CATEGORIES.TRAVEL, fields: [{ name: 'weight', type: 'number', required: true, prefillable: false }, { name: 'dimensions', type: 'object', required: true, prefillable: false }, { name: 'origin', type: 'string', required: true, prefillable: true, onboardingField: 'city' }, { name: 'destination', type: 'string', required: true, prefillable: false }], onboardingMapping: { origin: 'city' }, entityMapping: { origin: [EntityType.LOCATION], destination: [EntityType.LOCATION] }, defaults: {} },
  freight_calculator: { uiType: 'freight_calculator', name: 'Freight Cost Calculator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'weight', type: 'number', required: true, prefillable: false }, { name: 'freight_class', type: 'enum', required: true, prefillable: false }, { name: 'distance', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  cbm_calculator: { uiType: 'cbm_calculator', name: 'CBM Calculator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'length', type: 'number', required: true, prefillable: false }, { name: 'width', type: 'number', required: true, prefillable: false }, { name: 'height', type: 'number', required: true, prefillable: false }, { name: 'quantity', type: 'number', required: false, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: { quantity: 1 } },
  container_load_calculator: { uiType: 'container_load_calculator', name: 'Container Load Calculator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'container_type', type: 'enum', required: true, prefillable: false }, { name: 'box_dimensions', type: 'object', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  delivery_time_estimator: { uiType: 'delivery_time_estimator', name: 'Delivery Time Estimator', category: UI_CATEGORIES.TRAVEL, fields: [{ name: 'origin', type: 'string', required: true, prefillable: true, onboardingField: 'city' }, { name: 'destination', type: 'string', required: true, prefillable: false }, { name: 'shipping_method', type: 'enum', required: true, prefillable: false }], onboardingMapping: { origin: 'city' }, entityMapping: { origin: [EntityType.LOCATION], destination: [EntityType.LOCATION] }, defaults: {} },
  fleet_fuel_cost: { uiType: 'fleet_fuel_cost', name: 'Fleet Fuel Cost Calculator', category: UI_CATEGORIES.AUTOMOTIVE, fields: [{ name: 'distance', type: 'number', required: true, prefillable: false }, { name: 'fuel_efficiency', type: 'number', required: true, prefillable: false }, { name: 'fuel_price', type: 'number', required: true, prefillable: false }, { name: 'vehicle_count', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  pallet_calculator: { uiType: 'pallet_calculator', name: 'Pallet Calculator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'box_dimensions', type: 'object', required: true, prefillable: false }, { name: 'pallet_dimensions', type: 'object', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  dimensional_weight: { uiType: 'dimensional_weight', name: 'Dimensional Weight Calculator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'length', type: 'number', required: true, prefillable: false }, { name: 'width', type: 'number', required: true, prefillable: false }, { name: 'height', type: 'number', required: true, prefillable: false }, { name: 'carrier', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  truck_load_calculator: { uiType: 'truck_load_calculator', name: 'Truck Load Capacity Calculator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'truck_type', type: 'enum', required: true, prefillable: false }, { name: 'cargo_weight', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  customs_duty_calculator: { uiType: 'customs_duty_calculator', name: 'Customs Duty Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'item_value', type: 'number', required: true, prefillable: false }, { name: 'hs_code', type: 'string', required: true, prefillable: false }, { name: 'origin_country', type: 'enum', required: true, prefillable: false }, { name: 'destination_country', type: 'enum', required: true, prefillable: true, onboardingField: 'country' }], onboardingMapping: { destination_country: 'country' }, entityMapping: {}, defaults: {} },

  // ============================================
  // ENERGY & UTILITIES
  // ============================================
  electricity_cost: { uiType: 'electricity_cost', name: 'Electricity Cost Calculator', category: UI_CATEGORIES.HOME, fields: [{ name: 'kwh_usage', type: 'number', required: true, prefillable: false }, { name: 'rate_per_kwh', type: 'number', required: true, prefillable: false }, { name: 'currency', type: 'enum', required: false, prefillable: true, onboardingField: 'preferred_currency' }], onboardingMapping: { currency: 'preferred_currency' }, entityMapping: {}, defaults: {} },
  water_bill_calculator: { uiType: 'water_bill_calculator', name: 'Water Bill Calculator', category: UI_CATEGORIES.HOME, fields: [{ name: 'gallons_used', type: 'number', required: true, prefillable: false }, { name: 'rate_per_gallon', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  gas_bill_calculator: { uiType: 'gas_bill_calculator', name: 'Gas Bill Calculator', category: UI_CATEGORIES.HOME, fields: [{ name: 'therms_used', type: 'number', required: true, prefillable: false }, { name: 'rate_per_therm', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  carbon_footprint: { uiType: 'carbon_footprint', name: 'Carbon Footprint Calculator', category: UI_CATEGORIES.HOME, fields: [{ name: 'electricity_usage', type: 'number', required: true, prefillable: false }, { name: 'gas_usage', type: 'number', required: true, prefillable: false }, { name: 'miles_driven', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  led_savings_calculator: { uiType: 'led_savings_calculator', name: 'LED Bulb Savings Calculator', category: UI_CATEGORIES.HOME, fields: [{ name: 'bulb_count', type: 'number', required: true, prefillable: false }, { name: 'hours_per_day', type: 'number', required: true, prefillable: false }, { name: 'electricity_rate', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  hvac_efficiency: { uiType: 'hvac_efficiency', name: 'HVAC Efficiency Calculator', category: UI_CATEGORIES.HOME, fields: [{ name: 'seer_rating', type: 'number', required: true, prefillable: false }, { name: 'cooling_hours', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  appliance_energy_cost: { uiType: 'appliance_energy_cost', name: 'Appliance Energy Cost Calculator', category: UI_CATEGORIES.HOME, fields: [{ name: 'wattage', type: 'number', required: true, prefillable: false }, { name: 'hours_per_day', type: 'number', required: true, prefillable: false }, { name: 'electricity_rate', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  ev_charging_cost: { uiType: 'ev_charging_cost', name: 'EV Charging Cost Calculator', category: UI_CATEGORIES.AUTOMOTIVE, fields: [{ name: 'battery_capacity', type: 'number', required: true, prefillable: false }, { name: 'electricity_rate', type: 'number', required: true, prefillable: false }, { name: 'charging_efficiency', type: 'number', required: false, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: { charging_efficiency: 0.9 } },
  generator_size: { uiType: 'generator_size', name: 'Generator Size Calculator', category: UI_CATEGORIES.HOME, fields: [{ name: 'appliances', type: 'array', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  pool_heating_cost: { uiType: 'pool_heating_cost', name: 'Pool Heating Cost Calculator', category: UI_CATEGORIES.HOME, fields: [{ name: 'pool_size', type: 'number', required: true, prefillable: false }, { name: 'heating_method', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },

  // ============================================
  // LEGAL & COMPLIANCE
  // ============================================
  legal_fee_calculator: { uiType: 'legal_fee_calculator', name: 'Legal Fee Estimator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'case_type', type: 'enum', required: true, prefillable: false }, { name: 'complexity', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  court_cost_calculator: { uiType: 'court_cost_calculator', name: 'Court Cost Calculator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'court_type', type: 'enum', required: true, prefillable: false }, { name: 'case_type', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  alimony_calculator: { uiType: 'alimony_calculator', name: 'Alimony Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'payer_income', type: 'number', required: true, prefillable: false }, { name: 'recipient_income', type: 'number', required: true, prefillable: false }, { name: 'marriage_years', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  child_support_calculator: { uiType: 'child_support_calculator', name: 'Child Support Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'parent1_income', type: 'number', required: true, prefillable: false }, { name: 'parent2_income', type: 'number', required: true, prefillable: false }, { name: 'children_count', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  trademark_fee: { uiType: 'trademark_fee', name: 'Trademark Fee Calculator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'filing_type', type: 'enum', required: true, prefillable: false }, { name: 'classes_count', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  patent_cost: { uiType: 'patent_cost', name: 'Patent Cost Estimator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'patent_type', type: 'enum', required: true, prefillable: false }, { name: 'complexity', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  llc_formation_cost: { uiType: 'llc_formation_cost', name: 'LLC Formation Cost Calculator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'state', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  nonprofit_filing_fee: { uiType: 'nonprofit_filing_fee', name: 'Nonprofit Filing Fee Calculator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'organization_type', type: 'enum', required: true, prefillable: false }, { name: 'state', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  visa_fee_calculator: { uiType: 'visa_fee_calculator', name: 'Visa Fee Calculator', category: UI_CATEGORIES.TRAVEL, fields: [{ name: 'visa_type', type: 'enum', required: true, prefillable: false }, { name: 'nationality', type: 'enum', required: true, prefillable: false }, { name: 'destination', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  passport_renewal_cost: { uiType: 'passport_renewal_cost', name: 'Passport Renewal Cost', category: UI_CATEGORIES.TRAVEL, fields: [{ name: 'country', type: 'enum', required: true, prefillable: true, onboardingField: 'country' }, { name: 'processing_speed', type: 'enum', required: true, prefillable: false }], onboardingMapping: { country: 'country' }, entityMapping: {}, defaults: {} },
  gdpr_fine_calculator: { uiType: 'gdpr_fine_calculator', name: 'GDPR Fine Calculator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'annual_turnover', type: 'number', required: true, prefillable: false }, { name: 'violation_type', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  contract_termination_cost: { uiType: 'contract_termination_cost', name: 'Contract Termination Cost', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'contract_value', type: 'number', required: true, prefillable: false }, { name: 'remaining_term', type: 'number', required: true, prefillable: false }, { name: 'termination_clause', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },

  // ============================================
  // IMAGE PROCESSING
  // ============================================
  image_resizer: {
    uiType: 'image_resizer',
    name: 'Image Resizer',
    description: 'Resize images to custom dimensions or preset sizes like social media formats.',
    category: UI_CATEGORIES.PROFESSIONAL,
    fields: [
      { name: 'sourceImage', type: 'string', required: true, prefillable: true },
      { name: 'width', type: 'number', required: true, prefillable: true },
      { name: 'height', type: 'number', required: true, prefillable: true },
      { name: 'maintainAspectRatio', type: 'boolean', required: false, prefillable: true },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: { maintainAspectRatio: true },
    intentPatterns: ['resize image', 'change image size', 'scale image', 'make image smaller', 'make image bigger'],
    primaryAction: 'resize',
  },
  image_compressor: {
    uiType: 'image_compressor',
    name: 'Image Compressor',
    description: 'Compress images to reduce file size while maintaining quality.',
    category: UI_CATEGORIES.PROFESSIONAL,
    fields: [
      { name: 'sourceImage', type: 'string', required: true, prefillable: true },
      { name: 'quality', type: 'number', required: false, prefillable: true },
      { name: 'outputFormat', type: 'enum', required: false, prefillable: true },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: { quality: 80 },
    intentPatterns: ['compress image', 'reduce image size', 'optimize image', 'make image smaller file'],
    primaryAction: 'compress',
  },
  image_converter: {
    uiType: 'image_converter',
    name: 'Image Converter',
    description: 'Convert images between formats like PNG, JPG, WebP, GIF.',
    category: UI_CATEGORIES.PROFESSIONAL,
    fields: [
      { name: 'sourceImage', type: 'string', required: true, prefillable: true },
      { name: 'outputFormat', type: 'enum', required: true, prefillable: true },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
    intentPatterns: ['convert image', 'change image format', 'convert to png', 'convert to jpg', 'convert to webp'],
    primaryAction: 'convert',
  },
  image_upscaler: {
    uiType: 'image_upscaler',
    name: 'Image Upscaler',
    description: 'Upscale images to higher resolution using AI enhancement.',
    category: UI_CATEGORIES.PROFESSIONAL,
    fields: [
      { name: 'sourceImage', type: 'string', required: true, prefillable: true },
      { name: 'scaleFactor', type: 'enum', required: false, prefillable: true },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: { scaleFactor: '2x' },
    intentPatterns: ['upscale image', 'increase resolution', 'enhance image quality', 'make image larger'],
    primaryAction: 'upscale',
  },
  background_remover: {
    uiType: 'background_remover',
    name: 'Background Remover',
    description: 'Remove background from images automatically using AI.',
    category: UI_CATEGORIES.PROFESSIONAL,
    fields: [
      { name: 'sourceImage', type: 'string', required: true, prefillable: true },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
    intentPatterns: ['remove background', 'transparent background', 'cut out image', 'isolate subject'],
    primaryAction: 'remove',
  },
  image_cropper: {
    uiType: 'image_cropper',
    name: 'Image Cropper',
    description: 'Crop images to specific dimensions or aspect ratios.',
    category: UI_CATEGORIES.PROFESSIONAL,
    fields: [
      { name: 'sourceImage', type: 'string', required: true, prefillable: true },
      { name: 'aspectRatio', type: 'enum', required: false, prefillable: true },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: {},
    intentPatterns: ['crop image', 'trim image', 'cut image'],
    primaryAction: 'crop',
  },

  // ============================================
  // PHOTOGRAPHY & VIDEO
  // ============================================
  photo_print_size: { uiType: 'photo_print_size', name: 'Photo Print Size Calculator', category: UI_CATEGORIES.CRAFTS, fields: [{ name: 'image_width', type: 'number', required: true, prefillable: false }, { name: 'image_height', type: 'number', required: true, prefillable: false }, { name: 'dpi', type: 'number', required: false, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: { dpi: 300 } },
  aspect_ratio_calculator: { uiType: 'aspect_ratio_calculator', name: 'Aspect Ratio Calculator', category: UI_CATEGORIES.CRAFTS, fields: [{ name: 'width', type: 'number', required: true, prefillable: false }, { name: 'height', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  video_file_size: { uiType: 'video_file_size', name: 'Video File Size Calculator', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'duration_minutes', type: 'number', required: true, prefillable: false }, { name: 'resolution', type: 'enum', required: true, prefillable: false }, { name: 'bitrate', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  depth_of_field: { uiType: 'depth_of_field', name: 'Depth of Field Calculator', category: UI_CATEGORIES.CRAFTS, fields: [{ name: 'focal_length', type: 'number', required: true, prefillable: false }, { name: 'aperture', type: 'number', required: true, prefillable: false }, { name: 'distance_to_subject', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  exposure_calculator: { uiType: 'exposure_calculator', name: 'Exposure Calculator', category: UI_CATEGORIES.CRAFTS, fields: [{ name: 'iso', type: 'number', required: true, prefillable: false }, { name: 'aperture', type: 'number', required: true, prefillable: false }, { name: 'shutter_speed', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  frame_rate_converter: { uiType: 'frame_rate_converter', name: 'Frame Rate Converter', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'original_fps', type: 'number', required: true, prefillable: false }, { name: 'target_fps', type: 'number', required: true, prefillable: false }, { name: 'duration', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  photo_megapixel: { uiType: 'photo_megapixel', name: 'Photo Megapixel Calculator', category: UI_CATEGORIES.CRAFTS, fields: [{ name: 'width_pixels', type: 'number', required: true, prefillable: false }, { name: 'height_pixels', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  storage_calculator: { uiType: 'storage_calculator', name: 'Photo Storage Calculator', category: UI_CATEGORIES.CRAFTS, fields: [{ name: 'photo_count', type: 'number', required: true, prefillable: false }, { name: 'avg_size_mb', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  video_duration_from_size: { uiType: 'video_duration_from_size', name: 'Video Duration from File Size', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'file_size_gb', type: 'number', required: true, prefillable: false }, { name: 'quality', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  photography_pricing: { uiType: 'photography_pricing', name: 'Photography Pricing Calculator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'session_type', type: 'enum', required: true, prefillable: false }, { name: 'hours', type: 'number', required: true, prefillable: false }, { name: 'deliverables', type: 'array', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  video_bitrate: { uiType: 'video_bitrate', name: 'Video Bitrate Calculator', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'resolution', type: 'enum', required: true, prefillable: false }, { name: 'fps', type: 'number', required: true, prefillable: false }, { name: 'codec', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  lens_equivalent: { uiType: 'lens_equivalent', name: 'Lens Equivalent Calculator', category: UI_CATEGORIES.CRAFTS, fields: [{ name: 'focal_length', type: 'number', required: true, prefillable: false }, { name: 'sensor_size', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },

  // ============================================
  // FASHION & STYLE
  // ============================================
  shoe_size_converter: { uiType: 'shoe_size_converter', name: 'Shoe Size Converter', category: UI_CATEGORIES.BEAUTY, fields: [{ name: 'size', type: 'number', required: true, prefillable: false }, { name: 'from_system', type: 'enum', required: true, prefillable: false }, { name: 'to_system', type: 'enum', required: true, prefillable: false }, { name: 'gender', type: 'enum', required: true, prefillable: true, onboardingField: 'gender' }], onboardingMapping: { gender: 'gender' }, entityMapping: {}, defaults: {} },
  clothing_size_converter: { uiType: 'clothing_size_converter', name: 'Clothing Size Converter', category: UI_CATEGORIES.BEAUTY, fields: [{ name: 'size', type: 'string', required: true, prefillable: false }, { name: 'from_country', type: 'enum', required: true, prefillable: false }, { name: 'to_country', type: 'enum', required: true, prefillable: true, onboardingField: 'country' }], onboardingMapping: { to_country: 'country' }, entityMapping: {}, defaults: {} },
  hat_size_calculator: { uiType: 'hat_size_calculator', name: 'Hat Size Calculator', category: UI_CATEGORIES.BEAUTY, fields: [{ name: 'head_circumference', type: 'number', required: true, prefillable: false }, { name: 'measurement_system', type: 'enum', required: false, prefillable: true, onboardingField: 'measurement_system' }], onboardingMapping: { measurement_system: 'measurement_system' }, entityMapping: {}, defaults: {} },
  glove_size_calculator: { uiType: 'glove_size_calculator', name: 'Glove Size Calculator', category: UI_CATEGORIES.BEAUTY, fields: [{ name: 'hand_circumference', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  belt_size_calculator: { uiType: 'belt_size_calculator', name: 'Belt Size Calculator', category: UI_CATEGORIES.BEAUTY, fields: [{ name: 'waist_measurement', type: 'number', required: true, prefillable: false }, { name: 'pant_size', type: 'number', required: false, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  fabric_yardage: { uiType: 'fabric_yardage', name: 'Fabric Yardage Calculator', category: UI_CATEGORIES.CRAFTS, fields: [{ name: 'pattern_type', type: 'enum', required: true, prefillable: false }, { name: 'size', type: 'enum', required: true, prefillable: false }, { name: 'fabric_width', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  color_palette_generator: { uiType: 'color_palette_generator', name: 'Color Palette Generator', category: UI_CATEGORIES.BEAUTY, fields: [{ name: 'base_color', type: 'string', required: true, prefillable: false }, { name: 'palette_type', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  skin_tone_analyzer: { uiType: 'skin_tone_analyzer', name: 'Skin Tone Color Matcher', category: UI_CATEGORIES.BEAUTY, fields: [{ name: 'undertone', type: 'enum', required: true, prefillable: false }, { name: 'season', type: 'enum', required: false, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  watch_band_size: { uiType: 'watch_band_size', name: 'Watch Band Size Calculator', category: UI_CATEGORIES.BEAUTY, fields: [{ name: 'wrist_circumference', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  necklace_length: { uiType: 'necklace_length', name: 'Necklace Length Guide', category: UI_CATEGORIES.BEAUTY, fields: [{ name: 'neck_circumference', type: 'number', required: true, prefillable: false }, { name: 'style', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },

  // ============================================
  // WEDDING PLANNING
  // ============================================
  wedding_guest_list: { uiType: 'wedding_guest_list', name: 'Wedding Guest List Manager', category: UI_CATEGORIES.EVENTS, fields: [{ name: 'max_guests', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  wedding_seating_chart: { uiType: 'wedding_seating_chart', name: 'Wedding Seating Chart', category: UI_CATEGORIES.EVENTS, fields: [{ name: 'table_count', type: 'number', required: true, prefillable: false }, { name: 'seats_per_table', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  wedding_timeline: { uiType: 'wedding_timeline', name: 'Wedding Day Timeline', category: UI_CATEGORIES.EVENTS, fields: [{ name: 'ceremony_time', type: 'string', required: true, prefillable: false }, { name: 'reception_start', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  wedding_alcohol_calculator: { uiType: 'wedding_alcohol_calculator', name: 'Wedding Alcohol Calculator', category: UI_CATEGORIES.EVENTS, fields: [{ name: 'guest_count', type: 'number', required: true, prefillable: false }, { name: 'hours', type: 'number', required: true, prefillable: false }, { name: 'drink_preference', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  wedding_food_calculator: { uiType: 'wedding_food_calculator', name: 'Wedding Food Calculator', category: UI_CATEGORIES.EVENTS, fields: [{ name: 'guest_count', type: 'number', required: true, prefillable: false }, { name: 'meal_type', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  wedding_cake_size: { uiType: 'wedding_cake_size', name: 'Wedding Cake Size Calculator', category: UI_CATEGORIES.EVENTS, fields: [{ name: 'guest_count', type: 'number', required: true, prefillable: false }, { name: 'serving_size', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  wedding_flower_budget: { uiType: 'wedding_flower_budget', name: 'Wedding Flower Budget', category: UI_CATEGORIES.EVENTS, fields: [{ name: 'flower_budget', type: 'number', required: true, prefillable: false }, { name: 'arrangements_needed', type: 'array', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  wedding_invitation_count: { uiType: 'wedding_invitation_count', name: 'Wedding Invitation Calculator', category: UI_CATEGORIES.EVENTS, fields: [{ name: 'guest_count', type: 'number', required: true, prefillable: false }, { name: 'couples_count', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  wedding_photo_album: { uiType: 'wedding_photo_album', name: 'Wedding Photo Album Planner', category: UI_CATEGORIES.EVENTS, fields: [{ name: 'photo_count', type: 'number', required: true, prefillable: false }, { name: 'album_size', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  honeymoon_budget: { uiType: 'honeymoon_budget', name: 'Honeymoon Budget Calculator', category: UI_CATEGORIES.TRAVEL, fields: [{ name: 'destination', type: 'string', required: true, prefillable: false }, { name: 'duration_days', type: 'number', required: true, prefillable: false }, { name: 'currency', type: 'enum', required: false, prefillable: true, onboardingField: 'preferred_currency' }], onboardingMapping: { currency: 'preferred_currency' }, entityMapping: { destination: [EntityType.LOCATION] }, defaults: {} },
  wedding_vendor_tip: { uiType: 'wedding_vendor_tip', name: 'Wedding Vendor Tip Calculator', category: UI_CATEGORIES.EVENTS, fields: [{ name: 'vendor_type', type: 'enum', required: true, prefillable: false }, { name: 'service_cost', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },

  // ============================================
  // AGRICULTURE & FARMING
  // ============================================
  crop_yield_calculator: { uiType: 'crop_yield_calculator', name: 'Crop Yield Calculator', category: UI_CATEGORIES.HOME, fields: [{ name: 'crop_type', type: 'enum', required: true, prefillable: false }, { name: 'area', type: 'number', required: true, prefillable: false }, { name: 'area_unit', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  seed_spacing_calculator: { uiType: 'seed_spacing_calculator', name: 'Seed Spacing Calculator', category: UI_CATEGORIES.HOME, fields: [{ name: 'plant_type', type: 'enum', required: true, prefillable: false }, { name: 'row_length', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  fertilizer_calculator: { uiType: 'fertilizer_calculator', name: 'Fertilizer Calculator', category: UI_CATEGORIES.HOME, fields: [{ name: 'area', type: 'number', required: true, prefillable: false }, { name: 'crop_type', type: 'enum', required: true, prefillable: false }, { name: 'soil_type', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  irrigation_calculator: { uiType: 'irrigation_calculator', name: 'Irrigation Calculator', category: UI_CATEGORIES.HOME, fields: [{ name: 'area', type: 'number', required: true, prefillable: false }, { name: 'crop_type', type: 'enum', required: true, prefillable: false }, { name: 'climate', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  livestock_feed_calculator: { uiType: 'livestock_feed_calculator', name: 'Livestock Feed Calculator', category: UI_CATEGORIES.PETS, fields: [{ name: 'animal_type', type: 'enum', required: true, prefillable: false }, { name: 'animal_count', type: 'number', required: true, prefillable: false }, { name: 'weight_per_animal', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  hay_bale_calculator: { uiType: 'hay_bale_calculator', name: 'Hay Bale Calculator', category: UI_CATEGORIES.PETS, fields: [{ name: 'animal_count', type: 'number', required: true, prefillable: false }, { name: 'animal_type', type: 'enum', required: true, prefillable: false }, { name: 'days', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  planting_date_calculator: { uiType: 'planting_date_calculator', name: 'Planting Date Calculator', category: UI_CATEGORIES.HOME, fields: [{ name: 'plant_type', type: 'enum', required: true, prefillable: false }, { name: 'location', type: 'string', required: true, prefillable: true, onboardingField: 'city' }], onboardingMapping: { location: 'city' }, entityMapping: { location: [EntityType.LOCATION] }, defaults: {} },
  harvest_date_calculator: { uiType: 'harvest_date_calculator', name: 'Harvest Date Calculator', category: UI_CATEGORIES.HOME, fields: [{ name: 'crop_type', type: 'enum', required: true, prefillable: false }, { name: 'planting_date', type: 'date', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  chicken_coop_size: { uiType: 'chicken_coop_size', name: 'Chicken Coop Size Calculator', category: UI_CATEGORIES.PETS, fields: [{ name: 'chicken_count', type: 'number', required: true, prefillable: false }, { name: 'breed_size', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  egg_production_calculator: { uiType: 'egg_production_calculator', name: 'Egg Production Calculator', category: UI_CATEGORIES.PETS, fields: [{ name: 'hen_count', type: 'number', required: true, prefillable: false }, { name: 'laying_rate', type: 'number', required: false, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: { laying_rate: 0.8 } },
  pasture_rotation: { uiType: 'pasture_rotation', name: 'Pasture Rotation Calculator', category: UI_CATEGORIES.PETS, fields: [{ name: 'total_acres', type: 'number', required: true, prefillable: false }, { name: 'animal_count', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  farm_profit_calculator: { uiType: 'farm_profit_calculator', name: 'Farm Profit Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'revenue', type: 'number', required: true, prefillable: false }, { name: 'costs', type: 'number', required: true, prefillable: false }, { name: 'currency', type: 'enum', required: false, prefillable: true, onboardingField: 'preferred_currency' }], onboardingMapping: { currency: 'preferred_currency' }, entityMapping: {}, defaults: {} },

  // ============================================
  // CONSTRUCTION & BUILDING
  // ============================================
  rebar_calculator: { uiType: 'rebar_calculator', name: 'Rebar Calculator', category: UI_CATEGORIES.HOME, fields: [{ name: 'slab_length', type: 'number', required: true, prefillable: false }, { name: 'slab_width', type: 'number', required: true, prefillable: false }, { name: 'spacing', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  beam_load_calculator: { uiType: 'beam_load_calculator', name: 'Beam Load Calculator', category: UI_CATEGORIES.HOME, fields: [{ name: 'span', type: 'number', required: true, prefillable: false }, { name: 'load_type', type: 'enum', required: true, prefillable: false }, { name: 'load_weight', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  foundation_calculator: { uiType: 'foundation_calculator', name: 'Foundation Calculator', category: UI_CATEGORIES.HOME, fields: [{ name: 'building_length', type: 'number', required: true, prefillable: false }, { name: 'building_width', type: 'number', required: true, prefillable: false }, { name: 'foundation_type', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  window_glass_calculator: { uiType: 'window_glass_calculator', name: 'Window Glass Calculator', category: UI_CATEGORIES.HOME, fields: [{ name: 'window_width', type: 'number', required: true, prefillable: false }, { name: 'window_height', type: 'number', required: true, prefillable: false }, { name: 'glass_type', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  decking_calculator: { uiType: 'decking_calculator', name: 'Decking Calculator', category: UI_CATEGORIES.HOME, fields: [{ name: 'deck_length', type: 'number', required: true, prefillable: false }, { name: 'deck_width', type: 'number', required: true, prefillable: false }, { name: 'board_width', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  plumbing_pipe_calculator: { uiType: 'plumbing_pipe_calculator', name: 'Plumbing Pipe Calculator', category: UI_CATEGORIES.HOME, fields: [{ name: 'pipe_length', type: 'number', required: true, prefillable: false }, { name: 'pipe_diameter', type: 'number', required: true, prefillable: false }, { name: 'fittings_count', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  electrical_wire_calculator: { uiType: 'electrical_wire_calculator', name: 'Electrical Wire Calculator', category: UI_CATEGORIES.HOME, fields: [{ name: 'circuit_length', type: 'number', required: true, prefillable: false }, { name: 'amperage', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },

  // ============================================
  // GAMING & ESPORTS
  // ============================================
  gaming_pc_builder: { uiType: 'gaming_pc_builder', name: 'Gaming PC Builder', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'budget', type: 'number', required: true, prefillable: false }, { name: 'use_case', type: 'enum', required: true, prefillable: false }, { name: 'currency', type: 'enum', required: false, prefillable: true, onboardingField: 'preferred_currency' }], onboardingMapping: { currency: 'preferred_currency' }, entityMapping: { currency: [EntityType.CURRENCY] }, defaults: {} },
  fps_calculator: { uiType: 'fps_calculator', name: 'FPS Calculator', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'gpu', type: 'enum', required: true, prefillable: false }, { name: 'cpu', type: 'enum', required: true, prefillable: false }, { name: 'resolution', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  game_download_time: { uiType: 'game_download_time', name: 'Game Download Time Calculator', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'file_size_gb', type: 'number', required: true, prefillable: false }, { name: 'internet_speed_mbps', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  esports_prize_calculator: { uiType: 'esports_prize_calculator', name: 'Esports Prize Split Calculator', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'total_prize', type: 'number', required: true, prefillable: false }, { name: 'team_members', type: 'number', required: true, prefillable: false }, { name: 'org_cut', type: 'number', required: false, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: { org_cut: 20 } },
  dps_calculator: { uiType: 'dps_calculator', name: 'DPS Calculator', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'damage', type: 'number', required: true, prefillable: false }, { name: 'attack_speed', type: 'number', required: true, prefillable: false }, { name: 'crit_rate', type: 'number', required: false, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: { crit_rate: 0 } },
  gaming_chair_height: { uiType: 'gaming_chair_height', name: 'Gaming Chair Height Calculator', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'user_height', type: 'number', required: true, prefillable: true, onboardingField: 'height_cm' }, { name: 'desk_height', type: 'number', required: true, prefillable: false }], onboardingMapping: { user_height: 'height_cm' }, entityMapping: {}, defaults: {} },
  monitor_distance: { uiType: 'monitor_distance', name: 'Monitor Distance Calculator', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'screen_size', type: 'number', required: true, prefillable: false }, { name: 'resolution', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  game_trade_value: { uiType: 'game_trade_value', name: 'Game Trade Value Estimator', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'game_title', type: 'string', required: true, prefillable: false }, { name: 'condition', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  streaming_bitrate: { uiType: 'streaming_bitrate', name: 'Streaming Bitrate Calculator', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'resolution', type: 'enum', required: true, prefillable: false }, { name: 'fps', type: 'number', required: true, prefillable: false }, { name: 'platform', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  gaming_electricity_cost: { uiType: 'gaming_electricity_cost', name: 'Gaming Electricity Cost', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'pc_wattage', type: 'number', required: true, prefillable: false }, { name: 'hours_per_day', type: 'number', required: true, prefillable: false }, { name: 'electricity_rate', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },

  // ============================================
  // CRYPTOCURRENCY & BLOCKCHAIN
  // ============================================
  crypto_profit_calculator: { uiType: 'crypto_profit_calculator', name: 'Crypto Profit Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'buy_price', type: 'number', required: true, prefillable: false }, { name: 'sell_price', type: 'number', required: true, prefillable: false }, { name: 'amount', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  crypto_mining_calculator: { uiType: 'crypto_mining_calculator', name: 'Crypto Mining Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'hash_rate', type: 'number', required: true, prefillable: false }, { name: 'power_consumption', type: 'number', required: true, prefillable: false }, { name: 'electricity_cost', type: 'number', required: true, prefillable: false }, { name: 'coin', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  gas_fee_calculator: { uiType: 'gas_fee_calculator', name: 'Ethereum Gas Fee Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'gas_limit', type: 'number', required: true, prefillable: false }, { name: 'gas_price', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  staking_rewards: { uiType: 'staking_rewards', name: 'Staking Rewards Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'amount_staked', type: 'number', required: true, prefillable: false }, { name: 'apy', type: 'number', required: true, prefillable: false }, { name: 'duration_days', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  defi_yield_calculator: { uiType: 'defi_yield_calculator', name: 'DeFi Yield Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'principal', type: 'number', required: true, prefillable: false }, { name: 'apy', type: 'number', required: true, prefillable: false }, { name: 'compound_frequency', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  nft_rarity_calculator: { uiType: 'nft_rarity_calculator', name: 'NFT Rarity Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'traits', type: 'array', required: true, prefillable: false }, { name: 'collection_size', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  impermanent_loss: { uiType: 'impermanent_loss', name: 'Impermanent Loss Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'initial_price_ratio', type: 'number', required: true, prefillable: false }, { name: 'final_price_ratio', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  crypto_tax_calculator: { uiType: 'crypto_tax_calculator', name: 'Crypto Tax Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'gains', type: 'number', required: true, prefillable: false }, { name: 'holding_period', type: 'enum', required: true, prefillable: false }, { name: 'country', type: 'enum', required: true, prefillable: true, onboardingField: 'country' }], onboardingMapping: { country: 'country' }, entityMapping: {}, defaults: {} },
  token_unlock_schedule: { uiType: 'token_unlock_schedule', name: 'Token Unlock Schedule', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'total_tokens', type: 'number', required: true, prefillable: false }, { name: 'vesting_months', type: 'number', required: true, prefillable: false }, { name: 'cliff_months', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  bitcoin_halving_countdown: { uiType: 'bitcoin_halving_countdown', name: 'Bitcoin Halving Countdown', category: UI_CATEGORIES.FINANCE, fields: [], onboardingMapping: {}, entityMapping: {}, defaults: {} },

  // ============================================
  // HR & EMPLOYMENT
  // ============================================
  salary_to_hourly: { uiType: 'salary_to_hourly', name: 'Salary to Hourly Converter', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'annual_salary', type: 'number', required: true, prefillable: false }, { name: 'hours_per_week', type: 'number', required: false, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: { hours_per_week: 40 } },
  overtime_calculator: { uiType: 'overtime_calculator', name: 'Overtime Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'hourly_rate', type: 'number', required: true, prefillable: false }, { name: 'regular_hours', type: 'number', required: true, prefillable: false }, { name: 'overtime_hours', type: 'number', required: true, prefillable: false }, { name: 'overtime_multiplier', type: 'number', required: false, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: { overtime_multiplier: 1.5 } },
  pto_accrual_calculator: { uiType: 'pto_accrual_calculator', name: 'PTO Accrual Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'annual_pto_days', type: 'number', required: true, prefillable: false }, { name: 'accrual_frequency', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  severance_calculator: { uiType: 'severance_calculator', name: 'Severance Pay Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'years_employed', type: 'number', required: true, prefillable: false }, { name: 'salary', type: 'number', required: true, prefillable: false }, { name: 'severance_formula', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  unemployment_benefit: { uiType: 'unemployment_benefit', name: 'Unemployment Benefit Estimator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'previous_salary', type: 'number', required: true, prefillable: false }, { name: 'state', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  employee_cost_calculator: { uiType: 'employee_cost_calculator', name: 'True Employee Cost Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'base_salary', type: 'number', required: true, prefillable: false }, { name: 'benefits_percentage', type: 'number', required: false, prefillable: false }, { name: 'country', type: 'enum', required: true, prefillable: true, onboardingField: 'country' }], onboardingMapping: { country: 'country' }, entityMapping: {}, defaults: { benefits_percentage: 30 } },
  raise_calculator: { uiType: 'raise_calculator', name: 'Raise Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'current_salary', type: 'number', required: true, prefillable: false }, { name: 'raise_percentage', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  commission_calculator: { uiType: 'commission_calculator', name: 'Commission Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'sales_amount', type: 'number', required: true, prefillable: false }, { name: 'commission_rate', type: 'number', required: true, prefillable: false }, { name: 'tiers', type: 'array', required: false, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  bonus_calculator: { uiType: 'bonus_calculator', name: 'Bonus Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'base_salary', type: 'number', required: true, prefillable: false }, { name: 'bonus_percentage', type: 'number', required: true, prefillable: false }, { name: 'performance_multiplier', type: 'number', required: false, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: { performance_multiplier: 1 } },
  payroll_tax_calculator: { uiType: 'payroll_tax_calculator', name: 'Payroll Tax Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'gross_salary', type: 'number', required: true, prefillable: false }, { name: 'country', type: 'enum', required: true, prefillable: true, onboardingField: 'country' }], onboardingMapping: { country: 'country' }, entityMapping: {}, defaults: {} },
  work_hours_calculator: { uiType: 'work_hours_calculator', name: 'Work Hours Calculator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'start_time', type: 'string', required: true, prefillable: false }, { name: 'end_time', type: 'string', required: true, prefillable: false }, { name: 'break_minutes', type: 'number', required: false, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: { break_minutes: 60 } },
  timesheet_calculator: { uiType: 'timesheet_calculator', name: 'Timesheet Calculator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'entries', type: 'array', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },

  // ============================================
  // STATISTICS & DATA
  // ============================================
  data_visualizer: {
    uiType: 'data_visualizer',
    name: 'Data Visualizer',
    description: 'Create charts and visualizations from CSV data. Supports bar, line, pie, and doughnut charts.',
    category: UI_CATEGORIES.PROFESSIONAL,
    fields: [
      { name: 'dataInput', type: 'string', required: true, prefillable: true },
      { name: 'chartType', type: 'enum', required: false, prefillable: true },
      { name: 'chartTitle', type: 'string', required: false, prefillable: true },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: { chartType: 'bar' },
    intentPatterns: ['create chart', 'visualize data', 'make graph', 'plot data', 'create visualization', 'csv to chart', 'spreadsheet chart'],
    primaryAction: 'visualize',
  },
  chart_builder: {
    uiType: 'chart_builder',
    name: 'Chart Builder',
    description: 'Build custom charts from data. Create bar, line, pie charts from CSV or spreadsheet data.',
    category: UI_CATEGORIES.PROFESSIONAL,
    fields: [
      { name: 'dataInput', type: 'string', required: true, prefillable: true },
      { name: 'chartType', type: 'enum', required: false, prefillable: true },
      { name: 'chartTitle', type: 'string', required: false, prefillable: true },
    ],
    onboardingMapping: {},
    entityMapping: {},
    defaults: { chartType: 'bar' },
    intentPatterns: ['build chart', 'create graph', 'data chart'],
    primaryAction: 'build',
  },
  mean_calculator: { uiType: 'mean_calculator', name: 'Mean Calculator', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'numbers', type: 'array', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  median_calculator: { uiType: 'median_calculator', name: 'Median Calculator', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'numbers', type: 'array', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  mode_calculator: { uiType: 'mode_calculator', name: 'Mode Calculator', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'numbers', type: 'array', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  standard_deviation: { uiType: 'standard_deviation', name: 'Standard Deviation Calculator', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'numbers', type: 'array', required: true, prefillable: false }, { name: 'sample', type: 'boolean', required: false, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: { sample: true } },
  variance_calculator: { uiType: 'variance_calculator', name: 'Variance Calculator', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'numbers', type: 'array', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  percentile_calculator: { uiType: 'percentile_calculator', name: 'Percentile Calculator', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'numbers', type: 'array', required: true, prefillable: false }, { name: 'percentile', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  z_score_calculator: { uiType: 'z_score_calculator', name: 'Z-Score Calculator', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'value', type: 'number', required: true, prefillable: false }, { name: 'mean', type: 'number', required: true, prefillable: false }, { name: 'std_dev', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  correlation_calculator: { uiType: 'correlation_calculator', name: 'Correlation Calculator', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'x_values', type: 'array', required: true, prefillable: false }, { name: 'y_values', type: 'array', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  regression_calculator: { uiType: 'regression_calculator', name: 'Linear Regression Calculator', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'x_values', type: 'array', required: true, prefillable: false }, { name: 'y_values', type: 'array', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  binomial_calculator: { uiType: 'binomial_calculator', name: 'Binomial Distribution Calculator', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'trials', type: 'number', required: true, prefillable: false }, { name: 'probability', type: 'number', required: true, prefillable: false }, { name: 'successes', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  sample_size_calculator: { uiType: 'sample_size_calculator', name: 'Sample Size Calculator', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'confidence_level', type: 'number', required: true, prefillable: false }, { name: 'margin_of_error', type: 'number', required: true, prefillable: false }, { name: 'population_size', type: 'number', required: false, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  confidence_interval: { uiType: 'confidence_interval', name: 'Confidence Interval Calculator', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'sample_mean', type: 'number', required: true, prefillable: false }, { name: 'std_dev', type: 'number', required: true, prefillable: false }, { name: 'sample_size', type: 'number', required: true, prefillable: false }, { name: 'confidence_level', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },

  // ============================================
  // MARKETING & ADVERTISING
  // ============================================
  cpm_calculator: { uiType: 'cpm_calculator', name: 'CPM Calculator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'total_cost', type: 'number', required: true, prefillable: false }, { name: 'impressions', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  cpc_calculator: { uiType: 'cpc_calculator', name: 'CPC Calculator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'total_cost', type: 'number', required: true, prefillable: false }, { name: 'clicks', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  ctr_calculator: { uiType: 'ctr_calculator', name: 'CTR Calculator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'clicks', type: 'number', required: true, prefillable: false }, { name: 'impressions', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  roas_calculator: { uiType: 'roas_calculator', name: 'ROAS Calculator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'revenue', type: 'number', required: true, prefillable: false }, { name: 'ad_spend', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  customer_acquisition_cost: { uiType: 'customer_acquisition_cost', name: 'Customer Acquisition Cost', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'marketing_spend', type: 'number', required: true, prefillable: false }, { name: 'customers_acquired', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  ltv_calculator: { uiType: 'ltv_calculator', name: 'Customer Lifetime Value Calculator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'avg_purchase_value', type: 'number', required: true, prefillable: false }, { name: 'purchase_frequency', type: 'number', required: true, prefillable: false }, { name: 'customer_lifespan', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  churn_rate_calculator: { uiType: 'churn_rate_calculator', name: 'Churn Rate Calculator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'customers_lost', type: 'number', required: true, prefillable: false }, { name: 'customers_start', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  conversion_rate: { uiType: 'conversion_rate', name: 'Conversion Rate Calculator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'conversions', type: 'number', required: true, prefillable: false }, { name: 'total_visitors', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  email_open_rate: { uiType: 'email_open_rate', name: 'Email Open Rate Calculator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'emails_opened', type: 'number', required: true, prefillable: false }, { name: 'emails_delivered', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  social_engagement_rate: { uiType: 'social_engagement_rate', name: 'Social Engagement Rate', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'engagements', type: 'number', required: true, prefillable: false }, { name: 'followers', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  ad_budget_allocator: { uiType: 'ad_budget_allocator', name: 'Ad Budget Allocator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'total_budget', type: 'number', required: true, prefillable: false }, { name: 'channels', type: 'array', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  influencer_rate_calculator: { uiType: 'influencer_rate_calculator', name: 'Influencer Rate Calculator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'followers', type: 'number', required: true, prefillable: false }, { name: 'engagement_rate', type: 'number', required: true, prefillable: false }, { name: 'platform', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },

  // ============================================
  // PRINTING & PUBLISHING
  // ============================================
  book_spine_calculator: { uiType: 'book_spine_calculator', name: 'Book Spine Width Calculator', category: UI_CATEGORIES.CRAFTS, fields: [{ name: 'page_count', type: 'number', required: true, prefillable: false }, { name: 'paper_weight', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  printing_cost_calculator: { uiType: 'printing_cost_calculator', name: 'Printing Cost Calculator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'page_count', type: 'number', required: true, prefillable: false }, { name: 'copies', type: 'number', required: true, prefillable: false }, { name: 'color', type: 'boolean', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  word_count_calculator: { uiType: 'word_count_calculator', name: 'Word Count Calculator', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'text', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  reading_time: { uiType: 'reading_time', name: 'Reading Time Estimator', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'word_count', type: 'number', required: true, prefillable: false }, { name: 'reading_speed', type: 'number', required: false, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: { reading_speed: 250 } },
  book_royalty_calculator: { uiType: 'book_royalty_calculator', name: 'Book Royalty Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'book_price', type: 'number', required: true, prefillable: false }, { name: 'royalty_rate', type: 'number', required: true, prefillable: false }, { name: 'copies_sold', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  isbn_validator: { uiType: 'isbn_validator', name: 'ISBN Validator', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'isbn', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  page_to_word: { uiType: 'page_to_word', name: 'Page to Word Count Converter', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'page_count', type: 'number', required: true, prefillable: false }, { name: 'font_size', type: 'enum', required: true, prefillable: false }, { name: 'spacing', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  manuscript_format: { uiType: 'manuscript_format', name: 'Manuscript Format Calculator', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'word_count', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },

  // ============================================
  // WEATHER & CLIMATE
  // ============================================
  uv_index_exposure: { uiType: 'uv_index_exposure', name: 'UV Exposure Time Calculator', category: UI_CATEGORIES.WEATHER, fields: [{ name: 'uv_index', type: 'number', required: true, prefillable: false }, { name: 'skin_type', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  frost_date_calculator: { uiType: 'frost_date_calculator', name: 'Frost Date Calculator', category: UI_CATEGORIES.WEATHER, fields: [{ name: 'location', type: 'string', required: true, prefillable: true, onboardingField: 'city' }], onboardingMapping: { location: 'city' }, entityMapping: { location: [EntityType.LOCATION] }, defaults: {} },
  growing_zone_finder: { uiType: 'growing_zone_finder', name: 'Plant Hardiness Zone Finder', category: UI_CATEGORIES.HOME, fields: [{ name: 'zip_code', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  rainfall_calculator: { uiType: 'rainfall_calculator', name: 'Rainfall Collection Calculator', category: UI_CATEGORIES.HOME, fields: [{ name: 'roof_area', type: 'number', required: true, prefillable: false }, { name: 'rainfall_inches', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  snow_load_calculator: { uiType: 'snow_load_calculator', name: 'Snow Load Calculator', category: UI_CATEGORIES.HOME, fields: [{ name: 'snow_depth', type: 'number', required: true, prefillable: false }, { name: 'snow_density', type: 'enum', required: true, prefillable: false }, { name: 'roof_area', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },

  // ============================================
  // MUSIC & AUDIO (Extended)
  // ============================================
  chord_transposer: { uiType: 'chord_transposer', name: 'Chord Transposer', category: UI_CATEGORIES.MUSIC, fields: [{ name: 'original_key', type: 'enum', required: true, prefillable: false }, { name: 'target_key', type: 'enum', required: true, prefillable: false }, { name: 'chords', type: 'array', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  metronome_converter: { uiType: 'metronome_converter', name: 'Metronome BPM Converter', category: UI_CATEGORIES.MUSIC, fields: [{ name: 'bpm', type: 'number', required: true, prefillable: false }, { name: 'tempo_marking', type: 'enum', required: false, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  frequency_to_note: { uiType: 'frequency_to_note', name: 'Frequency to Note Converter', category: UI_CATEGORIES.MUSIC, fields: [{ name: 'frequency', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  audio_file_size: { uiType: 'audio_file_size', name: 'Audio File Size Calculator', category: UI_CATEGORIES.MUSIC, fields: [{ name: 'duration_seconds', type: 'number', required: true, prefillable: false }, { name: 'bitrate', type: 'number', required: true, prefillable: false }, { name: 'format', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  delay_time_calculator: { uiType: 'delay_time_calculator', name: 'Delay Time Calculator', category: UI_CATEGORIES.MUSIC, fields: [{ name: 'bpm', type: 'number', required: true, prefillable: false }, { name: 'note_value', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  reverb_time_calculator: { uiType: 'reverb_time_calculator', name: 'Reverb Time Calculator', category: UI_CATEGORIES.MUSIC, fields: [{ name: 'room_volume', type: 'number', required: true, prefillable: false }, { name: 'surface_area', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  vinyl_weight_calculator: { uiType: 'vinyl_weight_calculator', name: 'Vinyl Record Weight Calculator', category: UI_CATEGORIES.MUSIC, fields: [{ name: 'record_size', type: 'enum', required: true, prefillable: false }, { name: 'weight_grams', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  guitar_string_gauge: { uiType: 'guitar_string_gauge', name: 'Guitar String Gauge Calculator', category: UI_CATEGORIES.MUSIC, fields: [{ name: 'tuning', type: 'enum', required: true, prefillable: false }, { name: 'scale_length', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },

  // ============================================
  // ASTRONOMY & SPACE
  // ============================================
  planetary_weight: { uiType: 'planetary_weight', name: 'Weight on Other Planets', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'earth_weight', type: 'number', required: true, prefillable: true, onboardingField: 'weight_kg' }, { name: 'planet', type: 'enum', required: true, prefillable: false }], onboardingMapping: { earth_weight: 'weight_kg' }, entityMapping: {}, defaults: {} },
  moon_phase_calculator: { uiType: 'moon_phase_calculator', name: 'Moon Phase Calculator', category: UI_CATEGORIES.ASTROLOGY, fields: [{ name: 'date', type: 'date', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  sunrise_sunset: { uiType: 'sunrise_sunset', name: 'Sunrise/Sunset Calculator', category: UI_CATEGORIES.WEATHER, fields: [{ name: 'location', type: 'string', required: true, prefillable: true, onboardingField: 'city' }, { name: 'date', type: 'date', required: true, prefillable: false }], onboardingMapping: { location: 'city' }, entityMapping: { location: [EntityType.LOCATION] }, defaults: {} },
  light_year_converter: { uiType: 'light_year_converter', name: 'Light Year Distance Converter', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'distance', type: 'number', required: true, prefillable: false }, { name: 'from_unit', type: 'enum', required: true, prefillable: false }, { name: 'to_unit', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  telescope_magnification: { uiType: 'telescope_magnification', name: 'Telescope Magnification Calculator', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'focal_length_telescope', type: 'number', required: true, prefillable: false }, { name: 'focal_length_eyepiece', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  star_visibility: { uiType: 'star_visibility', name: 'Star Visibility Calculator', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'location', type: 'string', required: true, prefillable: true, onboardingField: 'city' }, { name: 'date', type: 'date', required: true, prefillable: false }], onboardingMapping: { location: 'city' }, entityMapping: { location: [EntityType.LOCATION] }, defaults: {} },
  satellite_pass_predictor: { uiType: 'satellite_pass_predictor', name: 'ISS Pass Predictor', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'location', type: 'string', required: true, prefillable: true, onboardingField: 'city' }], onboardingMapping: { location: 'city' }, entityMapping: { location: [EntityType.LOCATION] }, defaults: {} },
  meteor_shower_calendar: { uiType: 'meteor_shower_calendar', name: 'Meteor Shower Calendar', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'year', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },

  // ============================================
  // SPORTS & RECREATION (Extended)
  // ============================================
  golf_handicap: { uiType: 'golf_handicap', name: 'Golf Handicap Calculator', category: UI_CATEGORIES.SPORTS, fields: [{ name: 'scores', type: 'array', required: true, prefillable: false }, { name: 'course_ratings', type: 'array', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  bowling_score: { uiType: 'bowling_score', name: 'Bowling Score Calculator', category: UI_CATEGORIES.SPORTS, fields: [{ name: 'frames', type: 'array', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  tennis_match_probability: { uiType: 'tennis_match_probability', name: 'Tennis Match Probability', category: UI_CATEGORIES.SPORTS, fields: [{ name: 'player1_rating', type: 'number', required: true, prefillable: false }, { name: 'player2_rating', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  marathon_pace: { uiType: 'marathon_pace', name: 'Marathon Pace Calculator', category: UI_CATEGORIES.SPORTS, fields: [{ name: 'target_time', type: 'string', required: true, prefillable: false }, { name: 'distance', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  split_time_calculator: { uiType: 'split_time_calculator', name: 'Running Split Time Calculator', category: UI_CATEGORIES.SPORTS, fields: [{ name: 'total_distance', type: 'number', required: true, prefillable: false }, { name: 'target_time', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  swimming_pace: { uiType: 'swimming_pace', name: 'Swimming Pace Calculator', category: UI_CATEGORIES.SPORTS, fields: [{ name: 'distance', type: 'number', required: true, prefillable: false }, { name: 'time', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  cycling_power: { uiType: 'cycling_power', name: 'Cycling Power Calculator', category: UI_CATEGORIES.SPORTS, fields: [{ name: 'weight', type: 'number', required: true, prefillable: true, onboardingField: 'weight_kg' }, { name: 'gradient', type: 'number', required: true, prefillable: false }, { name: 'speed', type: 'number', required: true, prefillable: false }], onboardingMapping: { weight: 'weight_kg' }, entityMapping: {}, defaults: {} },
  ski_binding_din: { uiType: 'ski_binding_din', name: 'Ski Binding DIN Calculator', category: UI_CATEGORIES.SPORTS, fields: [{ name: 'weight', type: 'number', required: true, prefillable: true, onboardingField: 'weight_kg' }, { name: 'height', type: 'number', required: true, prefillable: true, onboardingField: 'height_cm' }, { name: 'skill_level', type: 'enum', required: true, prefillable: false }, { name: 'age', type: 'number', required: true, prefillable: false }], onboardingMapping: { weight: 'weight_kg', height: 'height_cm' }, entityMapping: {}, defaults: {} },
  archery_score: { uiType: 'archery_score', name: 'Archery Score Calculator', category: UI_CATEGORIES.SPORTS, fields: [{ name: 'arrows', type: 'array', required: true, prefillable: false }, { name: 'target_type', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  baseball_era: { uiType: 'baseball_era', name: 'Baseball ERA Calculator', category: UI_CATEGORIES.SPORTS, fields: [{ name: 'earned_runs', type: 'number', required: true, prefillable: false }, { name: 'innings_pitched', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  basketball_stats: { uiType: 'basketball_stats', name: 'Basketball Stats Calculator', category: UI_CATEGORIES.SPORTS, fields: [{ name: 'points', type: 'number', required: true, prefillable: false }, { name: 'rebounds', type: 'number', required: true, prefillable: false }, { name: 'assists', type: 'number', required: true, prefillable: false }, { name: 'games', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  soccer_stats: { uiType: 'soccer_stats', name: 'Soccer Stats Calculator', category: UI_CATEGORIES.SPORTS, fields: [{ name: 'goals', type: 'number', required: true, prefillable: false }, { name: 'assists', type: 'number', required: true, prefillable: false }, { name: 'matches', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  darts_checkout: { uiType: 'darts_checkout', name: 'Darts Checkout Calculator', category: UI_CATEGORIES.SPORTS, fields: [{ name: 'remaining_score', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  pool_table_angle: { uiType: 'pool_table_angle', name: 'Pool Shot Angle Calculator', category: UI_CATEGORIES.SPORTS, fields: [{ name: 'cue_position', type: 'object', required: true, prefillable: false }, { name: 'target_ball', type: 'object', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  fishing_moon_phase: { uiType: 'fishing_moon_phase', name: 'Best Fishing Times Calculator', category: UI_CATEGORIES.SPORTS, fields: [{ name: 'location', type: 'string', required: true, prefillable: true, onboardingField: 'city' }, { name: 'date', type: 'date', required: true, prefillable: false }], onboardingMapping: { location: 'city' }, entityMapping: { location: [EntityType.LOCATION] }, defaults: {} },
  hiking_calorie_burn: { uiType: 'hiking_calorie_burn', name: 'Hiking Calorie Calculator', category: UI_CATEGORIES.SPORTS, fields: [{ name: 'weight', type: 'number', required: true, prefillable: true, onboardingField: 'weight_kg' }, { name: 'distance', type: 'number', required: true, prefillable: false }, { name: 'elevation_gain', type: 'number', required: true, prefillable: false }, { name: 'pack_weight', type: 'number', required: false, prefillable: false }], onboardingMapping: { weight: 'weight_kg' }, entityMapping: {}, defaults: {} },
  rock_climbing_grade: { uiType: 'rock_climbing_grade', name: 'Climbing Grade Converter', category: UI_CATEGORIES.SPORTS, fields: [{ name: 'grade', type: 'string', required: true, prefillable: false }, { name: 'from_system', type: 'enum', required: true, prefillable: false }, { name: 'to_system', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  surfboard_size: { uiType: 'surfboard_size', name: 'Surfboard Size Calculator', category: UI_CATEGORIES.SPORTS, fields: [{ name: 'weight', type: 'number', required: true, prefillable: true, onboardingField: 'weight_kg' }, { name: 'skill_level', type: 'enum', required: true, prefillable: false }, { name: 'wave_type', type: 'enum', required: true, prefillable: false }], onboardingMapping: { weight: 'weight_kg' }, entityMapping: {}, defaults: {} },
  kayak_size: { uiType: 'kayak_size', name: 'Kayak Size Calculator', category: UI_CATEGORIES.SPORTS, fields: [{ name: 'weight', type: 'number', required: true, prefillable: true, onboardingField: 'weight_kg' }, { name: 'height', type: 'number', required: true, prefillable: true, onboardingField: 'height_cm' }, { name: 'kayak_type', type: 'enum', required: true, prefillable: false }], onboardingMapping: { weight: 'weight_kg', height: 'height_cm' }, entityMapping: {}, defaults: {} },
  ski_length: { uiType: 'ski_length', name: 'Ski Length Calculator', category: UI_CATEGORIES.SPORTS, fields: [{ name: 'height', type: 'number', required: true, prefillable: true, onboardingField: 'height_cm' }, { name: 'skill_level', type: 'enum', required: true, prefillable: false }, { name: 'ski_type', type: 'enum', required: true, prefillable: false }], onboardingMapping: { height: 'height_cm' }, entityMapping: {}, defaults: {} },
  snowboard_size: { uiType: 'snowboard_size', name: 'Snowboard Size Calculator', category: UI_CATEGORIES.SPORTS, fields: [{ name: 'weight', type: 'number', required: true, prefillable: true, onboardingField: 'weight_kg' }, { name: 'height', type: 'number', required: true, prefillable: true, onboardingField: 'height_cm' }, { name: 'riding_style', type: 'enum', required: true, prefillable: false }], onboardingMapping: { weight: 'weight_kg', height: 'height_cm' }, entityMapping: {}, defaults: {} },
  bike_frame_size: { uiType: 'bike_frame_size', name: 'Bike Frame Size Calculator', category: UI_CATEGORIES.SPORTS, fields: [{ name: 'height', type: 'number', required: true, prefillable: true, onboardingField: 'height_cm' }, { name: 'inseam', type: 'number', required: true, prefillable: false }, { name: 'bike_type', type: 'enum', required: true, prefillable: false }], onboardingMapping: { height: 'height_cm' }, entityMapping: {}, defaults: {} },
  tennis_racket_grip: { uiType: 'tennis_racket_grip', name: 'Tennis Racket Grip Size', category: UI_CATEGORIES.SPORTS, fields: [{ name: 'hand_size', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },

  // ============================================
  // BUSINESS & STARTUPS
  // ============================================
  startup_valuation: { uiType: 'startup_valuation', name: 'Startup Valuation Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'revenue', type: 'number', required: true, prefillable: false }, { name: 'growth_rate', type: 'number', required: true, prefillable: false }, { name: 'industry', type: 'enum', required: true, prefillable: true, onboardingField: 'industry' }], onboardingMapping: { industry: 'industry' }, entityMapping: { industry: [EntityType.INDUSTRY] }, defaults: {} },
  runway_calculator: { uiType: 'runway_calculator', name: 'Startup Runway Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'cash_balance', type: 'number', required: true, prefillable: false }, { name: 'monthly_burn', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  equity_dilution: { uiType: 'equity_dilution', name: 'Equity Dilution Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'current_shares', type: 'number', required: true, prefillable: false }, { name: 'new_shares', type: 'number', required: true, prefillable: false }, { name: 'pre_money_valuation', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  cap_table_calculator: { uiType: 'cap_table_calculator', name: 'Cap Table Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'shareholders', type: 'array', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  mrr_calculator: { uiType: 'mrr_calculator', name: 'MRR Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'subscriptions', type: 'array', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  arr_calculator: { uiType: 'arr_calculator', name: 'ARR Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'mrr', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  burn_rate_calculator: { uiType: 'burn_rate_calculator', name: 'Burn Rate Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'starting_cash', type: 'number', required: true, prefillable: false }, { name: 'ending_cash', type: 'number', required: true, prefillable: false }, { name: 'months', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  saas_metrics: { uiType: 'saas_metrics', name: 'SaaS Metrics Dashboard', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'mrr', type: 'number', required: true, prefillable: false }, { name: 'churn_rate', type: 'number', required: true, prefillable: false }, { name: 'cac', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  profit_margin: { uiType: 'profit_margin', name: 'Profit Margin Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'revenue', type: 'number', required: true, prefillable: false }, { name: 'costs', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  markup_calculator: { uiType: 'markup_calculator', name: 'Markup Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'cost', type: 'number', required: true, prefillable: false }, { name: 'selling_price', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  sales_tax_calculator: { uiType: 'sales_tax_calculator', name: 'Sales Tax Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'amount', type: 'number', required: true, prefillable: false }, { name: 'tax_rate', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  vat_calculator: { uiType: 'vat_calculator', name: 'VAT Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'amount', type: 'number', required: true, prefillable: false }, { name: 'vat_rate', type: 'number', required: true, prefillable: false }, { name: 'inclusive', type: 'boolean', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  gst_calculator: { uiType: 'gst_calculator', name: 'GST Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'amount', type: 'number', required: true, prefillable: false }, { name: 'gst_rate', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  quote_generator: { uiType: 'quote_generator', name: 'Quote Generator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'client_name', type: 'string', required: true, prefillable: false }, { name: 'services', type: 'array', required: true, prefillable: false }, { name: 'valid_days', type: 'number', required: false, prefillable: false }], onboardingMapping: {}, entityMapping: { client_name: [EntityType.PERSON_NAME, EntityType.COMPANY_NAME] }, defaults: { valid_days: 30 } },
  receipt_generator: { uiType: 'receipt_generator', name: 'Receipt Generator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'items', type: 'array', required: true, prefillable: false }, { name: 'payment_method', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },

  // ============================================
  // SENIORS & AGING
  // ============================================
  life_expectancy: { uiType: 'life_expectancy', name: 'Life Expectancy Calculator', category: UI_CATEGORIES.HEALTH, fields: [{ name: 'age', type: 'number', required: true, prefillable: false }, { name: 'gender', type: 'enum', required: true, prefillable: true, onboardingField: 'gender' }, { name: 'lifestyle_factors', type: 'array', required: true, prefillable: false }], onboardingMapping: { gender: 'gender' }, entityMapping: {}, defaults: {} },
  retirement_age: { uiType: 'retirement_age', name: 'Retirement Age Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'current_age', type: 'number', required: true, prefillable: false }, { name: 'savings', type: 'number', required: true, prefillable: false }, { name: 'monthly_contribution', type: 'number', required: true, prefillable: false }, { name: 'target_amount', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  social_security_estimate: { uiType: 'social_security_estimate', name: 'Social Security Estimator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'birth_year', type: 'number', required: true, prefillable: false }, { name: 'annual_income', type: 'number', required: true, prefillable: false }, { name: 'retirement_age', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  required_minimum_distribution: { uiType: 'required_minimum_distribution', name: 'RMD Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'account_balance', type: 'number', required: true, prefillable: false }, { name: 'age', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  pension_calculator: { uiType: 'pension_calculator', name: 'Pension Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'years_of_service', type: 'number', required: true, prefillable: false }, { name: 'average_salary', type: 'number', required: true, prefillable: false }, { name: 'pension_formula', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  medicare_eligibility: { uiType: 'medicare_eligibility', name: 'Medicare Eligibility Calculator', category: UI_CATEGORIES.HEALTH, fields: [{ name: 'birth_date', type: 'date', required: true, prefillable: true, onboardingField: 'date_of_birth' }], onboardingMapping: { birth_date: 'date_of_birth' }, entityMapping: {}, defaults: {} },
  estate_tax_calculator: { uiType: 'estate_tax_calculator', name: 'Estate Tax Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'estate_value', type: 'number', required: true, prefillable: false }, { name: 'state', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  inheritance_tax: { uiType: 'inheritance_tax', name: 'Inheritance Tax Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'inheritance_value', type: 'number', required: true, prefillable: false }, { name: 'relationship', type: 'enum', required: true, prefillable: false }, { name: 'state', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  care_cost_calculator: { uiType: 'care_cost_calculator', name: 'Long-Term Care Cost Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'care_type', type: 'enum', required: true, prefillable: false }, { name: 'location', type: 'string', required: true, prefillable: true, onboardingField: 'city' }], onboardingMapping: { location: 'city' }, entityMapping: { location: [EntityType.LOCATION] }, defaults: {} },
  medication_reminder: { uiType: 'medication_reminder', name: 'Medication Reminder Setup', category: UI_CATEGORIES.HEALTH, fields: [{ name: 'medications', type: 'array', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },

  // ============================================
  // OUTDOOR & ADVENTURE
  // ============================================
  trail_difficulty: { uiType: 'trail_difficulty', name: 'Trail Difficulty Calculator', category: UI_CATEGORIES.SPORTS, fields: [{ name: 'distance', type: 'number', required: true, prefillable: false }, { name: 'elevation_gain', type: 'number', required: true, prefillable: false }, { name: 'terrain', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  campsite_capacity: { uiType: 'campsite_capacity', name: 'Campsite Capacity Calculator', category: UI_CATEGORIES.TRAVEL, fields: [{ name: 'tent_sizes', type: 'array', required: true, prefillable: false }, { name: 'site_dimensions', type: 'object', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  backpack_weight: { uiType: 'backpack_weight', name: 'Backpack Weight Calculator', category: UI_CATEGORIES.TRAVEL, fields: [{ name: 'body_weight', type: 'number', required: true, prefillable: true, onboardingField: 'weight_kg' }, { name: 'trip_duration', type: 'number', required: true, prefillable: false }, { name: 'trip_type', type: 'enum', required: true, prefillable: false }], onboardingMapping: { body_weight: 'weight_kg' }, entityMapping: {}, defaults: {} },
  water_purification: { uiType: 'water_purification', name: 'Water Purification Calculator', category: UI_CATEGORIES.TRAVEL, fields: [{ name: 'group_size', type: 'number', required: true, prefillable: false }, { name: 'trip_days', type: 'number', required: true, prefillable: false }, { name: 'activity_level', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  bear_canister_size: { uiType: 'bear_canister_size', name: 'Bear Canister Size Calculator', category: UI_CATEGORIES.TRAVEL, fields: [{ name: 'people', type: 'number', required: true, prefillable: false }, { name: 'days', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  campfire_wood: { uiType: 'campfire_wood', name: 'Campfire Wood Calculator', category: UI_CATEGORIES.TRAVEL, fields: [{ name: 'hours_burning', type: 'number', required: true, prefillable: false }, { name: 'fire_size', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  altitude_acclimatization: { uiType: 'altitude_acclimatization', name: 'Altitude Acclimatization Planner', category: UI_CATEGORIES.TRAVEL, fields: [{ name: 'starting_altitude', type: 'number', required: true, prefillable: false }, { name: 'target_altitude', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  daylight_hours: { uiType: 'daylight_hours', name: 'Daylight Hours Calculator', category: UI_CATEGORIES.WEATHER, fields: [{ name: 'location', type: 'string', required: true, prefillable: true, onboardingField: 'city' }, { name: 'date', type: 'date', required: true, prefillable: false }], onboardingMapping: { location: 'city' }, entityMapping: { location: [EntityType.LOCATION] }, defaults: {} },
  sunset_golden_hour: { uiType: 'sunset_golden_hour', name: 'Golden Hour Calculator', category: UI_CATEGORIES.CRAFTS, fields: [{ name: 'location', type: 'string', required: true, prefillable: true, onboardingField: 'city' }, { name: 'date', type: 'date', required: true, prefillable: false }], onboardingMapping: { location: 'city' }, entityMapping: { location: [EntityType.LOCATION] }, defaults: {} },
  tide_calculator: { uiType: 'tide_calculator', name: 'Tide Calculator', category: UI_CATEGORIES.WEATHER, fields: [{ name: 'location', type: 'string', required: true, prefillable: false }, { name: 'date', type: 'date', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: { location: [EntityType.LOCATION] }, defaults: {} },

  // ============================================
  // RANDOM GENERATORS
  // ============================================
  random_number_generator: { uiType: 'random_number_generator', name: 'Random Number Generator', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'min', type: 'number', required: true, prefillable: false }, { name: 'max', type: 'number', required: true, prefillable: false }, { name: 'count', type: 'number', required: false, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: { count: 1 } },
  lottery_number_picker: { uiType: 'lottery_number_picker', name: 'Lottery Number Picker', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'lottery_type', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  name_picker: { uiType: 'name_picker', name: 'Random Name Picker', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'names', type: 'array', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  decision_wheel: { uiType: 'decision_wheel', name: 'Decision Wheel Spinner', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'options', type: 'array', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  yes_no_generator: { uiType: 'yes_no_generator', name: 'Yes/No Generator', category: UI_CATEGORIES.ENTERTAINMENT, fields: [], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  truth_or_dare: { uiType: 'truth_or_dare', name: 'Truth or Dare Generator', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'category', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  would_you_rather: { uiType: 'would_you_rather', name: 'Would You Rather Generator', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'category', type: 'enum', required: false, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  charades_generator: { uiType: 'charades_generator', name: 'Charades Word Generator', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'category', type: 'enum', required: true, prefillable: false }, { name: 'difficulty', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  secret_santa: { uiType: 'secret_santa', name: 'Secret Santa Generator', category: UI_CATEGORIES.EVENTS, fields: [{ name: 'participants', type: 'array', required: true, prefillable: false }, { name: 'exclusions', type: 'array', required: false, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },

  // ============================================
  // NETWORKING & IT
  // ============================================
  ip_subnet_calculator: { uiType: 'ip_subnet_calculator', name: 'IP Subnet Calculator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'ip_address', type: 'string', required: true, prefillable: false }, { name: 'subnet_mask', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  cidr_calculator: { uiType: 'cidr_calculator', name: 'CIDR Calculator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'ip_address', type: 'string', required: true, prefillable: false }, { name: 'cidr', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  bandwidth_calculator: { uiType: 'bandwidth_calculator', name: 'Bandwidth Calculator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'file_size', type: 'number', required: true, prefillable: false }, { name: 'transfer_time', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  data_transfer_time: { uiType: 'data_transfer_time', name: 'Data Transfer Time Calculator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'file_size_gb', type: 'number', required: true, prefillable: false }, { name: 'bandwidth_mbps', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  storage_conversion: { uiType: 'storage_conversion', name: 'Storage Unit Converter', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'value', type: 'number', required: true, prefillable: false }, { name: 'from_unit', type: 'enum', required: true, prefillable: false }, { name: 'to_unit', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  raid_calculator: { uiType: 'raid_calculator', name: 'RAID Calculator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'drive_size', type: 'number', required: true, prefillable: false }, { name: 'drive_count', type: 'number', required: true, prefillable: false }, { name: 'raid_level', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  server_uptime: { uiType: 'server_uptime', name: 'Server Uptime Calculator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'uptime_percentage', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  latency_calculator: { uiType: 'latency_calculator', name: 'Network Latency Calculator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'distance_km', type: 'number', required: true, prefillable: false }, { name: 'medium', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  hex_to_decimal: { uiType: 'hex_to_decimal', name: 'Hex to Decimal Converter', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'hex_value', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  binary_converter: { uiType: 'binary_converter', name: 'Binary Converter', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'value', type: 'string', required: true, prefillable: false }, { name: 'from_base', type: 'enum', required: true, prefillable: false }, { name: 'to_base', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  ascii_converter: { uiType: 'ascii_converter', name: 'ASCII Converter', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'input', type: 'string', required: true, prefillable: false }, { name: 'direction', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  cron_expression: { uiType: 'cron_expression', name: 'Cron Expression Generator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'schedule', type: 'object', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  unix_timestamp: { uiType: 'unix_timestamp', name: 'Unix Timestamp Converter', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'timestamp', type: 'number', required: false, prefillable: false }, { name: 'datetime', type: 'string', required: false, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },

  // ============================================
  // LANGUAGE & WRITING
  // ============================================
  character_counter: { uiType: 'character_counter', name: 'Character Counter', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'text', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  sentence_counter: { uiType: 'sentence_counter', name: 'Sentence Counter', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'text', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  paragraph_counter: { uiType: 'paragraph_counter', name: 'Paragraph Counter', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'text', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  reading_level: { uiType: 'reading_level', name: 'Reading Level Analyzer', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'text', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  text_case_converter: { uiType: 'text_case_converter', name: 'Text Case Converter', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'text', type: 'string', required: true, prefillable: false }, { name: 'target_case', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  text_diff: { uiType: 'text_diff', name: 'Text Diff Checker', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'text1', type: 'string', required: true, prefillable: false }, { name: 'text2', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  plagiarism_checker: { uiType: 'plagiarism_checker', name: 'Plagiarism Checker', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'text', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  grammar_checker: { uiType: 'grammar_checker', name: 'Grammar Checker', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'text', type: 'string', required: true, prefillable: false }, { name: 'language', type: 'enum', required: false, prefillable: true, onboardingField: 'preferred_language' }], onboardingMapping: { language: 'preferred_language' }, entityMapping: {}, defaults: {} },
  paraphrasing_tool: { uiType: 'paraphrasing_tool', name: 'Paraphrasing Tool', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'text', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  text_summarizer: { uiType: 'text_summarizer', name: 'Text Summarizer', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'text', type: 'string', required: true, prefillable: false }, { name: 'target_length', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  translation_tool: { uiType: 'translation_tool', name: 'Translation Tool', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'text', type: 'string', required: true, prefillable: false }, { name: 'source_language', type: 'enum', required: true, prefillable: false }, { name: 'target_language', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  roman_numeral_converter: { uiType: 'roman_numeral_converter', name: 'Roman Numeral Converter', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'value', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  morse_code: { uiType: 'morse_code', name: 'Morse Code Translator', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'input', type: 'string', required: true, prefillable: false }, { name: 'direction', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  anagram_solver: { uiType: 'anagram_solver', name: 'Anagram Solver', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'letters', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  word_scrambler: { uiType: 'word_scrambler', name: 'Word Scrambler', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'word', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  acronym_generator: { uiType: 'acronym_generator', name: 'Acronym Generator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'phrase', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  rhyme_finder: { uiType: 'rhyme_finder', name: 'Rhyme Finder', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'word', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  synonym_finder: { uiType: 'synonym_finder', name: 'Synonym Finder', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'word', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  antonym_finder: { uiType: 'antonym_finder', name: 'Antonym Finder', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'word', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },

  // ============================================
  // HOUSEHOLD & DAILY LIFE
  // ============================================
  laundry_calculator: { uiType: 'laundry_calculator', name: 'Laundry Detergent Calculator', category: UI_CATEGORIES.HOUSEHOLD, fields: [{ name: 'load_size', type: 'enum', required: true, prefillable: false }, { name: 'water_hardness', type: 'enum', required: true, prefillable: false }, { name: 'soil_level', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  dishwasher_loading: { uiType: 'dishwasher_loading', name: 'Dishwasher Load Optimizer', category: UI_CATEGORIES.HOUSEHOLD, fields: [{ name: 'items', type: 'array', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  closet_organizer: { uiType: 'closet_organizer', name: 'Closet Space Calculator', category: UI_CATEGORIES.HOUSEHOLD, fields: [{ name: 'closet_dimensions', type: 'object', required: true, prefillable: false }, { name: 'item_categories', type: 'array', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  moving_box_calculator: { uiType: 'moving_box_calculator', name: 'Moving Box Calculator', category: UI_CATEGORIES.HOUSEHOLD, fields: [{ name: 'rooms', type: 'array', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  moving_cost_estimator: { uiType: 'moving_cost_estimator', name: 'Moving Cost Estimator', category: UI_CATEGORIES.HOUSEHOLD, fields: [{ name: 'origin', type: 'string', required: true, prefillable: true, onboardingField: 'city' }, { name: 'destination', type: 'string', required: true, prefillable: false }, { name: 'home_size', type: 'enum', required: true, prefillable: false }], onboardingMapping: { origin: 'city' }, entityMapping: { origin: [EntityType.LOCATION], destination: [EntityType.LOCATION] }, defaults: {} },
  bill_splitter: { uiType: 'bill_splitter', name: 'Bill Splitter', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'total', type: 'number', required: true, prefillable: false }, { name: 'people', type: 'number', required: true, prefillable: false }, { name: 'items', type: 'array', required: false, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  grocery_budget: { uiType: 'grocery_budget', name: 'Grocery Budget Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'household_size', type: 'number', required: true, prefillable: false }, { name: 'diet_type', type: 'enum', required: true, prefillable: false }, { name: 'currency', type: 'enum', required: false, prefillable: true, onboardingField: 'preferred_currency' }], onboardingMapping: { currency: 'preferred_currency' }, entityMapping: {}, defaults: {} },
  cleaning_schedule: { uiType: 'cleaning_schedule', name: 'Cleaning Schedule Generator', category: UI_CATEGORIES.HOUSEHOLD, fields: [{ name: 'rooms', type: 'array', required: true, prefillable: false }, { name: 'frequency', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  air_filter_reminder: { uiType: 'air_filter_reminder', name: 'Air Filter Replacement Reminder', category: UI_CATEGORIES.HOUSEHOLD, fields: [{ name: 'last_replaced', type: 'date', required: true, prefillable: false }, { name: 'filter_type', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  smoke_detector_check: { uiType: 'smoke_detector_check', name: 'Smoke Detector Check Reminder', category: UI_CATEGORIES.HOUSEHOLD, fields: [{ name: 'last_checked', type: 'date', required: true, prefillable: false }, { name: 'detector_count', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  fridge_inventory: { uiType: 'fridge_inventory', name: 'Fridge Inventory Tracker', category: UI_CATEGORIES.HOUSEHOLD, fields: [{ name: 'items', type: 'array', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  pantry_organizer: { uiType: 'pantry_organizer', name: 'Pantry Organizer', category: UI_CATEGORIES.HOUSEHOLD, fields: [{ name: 'items', type: 'array', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  expiration_tracker: { uiType: 'expiration_tracker', name: 'Food Expiration Tracker', category: UI_CATEGORIES.HOUSEHOLD, fields: [{ name: 'items', type: 'array', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  home_insurance_estimate: { uiType: 'home_insurance_estimate', name: 'Home Insurance Estimator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'home_value', type: 'number', required: true, prefillable: false }, { name: 'location', type: 'string', required: true, prefillable: true, onboardingField: 'city' }, { name: 'coverage_type', type: 'enum', required: true, prefillable: false }], onboardingMapping: { location: 'city' }, entityMapping: { location: [EntityType.LOCATION] }, defaults: {} },
  car_insurance_estimate: { uiType: 'car_insurance_estimate', name: 'Car Insurance Estimator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'car_value', type: 'number', required: true, prefillable: false }, { name: 'driver_age', type: 'number', required: true, prefillable: false }, { name: 'driving_record', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  life_insurance_estimate: { uiType: 'life_insurance_estimate', name: 'Life Insurance Estimator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'age', type: 'number', required: true, prefillable: false }, { name: 'coverage_amount', type: 'number', required: true, prefillable: false }, { name: 'health_status', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  health_insurance_compare: { uiType: 'health_insurance_compare', name: 'Health Insurance Comparison', category: UI_CATEGORIES.HEALTH, fields: [{ name: 'plans', type: 'array', required: true, prefillable: false }, { name: 'expected_usage', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },

  // ============================================
  // ADDITIONAL EDUCATION TOOLS
  // ============================================
  grade_converter: { uiType: 'grade_converter', name: 'Grade Converter', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'grade', type: 'string', required: true, prefillable: false }, { name: 'from_system', type: 'enum', required: true, prefillable: false }, { name: 'to_system', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  final_grade_calculator: { uiType: 'final_grade_calculator', name: 'Final Grade Calculator', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'current_grade', type: 'number', required: true, prefillable: false }, { name: 'desired_grade', type: 'number', required: true, prefillable: false }, { name: 'final_weight', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  weighted_grade: { uiType: 'weighted_grade', name: 'Weighted Grade Calculator', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'assignments', type: 'array', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  sat_to_act: { uiType: 'sat_to_act', name: 'SAT to ACT Converter', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'score', type: 'number', required: true, prefillable: false }, { name: 'test_type', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  college_cost: { uiType: 'college_cost', name: 'College Cost Calculator', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'tuition', type: 'number', required: true, prefillable: false }, { name: 'room_board', type: 'number', required: true, prefillable: false }, { name: 'years', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  scholarship_calculator: { uiType: 'scholarship_calculator', name: 'Scholarship Savings Calculator', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'total_cost', type: 'number', required: true, prefillable: false }, { name: 'scholarships', type: 'array', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  bibliography_generator: { uiType: 'bibliography_generator', name: 'Bibliography Generator', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'sources', type: 'array', required: true, prefillable: false }, { name: 'style', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  spaced_repetition: { uiType: 'spaced_repetition', name: 'Spaced Repetition Scheduler', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'cards', type: 'array', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },

  // ============================================
  // ADDITIONAL HEALTH TOOLS
  // ============================================
  blood_alcohol: { uiType: 'blood_alcohol', name: 'Blood Alcohol Calculator', category: UI_CATEGORIES.HEALTH, fields: [{ name: 'drinks', type: 'number', required: true, prefillable: false }, { name: 'weight', type: 'number', required: true, prefillable: true, onboardingField: 'weight_kg' }, { name: 'gender', type: 'enum', required: true, prefillable: true, onboardingField: 'gender' }, { name: 'hours', type: 'number', required: true, prefillable: false }], onboardingMapping: { weight: 'weight_kg', gender: 'gender' }, entityMapping: {}, defaults: {} },
  nicotine_calculator: { uiType: 'nicotine_calculator', name: 'Nicotine Savings Calculator', category: UI_CATEGORIES.HEALTH, fields: [{ name: 'cigarettes_per_day', type: 'number', required: true, prefillable: false }, { name: 'cost_per_pack', type: 'number', required: true, prefillable: false }, { name: 'quit_date', type: 'date', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  skin_age_calculator: { uiType: 'skin_age_calculator', name: 'Skin Age Calculator', category: UI_CATEGORIES.BEAUTY, fields: [{ name: 'age', type: 'number', required: true, prefillable: false }, { name: 'lifestyle_factors', type: 'array', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  eye_color_predictor: { uiType: 'eye_color_predictor', name: 'Eye Color Predictor', category: UI_CATEGORIES.HEALTH, fields: [{ name: 'parent1_color', type: 'enum', required: true, prefillable: false }, { name: 'parent2_color', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  menstrual_cycle_tracker: { uiType: 'menstrual_cycle_tracker', name: 'Menstrual Cycle Tracker', category: UI_CATEGORIES.HEALTH, fields: [{ name: 'last_period', type: 'date', required: true, prefillable: false }, { name: 'cycle_length', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  iv_drip_rate: { uiType: 'iv_drip_rate', name: 'IV Drip Rate Calculator', category: UI_CATEGORIES.HEALTH, fields: [{ name: 'volume_ml', type: 'number', required: true, prefillable: false }, { name: 'time_hours', type: 'number', required: true, prefillable: false }, { name: 'drop_factor', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  drug_dosage: { uiType: 'drug_dosage', name: 'Drug Dosage Calculator', category: UI_CATEGORIES.HEALTH, fields: [{ name: 'weight', type: 'number', required: true, prefillable: true, onboardingField: 'weight_kg' }, { name: 'dose_per_kg', type: 'number', required: true, prefillable: false }], onboardingMapping: { weight: 'weight_kg' }, entityMapping: {}, defaults: {} },
  ideal_weight: { uiType: 'ideal_weight', name: 'Ideal Weight Calculator', category: UI_CATEGORIES.HEALTH, fields: [{ name: 'height', type: 'number', required: true, prefillable: true, onboardingField: 'height_cm' }, { name: 'gender', type: 'enum', required: true, prefillable: true, onboardingField: 'gender' }, { name: 'frame_size', type: 'enum', required: false, prefillable: false }], onboardingMapping: { height: 'height_cm', gender: 'gender' }, entityMapping: {}, defaults: {} },
  bmi_prime: { uiType: 'bmi_prime', name: 'BMI Prime Calculator', category: UI_CATEGORIES.HEALTH, fields: [{ name: 'weight', type: 'number', required: true, prefillable: true, onboardingField: 'weight_kg' }, { name: 'height', type: 'number', required: true, prefillable: true, onboardingField: 'height_cm' }], onboardingMapping: { weight: 'weight_kg', height: 'height_cm' }, entityMapping: {}, defaults: {} },
  ponderal_index: { uiType: 'ponderal_index', name: 'Ponderal Index Calculator', category: UI_CATEGORIES.HEALTH, fields: [{ name: 'weight', type: 'number', required: true, prefillable: true, onboardingField: 'weight_kg' }, { name: 'height', type: 'number', required: true, prefillable: true, onboardingField: 'height_cm' }], onboardingMapping: { weight: 'weight_kg', height: 'height_cm' }, entityMapping: {}, defaults: {} },
  steps_to_miles: { uiType: 'steps_to_miles', name: 'Steps to Miles Converter', category: UI_CATEGORIES.HEALTH, fields: [{ name: 'steps', type: 'number', required: true, prefillable: false }, { name: 'stride_length', type: 'number', required: false, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  steps_to_calories: { uiType: 'steps_to_calories', name: 'Steps to Calories', category: UI_CATEGORIES.HEALTH, fields: [{ name: 'steps', type: 'number', required: true, prefillable: false }, { name: 'weight', type: 'number', required: true, prefillable: true, onboardingField: 'weight_kg' }], onboardingMapping: { weight: 'weight_kg' }, entityMapping: {}, defaults: {} },

  // ============================================
  // ADDITIONAL FINANCE TOOLS
  // ============================================
  npv_calculator: { uiType: 'npv_calculator', name: 'NPV Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'initial_investment', type: 'number', required: true, prefillable: false }, { name: 'cash_flows', type: 'array', required: true, prefillable: false }, { name: 'discount_rate', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  irr_calculator: { uiType: 'irr_calculator', name: 'IRR Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'initial_investment', type: 'number', required: true, prefillable: false }, { name: 'cash_flows', type: 'array', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  payback_period: { uiType: 'payback_period', name: 'Payback Period Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'initial_investment', type: 'number', required: true, prefillable: false }, { name: 'annual_cash_flow', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  depreciation_calculator: { uiType: 'depreciation_calculator', name: 'Depreciation Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'asset_cost', type: 'number', required: true, prefillable: false }, { name: 'salvage_value', type: 'number', required: true, prefillable: false }, { name: 'useful_life', type: 'number', required: true, prefillable: false }, { name: 'method', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  amortization_schedule: { uiType: 'amortization_schedule', name: 'Amortization Schedule', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'principal', type: 'number', required: true, prefillable: false }, { name: 'interest_rate', type: 'number', required: true, prefillable: false }, { name: 'loan_term', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  debt_payoff: { uiType: 'debt_payoff', name: 'Debt Payoff Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'debts', type: 'array', required: true, prefillable: false }, { name: 'extra_payment', type: 'number', required: false, prefillable: false }, { name: 'strategy', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  debt_consolidation: { uiType: 'debt_consolidation', name: 'Debt Consolidation Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'debts', type: 'array', required: true, prefillable: false }, { name: 'new_rate', type: 'number', required: true, prefillable: false }, { name: 'new_term', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  emergency_fund: { uiType: 'emergency_fund', name: 'Emergency Fund Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'monthly_expenses', type: 'number', required: true, prefillable: false }, { name: 'months_coverage', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  net_worth: { uiType: 'net_worth', name: 'Net Worth Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'assets', type: 'array', required: true, prefillable: false }, { name: 'liabilities', type: 'array', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  sip_calculator: { uiType: 'sip_calculator', name: 'SIP Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'monthly_investment', type: 'number', required: true, prefillable: false }, { name: 'expected_return', type: 'number', required: true, prefillable: false }, { name: 'years', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  lumpsum_calculator: { uiType: 'lumpsum_calculator', name: 'Lumpsum Investment Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'principal', type: 'number', required: true, prefillable: false }, { name: 'rate', type: 'number', required: true, prefillable: false }, { name: 'years', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  ppf_calculator: { uiType: 'ppf_calculator', name: 'PPF Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'yearly_deposit', type: 'number', required: true, prefillable: false }, { name: 'years', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  fd_calculator: { uiType: 'fd_calculator', name: 'Fixed Deposit Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'principal', type: 'number', required: true, prefillable: false }, { name: 'rate', type: 'number', required: true, prefillable: false }, { name: 'tenure_months', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  rd_calculator: { uiType: 'rd_calculator', name: 'Recurring Deposit Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'monthly_deposit', type: 'number', required: true, prefillable: false }, { name: 'rate', type: 'number', required: true, prefillable: false }, { name: 'tenure_months', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  gratuity_calculator: { uiType: 'gratuity_calculator', name: 'Gratuity Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'last_salary', type: 'number', required: true, prefillable: false }, { name: 'years_of_service', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  hra_calculator: { uiType: 'hra_calculator', name: 'HRA Exemption Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'basic_salary', type: 'number', required: true, prefillable: false }, { name: 'hra_received', type: 'number', required: true, prefillable: false }, { name: 'rent_paid', type: 'number', required: true, prefillable: false }, { name: 'metro_city', type: 'boolean', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  tds_calculator: { uiType: 'tds_calculator', name: 'TDS Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'income_type', type: 'enum', required: true, prefillable: false }, { name: 'amount', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  income_tax_calculator: { uiType: 'income_tax_calculator', name: 'Income Tax Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'annual_income', type: 'number', required: true, prefillable: false }, { name: 'deductions', type: 'array', required: false, prefillable: false }, { name: 'country', type: 'enum', required: true, prefillable: true, onboardingField: 'country' }], onboardingMapping: { country: 'country' }, entityMapping: {}, defaults: {} },
  capital_gains: { uiType: 'capital_gains', name: 'Capital Gains Tax Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'purchase_price', type: 'number', required: true, prefillable: false }, { name: 'sale_price', type: 'number', required: true, prefillable: false }, { name: 'holding_period', type: 'enum', required: true, prefillable: false }, { name: 'asset_type', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },

  // ============================================
  // ADDITIONAL UNIT CONVERTERS
  // ============================================
  mass_converter: { uiType: 'mass_converter', name: 'Mass Converter', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'value', type: 'number', required: true, prefillable: false }, { name: 'from_unit', type: 'enum', required: true, prefillable: false }, { name: 'to_unit', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  force_converter: { uiType: 'force_converter', name: 'Force Converter', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'value', type: 'number', required: true, prefillable: false }, { name: 'from_unit', type: 'enum', required: true, prefillable: false }, { name: 'to_unit', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  torque_converter: { uiType: 'torque_converter', name: 'Torque Converter', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'value', type: 'number', required: true, prefillable: false }, { name: 'from_unit', type: 'enum', required: true, prefillable: false }, { name: 'to_unit', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  frequency_converter: { uiType: 'frequency_converter', name: 'Frequency Converter', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'value', type: 'number', required: true, prefillable: false }, { name: 'from_unit', type: 'enum', required: true, prefillable: false }, { name: 'to_unit', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  data_rate_converter: { uiType: 'data_rate_converter', name: 'Data Rate Converter', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'value', type: 'number', required: true, prefillable: false }, { name: 'from_unit', type: 'enum', required: true, prefillable: false }, { name: 'to_unit', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  time_converter: { uiType: 'time_converter', name: 'Time Converter', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'value', type: 'number', required: true, prefillable: false }, { name: 'from_unit', type: 'enum', required: true, prefillable: false }, { name: 'to_unit', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },

  // ============================================
  // ADDITIONAL PARTY & EVENT TOOLS
  // ============================================
  party_drink_calculator: { uiType: 'party_drink_calculator', name: 'Party Drink Calculator', category: UI_CATEGORIES.EVENTS, fields: [{ name: 'guest_count', type: 'number', required: true, prefillable: false }, { name: 'event_duration', type: 'number', required: true, prefillable: false }, { name: 'drink_types', type: 'array', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  birthday_party_budget: { uiType: 'birthday_party_budget', name: 'Birthday Party Budget', category: UI_CATEGORIES.EVENTS, fields: [{ name: 'guest_count', type: 'number', required: true, prefillable: false }, { name: 'budget', type: 'number', required: true, prefillable: false }, { name: 'currency', type: 'enum', required: false, prefillable: true, onboardingField: 'preferred_currency' }], onboardingMapping: { currency: 'preferred_currency' }, entityMapping: {}, defaults: {} },
  graduation_party_planner: { uiType: 'graduation_party_planner', name: 'Graduation Party Planner', category: UI_CATEGORIES.EVENTS, fields: [{ name: 'guest_count', type: 'number', required: true, prefillable: false }, { name: 'budget', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  baby_shower_budget: { uiType: 'baby_shower_budget', name: 'Baby Shower Budget', category: UI_CATEGORIES.EVENTS, fields: [{ name: 'guest_count', type: 'number', required: true, prefillable: false }, { name: 'budget', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  potluck_planner: { uiType: 'potluck_planner', name: 'Potluck Planner', category: UI_CATEGORIES.EVENTS, fields: [{ name: 'guest_count', type: 'number', required: true, prefillable: false }, { name: 'categories', type: 'array', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  bbq_calculator: { uiType: 'bbq_calculator', name: 'BBQ Food Calculator', category: UI_CATEGORIES.EVENTS, fields: [{ name: 'guest_count', type: 'number', required: true, prefillable: false }, { name: 'meat_types', type: 'array', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  thanksgiving_calculator: { uiType: 'thanksgiving_calculator', name: 'Thanksgiving Calculator', category: UI_CATEGORIES.EVENTS, fields: [{ name: 'guest_count', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  christmas_budget: { uiType: 'christmas_budget', name: 'Christmas Budget Planner', category: UI_CATEGORIES.EVENTS, fields: [{ name: 'recipients', type: 'array', required: true, prefillable: false }, { name: 'total_budget', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  halloween_candy: { uiType: 'halloween_candy', name: 'Halloween Candy Calculator', category: UI_CATEGORIES.EVENTS, fields: [{ name: 'expected_visitors', type: 'number', required: true, prefillable: false }, { name: 'candy_per_child', type: 'number', required: false, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: { candy_per_child: 3 } },
  super_bowl_party: { uiType: 'super_bowl_party', name: 'Super Bowl Party Calculator', category: UI_CATEGORIES.EVENTS, fields: [{ name: 'guest_count', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  movie_night_snacks: { uiType: 'movie_night_snacks', name: 'Movie Night Snack Calculator', category: UI_CATEGORIES.EVENTS, fields: [{ name: 'guest_count', type: 'number', required: true, prefillable: false }, { name: 'movie_count', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },

  // ============================================
  // ADDITIONAL UTILITY TOOLS
  // ============================================
  date_difference: { uiType: 'date_difference', name: 'Date Difference Calculator', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'start_date', type: 'date', required: true, prefillable: false }, { name: 'end_date', type: 'date', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  date_add_subtract: { uiType: 'date_add_subtract', name: 'Date Add/Subtract', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'start_date', type: 'date', required: true, prefillable: false }, { name: 'days', type: 'number', required: true, prefillable: false }, { name: 'operation', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  weekday_calculator: { uiType: 'weekday_calculator', name: 'Weekday Calculator', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'date', type: 'date', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  countdown_timer: { uiType: 'countdown_timer', name: 'Countdown Timer', category: UI_CATEGORIES.EVENTS, fields: [{ name: 'target_date', type: 'date', required: true, prefillable: false }, { name: 'event_name', type: 'string', required: false, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  timezone_converter: { uiType: 'timezone_converter', name: 'Timezone Converter', category: UI_CATEGORIES.TRAVEL, fields: [{ name: 'time', type: 'string', required: true, prefillable: false }, { name: 'from_timezone', type: 'enum', required: true, prefillable: true, onboardingField: 'timezone' }, { name: 'to_timezone', type: 'enum', required: true, prefillable: false }], onboardingMapping: { from_timezone: 'timezone' }, entityMapping: {}, defaults: {} },
  meeting_time_finder: { uiType: 'meeting_time_finder', name: 'Meeting Time Finder', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'participants', type: 'array', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  color_converter: { uiType: 'color_converter', name: 'Color Converter', category: UI_CATEGORIES.CRAFTS, fields: [{ name: 'color', type: 'string', required: true, prefillable: false }, { name: 'from_format', type: 'enum', required: true, prefillable: false }, { name: 'to_format', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  color_blindness_simulator: { uiType: 'color_blindness_simulator', name: 'Color Blindness Simulator', category: UI_CATEGORIES.CRAFTS, fields: [{ name: 'color', type: 'string', required: true, prefillable: false }, { name: 'type', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  contrast_checker: { uiType: 'contrast_checker', name: 'Contrast Ratio Checker', category: UI_CATEGORIES.CRAFTS, fields: [{ name: 'foreground', type: 'string', required: true, prefillable: false }, { name: 'background', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  email_validator: { uiType: 'email_validator', name: 'Email Validator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'email', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  phone_validator: { uiType: 'phone_validator', name: 'Phone Number Validator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'phone', type: 'string', required: true, prefillable: false }, { name: 'country', type: 'enum', required: false, prefillable: true, onboardingField: 'country' }], onboardingMapping: { country: 'country' }, entityMapping: {}, defaults: {} },
  credit_card_validator: { uiType: 'credit_card_validator', name: 'Credit Card Validator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'card_number', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  iban_validator: { uiType: 'iban_validator', name: 'IBAN Validator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'iban', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  ssn_validator: { uiType: 'ssn_validator', name: 'SSN Validator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'ssn', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  zip_code_lookup: { uiType: 'zip_code_lookup', name: 'ZIP Code Lookup', category: UI_CATEGORIES.TRAVEL, fields: [{ name: 'zip_code', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  area_code_lookup: { uiType: 'area_code_lookup', name: 'Area Code Lookup', category: UI_CATEGORIES.TRAVEL, fields: [{ name: 'area_code', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  ip_lookup: { uiType: 'ip_lookup', name: 'IP Address Lookup', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'ip_address', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  domain_age: { uiType: 'domain_age', name: 'Domain Age Checker', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'domain', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  whois_lookup: { uiType: 'whois_lookup', name: 'WHOIS Lookup', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'domain', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  ssl_checker: { uiType: 'ssl_checker', name: 'SSL Certificate Checker', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'domain', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  dns_lookup: { uiType: 'dns_lookup', name: 'DNS Lookup', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'domain', type: 'string', required: true, prefillable: false }, { name: 'record_type', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  website_status: { uiType: 'website_status', name: 'Website Status Checker', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'url', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  page_speed: { uiType: 'page_speed', name: 'Page Speed Checker', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'url', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  meta_tag_analyzer: { uiType: 'meta_tag_analyzer', name: 'Meta Tag Analyzer', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'url', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  seo_score: { uiType: 'seo_score', name: 'SEO Score Checker', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'url', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  keyword_density: { uiType: 'keyword_density', name: 'Keyword Density Checker', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'text', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  backlink_checker: { uiType: 'backlink_checker', name: 'Backlink Checker', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'domain', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },

  // ============================================
  // REAL ESTATE & PROPERTY
  // ============================================
  rent_vs_buy: { uiType: 'rent_vs_buy', name: 'Rent vs Buy Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'home_price', type: 'number', required: true, prefillable: false }, { name: 'monthly_rent', type: 'number', required: true, prefillable: false }, { name: 'years_staying', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  closing_cost_calculator: { uiType: 'closing_cost_calculator', name: 'Closing Cost Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'home_price', type: 'number', required: true, prefillable: false }, { name: 'location', type: 'string', required: true, prefillable: true, onboardingField: 'city' }], onboardingMapping: { location: 'city' }, entityMapping: { location: [EntityType.LOCATION] }, defaults: {} },
  down_payment_calculator: { uiType: 'down_payment_calculator', name: 'Down Payment Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'home_price', type: 'number', required: true, prefillable: false }, { name: 'down_payment_percent', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  refinance_calculator: { uiType: 'refinance_calculator', name: 'Refinance Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'current_balance', type: 'number', required: true, prefillable: false }, { name: 'current_rate', type: 'number', required: true, prefillable: false }, { name: 'new_rate', type: 'number', required: true, prefillable: false }, { name: 'new_term', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  home_equity_calculator: { uiType: 'home_equity_calculator', name: 'Home Equity Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'home_value', type: 'number', required: true, prefillable: false }, { name: 'mortgage_balance', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  heloc_calculator: { uiType: 'heloc_calculator', name: 'HELOC Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'home_value', type: 'number', required: true, prefillable: false }, { name: 'mortgage_balance', type: 'number', required: true, prefillable: false }, { name: 'ltv_limit', type: 'number', required: false, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: { ltv_limit: 80 } },
  pmi_calculator: { uiType: 'pmi_calculator', name: 'PMI Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'home_price', type: 'number', required: true, prefillable: false }, { name: 'down_payment', type: 'number', required: true, prefillable: false }, { name: 'pmi_rate', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  rental_roi: { uiType: 'rental_roi', name: 'Rental ROI Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'purchase_price', type: 'number', required: true, prefillable: false }, { name: 'monthly_rent', type: 'number', required: true, prefillable: false }, { name: 'expenses', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  cap_rate_calculator: { uiType: 'cap_rate_calculator', name: 'Cap Rate Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'property_value', type: 'number', required: true, prefillable: false }, { name: 'net_operating_income', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  cash_flow_calculator: { uiType: 'cash_flow_calculator', name: 'Rental Cash Flow Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'monthly_rent', type: 'number', required: true, prefillable: false }, { name: 'mortgage_payment', type: 'number', required: true, prefillable: false }, { name: 'expenses', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  vacancy_rate: { uiType: 'vacancy_rate', name: 'Vacancy Rate Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'vacant_units', type: 'number', required: true, prefillable: false }, { name: 'total_units', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  square_footage: { uiType: 'square_footage', name: 'Square Footage Calculator', category: UI_CATEGORIES.HOME, fields: [{ name: 'rooms', type: 'array', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  price_per_sqft: { uiType: 'price_per_sqft', name: 'Price Per Sq Ft Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'price', type: 'number', required: true, prefillable: false }, { name: 'square_feet', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  home_insurance: { uiType: 'home_insurance', name: 'Home Insurance Estimator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'home_value', type: 'number', required: true, prefillable: false }, { name: 'location', type: 'string', required: true, prefillable: true, onboardingField: 'city' }], onboardingMapping: { location: 'city' }, entityMapping: { location: [EntityType.LOCATION] }, defaults: {} },
  moving_cost: { uiType: 'moving_cost', name: 'Moving Cost Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'origin', type: 'string', required: true, prefillable: true, onboardingField: 'city' }, { name: 'destination', type: 'string', required: true, prefillable: false }, { name: 'home_size', type: 'enum', required: true, prefillable: false }], onboardingMapping: { origin: 'city' }, entityMapping: { origin: [EntityType.LOCATION], destination: [EntityType.LOCATION] }, defaults: {} },
  land_measurement: { uiType: 'land_measurement', name: 'Land Measurement Converter', category: UI_CATEGORIES.HOME, fields: [{ name: 'value', type: 'number', required: true, prefillable: false }, { name: 'from_unit', type: 'enum', required: true, prefillable: false }, { name: 'to_unit', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  lot_size_calculator: { uiType: 'lot_size_calculator', name: 'Lot Size Calculator', category: UI_CATEGORIES.HOME, fields: [{ name: 'length', type: 'number', required: true, prefillable: false }, { name: 'width', type: 'number', required: true, prefillable: false }, { name: 'unit', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  rent_increase: { uiType: 'rent_increase', name: 'Rent Increase Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'current_rent', type: 'number', required: true, prefillable: false }, { name: 'increase_percent', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  security_deposit: { uiType: 'security_deposit', name: 'Security Deposit Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'monthly_rent', type: 'number', required: true, prefillable: false }, { name: 'location', type: 'string', required: true, prefillable: true, onboardingField: 'city' }], onboardingMapping: { location: 'city' }, entityMapping: { location: [EntityType.LOCATION] }, defaults: {} },
  rental_yield: { uiType: 'rental_yield', name: 'Rental Yield Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'property_value', type: 'number', required: true, prefillable: false }, { name: 'annual_rent', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  break_even_rent: { uiType: 'break_even_rent', name: 'Break Even Rent Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'purchase_price', type: 'number', required: true, prefillable: false }, { name: 'down_payment', type: 'number', required: true, prefillable: false }, { name: 'interest_rate', type: 'number', required: true, prefillable: false }, { name: 'expenses', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },

  // ============================================
  // DIY & HOME IMPROVEMENT
  // ============================================
  roof_pitch: { uiType: 'roof_pitch', name: 'Roof Pitch Calculator', category: UI_CATEGORIES.HOME, fields: [{ name: 'rise', type: 'number', required: true, prefillable: false }, { name: 'run', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  sand_calculator: { uiType: 'sand_calculator', name: 'Sand Calculator', category: UI_CATEGORIES.HOME, fields: [{ name: 'length', type: 'number', required: true, prefillable: false }, { name: 'width', type: 'number', required: true, prefillable: false }, { name: 'depth', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  sod_calculator: { uiType: 'sod_calculator', name: 'Sod Calculator', category: UI_CATEGORIES.HOME, fields: [{ name: 'lawn_area', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },

  // ============================================
  // SOCIAL MEDIA & CONTENT
  // ============================================
  instagram_engagement: { uiType: 'instagram_engagement', name: 'Instagram Engagement Calculator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'followers', type: 'number', required: true, prefillable: false }, { name: 'avg_likes', type: 'number', required: true, prefillable: false }, { name: 'avg_comments', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  youtube_earnings: { uiType: 'youtube_earnings', name: 'YouTube Earnings Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'monthly_views', type: 'number', required: true, prefillable: false }, { name: 'cpm', type: 'number', required: false, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: { cpm: 2 } },
  tiktok_earnings: { uiType: 'tiktok_earnings', name: 'TikTok Earnings Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'followers', type: 'number', required: true, prefillable: false }, { name: 'engagement_rate', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  twitter_analytics: { uiType: 'twitter_analytics', name: 'Twitter Analytics Calculator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'followers', type: 'number', required: true, prefillable: false }, { name: 'tweets_per_day', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  influencer_rate: { uiType: 'influencer_rate', name: 'Influencer Rate Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'followers', type: 'number', required: true, prefillable: false }, { name: 'platform', type: 'enum', required: true, prefillable: false }, { name: 'engagement_rate', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  hashtag_generator: { uiType: 'hashtag_generator', name: 'Hashtag Generator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'topic', type: 'string', required: true, prefillable: false }, { name: 'platform', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  post_scheduler: { uiType: 'post_scheduler', name: 'Best Time to Post', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'platform', type: 'enum', required: true, prefillable: false }, { name: 'timezone', type: 'enum', required: true, prefillable: true, onboardingField: 'timezone' }], onboardingMapping: { timezone: 'timezone' }, entityMapping: {}, defaults: {} },
  follower_growth: { uiType: 'follower_growth', name: 'Follower Growth Calculator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'current_followers', type: 'number', required: true, prefillable: false }, { name: 'growth_rate', type: 'number', required: true, prefillable: false }, { name: 'months', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  video_length: { uiType: 'video_length', name: 'Optimal Video Length', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'platform', type: 'enum', required: true, prefillable: false }, { name: 'content_type', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  content_calendar: { uiType: 'content_calendar', name: 'Content Calendar Generator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'posts_per_week', type: 'number', required: true, prefillable: false }, { name: 'platforms', type: 'array', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  social_roi: { uiType: 'social_roi', name: 'Social Media ROI Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'ad_spend', type: 'number', required: true, prefillable: false }, { name: 'revenue', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },

  // ============================================
  // SHOPPING & E-COMMERCE
  // ============================================
  sale_price: { uiType: 'sale_price', name: 'Sale Price Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'original_price', type: 'number', required: true, prefillable: false }, { name: 'sale_price', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  margin_calculator: { uiType: 'margin_calculator', name: 'Profit Margin Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'cost', type: 'number', required: true, prefillable: false }, { name: 'selling_price', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  sales_tax: { uiType: 'sales_tax', name: 'Sales Tax Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'amount', type: 'number', required: true, prefillable: false }, { name: 'tax_rate', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  unit_price: { uiType: 'unit_price', name: 'Unit Price Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'total_price', type: 'number', required: true, prefillable: false }, { name: 'quantity', type: 'number', required: true, prefillable: false }, { name: 'unit', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  price_comparison: { uiType: 'price_comparison', name: 'Price Comparison Tool', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'items', type: 'array', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  coupon_stack: { uiType: 'coupon_stack', name: 'Coupon Stack Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'original_price', type: 'number', required: true, prefillable: false }, { name: 'coupons', type: 'array', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  cashback_calculator: { uiType: 'cashback_calculator', name: 'Cashback Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'purchase_amount', type: 'number', required: true, prefillable: false }, { name: 'cashback_percent', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  shipping_threshold: { uiType: 'shipping_threshold', name: 'Free Shipping Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'cart_total', type: 'number', required: true, prefillable: false }, { name: 'threshold', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  break_even_price: { uiType: 'break_even_price', name: 'Break Even Price Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'fixed_costs', type: 'number', required: true, prefillable: false }, { name: 'variable_cost', type: 'number', required: true, prefillable: false }, { name: 'units', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  wholesale_price: { uiType: 'wholesale_price', name: 'Wholesale Price Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'retail_price', type: 'number', required: true, prefillable: false }, { name: 'wholesale_discount', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  bundle_discount: { uiType: 'bundle_discount', name: 'Bundle Discount Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'items', type: 'array', required: true, prefillable: false }, { name: 'bundle_discount', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },

  // ============================================
  // SECURITY & PRIVACY
  // ============================================
  password_strength: { uiType: 'password_strength', name: 'Password Strength Checker', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'password', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  html_encoder: { uiType: 'html_encoder', name: 'HTML Encoder/Decoder', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'text', type: 'string', required: true, prefillable: false }, { name: 'operation', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  jwt_decoder: { uiType: 'jwt_decoder', name: 'JWT Decoder', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'token', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  encryption_tool: { uiType: 'encryption_tool', name: 'Text Encryption Tool', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'text', type: 'string', required: true, prefillable: false }, { name: 'key', type: 'string', required: true, prefillable: false }, { name: 'operation', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  privacy_score: { uiType: 'privacy_score', name: 'Privacy Score Calculator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'url', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  data_breach_check: { uiType: 'data_breach_check', name: 'Data Breach Checker', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'email', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  vpn_speed: { uiType: 'vpn_speed', name: 'VPN Speed Calculator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'original_speed', type: 'number', required: true, prefillable: false }, { name: 'expected_loss', type: 'number', required: false, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: { expected_loss: 15 } },

  // ============================================
  // CLEANING & ORGANIZATION
  // ============================================
  cleaning_time: { uiType: 'cleaning_time', name: 'Cleaning Time Estimator', category: UI_CATEGORIES.HOUSEHOLD, fields: [{ name: 'rooms', type: 'array', required: true, prefillable: false }, { name: 'cleaning_level', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  laundry_cost: { uiType: 'laundry_cost', name: 'Laundry Cost Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'loads_per_week', type: 'number', required: true, prefillable: false }, { name: 'water_cost', type: 'number', required: true, prefillable: false }, { name: 'electricity_cost', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  detergent_calculator: { uiType: 'detergent_calculator', name: 'Detergent Calculator', category: UI_CATEGORIES.HOUSEHOLD, fields: [{ name: 'load_size', type: 'enum', required: true, prefillable: false }, { name: 'soil_level', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  declutter_calculator: { uiType: 'declutter_calculator', name: 'Declutter Time Estimator', category: UI_CATEGORIES.HOUSEHOLD, fields: [{ name: 'rooms', type: 'array', required: true, prefillable: false }, { name: 'clutter_level', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  moving_box: { uiType: 'moving_box', name: 'Moving Box Calculator', category: UI_CATEGORIES.HOME, fields: [{ name: 'room_count', type: 'number', required: true, prefillable: false }, { name: 'home_type', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  spring_cleaning: { uiType: 'spring_cleaning', name: 'Spring Cleaning Checklist', category: UI_CATEGORIES.HOUSEHOLD, fields: [{ name: 'rooms', type: 'array', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  housekeeping_cost: { uiType: 'housekeeping_cost', name: 'Housekeeping Cost Calculator', category: UI_CATEGORIES.FINANCE, fields: [{ name: 'home_size', type: 'number', required: true, prefillable: false }, { name: 'frequency', type: 'enum', required: true, prefillable: false }, { name: 'location', type: 'string', required: true, prefillable: true, onboardingField: 'city' }], onboardingMapping: { location: 'city' }, entityMapping: { location: [EntityType.LOCATION] }, defaults: {} },

  // ============================================
  // GARDENING EXTENDED
  // ============================================
  seed_spacing: { uiType: 'seed_spacing', name: 'Seed Spacing Calculator', category: UI_CATEGORIES.HOME, fields: [{ name: 'plant', type: 'enum', required: true, prefillable: false }, { name: 'bed_size', type: 'object', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  raised_bed: { uiType: 'raised_bed', name: 'Raised Bed Soil Calculator', category: UI_CATEGORIES.HOME, fields: [{ name: 'length', type: 'number', required: true, prefillable: false }, { name: 'width', type: 'number', required: true, prefillable: false }, { name: 'height', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  harvest_estimator: { uiType: 'harvest_estimator', name: 'Harvest Estimator', category: UI_CATEGORIES.HOME, fields: [{ name: 'plant', type: 'enum', required: true, prefillable: false }, { name: 'plant_count', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  greenhouse_calculator: { uiType: 'greenhouse_calculator', name: 'Greenhouse Size Calculator', category: UI_CATEGORIES.HOME, fields: [{ name: 'plant_count', type: 'number', required: true, prefillable: false }, { name: 'plant_types', type: 'array', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  frost_date: { uiType: 'frost_date', name: 'Frost Date Calculator', category: UI_CATEGORIES.HOME, fields: [{ name: 'location', type: 'string', required: true, prefillable: true, onboardingField: 'city' }], onboardingMapping: { location: 'city' }, entityMapping: { location: [EntityType.LOCATION] }, defaults: {} },
  watering_schedule: { uiType: 'watering_schedule', name: 'Watering Schedule Generator', category: UI_CATEGORIES.HOME, fields: [{ name: 'plants', type: 'array', required: true, prefillable: false }, { name: 'climate', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },

  // ============================================
  // VEHICLE EXTENDED
  // ============================================
  car_depreciation: { uiType: 'car_depreciation', name: 'Car Depreciation Calculator', category: UI_CATEGORIES.AUTOMOTIVE, fields: [{ name: 'purchase_price', type: 'number', required: true, prefillable: false }, { name: 'years', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  car_lease: { uiType: 'car_lease', name: 'Car Lease Calculator', category: UI_CATEGORIES.AUTOMOTIVE, fields: [{ name: 'msrp', type: 'number', required: true, prefillable: false }, { name: 'residual_value', type: 'number', required: true, prefillable: false }, { name: 'money_factor', type: 'number', required: true, prefillable: false }, { name: 'term_months', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  car_loan: { uiType: 'car_loan', name: 'Car Loan Calculator', category: UI_CATEGORIES.AUTOMOTIVE, fields: [{ name: 'vehicle_price', type: 'number', required: true, prefillable: false }, { name: 'down_payment', type: 'number', required: true, prefillable: false }, { name: 'interest_rate', type: 'number', required: true, prefillable: false }, { name: 'term_months', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  ev_charging: { uiType: 'ev_charging', name: 'EV Charging Time Calculator', category: UI_CATEGORIES.AUTOMOTIVE, fields: [{ name: 'battery_capacity', type: 'number', required: true, prefillable: false }, { name: 'charger_power', type: 'number', required: true, prefillable: false }, { name: 'current_charge', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  ev_range: { uiType: 'ev_range', name: 'EV Range Calculator', category: UI_CATEGORIES.AUTOMOTIVE, fields: [{ name: 'battery_capacity', type: 'number', required: true, prefillable: false }, { name: 'efficiency', type: 'number', required: true, prefillable: false }, { name: 'current_charge', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  ev_savings: { uiType: 'ev_savings', name: 'EV vs Gas Savings', category: UI_CATEGORIES.AUTOMOTIVE, fields: [{ name: 'annual_miles', type: 'number', required: true, prefillable: false }, { name: 'gas_price', type: 'number', required: true, prefillable: false }, { name: 'electricity_rate', type: 'number', required: true, prefillable: false }, { name: 'gas_mpg', type: 'number', required: true, prefillable: false }, { name: 'ev_efficiency', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  oil_change: { uiType: 'oil_change', name: 'Oil Change Reminder', category: UI_CATEGORIES.AUTOMOTIVE, fields: [{ name: 'last_change_date', type: 'date', required: true, prefillable: false }, { name: 'last_change_mileage', type: 'number', required: true, prefillable: false }, { name: 'oil_type', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  tire_size: { uiType: 'tire_size', name: 'Tire Size Calculator', category: UI_CATEGORIES.AUTOMOTIVE, fields: [{ name: 'width', type: 'number', required: true, prefillable: false }, { name: 'aspect_ratio', type: 'number', required: true, prefillable: false }, { name: 'rim_diameter', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  speedometer_error: { uiType: 'speedometer_error', name: 'Speedometer Error Calculator', category: UI_CATEGORIES.AUTOMOTIVE, fields: [{ name: 'original_tire', type: 'object', required: true, prefillable: false }, { name: 'new_tire', type: 'object', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  gas_mileage: { uiType: 'gas_mileage', name: 'Gas Mileage Calculator', category: UI_CATEGORIES.AUTOMOTIVE, fields: [{ name: 'distance', type: 'number', required: true, prefillable: false }, { name: 'fuel_used', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  road_trip_cost: { uiType: 'road_trip_cost', name: 'Road Trip Cost Calculator', category: UI_CATEGORIES.TRAVEL, fields: [{ name: 'distance', type: 'number', required: true, prefillable: false }, { name: 'mpg', type: 'number', required: true, prefillable: false }, { name: 'gas_price', type: 'number', required: true, prefillable: false }, { name: 'tolls', type: 'number', required: false, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  car_insurance: { uiType: 'car_insurance', name: 'Car Insurance Estimator', category: UI_CATEGORIES.AUTOMOTIVE, fields: [{ name: 'vehicle_value', type: 'number', required: true, prefillable: false }, { name: 'driver_age', type: 'number', required: true, prefillable: true, onboardingField: 'age' }, { name: 'location', type: 'string', required: true, prefillable: true, onboardingField: 'city' }], onboardingMapping: { driver_age: 'age', location: 'city' }, entityMapping: { location: [EntityType.LOCATION] }, defaults: {} },
  parking_cost: { uiType: 'parking_cost', name: 'Parking Cost Calculator', category: UI_CATEGORIES.TRAVEL, fields: [{ name: 'hourly_rate', type: 'number', required: true, prefillable: false }, { name: 'hours', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  car_wash_cost: { uiType: 'car_wash_cost', name: 'Car Wash Cost Comparison', category: UI_CATEGORIES.AUTOMOTIVE, fields: [{ name: 'wash_frequency', type: 'enum', required: true, prefillable: false }, { name: 'wash_type', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  motorcycle_mpg: { uiType: 'motorcycle_mpg', name: 'Motorcycle MPG Calculator', category: UI_CATEGORIES.AUTOMOTIVE, fields: [{ name: 'distance', type: 'number', required: true, prefillable: false }, { name: 'fuel_used', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },

  // ============================================
  // MATH & SCIENCE
  // ============================================
  fraction_calculator: { uiType: 'fraction_calculator', name: 'Fraction Calculator', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'numerator1', type: 'number', required: true, prefillable: false }, { name: 'denominator1', type: 'number', required: true, prefillable: false }, { name: 'operation', type: 'enum', required: true, prefillable: false }, { name: 'numerator2', type: 'number', required: true, prefillable: false }, { name: 'denominator2', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  scientific_notation: { uiType: 'scientific_notation', name: 'Scientific Notation Converter', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'number', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  prime_checker: { uiType: 'prime_checker', name: 'Prime Number Checker', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'number', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  gcd_calculator: { uiType: 'gcd_calculator', name: 'GCD Calculator', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'number1', type: 'number', required: true, prefillable: false }, { name: 'number2', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  lcm_calculator: { uiType: 'lcm_calculator', name: 'LCM Calculator', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'number1', type: 'number', required: true, prefillable: false }, { name: 'number2', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  pythagorean: { uiType: 'pythagorean', name: 'Pythagorean Theorem Calculator', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'a', type: 'number', required: false, prefillable: false }, { name: 'b', type: 'number', required: false, prefillable: false }, { name: 'c', type: 'number', required: false, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  hex_converter: { uiType: 'hex_converter', name: 'Hexadecimal Converter', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'value', type: 'string', required: true, prefillable: false }, { name: 'from_base', type: 'enum', required: true, prefillable: false }, { name: 'to_base', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  roman_numeral: { uiType: 'roman_numeral', name: 'Roman Numeral Converter', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'value', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  permutation: { uiType: 'permutation', name: 'Permutation Calculator', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'n', type: 'number', required: true, prefillable: false }, { name: 'r', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  combination: { uiType: 'combination', name: 'Combination Calculator', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'n', type: 'number', required: true, prefillable: false }, { name: 'r', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },

  // ============================================
  // TRAVEL EXTENDED
  // ============================================
  flight_time: { uiType: 'flight_time', name: 'Flight Time Calculator', category: UI_CATEGORIES.TRAVEL, fields: [{ name: 'origin', type: 'string', required: true, prefillable: true, onboardingField: 'city' }, { name: 'destination', type: 'string', required: true, prefillable: false }], onboardingMapping: { origin: 'city' }, entityMapping: { origin: [EntityType.LOCATION], destination: [EntityType.LOCATION] }, defaults: {} },
  jet_lag: { uiType: 'jet_lag', name: 'Jet Lag Calculator', category: UI_CATEGORIES.TRAVEL, fields: [{ name: 'origin_timezone', type: 'enum', required: true, prefillable: true, onboardingField: 'timezone' }, { name: 'destination_timezone', type: 'enum', required: true, prefillable: false }], onboardingMapping: { origin_timezone: 'timezone' }, entityMapping: {}, defaults: {} },
  packing_list: { uiType: 'packing_list', name: 'Packing List Generator', category: UI_CATEGORIES.TRAVEL, fields: [{ name: 'destination', type: 'string', required: true, prefillable: false }, { name: 'duration', type: 'number', required: true, prefillable: false }, { name: 'trip_type', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: { destination: [EntityType.LOCATION] }, defaults: {} },
  vacation_budget: { uiType: 'vacation_budget', name: 'Vacation Budget Planner', category: UI_CATEGORIES.TRAVEL, fields: [{ name: 'destination', type: 'string', required: true, prefillable: false }, { name: 'duration', type: 'number', required: true, prefillable: false }, { name: 'travelers', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: { destination: [EntityType.LOCATION] }, defaults: {} },
  hotel_cost: { uiType: 'hotel_cost', name: 'Hotel Cost Calculator', category: UI_CATEGORIES.TRAVEL, fields: [{ name: 'nightly_rate', type: 'number', required: true, prefillable: false }, { name: 'nights', type: 'number', required: true, prefillable: false }, { name: 'tax_rate', type: 'number', required: false, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  travel_insurance: { uiType: 'travel_insurance', name: 'Travel Insurance Calculator', category: UI_CATEGORIES.TRAVEL, fields: [{ name: 'trip_cost', type: 'number', required: true, prefillable: false }, { name: 'age', type: 'number', required: true, prefillable: true, onboardingField: 'age' }, { name: 'duration', type: 'number', required: true, prefillable: false }], onboardingMapping: { age: 'age' }, entityMapping: {}, defaults: {} },
  visa_checker: { uiType: 'visa_checker', name: 'Visa Requirement Checker', category: UI_CATEGORIES.TRAVEL, fields: [{ name: 'passport_country', type: 'enum', required: true, prefillable: true, onboardingField: 'country' }, { name: 'destination', type: 'enum', required: true, prefillable: false }], onboardingMapping: { passport_country: 'country' }, entityMapping: {}, defaults: {} },
  travel_adapter: { uiType: 'travel_adapter', name: 'Travel Adapter Finder', category: UI_CATEGORIES.TRAVEL, fields: [{ name: 'origin_country', type: 'enum', required: true, prefillable: true, onboardingField: 'country' }, { name: 'destination', type: 'enum', required: true, prefillable: false }], onboardingMapping: { origin_country: 'country' }, entityMapping: {}, defaults: {} },
  luggage_size: { uiType: 'luggage_size', name: 'Luggage Size Guide', category: UI_CATEGORIES.TRAVEL, fields: [{ name: 'airline', type: 'enum', required: true, prefillable: false }, { name: 'luggage_type', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  airport_wait: { uiType: 'airport_wait', name: 'Airport Wait Time Estimator', category: UI_CATEGORIES.TRAVEL, fields: [{ name: 'airport', type: 'string', required: true, prefillable: false }, { name: 'day_of_week', type: 'enum', required: true, prefillable: false }, { name: 'time', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  cruise_cost: { uiType: 'cruise_cost', name: 'Cruise Cost Calculator', category: UI_CATEGORIES.TRAVEL, fields: [{ name: 'base_fare', type: 'number', required: true, prefillable: false }, { name: 'nights', type: 'number', required: true, prefillable: false }, { name: 'travelers', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  camping_checklist: { uiType: 'camping_checklist', name: 'Camping Checklist Generator', category: UI_CATEGORIES.TRAVEL, fields: [{ name: 'duration', type: 'number', required: true, prefillable: false }, { name: 'camping_type', type: 'enum', required: true, prefillable: false }, { name: 'group_size', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  hiking_calories: { uiType: 'hiking_calories', name: 'Hiking Calories Calculator', category: UI_CATEGORIES.SPORTS, fields: [{ name: 'weight', type: 'number', required: true, prefillable: true, onboardingField: 'weight_kg' }, { name: 'distance', type: 'number', required: true, prefillable: false }, { name: 'elevation_gain', type: 'number', required: true, prefillable: false }, { name: 'pack_weight', type: 'number', required: false, prefillable: false }], onboardingMapping: { weight: 'weight_kg' }, entityMapping: {}, defaults: {} },
  altitude_sickness: { uiType: 'altitude_sickness', name: 'Altitude Sickness Risk', category: UI_CATEGORIES.HEALTH, fields: [{ name: 'current_altitude', type: 'number', required: true, prefillable: false }, { name: 'target_altitude', type: 'number', required: true, prefillable: false }, { name: 'acclimatization_days', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  ski_resort: { uiType: 'ski_resort', name: 'Ski Trip Cost Calculator', category: UI_CATEGORIES.TRAVEL, fields: [{ name: 'days', type: 'number', required: true, prefillable: false }, { name: 'lift_ticket_cost', type: 'number', required: true, prefillable: false }, { name: 'rental_needed', type: 'boolean', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },

  // ============================================
  // MISCELLANEOUS
  // ============================================
  name_generator: { uiType: 'name_generator', name: 'Random Name Generator', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'gender', type: 'enum', required: false, prefillable: false }, { name: 'origin', type: 'enum', required: false, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  username_generator: { uiType: 'username_generator', name: 'Username Generator', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'style', type: 'enum', required: true, prefillable: false }, { name: 'include_numbers', type: 'boolean', required: false, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  lorem_ipsum: { uiType: 'lorem_ipsum', name: 'Lorem Ipsum Generator', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'paragraphs', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  speaking_time: { uiType: 'speaking_time', name: 'Speaking Time Calculator', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'word_count', type: 'number', required: true, prefillable: false }, { name: 'pace', type: 'enum', required: false, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: { pace: 'normal' } },
  text_reverser: { uiType: 'text_reverser', name: 'Text Reverser', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'text', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  palindrome_checker: { uiType: 'palindrome_checker', name: 'Palindrome Checker', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'text', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  pig_latin: { uiType: 'pig_latin', name: 'Pig Latin Translator', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'text', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  emoji_translator: { uiType: 'emoji_translator', name: 'Emoji Translator', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'text', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  ascii_art: { uiType: 'ascii_art', name: 'ASCII Art Generator', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'text', type: 'string', required: true, prefillable: false }, { name: 'font', type: 'enum', required: false, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  fancy_text: { uiType: 'fancy_text', name: 'Fancy Text Generator', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'text', type: 'string', required: true, prefillable: false }, { name: 'style', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  text_to_speech: { uiType: 'text_to_speech', name: 'Text to Speech', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'text', type: 'string', required: true, prefillable: false }, { name: 'voice', type: 'enum', required: false, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  symbol_finder: { uiType: 'symbol_finder', name: 'Symbol Finder', category: UI_CATEGORIES.PROFESSIONAL, fields: [{ name: 'category', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  invisible_text: { uiType: 'invisible_text', name: 'Invisible Text Generator', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'length', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  spell_checker: { uiType: 'spell_checker', name: 'Spell Checker', category: UI_CATEGORIES.EDUCATION, fields: [{ name: 'text', type: 'string', required: true, prefillable: false }, { name: 'language', type: 'enum', required: false, prefillable: true, onboardingField: 'preferred_language' }], onboardingMapping: { language: 'preferred_language' }, entityMapping: {}, defaults: {} },

  // ============================================
  // FINAL BATCH - POPULAR TOOLS
  // ============================================
  love_calculator: { uiType: 'love_calculator', name: 'Love Calculator', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'name1', type: 'string', required: true, prefillable: false }, { name: 'name2', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  magic_8_ball: { uiType: 'magic_8_ball', name: 'Magic 8 Ball', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'question', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  fortune_cookie: { uiType: 'fortune_cookie', name: 'Fortune Cookie Generator', category: UI_CATEGORIES.ENTERTAINMENT, fields: [], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  daily_horoscope: { uiType: 'daily_horoscope', name: 'Daily Horoscope', category: UI_CATEGORIES.ASTROLOGY, fields: [{ name: 'zodiac_sign', type: 'enum', required: true, prefillable: true, onboardingField: 'zodiac_sign' }], onboardingMapping: { zodiac_sign: 'zodiac_sign' }, entityMapping: {}, defaults: {} },
  lucky_number: { uiType: 'lucky_number', name: 'Lucky Number Generator', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'birth_date', type: 'date', required: true, prefillable: true, onboardingField: 'date_of_birth' }], onboardingMapping: { birth_date: 'date_of_birth' }, entityMapping: {}, defaults: {} },
  spirit_animal: { uiType: 'spirit_animal', name: 'Spirit Animal Finder', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'birth_date', type: 'date', required: true, prefillable: true, onboardingField: 'date_of_birth' }], onboardingMapping: { birth_date: 'date_of_birth' }, entityMapping: {}, defaults: {} },
  personality_quiz: { uiType: 'personality_quiz', name: 'Personality Quiz', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'quiz_type', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  compatibility_test: { uiType: 'compatibility_test', name: 'Compatibility Test', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'sign1', type: 'enum', required: true, prefillable: true, onboardingField: 'zodiac_sign' }, { name: 'sign2', type: 'enum', required: true, prefillable: false }], onboardingMapping: { sign1: 'zodiac_sign' }, entityMapping: {}, defaults: {} },
  biorhythm: { uiType: 'biorhythm', name: 'Biorhythm Calculator', category: UI_CATEGORIES.HEALTH, fields: [{ name: 'birth_date', type: 'date', required: true, prefillable: true, onboardingField: 'date_of_birth' }], onboardingMapping: { birth_date: 'date_of_birth' }, entityMapping: {}, defaults: {} },
  dream_interpreter: { uiType: 'dream_interpreter', name: 'Dream Interpreter', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'dream_symbols', type: 'array', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  name_meaning: { uiType: 'name_meaning', name: 'Name Meaning Lookup', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'name', type: 'string', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  random_picker: { uiType: 'random_picker', name: 'Random Picker', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'items', type: 'array', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  spin_wheel: { uiType: 'spin_wheel', name: 'Spin the Wheel', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'options', type: 'array', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  lottery_picker: { uiType: 'lottery_picker', name: 'Lottery Number Picker', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'lottery_type', type: 'enum', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  bingo_caller: { uiType: 'bingo_caller', name: 'Bingo Number Caller', category: UI_CATEGORIES.ENTERTAINMENT, fields: [], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  bracket_generator: { uiType: 'bracket_generator', name: 'Tournament Bracket Generator', category: UI_CATEGORIES.SPORTS, fields: [{ name: 'participants', type: 'array', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  schedule_maker: { uiType: 'schedule_maker', name: 'Round Robin Schedule Maker', category: UI_CATEGORIES.SPORTS, fields: [{ name: 'teams', type: 'array', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  seating_chart: { uiType: 'seating_chart', name: 'Seating Chart Generator', category: UI_CATEGORIES.EVENTS, fields: [{ name: 'guests', type: 'array', required: true, prefillable: false }, { name: 'tables', type: 'number', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  gift_exchange: { uiType: 'gift_exchange', name: 'Secret Santa Generator', category: UI_CATEGORIES.EVENTS, fields: [{ name: 'participants', type: 'array', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  task_assigner: { uiType: 'task_assigner', name: 'Random Task Assigner', category: UI_CATEGORIES.HOUSEHOLD, fields: [{ name: 'tasks', type: 'array', required: true, prefillable: false }, { name: 'people', type: 'array', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  chore_wheel: { uiType: 'chore_wheel', name: 'Chore Wheel', category: UI_CATEGORIES.HOUSEHOLD, fields: [{ name: 'chores', type: 'array', required: true, prefillable: false }, { name: 'family_members', type: 'array', required: true, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  movie_picker: { uiType: 'movie_picker', name: 'Random Movie Picker', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'genre', type: 'enum', required: false, prefillable: false }], onboardingMapping: {}, entityMapping: {}, defaults: {} },
  restaurant_picker: { uiType: 'restaurant_picker', name: 'Random Restaurant Picker', category: UI_CATEGORIES.ENTERTAINMENT, fields: [{ name: 'cuisine', type: 'enum', required: false, prefillable: false }, { name: 'location', type: 'string', required: true, prefillable: true, onboardingField: 'city' }], onboardingMapping: { location: 'city' }, entityMapping: { location: [EntityType.LOCATION] }, defaults: {} },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get registry entry for a UI type
 */
export function getUIRegistryEntry(uiType: string): UIRegistryEntry | null {
  return UI_REGISTRY[uiType] || null;
}

/**
 * Get all prefillable fields for a UI type
 */
export function getPrefillableFields(uiType: string): string[] {
  const entry = UI_REGISTRY[uiType];
  if (!entry) return [];
  return entry.fields
    .filter((f) => f.prefillable)
    .map((f) => f.name);
}

/**
 * Get onboarding mapping for a UI type
 */
export function getOnboardingMapping(uiType: string): Record<string, string> {
  const entry = UI_REGISTRY[uiType];
  return entry?.onboardingMapping || {};
}

/**
 * Get entity mapping for a UI type
 */
export function getEntityMapping(uiType: string): Record<string, EntityType[]> {
  const entry = UI_REGISTRY[uiType];
  return entry?.entityMapping || {};
}

/**
 * Get all UI types in a category
 */
export function getUIsByCategory(category: string): string[] {
  return Object.entries(UI_REGISTRY)
    .filter(([_, entry]) => entry.category === category)
    .map(([uiType, _]) => uiType);
}

/**
 * Search UI registry by name or type
 */
export function searchUIRegistry(query: string): UIRegistryEntry[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(UI_REGISTRY).filter(
    (entry) =>
      entry.uiType.toLowerCase().includes(lowerQuery) ||
      entry.name.toLowerCase().includes(lowerQuery),
  );
}

/**
 * Get all registered UI types
 */
export function getAllUITypes(): string[] {
  return Object.keys(UI_REGISTRY);
}

/**
 * Get stats about the registry
 */
export function getRegistryStats(): {
  totalUIs: number;
  byCategory: Record<string, number>;
  prefillableFieldsCount: number;
} {
  const byCategory: Record<string, number> = {};
  let prefillableFieldsCount = 0;

  for (const entry of Object.values(UI_REGISTRY)) {
    byCategory[entry.category] = (byCategory[entry.category] || 0) + 1;
    prefillableFieldsCount += entry.fields.filter((f) => f.prefillable).length;
  }

  return {
    totalUIs: Object.keys(UI_REGISTRY).length,
    byCategory,
    prefillableFieldsCount,
  };
}

/**
 * Find tools by user intent patterns
 * Matches user query against intentPatterns defined for each tool
 */
export function findToolsByIntent(query: string): UIRegistryEntry[] {
  const queryLower = query.toLowerCase();
  return Object.values(UI_REGISTRY).filter(tool =>
    tool.intentPatterns?.some(pattern => queryLower.includes(pattern))
  );
}

/**
 * Find tools that can handle a specific attachment MIME type
 * Supports wildcard MIME types like 'image/*'
 */
export function findToolsByAttachmentType(mimeType: string): UIRegistryEntry[] {
  return Object.values(UI_REGISTRY).filter(tool =>
    tool.attachmentFields && Object.keys(tool.attachmentFields).some(type => {
      if (type.endsWith('/*')) {
        return mimeType.startsWith(type.replace('/*', '/'));
      }
      return type === mimeType;
    })
  );
}

/**
 * Get tools by primary action verb
 */
export function findToolsByAction(action: string): UIRegistryEntry[] {
  const actionLower = action.toLowerCase();
  return Object.values(UI_REGISTRY).filter(tool =>
    tool.primaryAction?.toLowerCase() === actionLower
  );
}

/**
 * Get all tools that have intent patterns defined
 */
export function getToolsWithIntentPatterns(): UIRegistryEntry[] {
  return Object.values(UI_REGISTRY).filter(tool =>
    tool.intentPatterns && tool.intentPatterns.length > 0
  );
}

/**
 * Get all tools that can handle file attachments
 */
export function getToolsWithAttachmentSupport(): UIRegistryEntry[] {
  return Object.values(UI_REGISTRY).filter(tool =>
    tool.attachmentFields && Object.keys(tool.attachmentFields).length > 0
  );
}
