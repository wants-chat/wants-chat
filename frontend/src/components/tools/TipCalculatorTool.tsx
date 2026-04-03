import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calculator, DollarSign, Users, Sparkles, Trash2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { useToolData } from '../../hooks/useToolData';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { ExportDropdown } from '../ui/ExportDropdown';
import { useConfirmDialog } from '../ui/ConfirmDialog';

interface TipResult {
  billAmount: number;
  tipPercent: number;
  tipAmount: number;
  totalAmount: number;
  numberOfPeople: number;
  perPersonAmount: number;
  perPersonTip: number;
}

interface TipCalculation {
  id: string;
  billAmount: number;
  tipPercent: number;
  tipAmount: number;
  totalAmount: number;
  numberOfPeople: number;
  perPersonAmount: number;
  perPersonTip: number;
  createdAt: string;
}

interface TipCalculatorToolProps {
  uiConfig?: UIConfig;
}

export default function TipCalculatorTool({ uiConfig }: TipCalculatorToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [billAmount, setBillAmount] = useState('');
  const [tipPercent, setTipPercent] = useState('15');
  const [numberOfPeople, setNumberOfPeople] = useState('1');
  const [result, setResult] = useState<TipResult | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Initialize useToolData for calculation history
  const {
    data: calculations,
    addItem: addCalculation,
    deleteItem: deleteCalculation,
    exportCSV,
    exportExcel,
    exportJSON,
    exportPDF,
    copyToClipboard,
    print,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<TipCalculation>(
    'tip-calculator',
    [],
    [
      { key: 'billAmount', header: 'Bill Amount', type: 'number' },
      { key: 'tipPercent', header: 'Tip %', type: 'number' },
      { key: 'tipAmount', header: 'Tip Amount', type: 'currency' },
      { key: 'totalAmount', header: 'Total', type: 'currency' },
      { key: 'numberOfPeople', header: 'People', type: 'number' },
      { key: 'perPersonAmount', header: 'Per Person', type: 'currency' },
      { key: 'createdAt', header: 'Date', type: 'date' },
    ]
  );

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.total !== undefined) {
        setBillAmount(params.total.toString());
        setIsPrefilled(true);
      } else if (params.amount !== undefined) {
        setBillAmount(params.amount.toString());
        setIsPrefilled(true);
      }
      if (params.tipPercentage !== undefined) {
        setTipPercent(params.tipPercentage.toString());
        setIsPrefilled(true);
      }
      if (params.people !== undefined) {
        setNumberOfPeople(params.people.toString());
        setIsPrefilled(true);
      }
      if (params.numbers && params.numbers.length > 0) {
        setBillAmount(params.numbers[0].toString());
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const calculateTip = () => {
    const bill = parseFloat(billAmount);
    const tip = parseFloat(tipPercent);
    const people = parseInt(numberOfPeople);

    if (isNaN(bill) || isNaN(tip) || isNaN(people)) {
      setValidationMessage('Please enter valid numbers');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (bill <= 0) {
      setValidationMessage('Bill amount must be greater than 0');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (tip < 0) {
      setValidationMessage('Tip percentage cannot be negative');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    if (people < 1) {
      setValidationMessage('Number of people must be at least 1');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }

    const tipAmount = (bill * tip) / 100;
    const totalAmount = bill + tipAmount;
    const perPersonAmount = totalAmount / people;
    const perPersonTip = tipAmount / people;

    const resultData: TipResult = {
      billAmount: bill,
      tipPercent: tip,
      tipAmount: parseFloat(tipAmount.toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      numberOfPeople: people,
      perPersonAmount: parseFloat(perPersonAmount.toFixed(2)),
      perPersonTip: parseFloat(perPersonTip.toFixed(2))
    };

    setResult(resultData);

    // Save calculation to history
    const calculation: TipCalculation = {
      id: Date.now().toString(),
      ...resultData,
      createdAt: new Date().toISOString(),
    };
    addCalculation(calculation);
  };

  const reset = () => {
    setBillAmount('');
    setTipPercent('15');
    setNumberOfPeople('1');
    setResult(null);
  };

  const setQuickTip = (percent: number) => {
    setTipPercent(percent.toString());
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-2xl mx-auto">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.tipCalculator.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#0D9488] rounded-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.tipCalculator.tipCalculator', 'Tip Calculator')}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <WidgetEmbedButton toolSlug="tip-calculator" toolName="Tip Calculator" />

              <SyncStatus
                isSynced={isSynced}
                isSaving={isSaving}
                lastSaved={lastSaved}
                syncError={syncError}
                onForceSync={forceSync}
                theme={theme}
                showLabel={true}
                size="sm"
              />
              <ExportDropdown
                onExportCSV={exportCSV}
                onExportExcel={exportExcel}
                onExportJSON={exportJSON}
                onExportPDF={exportPDF}
                onPrint={print}
                onCopyToClipboard={copyToClipboard}
                theme={theme}
                disabled={calculations.length === 0}
              />
            </div>
          </div>

          {/* Input Fields */}
          <div className="space-y-4 mb-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.tipCalculator.billAmount', 'Bill Amount ($)')}
              </label>
              <input
                type="number"
                value={billAmount}
                onChange={(e) => setBillAmount(e.target.value)}
                placeholder={t('tools.tipCalculator.enterBillAmount', 'Enter bill amount')}
                step="0.01"
                min="0"
                className={`w-full px-4 py-3 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.tipCalculator.tipPercentage', 'Tip Percentage (%)')}
              </label>
              <input
                type="number"
                value={tipPercent}
                onChange={(e) => setTipPercent(e.target.value)}
                placeholder={t('tools.tipCalculator.enterTipPercentage', 'Enter tip percentage')}
                step="0.5"
                min="0"
                className={`w-full px-4 py-3 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
            </div>

            {/* Quick Tip Buttons */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.tipCalculator.quickTip', 'Quick Tip')}
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[10, 15, 18, 20, 25].map((percent) => (
                  <button
                    key={percent}
                    onClick={() => setQuickTip(percent)}
                    className={`py-2 px-3 rounded-lg font-medium transition-colors ${
                      tipPercent === percent.toString()
                        ? 'bg-[#0D9488] text-white'
                        : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {percent}%
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.tipCalculator.numberOfPeople', 'Number of People')}
              </label>
              <div className="relative">
                <Users className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="number"
                  value={numberOfPeople}
                  onChange={(e) => setNumberOfPeople(e.target.value)}
                  placeholder={t('tools.tipCalculator.numberOfPeople2', 'Number of people')}
                  min="1"
                  step="1"
                  className={`w-full pl-11 pr-4 py-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={calculateTip}
              className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Calculator className="w-5 h-5" />
              {t('tools.tipCalculator.calculateTip', 'Calculate Tip')}
            </button>
            <button
              onClick={reset}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('tools.tipCalculator.reset', 'Reset')}
            </button>
          </div>

          {/* Result Display */}
          {result && (
            <div className="space-y-4">
              {/* Total Amount - Main Display */}
              <div className={`p-6 rounded-lg border-l-4 border-[#0D9488] ${
                theme === 'dark' ? 'bg-gray-700' : t('tools.tipCalculator.bg0d948815', 'bg-[#0D9488]15')
              }`}>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.tipCalculator.tipAmount', 'Tip Amount')}
                    </div>
                    <div className="text-4xl font-bold text-[#0D9488]">
                      ${result.tipAmount.toFixed(2)}
                    </div>
                    <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {result.tipPercent}% tip
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.tipCalculator.totalAmount', 'Total Amount')}
                    </div>
                    <div className="text-4xl font-bold text-green-500">
                      ${result.totalAmount.toFixed(2)}
                    </div>
                    <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('tools.tipCalculator.billTip', 'Bill + Tip')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Per Person Split */}
              {result.numberOfPeople > 1 && (
                <div className={`p-6 rounded-lg border-l-4 border-blue-500 ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'
                }`}>
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-blue-500" />
                    <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Split Between {result.numberOfPeople} People
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tools.tipCalculator.tipPerPerson', 'Tip Per Person')}
                      </div>
                      <div className="text-3xl font-bold text-blue-500">
                        ${result.perPersonTip.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('tools.tipCalculator.totalPerPerson', 'Total Per Person')}
                      </div>
                      <div className="text-3xl font-bold text-blue-500">
                        ${result.perPersonAmount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Breakdown */}
              <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t('tools.tipCalculator.billBreakdown', 'Bill Breakdown')}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      {t('tools.tipCalculator.originalBill', 'Original Bill:')}
                    </span>
                    <span className={`font-semibold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      ${result.billAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className={`border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`} />
                  <div className="flex justify-between items-center">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      Tip ({result.tipPercent}%):
                    </span>
                    <span className="font-semibold text-lg text-[#0D9488]">
                      +${result.tipAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className={`border-t-2 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`} />
                  <div className="flex justify-between items-center">
                    <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {t('tools.tipCalculator.total', 'Total:')}
                    </span>
                    <span className="font-bold text-2xl text-green-500">
                      ${result.totalAmount.toFixed(2)}
                    </span>
                  </div>
                  {result.numberOfPeople > 1 && (
                    <>
                      <div className={`border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`} />
                      <div className="flex justify-between items-center">
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                          {t('tools.tipCalculator.eachPersonPays', 'Each Person Pays:')}
                        </span>
                        <span className="font-bold text-xl text-blue-500">
                          ${result.perPersonAmount.toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Calculation Formula */}
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                  {t('tools.tipCalculator.calculation', 'Calculation:')}
                </div>
                <div className={`font-mono text-sm space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  <div>Tip = ${result.billAmount.toFixed(2)} × {result.tipPercent}% = ${result.tipAmount.toFixed(2)}</div>
                  <div>Total = ${result.billAmount.toFixed(2)} + ${result.tipAmount.toFixed(2)} = ${result.totalAmount.toFixed(2)}</div>
                  {result.numberOfPeople > 1 && (
                    <div>Per Person = ${result.totalAmount.toFixed(2)} ÷ {result.numberOfPeople} = ${result.perPersonAmount.toFixed(2)}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tip Guide */}
          <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.tipCalculator.tipGuide', 'Tip Guide')}
            </h3>
            <div className={`space-y-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <div className="flex justify-between">
                <span>{t('tools.tipCalculator.poorService', 'Poor Service:')}</span>
                <span className="font-medium">10%</span>
              </div>
              <div className="flex justify-between">
                <span>{t('tools.tipCalculator.goodService', 'Good Service:')}</span>
                <span className="font-medium">15%</span>
              </div>
              <div className="flex justify-between">
                <span>{t('tools.tipCalculator.greatService', 'Great Service:')}</span>
                <span className="font-medium">18-20%</span>
              </div>
              <div className="flex justify-between">
                <span>{t('tools.tipCalculator.excellentService', 'Excellent Service:')}</span>
                <span className="font-medium">25%+</span>
              </div>
            </div>
          </div>

          {/* Calculation History */}
          {calculations.length > 0 && (
            <div className={`mt-6 p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.tipCalculator.calculationHistory', 'Calculation History')}
              </h3>
              <div className="space-y-3">
                {calculations.slice().reverse().map((calc) => (
                  <div
                    key={calc.id}
                    className={`p-4 rounded-lg flex items-center justify-between ${
                      theme === 'dark'
                        ? 'bg-gray-600 border border-gray-500'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        ${calc.billAmount.toFixed(2)} + {calc.tipPercent}% = ${calc.totalAmount.toFixed(2)}
                      </div>
                      <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {new Date(calc.createdAt).toLocaleString()}
                        {calc.numberOfPeople > 1 && ` • ${calc.numberOfPeople} people: $${calc.perPersonAmount.toFixed(2)} each`}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteCalculation(calc.id)}
                      className={`ml-4 p-2 rounded-lg transition-colors ${
                        theme === 'dark'
                          ? 'hover:bg-gray-500 text-gray-300 hover:text-white'
                          : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
                      }`}
                      title={t('tools.tipCalculator.deleteCalculation', 'Delete calculation')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <ConfirmDialog />
      {validationMessage && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {validationMessage}
        </div>
      )}
    </div>
  );
}
