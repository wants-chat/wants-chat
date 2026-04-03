/**
 * OnboardingPage - 5-step onboarding flow
 *
 * Steps:
 * 1. Account Type (Individual/Team)
 * 2. About You (Name, Role, Industry)
 * 3. Regional Settings (Language, Currency, Timezone)
 * 4. Output Preferences (Tone, Length)
 * 5. Optional Details (Health, Finance - can skip individual sections)
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Building2,
  Globe,
  Settings,
  Heart,
  ChevronRight,
  ChevronLeft,
  Check,
  X,
  Sparkles,
  Loader2,
  Search,
} from 'lucide-react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useAuth } from '@/contexts/AuthContext';
import { countryCodes } from '@/data/countryCodes';
import type {
  AccountType,
  UserRole,
  PrimaryUseCase,
  Industry,
  CompanySize,
  MeasurementSystem,
  TonePreference,
  OutputLength,
  Gender,
  FitnessGoal,
  DietaryPreference,
  IncomeRange,
  FinancialGoal,
  CompleteOnboardingDto,
} from '@/services/onboardingApi';

// ============================================
// STEP DATA
// ============================================

const STEPS = [
  { id: 1, title: 'Account Type', icon: User, description: 'How will you use Wants?' },
  { id: 2, title: 'About You', icon: Building2, description: 'Tell us a bit about yourself' },
  { id: 3, title: 'Regional', icon: Globe, description: 'Your location preferences' },
  { id: 4, title: 'Output Style', icon: Settings, description: 'How should AI respond?' },
  { id: 5, title: 'Optional', icon: Heart, description: 'Health & finance (optional)' },
];

const ACCOUNT_TYPES: { value: AccountType; label: string; description: string }[] = [
  { value: 'individual', label: 'Individual', description: 'Personal use for yourself' },
  { value: 'team', label: 'Team', description: 'Collaborate with others' },
];

const USER_ROLES: { value: UserRole; label: string }[] = [
  { value: 'developer', label: 'Developer' },
  { value: 'designer', label: 'Designer' },
  { value: 'marketer', label: 'Marketer' },
  { value: 'manager', label: 'Manager' },
  { value: 'student', label: 'Student' },
  { value: 'freelancer', label: 'Freelancer' },
  { value: 'business_owner', label: 'Business Owner' },
  { value: 'other', label: 'Other' },
];

const USE_CASES: { value: PrimaryUseCase; label: string }[] = [
  { value: 'content_creation', label: 'Content Creation' },
  { value: 'development', label: 'Development' },
  { value: 'data_analysis', label: 'Data Analysis' },
  { value: 'business', label: 'Business Tasks' },
  { value: 'personal', label: 'Personal Use' },
  { value: 'education', label: 'Education' },
];

const INDUSTRIES: { value: Industry; label: string }[] = [
  { value: 'technology', label: 'Technology' },
  { value: 'finance', label: 'Finance' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'education', label: 'Education' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'legal', label: 'Legal' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'other', label: 'Other' },
];

const COMPANY_SIZES: { value: CompanySize; label: string }[] = [
  { value: 'solo', label: 'Solo' },
  { value: '2-10', label: '2-10' },
  { value: '11-50', label: '11-50' },
  { value: '51-200', label: '51-200' },
  { value: '201-1000', label: '201-1000' },
  { value: '1000+', label: '1000+' },
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ar', label: 'Arabic' },
  { value: 'hi', label: 'Hindi' },
];

const CURRENCIES = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'JPY', label: 'JPY (¥)' },
  { value: 'CAD', label: 'CAD ($)' },
  { value: 'AUD', label: 'AUD ($)' },
  { value: 'INR', label: 'INR (₹)' },
  { value: 'CNY', label: 'CNY (¥)' },
  { value: 'BDT', label: 'BDT (৳)' },
];

const MEASUREMENT_SYSTEMS: { value: MeasurementSystem; label: string }[] = [
  { value: 'metric', label: 'Metric (kg, cm)' },
  { value: 'imperial', label: 'Imperial (lb, in)' },
];

const TONE_PREFERENCES: { value: TonePreference; label: string; description: string }[] = [
  { value: 'casual', label: 'Casual', description: 'Friendly and relaxed' },
  { value: 'professional', label: 'Professional', description: 'Clear and business-like' },
  { value: 'formal', label: 'Formal', description: 'Polished and official' },
  { value: 'friendly', label: 'Friendly', description: 'Warm and approachable' },
];

const OUTPUT_LENGTHS: { value: OutputLength; label: string; description: string }[] = [
  { value: 'concise', label: 'Concise', description: 'Brief and to the point' },
  { value: 'balanced', label: 'Balanced', description: 'Medium detail level' },
  { value: 'detailed', label: 'Detailed', description: 'Comprehensive coverage' },
];

const GENDERS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

const FITNESS_GOALS: { value: FitnessGoal; label: string }[] = [
  { value: 'lose_weight', label: 'Lose Weight' },
  { value: 'gain_muscle', label: 'Gain Muscle' },
  { value: 'maintain', label: 'Maintain' },
  { value: 'improve_fitness', label: 'Improve Fitness' },
];

const DIETARY_PREFERENCES: { value: DietaryPreference; label: string }[] = [
  { value: 'none', label: 'No Preference' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'keto', label: 'Keto' },
  { value: 'paleo', label: 'Paleo' },
  { value: 'halal', label: 'Halal' },
  { value: 'kosher', label: 'Kosher' },
];

const INCOME_RANGES: { value: IncomeRange; label: string }[] = [
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
  { value: '0-25k', label: '$0 - $25k' },
  { value: '25k-50k', label: '$25k - $50k' },
  { value: '50k-100k', label: '$50k - $100k' },
  { value: '100k-200k', label: '$100k - $200k' },
  { value: '200k+', label: '$200k+' },
];

const FINANCIAL_GOALS: { value: FinancialGoal; label: string }[] = [
  { value: 'save_more', label: 'Save More' },
  { value: 'invest', label: 'Invest' },
  { value: 'pay_debt', label: 'Pay Off Debt' },
  { value: 'budget_better', label: 'Budget Better' },
  { value: 'retirement', label: 'Plan for Retirement' },
];

// ============================================
// MAIN COMPONENT
// ============================================

// Helper to get max date (13 years ago from today)
const getMaxDateOfBirth = (): string => {
  const today = new Date();
  const maxDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
  return maxDate.toISOString().split('T')[0];
};

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateStep, complete, skip, loading, data, isCompleted, checked } = useOnboarding();

  const [currentStep, setCurrentStep] = useState(1);

  // Redirect to chat if onboarding is already complete
  useEffect(() => {
    if (checked && isCompleted) {
      navigate('/chat', { replace: true });
    }
  }, [checked, isCompleted, navigate]);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Country dropdown state
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearchValue, setCountrySearchValue] = useState('');

  // Form state - pre-fill display_name with user's registration name
  const [formData, setFormData] = useState<Partial<CompleteOnboardingDto>>({
    account_type: 'individual',
    display_name: '',
    preferred_language: 'en',
    preferred_currency: 'USD',
    measurement_system: 'metric',
    tone_preference: 'professional',
    output_length: 'balanced',
  });

  // Pre-fill display_name from user's registration name
  useEffect(() => {
    if (user?.name && !formData.display_name) {
      setFormData((prev) => ({
        ...prev,
        display_name: user.name,
      }));
    }
  }, [user]);

  // Load existing data if any
  useEffect(() => {
    if (data) {
      setFormData((prev) => ({
        ...prev,
        ...data,
        // Keep display_name from user if not set in data
        display_name: data.display_name || prev.display_name || user?.name || '',
      }));
      if (data.onboarding_step > 0 && data.onboarding_step < 5) {
        setCurrentStep(data.onboarding_step + 1);
      }
    }
  }, [data, user]);

  // Handle click outside to close country dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.country-dropdown-container')) {
        setShowCountryDropdown(false);
      }
    };

    if (showCountryDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCountryDropdown]);

  const updateFormData = (updates: Partial<CompleteOnboardingDto>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = async () => {
    setSaving(true);
    try {
      await updateStep(currentStep, formData);
      if (currentStep < 5) {
        setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      console.error('Failed to save step:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      // Clean form data - only send valid onboarding fields, not internal fields
      const cleanData: CompleteOnboardingDto = {
        account_type: formData.account_type,
        display_name: formData.display_name,
        role: formData.role,
        primary_use_case: formData.primary_use_case,
        industry: formData.industry,
        company_name: formData.company_name,
        company_size: formData.company_size,
        preferred_language: formData.preferred_language,
        preferred_currency: formData.preferred_currency,
        timezone: formData.timezone,
        country: formData.country,
        measurement_system: formData.measurement_system,
        tone_preference: formData.tone_preference,
        output_length: formData.output_length,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        height_cm: formData.height_cm,
        weight_kg: formData.weight_kg,
        fitness_goal: formData.fitness_goal,
        dietary_preference: formData.dietary_preference,
        income_range: formData.income_range,
        financial_goal: formData.financial_goal,
      };
      await complete(cleanData);
      navigate('/chat');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    setSaving(true);
    try {
      await skip();
      navigate('/chat');
    } catch (error) {
      console.error('Failed to skip onboarding:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Skip Confirmation Modal */}
      {showSkipConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                <Sparkles className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Skip Onboarding?
              </h3>
            </div>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              We <strong>strongly recommend</strong> completing these 5 quick steps.
              Your preferences help us personalize <strong>462 tools</strong> just for you:
            </p>
            <ul className="text-sm text-slate-600 dark:text-slate-300 mb-6 space-y-2">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-teal-500" />
                Auto-fill forms with your preferences
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-teal-500" />
                Get region-appropriate calculations
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-teal-500" />
                AI responses in your preferred tone
              </li>
            </ul>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSkipConfirm(false)}
                className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium"
              >
                Continue Setup
              </button>
              <button
                onClick={handleSkip}
                disabled={saving}
                className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              >
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Skip Anyway'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Welcome to Wants
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Let's personalize your experience in just 5 quick steps
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center transition-all
                      ${isCompleted ? 'bg-teal-600 text-white' : ''}
                      ${isActive ? 'bg-teal-600 text-white ring-4 ring-teal-200 dark:ring-teal-800' : ''}
                      ${!isActive && !isCompleted ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400' : ''}
                    `}
                  >
                    {isCompleted ? <Check className="h-5 w-5" /> : <StepIcon className="h-5 w-5" />}
                  </div>
                  <span className={`text-xs mt-2 font-medium ${isActive ? 'text-teal-600' : 'text-slate-500'}`}>
                    {step.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 rounded ${currentStep > step.id ? 'bg-teal-600' : 'bg-slate-200 dark:bg-slate-700'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 md:p-8 mb-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
              {STEPS[currentStep - 1].title}
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              {STEPS[currentStep - 1].description}
            </p>
          </div>

          {/* Step 1: Account Type */}
          {currentStep === 1 && (
            <div className="space-y-4">
              {ACCOUNT_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => updateFormData({ account_type: type.value })}
                  className={`
                    w-full p-4 rounded-xl border-2 text-left transition-all
                    ${formData.account_type === type.value
                      ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}
                  `}
                >
                  <div className="font-medium text-slate-900 dark:text-white">{type.label}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{type.description}</div>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: About You */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={formData.display_name || ''}
                  onChange={(e) => updateFormData({ display_name: e.target.value })}
                  placeholder="How should we call you?"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Your Role
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {USER_ROLES.map((role) => (
                    <button
                      key={role.value}
                      onClick={() => updateFormData({ role: role.value })}
                      className={`
                        px-3 py-2 rounded-lg text-sm font-medium transition-all
                        ${formData.role === role.value
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}
                      `}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Primary Use Case
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {USE_CASES.map((useCase) => (
                    <button
                      key={useCase.value}
                      onClick={() => updateFormData({ primary_use_case: useCase.value })}
                      className={`
                        px-3 py-2 rounded-lg text-sm font-medium transition-all
                        ${formData.primary_use_case === useCase.value
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}
                      `}
                    >
                      {useCase.label}
                    </button>
                  ))}
                </div>
              </div>

              {formData.account_type === 'team' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={formData.company_name || ''}
                      onChange={(e) => updateFormData({ company_name: e.target.value })}
                      placeholder="Your company or organization"
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Industry
                      </label>
                      <select
                        value={formData.industry || ''}
                        onChange={(e) => updateFormData({ industry: e.target.value as Industry })}
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      >
                        <option value="">Select industry</option>
                        {INDUSTRIES.map((ind) => (
                          <option key={ind.value} value={ind.value}>{ind.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Company Size
                      </label>
                      <select
                        value={formData.company_size || ''}
                        onChange={(e) => updateFormData({ company_size: e.target.value as CompanySize })}
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      >
                        <option value="">Select size</option>
                        {COMPANY_SIZES.map((size) => (
                          <option key={size.value} value={size.value}>{size.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 3: Regional Settings */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Language
                  </label>
                  <select
                    value={formData.preferred_language || 'en'}
                    onChange={(e) => updateFormData({ preferred_language: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.value} value={lang.value}>{lang.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Currency
                  </label>
                  <select
                    value={formData.preferred_currency || 'USD'}
                    onChange={(e) => updateFormData({ preferred_currency: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    {CURRENCIES.map((curr) => (
                      <option key={curr.value} value={curr.value}>{curr.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Country
                </label>
                <div className="relative country-dropdown-container">
                  <button
                    type="button"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors text-left"
                  >
                    {(() => {
                      const selectedCountry = countryCodes.find(c => c.name === formData.country);
                      return selectedCountry ? (
                        <>
                          <span className="text-2xl">{selectedCountry.flag}</span>
                          <span className="flex-1">{selectedCountry.name}</span>
                        </>
                      ) : (
                        <span className="text-slate-500 dark:text-slate-400">Select your country</span>
                      );
                    })()}
                    <Search className="h-4 w-4 text-slate-400" />
                  </button>

                  {/* Country Dropdown */}
                  {showCountryDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-xl z-50 max-h-[300px] overflow-hidden">
                      {/* Search Input */}
                      <div className="p-2 border-b border-slate-200 dark:border-slate-600">
                        <input
                          type="text"
                          placeholder="Search country..."
                          value={countrySearchValue}
                          onChange={(e) => setCountrySearchValue(e.target.value)}
                          className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                          onClick={(e) => e.stopPropagation()}
                          autoFocus
                        />
                      </div>

                      {/* Country List */}
                      <div className="max-h-[240px] overflow-y-auto">
                        {countryCodes
                          .filter(country =>
                            country.name.toLowerCase().includes(countrySearchValue.toLowerCase())
                          )
                          .map((country) => (
                            <button
                              key={country.iso}
                              type="button"
                              onClick={() => {
                                updateFormData({ country: country.name });
                                setShowCountryDropdown(false);
                                setCountrySearchValue('');
                              }}
                              className={`w-full px-4 py-2 flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left ${
                                formData.country === country.name ? 'bg-teal-50 dark:bg-teal-900/30' : ''
                              }`}
                            >
                              <span className="text-xl">{country.flag}</span>
                              <span className="flex-1 text-sm text-slate-900 dark:text-white">{country.name}</span>
                              {formData.country === country.name && (
                                <Check className="h-4 w-4 text-teal-600" />
                              )}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Measurement System
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {MEASUREMENT_SYSTEMS.map((sys) => (
                    <button
                      key={sys.value}
                      onClick={() => updateFormData({ measurement_system: sys.value })}
                      className={`
                        px-4 py-3 rounded-lg text-sm font-medium transition-all
                        ${formData.measurement_system === sys.value
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}
                      `}
                    >
                      {sys.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Output Preferences */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Preferred Tone
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {TONE_PREFERENCES.map((tone) => (
                    <button
                      key={tone.value}
                      onClick={() => updateFormData({ tone_preference: tone.value })}
                      className={`
                        p-4 rounded-xl border-2 text-left transition-all
                        ${formData.tone_preference === tone.value
                          ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}
                      `}
                    >
                      <div className="font-medium text-slate-900 dark:text-white">{tone.label}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">{tone.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Output Length
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {OUTPUT_LENGTHS.map((length) => (
                    <button
                      key={length.value}
                      onClick={() => updateFormData({ output_length: length.value })}
                      className={`
                        p-4 rounded-xl border-2 text-center transition-all
                        ${formData.output_length === length.value
                          ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}
                      `}
                    >
                      <div className="font-medium text-slate-900 dark:text-white">{length.label}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">{length.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Optional Details */}
          {currentStep === 5 && (
            <div className="space-y-8">
              <p className="text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
                These fields are optional but help personalize health & finance tools
              </p>

              {/* Health Section */}
              <div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-rose-500" />
                  Health & Fitness
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Gender
                    </label>
                    <select
                      value={formData.gender || ''}
                      onChange={(e) => updateFormData({ gender: e.target.value as Gender })}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="">Select</option>
                      {GENDERS.map((g) => (
                        <option key={g.value} value={g.value}>{g.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={formData.date_of_birth || ''}
                      onChange={(e) => updateFormData({ date_of_birth: e.target.value })}
                      max={getMaxDateOfBirth()}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      You must be at least 13 years old
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Height ({formData.measurement_system === 'metric' ? 'cm' : 'in'})
                    </label>
                    <input
                      type="number"
                      value={formData.height_cm || ''}
                      onChange={(e) => updateFormData({ height_cm: parseInt(e.target.value) || undefined })}
                      placeholder={formData.measurement_system === 'metric' ? '170' : '67'}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Weight ({formData.measurement_system === 'metric' ? 'kg' : 'lb'})
                    </label>
                    <input
                      type="number"
                      value={formData.weight_kg || ''}
                      onChange={(e) => updateFormData({ weight_kg: parseFloat(e.target.value) || undefined })}
                      placeholder={formData.measurement_system === 'metric' ? '70' : '154'}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Fitness Goal
                    </label>
                    <select
                      value={formData.fitness_goal || ''}
                      onChange={(e) => updateFormData({ fitness_goal: e.target.value as FitnessGoal })}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="">Select</option>
                      {FITNESS_GOALS.map((g) => (
                        <option key={g.value} value={g.value}>{g.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Dietary Preference
                    </label>
                    <select
                      value={formData.dietary_preference || ''}
                      onChange={(e) => updateFormData({ dietary_preference: e.target.value as DietaryPreference })}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="">Select</option>
                      {DIETARY_PREFERENCES.map((d) => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Finance Section */}
              <div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-emerald-500" />
                  Finance
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Income Range
                    </label>
                    <select
                      value={formData.income_range || ''}
                      onChange={(e) => updateFormData({ income_range: e.target.value as IncomeRange })}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="">Select</option>
                      {INCOME_RANGES.map((r) => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Financial Goal
                    </label>
                    <select
                      value={formData.financial_goal || ''}
                      onChange={(e) => updateFormData({ financial_goal: e.target.value as FinancialGoal })}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="">Select</option>
                      {FINANCIAL_GOALS.map((g) => (
                        <option key={g.value} value={g.value}>{g.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <div>
            {currentStep > 1 ? (
              <button
                onClick={handleBack}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
                Back
              </button>
            ) : (
              <button
                onClick={() => setShowSkipConfirm(true)}
                className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                Skip for now
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {currentStep === 5 && (
              <button
                onClick={() => setShowSkipConfirm(true)}
                className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                Skip optional
              </button>
            )}
            <button
              onClick={currentStep === 5 ? handleComplete : handleNext}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium transition-colors disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : currentStep === 5 ? (
                <>
                  Complete
                  <Check className="h-5 w-5" />
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight className="h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
