import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Receipt, Users, Plus, Minus, Copy, Check, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

interface TipSplitToolProps {
  uiConfig?: UIConfig;
}

export const TipSplitTool: React.FC<TipSplitToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [billAmount, setBillAmount] = useState('100');
  const [tipPercent, setTipPercent] = useState(18);
  const [numPeople, setNumPeople] = useState(4);
  const [roundUp, setRoundUp] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Prefill from uiConfig
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      if (params.amount) {
        setBillAmount(String(params.amount));
        setIsPrefilled(true);
      }
      if (params.numbers && params.numbers.length > 0) {
        setBillAmount(String(params.numbers[0]));
        if (params.numbers[1]) setTipPercent(params.numbers[1]);
        if (params.numbers[2]) setNumPeople(params.numbers[2]);
        setIsPrefilled(true);
      }
      if (params.formData) {
        if (params.formData.billAmount) setBillAmount(params.formData.billAmount);
        if (params.formData.tipPercent) setTipPercent(Number(params.formData.tipPercent));
        if (params.formData.numPeople) setNumPeople(Number(params.formData.numPeople));
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  const calculations = useMemo(() => {
    const bill = parseFloat(billAmount) || 0;
    const tipAmount = bill * (tipPercent / 100);
    const totalWithTip = bill + tipAmount;

    let perPerson = numPeople > 0 ? totalWithTip / numPeople : 0;
    let tipPerPerson = numPeople > 0 ? tipAmount / numPeople : 0;

    if (roundUp) {
      perPerson = Math.ceil(perPerson);
      tipPerPerson = Math.ceil(tipPerPerson);
    }

    return {
      tipAmount,
      totalWithTip,
      perPerson,
      tipPerPerson,
      billPerPerson: numPeople > 0 ? bill / numPeople : 0,
    };
  }, [billAmount, tipPercent, numPeople, roundUp]);

  const tipPresets = [10, 15, 18, 20, 25];

  const handleCopy = () => {
    const text = `Bill Split Summary
Bill: $${parseFloat(billAmount).toFixed(2)}
Tip (${tipPercent}%): $${calculations.tipAmount.toFixed(2)}
Total: $${calculations.totalWithTip.toFixed(2)}
Split ${numPeople} ways: $${calculations.perPerson.toFixed(2)} per person`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-emerald-900/20' : 'bg-gradient-to-r from-white to-emerald-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <Receipt className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.tipSplit.tipSplitCalculator', 'Tip & Split Calculator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.tipSplit.calculateTipsAndSplitBills', 'Calculate tips and split bills easily')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">{t('tools.tipSplit.contentLoadedFromYourConversation', 'Content loaded from your conversation')}</span>
          </div>
        )}

        {/* Bill Amount */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.tipSplit.billAmount', 'Bill Amount')}
          </label>
          <div className="relative">
            <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-xl ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
            <input
              type="number"
              value={billAmount}
              onChange={(e) => setBillAmount(e.target.value)}
              className={`w-full pl-10 pr-4 py-4 text-2xl rounded-lg border ${
                isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
        </div>

        {/* Tip Percentage */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.tipSplit.tipPercentage', 'Tip Percentage')}
            </label>
            <span className={`text-2xl font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
              {tipPercent}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            value={tipPercent}
            onChange={(e) => setTipPercent(parseInt(e.target.value))}
            className="w-full accent-emerald-500"
          />
          <div className="flex gap-2">
            {tipPresets.map((preset) => (
              <button
                key={preset}
                onClick={() => setTipPercent(preset)}
                className={`flex-1 py-2 text-sm rounded-lg transition-colors ${
                  tipPercent === preset
                    ? 'bg-emerald-500 text-white'
                    : isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {preset}%
              </button>
            ))}
          </div>
        </div>

        {/* Number of People */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.tipSplit.splitBetween', 'Split Between')}
          </label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setNumPeople(Math.max(1, numPeople - 1))}
              className={`p-3 rounded-lg transition-colors ${
                isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Minus className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Users className={`w-6 h-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <span className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {numPeople}
              </span>
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>people</span>
            </div>
            <button
              onClick={() => setNumPeople(Math.min(50, numPeople + 1))}
              className={`p-3 rounded-lg transition-colors ${
                isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Round Up Option */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={roundUp}
            onChange={(e) => setRoundUp(e.target.checked)}
            className="w-5 h-5 rounded accent-emerald-500"
          />
          <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
            {t('tools.tipSplit.roundUpToNearestDollar', 'Round up to nearest dollar')}
          </span>
        </label>

        {/* Results */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-emerald-900/20 border-emerald-800' : 'bg-emerald-50 border-emerald-100'} border`}>
          <div className="flex items-center justify-between mb-4">
            <h4 className={`font-medium ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
              {t('tools.tipSplit.summary', 'Summary')}
            </h4>
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                copied ? 'bg-green-500 text-white' : isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-white hover:bg-gray-100 text-gray-700'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? t('tools.tipSplit.copied', 'Copied!') : t('tools.tipSplit.copy', 'Copy')}
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('tools.tipSplit.bill', 'Bill')}</span>
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${parseFloat(billAmount || '0').toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Tip ({tipPercent}%)</span>
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${calculations.tipAmount.toFixed(2)}
              </span>
            </div>
            <div className={`border-t pt-3 ${isDark ? 'border-emerald-800' : 'border-emerald-200'}`}>
              <div className="flex justify-between items-center">
                <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.tipSplit.total', 'Total')}</span>
                <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  ${calculations.totalWithTip.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className={`mt-4 pt-4 border-t ${isDark ? 'border-emerald-800' : 'border-emerald-200'}`}>
            <div className="text-center">
              <div className={`text-sm ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                {t('tools.tipSplit.eachPersonPays', 'Each Person Pays')}
              </div>
              <div className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ${calculations.perPerson.toFixed(2)}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                (${calculations.billPerPerson.toFixed(2)} + ${calculations.tipPerPerson.toFixed(2)} tip)
              </div>
            </div>
          </div>
        </div>

        {/* Tip Guide */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.tipSplit.tippingGuide', 'Tipping Guide')}</h4>
          <div className={`text-sm space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <div>• 15% - Adequate service</div>
            <div>• 18-20% - Good service (standard)</div>
            <div>• 25%+ - Exceptional service</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TipSplitTool;
