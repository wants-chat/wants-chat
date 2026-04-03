import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import Icon from '@mdi/react';
import { 
  mdiChartLineVariant,
  mdiCalendarRange,
  mdiTrendingUp,
  mdiTrendingDown,
  mdiCurrencyUsd,
  mdiClockOutline,
  mdiChartTimelineVariant,
  mdiSwapHorizontal,
  mdiEye,
  mdiChartLine
} from '@mdi/js';

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

const ChartsTab: React.FC = () => {
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [timeFrame, setTimeFrame] = useState('1W');
  const [currentRate, setCurrentRate] = useState<number | null>(null);
  const [performance, setPerformance] = useState<number | null>(null);

  const fetchChartData = async (from: string, to: string, startDate: Date, endDate: Date) => {
    setIsLoading(true);
    try {
      const start = startDate.toISOString().split('T')[0];
      const end = endDate.toISOString().split('T')[0];
      const response = await axios.get(`https://api.frankfurter.app/${start}..${end}?from=${from}&to=${to}`);
      const rates = response.data.rates;
      const formattedData = Object.entries(rates).map(([date, value]: [string, any]) => ({
        date,
        rate: value[to],
      }));
      setChartData(formattedData);

      if (formattedData.length > 0) {
        const firstRate = formattedData[0].rate;
        const lastRate = formattedData[formattedData.length - 1].rate;
        setCurrentRate(lastRate);
        setPerformance(((lastRate - firstRate) / firstRate) * 100);
      }

    } catch (error) {
      console.error("Error fetching chart data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeFrameChange = (newTimeFrame: string) => {
    setTimeFrame(newTimeFrame);
    const endDate = new Date();
    const startDate = new Date();

    switch (newTimeFrame) {
      case '12H':
        startDate.setHours(endDate.getHours() - 12);
        break;
      case '1D':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case '1W':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '1M':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case '1Y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      case '2Y':
        startDate.setFullYear(endDate.getFullYear() - 2);
        break;
      case '5Y':
        startDate.setFullYear(endDate.getFullYear() - 5);
        break;
    }

    fetchChartData(fromCurrency, toCurrency, startDate, endDate);
  };

  const handleViewChart = () => {
    handleTimeFrameChange(timeFrame);
  };

  useEffect(() => {
    handleViewChart();
  }, []);

  const formatXAxisTick = (tickItem: string) => {
    if (timeFrame === '12H' || timeFrame === '1D') {
      return format(new Date(tickItem), 'HH:mm');
    } else {
      return format(new Date(tickItem), 'MMM dd');
    }
  };

  const getCurrencyColor = (code: string) => {
    const currency = popularCurrencies.find(c => c.code === code);
    return currency?.color || 'bg-gradient-to-br from-gray-500 to-gray-600';
  };

  const getTimeFrameColor = (tf: string) => {
    const colors = {
      '12H': 'bg-gradient-to-br from-red-500 to-red-600',
      '1D': 'bg-gradient-to-br from-orange-500 to-orange-600',
      '1W': 'bg-gradient-to-br from-yellow-500 to-yellow-600',
      '1M': 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      '1Y': 'bg-gradient-to-br from-blue-500 to-blue-600',
      '2Y': 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      '5Y': 'bg-gradient-to-br from-purple-500 to-purple-600',
    };
    return colors[tf as keyof typeof colors] || 'bg-gradient-to-br from-gray-500 to-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white/10 backdrop-blur-xl p-6 rounded-xl border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg">
                <Icon path={mdiChartLineVariant} size={1.2} className="text-white" />
              </div>
              Currency Charts
            </h1>
            <p className="text-sm text-white/60 mt-1">
              Visualize historical exchange rates and market trends
            </p>
          </div>
          {performance !== null && (
            <div className="text-center">
              <div className={`text-2xl font-bold ${performance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {performance.toFixed(2)}%
              </div>
              <div className="text-xs text-white/60">Performance</div>
              <div className={`inline-block ${performance >= 0 ? 'bg-emerald-500/20 border-emerald-400/30' : 'bg-red-500/20 border-red-400/30'} border rounded-full px-2 py-1 text-xs text-white/80 mt-1`}>
                <Icon path={performance >= 0 ? mdiTrendingUp : mdiTrendingDown} size={0.4} className="inline mr-1" />
                {timeFrame}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Chart Configuration</h3>
            <div className="inline-block bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-3 py-1 text-xs text-white/80">
              <Icon path={mdiCalendarRange} size={0.5} className="inline mr-1" />
              Historical Data
            </div>
          </div>
          <p className="text-sm text-white/60 mb-6">Configure your currency pair and time frame for chart analysis.</p>
          <div className="space-y-6">
            {/* Currency Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="from-currency-chart" className="text-sm font-medium text-white flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${getCurrencyColor(fromCurrency)}`}></div>
                  From Currency
                </Label>
                <Select value={fromCurrency} onValueChange={setFromCurrency}>
                  <SelectTrigger id="from-currency-chart" className="h-12 rounded-lg bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select base currency" />
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

              <div className="space-y-3">
                <Label htmlFor="to-currency-chart" className="text-sm font-medium text-white flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${getCurrencyColor(toCurrency)}`}></div>
                  To Currency
                </Label>
                <Select value={toCurrency} onValueChange={setToCurrency}>
                  <SelectTrigger id="to-currency-chart" className="h-12 rounded-lg bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select target currency" />
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
            </div>

            {/* Time Frame Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-white flex items-center gap-2">
                <Icon path={mdiCalendarRange} size={0.6} className="text-teal-400" />
                Time Frame
              </Label>
              <div className="flex flex-wrap gap-2">
                {['12H', '1D', '1W', '1M', '1Y', '2Y', '5Y'].map(tf => (
                  <button
                    key={tf}
                    onClick={() => setTimeFrame(tf)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
                      timeFrame === tf
                        ? `text-white shadow-lg ${getTimeFrameColor(tf)}`
                        : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white border border-white/20'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* View Chart Button */}
            <div className="flex justify-center pt-2">
              <Button
                onClick={handleViewChart}
                className="px-8 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 h-12 rounded-lg font-medium transition-all shadow-sm hover:shadow-md hover:scale-105 flex items-center gap-2 text-white"
                disabled={isLoading}
              >
                <Icon path={mdiEye} size={0.8} />
                {isLoading ? 'Loading Chart...' : 'View Chart'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Display */}
      {chartData.length > 0 && (
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className={`w-6 h-6 rounded-full ${getCurrencyColor(fromCurrency)}`}></div>
                  <span className="font-mono font-semibold text-white">{fromCurrency}</span>
                </div>
                <Icon path={mdiSwapHorizontal} size={0.8} className="text-white/60" />
                <div className="flex items-center gap-1">
                  <div className={`w-6 h-6 rounded-full ${getCurrencyColor(toCurrency)}`}></div>
                  <span className="font-mono font-semibold text-white">{toCurrency}</span>
                </div>
                <span className="text-lg font-semibold text-white">Chart</span>
              </div>

              <div className="flex items-center gap-4">
                {performance !== null && (
                  <div className={`inline-block ${performance >= 0 ? 'bg-emerald-500/20 border-emerald-400/30' : 'bg-red-500/20 border-red-400/30'} border rounded-full px-3 py-1 text-sm text-white/80`}>
                    <Icon path={performance >= 0 ? mdiTrendingUp : mdiTrendingDown} size={0.4} className="inline mr-1" />
                    {performance.toFixed(2)}%
                  </div>
                )}
                <div className="inline-block bg-white/10 border border-white/20 rounded-full px-3 py-1 text-sm text-white/80">
                  <Icon path={mdiChartLine} size={0.4} className="inline mr-1" />
                  {timeFrame}
                </div>
              </div>
            </div>

            {currentRate && (
              <p className="flex items-center gap-2 text-white/60 mt-2">
                <Icon path={mdiCurrencyUsd} size={0.5} className="text-teal-400" />
                Current Rate: <span className="font-bold text-teal-300">{currentRate.toFixed(4)}</span> as of {new Date().toLocaleString()}
                <Icon path={mdiClockOutline} size={0.4} className="text-white/40 ml-2" />
              </p>
            )}
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {/* Chart Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon path={mdiTrendingUp} size={0.6} className="text-blue-400" />
                    <span className="text-sm font-medium text-white/80">Current</span>
                  </div>
                  <p className="text-lg font-bold text-blue-300">{currentRate?.toFixed(4) || 'N/A'}</p>
                </div>

                <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon path={mdiChartTimelineVariant} size={0.6} className="text-emerald-400" />
                    <span className="text-sm font-medium text-white/80">High</span>
                  </div>
                  <p className="text-lg font-bold text-emerald-300">
                    {chartData.length > 0 ? Math.max(...chartData.map(d => d.rate)).toFixed(4) : 'N/A'}
                  </p>
                </div>

                <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon path={mdiTrendingDown} size={0.6} className="text-red-400" />
                    <span className="text-sm font-medium text-white/80">Low</span>
                  </div>
                  <p className="text-lg font-bold text-red-300">
                    {chartData.length > 0 ? Math.min(...chartData.map(d => d.rate)).toFixed(4) : 'N/A'}
                  </p>
                </div>

                <div className="bg-purple-500/20 border border-purple-400/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon path={mdiChartLine} size={0.6} className="text-purple-400" />
                    <span className="text-sm font-medium text-white/80">Average</span>
                  </div>
                  <p className="text-lg font-bold text-purple-300">
                    {chartData.length > 0 ? (chartData.reduce((sum, d) => sum + d.rate, 0) / chartData.length).toFixed(4) : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Main Chart */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={chartData}>
                    <defs>
                      <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatXAxisTick}
                      stroke="rgba(255,255,255,0.6)"
                      fontSize={12}
                      tick={{ fill: 'rgba(255,255,255,0.6)' }}
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.6)"
                      fontSize={12}
                      tick={{ fill: 'rgba(255,255,255,0.6)' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.8)' }} />
                    <Line
                      type="monotone"
                      dataKey="rate"
                      stroke="#2dd4bf"
                      strokeWidth={2}
                      fill="url(#colorRate)"
                      dot={false}
                      name={`${fromCurrency}/${toCurrency} Rate`}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Loading State */}
      {isLoading && (
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
          <div className="p-12">
            <div className="text-center">
              <div className="p-4 bg-teal-500/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-400"></div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Loading Chart Data</h3>
              <p className="text-white/60">Fetching {fromCurrency}/{toCurrency} rates for {timeFrame}...</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Empty State */}
      {!isLoading && chartData.length === 0 && (
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
          <div className="p-12">
            <div className="text-center">
              <div className="p-4 bg-white/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Icon path={mdiChartLineVariant} size={1.5} className="text-white/60" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No Chart Data</h3>
              <p className="text-white/60 mb-4">Select currencies and click "View Chart" to display historical data</p>
              <Button
                onClick={handleViewChart}
                className="gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
              >
                <Icon path={mdiEye} size={0.6} />
                Load Chart Data
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartsTab;