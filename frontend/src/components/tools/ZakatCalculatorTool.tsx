import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Coins, Calculator, DollarSign, TrendingUp, Wallet, Building, Car, Gem, Info } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

interface ZakatAssets {
  cash: number;
  bankAccounts: number;
  goldValue: number;
  silverValue: number;
  stocks: number;
  businessInventory: number;
  receivables: number;
  otherInvestments: number;
  rentalIncome: number;
}

interface ZakatLiabilities {
  debts: number;
  bills: number;
  loans: number;
  otherLiabilities: number;
}

interface ZakatResult {
  totalAssets: number;
  totalLiabilities: number;
  netZakatableWealth: number;
  nisabThreshold: number;
  isZakatDue: boolean;
  zakatAmount: number;
  zakatPerMonth: number;
}

interface ZakatCalculatorToolProps {
  uiConfig?: UIConfig;
}

export default function ZakatCalculatorTool({ uiConfig }: ZakatCalculatorToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [currency, setCurrency] = useState<string>('USD');
  const [nisabMethod, setNisabMethod] = useState<'gold' | 'silver'>('gold');
  const [goldPrice, setGoldPrice] = useState<number>(2000); // per troy ounce
  const [silverPrice, setSilverPrice] = useState<number>(25); // per troy ounce

  const [assets, setAssets] = useState<ZakatAssets>({
    cash: 0,
    bankAccounts: 0,
    goldValue: 0,
    silverValue: 0,
    stocks: 0,
    businessInventory: 0,
    receivables: 0,
    otherInvestments: 0,
    rentalIncome: 0,
  });

  const [liabilities, setLiabilities] = useState<ZakatLiabilities>({
    debts: 0,
    bills: 0,
    loans: 0,
    otherLiabilities: 0,
  });

  const [result, setResult] = useState<ZakatResult | null>(null);
  const [activeTab, setActiveTab] = useState<'assets' | 'liabilities'>('assets');

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as { amount?: number; currency?: string };
      if (params.amount) {
        setAssets(prev => ({ ...prev, cash: params.amount! }));
      }
      if (params.currency) {
        setCurrency(params.currency);
      }
    }
  }, [uiConfig?.params]);

  const NISAB_GOLD_GRAMS = 87.48; // 87.48 grams of gold
  const NISAB_SILVER_GRAMS = 612.36; // 612.36 grams of silver
  const GRAMS_PER_TROY_OUNCE = 31.1035;
  const ZAKAT_RATE = 0.025; // 2.5%

  const calculateNisab = (): number => {
    if (nisabMethod === 'gold') {
      return (NISAB_GOLD_GRAMS / GRAMS_PER_TROY_OUNCE) * goldPrice;
    }
    return (NISAB_SILVER_GRAMS / GRAMS_PER_TROY_OUNCE) * silverPrice;
  };

  const calculateZakat = () => {
    const totalAssets = Object.values(assets).reduce((sum, val) => sum + (val || 0), 0);
    const totalLiabilities = Object.values(liabilities).reduce((sum, val) => sum + (val || 0), 0);
    const netZakatableWealth = totalAssets - totalLiabilities;
    const nisabThreshold = calculateNisab();
    const isZakatDue = netZakatableWealth >= nisabThreshold;
    const zakatAmount = isZakatDue ? netZakatableWealth * ZAKAT_RATE : 0;
    const zakatPerMonth = zakatAmount / 12;

    setResult({
      totalAssets,
      totalLiabilities,
      netZakatableWealth,
      nisabThreshold,
      isZakatDue,
      zakatAmount,
      zakatPerMonth,
    });
  };

  const updateAsset = (key: keyof ZakatAssets, value: string) => {
    setAssets(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
  };

  const updateLiability = (key: keyof ZakatLiabilities, value: string) => {
    setLiabilities(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
  };

  const reset = () => {
    setAssets({
      cash: 0,
      bankAccounts: 0,
      goldValue: 0,
      silverValue: 0,
      stocks: 0,
      businessInventory: 0,
      receivables: 0,
      otherInvestments: 0,
      rentalIncome: 0,
    });
    setLiabilities({
      debts: 0,
      bills: 0,
      loans: 0,
      otherLiabilities: 0,
    });
    setResult(null);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const assetFields: { key: keyof ZakatAssets; label: string; icon: React.ReactNode; description: string }[] = [
    { key: 'cash', label: 'Cash on Hand', icon: <DollarSign className="w-5 h-5" />, description: 'Physical cash you possess' },
    { key: 'bankAccounts', label: 'Bank Accounts', icon: <Building className="w-5 h-5" />, description: 'Checking, savings, and other bank balances' },
    { key: 'goldValue', label: 'Gold Value', icon: <Gem className="w-5 h-5" />, description: 'Market value of gold jewelry and coins' },
    { key: 'silverValue', label: 'Silver Value', icon: <Gem className="w-5 h-5" />, description: 'Market value of silver items' },
    { key: 'stocks', label: 'Stocks & Investments', icon: <TrendingUp className="w-5 h-5" />, description: 'Current market value of shares' },
    { key: 'businessInventory', label: 'Business Inventory', icon: <Car className="w-5 h-5" />, description: 'Value of goods for sale' },
    { key: 'receivables', label: 'Money Owed to You', icon: <Wallet className="w-5 h-5" />, description: 'Loans given, expected returns' },
    { key: 'otherInvestments', label: 'Other Investments', icon: <Coins className="w-5 h-5" />, description: 'Crypto, bonds, mutual funds' },
    { key: 'rentalIncome', label: 'Rental Income Savings', icon: <Building className="w-5 h-5" />, description: 'Accumulated rental income' },
  ];

  const liabilityFields: { key: keyof ZakatLiabilities; label: string; description: string }[] = [
    { key: 'debts', label: 'Personal Debts', description: 'Money you owe to others' },
    { key: 'bills', label: 'Outstanding Bills', description: 'Unpaid bills and utilities' },
    { key: 'loans', label: 'Loan Payments Due', description: 'Immediate loan payments due' },
    { key: 'otherLiabilities', label: 'Other Liabilities', description: 'Any other financial obligations' },
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-3xl mx-auto">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#0D9488] rounded-lg">
              <Coins className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.zakatCalculator.zakatCalculator', 'Zakat Calculator')}
              </h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.zakatCalculator.calculateYourAnnualZakatObligation', 'Calculate your annual Zakat obligation (2.5%)')}
              </p>
            </div>
          </div>

          {/* Settings */}
          <div className={`p-4 rounded-lg mb-6 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.zakatCalculator.currency', 'Currency')}
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-600 border-gray-500 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                >
                  <option value="USD">{t('tools.zakatCalculator.usd', 'USD ($)')}</option>
                  <option value="EUR">{t('tools.zakatCalculator.eurEuro', 'EUR (euro)')}</option>
                  <option value="GBP">{t('tools.zakatCalculator.gbpPound', 'GBP (pound)')}</option>
                  <option value="SAR">{t('tools.zakatCalculator.sarRiyal', 'SAR (riyal)')}</option>
                  <option value="AED">{t('tools.zakatCalculator.aedDirham', 'AED (dirham)')}</option>
                  <option value="MYR">{t('tools.zakatCalculator.myrRinggit', 'MYR (ringgit)')}</option>
                  <option value="PKR">{t('tools.zakatCalculator.pkrRupee', 'PKR (rupee)')}</option>
                  <option value="INR">{t('tools.zakatCalculator.inrRupee', 'INR (rupee)')}</option>
                  <option value="BDT">{t('tools.zakatCalculator.bdtTaka', 'BDT (taka)')}</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.zakatCalculator.goldPricePerOz', 'Gold Price (per oz)')}
                </label>
                <input
                  type="number"
                  value={goldPrice}
                  onChange={(e) => setGoldPrice(parseFloat(e.target.value) || 0)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-600 border-gray-500 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('tools.zakatCalculator.nisabCalculation', 'Nisab Calculation')}
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setNisabMethod('gold')}
                    className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors ${
                      nisabMethod === 'gold'
                        ? 'bg-[#0D9488] text-white'
                        : theme === 'dark'
                        ? 'bg-gray-600 text-gray-300'
                        : 'bg-white text-gray-700'
                    }`}
                  >
                    {t('tools.zakatCalculator.gold', 'Gold')}
                  </button>
                  <button
                    onClick={() => setNisabMethod('silver')}
                    className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors ${
                      nisabMethod === 'silver'
                        ? 'bg-[#0D9488] text-white'
                        : theme === 'dark'
                        ? 'bg-gray-600 text-gray-300'
                        : 'bg-white text-gray-700'
                    }`}
                  >
                    {t('tools.zakatCalculator.silver', 'Silver')}
                  </button>
                </div>
              </div>
            </div>
            <div className={`mt-3 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Current Nisab: {formatCurrency(calculateNisab())} ({nisabMethod === 'gold' ? t('tools.zakatCalculator.8748gOfGold', '87.48g of gold') : t('tools.zakatCalculator.61236gOfSilver', '612.36g of silver')})
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('assets')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'assets'
                  ? 'bg-[#0D9488] text-white'
                  : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('tools.zakatCalculator.assets', 'Assets')}
            </button>
            <button
              onClick={() => setActiveTab('liabilities')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'liabilities'
                  ? 'bg-[#0D9488] text-white'
                  : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('tools.zakatCalculator.liabilities', 'Liabilities')}
            </button>
          </div>

          {/* Assets Tab */}
          {activeTab === 'assets' && (
            <div className="space-y-4 mb-6">
              {assetFields.map((field) => (
                <div key={field.key} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : t('tools.zakatCalculator.bg0d948810', 'bg-[#0D9488]/10')} text-[#0D9488]`}>
                      {field.icon}
                    </div>
                    <div className="flex-1">
                      <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {field.label}
                      </label>
                      <p className={`text-xs mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {field.description}
                      </p>
                      <input
                        type="number"
                        value={assets[field.key] || ''}
                        onChange={(e) => updateAsset(field.key, e.target.value)}
                        placeholder="0.00"
                        className={`w-full px-4 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Liabilities Tab */}
          {activeTab === 'liabilities' && (
            <div className="space-y-4 mb-6">
              {liabilityFields.map((field) => (
                <div key={field.key} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {field.label}
                  </label>
                  <p className={`text-xs mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {field.description}
                  </p>
                  <input
                    type="number"
                    value={liabilities[field.key] || ''}
                    onChange={(e) => updateLiability(field.key, e.target.value)}
                    placeholder="0.00"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={calculateZakat}
              className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Calculator className="w-5 h-5" />
              {t('tools.zakatCalculator.calculateZakat', 'Calculate Zakat')}
            </button>
            <button
              onClick={reset}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('tools.zakatCalculator.reset', 'Reset')}
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="space-y-4">
              {/* Main Result */}
              <div className={`p-6 rounded-lg border-l-4 ${
                result.isZakatDue ? t('tools.zakatCalculator.border0d9488', 'border-[#0D9488]') : 'border-yellow-500'
              } ${theme === 'dark' ? 'bg-gray-700' : t('tools.zakatCalculator.bg0d9488102', 'bg-[#0D9488]/10')}`}>
                <div className="text-center">
                  {result.isZakatDue ? (
                    <>
                      <div className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tools.zakatCalculator.yourZakatAmount', 'Your Zakat Amount')}
                      </div>
                      <div className="text-4xl font-bold text-[#0D9488] mb-2">
                        {formatCurrency(result.zakatAmount)}
                      </div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        or {formatCurrency(result.zakatPerMonth)} per month
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-yellow-500 mb-2">
                        {t('tools.zakatCalculator.zakatNotDue', 'Zakat Not Due')}
                      </div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tools.zakatCalculator.yourWealthIsBelowThe', 'Your wealth is below the Nisab threshold')}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Breakdown */}
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.zakatCalculator.calculationBreakdown', 'Calculation Breakdown')}
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.zakatCalculator.totalAssets', 'Total Assets:')}</span>
                    <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(result.totalAssets)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.zakatCalculator.totalLiabilities', 'Total Liabilities:')}</span>
                    <span className="font-semibold text-red-500">
                      -{formatCurrency(result.totalLiabilities)}
                    </span>
                  </div>
                  <div className="border-t border-gray-500 my-2"></div>
                  <div className="flex justify-between items-center">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.zakatCalculator.netZakatableWealth', 'Net Zakatable Wealth:')}</span>
                    <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(result.netZakatableWealth)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.zakatCalculator.nisabThreshold', 'Nisab Threshold:')}</span>
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                      {formatCurrency(result.nisabThreshold)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.zakatCalculator.zakatRate', 'Zakat Rate:')}</span>
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>2.5%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <div className="flex items-start gap-2">
              <Info className={`w-5 h-5 mt-0.5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
              <div>
                <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.zakatCalculator.aboutZakat', 'About Zakat')}
                </h3>
                <div className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  <p>{t('tools.zakatCalculator.zakatIsAnObligatoryForm', 'Zakat is an obligatory form of charity in Islam, paid annually on wealth above the Nisab threshold.')}</p>
                  <p>{t('tools.zakatCalculator.theRateIs25', 'The rate is 2.5% of net zakatable wealth held for one lunar year.')}</p>
                  <p>{t('tools.zakatCalculator.consultWithAQualifiedIslamic', 'Consult with a qualified Islamic scholar for specific guidance on your situation.')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
