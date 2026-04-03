import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import Icon from '@mdi/react';
import { 
  mdiCurrencyUsd,
  mdiChartLine,
  mdiPlusCircle,
  mdiTrendingUp,
  mdiTrendingDown,
  mdiBank,
  mdiSwapHorizontal,
  mdiClockOutline,
  mdiStarOutline
} from '@mdi/js';
import Sparkline from './Sparkline';

const popularCurrencies = [
  { code: 'USD', name: 'US Dollar', color: 'bg-gradient-to-br from-blue-500 to-blue-600' },
  { code: 'EUR', name: 'Euro', color: 'bg-gradient-to-br from-emerald-500 to-emerald-600' },
  { code: 'JPY', name: 'Japanese Yen', color: 'bg-gradient-to-br from-orange-500 to-orange-600' },
  { code: 'GBP', name: 'British Pound', color: 'bg-gradient-to-br from-purple-500 to-purple-600' },
  { code: 'AUD', name: 'Australian Dollar', color: 'bg-gradient-to-br from-teal-500 to-teal-600' },
  { code: 'CAD', name: 'Canadian Dollar', color: 'bg-gradient-to-br from-red-500 to-red-600' },
  { code: 'CHF', name: 'Swiss Franc', color: 'bg-gradient-to-br from-indigo-500 to-indigo-600' },
  { code: 'CNY', name: 'Chinese Yuan', color: 'bg-gradient-to-br from-pink-500 to-pink-600' },
  { code: 'SEK', name: 'Swedish Krona', color: 'bg-gradient-to-br from-cyan-500 to-cyan-600' },
  { code: 'NZD', name: 'New Zealand Dollar', color: 'bg-gradient-to-br from-yellow-500 to-yellow-600' }
];

interface RateData {
  rate: number;
  historical: { date: string; value: number }[];
}

const RatesTab: React.FC = () => {
  const [rates, setRates] = useState<Record<string, RateData> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [userRates, setUserRates] = useState<any[]>([]);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');

  useEffect(() => {
    const fetchRates = async () => {
      setIsLoading(true);
      try {
        const today = new Date();
        const priorDate = new Date(new Date().setDate(today.getDate() - 30));
        const from = priorDate.toISOString().split('T')[0];
        const to = today.toISOString().split('T')[0];

        const [latestResponse, historicalResponse] = await Promise.all([
          axios.get(`https://api.frankfurter.app/latest?from=${baseCurrency}`),
          axios.get(`https://api.frankfurter.app/${from}..${to}?from=${baseCurrency}`)
        ]);

        const latestRates = latestResponse.data.rates;
        const historicalRates = historicalResponse.data.rates;

        const formattedRates: Record<string, RateData> = {};

        for (const currency of popularCurrencies) {
          if (currency.code !== baseCurrency) {
            const historical = Object.entries(historicalRates).map(([date, value]: [string, any]) => ({
              date,
              value: value[currency.code]
            }));
            formattedRates[currency.code] = {
              rate: latestRates[currency.code],
              historical,
            };
          }
        }
        setRates(formattedRates);
      } catch (error) {
        console.error("Error fetching exchange rates:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRates();
  }, [baseCurrency]);

  const handleAddRate = async () => {
    if (fromCurrency && toCurrency && fromCurrency !== toCurrency) {
      try {
        const response = await axios.get(`https://api.frankfurter.app/latest?from=${fromCurrency}&to=${toCurrency}`);
        const rate = response.data.rates[toCurrency];
        setUserRates([...userRates, { from: fromCurrency, to: toCurrency, rate }]);
      } catch (error) {
        console.error("Error fetching user-added rate:", error);
      }
    }
  };

  const getCurrencyColor = (code: string) => {
    const currency = popularCurrencies.find(c => c.code === code);
    return currency?.color || 'bg-gradient-to-br from-gray-500 to-gray-600';
  };

  const calculatePerformance = (historical: { date: string; value: number }[]) => {
    if (historical.length < 2) return 0;
    const firstValue = historical[0].value;
    const lastValue = historical[historical.length - 1].value;
    return ((lastValue - firstValue) / firstValue) * 100;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="p-4 bg-white/10 backdrop-blur-xl rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center border border-white/20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-400"></div>
          </div>
          <p className="text-white/60">Loading exchange rates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white/10 backdrop-blur-xl p-6 rounded-xl border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg">
                <Icon path={mdiBank} size={1.2} className="text-white" />
              </div>
              Exchange Rates
            </h1>
            <p className="text-sm text-white/60 mt-1">
              Live exchange rates and 30-day trends for popular currencies
            </p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-teal-300">{rates ? Object.keys(rates).length : 0}</div>
            <div className="text-xs text-white/60">Currency Pairs</div>
            <div className="inline-block bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-2 py-1 text-xs text-white/80 mt-1">
              <Icon path={mdiClockOutline} size={0.4} className="mr-1 inline" />
              Real-time
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Popular Exchange Rates</h3>
            <div className="inline-block bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border border-teal-400/30 rounded-full px-3 py-1 text-xs text-white/80">
              <Icon path={mdiTrendingUp} size={0.5} className="inline mr-1" />
              30-Day Trends
            </div>
          </div>
          <p className="text-sm text-white/60 mb-6">Live exchange rates for popular currencies against {baseCurrency}.</p>
          <div className="mb-6">
            <Label htmlFor="base-currency" className="text-sm font-medium text-white flex items-center gap-2 mb-2">
              <div className={`w-4 h-4 rounded-full ${getCurrencyColor(baseCurrency)}`}></div>
              Base Currency
            </Label>
            <Select value={baseCurrency} onValueChange={setBaseCurrency}>
              <SelectTrigger id="base-currency" className="h-12 rounded-lg bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent className="bg-teal-800/90 border-teal-400/30">
                {popularCurrencies.map(currency => (
                  <SelectItem key={currency.code} value={currency.code} className="text-white hover:bg-white/10">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${currency.color}`}></div>
                      <span className="font-mono">{currency.code}</span>
                      <span className="text-white/60">- {currency.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Currency Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rates && Object.entries(rates).map(([currency, data]) => {
              const performance = calculatePerformance(data.historical);
              const currencyInfo = popularCurrencies.find(c => c.code === currency);

              return (
                <div key={currency} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl hover:shadow-lg hover:shadow-teal-500/10 transition-all hover:scale-105 duration-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full ${currencyInfo?.color || 'bg-gray-500'} flex items-center justify-center shadow-sm`}>
                        <Icon path={mdiCurrencyUsd} size={0.6} className="text-white" />
                      </div>
                      <div>
                        <h4 className="font-mono font-semibold text-white">{currency}</h4>
                        <p className="text-xs text-white/60">{currencyInfo?.name || currency}</p>
                      </div>
                    </div>
                    <div className={`inline-block ${performance >= 0 ? 'bg-emerald-500/20 border-emerald-400/30' : 'bg-red-500/20 border-red-400/30'} border rounded-full px-2 py-1 text-xs text-white/80`}>
                      <Icon path={performance >= 0 ? mdiTrendingUp : mdiTrendingDown} size={0.4} className="inline mr-1" />
                      {performance.toFixed(2)}%
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-white/60 mb-1">Exchange Rate</p>
                      <p className="text-xl font-bold text-teal-300">{data.rate.toFixed(4)}</p>
                      <p className="text-xs text-white/60">1 {baseCurrency} = {data.rate.toFixed(4)} {currency}</p>
                    </div>

                    <div>
                      <p className="text-sm text-white/60 mb-2 flex items-center gap-1">
                        <Icon path={mdiChartLine} size={0.5} />
                        30-Day Trend
                      </p>
                      <Sparkline data={data.historical} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Custom Currency Pairs</h3>
            <div className="inline-block bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-3 py-1 text-xs text-white/80">
              <Icon path={mdiStarOutline} size={0.5} className="inline mr-1" />
              {userRates.length} Added
            </div>
          </div>
          <p className="text-sm text-white/60 mb-6">Add custom currency pairs to your watchlist.</p>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="from-currency-user" className="text-sm font-medium text-white flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${getCurrencyColor(fromCurrency)}`}></div>
                  From Currency
                </Label>
                <Select value={fromCurrency} onValueChange={setFromCurrency}>
                  <SelectTrigger id="from-currency-user" className="h-12 rounded-lg bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent className="bg-teal-800/90 border-teal-400/30">
                    {popularCurrencies.map(currency => (
                      <SelectItem key={currency.code} value={currency.code} className="text-white hover:bg-white/10">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${currency.color}`}></div>
                          <span className="font-mono">{currency.code}</span>
                          <span className="text-white/60">- {currency.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="to-currency-user" className="text-sm font-medium text-white flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${getCurrencyColor(toCurrency)}`}></div>
                  To Currency
                </Label>
                <Select value={toCurrency} onValueChange={setToCurrency}>
                  <SelectTrigger id="to-currency-user" className="h-12 rounded-lg bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent className="bg-teal-800/90 border-teal-400/30">
                    {popularCurrencies.map(currency => (
                      <SelectItem key={currency.code} value={currency.code} className="text-white hover:bg-white/10">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${currency.color}`}></div>
                          <span className="font-mono">{currency.code}</span>
                          <span className="text-white/60">- {currency.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleAddRate}
                className="h-12 bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600 transition-all shadow-sm hover:shadow-md hover:scale-105 flex items-center gap-2"
                disabled={!fromCurrency || !toCurrency || fromCurrency === toCurrency}
              >
                <Icon path={mdiPlusCircle} size={0.8} />
                Add Pair
              </Button>
            </div>
            
            {/* Custom Rates Grid */}
            {userRates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userRates.map((rate, index) => {
                  const fromCurrencyInfo = popularCurrencies.find(c => c.code === rate.from);
                  const toCurrencyInfo = popularCurrencies.find(c => c.code === rate.to);

                  return (
                    <div key={index} className="bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border border-teal-400/30 rounded-xl hover:shadow-md transition-all duration-200 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <div className={`w-4 h-4 rounded-full ${fromCurrencyInfo?.color || 'bg-gray-500'}`}></div>
                            <span className="font-mono font-semibold text-sm text-white">{rate.from}</span>
                          </div>
                          <Icon path={mdiSwapHorizontal} size={0.5} className="text-white/60" />
                          <div className="flex items-center gap-1">
                            <div className={`w-4 h-4 rounded-full ${toCurrencyInfo?.color || 'bg-gray-500'}`}></div>
                            <span className="font-mono font-semibold text-sm text-white">{rate.to}</span>
                          </div>
                        </div>
                        <div className="inline-block bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-2 py-1 text-xs text-white/80">
                          <Icon path={mdiStarOutline} size={0.4} className="inline mr-1" />
                          Custom
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-white/60 mb-1">Exchange Rate</p>
                        <p className="text-xl font-bold text-teal-300">{rate.rate.toFixed(4)}</p>
                        <p className="text-xs text-white/60">1 {rate.from} = {rate.rate.toFixed(4)} {rate.to}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-white/20 rounded-lg">
                <div className="p-4 bg-white/10 backdrop-blur-xl rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Icon path={mdiPlusCircle} size={1.5} className="text-white/60" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No Custom Pairs Added</h3>
                <p className="text-white/60 mb-4">Add currency pairs to your watchlist for quick access</p>
                <Button
                  onClick={() => fromCurrency && toCurrency && fromCurrency !== toCurrency && handleAddRate()}
                  variant="outline"
                  className="gap-2 border-white/20 text-white hover:bg-white/10"
                  disabled={!fromCurrency || !toCurrency || fromCurrency === toCurrency}
                >
                  <Icon path={mdiPlusCircle} size={0.6} />
                  Add Your First Pair
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatesTab;