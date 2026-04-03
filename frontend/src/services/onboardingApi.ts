/**
 * Onboarding API Service
 * Handles all onboarding-related API calls
 */

import { api } from '@/lib/api';

// ============================================
// TYPES
// ============================================

export type AccountType = 'individual' | 'team';
export type UserRole = 'developer' | 'designer' | 'marketer' | 'manager' | 'student' | 'freelancer' | 'business_owner' | 'other';
export type PrimaryUseCase = 'content_creation' | 'development' | 'data_analysis' | 'business' | 'personal' | 'education';
export type Industry = 'technology' | 'finance' | 'healthcare' | 'education' | 'ecommerce' | 'marketing' | 'legal' | 'real_estate' | 'other';
export type CompanySize = 'solo' | '2-10' | '11-50' | '51-200' | '201-1000' | '1000+';
export type MeasurementSystem = 'metric' | 'imperial';
export type TonePreference = 'casual' | 'professional' | 'formal' | 'friendly';
export type OutputLength = 'concise' | 'balanced' | 'detailed';
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';
export type FitnessGoal = 'lose_weight' | 'gain_muscle' | 'maintain' | 'improve_fitness';
export type DietaryPreference = 'none' | 'vegetarian' | 'vegan' | 'keto' | 'paleo' | 'halal' | 'kosher';
export type IncomeRange = 'prefer_not_to_say' | '0-25k' | '25k-50k' | '50k-100k' | '100k-200k' | '200k+';
export type FinancialGoal = 'save_more' | 'invest' | 'pay_debt' | 'budget_better' | 'retirement';

export interface ConnectedService {
  service: string;
  connected_at: string;
}

export interface OnboardingStatus {
  onboarding_completed: boolean;
  onboarding_step: number;
  onboarding_completed_at?: string;
}

export interface OnboardingData extends OnboardingStatus {
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
  connected_services: ConnectedService[];
  created_at: string;
  updated_at: string;
}

export interface OnboardingStep1 {
  account_type?: AccountType;
}

export interface OnboardingStep2 {
  display_name?: string;
  role?: UserRole;
  primary_use_case?: PrimaryUseCase;
  industry?: Industry;
  company_name?: string;
  company_size?: CompanySize;
}

export interface OnboardingStep3 {
  preferred_language?: string;
  preferred_currency?: string;
  timezone?: string;
  country?: string;
  measurement_system?: MeasurementSystem;
}

export interface OnboardingStep4 {
  tone_preference?: TonePreference;
  output_length?: OutputLength;
}

export interface OnboardingStep5 {
  date_of_birth?: string;
  gender?: Gender;
  height_cm?: number;
  weight_kg?: number;
  fitness_goal?: FitnessGoal;
  dietary_preference?: DietaryPreference;
  income_range?: IncomeRange;
  financial_goal?: FinancialGoal;
  connected_services?: ConnectedService[];
}

export type CompleteOnboardingDto = OnboardingStep1 &
  OnboardingStep2 &
  OnboardingStep3 &
  OnboardingStep4 &
  OnboardingStep5;

export interface UpdateStepDto {
  step: number;
  data?: Partial<CompleteOnboardingDto>;
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Get onboarding status (whether completed and current step)
 */
export async function getOnboardingStatus(): Promise<OnboardingStatus> {
  const response = await api.get('/onboarding/status');
  // API returns { statusCode, message, data } - extract the data
  const result = response?.data || response;
  // Normalize to snake_case (backend may return camelCase)
  return {
    onboarding_completed: result.onboarding_completed ?? result.onboardingCompleted ?? false,
    onboarding_step: result.onboarding_step ?? result.onboardingStep ?? 0,
    onboarding_completed_at: result.onboarding_completed_at ?? result.onboardingCompletedAt,
  };
}

/**
 * Get full onboarding data
 */
export async function getOnboarding(): Promise<OnboardingData | null> {
  const response = await api.get('/onboarding');
  console.log('Onboarding API response:', response);
  console.log('Onboarding data:', response?.data);
  return response?.data || null;
}

/**
 * Save onboarding data (without completing)
 */
export async function saveOnboarding(data: CompleteOnboardingDto): Promise<OnboardingData> {
  const response = await api.post('/onboarding', data);
  return response.data;
}

/**
 * Complete onboarding with all data
 */
export async function completeOnboarding(data: CompleteOnboardingDto): Promise<OnboardingData> {
  const response = await api.post('/onboarding/complete', data);
  return response.data;
}

/**
 * Update a specific onboarding step
 */
export async function updateOnboardingStep(dto: UpdateStepDto): Promise<OnboardingData> {
  const response = await api.patch('/onboarding/step', dto);
  return response.data;
}

/**
 * Skip onboarding entirely
 */
export async function skipOnboarding(): Promise<OnboardingData> {
  const response = await api.post('/onboarding/skip');
  return response.data;
}

/**
 * Reset onboarding to start over
 */
export async function resetOnboarding(): Promise<{ success: boolean }> {
  const response = await api.post('/onboarding/reset');
  return response.data;
}

/**
 * Update a specific field
 */
export async function updateOnboardingField(
  field: string,
  value: any
): Promise<OnboardingData> {
  const response = await api.patch(`/onboarding/field/${field}`, { value });
  return response.data;
}

/**
 * Add a connected service
 */
export async function addConnectedService(service: string): Promise<OnboardingData> {
  const response = await api.post(`/onboarding/services/${service}`);
  return response.data;
}

/**
 * Remove a connected service
 */
export async function removeConnectedService(service: string): Promise<OnboardingData> {
  const response = await api.patch(`/onboarding/services/${service}/remove`);
  return response.data;
}
