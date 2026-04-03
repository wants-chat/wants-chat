import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeftRight, DollarSign, Info, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'CHF' | 'CNY' | 'INR' | 'BDT';

interface ExchangeRates {
  [key: string]: number;
}

interface CurrencyConverterToolProps {
  uiConfig?: UIConfig;
}

const CurrencyConverterTool: React.FC<CurrencyConverterToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const [inputValue, setInputValue] = useState<string>('1');
  const [fromCurrency, setFromCurrency] = useState<Currency>('USD');
  const [toCurrency, setToCurrency] = useState<Currency>('EUR');
  const [result, setResult] = useState<number>(0);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;

      if (params.amount !== undefined) {
        setInputValue(String(params.amount));
        setIsPrefilled(true);
      } else if (params.total !== undefined) {
        setInputValue(String(params.total));
        setIsPrefilled(true);
      }
      const textContent = params.text || params.content || '';
      if (textContent && !params.amount && !params.total) {
        const numMatch = textContent.match(/[\d.]+/);
        if (numMatch) {
          setInputValue(numMatch[0]);
          setIsPrefilled(true);
        }
      }
    }
  }, [uiConfig?.params]);

  // Static exchange rates (base: USD)
  const exchangeRates: ExchangeRates = {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 149.50,
    CAD: 1.36,
    AUD: 1.52,
    CHF: 0.88,
    CNY: 7.24,
    INR: 83.12,
    BDT: 109.75,
  };

  const currencySymbols: Record<Currency, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
    CHF: 'CHF',
    CNY: '¥',
    INR: '₹',
    BDT: '৳',
  };

  const currencyNames: Record<Currency, string> = {
    USD: 'US Dollar',
    EUR: 'Euro',
    GBP: 'British Pound',
    JPY: 'Japanese Yen',
    CAD: 'Canadian Dollar',
    AUD: 'Australian Dollar',
    CHF: 'Swiss Franc',
    CNY: 'Chinese Yuan',
    INR: 'Indian Rupee',
    BDT: 'Bangladeshi Taka',
  };

  const convertCurrency = (value: number, from: Currency, to: Currency): number => {
    if (from === to) return value;

    // Convert to USD first, then to target currency
    const usdValue = value / exchangeRates[from];
    return usdValue * exchangeRates[to];
  };

  useEffect(() => {
    const value = parseFloat(inputValue);
    if (!isNaN(value)) {
      const converted = convertCurrency(value, fromCurrency, toCurrency);
      setResult(converted);
    } else {
      setResult(0);
    }
  }, [inputValue, fromCurrency, toCurrency]);

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const getExchangeRate = (): string => {
    const rate = convertCurrency(1, fromCurrency, toCurrency);
    return `1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}`;
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg shadow-lg p-8`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-lg bg-[#0D9488] flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t('tools.currencyConverter.title', 'Currency Converter')}</h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.currencyConverter.description', 'Convert between different currencies')}
              </p>
            </div>
          </div>

          {isPrefilled && (
            <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
              <Sparkles className="w-4 h-4 text-[#0D9488]" />
              <span className="text-sm text-[#0D9488] font-medium">{t('tools.currencyConverter.prefilled', 'Value loaded from AI response')}</span>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* From Section */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.currencyConverter.from', 'From')}
              </label>
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                step="0.01"
                min="0"
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488] mb-3`}
                placeholder={t('tools.currencyConverter.enterAmount', 'Enter amount')}
              />
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value as Currency)}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              >
                {(Object.keys(currencyNames) as Currency[]).map((currency) => (
                  <option key={currency} value={currency}>
                    {currencySymbols[currency]} {currency} - {currencyNames[currency]}
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <div className="flex items-center justify-center md:col-span-2 md:order-none order-last">
              <button
                onClick={handleSwapCurrencies}
                className="p-3 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white transition-colors"
                title={t('tools.currencyConverter.swapCurrencies', 'Swap currencies')}
              >
                <ArrowLeftRight className="w-5 h-5" />
              </button>
            </div>

            {/* To Section */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('tools.currencyConverter.to', 'To')}
              </label>
              <div
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-gray-100 border-gray-300 text-gray-900'
                } mb-3 font-semibold text-lg`}
              >
                {currencySymbols[toCurrency]}{result.toFixed(2)}
              </div>
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value as Currency)}
                className={`w-full px-4 py-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              >
                {(Object.keys(currencyNames) as Currency[]).map((currency) => (
                  <option key={currency} value={currency}>
                    {currencySymbols[currency]} {currency} - {currencyNames[currency]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Exchange Rate Display */}
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} mb-4 flex items-start gap-3`}>
            <Info className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                {t('tools.currencyConverter.exchangeRate', 'Exchange Rate')}
              </p>
              <p className={`text-sm font-mono ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {getExchangeRate()}
              </p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.currencyConverter.disclaimer', 'Note: Exchange rates are static and for reference only. For real-time rates, please check official financial sources.')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencyConverterTool;
