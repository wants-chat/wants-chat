import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
  IsDateString,
  IsArray,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

// Enums for type safety
export enum AccountType {
  INDIVIDUAL = 'individual',
  TEAM = 'team',
}

export enum UserRole {
  DEVELOPER = 'developer',
  DESIGNER = 'designer',
  MARKETER = 'marketer',
  MANAGER = 'manager',
  STUDENT = 'student',
  FREELANCER = 'freelancer',
  BUSINESS_OWNER = 'business_owner',
  OTHER = 'other',
}

export enum PrimaryUseCase {
  CONTENT_CREATION = 'content_creation',
  DEVELOPMENT = 'development',
  DATA_ANALYSIS = 'data_analysis',
  BUSINESS = 'business',
  PERSONAL = 'personal',
  EDUCATION = 'education',
}

export enum Industry {
  TECHNOLOGY = 'technology',
  FINANCE = 'finance',
  HEALTHCARE = 'healthcare',
  EDUCATION = 'education',
  ECOMMERCE = 'ecommerce',
  MARKETING = 'marketing',
  LEGAL = 'legal',
  REAL_ESTATE = 'real_estate',
  OTHER = 'other',
}

export enum CompanySize {
  SOLO = 'solo',
  SMALL = '2-10',
  MEDIUM = '11-50',
  LARGE = '51-200',
  ENTERPRISE = '201-1000',
  CORPORATION = '1000+',
}

export enum MeasurementSystem {
  METRIC = 'metric',
  IMPERIAL = 'imperial',
}

export enum TonePreference {
  CASUAL = 'casual',
  PROFESSIONAL = 'professional',
  FORMAL = 'formal',
  FRIENDLY = 'friendly',
}

export enum OutputLength {
  CONCISE = 'concise',
  BALANCED = 'balanced',
  DETAILED = 'detailed',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}

export enum FitnessGoal {
  LOSE_WEIGHT = 'lose_weight',
  GAIN_MUSCLE = 'gain_muscle',
  MAINTAIN = 'maintain',
  IMPROVE_FITNESS = 'improve_fitness',
}

export enum DietaryPreference {
  NONE = 'none',
  VEGETARIAN = 'vegetarian',
  VEGAN = 'vegan',
  KETO = 'keto',
  PALEO = 'paleo',
  HALAL = 'halal',
  KOSHER = 'kosher',
}

export enum IncomeRange {
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
  RANGE_0_25K = '0-25k',
  RANGE_25K_50K = '25k-50k',
  RANGE_50K_100K = '50k-100k',
  RANGE_100K_200K = '100k-200k',
  RANGE_200K_PLUS = '200k+',
}

export enum FinancialGoal {
  SAVE_MORE = 'save_more',
  INVEST = 'invest',
  PAY_DEBT = 'pay_debt',
  BUDGET_BETTER = 'budget_better',
  RETIREMENT = 'retirement',
}

// Connected Service DTO
export class ConnectedServiceDto {
  @IsString()
  @IsOptional()
  service?: string;

  @IsString()
  @IsOptional()
  connectedAt?: string;

  @IsString()
  @IsOptional()
  connected_at?: string;
}

// Complete Onboarding DTO - accepts both camelCase (frontend) and snake_case
export class CompleteOnboardingDto {
  // Step 1 - Account Type
  @IsEnum(AccountType)
  @IsOptional()
  accountType?: AccountType;

  @IsEnum(AccountType)
  @IsOptional()
  account_type?: AccountType;

  // Step 2 - About You
  @IsString()
  @IsOptional()
  displayName?: string;

  @IsString()
  @IsOptional()
  display_name?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsEnum(PrimaryUseCase)
  @IsOptional()
  primaryUseCase?: PrimaryUseCase;

  @IsEnum(PrimaryUseCase)
  @IsOptional()
  primary_use_case?: PrimaryUseCase;

  @IsEnum(Industry)
  @IsOptional()
  industry?: Industry;

  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  company_name?: string;

  @IsEnum(CompanySize)
  @IsOptional()
  companySize?: CompanySize;

  @IsEnum(CompanySize)
  @IsOptional()
  company_size?: CompanySize;

  // Step 3 - Regional Settings
  @IsString()
  @IsOptional()
  preferredLanguage?: string;

  @IsString()
  @IsOptional()
  preferred_language?: string;

  @IsString()
  @IsOptional()
  preferredCurrency?: string;

  @IsString()
  @IsOptional()
  preferred_currency?: string;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsEnum(MeasurementSystem)
  @IsOptional()
  measurementSystem?: MeasurementSystem;

  @IsEnum(MeasurementSystem)
  @IsOptional()
  measurement_system?: MeasurementSystem;

  // Step 4 - Output Preferences
  @IsEnum(TonePreference)
  @IsOptional()
  tonePreference?: TonePreference;

  @IsEnum(TonePreference)
  @IsOptional()
  tone_preference?: TonePreference;

  @IsEnum(OutputLength)
  @IsOptional()
  outputLength?: OutputLength;

  @IsEnum(OutputLength)
  @IsOptional()
  output_length?: OutputLength;

  // Step 5 - Health & Fitness
  @IsString()
  @IsOptional()
  dateOfBirth?: string;

  @IsString()
  @IsOptional()
  date_of_birth?: string;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsNumber()
  @IsOptional()
  @Min(50)
  @Max(300)
  heightCm?: number;

  @IsNumber()
  @IsOptional()
  @Min(50)
  @Max(300)
  height_cm?: number;

  @IsNumber()
  @IsOptional()
  @Min(20)
  @Max(500)
  weightKg?: number;

  @IsNumber()
  @IsOptional()
  @Min(20)
  @Max(500)
  weight_kg?: number;

  @IsEnum(FitnessGoal)
  @IsOptional()
  fitnessGoal?: FitnessGoal;

  @IsEnum(FitnessGoal)
  @IsOptional()
  fitness_goal?: FitnessGoal;

  @IsEnum(DietaryPreference)
  @IsOptional()
  dietaryPreference?: DietaryPreference;

  @IsEnum(DietaryPreference)
  @IsOptional()
  dietary_preference?: DietaryPreference;

  // Step 5 - Finance
  @IsEnum(IncomeRange)
  @IsOptional()
  incomeRange?: IncomeRange;

  @IsEnum(IncomeRange)
  @IsOptional()
  income_range?: IncomeRange;

  @IsEnum(FinancialGoal)
  @IsOptional()
  financialGoal?: FinancialGoal;

  @IsEnum(FinancialGoal)
  @IsOptional()
  financial_goal?: FinancialGoal;

  // Connected Services
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConnectedServiceDto)
  @IsOptional()
  connectedServices?: ConnectedServiceDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConnectedServiceDto)
  @IsOptional()
  connected_services?: ConnectedServiceDto[];

  // Internal fields (from existing record)
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  user_id?: string;

  @IsBoolean()
  @IsOptional()
  onboardingCompleted?: boolean;

  @IsBoolean()
  @IsOptional()
  onboarding_completed?: boolean;

  @IsNumber()
  @IsOptional()
  onboardingStep?: number;

  @IsNumber()
  @IsOptional()
  onboarding_step?: number;

  @IsString()
  @IsOptional()
  onboardingCompletedAt?: string;

  @IsString()
  @IsOptional()
  onboarding_completed_at?: string;

  @IsString()
  @IsOptional()
  createdAt?: string;

  @IsString()
  @IsOptional()
  created_at?: string;

  @IsString()
  @IsOptional()
  updatedAt?: string;

  @IsString()
  @IsOptional()
  updated_at?: string;
}

// Update Onboarding Step DTO
export class UpdateOnboardingStepDto {
  @IsNumber()
  @Min(0)
  @Max(5)
  step: number;

  @IsOptional()
  data?: Partial<CompleteOnboardingDto>;
}

// Response DTOs (snake_case for database compatibility)
export class OnboardingStatusDto {
  onboarding_completed: boolean;
  onboarding_step: number;
  onboarding_completed_at?: string;
}

export class OnboardingResponseDto extends OnboardingStatusDto {
  id: string;
  user_id: string;
  account_type: AccountType;
  display_name?: string;
  role?: UserRole;
  primary_use_case?: PrimaryUseCase;
  industry?: Industry;
  company_name?: string;
  company_size?: CompanySize;
  preferred_language: string;
  preferred_currency: string;
  timezone?: string;
  country?: string;
  measurement_system: MeasurementSystem;
  tone_preference: TonePreference;
  output_length: OutputLength;
  date_of_birth?: string;
  gender?: Gender;
  height_cm?: number;
  weight_kg?: number;
  fitness_goal?: FitnessGoal;
  dietary_preference?: DietaryPreference;
  income_range?: IncomeRange;
  financial_goal?: FinancialGoal;
  connected_services: ConnectedServiceDto[];
  created_at: string;
  updated_at: string;
}
