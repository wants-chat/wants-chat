import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Calculator, DollarSign, TrendingUp, PiggyBank, Info } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { useConfirmDialog } from '../ui/ConfirmDialog';

interface TitheResult {
  grossIncome: number;
  netIncome: number;
  titheFromGross: number;
  titheFromNet: number;
  weeklyTithe: number;
  monthlyTithe: number;
  annualTithe: number;
}

interface TitheCalculatorToolProps {
  uiConfig?: UIConfig;
}

type IncomeFrequency = 'weekly' | 'biweekly' | 'monthly' | 'annual';
type TitheBase = 'gross' | 'net';

export default function TitheCalculatorTool({ uiConfig }: TitheCalculatorToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [currency, setCurrency] = useState<string>('USD');
  const [grossIncome, setGrossIncome] = useState<string>('');
  const [netIncome, setNetIncome] = useState<string>('');
  const [frequency, setFrequency] = useState<IncomeFrequency>('monthly');
  const [titheBase, setTitheBase] = useState<TitheBase>('gross');
  const [tithePercentage, setTithePercentage] = useState<number>(10);
  const [result, setResult] = useState<TitheResult | null>(null);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as { amount?: number; currency?: string };
      if (params.amount) {
        setGrossIncome(params.amount.toString());
      }
      if (params.currency) {
        setCurrency(params.currency);
      }
    }
  }, [uiConfig?.params]);

  const frequencyMultipliers: Record<IncomeFrequency, { weekly: number; monthly: number; annual: number }> = {
    weekly: { weekly: 1, monthly: 4.33, annual: 52 },
    biweekly: { weekly: 0.5, monthly: 2.17, annual: 26 },
    monthly: { weekly: 0.23, monthly: 1, annual: 12 },
    annual: { weekly: 0.019, monthly: 0.083, annual: 1 },
  };

  const calculateTithe = () => {
    const gross = parseFloat(grossIncome) || 0;
    const net = parseFloat(netIncome) || gross;

    if (gross <= 0) {
      setValidationMessage('Please enter a valid income amount');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const multiplier = frequencyMultipliers[frequency];
    const annualGross = gross * multiplier.annual;
    const annualNet = net * multiplier.annual;

    const titheRate = tithePercentage / 100;
    const titheFromGross = annualGross * titheRate;
    const titheFromNet = annualNet * titheRate;

    const baseTithe = titheBase === 'gross' ? titheFromGross : titheFromNet;

    setResult({
      grossIncome: annualGross,
      netIncome: annualNet,
      titheFromGross,
      titheFromNet,
      weeklyTithe: baseTithe / 52,
      monthlyTithe: baseTithe / 12,
      annualTithe: baseTithe,
    });
  };

  const reset = () => {
    setGrossIncome('');
    setNetIncome('');
    setFrequency('monthly');
    setTitheBase('gross');
    setTithePercentage(10);
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

  const frequencyLabels: Record<IncomeFrequency, string> = {
    weekly: 'Weekly',
    biweekly: 'Bi-Weekly',
    monthly: 'Monthly',
    annual: 'Annual',
  };

  return (
    <>
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-2xl mx-auto">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#0D9488] rounded-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.titheCalculator.titheCalculator', 'Tithe Calculator')}
              </h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.titheCalculator.calculateYourTitheBasedOn', 'Calculate your tithe based on income')}
              </p>
            </div>
          </div>

          {/* Settings Row */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.titheCalculator.currency', 'Currency')}
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              >
                <option value="USD">{t('tools.titheCalculator.usd', 'USD ($)')}</option>
                <option value="EUR">{t('tools.titheCalculator.eurEuro', 'EUR (euro)')}</option>
                <option value="GBP">{t('tools.titheCalculator.gbpPound', 'GBP (pound)')}</option>
                <option value="CAD">{t('tools.titheCalculator.cad', 'CAD ($)')}</option>
                <option value="AUD">{t('tools.titheCalculator.aud', 'AUD ($)')}</option>
                <option value="NZD">{t('tools.titheCalculator.nzd', 'NZD ($)')}</option>
                <option value="PHP">{t('tools.titheCalculator.phpPeso', 'PHP (peso)')}</option>
                <option value="KRW">{t('tools.titheCalculator.krwWon', 'KRW (won)')}</option>
                <option value="NGN">{t('tools.titheCalculator.ngnNaira', 'NGN (naira)')}</option>
                <option value="ZAR">{t('tools.titheCalculator.zarRand', 'ZAR (rand)')}</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.titheCalculator.tithePercentage', 'Tithe Percentage')}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={tithePercentage}
                  onChange={(e) => setTithePercentage(parseFloat(e.target.value) || 10)}
                  min="1"
                  max="100"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>%</span>
              </div>
            </div>
          </div>

          {/* Income Frequency */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.titheCalculator.incomeFrequency', 'Income Frequency')}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(frequencyLabels) as IncomeFrequency[]).map((freq) => (
                <button
                  key={freq}
                  onClick={() => setFrequency(freq)}
                  className={`py-2 px-3 rounded-lg font-medium transition-colors text-sm ${
                    frequency === freq
                      ? 'bg-[#0D9488] text-white'
                      : theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {frequencyLabels[freq]}
                </button>
              ))}
            </div>
          </div>

          {/* Tithe Base */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.titheCalculator.calculateTitheFrom', 'Calculate Tithe From')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTitheBase('gross')}
                className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                  titheBase === 'gross'
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>{t('tools.titheCalculator.grossIncome', 'Gross Income')}</span>
                </div>
                <p className="text-xs mt-1 opacity-75">{t('tools.titheCalculator.beforeTaxes', 'Before taxes')}</p>
              </button>
              <button
                onClick={() => setTitheBase('net')}
                className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                  titheBase === 'net'
                    ? 'bg-[#0D9488] text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <PiggyBank className="w-5 h-5" />
                  <span>{t('tools.titheCalculator.netIncome', 'Net Income')}</span>
                </div>
                <p className="text-xs mt-1 opacity-75">{t('tools.titheCalculator.afterTaxes', 'After taxes')}</p>
              </button>
            </div>
          </div>

          {/* Income Inputs */}
          <div className="space-y-4 mb-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <DollarSign className="w-4 h-4 inline mr-1" />
                Gross Income ({frequencyLabels[frequency]})
              </label>
              <input
                type="number"
                value={grossIncome}
                onChange={(e) => setGrossIncome(e.target.value)}
                placeholder={t('tools.titheCalculator.enterYourGrossIncome', 'Enter your gross income')}
                className={`w-full px-4 py-3 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <DollarSign className="w-4 h-4 inline mr-1" />
                Net Income ({frequencyLabels[frequency]}) - Optional
              </label>
              <input
                type="number"
                value={netIncome}
                onChange={(e) => setNetIncome(e.target.value)}
                placeholder={t('tools.titheCalculator.enterYourNetIncomeAfter', 'Enter your net income (after taxes)')}
                className={`w-full px-4 py-3 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.titheCalculator.ifNotProvidedGrossIncome', 'If not provided, gross income will be used')}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={calculateTithe}
              className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Calculator className="w-5 h-5" />
              {t('tools.titheCalculator.calculateTithe', 'Calculate Tithe')}
            </button>
            <button
              onClick={reset}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('tools.titheCalculator.reset', 'Reset')}
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="space-y-4">
              {/* Main Result */}
              <div className={`p-6 rounded-lg border-l-4 border-[#0D9488] ${
                theme === 'dark' ? 'bg-gray-700' : t('tools.titheCalculator.bg0d948810', 'bg-[#0D9488]/10')
              }`}>
                <div className="text-center mb-4">
                  <div className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Your {tithePercentage}% Tithe ({titheBase === 'gross' ? t('tools.titheCalculator.gross', 'Gross') : t('tools.titheCalculator.net', 'Net')})
                  </div>
                  <div className="text-4xl font-bold text-[#0D9488] mb-2">
                    {formatCurrency(result.annualTithe)}
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('tools.titheCalculator.perYear', 'per year')}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                    <div className={`text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.titheCalculator.monthlyTithe', 'Monthly Tithe')}
                    </div>
                    <div className="text-xl font-bold text-[#0D9488]">
                      {formatCurrency(result.monthlyTithe)}
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg text-center ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                    <div className={`text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.titheCalculator.weeklyTithe', 'Weekly Tithe')}
                    </div>
                    <div className="text-xl font-bold text-[#0D9488]">
                      {formatCurrency(result.weeklyTithe)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Comparison */}
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.titheCalculator.titheComparison', 'Tithe Comparison')}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      {t('tools.titheCalculator.annualGrossIncome', 'Annual Gross Income:')}
                    </span>
                    <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(result.grossIncome)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      Tithe from Gross ({tithePercentage}%):
                    </span>
                    <span className={`font-semibold ${titheBase === 'gross' ? 'text-[#0D9488]' : theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(result.titheFromGross)}
                    </span>
                  </div>
                  {result.netIncome !== result.grossIncome && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                          {t('tools.titheCalculator.annualNetIncome', 'Annual Net Income:')}
                        </span>
                        <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(result.netIncome)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                          Tithe from Net ({tithePercentage}%):
                        </span>
                        <span className={`font-semibold ${titheBase === 'net' ? 'text-[#0D9488]' : theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(result.titheFromNet)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Giving Suggestions */}
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.titheCalculator.suggestedGivingSchedule', 'Suggested Giving Schedule')}
                </h3>
                <div className={`text-sm space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  <p>{t('tools.titheCalculator.basedOnYourTitheCalculation', 'Based on your tithe calculation, consider these giving options:')}</p>
                  <ul className="space-y-1 ml-4">
                    <li>Weekly: {formatCurrency(result.weeklyTithe)} every Sunday</li>
                    <li>Bi-weekly: {formatCurrency(result.weeklyTithe * 2)} every other week</li>
                    <li>Monthly: {formatCurrency(result.monthlyTithe)} on the 1st of each month</li>
                  </ul>
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
                  {t('tools.titheCalculator.aboutTithing', 'About Tithing')}
                </h3>
                <div className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  <p>{t('tools.titheCalculator.tithingIsThePracticeOf', 'Tithing is the practice of giving a portion (traditionally 10%) of one\'s income to the church or charitable causes.')}</p>
                  <p>{t('tools.titheCalculator.whetherToTitheFromGross', 'Whether to tithe from gross or net income is a personal decision - both approaches are considered valid.')}</p>
                  <p>{t('tools.titheCalculator.manyFindThatRegularConsistent', 'Many find that regular, consistent giving helps develop a generous heart and responsible stewardship.')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <ConfirmDialog />
    {validationMessage && (
      <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50">
        {validationMessage}
      </div>
    )}
    </>
  );
}
