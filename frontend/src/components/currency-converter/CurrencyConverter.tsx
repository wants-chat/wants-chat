import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import {
  ArrowRightLeft,
  ChevronDown,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { api } from '../../lib/api';

// Define common currencies
const currencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr', flag: '🇨🇭' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', flag: '🇧🇩' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', flag: '🇲🇽' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr', flag: '🇩🇰' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿' },
];

interface CurrencyDropdownProps {
  value: string;
  onChange: (code: string) => void;
}

const CurrencyDropdown: React.FC<CurrencyDropdownProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCurrency = currencies.find(c => c.code === value);

  const filteredCurrencies = currencies.filter(c =>
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all w-full",
          "bg-white/10 backdrop-blur-xl hover:bg-white/15",
          isOpen ? "border-teal-400 ring-2 ring-teal-400/20" : "border-white/20"
        )}
      >
        <span className="text-2xl">{selectedCurrency?.flag}</span>
        <div className="text-left flex-1">
          <div className="font-bold text-lg text-white">{selectedCurrency?.code}</div>
          <div className="text-xs text-white/60">{selectedCurrency?.name}</div>
        </div>
        <ChevronDown className={cn("h-5 w-5 text-white/60 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-teal-800/90 backdrop-blur-xl border border-teal-400/30 rounded-xl shadow-xl overflow-hidden">
          <div className="p-2 border-b border-white/20">
            <Input
              type="text"
              placeholder="Search currency..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 text-sm bg-white/10 border-white/20 text-white placeholder:text-white/40"
              autoFocus
            />
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filteredCurrencies.map(currency => (
              <button
                key={currency.code}
                type="button"
                onClick={() => {
                  onChange(currency.code);
                  setIsOpen(false);
                  setSearch('');
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/15 transition-colors",
                  value === currency.code && "bg-teal-500/20"
                )}
              >
                <span className="text-xl">{currency.flag}</span>
                <div className="text-left flex-1">
                  <div className="font-semibold text-white">{currency.code}</div>
                  <div className="text-xs text-white/60">{currency.name}</div>
                </div>
                {value === currency.code && (
                  <Check className="h-4 w-4 text-teal-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const CurrencyConverter: React.FC = () => {
  const [fromAmount, setFromAmount] = useState<string>('1');
  const [toAmount, setToAmount] = useState<string>('');
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('EUR');
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeInput, setActiveInput] = useState<'from' | 'to'>('from');

  // Fetch rate and convert
  const fetchRateAndConvert = useCallback(async (from: string, to: string, amount: number, direction: 'from' | 'to') => {
    if (from === to) {
      setRate(1);
      if (direction === 'from') {
        setToAmount(amount.toString());
      } else {
        setFromAmount(amount.toString());
      }
      return;
    }

    setLoading(true);
    try {
      const result = await api.convertCurrencyExternal(from, to, 1);
      setRate(result.rate);
      setLastUpdated(new Date());

      if (direction === 'from') {
        const converted = amount * result.rate;
        setToAmount(converted.toFixed(2));
      } else {
        const converted = amount / result.rate;
        setFromAmount(converted.toFixed(2));
      }
    } catch (error) {
      console.error('Failed to fetch rate:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced conversion
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const amount = parseFloat(activeInput === 'from' ? fromAmount : toAmount);
      if (!isNaN(amount) && amount >= 0) {
        fetchRateAndConvert(fromCurrency, toCurrency, amount, activeInput);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [fromAmount, toAmount, fromCurrency, toCurrency, activeInput, fetchRateAndConvert]);

  // Handle from amount change
  const handleFromAmountChange = (value: string) => {
    setActiveInput('from');
    setFromAmount(value);
  };

  // Handle to amount change
  const handleToAmountChange = (value: string) => {
    setActiveInput('to');
    setToAmount(value);
  };

  // Handle currency swap
  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  // Handle currency change
  const handleFromCurrencyChange = (code: string) => {
    setFromCurrency(code);
    setActiveInput('from');
  };

  const handleToCurrencyChange = (code: string) => {
    setToCurrency(code);
    setActiveInput('from');
  };

  // Copy result
  const handleCopy = () => {
    const text = `${fromAmount} ${fromCurrency} = ${toAmount} ${toCurrency}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Refresh rate
  const handleRefresh = () => {
    const amount = parseFloat(fromAmount);
    if (!isNaN(amount)) {
      fetchRateAndConvert(fromCurrency, toCurrency, amount, 'from');
    }
  };

  const fromCurrencyData = currencies.find(c => c.code === fromCurrency);
  const toCurrencyData = currencies.find(c => c.code === toCurrency);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 shadow-xl">
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Currency Converter</h1>
            <p className="text-white/60 text-sm">Real-time exchange rates</p>
          </div>

          {/* Currency Selection Row - FROM and TO on top */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1">
              <label className="block text-xs font-medium text-white/60 mb-2 uppercase tracking-wide">From</label>
              <CurrencyDropdown
                value={fromCurrency}
                onChange={handleFromCurrencyChange}
              />
            </div>

            {/* Swap Button */}
            <div className="pt-6">
              <Button
                variant="outline"
                size="icon"
                onClick={handleSwap}
                className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-xl shadow-md border-2 border-white/20 hover:bg-gradient-to-r hover:from-teal-500 hover:to-cyan-500 hover:text-white hover:border-teal-400 transition-all"
              >
                <ArrowRightLeft className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1">
              <label className="block text-xs font-medium text-white/60 mb-2 uppercase tracking-wide">To</label>
              <CurrencyDropdown
                value={toCurrency}
                onChange={handleToCurrencyChange}
              />
            </div>
          </div>

          {/* Amount Inputs - Below currency selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* From Amount */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <label className="block text-xs font-medium text-white/60 mb-2">Amount</label>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{fromCurrencyData?.flag}</span>
                <Input
                  type="number"
                  value={fromAmount}
                  onChange={(e) => handleFromAmountChange(e.target.value)}
                  className="h-12 text-2xl font-bold border-0 bg-transparent focus-visible:ring-0 px-0 text-white"
                  placeholder="0"
                />
                <span className="text-lg font-semibold text-white/60">{fromCurrency}</span>
              </div>
            </div>

            {/* To Amount */}
            <div className="bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-xl p-4 border border-teal-400/30">
              <label className="block text-xs font-medium text-white/60 mb-2">Converted Amount</label>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{toCurrencyData?.flag}</span>
                <div className="flex-1 relative">
                  <Input
                    type="number"
                    value={toAmount}
                    onChange={(e) => handleToAmountChange(e.target.value)}
                    className="h-12 text-2xl font-bold border-0 bg-transparent focus-visible:ring-0 px-0 text-teal-300"
                    placeholder="0"
                  />
                  {loading && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2">
                      <RefreshCw className="h-5 w-5 text-white/60 animate-spin" />
                    </div>
                  )}
                </div>
                <span className="text-lg font-semibold text-teal-300">{toCurrency}</span>
              </div>
            </div>
          </div>

          {/* Rate Info */}
          {rate && (
            <div className="space-y-4">
              {/* Exchange Rate Display */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-3 text-sm sm:text-base">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg">{fromCurrencyData?.flag}</span>
                    <span className="font-medium text-white">1 {fromCurrency}</span>
                  </div>
                  <span className="text-white/60">=</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg">{toCurrencyData?.flag}</span>
                    <span className="font-bold text-teal-300">{rate.toFixed(4)} {toCurrency}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefresh}
                    className="h-8 px-2 text-white/60 hover:text-white hover:bg-white/10"
                    disabled={loading}
                  >
                    <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="h-8 px-2 text-white/60 hover:text-white hover:bg-white/10"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Inverse Rate */}
              <div className="text-center text-sm text-white/60">
                1 {toCurrency} = {(1/rate).toFixed(4)} {fromCurrency}
              </div>

              {/* Last Updated */}
              {lastUpdated && (
                <div className="text-center">
                  <div className="inline-block bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-3 py-1 text-xs text-white/80">
                    Updated {lastUpdated.toLocaleTimeString()}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Amounts */}
          <div className="mt-6 pt-6 border-t border-white/20">
            <p className="text-xs text-white/60 mb-3">Quick amounts</p>
            <div className="flex flex-wrap gap-2">
              {[1, 10, 100, 1000, 5000, 10000].map((amount) => (
                <Button
                  key={amount}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFromAmountChange(amount.toString())}
                  className={cn(
                    "h-8 text-xs border border-white/20 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white",
                    fromAmount === amount.toString() && "bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-teal-400"
                  )}
                >
                  {amount.toLocaleString()}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencyConverter;
