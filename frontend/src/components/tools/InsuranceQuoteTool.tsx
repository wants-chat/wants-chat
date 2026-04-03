'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Shield,
  Car,
  Home,
  Heart,
  Activity,
  Briefcase,
  User,
  DollarSign,
  Percent,
  Calendar,
  Building2,
  Plus,
  Trash2,
  Save,
  Download,
  RefreshCw,
  TrendingUp,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Star,
  Award,
  History,
  Bell,
  FileText,
  Mail,
  Phone,
  X,
  Sparkles,
} from 'lucide-react';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import useToolData from '../../hooks/useToolData';
import {
  exportToCSV,
  exportToExcel,
  exportToJSON,
  exportToPDF,
  copyToClipboard as copyUtil,
  printData,
  type ColumnConfig,
} from '../../lib/toolDataUtils';

interface InsuranceQuoteToolProps {
  uiConfig?: UIConfig;
}
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Types
type InsuranceType = 'auto' | 'home' | 'life' | 'health' | 'business';

interface CustomerProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  occupation: string;
  annualIncome: number;
  creditScore: number;
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  dependents: number;
  createdAt: string;
}

interface CoverageOption {
  id: string;
  name: string;
  description: string;
  minLimit: number;
  maxLimit: number;
  defaultLimit: number;
  premiumFactor: number;
}

interface DeductibleOption {
  amount: number;
  discountPercent: number;
}

interface Carrier {
  id: string;
  name: string;
  logo: string;
  rating: number;
  specialties: InsuranceType[];
  baseRates: Record<InsuranceType, number>;
}

interface Quote {
  id: string;
  carrierId: string;
  carrierName: string;
  insuranceType: InsuranceType;
  customerId: string;
  monthlyPremium: number;
  annualPremium: number;
  coverages: Record<string, number>;
  deductible: number;
  discounts: Discount[];
  totalDiscount: number;
  createdAt: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
}

interface Discount {
  id: string;
  name: string;
  type: string;
  percent: number;
  applicable: boolean;
}

interface Policy {
  id: string;
  quoteId: string;
  customerId: string;
  carrierName: string;
  insuranceType: InsuranceType;
  monthlyPremium: number;
  annualPremium: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'cancelled' | 'expired' | 'pending_renewal';
  renewalDate: string;
}

interface CommunicationLog {
  id: string;
  customerId: string;
  type: 'email' | 'phone' | 'meeting' | 'note';
  subject: string;
  content: string;
  date: string;
}

interface CrossSellOpportunity {
  customerId: string;
  insuranceType: InsuranceType;
  reason: string;
  potentialPremium: number;
  priority: 'high' | 'medium' | 'low';
}

// Constants
const INSURANCE_TYPES: { type: InsuranceType; label: string; icon: React.ReactNode }[] = [
  { type: 'auto', label: 'Auto', icon: <Car className="w-5 h-5" /> },
  { type: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
  { type: 'life', label: 'Life', icon: <Heart className="w-5 h-5" /> },
  { type: 'health', label: 'Health', icon: <Activity className="w-5 h-5" /> },
  { type: 'business', label: 'Business', icon: <Briefcase className="w-5 h-5" /> },
];

const CARRIERS: Carrier[] = [
  {
    id: 'carrier-1',
    name: 'SafeGuard Insurance',
    logo: 'SG',
    rating: 4.8,
    specialties: ['auto', 'home'],
    baseRates: { auto: 120, home: 150, life: 80, health: 400, business: 300 },
  },
  {
    id: 'carrier-2',
    name: 'LifeShield Co.',
    logo: 'LS',
    rating: 4.6,
    specialties: ['life', 'health'],
    baseRates: { auto: 130, home: 160, life: 70, health: 380, business: 320 },
  },
  {
    id: 'carrier-3',
    name: 'Premier Coverage',
    logo: 'PC',
    rating: 4.9,
    specialties: ['auto', 'home', 'business'],
    baseRates: { auto: 115, home: 145, life: 85, health: 420, business: 280 },
  },
  {
    id: 'carrier-4',
    name: 'National Trust Insurance',
    logo: 'NT',
    rating: 4.5,
    specialties: ['auto', 'home', 'life', 'health', 'business'],
    baseRates: { auto: 125, home: 155, life: 75, health: 390, business: 310 },
  },
  {
    id: 'carrier-5',
    name: 'ValueFirst Insurance',
    logo: 'VF',
    rating: 4.3,
    specialties: ['auto', 'home'],
    baseRates: { auto: 100, home: 130, life: 90, health: 450, business: 350 },
  },
];

const COVERAGE_OPTIONS: Record<InsuranceType, CoverageOption[]> = {
  auto: [
    { id: 'liability', name: 'Liability', description: 'Covers damage to others', minLimit: 25000, maxLimit: 500000, defaultLimit: 100000, premiumFactor: 0.3 },
    { id: 'collision', name: 'Collision', description: 'Covers your vehicle in accidents', minLimit: 0, maxLimit: 100000, defaultLimit: 25000, premiumFactor: 0.25 },
    { id: 'comprehensive', name: 'Comprehensive', description: 'Covers theft, vandalism, weather', minLimit: 0, maxLimit: 100000, defaultLimit: 25000, premiumFactor: 0.2 },
    { id: 'uninsured', name: 'Uninsured Motorist', description: 'Covers accidents with uninsured drivers', minLimit: 25000, maxLimit: 500000, defaultLimit: 50000, premiumFactor: 0.15 },
    { id: 'medical', name: 'Medical Payments', description: 'Covers medical expenses', minLimit: 1000, maxLimit: 100000, defaultLimit: 5000, premiumFactor: 0.1 },
  ],
  home: [
    { id: 'dwelling', name: 'Dwelling Coverage', description: 'Covers home structure', minLimit: 100000, maxLimit: 2000000, defaultLimit: 300000, premiumFactor: 0.4 },
    { id: 'personal', name: 'Personal Property', description: 'Covers belongings', minLimit: 25000, maxLimit: 500000, defaultLimit: 100000, premiumFactor: 0.25 },
    { id: 'liability', name: 'Liability', description: 'Covers injuries on your property', minLimit: 100000, maxLimit: 1000000, defaultLimit: 300000, premiumFactor: 0.2 },
    { id: 'additional', name: 'Additional Living Expenses', description: 'Covers temporary housing', minLimit: 10000, maxLimit: 200000, defaultLimit: 50000, premiumFactor: 0.1 },
    { id: 'medical', name: 'Medical Payments', description: 'Covers guest injuries', minLimit: 1000, maxLimit: 25000, defaultLimit: 5000, premiumFactor: 0.05 },
  ],
  life: [
    { id: 'term', name: 'Term Life', description: 'Coverage for specific period', minLimit: 50000, maxLimit: 5000000, defaultLimit: 500000, premiumFactor: 0.6 },
    { id: 'whole', name: 'Whole Life', description: 'Lifetime coverage with cash value', minLimit: 25000, maxLimit: 2000000, defaultLimit: 250000, premiumFactor: 0.3 },
    { id: 'accidental', name: 'Accidental Death', description: 'Additional coverage for accidents', minLimit: 25000, maxLimit: 1000000, defaultLimit: 100000, premiumFactor: 0.1 },
  ],
  health: [
    { id: 'hospital', name: 'Hospitalization', description: 'Covers hospital stays', minLimit: 50000, maxLimit: 2000000, defaultLimit: 500000, premiumFactor: 0.35 },
    { id: 'outpatient', name: 'Outpatient Care', description: 'Covers doctor visits', minLimit: 5000, maxLimit: 100000, defaultLimit: 25000, premiumFactor: 0.25 },
    { id: 'prescription', name: 'Prescription Drugs', description: 'Covers medications', minLimit: 1000, maxLimit: 50000, defaultLimit: 10000, premiumFactor: 0.2 },
    { id: 'mental', name: 'Mental Health', description: 'Covers therapy and counseling', minLimit: 5000, maxLimit: 100000, defaultLimit: 20000, premiumFactor: 0.15 },
    { id: 'preventive', name: 'Preventive Care', description: 'Covers checkups and screenings', minLimit: 1000, maxLimit: 25000, defaultLimit: 5000, premiumFactor: 0.05 },
  ],
  business: [
    { id: 'general', name: 'General Liability', description: 'Covers third-party claims', minLimit: 100000, maxLimit: 5000000, defaultLimit: 1000000, premiumFactor: 0.3 },
    { id: 'property', name: 'Business Property', description: 'Covers equipment and inventory', minLimit: 25000, maxLimit: 2000000, defaultLimit: 250000, premiumFactor: 0.25 },
    { id: 'workers', name: 'Workers Compensation', description: 'Covers employee injuries', minLimit: 100000, maxLimit: 2000000, defaultLimit: 500000, premiumFactor: 0.25 },
    { id: 'professional', name: 'Professional Liability', description: 'Covers professional errors', minLimit: 100000, maxLimit: 5000000, defaultLimit: 1000000, premiumFactor: 0.15 },
    { id: 'cyber', name: 'Cyber Liability', description: 'Covers data breaches', minLimit: 50000, maxLimit: 1000000, defaultLimit: 250000, premiumFactor: 0.05 },
  ],
};

const DEDUCTIBLE_OPTIONS: Record<InsuranceType, DeductibleOption[]> = {
  auto: [
    { amount: 250, discountPercent: 0 },
    { amount: 500, discountPercent: 5 },
    { amount: 1000, discountPercent: 10 },
    { amount: 2000, discountPercent: 15 },
  ],
  home: [
    { amount: 500, discountPercent: 0 },
    { amount: 1000, discountPercent: 5 },
    { amount: 2500, discountPercent: 10 },
    { amount: 5000, discountPercent: 15 },
  ],
  life: [
    { amount: 0, discountPercent: 0 },
  ],
  health: [
    { amount: 500, discountPercent: 0 },
    { amount: 1500, discountPercent: 8 },
    { amount: 3000, discountPercent: 15 },
    { amount: 6000, discountPercent: 22 },
  ],
  business: [
    { amount: 1000, discountPercent: 0 },
    { amount: 2500, discountPercent: 5 },
    { amount: 5000, discountPercent: 10 },
    { amount: 10000, discountPercent: 15 },
  ],
};

const AVAILABLE_DISCOUNTS: Record<InsuranceType, Discount[]> = {
  auto: [
    { id: 'd1', name: 'Multi-Policy', type: 'bundle', percent: 10, applicable: false },
    { id: 'd2', name: 'Safe Driver', type: 'behavior', percent: 15, applicable: false },
    { id: 'd3', name: 'Good Student', type: 'eligibility', percent: 8, applicable: false },
    { id: 'd4', name: 'Anti-Theft Device', type: 'equipment', percent: 5, applicable: false },
    { id: 'd5', name: 'Defensive Driving Course', type: 'education', percent: 5, applicable: false },
    { id: 'd6', name: 'Low Mileage', type: 'usage', percent: 10, applicable: false },
  ],
  home: [
    { id: 'd1', name: 'Multi-Policy', type: 'bundle', percent: 12, applicable: false },
    { id: 'd2', name: 'Security System', type: 'equipment', percent: 10, applicable: false },
    { id: 'd3', name: 'Smoke Detectors', type: 'equipment', percent: 5, applicable: false },
    { id: 'd4', name: 'Claims-Free', type: 'behavior', percent: 15, applicable: false },
    { id: 'd5', name: 'New Home', type: 'eligibility', percent: 8, applicable: false },
    { id: 'd6', name: 'Retired/Work from Home', type: 'lifestyle', percent: 5, applicable: false },
  ],
  life: [
    { id: 'd1', name: 'Non-Smoker', type: 'health', percent: 20, applicable: false },
    { id: 'd2', name: 'Healthy BMI', type: 'health', percent: 10, applicable: false },
    { id: 'd3', name: 'Annual Physical', type: 'health', percent: 5, applicable: false },
    { id: 'd4', name: 'No Hazardous Hobbies', type: 'lifestyle', percent: 8, applicable: false },
  ],
  health: [
    { id: 'd1', name: 'Wellness Program', type: 'behavior', percent: 10, applicable: false },
    { id: 'd2', name: 'Non-Smoker', type: 'health', percent: 15, applicable: false },
    { id: 'd3', name: 'Family Plan', type: 'bundle', percent: 12, applicable: false },
    { id: 'd4', name: 'Preventive Care', type: 'health', percent: 5, applicable: false },
  ],
  business: [
    { id: 'd1', name: 'Multi-Policy', type: 'bundle', percent: 10, applicable: false },
    { id: 'd2', name: 'Safety Training', type: 'education', percent: 8, applicable: false },
    { id: 'd3', name: 'Claims-Free', type: 'behavior', percent: 12, applicable: false },
    { id: 'd4', name: 'Industry Association', type: 'eligibility', percent: 5, applicable: false },
    { id: 'd5', name: 'Security Measures', type: 'equipment', percent: 7, applicable: false },
  ],
};

const COMMISSION_RATES: Record<InsuranceType, number> = {
  auto: 0.12,
  home: 0.15,
  life: 0.50,
  health: 0.08,
  business: 0.18,
};

const STORAGE_KEY = 'insurance-quote-tool-data';

// Column configuration for exports
const QUOTE_COLUMNS: ColumnConfig[] = [
  { key: 'carrierName', header: 'Carrier', type: 'string' },
  { key: 'insuranceType', header: 'Insurance Type', type: 'string' },
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'monthlyPremium', header: 'Monthly Premium', type: 'currency' },
  { key: 'annualPremium', header: 'Annual Premium', type: 'currency' },
  { key: 'deductible', header: 'Deductible', type: 'currency' },
  { key: 'totalDiscount', header: 'Total Discount %', type: 'number' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'createdAt', header: 'Created', type: 'date' },
  { key: 'expiresAt', header: 'Expires', type: 'date' },
];

const CUSTOMER_COLUMNS: ColumnConfig[] = [
  { key: 'firstName', header: 'First Name', type: 'string' },
  { key: 'lastName', header: 'Last Name', type: 'string' },
  { key: 'email', header: 'Email', type: 'string' },
  { key: 'phone', header: 'Phone', type: 'string' },
  { key: 'address', header: 'Address', type: 'string' },
  { key: 'city', header: 'City', type: 'string' },
  { key: 'state', header: 'State', type: 'string' },
  { key: 'zipCode', header: 'Zip Code', type: 'string' },
  { key: 'occupation', header: 'Occupation', type: 'string' },
  { key: 'annualIncome', header: 'Annual Income', type: 'currency' },
  { key: 'creditScore', header: 'Credit Score', type: 'number' },
  { key: 'maritalStatus', header: 'Marital Status', type: 'string' },
  { key: 'dependents', header: 'Dependents', type: 'number' },
  { key: 'createdAt', header: 'Created', type: 'date' },
];

const POLICY_COLUMNS: ColumnConfig[] = [
  { key: 'carrierName', header: 'Carrier', type: 'string' },
  { key: 'insuranceType', header: 'Insurance Type', type: 'string' },
  { key: 'customerName', header: 'Customer', type: 'string' },
  { key: 'monthlyPremium', header: 'Monthly Premium', type: 'currency' },
  { key: 'annualPremium', header: 'Annual Premium', type: 'currency' },
  { key: 'startDate', header: 'Start Date', type: 'date' },
  { key: 'endDate', header: 'End Date', type: 'date' },
  { key: 'status', header: 'Status', type: 'string' },
  { key: 'renewalDate', header: 'Renewal Date', type: 'date' },
];

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 11);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Main Component
export const InsuranceQuoteTool: React.FC<InsuranceQuoteToolProps> = ({ uiConfig }) => {
  const [isPrefilled, setIsPrefilled] = useState(false);
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // useToolData hooks for backend sync
  const {
    data: customers,
    addItem: addCustomerToBackend,
    updateItem: updateCustomerBackend,
    deleteItem: deleteCustomerBackend,
    isSynced: customersSynced,
    isSaving: customersSaving,
    lastSaved: customersLastSaved,
    syncError: customersSyncError,
    forceSync: forceCustomersSync,
  } = useToolData<CustomerProfile>('insurance-customers', [], CUSTOMER_COLUMNS);

  const {
    data: quotes,
    addItem: addQuoteToBackend,
    updateItem: updateQuoteBackend,
    deleteItem: deleteQuoteBackend,
    isSynced: quotesSynced,
    isSaving: quotesSaving,
    lastSaved: quotesLastSaved,
    syncError: quotesSyncError,
    forceSync: forceQuotesSync,
  } = useToolData<Quote>('insurance-quotes', [], QUOTE_COLUMNS);

  const {
    data: policies,
    addItem: addPolicyToBackend,
    updateItem: updatePolicyBackend,
    deleteItem: deletePolicyBackend,
    isSynced: policiesSynced,
    isSaving: policiesSaving,
    lastSaved: policiesLastSaved,
    syncError: policiesSyncError,
    forceSync: forcePoliciesSync,
  } = useToolData<Policy>('insurance-policies', [], POLICY_COLUMNS);

  const {
    data: communicationLogs,
    addItem: addCommunicationLogToBackend,
    updateItem: updateCommunicationLogBackend,
    deleteItem: deleteCommunicationLogBackend,
  } = useToolData<CommunicationLog>('insurance-communications', [], []);

  // Local UI State (non-synced)
  const [activeTab, setActiveTab] = useState<'quotes' | 'customers' | 'policies' | 'analytics'>('quotes');
  const [selectedInsuranceType, setSelectedInsuranceType] = useState<InsuranceType>('auto');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [coverages, setCoverages] = useState<Record<string, number>>({});
  const [selectedDeductible, setSelectedDeductible] = useState<number>(0);
  const [selectedDiscounts, setSelectedDiscounts] = useState<Discount[]>([]);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showCommunicationForm, setShowCommunicationForm] = useState(false);
  const [generatedQuotes, setGeneratedQuotes] = useState<Quote[]>([]);
  const [expandedQuoteId, setExpandedQuoteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // New customer form state
  const [newCustomer, setNewCustomer] = useState<Partial<CustomerProfile>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    occupation: '',
    annualIncome: 0,
    creditScore: 700,
    maritalStatus: 'single',
    dependents: 0,
  });

  // New communication form state
  const [newCommunication, setNewCommunication] = useState<Partial<CommunicationLog>>({
    type: 'note',
    subject: '',
    content: '',
  });

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.client || params.firstName || params.lastName) {
        setNewCustomer({
          ...newCustomer,
          firstName: params.firstName || '',
          lastName: params.lastName || params.client?.split(' ').pop() || '',
          email: params.email || '',
          phone: params.phone || '',
        });
        setShowCustomerForm(true);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  // Initialize coverages when insurance type changes
  useEffect(() => {
    const defaultCoverages: Record<string, number> = {};
    COVERAGE_OPTIONS[selectedInsuranceType].forEach((opt) => {
      defaultCoverages[opt.id] = opt.defaultLimit;
    });
    setCoverages(defaultCoverages);
    setSelectedDeductible(DEDUCTIBLE_OPTIONS[selectedInsuranceType][0].amount);
    setSelectedDiscounts(AVAILABLE_DISCOUNTS[selectedInsuranceType].map((d) => ({ ...d })));
    setGeneratedQuotes([]);
  }, [selectedInsuranceType]);

  // Calculate premium for a carrier
  const calculatePremium = (carrier: Carrier): { monthly: number; annual: number; discountTotal: number } => {
    let basePremium = carrier.baseRates[selectedInsuranceType];

    // Add coverage factors
    const coverageOptions = COVERAGE_OPTIONS[selectedInsuranceType];
    coverageOptions.forEach((opt) => {
      const limit = coverages[opt.id] || opt.defaultLimit;
      const factor = (limit / opt.defaultLimit) * opt.premiumFactor;
      basePremium += basePremium * factor;
    });

    // Apply deductible discount
    const deductibleOption = DEDUCTIBLE_OPTIONS[selectedInsuranceType].find(
      (d) => d.amount === selectedDeductible
    );
    if (deductibleOption) {
      basePremium *= 1 - deductibleOption.discountPercent / 100;
    }

    // Apply selected discounts
    let totalDiscount = 0;
    selectedDiscounts.forEach((discount) => {
      if (discount.applicable) {
        totalDiscount += discount.percent;
      }
    });
    basePremium *= 1 - totalDiscount / 100;

    // Add customer risk factors
    const customer = customers.find((c) => c.id === selectedCustomerId);
    if (customer) {
      // Credit score factor
      if (customer.creditScore < 600) basePremium *= 1.25;
      else if (customer.creditScore < 700) basePremium *= 1.1;
      else if (customer.creditScore >= 800) basePremium *= 0.9;

      // Age factor for life and health
      if (selectedInsuranceType === 'life' || selectedInsuranceType === 'health') {
        const age = new Date().getFullYear() - new Date(customer.dateOfBirth).getFullYear();
        if (age > 60) basePremium *= 1.5;
        else if (age > 50) basePremium *= 1.25;
        else if (age < 30) basePremium *= 0.85;
      }
    }

    const monthlyPremium = Math.round(basePremium);
    const annualPremium = Math.round(monthlyPremium * 12 * 0.95); // 5% annual payment discount

    return { monthly: monthlyPremium, annual: annualPremium, discountTotal: totalDiscount };
  };

  // Generate quotes from all carriers
  const generateQuotes = () => {
    if (!selectedCustomerId) {
      setValidationMessage('Please select a customer first');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const newQuotes: Quote[] = CARRIERS.map((carrier) => {
      const { monthly, annual, discountTotal } = calculatePremium(carrier);
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 30);

      return {
        id: generateId(),
        carrierId: carrier.id,
        carrierName: carrier.name,
        insuranceType: selectedInsuranceType,
        customerId: selectedCustomerId,
        monthlyPremium: monthly,
        annualPremium: annual,
        coverages: { ...coverages },
        deductible: selectedDeductible,
        discounts: selectedDiscounts.filter((d) => d.applicable),
        totalDiscount: discountTotal,
        createdAt: new Date().toISOString(),
        expiresAt: expirationDate.toISOString(),
        status: 'pending',
      };
    });

    // Sort by monthly premium
    newQuotes.sort((a, b) => a.monthlyPremium - b.monthlyPremium);
    setGeneratedQuotes(newQuotes);
  };

  // Save quote to history
  const saveQuote = (quote: Quote) => {
    // Use hook to add quote with backend sync
    addQuoteToBackend(quote);
  };

  // Accept quote and create policy
  const acceptQuote = (quote: Quote) => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);
    const renewalDate = new Date(endDate);
    renewalDate.setDate(renewalDate.getDate() - 30);

    const newPolicy: Policy = {
      id: generateId(),
      quoteId: quote.id,
      customerId: quote.customerId,
      carrierName: quote.carrierName,
      insuranceType: quote.insuranceType,
      monthlyPremium: quote.monthlyPremium,
      annualPremium: quote.annualPremium,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status: 'active',
      renewalDate: renewalDate.toISOString(),
    };

    // Use hooks to add policy and update quote with backend sync
    addPolicyToBackend(newPolicy);

    // Update quote status
    const updatedQuote = { ...quote, status: 'accepted' as const };
    updateQuoteBackend(quote.id, { status: 'accepted' });
    setGeneratedQuotes((prev) =>
      prev.map((q) => (q.id === quote.id ? updatedQuote : q))
    );
  };

  // Add new customer
  const addCustomer = () => {
    if (!newCustomer.firstName || !newCustomer.lastName || !newCustomer.email) {
      setValidationMessage('Please fill in required fields (First Name, Last Name, Email)');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const customer: CustomerProfile = {
      id: generateId(),
      firstName: newCustomer.firstName || '',
      lastName: newCustomer.lastName || '',
      email: newCustomer.email || '',
      phone: newCustomer.phone || '',
      dateOfBirth: newCustomer.dateOfBirth || '',
      address: newCustomer.address || '',
      city: newCustomer.city || '',
      state: newCustomer.state || '',
      zipCode: newCustomer.zipCode || '',
      occupation: newCustomer.occupation || '',
      annualIncome: newCustomer.annualIncome || 0,
      creditScore: newCustomer.creditScore || 700,
      maritalStatus: newCustomer.maritalStatus || 'single',
      dependents: newCustomer.dependents || 0,
      createdAt: new Date().toISOString(),
    };

    // Use hook to add customer with backend sync
    addCustomerToBackend(customer);
    setSelectedCustomerId(customer.id);
    setShowCustomerForm(false);
    setNewCustomer({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      occupation: '',
      annualIncome: 0,
      creditScore: 700,
      maritalStatus: 'single',
      dependents: 0,
    });
  };

  // Delete customer
  const deleteCustomer = async (customerId: string) => {
    const confirmed = await confirm({
      title: 'Delete Customer',
      message: 'Are you sure you want to delete this customer? This will also remove their quotes and policies.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      // Use hooks to delete with backend sync
      deleteCustomerBackend(customerId);
      quotes.forEach((q) => {
        if (q.customerId === customerId) deleteQuoteBackend(q.id);
      });
      policies.forEach((p) => {
        if (p.customerId === customerId) deletePolicyBackend(p.id);
      });
      communicationLogs.forEach((l) => {
        if (l.customerId === customerId) deleteCommunicationLogBackend(l.id);
      });
      if (selectedCustomerId === customerId) {
        setSelectedCustomerId('');
      }
    }
  };

  // Add communication log
  const addCommunication = () => {
    if (!selectedCustomerId || !newCommunication.subject) {
      setValidationMessage('Please select a customer and enter a subject');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const log: CommunicationLog = {
      id: generateId(),
      customerId: selectedCustomerId,
      type: newCommunication.type || 'note',
      subject: newCommunication.subject || '',
      content: newCommunication.content || '',
      date: new Date().toISOString(),
    };

    // Use hook to add communication log with backend sync
    addCommunicationLogToBackend(log);
    setShowCommunicationForm(false);
    setNewCommunication({ type: 'note', subject: '', content: '' });
  };

  // Calculate commission
  const calculateCommission = useMemo(() => {
    const activePolicies = policies.filter((p) => p.status === 'active');
    let totalAnnualPremium = 0;
    let totalCommission = 0;

    activePolicies.forEach((policy) => {
      totalAnnualPremium += policy.annualPremium;
      totalCommission += policy.annualPremium * COMMISSION_RATES[policy.insuranceType];
    });

    return {
      totalPolicies: activePolicies.length,
      totalAnnualPremium,
      totalCommission,
      averageCommissionRate: activePolicies.length > 0
        ? (totalCommission / totalAnnualPremium) * 100
        : 0,
    };
  }, [policies]);

  // Cross-sell opportunities
  const crossSellOpportunities = useMemo((): CrossSellOpportunity[] => {
    const opportunities: CrossSellOpportunity[] = [];

    customers.forEach((customer) => {
      const customerPolicies = policies.filter((p) => p.customerId === customer.id && p.status === 'active');
      const hasTypes = new Set(customerPolicies.map((p) => p.insuranceType));

      INSURANCE_TYPES.forEach(({ type }) => {
        if (!hasTypes.has(type)) {
          let reason = '';
          let priority: 'high' | 'medium' | 'low' = 'medium';
          let potentialPremium = CARRIERS[0].baseRates[type] * 12;

          switch (type) {
            case 'auto':
              if (hasTypes.has('home')) {
                reason = 'Bundle discount available with existing home policy';
                priority = 'high';
              } else {
                reason = 'Basic coverage need';
              }
              break;
            case 'home':
              if (hasTypes.has('auto')) {
                reason = 'Bundle discount available with existing auto policy';
                priority = 'high';
              } else if (customer.annualIncome > 75000) {
                reason = 'Income suggests homeownership potential';
                priority = 'medium';
              }
              break;
            case 'life':
              if (customer.dependents > 0) {
                reason = 'Has dependents - family protection needed';
                priority = 'high';
                potentialPremium *= 1.5;
              } else if (customer.maritalStatus === 'married') {
                reason = 'Married - spouse protection';
                priority = 'medium';
              }
              break;
            case 'health':
              if (!hasTypes.has('health')) {
                reason = 'Essential coverage gap';
                priority = 'high';
              }
              break;
            case 'business':
              if (customer.occupation.toLowerCase().includes('owner') ||
                  customer.occupation.toLowerCase().includes('entrepreneur')) {
                reason = 'Business owner - liability protection needed';
                priority = 'high';
                potentialPremium *= 2;
              }
              break;
          }

          if (reason) {
            opportunities.push({
              customerId: customer.id,
              insuranceType: type,
              reason,
              potentialPremium,
              priority,
            });
          }
        }
      });
    });

    return opportunities.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [customers, policies]);

  // Policies due for renewal
  const renewalAlerts = useMemo(() => {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    return policies.filter((p) => {
      const renewalDate = new Date(p.renewalDate);
      return p.status === 'active' && renewalDate >= now && renewalDate <= thirtyDaysFromNow;
    });
  }, [policies]);

  // Filtered quotes for history
  const filteredQuotes = useMemo(() => {
    return quotes.filter((quote) => {
      const customer = customers.find((c) => c.id === quote.customerId);
      const customerName = customer ? `${customer.firstName} ${customer.lastName}`.toLowerCase() : '';
      const matchesSearch =
        searchTerm === '' ||
        customerName.includes(searchTerm.toLowerCase()) ||
        quote.carrierName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || quote.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [quotes, customers, searchTerm, filterStatus]);

  // Selected customer
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  // Customer communication logs
  const customerLogs = communicationLogs.filter((l) => l.customerId === selectedCustomerId);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Validation Message Toast */}
        {validationMessage && (
          <div className="fixed top-4 left-4 right-4 z-50 max-w-md">
            <div className={`${theme === 'dark' ? 'bg-gray-800 border-red-600' : 'bg-white border-red-400'} border rounded-lg p-4 shadow-lg flex items-start gap-3`}>
              <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} />
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-red-300' : 'text-red-700'}`}>
                {validationMessage}
              </p>
            </div>
          </div>
        )}

        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.insuranceQuote.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.insuranceQuote.insuranceQuoteTool', 'Insurance Quote Tool')}
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('tools.insuranceQuote.compareQuotesManageClientsAnd', 'Compare quotes, manage clients, and track commissions')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WidgetEmbedButton toolSlug="insurance-quote" toolName="Insurance Quote" />

              <SyncStatus
                isSynced={quotesSynced}
                isSaving={quotesSaving}
                lastSaved={quotesLastSaved}
                syncError={quotesSyncError}
                onForceSync={forceQuotesSync}
                theme={theme}
                showLabel={true}
                size="md"
              />
              <ExportDropdown
                onExportCSV={() => {
                  const exportData = quotes.map(q => {
                    const customer = customers.find(c => c.id === q.customerId);
                    return {
                      ...q,
                      customerName: customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown',
                    };
                  });
                  exportToCSV(exportData, QUOTE_COLUMNS, { filename: 'insurance-quotes' });
                }}
                onExportExcel={() => {
                  const exportData = quotes.map(q => {
                    const customer = customers.find(c => c.id === q.customerId);
                    return {
                      ...q,
                      customerName: customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown',
                    };
                  });
                  exportToExcel(exportData, QUOTE_COLUMNS, { filename: 'insurance-quotes' });
                }}
                onExportJSON={() => {
                  const exportData = quotes.map(q => {
                    const customer = customers.find(c => c.id === q.customerId);
                    return {
                      ...q,
                      customerName: customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown',
                    };
                  });
                  exportToJSON(exportData, { filename: 'insurance-quotes' });
                }}
                onExportPDF={async () => {
                  const exportData = quotes.map(q => {
                    const customer = customers.find(c => c.id === q.customerId);
                    return {
                      ...q,
                      customerName: customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown',
                    };
                  });
                  await exportToPDF(exportData, QUOTE_COLUMNS, {
                    filename: 'insurance-quotes',
                    title: 'Insurance Quotes Report',
                    subtitle: `${quotes.length} quotes | ${policies.length} active policies`,
                  });
                }}
                onPrint={() => {
                  const exportData = quotes.map(q => {
                    const customer = customers.find(c => c.id === q.customerId);
                    return {
                      ...q,
                      customerName: customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown',
                    };
                  });
                  printData(exportData, QUOTE_COLUMNS, { title: 'Insurance Quotes' });
                }}
                onCopyToClipboard={async () => {
                  const exportData = quotes.map(q => {
                    const customer = customers.find(c => c.id === q.customerId);
                    return {
                      ...q,
                      customerName: customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown',
                    };
                  });
                  return await copyUtil(exportData, QUOTE_COLUMNS, 'tab');
                }}
                showImport={false}
                theme={theme}
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'quotes', label: 'Quote Generator', icon: <FileText className="w-4 h-4" /> },
              { id: 'customers', label: 'Customers', icon: <User className="w-4 h-4" /> },
              { id: 'policies', label: 'Policies', icon: <Shield className="w-4 h-4" /> },
              { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Renewal Alerts */}
        {renewalAlerts.length > 0 && (
          <div className={`${theme === 'dark' ? 'bg-yellow-900/30' : 'bg-yellow-50'} border ${theme === 'dark' ? 'border-yellow-700' : 'border-yellow-200'} rounded-lg p-4 mb-6`}>
            <div className="flex items-center gap-2 mb-2">
              <Bell className={`w-5 h-5 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`} />
              <span className={`font-semibold ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-800'}`}>
                {renewalAlerts.length} Policy Renewal{renewalAlerts.length > 1 ? 's' : ''} Coming Up
              </span>
            </div>
            <div className="space-y-1">
              {renewalAlerts.slice(0, 3).map((policy) => {
                const customer = customers.find((c) => c.id === policy.customerId);
                return (
                  <p key={policy.id} className={`text-sm ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700'}`}>
                    {customer?.firstName} {customer?.lastName} - {policy.carrierName} ({policy.insuranceType}) - Renewal: {formatDate(policy.renewalDate)}
                  </p>
                );
              })}
            </div>
          </div>
        )}

        {/* Quote Generator Tab */}
        {activeTab === 'quotes' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Configuration */}
            <div className="lg:col-span-1 space-y-6">
              {/* Insurance Type Selection */}
              <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                <CardHeader className="pb-3">
                  <CardTitle className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.insuranceQuote.insuranceType', 'Insurance Type')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    {INSURANCE_TYPES.map(({ type, label, icon }) => (
                      <button
                        key={type}
                        onClick={() => setSelectedInsuranceType(type)}
                        className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-colors ${
                          selectedInsuranceType === type
                            ? 'bg-[#0D9488] text-white'
                            : theme === 'dark'
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {icon}
                        <span className="text-xs font-medium">{label}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Customer Selection */}
              <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                <CardHeader className="pb-3">
                  <CardTitle className={`text-lg flex items-center justify-between ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <span>{t('tools.insuranceQuote.customer', 'Customer')}</span>
                    <button
                      onClick={() => setShowCustomerForm(true)}
                      className="p-1 rounded bg-[#0D9488] text-white hover:bg-[#0F766E]"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  >
                    <option value="">{t('tools.insuranceQuote.selectACustomer', 'Select a customer...')}</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.firstName} {customer.lastName}
                      </option>
                    ))}
                  </select>

                  {selectedCustomer && (
                    <div className={`mt-3 p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        <strong>{t('tools.insuranceQuote.email', 'Email:')}</strong> {selectedCustomer.email}
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        <strong>{t('tools.insuranceQuote.creditScore', 'Credit Score:')}</strong> {selectedCustomer.creditScore}
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        <strong>{t('tools.insuranceQuote.location', 'Location:')}</strong> {selectedCustomer.city}, {selectedCustomer.state}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Coverage Options */}
              <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                <CardHeader className="pb-3">
                  <CardTitle className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.insuranceQuote.coverageLimits', 'Coverage Limits')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {COVERAGE_OPTIONS[selectedInsuranceType].map((option) => (
                    <div key={option.id}>
                      <div className="flex justify-between items-center mb-1">
                        <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {option.name}
                        </label>
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {formatCurrency(coverages[option.id] || option.defaultLimit)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={option.minLimit}
                        max={option.maxLimit}
                        step={(option.maxLimit - option.minLimit) / 20}
                        value={coverages[option.id] || option.defaultLimit}
                        onChange={(e) =>
                          setCoverages((prev) => ({ ...prev, [option.id]: parseInt(e.target.value) }))
                        }
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0D9488]"
                      />
                      <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                        {option.description}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Deductible Options */}
              <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                <CardHeader className="pb-3">
                  <CardTitle className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.insuranceQuote.deductible2', 'Deductible')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {DEDUCTIBLE_OPTIONS[selectedInsuranceType].map((option) => (
                      <button
                        key={option.amount}
                        onClick={() => setSelectedDeductible(option.amount)}
                        className={`p-3 rounded-lg text-center transition-colors ${
                          selectedDeductible === option.amount
                            ? 'bg-[#0D9488] text-white'
                            : theme === 'dark'
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <div className="font-semibold">{formatCurrency(option.amount)}</div>
                        {option.discountPercent > 0 && (
                          <div className="text-xs opacity-75">-{option.discountPercent}% premium</div>
                        )}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Discounts */}
              <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                <CardHeader className="pb-3">
                  <CardTitle className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.insuranceQuote.availableDiscounts', 'Available Discounts')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {selectedDiscounts.map((discount, index) => (
                    <label
                      key={discount.id}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer ${
                        theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={discount.applicable}
                          onChange={(e) => {
                            const updated = [...selectedDiscounts];
                            updated[index].applicable = e.target.checked;
                            setSelectedDiscounts(updated);
                          }}
                          className="w-4 h-4 accent-[#0D9488]"
                        />
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {discount.name}
                        </span>
                      </div>
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                        -{discount.percent}%
                      </span>
                    </label>
                  ))}
                </CardContent>
              </Card>

              {/* Generate Button */}
              <button
                onClick={generateQuotes}
                disabled={!selectedCustomerId}
                className={`w-full py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
                  selectedCustomerId
                    ? t('tools.insuranceQuote.bg0d9488TextWhiteHover', 'bg-[#0D9488] text-white hover:bg-[#0F766E]') : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }`}
              >
                <RefreshCw className="w-5 h-5" />
                {t('tools.insuranceQuote.generateQuotes', 'Generate Quotes')}
              </button>
            </div>

            {/* Right Column - Quote Results */}
            <div className="lg:col-span-2 space-y-6">
              {generatedQuotes.length > 0 ? (
                <>
                  {/* Quote Comparison Table */}
                  <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                    <CardHeader>
                      <CardTitle className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        <Building2 className="w-5 h-5" />
                        {t('tools.insuranceQuote.quoteComparison', 'Quote Comparison')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                              <th className={`text-left py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                {t('tools.insuranceQuote.carrier2', 'Carrier')}
                              </th>
                              <th className={`text-right py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                {t('tools.insuranceQuote.monthly', 'Monthly')}
                              </th>
                              <th className={`text-right py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                {t('tools.insuranceQuote.annual', 'Annual')}
                              </th>
                              <th className={`text-right py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                {t('tools.insuranceQuote.discount', 'Discount')}
                              </th>
                              <th className={`text-center py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                {t('tools.insuranceQuote.actions', 'Actions')}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {generatedQuotes.map((quote, index) => {
                              const carrier = CARRIERS.find((c) => c.id === quote.carrierId);
                              return (
                                <tr
                                  key={quote.id}
                                  className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} ${
                                    index === 0 ? (theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50') : ''
                                  }`}
                                >
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-3">
                                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white ${
                                        index === 0 ? t('tools.insuranceQuote.bg0d9488', 'bg-[#0D9488]') : 'bg-gray-500'
                                      }`}>
                                        {carrier?.logo}
                                      </div>
                                      <div>
                                        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                          {quote.carrierName}
                                        </p>
                                        <div className="flex items-center gap-1">
                                          <Star className={`w-3 h-3 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'}`} />
                                          <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {carrier?.rating}
                                          </span>
                                          {index === 0 && (
                                            <span className="ml-2 text-xs bg-[#0D9488] text-white px-2 py-0.5 rounded">
                                              {t('tools.insuranceQuote.bestValue', 'Best Value')}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className={`py-3 px-4 text-right font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {formatCurrency(quote.monthlyPremium)}
                                  </td>
                                  <td className={`py-3 px-4 text-right ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {formatCurrency(quote.annualPremium)}
                                  </td>
                                  <td className={`py-3 px-4 text-right ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                                    {quote.totalDiscount > 0 ? `-${quote.totalDiscount}%` : '-'}
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="flex items-center justify-center gap-2">
                                      <button
                                        onClick={() => setExpandedQuoteId(expandedQuoteId === quote.id ? null : quote.id)}
                                        className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                                      >
                                        {expandedQuoteId === quote.id ? (
                                          <ChevronUp className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                                        ) : (
                                          <ChevronDown className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                                        )}
                                      </button>
                                      <button
                                        onClick={() => saveQuote(quote)}
                                        className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700 text-blue-400' : 'hover:bg-gray-100 text-blue-600'}`}
                                        title={t('tools.insuranceQuote.saveQuote', 'Save Quote')}
                                      >
                                        <Save className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => acceptQuote(quote)}
                                        disabled={quote.status === 'accepted'}
                                        className={`p-2 rounded-lg ${
                                          quote.status === 'accepted'
                                            ? 'text-gray-400 cursor-not-allowed'
                                            : theme === 'dark'
                                            ? 'hover:bg-gray-700 text-green-400'
                                            : 'hover:bg-gray-100 text-green-600'
                                        }`}
                                        title={quote.status === 'accepted' ? t('tools.insuranceQuote.alreadyAccepted', 'Already Accepted') : t('tools.insuranceQuote.acceptQuote', 'Accept Quote')}
                                      >
                                        <CheckCircle className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Expanded Quote Details */}
                  {expandedQuoteId && (
                    <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                      <CardHeader>
                        <CardTitle className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {t('tools.insuranceQuote.coverageBreakdown', 'Coverage Breakdown')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {(() => {
                          const quote = generatedQuotes.find((q) => q.id === expandedQuoteId);
                          if (!quote) return null;
                          return (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {Object.entries(quote.coverages).map(([key, value]) => {
                                  const option = COVERAGE_OPTIONS[selectedInsuranceType].find((o) => o.id === key);
                                  return (
                                    <div
                                      key={key}
                                      className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
                                    >
                                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {option?.name || key}
                                      </p>
                                      <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                        {formatCurrency(value)}
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>
                              <div className={`border-t pt-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                                <div className="flex justify-between items-center mb-2">
                                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.insuranceQuote.deductible', 'Deductible')}</span>
                                  <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {formatCurrency(quote.deductible)}
                                  </span>
                                </div>
                                {quote.discounts.length > 0 && (
                                  <div className="mt-3">
                                    <p className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                      {t('tools.insuranceQuote.appliedDiscounts', 'Applied Discounts:')}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                      {quote.discounts.map((discount) => (
                                        <span
                                          key={discount.id}
                                          className={`text-xs px-2 py-1 rounded ${
                                            theme === 'dark' ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-700'
                                          }`}
                                        >
                                          {discount.name} (-{discount.percent}%)
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                      </CardContent>
                    </Card>
                  )}

                  {/* Commission Preview */}
                  <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                    <CardHeader>
                      <CardTitle className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        <DollarSign className="w-5 h-5" />
                        {t('tools.insuranceQuote.commissionPreview', 'Commission Preview')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        {generatedQuotes.slice(0, 3).map((quote) => {
                          const commission = quote.annualPremium * COMMISSION_RATES[selectedInsuranceType];
                          return (
                            <div
                              key={quote.id}
                              className={`p-4 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
                            >
                              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                {quote.carrierName}
                              </p>
                              <p className={`text-xl font-bold ${theme === 'dark' ? t('tools.insuranceQuote.text0d9488', 'text-[#0D9488]') : t('tools.insuranceQuote.text0d94882', 'text-[#0D9488]')}`}>
                                {formatCurrency(commission)}
                              </p>
                              <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                {(COMMISSION_RATES[selectedInsuranceType] * 100).toFixed(0)}% rate
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                  <CardContent className="py-16 text-center">
                    <Shield className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
                    <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t('tools.insuranceQuote.selectACustomerAndConfigure', 'Select a customer and configure coverage options to generate quotes')}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Quote History */}
              {quotes.length > 0 && (
                <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                  <CardHeader>
                    <CardTitle className={`flex items-center justify-between ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      <div className="flex items-center gap-2">
                        <History className="w-5 h-5" />
                        {t('tools.insuranceQuote.quoteHistory', 'Quote History')}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                          <input
                            type="text"
                            placeholder={t('tools.insuranceQuote.search', 'Search...')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`pl-9 pr-3 py-1.5 text-sm rounded-lg border ${
                              theme === 'dark'
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                            } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                          />
                        </div>
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className={`px-3 py-1.5 text-sm rounded-lg border ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                        >
                          <option value="all">{t('tools.insuranceQuote.allStatus', 'All Status')}</option>
                          <option value="pending">{t('tools.insuranceQuote.pending', 'Pending')}</option>
                          <option value="accepted">{t('tools.insuranceQuote.accepted', 'Accepted')}</option>
                          <option value="declined">{t('tools.insuranceQuote.declined', 'Declined')}</option>
                          <option value="expired">{t('tools.insuranceQuote.expired', 'Expired')}</option>
                        </select>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {filteredQuotes.map((quote) => {
                        const customer = customers.find((c) => c.id === quote.customerId);
                        return (
                          <div
                            key={quote.id}
                            className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {customer?.firstName} {customer?.lastName} - {quote.carrierName}
                                </p>
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {quote.insuranceType.charAt(0).toUpperCase() + quote.insuranceType.slice(1)} | {formatDate(quote.createdAt)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {formatCurrency(quote.monthlyPremium)}/mo
                                </p>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded ${
                                    quote.status === 'accepted'
                                      ? 'bg-green-500/20 text-green-500'
                                      : quote.status === 'declined'
                                      ? 'bg-red-500/20 text-red-500'
                                      : quote.status === 'expired'
                                      ? 'bg-gray-500/20 text-gray-500'
                                      : 'bg-yellow-500/20 text-yellow-500'
                                  }`}
                                >
                                  {quote.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Customer List */}
            <div className="lg:col-span-1">
              <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                <CardHeader>
                  <CardTitle className={`flex items-center justify-between ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <span>Customers ({customers.length})</span>
                    <button
                      onClick={() => setShowCustomerForm(true)}
                      className="p-2 rounded-lg bg-[#0D9488] text-white hover:bg-[#0F766E]"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {customers.map((customer) => (
                      <div
                        key={customer.id}
                        onClick={() => setSelectedCustomerId(customer.id)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedCustomerId === customer.id
                            ? 'bg-[#0D9488] text-white'
                            : theme === 'dark'
                            ? 'bg-gray-700 hover:bg-gray-600'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`font-medium ${selectedCustomerId === customer.id ? 'text-white' : theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {customer.firstName} {customer.lastName}
                            </p>
                            <p className={`text-sm ${selectedCustomerId === customer.id ? 'text-white/70' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {customer.email}
                            </p>
                          </div>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              await deleteCustomer(customer.id);
                            }}
                            className={`p-1 rounded hover:bg-red-500/20 ${
                              selectedCustomerId === customer.id ? 'text-white/70' : 'text-red-500'
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {customers.length === 0 && (
                      <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {t('tools.insuranceQuote.noCustomersYetAddYour', 'No customers yet. Add your first customer!')}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Customer Details */}
            <div className="lg:col-span-2 space-y-6">
              {selectedCustomer ? (
                <>
                  <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                    <CardHeader>
                      <CardTitle className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {t('tools.insuranceQuote.customerProfile', 'Customer Profile')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.insuranceQuote.fullName', 'Full Name')}</p>
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {selectedCustomer.firstName} {selectedCustomer.lastName}
                          </p>
                        </div>
                        <div>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.insuranceQuote.email2', 'Email')}</p>
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {selectedCustomer.email}
                          </p>
                        </div>
                        <div>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.insuranceQuote.phone', 'Phone')}</p>
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {selectedCustomer.phone || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.insuranceQuote.dateOfBirth', 'Date of Birth')}</p>
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {selectedCustomer.dateOfBirth ? formatDate(selectedCustomer.dateOfBirth) : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.insuranceQuote.location2', 'Location')}</p>
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {selectedCustomer.city}, {selectedCustomer.state} {selectedCustomer.zipCode}
                          </p>
                        </div>
                        <div>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.insuranceQuote.address', 'Address')}</p>
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {selectedCustomer.address || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.insuranceQuote.occupation', 'Occupation')}</p>
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {selectedCustomer.occupation || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.insuranceQuote.annualIncome', 'Annual Income')}</p>
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {formatCurrency(selectedCustomer.annualIncome)}
                          </p>
                        </div>
                        <div>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.insuranceQuote.creditScore2', 'Credit Score')}</p>
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {selectedCustomer.creditScore}
                          </p>
                        </div>
                        <div>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.insuranceQuote.maritalStatus', 'Marital Status')}</p>
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {selectedCustomer.maritalStatus.charAt(0).toUpperCase() + selectedCustomer.maritalStatus.slice(1)}
                          </p>
                        </div>
                        <div>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.insuranceQuote.dependents', 'Dependents')}</p>
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {selectedCustomer.dependents}
                          </p>
                        </div>
                        <div>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.insuranceQuote.customerSince', 'Customer Since')}</p>
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {formatDate(selectedCustomer.createdAt)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Customer Policies */}
                  <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                    <CardHeader>
                      <CardTitle className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {t('tools.insuranceQuote.activePolicies', 'Active Policies')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {policies.filter((p) => p.customerId === selectedCustomerId && p.status === 'active').length > 0 ? (
                        <div className="space-y-3">
                          {policies
                            .filter((p) => p.customerId === selectedCustomerId && p.status === 'active')
                            .map((policy) => (
                              <div
                                key={policy.id}
                                className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    {INSURANCE_TYPES.find((t) => t.type === policy.insuranceType)?.icon}
                                    <div>
                                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                        {policy.carrierName}
                                      </p>
                                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {policy.insuranceType.charAt(0).toUpperCase() + policy.insuranceType.slice(1)} Insurance
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                      {formatCurrency(policy.monthlyPremium)}/mo
                                    </p>
                                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                      Renews: {formatDate(policy.renewalDate)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className={`text-center py-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {t('tools.insuranceQuote.noActivePolicies', 'No active policies')}
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Communication Log */}
                  <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                    <CardHeader>
                      <CardTitle className={`flex items-center justify-between ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-5 h-5" />
                          {t('tools.insuranceQuote.communicationLog', 'Communication Log')}
                        </div>
                        <button
                          onClick={() => setShowCommunicationForm(true)}
                          className="p-2 rounded-lg bg-[#0D9488] text-white hover:bg-[#0F766E]"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {customerLogs.length > 0 ? (
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {customerLogs.map((log) => (
                            <div
                              key={log.id}
                              className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
                            >
                              <div className="flex items-start gap-3">
                                {log.type === 'email' && <Mail className={`w-4 h-4 mt-1 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />}
                                {log.type === 'phone' && <Phone className={`w-4 h-4 mt-1 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />}
                                {log.type === 'meeting' && <Calendar className={`w-4 h-4 mt-1 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />}
                                {log.type === 'note' && <FileText className={`w-4 h-4 mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />}
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                      {log.subject}
                                    </p>
                                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                      {formatDate(log.date)}
                                    </span>
                                  </div>
                                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {log.content}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className={`text-center py-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {t('tools.insuranceQuote.noCommunicationLogsYet', 'No communication logs yet')}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                  <CardContent className="py-16 text-center">
                    <User className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
                    <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {t('tools.insuranceQuote.selectACustomerToView', 'Select a customer to view their profile')}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Policies Tab */}
        {activeTab === 'policies' && (
          <div className="space-y-6">
            <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
              <CardHeader>
                <CardTitle className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  All Policies ({policies.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {policies.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                          <th className={`text-left py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.insuranceQuote.customer2', 'Customer')}</th>
                          <th className={`text-left py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.insuranceQuote.type', 'Type')}</th>
                          <th className={`text-left py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.insuranceQuote.carrier', 'Carrier')}</th>
                          <th className={`text-right py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.insuranceQuote.premium', 'Premium')}</th>
                          <th className={`text-center py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.insuranceQuote.status', 'Status')}</th>
                          <th className={`text-right py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.insuranceQuote.renewal', 'Renewal')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {policies.map((policy) => {
                          const customer = customers.find((c) => c.id === policy.customerId);
                          const renewalDate = new Date(policy.renewalDate);
                          const isUpcomingRenewal = renewalDate <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                          return (
                            <tr key={policy.id} className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                              <td className={`py-3 px-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {customer?.firstName} {customer?.lastName}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  {INSURANCE_TYPES.find((t) => t.type === policy.insuranceType)?.icon}
                                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                                    {policy.insuranceType.charAt(0).toUpperCase() + policy.insuranceType.slice(1)}
                                  </span>
                                </div>
                              </td>
                              <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                {policy.carrierName}
                              </td>
                              <td className={`py-3 px-4 text-right font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {formatCurrency(policy.monthlyPremium)}/mo
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className={`px-2 py-1 rounded text-xs ${
                                  policy.status === 'active'
                                    ? 'bg-green-500/20 text-green-500'
                                    : policy.status === 'pending_renewal'
                                    ? 'bg-yellow-500/20 text-yellow-500'
                                    : policy.status === 'cancelled'
                                    ? 'bg-red-500/20 text-red-500'
                                    : 'bg-gray-500/20 text-gray-500'
                                }`}>
                                  {policy.status.replace('_', ' ')}
                                </span>
                              </td>
                              <td className={`py-3 px-4 text-right ${
                                isUpcomingRenewal
                                  ? theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
                                  : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                {formatDate(policy.renewalDate)}
                                {isUpcomingRenewal && (
                                  <AlertCircle className="w-4 h-4 inline ml-1" />
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.insuranceQuote.noPoliciesYetAcceptQuotes', 'No policies yet. Accept quotes to create policies.')}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Commission Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                <CardContent className="py-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-500/20 rounded-lg">
                      <Shield className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.insuranceQuote.totalPolicies', 'Total Policies')}</p>
                      <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {calculateCommission.totalPolicies}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                <CardContent className="py-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-500/20 rounded-lg">
                      <DollarSign className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.insuranceQuote.totalPremium', 'Total Premium')}</p>
                      <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(calculateCommission.totalAnnualPremium)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                <CardContent className="py-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#0D9488]/20 rounded-lg">
                      <Award className="w-6 h-6 text-[#0D9488]" />
                    </div>
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.insuranceQuote.totalCommission', 'Total Commission')}</p>
                      <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(calculateCommission.totalCommission)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
                <CardContent className="py-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-500/20 rounded-lg">
                      <Percent className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.insuranceQuote.avgCommissionRate', 'Avg Commission Rate')}</p>
                      <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {calculateCommission.averageCommissionRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Commission by Type */}
            <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
              <CardHeader>
                <CardTitle className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.insuranceQuote.commissionRatesByInsuranceType', 'Commission Rates by Insurance Type')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {INSURANCE_TYPES.map(({ type, label, icon }) => {
                    const typePolicies = policies.filter((p) => p.insuranceType === type && p.status === 'active');
                    const totalPremium = typePolicies.reduce((sum, p) => sum + p.annualPremium, 0);
                    const commission = totalPremium * COMMISSION_RATES[type];
                    return (
                      <div
                        key={type}
                        className={`p-4 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
                      >
                        <div className={`mx-auto w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'}`}>
                          {icon}
                        </div>
                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {label}
                        </p>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {(COMMISSION_RATES[type] * 100).toFixed(0)}% rate
                        </p>
                        <p className={`text-lg font-bold mt-1 ${theme === 'dark' ? t('tools.insuranceQuote.text0d94883', 'text-[#0D9488]') : t('tools.insuranceQuote.text0d94884', 'text-[#0D9488]')}`}>
                          {formatCurrency(commission)}
                        </p>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                          {typePolicies.length} policies
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Cross-Sell Opportunities */}
            <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <TrendingUp className="w-5 h-5" />
                  {t('tools.insuranceQuote.crossSellOpportunities', 'Cross-Sell Opportunities')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {crossSellOpportunities.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {crossSellOpportunities.slice(0, 10).map((opp, index) => {
                      const customer = customers.find((c) => c.id === opp.customerId);
                      return (
                        <div
                          key={`${opp.customerId}-${opp.insuranceType}-${index}`}
                          className={`p-3 rounded-lg flex items-center justify-between ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`px-2 py-1 rounded text-xs font-medium ${
                              opp.priority === 'high'
                                ? 'bg-red-500/20 text-red-500'
                                : opp.priority === 'medium'
                                ? 'bg-yellow-500/20 text-yellow-500'
                                : 'bg-gray-500/20 text-gray-500'
                            }`}>
                              {opp.priority}
                            </div>
                            <div>
                              <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {customer?.firstName} {customer?.lastName} - {opp.insuranceType.charAt(0).toUpperCase() + opp.insuranceType.slice(1)}
                              </p>
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                {opp.reason}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${theme === 'dark' ? t('tools.insuranceQuote.text0d94885', 'text-[#0D9488]') : t('tools.insuranceQuote.text0d94886', 'text-[#0D9488]')}`}>
                              {formatCurrency(opp.potentialPremium)}/yr
                            </p>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                              {t('tools.insuranceQuote.estPremium', 'Est. premium')}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('tools.insuranceQuote.addCustomersAndPoliciesTo', 'Add customers and policies to see cross-sell opportunities')}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Customer Form Modal */}
        {showCustomerForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.insuranceQuote.addNewCustomer', 'Add New Customer')}
                  </h2>
                  <button
                    onClick={() => setShowCustomerForm(false)}
                    className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <X className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.insuranceQuote.firstName', 'First Name *')}
                    </label>
                    <input
                      type="text"
                      value={newCustomer.firstName}
                      onChange={(e) => setNewCustomer({ ...newCustomer, firstName: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.insuranceQuote.lastName', 'Last Name *')}
                    </label>
                    <input
                      type="text"
                      value={newCustomer.lastName}
                      onChange={(e) => setNewCustomer({ ...newCustomer, lastName: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.insuranceQuote.email4', 'Email *')}
                    </label>
                    <input
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.insuranceQuote.phone2', 'Phone')}
                    </label>
                    <input
                      type="tel"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.insuranceQuote.dateOfBirth2', 'Date of Birth')}
                    </label>
                    <input
                      type="date"
                      value={newCustomer.dateOfBirth}
                      onChange={(e) => setNewCustomer({ ...newCustomer, dateOfBirth: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.insuranceQuote.occupation2', 'Occupation')}
                    </label>
                    <input
                      type="text"
                      value={newCustomer.occupation}
                      onChange={(e) => setNewCustomer({ ...newCustomer, occupation: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.insuranceQuote.address2', 'Address')}
                    </label>
                    <input
                      type="text"
                      value={newCustomer.address}
                      onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.insuranceQuote.city', 'City')}
                    </label>
                    <input
                      type="text"
                      value={newCustomer.city}
                      onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.insuranceQuote.state', 'State')}
                    </label>
                    <input
                      type="text"
                      value={newCustomer.state}
                      onChange={(e) => setNewCustomer({ ...newCustomer, state: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.insuranceQuote.zipCode', 'ZIP Code')}
                    </label>
                    <input
                      type="text"
                      value={newCustomer.zipCode}
                      onChange={(e) => setNewCustomer({ ...newCustomer, zipCode: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.insuranceQuote.annualIncome2', 'Annual Income')}
                    </label>
                    <input
                      type="number"
                      value={newCustomer.annualIncome}
                      onChange={(e) => setNewCustomer({ ...newCustomer, annualIncome: parseInt(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.insuranceQuote.creditScore3', 'Credit Score')}
                    </label>
                    <input
                      type="number"
                      min="300"
                      max="850"
                      value={newCustomer.creditScore}
                      onChange={(e) => setNewCustomer({ ...newCustomer, creditScore: parseInt(e.target.value) || 700 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.insuranceQuote.maritalStatus2', 'Marital Status')}
                    </label>
                    <select
                      value={newCustomer.maritalStatus}
                      onChange={(e) => setNewCustomer({ ...newCustomer, maritalStatus: e.target.value as CustomerProfile['maritalStatus'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    >
                      <option value="single">{t('tools.insuranceQuote.single', 'Single')}</option>
                      <option value="married">{t('tools.insuranceQuote.married', 'Married')}</option>
                      <option value="divorced">{t('tools.insuranceQuote.divorced', 'Divorced')}</option>
                      <option value="widowed">{t('tools.insuranceQuote.widowed', 'Widowed')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.insuranceQuote.dependents2', 'Dependents')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newCustomer.dependents}
                      onChange={(e) => setNewCustomer({ ...newCustomer, dependents: parseInt(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={addCustomer}
                    className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    {t('tools.insuranceQuote.addCustomer', 'Add Customer')}
                  </button>
                  <button
                    onClick={() => setShowCustomerForm(false)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {t('tools.insuranceQuote.cancel', 'Cancel')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Communication Form Modal */}
        {showCommunicationForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-md w-full`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.insuranceQuote.addCommunicationLog', 'Add Communication Log')}
                  </h2>
                  <button
                    onClick={() => setShowCommunicationForm(false)}
                    className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <X className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.insuranceQuote.type2', 'Type')}
                    </label>
                    <select
                      value={newCommunication.type}
                      onChange={(e) => setNewCommunication({ ...newCommunication, type: e.target.value as CommunicationLog['type'] })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    >
                      <option value="note">{t('tools.insuranceQuote.note', 'Note')}</option>
                      <option value="email">{t('tools.insuranceQuote.email3', 'Email')}</option>
                      <option value="phone">{t('tools.insuranceQuote.phoneCall', 'Phone Call')}</option>
                      <option value="meeting">{t('tools.insuranceQuote.meeting', 'Meeting')}</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.insuranceQuote.subject', 'Subject *')}
                    </label>
                    <input
                      type="text"
                      value={newCommunication.subject}
                      onChange={(e) => setNewCommunication({ ...newCommunication, subject: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('tools.insuranceQuote.content', 'Content')}
                    </label>
                    <textarea
                      rows={4}
                      value={newCommunication.content}
                      onChange={(e) => setNewCommunication({ ...newCommunication, content: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={addCommunication}
                    className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    {t('tools.insuranceQuote.addLog', 'Add Log')}
                  </button>
                  <button
                    onClick={() => setShowCommunicationForm(false)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {t('tools.insuranceQuote.cancel2', 'Cancel')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('tools.insuranceQuote.aboutThisTool', 'About This Tool')}
          </h3>
          <div className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            <p>
              This insurance quote comparison tool helps agents quickly generate and compare quotes across multiple carriers.
              Features include customer management, coverage customization, discount tracking, and commission calculations.
            </p>
            <p>
              All data is stored locally in your browser. To protect sensitive customer information, ensure your device is secure
              and consider using additional encryption for production use.
            </p>
          </div>
        </div>

        <ConfirmDialog />
      </div>
    </div>
  );
};

export default InsuranceQuoteTool;
