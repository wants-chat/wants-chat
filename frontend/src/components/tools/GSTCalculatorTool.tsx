import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calculator, Copy, Check, ArrowUpDown, Sparkles, Info } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type GSTType = 'cgst_sgst' | 'igst';
type CalculationMode = 'add' | 'remove';

interface GSTCalculatorToolProps {
  uiConfig?: UIConfig;
}

export const GSTCalculatorTool: React.FC<GSTCalculatorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [mode, setMode] = useState<CalculationMode>('add');
  const [gstType, setGstType] = useState<GSTType>('cgst_sgst');
  const [amount, setAmount] = useState('1000');
  const [gstRate, setGstRate] = useState('18');
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount !== undefined) {
        setAmount(params.amount.toString());
        setIsPrefilled(true);
      }
      if (params.numbers && params.numbers.length > 0) {
        setAmount(params.numbers[0].toString());
        if (params.numbers.length > 1) {
          setGstRate(params.numbers[1].toString());
        }
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const calculations = useMemo(() => {
    const amt = parseFloat(amount) || 0;
    const rate = parseFloat(gstRate) || 0;

    let baseAmount: number;
    let gstAmount: number;
    let totalAmount: number;

    if (mode === 'add') {
      baseAmount = amt;
      gstAmount = amt * (rate / 100);
      totalAmount = amt + gstAmount;
    } else {
      totalAmount = amt;
      baseAmount = amt / (1 + rate / 100);
      gstAmount = totalAmount - baseAmount;
    }

    const cgst = gstType === 'cgst_sgst' ? gstAmount / 2 : 0;
    const sgst = gstType === 'cgst_sgst' ? gstAmount / 2 : 0;
    const igst = gstType === 'igst' ? gstAmount : 0;

    return {
      baseAmount,
      gstAmount,
      totalAmount,
      cgst,
      sgst,
      igst,
      gstRate: rate,
    };
  }, [amount, gstRate, mode, gstType]);

  const handleCopy = () => {
    let text = `GST Calculation
Base Amount: Rs.${calculations.baseAmount.toFixed(2)}
GST Rate: ${calculations.gstRate}%
`;
    if (gstType === 'cgst_sgst') {
      text += `CGST (${calculations.gstRate / 2}%): Rs.${calculations.cgst.toFixed(2)}
SGST (${calculations.gstRate / 2}%): Rs.${calculations.sgst.toFixed(2)}
`;
    } else {
      text += `IGST (${calculations.gstRate}%): Rs.${calculations.igst.toFixed(2)}
`;
    }
    text += `Total GST: Rs.${calculations.gstAmount.toFixed(2)}
Total Amount: Rs.${calculations.totalAmount.toFixed(2)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const gstSlabs = [
    { label: '0% (Essential)', rate: 0 },
    { label: '5% (Basic)', rate: 5 },
    { label: '12% (Standard)', rate: 12 },
    { label: '18% (Standard)', rate: 18 },
    { label: '28% (Luxury)', rate: 28 },
  ];

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-teal-900/20' : 'bg-gradient-to-r from-white to-teal-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 rounded-lg">
            <Calculator className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.gSTCalculator.gstCalculator', 'GST Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.gSTCalculator.calculateCgstSgstIgst', 'Calculate CGST, SGST & IGST')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-xl border border-teal-500/20">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span className="text-sm text-teal-500 font-medium">{t('tools.gSTCalculator.valuesLoadedFromAiResponse', 'Values loaded from AI response')}</span>
          </div>
        )}

        {/* Mode & Type Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.gSTCalculator.calculationMode', 'Calculation Mode')}
            </label>
            <div className="flex gap-2">
              {[
                { value: 'add', label: 'Add GST' },
                { value: 'remove', label: 'Remove GST' },
              ].map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMode(m.value as CalculationMode)}
                  className={`flex-1 px-4 py-2 text-sm rounded-lg transition-colors ${
                    mode === m.value
                      ? 'bg-teal-500 text-white'
                      : isDark
                      ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.gSTCalculator.gstType', 'GST Type')}
            </label>
            <div className="flex gap-2">
              {[
                { value: 'cgst_sgst', label: 'CGST + SGST' },
                { value: 'igst', label: 'IGST' },
              ].map((t) => (
                <button
                  key={t.value}
                  onClick={() => setGstType(t.value as GSTType)}
                  className={`flex-1 px-4 py-2 text-sm rounded-lg transition-colors ${
                    gstType === t.value
                      ? 'bg-teal-500 text-white'
                      : isDark
                      ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {mode === 'add' ? t('tools.gSTCalculator.amountExclGst', 'Amount (excl. GST)') : t('tools.gSTCalculator.amountInclGst', 'Amount (incl. GST)')} (Rs.)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.gSTCalculator.gstRate', 'GST Rate (%)')}
            </label>
            <input
              type="number"
              value={gstRate}
              onChange={(e) => setGstRate(e.target.value)}
              min="0"
              max="100"
              step="0.1"
              className={`w-full px-4 py-3 rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
        </div>

        {/* GST Slabs */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.gSTCalculator.gstSlabs', 'GST Slabs')}
          </label>
          <div className="flex flex-wrap gap-2">
            {gstSlabs.map((slab) => (
              <button
                key={slab.rate}
                onClick={() => setGstRate(slab.rate.toString())}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  parseFloat(gstRate) === slab.rate
                    ? 'bg-teal-500 text-white'
                    : isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {slab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-teal-900/20 border-teal-800' : 'bg-teal-50 border-teal-100'} border`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-5 h-5 text-teal-500" />
              <h4 className={`font-medium ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>
                {t('tools.gSTCalculator.gstBreakdown', 'GST Breakdown')}
              </h4>
            </div>
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                copied ? 'bg-teal-500 text-white' : isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-white hover:bg-gray-100 text-gray-700'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? t('tools.gSTCalculator.copied', 'Copied!') : t('tools.gSTCalculator.copy', 'Copy')}
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{t('tools.gSTCalculator.baseAmount', 'Base Amount')}</span>
              <span className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Rs.{calculations.baseAmount.toFixed(2)}
              </span>
            </div>

            {gstType === 'cgst_sgst' ? (
              <>
                <div className="flex justify-between items-center">
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                    CGST ({calculations.gstRate / 2}%)
                  </span>
                  <span className="text-lg font-medium text-teal-500">
                    +Rs.{calculations.cgst.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                    SGST ({calculations.gstRate / 2}%)
                  </span>
                  <span className="text-lg font-medium text-teal-500">
                    +Rs.{calculations.sgst.toFixed(2)}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                  IGST ({calculations.gstRate}%)
                </span>
                <span className="text-lg font-medium text-teal-500">
                  +Rs.{calculations.igst.toFixed(2)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{t('tools.gSTCalculator.totalGst', 'Total GST')}</span>
              <span className="text-lg font-medium text-teal-500">
                Rs.{calculations.gstAmount.toFixed(2)}
              </span>
            </div>

            <div className={`pt-4 border-t ${isDark ? 'border-gray-700' : 'border-teal-200'}`}>
              <div className="flex justify-between items-center">
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.gSTCalculator.totalAmount', 'Total Amount')}</span>
                <span className={`text-3xl font-bold text-teal-500`}>
                  Rs.{calculations.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <p><strong>{t('tools.gSTCalculator.cgstSgst', 'CGST + SGST:')}</strong> {t('tools.gSTCalculator.forIntraStateTransactionsWithin', 'For intra-state transactions (within same state)')}</p>
              <p><strong>{t('tools.gSTCalculator.igst', 'IGST:')}</strong> {t('tools.gSTCalculator.forInterStateTransactionsBetween', 'For inter-state transactions (between different states)')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GSTCalculatorTool;
