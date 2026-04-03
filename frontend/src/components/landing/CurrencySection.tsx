import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import Icon from '@mdi/react';
import { mdiSwapVertical } from '@mdi/js';
import { MonetizationOn } from '@mui/icons-material';
import QuickTodoForm from './QuickTodoForm';
import { api } from '../../lib/api';

// Common currencies
const commonCurrencies = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'BDT', name: 'Bangladeshi Taka' },
];

const CurrencySection: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [amount, setAmount] = useState<number>(100);
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('EUR');
  const [convertedAmount, setConvertedAmount] = useState<number>(0);
  const [isSwapping, setIsSwapping] = useState(false);

  const [currentRate, setCurrentRate] = useState<number>(0);

  // Fetch and calculate conversion using centralized API client
  useEffect(() => {
    const fetchRate = async () => {
      try {
        // Use the centralized API client method for external Frankfurter API
        const response = await api.getCurrencyRates({
          base_currency: fromCurrency,
          currencies: [toCurrency]
        });

        // Extract the rate from the standardized response
        const rateData = response.data.find(r => r.code === toCurrency);
        if (rateData) {
          const rate = rateData.rate;
          setCurrentRate(rate);
          setConvertedAmount(amount * rate);
        }
      } catch (error) {
        console.error('Error fetching currency rate:', error);
      }
    };

    if (fromCurrency && toCurrency && amount) {
      fetchRate();
    }
  }, [amount, fromCurrency, toCurrency]);

  const handleSwapCurrencies = () => {
    setIsSwapping(true);
    setTimeout(() => {
      const temp = fromCurrency;
      setFromCurrency(toCurrency);
      setToCurrency(temp);
      setIsSwapping(false);
    }, 300);
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <motion.section
      className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.2 }}
      variants={sectionVariants}
    >
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-[120px]"
        animate={{ x: [0, -50, 0], y: [0, 50, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-500/20 rounded-full blur-[120px]"
        animate={{ x: [0, 50, 0], y: [0, -30, 0], scale: [1, 1.3, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
          variants={cardVariants}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
            <MonetizationOn className="h-4 w-4 text-teal-400" />
            <span className="text-sm font-medium text-white">Quick Tools</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Manage Your
            <span className="text-primary"> Finances & Tasks</span>
          </h2>

          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Convert currencies and track your daily tasks in one place
          </p>
        </motion.div>

        {/* Two Column Layout */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column - Currency Converter */}
          <motion.div variants={cardVariants}>
            <Card className="shadow-lg border border-white/20 bg-white/10 overflow-hidden backdrop-blur-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/20">
                <div>
                  <CardTitle className="text-lg font-bold text-white">Currency Converter</CardTitle>
                  <p className="text-xs text-white/60 mt-0.5">Real-time exchange rates</p>
                </div>
                <motion.button
                  className="text-xs text-teal-400 font-semibold flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate('/login');
                    } else {
                      navigate('/currency-exchange');
                    }
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View More →
                </motion.button>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {/* Amount Input */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="text-xs font-semibold text-white/80 mb-1.5 block">
                    From
                  </label>
                  <div className="relative bg-white/10 backdrop-blur-sm rounded-lg p-3 shadow-sm border border-white/20">
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="h-8 pr-24 text-xl font-bold border-0 bg-transparent focus:ring-0 focus:outline-none p-0 text-white"
                      placeholder="100"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
                      <Select value={fromCurrency} onValueChange={setFromCurrency}>
                        <SelectTrigger className="h-9 w-32 text-xs font-bold border-0 bg-teal-500/30 text-teal-300 rounded-lg shadow-sm hover:shadow-md transition-all hover:scale-105">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border border-teal-400/30 shadow-2xl bg-teal-800/90 backdrop-blur-xl p-2 min-w-[280px]">
                          <div className="text-xs font-semibold text-white/60 px-3 py-2 mb-1">
                            Select Currency
                          </div>
                          {commonCurrencies.map((currency, index) => (
                            <SelectItem
                              key={currency.code}
                              value={currency.code}
                              className="rounded-xl my-1 cursor-pointer hover:bg-white/10 focus:bg-white/10 data-[state=checked]:bg-teal-500/20 transition-all text-white"
                            >
                              <div className="flex items-center justify-between gap-4 py-2">
                                <span className="font-bold text-sm">{currency.code}</span>
                                {fromCurrency === currency.code && (
                                  <div className="w-2 h-2 rounded-full bg-teal-400"></div>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </motion.div>

                {/* Swap Icon */}
                <div className="flex justify-center -my-1">
                  <motion.button
                    onClick={handleSwapCurrencies}
                    className="p-2 rounded-full bg-white/10 backdrop-blur-sm shadow-md hover:shadow-lg transition-all border border-white/20"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    animate={{ rotate: isSwapping ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Icon path={mdiSwapVertical} size={0.7} className="text-teal-400" />
                  </motion.button>
                </div>

                {/* Converted Amount Display */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <label className="text-xs font-semibold text-white/80 mb-1.5 block">
                    To
                  </label>
                  <div className="relative bg-teal-500/10 backdrop-blur-sm rounded-lg p-3 shadow-sm border border-teal-500/30">
                    <motion.div
                      className="text-xl font-bold text-teal-400 h-8 flex items-center"
                      key={convertedAmount}
                      initial={{ scale: 1.1, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {convertedAmount.toFixed(2)}
                    </motion.div>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
                      <Select value={toCurrency} onValueChange={setToCurrency}>
                        <SelectTrigger className="h-9 w-32 text-xs font-bold border-0 bg-teal-500/30 text-teal-300 rounded-lg shadow-sm hover:shadow-md transition-all hover:scale-105">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border border-teal-400/30 shadow-2xl bg-teal-800/90 backdrop-blur-xl p-2 min-w-[280px]">
                          <div className="text-xs font-semibold text-white/60 px-3 py-2 mb-1">
                            Select Currency
                          </div>
                          {commonCurrencies.map((currency, index) => (
                            <SelectItem
                              key={currency.code}
                              value={currency.code}
                              className="rounded-xl my-1 cursor-pointer hover:bg-white/10 focus:bg-white/10 data-[state=checked]:bg-teal-500/20 transition-all text-white"
                            >
                              <div className="flex items-center justify-between gap-4 py-2">
                                <span className="font-bold text-sm">{currency.code}</span>
                                {toCurrency === currency.code && (
                                  <div className="w-2 h-2 rounded-full bg-teal-400"></div>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </motion.div>

                {/* Exchange Rate */}
                {currentRate && (
                  <motion.div
                    className="flex items-center justify-center gap-2 text-xs bg-white/10 backdrop-blur-sm rounded-lg py-2 px-3 border border-white/10"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    key={`${fromCurrency}-${toCurrency}`}
                  >
                    <span className="text-white/60">Exchange Rate:</span>
                    <motion.span
                      className="font-bold text-white"
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      1 {fromCurrency} = {currentRate.toFixed(4)} {toCurrency}
                    </motion.span>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column - Todo List */}
          <motion.div variants={cardVariants}>
            <QuickTodoForm />
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default CurrencySection;
