// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../lib/utils';
import { AppSidebar } from '../components/AppSidebar';
import { SettingsSubmenu } from '../components/layout/SettingsSubmenu';
import {
  Globe,
  MessageSquare,
  FileText,
  Ruler,
  Save,
  Loader2,
  Check,
  User,
  Briefcase,
  Building2,
  DollarSign,
  MapPin,
  Heart,
  Activity,
  Utensils,
  Calendar,
  Users,
} from 'lucide-react';
import {
  getOnboarding,
  saveOnboarding,
  OnboardingData,
  TonePreference,
  OutputLength,
  MeasurementSystem,
  AccountType,
  UserRole,
  PrimaryUseCase,
  Industry,
  CompanySize,
  Gender,
  FitnessGoal,
  DietaryPreference,
  IncomeRange,
  FinancialGoal,
} from '../services/onboardingApi';
import { api } from '../lib/api';
import { toast } from 'sonner';

// ============================================
// OPTIONS DATA
// ============================================

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ja', name: 'Japanese (日本語)' },
  { code: 'zh', name: 'Chinese (中文)' },
  { code: 'ko', name: 'Korean (한국어)' },
  { code: 'es', name: 'Spanish (Español)' },
  { code: 'fr', name: 'French (Français)' },
  { code: 'de', name: 'German (Deutsch)' },
  { code: 'pt', name: 'Portuguese (Português)' },
  { code: 'ar', name: 'Arabic (العربية)' },
  { code: 'hi', name: 'Hindi (हिन्दी)' },
  { code: 'bn', name: 'Bengali (বাংলা)' },
];

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar ($)' },
  { code: 'EUR', name: 'Euro (€)' },
  { code: 'GBP', name: 'British Pound (£)' },
  { code: 'JPY', name: 'Japanese Yen (¥)' },
  { code: 'CNY', name: 'Chinese Yuan (¥)' },
  { code: 'INR', name: 'Indian Rupee (₹)' },
  { code: 'BDT', name: 'Bangladeshi Taka (৳)' },
  { code: 'AUD', name: 'Australian Dollar (A$)' },
  { code: 'CAD', name: 'Canadian Dollar (C$)' },
  { code: 'SGD', name: 'Singapore Dollar (S$)' },
];

const COUNTRIES = [
  { value: 'United States', label: '🇺🇸 United States' },
  { value: 'United Kingdom', label: '🇬🇧 United Kingdom' },
  { value: 'Canada', label: '🇨🇦 Canada' },
  { value: 'Australia', label: '🇦🇺 Australia' },
  { value: 'Germany', label: '🇩🇪 Germany' },
  { value: 'France', label: '🇫🇷 France' },
  { value: 'Japan', label: '🇯🇵 Japan' },
  { value: 'China', label: '🇨🇳 China' },
  { value: 'India', label: '🇮🇳 India' },
  { value: 'Bangladesh', label: '🇧🇩 Bangladesh' },
  { value: 'Pakistan', label: '🇵🇰 Pakistan' },
  { value: 'Brazil', label: '🇧🇷 Brazil' },
  { value: 'Mexico', label: '🇲🇽 Mexico' },
  { value: 'Spain', label: '🇪🇸 Spain' },
  { value: 'Italy', label: '🇮🇹 Italy' },
  { value: 'Netherlands', label: '🇳🇱 Netherlands' },
  { value: 'Sweden', label: '🇸🇪 Sweden' },
  { value: 'Norway', label: '🇳🇴 Norway' },
  { value: 'Denmark', label: '🇩🇰 Denmark' },
  { value: 'Finland', label: '🇫🇮 Finland' },
  { value: 'Switzerland', label: '🇨🇭 Switzerland' },
  { value: 'Austria', label: '🇦🇹 Austria' },
  { value: 'Belgium', label: '🇧🇪 Belgium' },
  { value: 'Poland', label: '🇵🇱 Poland' },
  { value: 'Portugal', label: '🇵🇹 Portugal' },
  { value: 'Ireland', label: '🇮🇪 Ireland' },
  { value: 'New Zealand', label: '🇳🇿 New Zealand' },
  { value: 'Singapore', label: '🇸🇬 Singapore' },
  { value: 'Malaysia', label: '🇲🇾 Malaysia' },
  { value: 'Thailand', label: '🇹🇭 Thailand' },
  { value: 'Vietnam', label: '🇻🇳 Vietnam' },
  { value: 'Philippines', label: '🇵🇭 Philippines' },
  { value: 'Indonesia', label: '🇮🇩 Indonesia' },
  { value: 'South Korea', label: '🇰🇷 South Korea' },
  { value: 'United Arab Emirates', label: '🇦🇪 United Arab Emirates' },
  { value: 'Saudi Arabia', label: '🇸🇦 Saudi Arabia' },
  { value: 'Egypt', label: '🇪🇬 Egypt' },
  { value: 'South Africa', label: '🇿🇦 South Africa' },
  { value: 'Nigeria', label: '🇳🇬 Nigeria' },
  { value: 'Kenya', label: '🇰🇪 Kenya' },
  { value: 'Argentina', label: '🇦🇷 Argentina' },
  { value: 'Chile', label: '🇨🇱 Chile' },
  { value: 'Colombia', label: '🇨🇴 Colombia' },
  { value: 'Peru', label: '🇵🇪 Peru' },
  { value: 'Russia', label: '🇷🇺 Russia' },
  { value: 'Ukraine', label: '🇺🇦 Ukraine' },
  { value: 'Turkey', label: '🇹🇷 Turkey' },
  { value: 'Israel', label: '🇮🇱 Israel' },
  { value: 'Greece', label: '🇬🇷 Greece' },
  { value: 'Czech Republic', label: '🇨🇿 Czech Republic' },
  { value: 'Romania', label: '🇷🇴 Romania' },
  { value: 'Hungary', label: '🇭🇺 Hungary' },
];

const TIMEZONES = [
  { value: 'Pacific/Midway', label: '(GMT-11:00) Midway Island' },
  { value: 'Pacific/Honolulu', label: '(GMT-10:00) Hawaii' },
  { value: 'America/Anchorage', label: '(GMT-09:00) Alaska' },
  { value: 'America/Los_Angeles', label: '(GMT-08:00) Pacific Time (US & Canada)' },
  { value: 'America/Denver', label: '(GMT-07:00) Mountain Time (US & Canada)' },
  { value: 'America/Chicago', label: '(GMT-06:00) Central Time (US & Canada)' },
  { value: 'America/New_York', label: '(GMT-05:00) Eastern Time (US & Canada)' },
  { value: 'America/Caracas', label: '(GMT-04:00) Caracas' },
  { value: 'America/Halifax', label: '(GMT-04:00) Atlantic Time (Canada)' },
  { value: 'America/Sao_Paulo', label: '(GMT-03:00) Sao Paulo' },
  { value: 'Atlantic/South_Georgia', label: '(GMT-02:00) Mid-Atlantic' },
  { value: 'Atlantic/Azores', label: '(GMT-01:00) Azores' },
  { value: 'Europe/London', label: '(GMT+00:00) London, Dublin, Lisbon' },
  { value: 'Europe/Paris', label: '(GMT+01:00) Paris, Berlin, Rome, Madrid' },
  { value: 'Europe/Helsinki', label: '(GMT+02:00) Helsinki, Cairo, Athens' },
  { value: 'Europe/Moscow', label: '(GMT+03:00) Moscow, St. Petersburg' },
  { value: 'Asia/Dubai', label: '(GMT+04:00) Dubai, Abu Dhabi' },
  { value: 'Asia/Karachi', label: '(GMT+05:00) Karachi, Islamabad' },
  { value: 'Asia/Kolkata', label: '(GMT+05:30) Mumbai, New Delhi, Kolkata' },
  { value: 'Asia/Dhaka', label: '(GMT+06:00) Dhaka, Bangladesh' },
  { value: 'Asia/Bangkok', label: '(GMT+07:00) Bangkok, Hanoi, Jakarta' },
  { value: 'Asia/Singapore', label: '(GMT+08:00) Singapore, Hong Kong, Beijing' },
  { value: 'Asia/Tokyo', label: '(GMT+09:00) Tokyo, Seoul' },
  { value: 'Australia/Sydney', label: '(GMT+10:00) Sydney, Melbourne' },
  { value: 'Pacific/Noumea', label: '(GMT+11:00) New Caledonia' },
  { value: 'Pacific/Auckland', label: '(GMT+12:00) Auckland, Wellington' },
];

const ACCOUNT_TYPE_OPTIONS: { value: AccountType; label: string }[] = [
  { value: 'individual', label: 'Individual' },
  { value: 'team', label: 'Team' },
];

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'developer', label: 'Developer' },
  { value: 'designer', label: 'Designer' },
  { value: 'marketer', label: 'Marketer' },
  { value: 'manager', label: 'Manager' },
  { value: 'student', label: 'Student' },
  { value: 'freelancer', label: 'Freelancer' },
  { value: 'business_owner', label: 'Business Owner' },
  { value: 'other', label: 'Other' },
];

const USE_CASE_OPTIONS: { value: PrimaryUseCase; label: string }[] = [
  { value: 'content_creation', label: 'Content Creation' },
  { value: 'development', label: 'Development' },
  { value: 'data_analysis', label: 'Data Analysis' },
  { value: 'business', label: 'Business' },
  { value: 'personal', label: 'Personal' },
  { value: 'education', label: 'Education' },
];

const INDUSTRY_OPTIONS: { value: Industry; label: string }[] = [
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

const COMPANY_SIZE_OPTIONS: { value: CompanySize; label: string }[] = [
  { value: 'solo', label: 'Solo' },
  { value: '2-10', label: '2-10' },
  { value: '11-50', label: '11-50' },
  { value: '51-200', label: '51-200' },
  { value: '201-1000', label: '201-1000' },
  { value: '1000+', label: '1000+' },
];

const TONE_OPTIONS: { value: TonePreference; label: string; description: string }[] = [
  { value: 'casual', label: 'Casual', description: 'Friendly, conversational tone' },
  { value: 'professional', label: 'Professional', description: 'Clear and business-appropriate' },
  { value: 'formal', label: 'Formal', description: 'Academic, precise language' },
  { value: 'friendly', label: 'Friendly', description: 'Warm and encouraging' },
];

const OUTPUT_LENGTH_OPTIONS: { value: OutputLength; label: string; description: string }[] = [
  { value: 'concise', label: 'Concise', description: 'Brief and to the point' },
  { value: 'balanced', label: 'Balanced', description: 'Comprehensive yet focused' },
  { value: 'detailed', label: 'Detailed', description: 'Thorough with examples' },
];

const MEASUREMENT_OPTIONS: { value: MeasurementSystem; label: string }[] = [
  { value: 'metric', label: 'Metric (kg, cm, °C)' },
  { value: 'imperial', label: 'Imperial (lb, ft, °F)' },
];

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

const FITNESS_GOAL_OPTIONS: { value: FitnessGoal; label: string }[] = [
  { value: 'lose_weight', label: 'Lose Weight' },
  { value: 'gain_muscle', label: 'Gain Muscle' },
  { value: 'maintain', label: 'Maintain' },
  { value: 'improve_fitness', label: 'Improve Fitness' },
];

const DIETARY_OPTIONS: { value: DietaryPreference; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'keto', label: 'Keto' },
  { value: 'paleo', label: 'Paleo' },
  { value: 'halal', label: 'Halal' },
  { value: 'kosher', label: 'Kosher' },
];

const INCOME_RANGE_OPTIONS: { value: IncomeRange; label: string }[] = [
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
  { value: '0-25k', label: '$0 - $25,000' },
  { value: '25k-50k', label: '$25,000 - $50,000' },
  { value: '50k-100k', label: '$50,000 - $100,000' },
  { value: '100k-200k', label: '$100,000 - $200,000' },
  { value: '200k+', label: '$200,000+' },
];

const FINANCIAL_GOAL_OPTIONS: { value: FinancialGoal; label: string }[] = [
  { value: 'save_more', label: 'Save More' },
  { value: 'invest', label: 'Invest' },
  { value: 'pay_debt', label: 'Pay Off Debt' },
  { value: 'budget_better', label: 'Budget Better' },
  { value: 'retirement', label: 'Plan for Retirement' },
];

// ============================================
// HELPER: GET VALUE (handles camelCase & snake_case)
// ============================================

const getValue = (data: any, snakeKey: string, camelKey: string, defaultValue: any = '') => {
  return data?.[snakeKey] ?? data?.[camelKey] ?? defaultValue;
};

// ============================================
// REUSABLE COMPONENTS (defined outside to prevent re-creation)
// ============================================

interface CardProps {
  children: React.ReactNode;
  className?: string;
  theme: string;
}

const Card: React.FC<CardProps> = ({ children, className, theme }) => (
  <div className={cn(
    "mb-6 p-6 rounded-2xl border",
    theme === 'dark' ? 'bg-[#2a2a2a] border-[#3a3a3a]' : 'bg-white border-slate-200 shadow-sm',
    className
  )}>
    {children}
  </div>
);

interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  theme: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ icon, title, description, theme }) => (
  <div className="mb-4">
    <div className="flex items-center gap-3 mb-1">
      <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>{icon}</span>
      <h2 className={cn("text-lg font-semibold", theme === 'dark' ? 'text-white' : 'text-slate-900')}>{title}</h2>
    </div>
    {description && (
      <p className={cn("text-sm ml-8", theme === 'dark' ? 'text-slate-400' : 'text-slate-600')}>{description}</p>
    )}
  </div>
);

interface InputFieldProps {
  label: string;
  value: string | number;
  onChange: (value: any) => void;
  type?: string;
  placeholder?: string;
  theme: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, value, onChange, type = 'text', placeholder, theme }) => (
  <div className="mb-4">
    <label className={cn("block text-sm font-medium mb-2", theme === 'dark' ? 'text-slate-300' : 'text-slate-700')}>
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(type === 'number' ? (e.target.value ? Number(e.target.value) : '') : e.target.value)}
      placeholder={placeholder}
      className={cn(
        "w-full px-4 py-3 rounded-xl border transition-colors outline-none",
        theme === 'dark'
          ? 'bg-[#1a1a1a] border-[#3a3a3a] text-white placeholder-slate-500 focus:border-[#0D9488]'
          : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#0D9488]'
      )}
    />
  </div>
);

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: any) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  theme: string;
}

const SelectField: React.FC<SelectFieldProps> = ({ label, value, onChange, options, placeholder, theme }) => (
  <div className="mb-4">
    <label className={cn("block text-sm font-medium mb-2", theme === 'dark' ? 'text-slate-300' : 'text-slate-700')}>
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "w-full px-4 py-3 rounded-xl border transition-colors outline-none",
        theme === 'dark'
          ? 'bg-[#1a1a1a] border-[#3a3a3a] text-white focus:border-[#0D9488]'
          : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#0D9488]'
      )}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

interface ButtonSelectProps {
  value: string;
  onChange: (value: any) => void;
  options: { value: string; label: string; description?: string }[];
  columns?: number;
  theme: string;
}

const ButtonSelect: React.FC<ButtonSelectProps> = ({ value, onChange, options, columns = 2, theme }) => (
  <div className={cn("grid gap-3", columns === 2 ? 'grid-cols-2' : columns === 3 ? 'grid-cols-3' : 'grid-cols-4')}>
    {options.map((option) => (
      <button
        key={option.value}
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onChange(option.value);
        }}
        className={cn(
          "p-4 rounded-xl border text-left transition-all",
          value === option.value
            ? 'border-[#0D9488] bg-[#0D9488]/10'
            : theme === 'dark'
              ? 'border-[#3a3a3a] hover:border-[#4a4a4a]'
              : 'border-slate-200 hover:border-slate-300'
        )}
      >
        <div className="flex items-center justify-between mb-1">
          <span className={cn("font-medium", theme === 'dark' ? 'text-white' : 'text-slate-900')}>
            {option.label}
          </span>
          {value === option.value && <Check className="w-4 h-4 text-[#0D9488]" />}
        </div>
        {option.description && (
          <span className={cn("text-xs", theme === 'dark' ? 'text-slate-400' : 'text-slate-600')}>
            {option.description}
          </span>
        )}
      </button>
    ))}
  </div>
);

// ============================================
// MAIN COMPONENT
// ============================================

const PreferencesPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalData, setOriginalData] = useState<any>(null);

  // About You
  const [displayName, setDisplayName] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('individual');
  const [role, setRole] = useState<UserRole | ''>('');
  const [primaryUseCase, setPrimaryUseCase] = useState<PrimaryUseCase | ''>('');

  // Work/Business
  const [industry, setIndustry] = useState<Industry | ''>('');
  const [companyName, setCompanyName] = useState('');
  const [companySize, setCompanySize] = useState<CompanySize | ''>('');

  // Regional Settings
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  const [preferredCurrency, setPreferredCurrency] = useState('USD');
  const [timezone, setTimezone] = useState('');
  const [country, setCountry] = useState('');
  const [measurementSystem, setMeasurementSystem] = useState<MeasurementSystem>('metric');

  // AI Preferences
  const [tonePreference, setTonePreference] = useState<TonePreference>('professional');
  const [outputLength, setOutputLength] = useState<OutputLength>('balanced');
  const [enablePersonalization, setEnablePersonalization] = useState(true);

  // Personal/Health
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [heightCm, setHeightCm] = useState<number | ''>('');
  const [weightKg, setWeightKg] = useState<number | ''>('');
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal | ''>('');
  const [dietaryPreference, setDietaryPreference] = useState<DietaryPreference | ''>('');

  // Financial
  const [incomeRange, setIncomeRange] = useState<IncomeRange | ''>('');
  const [financialGoal, setFinancialGoal] = useState<FinancialGoal | ''>('');

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const data = await getOnboarding();
      console.log('PreferencesPage - loaded data:', data);

      // Also fetch user instructions for personalization toggle
      try {
        const instructionsRes = await api.get('/user/instructions');
        if (instructionsRes.data) {
          setEnablePersonalization(instructionsRes.data.enablePersonalization ?? true);
        }
      } catch (err) {
        console.error('Failed to load personalization setting:', err);
      }

      if (data) {
        setOriginalData(data);

        // Debug logging
        console.log('PreferencesPage - Full data:', data);
        console.log('PreferencesPage - primary_use_case:', data.primary_use_case, 'primaryUseCase:', data.primaryUseCase);
        console.log('PreferencesPage - date_of_birth:', data.date_of_birth, 'dateOfBirth:', data.dateOfBirth);
        console.log('PreferencesPage - country:', data.country);
        console.log('PreferencesPage - timezone:', data.timezone);

        // About You
        setDisplayName(getValue(data, 'display_name', 'displayName', ''));
        setAccountType(getValue(data, 'account_type', 'accountType', 'individual'));
        setRole(getValue(data, 'role', 'role', ''));
        setPrimaryUseCase(getValue(data, 'primary_use_case', 'primaryUseCase', ''));

        // Work/Business
        setIndustry(getValue(data, 'industry', 'industry', ''));
        setCompanyName(getValue(data, 'company_name', 'companyName', ''));
        setCompanySize(getValue(data, 'company_size', 'companySize', ''));

        // Regional Settings
        setPreferredLanguage(getValue(data, 'preferred_language', 'preferredLanguage', 'en'));
        setPreferredCurrency(getValue(data, 'preferred_currency', 'preferredCurrency', 'USD'));
        setTimezone(getValue(data, 'timezone', 'timezone', ''));
        setCountry(getValue(data, 'country', 'country', ''));
        setMeasurementSystem(getValue(data, 'measurement_system', 'measurementSystem', 'metric'));

        // AI Preferences
        setTonePreference(getValue(data, 'tone_preference', 'tonePreference', 'professional'));
        setOutputLength(getValue(data, 'output_length', 'outputLength', 'balanced'));

        // Personal/Health
        const dob = getValue(data, 'date_of_birth', 'dateOfBirth', '');
        // Convert ISO date string to YYYY-MM-DD format for date input
        if (dob) {
          const dateOnly = dob.split('T')[0]; // Handle "2000-01-15T00:00:00.000Z" format
          setDateOfBirth(dateOnly);
        } else {
          setDateOfBirth('');
        }
        setGender(getValue(data, 'gender', 'gender', ''));
        setHeightCm(getValue(data, 'height_cm', 'heightCm', ''));
        setWeightKg(getValue(data, 'weight_kg', 'weightKg', ''));
        setFitnessGoal(getValue(data, 'fitness_goal', 'fitnessGoal', ''));
        setDietaryPreference(getValue(data, 'dietary_preference', 'dietaryPreference', ''));

        // Financial
        setIncomeRange(getValue(data, 'income_range', 'incomeRange', ''));
        setFinancialGoal(getValue(data, 'financial_goal', 'financialGoal', ''));
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
      toast.error('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    try {
      setSaving(true);

      // Properly convert numbers - ensure they are actual numbers, not strings
      const heightValue = heightCm ? Number(heightCm) : undefined;
      const weightValue = weightKg ? Number(weightKg) : undefined;

      // Build payload, excluding undefined/empty values
      const payload: any = {
        display_name: displayName || undefined,
        account_type: accountType,
        preferred_language: preferredLanguage,
        preferred_currency: preferredCurrency,
        measurement_system: measurementSystem,
        tone_preference: tonePreference,
        output_length: outputLength,
      };

      // Only add optional fields if they have values
      if (role) payload.role = role;
      if (primaryUseCase) payload.primary_use_case = primaryUseCase;
      if (industry) payload.industry = industry;
      if (companyName) payload.company_name = companyName;
      if (companySize) payload.company_size = companySize;
      if (timezone) payload.timezone = timezone;
      if (country) payload.country = country;
      if (dateOfBirth) payload.date_of_birth = dateOfBirth;
      if (gender) payload.gender = gender;
      if (heightValue && heightValue >= 50 && heightValue <= 300) payload.height_cm = heightValue;
      if (weightValue && weightValue >= 20 && weightValue <= 500) payload.weight_kg = weightValue;
      if (fitnessGoal) payload.fitness_goal = fitnessGoal;
      if (dietaryPreference) payload.dietary_preference = dietaryPreference;
      if (incomeRange) payload.income_range = incomeRange;
      if (financialGoal) payload.financial_goal = financialGoal;

      console.log('Saving payload:', payload);

      await saveOnboarding(payload);
      toast.success('Preferences saved successfully');
      // Reload to get fresh data
      await loadPreferences();
    } catch (error: any) {
      console.error('Failed to save preferences:', error);
      toast.error(error?.message || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  // Handle personalization toggle - saves immediately
  const handlePersonalizationToggle = async () => {
    const newValue = !enablePersonalization;
    setEnablePersonalization(newValue);
    try {
      await api.put('/user/instructions', { enablePersonalization: newValue });
      toast.success(newValue ? 'Personalization enabled' : 'Personalization disabled');
    } catch (error) {
      console.error('Failed to save personalization setting:', error);
      // Revert on error
      setEnablePersonalization(!newValue);
      toast.error('Failed to save setting');
    }
  };

  // Check if there are changes
  const hasChanges = originalData && (
    displayName !== getValue(originalData, 'display_name', 'displayName', '') ||
    accountType !== getValue(originalData, 'account_type', 'accountType', 'individual') ||
    role !== getValue(originalData, 'role', 'role', '') ||
    primaryUseCase !== getValue(originalData, 'primary_use_case', 'primaryUseCase', '') ||
    industry !== getValue(originalData, 'industry', 'industry', '') ||
    companyName !== getValue(originalData, 'company_name', 'companyName', '') ||
    companySize !== getValue(originalData, 'company_size', 'companySize', '') ||
    preferredLanguage !== getValue(originalData, 'preferred_language', 'preferredLanguage', 'en') ||
    preferredCurrency !== getValue(originalData, 'preferred_currency', 'preferredCurrency', 'USD') ||
    timezone !== getValue(originalData, 'timezone', 'timezone', '') ||
    country !== getValue(originalData, 'country', 'country', '') ||
    measurementSystem !== getValue(originalData, 'measurement_system', 'measurementSystem', 'metric') ||
    tonePreference !== getValue(originalData, 'tone_preference', 'tonePreference', 'professional') ||
    outputLength !== getValue(originalData, 'output_length', 'outputLength', 'balanced') ||
    dateOfBirth !== (getValue(originalData, 'date_of_birth', 'dateOfBirth', '')?.split('T')[0] || '') ||
    gender !== getValue(originalData, 'gender', 'gender', '') ||
    heightCm !== getValue(originalData, 'height_cm', 'heightCm', '') ||
    weightKg !== getValue(originalData, 'weight_kg', 'weightKg', '') ||
    fitnessGoal !== getValue(originalData, 'fitness_goal', 'fitnessGoal', '') ||
    dietaryPreference !== getValue(originalData, 'dietary_preference', 'dietaryPreference', '') ||
    incomeRange !== getValue(originalData, 'income_range', 'incomeRange', '') ||
    financialGoal !== getValue(originalData, 'financial_goal', 'financialGoal', '')
  );

  if (loading) {
    return (
      <div className={cn("flex h-screen items-center justify-center", theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-slate-50')}>
        <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
      </div>
    );
  }

  return (
    <div className={cn("flex h-full", theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-slate-50')}>
      <AppSidebar activePage="settings" />

      {/* Settings Submenu */}
      <SettingsSubmenu />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className={cn("text-3xl font-bold", theme === 'dark' ? 'text-white' : 'text-slate-900')}>
                {t('preferences.title')}
              </h1>
              <p className={cn("mt-2 text-base", theme === 'dark' ? 'text-slate-400' : 'text-slate-600')}>
                {t('preferences.subtitle')}
              </p>
            </div>
            {/* Personalization Toggle */}
            <div className={cn(
              "flex items-center gap-3 px-4 py-2.5 rounded-xl",
              theme === 'dark' ? 'bg-[#2a2a2a]' : 'bg-white border border-slate-200'
            )}>
              <span className={cn(
                "text-sm font-medium",
                theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
              )}>{t('preferences.personalize')}</span>
              <button
                onClick={handlePersonalizationToggle}
                className={cn(
                  "relative w-11 h-6 rounded-full transition-colors",
                  enablePersonalization
                    ? 'bg-[#0D9488]'
                    : theme === 'dark' ? 'bg-[#3a3a3a]' : 'bg-slate-300'
                )}
              >
                <div className={cn(
                  "absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow-sm",
                  enablePersonalization ? 'left-5' : 'left-0.5'
                )} />
              </button>
            </div>
          </div>

          {/* ============================================ */}
          {/* SECTION: About You */}
          {/* ============================================ */}
          <Card theme={theme}>
            <SectionHeader theme={theme} icon={<User className="w-5 h-5" />} title={t('preferences.sections.aboutYou.title')} description={t('preferences.sections.aboutYou.description')} />
            <InputField theme={theme} label={t('preferences.fields.displayName')} value={displayName} onChange={setDisplayName} placeholder={t('preferences.fields.displayNamePlaceholder')} />
            <SelectField theme={theme} label={t('preferences.fields.accountType')} value={accountType} onChange={setAccountType} options={ACCOUNT_TYPE_OPTIONS} />
            <SelectField theme={theme} label={t('preferences.fields.role')} value={role} onChange={setRole} options={ROLE_OPTIONS} placeholder={t('preferences.fields.rolePlaceholder')} />
            <SelectField theme={theme} label={t('preferences.fields.primaryUseCase')} value={primaryUseCase} onChange={setPrimaryUseCase} options={USE_CASE_OPTIONS} placeholder={t('preferences.fields.useCasePlaceholder')} />
          </Card>

          {/* ============================================ */}
          {/* SECTION: Work & Business */}
          {/* ============================================ */}
          <Card theme={theme}>
            <SectionHeader theme={theme} icon={<Briefcase className="w-5 h-5" />} title={t('preferences.sections.workBusiness.title')} description={t('preferences.sections.workBusiness.description')} />
            <SelectField theme={theme} label={t('preferences.fields.industry')} value={industry} onChange={setIndustry} options={INDUSTRY_OPTIONS} placeholder={t('preferences.fields.industryPlaceholder')} />
            <InputField theme={theme} label={t('preferences.fields.companyName')} value={companyName} onChange={setCompanyName} placeholder={t('preferences.fields.companyPlaceholder')} />
            <SelectField theme={theme} label={t('preferences.fields.companySize')} value={companySize} onChange={setCompanySize} options={COMPANY_SIZE_OPTIONS} placeholder={t('preferences.fields.companySizePlaceholder')} />
          </Card>

          {/* ============================================ */}
          {/* SECTION: Regional Settings */}
          {/* ============================================ */}
          <Card theme={theme}>
            <SectionHeader theme={theme} icon={<Globe className="w-5 h-5" />} title={t('preferences.sections.regional.title')} description={t('preferences.sections.regional.description')} />
            <div className="grid grid-cols-2 gap-4">
              <SelectField theme={theme} label={t('preferences.fields.language')} value={preferredLanguage} onChange={setPreferredLanguage} options={LANGUAGES.map(l => ({ value: l.code, label: l.name }))} />
              <SelectField theme={theme} label={t('preferences.fields.currency')} value={preferredCurrency} onChange={setPreferredCurrency} options={CURRENCIES.map(c => ({ value: c.code, label: c.name }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <SelectField
                theme={theme}
                label={t('preferences.fields.country')}
                value={country}
                onChange={setCountry}
                options={COUNTRIES}
                placeholder={t('preferences.fields.countryPlaceholder')}
              />
              <SelectField
                theme={theme}
                label={t('preferences.fields.timezone')}
                value={timezone}
                onChange={setTimezone}
                options={TIMEZONES}
                placeholder={t('preferences.fields.timezonePlaceholder')}
              />
            </div>
            <div className="mt-4">
              <label className={cn("block text-sm font-medium mb-3", theme === 'dark' ? 'text-slate-300' : 'text-slate-700')}>
                {t('preferences.fields.measurementSystem')}
              </label>
              <ButtonSelect theme={theme} value={measurementSystem} onChange={setMeasurementSystem} options={MEASUREMENT_OPTIONS} />
            </div>
          </Card>

          {/* ============================================ */}
          {/* SECTION: AI Preferences */}
          {/* ============================================ */}
          <Card theme={theme}>
            <SectionHeader theme={theme} icon={<MessageSquare className="w-5 h-5" />} title={t('preferences.sections.aiPreferences.title')} description={t('preferences.sections.aiPreferences.description')} />
            <div className="mb-6">
              <label className={cn("block text-sm font-medium mb-3", theme === 'dark' ? 'text-slate-300' : 'text-slate-700')}>
                {t('preferences.fields.tonePreference')}
              </label>
              <ButtonSelect theme={theme} value={tonePreference} onChange={setTonePreference} options={TONE_OPTIONS} />
            </div>
            <div>
              <label className={cn("block text-sm font-medium mb-3", theme === 'dark' ? 'text-slate-300' : 'text-slate-700')}>
                {t('preferences.fields.responseLength')}
              </label>
              <ButtonSelect theme={theme} value={outputLength} onChange={setOutputLength} options={OUTPUT_LENGTH_OPTIONS} columns={3} />
            </div>
          </Card>

          {/* ============================================ */}
          {/* SECTION: Personal & Health */}
          {/* ============================================ */}
          <Card theme={theme}>
            <SectionHeader theme={theme} icon={<Heart className="w-5 h-5" />} title={t('preferences.sections.personalHealth.title')} description={t('preferences.sections.personalHealth.description')} />
            <div className="grid grid-cols-2 gap-4">
              <InputField theme={theme} label={t('preferences.fields.dateOfBirth')} value={dateOfBirth} onChange={setDateOfBirth} type="date" />
              <SelectField theme={theme} label={t('preferences.fields.gender')} value={gender} onChange={setGender} options={GENDER_OPTIONS} placeholder={t('preferences.fields.genderPlaceholder')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InputField theme={theme} label={t('preferences.fields.height')} value={heightCm} onChange={setHeightCm} type="number" placeholder={t('preferences.fields.heightPlaceholder')} />
              <InputField theme={theme} label={t('preferences.fields.weight')} value={weightKg} onChange={setWeightKg} type="number" placeholder={t('preferences.fields.weightPlaceholder')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <SelectField theme={theme} label={t('preferences.fields.fitnessGoal')} value={fitnessGoal} onChange={setFitnessGoal} options={FITNESS_GOAL_OPTIONS} placeholder={t('preferences.fields.fitnessGoalPlaceholder')} />
              <SelectField theme={theme} label={t('preferences.fields.dietaryPreference')} value={dietaryPreference} onChange={setDietaryPreference} options={DIETARY_OPTIONS} placeholder={t('preferences.fields.dietaryPlaceholder')} />
            </div>
          </Card>

          {/* ============================================ */}
          {/* SECTION: Financial */}
          {/* ============================================ */}
          <Card theme={theme}>
            <SectionHeader theme={theme} icon={<DollarSign className="w-5 h-5" />} title={t('preferences.sections.financial.title')} description={t('preferences.sections.financial.description')} />
            <div className="grid grid-cols-2 gap-4">
              <SelectField theme={theme} label={t('preferences.fields.incomeRange')} value={incomeRange} onChange={setIncomeRange} options={INCOME_RANGE_OPTIONS} placeholder={t('preferences.fields.incomePlaceholder')} />
              <SelectField theme={theme} label={t('preferences.fields.financialGoal')} value={financialGoal} onChange={setFinancialGoal} options={FINANCIAL_GOAL_OPTIONS} placeholder={t('preferences.fields.financialGoalPlaceholder')} />
            </div>
          </Card>

          {/* ============================================ */}
          {/* Save Button */}
          {/* ============================================ */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleSave();
            }}
            disabled={saving || !hasChanges}
            className={cn(
              "w-full py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all mb-8",
              hasChanges
                ? 'bg-[#0D9488] text-white hover:bg-[#0B8278]'
                : theme === 'dark'
                  ? 'bg-[#2a2a2a] text-slate-500 cursor-not-allowed'
                  : 'bg-slate-200 text-slate-500 cursor-not-allowed'
            )}
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t('preferences.saving')}
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {t('preferences.savePreferences')}
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
};

export default PreferencesPage;