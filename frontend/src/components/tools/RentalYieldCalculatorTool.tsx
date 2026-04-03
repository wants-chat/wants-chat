'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  Calculator,
  DollarSign,
  Percent,
  TrendingUp,
  Home,
  Plus,
  Trash2,
  BarChart3,
  PiggyBank,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExportDropdown } from '@/components/ui/ExportDropdown';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface RentalYieldCalculatorToolProps {
  uiConfig?: UIConfig;
}

interface PropertyData {
  id: string;
  name: string;
  purchasePrice: string;
  monthlyRent: string;
  propertyTax: string;
  insurance: string;
  maintenance: string;
  hoaFees: string;
  vacancyAllowance: string;
  downPaymentPercent: string;
  interestRate: string;
  loanTermYears: string;
}

interface CalculationResult {
  id: string;
  name: string;
  purchasePrice: number;
  monthlyRent: number;
  annualRent: number;
  totalAnnualExpenses: number;
  netOperatingIncome: number;
  grossYield: number;
  netYield: number;
  capRate: number;
  downPayment: number;
  loanAmount: number;
  monthlyMortgage: number;
  annualMortgage: number;
  monthlyCashFlow: number;
  annualCashFlow: number;
  cashOnCashReturn: number;
  totalMonthlyExpenses: number;
  expenseBreakdown: {
    propertyTax: number;
    insurance: number;
    maintenance: number;
    hoaFees: number;
    vacancyAllowance: number;
    mortgage: number;
  };
  fiveYearProjection: YearlyProjection[];
}

interface YearlyProjection {
  year: number;
  propertyValue: number;
  annualRent: number;
  annualCashFlow: number;
  equity: number;
  totalReturn: number;
}

const defaultProperty: PropertyData = {
  id: crypto.randomUUID(),
  name: 'Property 1',
  purchasePrice: '',
  monthlyRent: '',
  propertyTax: '',
  insurance: '',
  maintenance: '',
  hoaFees: '',
  vacancyAllowance: '5',
  downPaymentPercent: '20',
  interestRate: '7',
  loanTermYears: '30',
};

const COLUMNS = [
  { key: 'name', label: 'Property Name' },
  { key: 'purchasePrice', label: 'Purchase Price' },
  { key: 'monthlyRent', label: 'Monthly Rent' },
  { key: 'annualRent', label: 'Annual Rent' },
  { key: 'totalAnnualExpenses', label: 'Total Annual Expenses' },
  { key: 'netOperatingIncome', label: 'NOI' },
  { key: 'grossYield', label: 'Gross Yield (%)' },
  { key: 'netYield', label: 'Net Yield (%)' },
  { key: 'capRate', label: 'Cap Rate (%)' },
  { key: 'downPayment', label: 'Down Payment' },
  { key: 'loanAmount', label: 'Loan Amount' },
  { key: 'monthlyMortgage', label: 'Monthly Mortgage' },
  { key: 'annualMortgage', label: 'Annual Mortgage' },
  { key: 'monthlyCashFlow', label: 'Monthly Cash Flow' },
  { key: 'annualCashFlow', label: 'Annual Cash Flow' },
  { key: 'cashOnCashReturn', label: 'Cash-on-Cash Return (%)' },
];

export const RentalYieldCalculatorTool: React.FC<RentalYieldCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [properties, setProperties] = useState<PropertyData[]>([{ ...defaultProperty }]);
  const [activeTab, setActiveTab] = useState<'input' | 'results' | 'comparison'>('input');
  const [appreciationRate, setAppreciationRate] = useState('3');
  const [rentIncreaseRate, setRentIncreaseRate] = useState('2');
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount || params.total) {
        setProperties(prev => prev.map((p, i) =>
          i === 0 ? { ...p, purchasePrice: (params.amount || params.total)?.toString() || p.purchasePrice } : p
        ));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const calculateMortgage = (principal: number, annualRate: number, years: number): number => {
    if (principal <= 0 || years <= 0) return 0;
    if (annualRate <= 0) return principal / (years * 12);

    const monthlyRate = annualRate / 100 / 12;
    const numPayments = years * 12;
    return (principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);
  };

  const results = useMemo<CalculationResult[]>(() => {
    return properties.map((property) => {
      const purchasePrice = parseFloat(property.purchasePrice) || 0;
      const monthlyRent = parseFloat(property.monthlyRent) || 0;
      const propertyTax = parseFloat(property.propertyTax) || 0;
      const insurance = parseFloat(property.insurance) || 0;
      const maintenance = parseFloat(property.maintenance) || 0;
      const hoaFees = parseFloat(property.hoaFees) || 0;
      const vacancyAllowancePercent = parseFloat(property.vacancyAllowance) || 0;
      const downPaymentPercent = parseFloat(property.downPaymentPercent) || 0;
      const interestRate = parseFloat(property.interestRate) || 0;
      const loanTermYears = parseFloat(property.loanTermYears) || 30;

      const annualRent = monthlyRent * 12;
      const vacancyAllowance = (annualRent * vacancyAllowancePercent) / 100;
      const totalAnnualExpenses = propertyTax + insurance + maintenance + hoaFees + vacancyAllowance;
      const netOperatingIncome = annualRent - totalAnnualExpenses;

      const grossYield = purchasePrice > 0 ? (annualRent / purchasePrice) * 100 : 0;
      const netYield = purchasePrice > 0 ? (netOperatingIncome / purchasePrice) * 100 : 0;
      const capRate = purchasePrice > 0 ? (netOperatingIncome / purchasePrice) * 100 : 0;

      const downPayment = (purchasePrice * downPaymentPercent) / 100;
      const loanAmount = purchasePrice - downPayment;
      const monthlyMortgage = calculateMortgage(loanAmount, interestRate, loanTermYears);
      const annualMortgage = monthlyMortgage * 12;

      const annualCashFlow = netOperatingIncome - annualMortgage;
      const monthlyCashFlow = annualCashFlow / 12;
      const cashOnCashReturn = downPayment > 0 ? (annualCashFlow / downPayment) * 100 : 0;

      const totalMonthlyExpenses = (totalAnnualExpenses / 12) + monthlyMortgage;

      // 5-year projection
      const appreciationRateNum = parseFloat(appreciationRate) / 100 || 0;
      const rentIncreaseRateNum = parseFloat(rentIncreaseRate) / 100 || 0;

      const fiveYearProjection: YearlyProjection[] = [];
      let currentPropertyValue = purchasePrice;
      let currentAnnualRent = annualRent;
      let remainingLoanBalance = loanAmount;

      for (let year = 1; year <= 5; year++) {
        currentPropertyValue = currentPropertyValue * (1 + appreciationRateNum);
        currentAnnualRent = currentAnnualRent * (1 + rentIncreaseRateNum);

        // Simple approximation of remaining balance (actual would need amortization)
        const yearlyPrincipal = loanAmount / (loanTermYears * 12) * 12;
        remainingLoanBalance = Math.max(0, remainingLoanBalance - yearlyPrincipal);

        const equity = currentPropertyValue - remainingLoanBalance;
        const projectedNOI = currentAnnualRent - (totalAnnualExpenses * Math.pow(1.02, year));
        const projectedCashFlow = projectedNOI - annualMortgage;
        const totalReturn = equity - downPayment + (projectedCashFlow * year);

        fiveYearProjection.push({
          year,
          propertyValue: currentPropertyValue,
          annualRent: currentAnnualRent,
          annualCashFlow: projectedCashFlow,
          equity,
          totalReturn,
        });
      }

      return {
        id: property.id,
        name: property.name,
        purchasePrice,
        monthlyRent,
        annualRent,
        totalAnnualExpenses,
        netOperatingIncome,
        grossYield,
        netYield,
        capRate,
        downPayment,
        loanAmount,
        monthlyMortgage,
        annualMortgage,
        monthlyCashFlow,
        annualCashFlow,
        cashOnCashReturn,
        totalMonthlyExpenses,
        expenseBreakdown: {
          propertyTax,
          insurance,
          maintenance,
          hoaFees,
          vacancyAllowance,
          mortgage: annualMortgage,
        },
        fiveYearProjection,
      };
    });
  }, [properties, appreciationRate, rentIncreaseRate]);

  const updateProperty = (id: string, field: keyof PropertyData, value: string) => {
    setProperties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const addProperty = () => {
    const newId = crypto.randomUUID();
    setProperties((prev) => [
      ...prev,
      {
        ...defaultProperty,
        id: newId,
        name: `Property ${prev.length + 1}`,
      },
    ]);
  };

  const removeProperty = (id: string) => {
    if (properties.length > 1) {
      setProperties((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleExportCSV = () => {
    if (results.length === 0) return;

    const headers = COLUMNS.map(col => col.label).join(',');
    const rows = results.map(result =>
      COLUMNS.map(col => {
        const value = result[col.key as keyof CalculationResult];
        if (typeof value === 'number') {
          return `"${value.toFixed(2)}"`;
        }
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',')
    );

    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `rental-yield-analysis-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    if (results.length === 0) return;

    const data = {
      exportDate: new Date().toISOString(),
      appreciationRate,
      rentIncreaseRate,
      totalProperties: results.length,
      properties: results,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `rental-yield-analysis-${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyToClipboard = async () => {
    if (results.length === 0) return false;

    const text = results
      .map((result, i) =>
        `${i + 1}. ${result.name}\n` +
        `   Purchase Price: ${formatCurrency(result.purchasePrice)}\n` +
        `   Monthly Rent: ${formatCurrency(result.monthlyRent)}\n` +
        `   Monthly Cash Flow: ${formatCurrency(result.monthlyCashFlow)}\n` +
        `   Cap Rate: ${formatPercent(result.capRate)}\n` +
        `   Cash-on-Cash Return: ${formatPercent(result.cashOnCashReturn)}`
      )
      .join('\n\n');

    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };

  const InputField = ({
    label,
    value,
    onChange,
    placeholder,
    icon: Icon,
    prefix,
    suffix,
    step = '1',
    min = '0',
  }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    icon?: React.ElementType;
    prefix?: string;
    suffix?: string;
    step?: string;
    min?: string;
  }) => (
    <div>
      <label
        className={`block text-sm font-medium mb-2 ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}
      >
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}
          />
        )}
        {prefix && (
          <span
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          step={step}
          min={min}
          className={`w-full ${Icon || prefix ? 'pl-11' : 'pl-4'} ${
            suffix ? 'pr-12' : 'pr-4'
          } py-3 rounded-lg border ${
            theme === 'dark'
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
          } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
        />
        {suffix && (
          <span
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            {suffix}
          </span>
        )}
      </div>
    </div>
  );

  const StatCard = ({
    label,
    value,
    subValue,
    icon: Icon,
    color,
    positive,
  }: {
    label: string;
    value: string;
    subValue?: string;
    icon: React.ElementType;
    color: string;
    positive?: boolean;
  }) => (
    <div
      className={`p-4 rounded-lg ${
        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          {label}
        </span>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      {subValue && (
        <div className="flex items-center mt-1">
          {positive !== undefined &&
            (positive ? (
              <ArrowUpRight className="w-4 h-4 text-green-500" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-red-500" />
            ))}
          <span
            className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {subValue}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div
      className={`min-h-screen ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      } py-8 px-4`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.rentalYieldCalculator.dataLoadedFromAiResponse', 'Data loaded from AI response')}</span>
          </div>
        )}

        <div
          className={`${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          } rounded-lg shadow-lg p-6`}
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#0D9488] rounded-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1
                className={`text-2xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                {t('tools.rentalYieldCalculator.rentalYieldCalculator', 'Rental Yield Calculator')}
              </h1>
              <p
                className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {t('tools.rentalYieldCalculator.analyzeRealEstateInvestmentReturns', 'Analyze real estate investment returns')}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-700 pb-4">
            {(['input', 'results', 'comparison'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                  activeTab === tab
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {tab === 'input' ? 'Property Details' : tab}
              </button>
            ))}
          </div>

          {/* Input Tab */}
          {activeTab === 'input' && (
            <div className="space-y-6">
              {/* Global Settings */}
              <Card
                className={
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600'
                    : 'bg-gray-50 border-gray-200'
                }
              >
                <CardHeader className="pb-3">
                  <CardTitle
                    className={`text-lg ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {t('tools.rentalYieldCalculator.projectionSettings', 'Projection Settings')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      label="Annual Appreciation Rate"
                      value={appreciationRate}
                      onChange={setAppreciationRate}
                      placeholder="3"
                      suffix="%"
                      step="0.1"
                    />
                    <InputField
                      label="Annual Rent Increase Rate"
                      value={rentIncreaseRate}
                      onChange={setRentIncreaseRate}
                      placeholder="2"
                      suffix="%"
                      step="0.1"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Properties */}
              {properties.map((property, index) => (
                <Card
                  key={property.id}
                  className={
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600'
                      : 'bg-gray-50 border-gray-200'
                  }
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={property.name}
                        onChange={(e) =>
                          updateProperty(property.id, 'name', e.target.value)
                        }
                        className={`text-lg font-semibold bg-transparent border-none outline-none ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                      />
                      {properties.length > 1 && (
                        <button
                          onClick={() => removeProperty(property.id)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Purchase & Income */}
                    <div>
                      <h3
                        className={`text-sm font-semibold mb-3 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        {t('tools.rentalYieldCalculator.purchaseIncome', 'Purchase & Income')}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                          label="Purchase Price"
                          value={property.purchasePrice}
                          onChange={(v) =>
                            updateProperty(property.id, 'purchasePrice', v)
                          }
                          placeholder={t('tools.rentalYieldCalculator.enterPurchasePrice', 'Enter purchase price')}
                          icon={DollarSign}
                          step="1000"
                        />
                        <InputField
                          label="Monthly Rental Income"
                          value={property.monthlyRent}
                          onChange={(v) =>
                            updateProperty(property.id, 'monthlyRent', v)
                          }
                          placeholder={t('tools.rentalYieldCalculator.enterMonthlyRent', 'Enter monthly rent')}
                          icon={DollarSign}
                          step="100"
                        />
                      </div>
                    </div>

                    {/* Annual Expenses */}
                    <div>
                      <h3
                        className={`text-sm font-semibold mb-3 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        {t('tools.rentalYieldCalculator.annualExpenses', 'Annual Expenses')}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <InputField
                          label="Property Tax"
                          value={property.propertyTax}
                          onChange={(v) =>
                            updateProperty(property.id, 'propertyTax', v)
                          }
                          placeholder={t('tools.rentalYieldCalculator.annualTax', 'Annual tax')}
                          icon={DollarSign}
                        />
                        <InputField
                          label="Insurance"
                          value={property.insurance}
                          onChange={(v) =>
                            updateProperty(property.id, 'insurance', v)
                          }
                          placeholder={t('tools.rentalYieldCalculator.annualInsurance', 'Annual insurance')}
                          icon={DollarSign}
                        />
                        <InputField
                          label="Maintenance"
                          value={property.maintenance}
                          onChange={(v) =>
                            updateProperty(property.id, 'maintenance', v)
                          }
                          placeholder={t('tools.rentalYieldCalculator.annualMaintenance', 'Annual maintenance')}
                          icon={DollarSign}
                        />
                        <InputField
                          label="HOA Fees"
                          value={property.hoaFees}
                          onChange={(v) =>
                            updateProperty(property.id, 'hoaFees', v)
                          }
                          placeholder={t('tools.rentalYieldCalculator.annualHoa', 'Annual HOA')}
                          icon={DollarSign}
                        />
                        <InputField
                          label="Vacancy Allowance"
                          value={property.vacancyAllowance}
                          onChange={(v) =>
                            updateProperty(property.id, 'vacancyAllowance', v)
                          }
                          placeholder="5"
                          suffix="%"
                          step="0.5"
                        />
                      </div>
                    </div>

                    {/* Mortgage Details */}
                    <div>
                      <h3
                        className={`text-sm font-semibold mb-3 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        {t('tools.rentalYieldCalculator.mortgageDetails', 'Mortgage Details')}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <InputField
                          label="Down Payment"
                          value={property.downPaymentPercent}
                          onChange={(v) =>
                            updateProperty(property.id, 'downPaymentPercent', v)
                          }
                          placeholder="20"
                          suffix="%"
                          step="1"
                        />
                        <InputField
                          label="Interest Rate"
                          value={property.interestRate}
                          onChange={(v) =>
                            updateProperty(property.id, 'interestRate', v)
                          }
                          placeholder="7"
                          suffix="%"
                          step="0.125"
                        />
                        <InputField
                          label="Loan Term"
                          value={property.loanTermYears}
                          onChange={(v) =>
                            updateProperty(property.id, 'loanTermYears', v)
                          }
                          placeholder="30"
                          suffix="years"
                          step="1"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Add Property Button */}
              <button
                onClick={addProperty}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border-2 border-dashed border-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-dashed border-gray-300'
                }`}
              >
                <Plus className="w-5 h-5" />
                {t('tools.rentalYieldCalculator.addPropertyForComparison', 'Add Property for Comparison')}
              </button>

              {/* Quick Calculate Button */}
              <button
                onClick={() => setActiveTab('results')}
                className="w-full bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Calculator className="w-5 h-5" />
                {t('tools.rentalYieldCalculator.viewResults', 'View Results')}
              </button>
            </div>
          )}

          {/* Results Tab */}
          {activeTab === 'results' && results.length > 0 && (
            <div className="space-y-6">
              {/* Export Controls */}
              <div className="flex justify-end">
                <ExportDropdown
                  onExportCSV={handleExportCSV}
                  onExportJSON={handleExportJSON}
                  onCopyToClipboard={handleCopyToClipboard}
                  showImport={false}
                  theme={theme === 'dark' ? 'dark' : 'light'}
                  disabled={results.length === 0}
                />
              </div>

              {results.map((result) => (
                <div key={result.id} className="space-y-6">
                  <h2
                    className={`text-xl font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {result.name}
                  </h2>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard
                      label="Gross Yield"
                      value={formatPercent(result.grossYield)}
                      subValue="Annual rent / Price"
                      icon={Percent}
                      color="text-blue-500"
                    />
                    <StatCard
                      label="Net Yield"
                      value={formatPercent(result.netYield)}
                      subValue="NOI / Price"
                      icon={TrendingUp}
                      color="text-green-500"
                    />
                    <StatCard
                      label="Cap Rate"
                      value={formatPercent(result.capRate)}
                      subValue="Return on property"
                      icon={BarChart3}
                      color="text-purple-500"
                    />
                    <StatCard
                      label="Cash-on-Cash"
                      value={formatPercent(result.cashOnCashReturn)}
                      subValue="Return on investment"
                      icon={PiggyBank}
                      color={
                        result.cashOnCashReturn >= 0
                          ? 'text-emerald-500'
                          : 'text-red-500'
                      }
                      positive={result.cashOnCashReturn >= 0}
                    />
                  </div>

                  {/* Cash Flow Summary */}
                  <div
                    className={`p-6 rounded-lg border-l-4 ${
                      result.monthlyCashFlow >= 0
                        ? 'border-green-500'
                        : 'border-red-500'
                    } ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div
                          className={`text-sm font-medium mb-2 ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          {t('tools.rentalYieldCalculator.monthlyCashFlow', 'Monthly Cash Flow')}
                        </div>
                        <div
                          className={`text-4xl font-bold ${
                            result.monthlyCashFlow >= 0
                              ? 'text-green-500'
                              : 'text-red-500'
                          }`}
                        >
                          {formatCurrency(result.monthlyCashFlow)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div
                          className={`text-sm font-medium mb-2 ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          {t('tools.rentalYieldCalculator.annualCashFlow', 'Annual Cash Flow')}
                        </div>
                        <div
                          className={`text-3xl font-bold ${
                            result.annualCashFlow >= 0
                              ? 'text-green-500'
                              : 'text-red-500'
                          }`}
                        >
                          {formatCurrency(result.annualCashFlow)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div
                          className={`text-sm font-medium mb-2 ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          {t('tools.rentalYieldCalculator.netOperatingIncome', 'Net Operating Income')}
                        </div>
                        <div
                          className={`text-3xl font-bold ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {formatCurrency(result.netOperatingIncome)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Monthly Breakdown */}
                  <div
                    className={`p-6 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                    }`}
                  >
                    <h3
                      className={`font-semibold mb-4 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {t('tools.rentalYieldCalculator.monthlyCashFlowBreakdown', 'Monthly Cash Flow Breakdown')}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span
                          className={
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }
                        >
                          {t('tools.rentalYieldCalculator.monthlyRentalIncome', 'Monthly Rental Income')}
                        </span>
                        <span className="font-semibold text-green-500">
                          +{formatCurrency(result.monthlyRent)}
                        </span>
                      </div>
                      <div
                        className={`border-t ${
                          theme === 'dark'
                            ? 'border-gray-600'
                            : 'border-gray-300'
                        }`}
                      />
                      <div className="flex justify-between items-center">
                        <span
                          className={
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }
                        >
                          {t('tools.rentalYieldCalculator.propertyTax', 'Property Tax')}
                        </span>
                        <span className="font-semibold text-red-500">
                          -{formatCurrency(result.expenseBreakdown.propertyTax / 12)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span
                          className={
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }
                        >
                          {t('tools.rentalYieldCalculator.insurance', 'Insurance')}
                        </span>
                        <span className="font-semibold text-red-500">
                          -{formatCurrency(result.expenseBreakdown.insurance / 12)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span
                          className={
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }
                        >
                          {t('tools.rentalYieldCalculator.maintenance', 'Maintenance')}
                        </span>
                        <span className="font-semibold text-red-500">
                          -{formatCurrency(result.expenseBreakdown.maintenance / 12)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span
                          className={
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }
                        >
                          {t('tools.rentalYieldCalculator.hoaFees', 'HOA Fees')}
                        </span>
                        <span className="font-semibold text-red-500">
                          -{formatCurrency(result.expenseBreakdown.hoaFees / 12)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span
                          className={
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }
                        >
                          {t('tools.rentalYieldCalculator.vacancyAllowance', 'Vacancy Allowance')}
                        </span>
                        <span className="font-semibold text-red-500">
                          -{formatCurrency(result.expenseBreakdown.vacancyAllowance / 12)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span
                          className={
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }
                        >
                          {t('tools.rentalYieldCalculator.mortgagePayment', 'Mortgage Payment')}
                        </span>
                        <span className="font-semibold text-red-500">
                          -{formatCurrency(result.monthlyMortgage)}
                        </span>
                      </div>
                      <div
                        className={`border-t-2 ${
                          theme === 'dark'
                            ? 'border-gray-500'
                            : 'border-gray-400'
                        }`}
                      />
                      <div className="flex justify-between items-center">
                        <span
                          className={`font-semibold ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {t('tools.rentalYieldCalculator.netMonthlyCashFlow', 'Net Monthly Cash Flow')}
                        </span>
                        <span
                          className={`font-bold text-xl ${
                            result.monthlyCashFlow >= 0
                              ? 'text-green-500'
                              : 'text-red-500'
                          }`}
                        >
                          {formatCurrency(result.monthlyCashFlow)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 5-Year Projection */}
                  <div
                    className={`p-6 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                    }`}
                  >
                    <h3
                      className={`font-semibold mb-4 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {t('tools.rentalYieldCalculator.5YearProjection', '5-Year Projection')}
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr
                            className={`border-b-2 ${
                              theme === 'dark'
                                ? 'border-gray-600'
                                : 'border-gray-300'
                            }`}
                          >
                            <th
                              className={`py-2 px-3 text-left ${
                                theme === 'dark'
                                  ? 'text-gray-300'
                                  : 'text-gray-700'
                              }`}
                            >
                              {t('tools.rentalYieldCalculator.year', 'Year')}
                            </th>
                            <th
                              className={`py-2 px-3 text-right ${
                                theme === 'dark'
                                  ? 'text-gray-300'
                                  : 'text-gray-700'
                              }`}
                            >
                              {t('tools.rentalYieldCalculator.propertyValue', 'Property Value')}
                            </th>
                            <th
                              className={`py-2 px-3 text-right ${
                                theme === 'dark'
                                  ? 'text-gray-300'
                                  : 'text-gray-700'
                              }`}
                            >
                              {t('tools.rentalYieldCalculator.annualRent', 'Annual Rent')}
                            </th>
                            <th
                              className={`py-2 px-3 text-right ${
                                theme === 'dark'
                                  ? 'text-gray-300'
                                  : 'text-gray-700'
                              }`}
                            >
                              {t('tools.rentalYieldCalculator.cashFlow', 'Cash Flow')}
                            </th>
                            <th
                              className={`py-2 px-3 text-right ${
                                theme === 'dark'
                                  ? 'text-gray-300'
                                  : 'text-gray-700'
                              }`}
                            >
                              {t('tools.rentalYieldCalculator.equity', 'Equity')}
                            </th>
                            <th
                              className={`py-2 px-3 text-right ${
                                theme === 'dark'
                                  ? 'text-gray-300'
                                  : 'text-gray-700'
                              }`}
                            >
                              {t('tools.rentalYieldCalculator.totalReturn', 'Total Return')}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.fiveYearProjection.map((year) => (
                            <tr
                              key={year.year}
                              className={`border-b ${
                                theme === 'dark'
                                  ? 'border-gray-600'
                                  : 'border-gray-200'
                              }`}
                            >
                              <td
                                className={`py-3 px-3 font-medium ${
                                  theme === 'dark'
                                    ? 'text-white'
                                    : 'text-gray-900'
                                }`}
                              >
                                Year {year.year}
                              </td>
                              <td
                                className={`py-3 px-3 text-right ${
                                  theme === 'dark'
                                    ? 'text-gray-300'
                                    : 'text-gray-700'
                                }`}
                              >
                                {formatCurrency(year.propertyValue)}
                              </td>
                              <td
                                className={`py-3 px-3 text-right ${
                                  theme === 'dark'
                                    ? 'text-gray-300'
                                    : 'text-gray-700'
                                }`}
                              >
                                {formatCurrency(year.annualRent)}
                              </td>
                              <td
                                className={`py-3 px-3 text-right ${
                                  year.annualCashFlow >= 0
                                    ? 'text-green-500'
                                    : 'text-red-500'
                                }`}
                              >
                                {formatCurrency(year.annualCashFlow)}
                              </td>
                              <td className="py-3 px-3 text-right text-blue-500">
                                {formatCurrency(year.equity)}
                              </td>
                              <td
                                className={`py-3 px-3 text-right font-semibold ${
                                  year.totalReturn >= 0
                                    ? 'text-green-500'
                                    : 'text-red-500'
                                }`}
                              >
                                {formatCurrency(year.totalReturn)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Investment Summary */}
                  <div
                    className={`p-6 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                    }`}
                  >
                    <h3
                      className={`font-semibold mb-4 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {t('tools.rentalYieldCalculator.investmentSummary', 'Investment Summary')}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div
                          className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          {t('tools.rentalYieldCalculator.purchasePrice', 'Purchase Price')}
                        </div>
                        <div
                          className={`text-lg font-semibold ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {formatCurrency(result.purchasePrice)}
                        </div>
                      </div>
                      <div>
                        <div
                          className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          {t('tools.rentalYieldCalculator.downPayment', 'Down Payment')}
                        </div>
                        <div
                          className={`text-lg font-semibold ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {formatCurrency(result.downPayment)}
                        </div>
                      </div>
                      <div>
                        <div
                          className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          {t('tools.rentalYieldCalculator.loanAmount', 'Loan Amount')}
                        </div>
                        <div
                          className={`text-lg font-semibold ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {formatCurrency(result.loanAmount)}
                        </div>
                      </div>
                      <div>
                        <div
                          className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          {t('tools.rentalYieldCalculator.monthlyMortgage', 'Monthly Mortgage')}
                        </div>
                        <div
                          className={`text-lg font-semibold ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {formatCurrency(result.monthlyMortgage)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {results.length > 1 && (
                    <div
                      className={`border-b-2 ${
                        theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                      } my-8`}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Comparison Tab */}
          {activeTab === 'comparison' && results.length >= 1 && (
            <div className="space-y-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      className={`border-b-2 ${
                        theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                      }`}
                    >
                      <th
                        className={`py-3 px-4 text-left ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        {t('tools.rentalYieldCalculator.metric', 'Metric')}
                      </th>
                      {results.map((result) => (
                        <th
                          key={result.id}
                          className={`py-3 px-4 text-right ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          {result.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        label: 'Purchase Price',
                        key: 'purchasePrice',
                        format: formatCurrency,
                      },
                      {
                        label: 'Monthly Rent',
                        key: 'monthlyRent',
                        format: formatCurrency,
                      },
                      {
                        label: 'Down Payment',
                        key: 'downPayment',
                        format: formatCurrency,
                      },
                      {
                        label: 'Monthly Mortgage',
                        key: 'monthlyMortgage',
                        format: formatCurrency,
                      },
                      {
                        label: 'Monthly Cash Flow',
                        key: 'monthlyCashFlow',
                        format: formatCurrency,
                        highlight: true,
                      },
                      {
                        label: 'Annual Cash Flow',
                        key: 'annualCashFlow',
                        format: formatCurrency,
                      },
                      {
                        label: 'Gross Yield',
                        key: 'grossYield',
                        format: formatPercent,
                      },
                      {
                        label: 'Net Yield',
                        key: 'netYield',
                        format: formatPercent,
                      },
                      {
                        label: 'Cap Rate',
                        key: 'capRate',
                        format: formatPercent,
                        highlight: true,
                      },
                      {
                        label: 'Cash-on-Cash Return',
                        key: 'cashOnCashReturn',
                        format: formatPercent,
                        highlight: true,
                      },
                      { label: 'NOI', key: 'netOperatingIncome', format: formatCurrency },
                      {
                        label: 'Total Annual Expenses',
                        key: 'totalAnnualExpenses',
                        format: formatCurrency,
                      },
                    ].map((row) => (
                      <tr
                        key={row.label}
                        className={`border-b ${
                          theme === 'dark'
                            ? 'border-gray-600'
                            : 'border-gray-200'
                        } ${
                          row.highlight
                            ? theme === 'dark'
                              ? 'bg-gray-700'
                              : 'bg-gray-100'
                            : ''
                        }`}
                      >
                        <td
                          className={`py-3 px-4 font-medium ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}
                        >
                          {row.label}
                        </td>
                        {results.map((result) => {
                          const value = result[row.key as keyof CalculationResult] as number;
                          const isNegative = value < 0;
                          const isCashFlow =
                            row.key === 'monthlyCashFlow' ||
                            row.key === 'annualCashFlow' ||
                            row.key === 'cashOnCashReturn';
                          return (
                            <td
                              key={result.id}
                              className={`py-3 px-4 text-right font-semibold ${
                                isCashFlow
                                  ? isNegative
                                    ? 'text-red-500'
                                    : 'text-green-500'
                                  : theme === 'dark'
                                  ? 'text-white'
                                  : 'text-gray-900'
                              }`}
                            >
                              {row.format(value)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Best Property Highlight */}
              {results.length > 1 && (
                <div
                  className={`p-6 rounded-lg border-l-4 border-[#0D9488] ${
                    theme === 'dark' ? 'bg-gray-700' : t('tools.rentalYieldCalculator.bg0d948810', 'bg-[#0D9488]/10')
                  }`}
                >
                  <h3
                    className={`font-semibold mb-4 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {t('tools.rentalYieldCalculator.investmentAnalysis', 'Investment Analysis')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div
                        className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        {t('tools.rentalYieldCalculator.highestCashOnCashReturn', 'Highest Cash-on-Cash Return')}
                      </div>
                      <div className="text-lg font-semibold text-[#0D9488]">
                        {
                          results.reduce((best, curr) =>
                            curr.cashOnCashReturn > best.cashOnCashReturn
                              ? curr
                              : best
                          ).name
                        }{' '}
                        (
                        {formatPercent(
                          Math.max(...results.map((r) => r.cashOnCashReturn))
                        )}
                        )
                      </div>
                    </div>
                    <div>
                      <div
                        className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        {t('tools.rentalYieldCalculator.highestCapRate', 'Highest Cap Rate')}
                      </div>
                      <div className="text-lg font-semibold text-[#0D9488]">
                        {
                          results.reduce((best, curr) =>
                            curr.capRate > best.capRate ? curr : best
                          ).name
                        }{' '}
                        ({formatPercent(Math.max(...results.map((r) => r.capRate)))})
                      </div>
                    </div>
                    <div>
                      <div
                        className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        {t('tools.rentalYieldCalculator.bestMonthlyCashFlow', 'Best Monthly Cash Flow')}
                      </div>
                      <div className="text-lg font-semibold text-[#0D9488]">
                        {
                          results.reduce((best, curr) =>
                            curr.monthlyCashFlow > best.monthlyCashFlow
                              ? curr
                              : best
                          ).name
                        }{' '}
                        (
                        {formatCurrency(
                          Math.max(...results.map((r) => r.monthlyCashFlow))
                        )}
                        )
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Info Section */}
          <div
            className={`mt-6 p-4 rounded-lg ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
            }`}
          >
            <h3
              className={`font-semibold mb-3 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              {t('tools.rentalYieldCalculator.keyMetricsExplained', 'Key Metrics Explained')}
            </h3>
            <div
              className={`space-y-2 text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              <div className="flex gap-2">
                <span className="font-semibold min-w-[140px]">{t('tools.rentalYieldCalculator.grossYield', 'Gross Yield:')}</span>
                <span>
                  Annual rental income divided by purchase price. Shows raw return
                  before expenses.
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold min-w-[140px]">{t('tools.rentalYieldCalculator.netYield', 'Net Yield:')}</span>
                <span>
                  Net Operating Income (NOI) divided by purchase price. Shows return
                  after operating expenses.
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold min-w-[140px]">{t('tools.rentalYieldCalculator.capRate', 'Cap Rate:')}</span>
                <span>
                  Same as net yield - measures property's earning potential
                  independent of financing.
                </span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold min-w-[140px]">{t('tools.rentalYieldCalculator.cashOnCash', 'Cash-on-Cash:')}</span>
                <span>
                  Annual cash flow divided by down payment. Shows return on your
                  actual invested capital.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalYieldCalculatorTool;
