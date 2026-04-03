import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Activity } from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';

interface CategoryBreakdown {
  category: string;
  emoji: string;
  amount: number;
  percentage: number;
  color: string;
}

interface ExpenseStats {
  totalSpent: number;
  transactionsCount: number;
  spendingByCategory: CategoryBreakdown[];
}

interface LanguageStats {
  lessonsCompleted: number; // Note: This is actually total exercises count
  wordsMastered: number;
}

const ExpenseLanguageSection: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Animated counters for Expense Tracker
  const [totalSpent, setTotalSpent] = useState(0);
  const [transactions, setTransactions] = useState(0);
  const [categoryData, setCategoryData] = useState<Array<{category: string; amount: number; color: string}>>([]);

  // Animated counters for Language Learner
  const [exercisesCount, setExercisesCount] = useState(0);
  const [wordsLearned, setWordsLearned] = useState(0);

  // Loading states
  const [isLoadingExpense, setIsLoadingExpense] = useState(true);
  const [isLoadingLanguage, setIsLoadingLanguage] = useState(true);

  // Fetch data from APIs
  useEffect(() => {
    const fetchExpenseStats = async () => {
      try {
        const data: ExpenseStats = await api.request('/landing/public/expense-stats');

        // Set targets for animation
        animateNumbers(
          data.totalSpent || 0,
          data.transactionsCount || 0,
          0,
          0
        );

        // Set category data with emoji included in category name
        const categories = data.spendingByCategory || [];
        const formattedCategories = categories.map(cat => ({
          category: `${cat.emoji} ${cat.category}`,
          amount: cat.amount,
          color: cat.color
        }));
        setCategoryData(formattedCategories);
        setIsLoadingExpense(false);
      } catch (error) {
        console.error('Error fetching expense stats:', error);
        // Fallback to default data
        setFallbackExpenseData();
      }
    };

    const fetchLanguageStats = async () => {
      try {
        const data: LanguageStats = await api.request('/landing/public/language-stats');

        // Set targets for animation (lessonsCompleted is actually exercises count)
        animateNumbers(
          0,
          0,
          data.lessonsCompleted || 0, // This is exercises count
          data.wordsMastered || 0
        );
        setIsLoadingLanguage(false);
      } catch (error) {
        console.error('Error fetching language stats:', error);
        // Fallback to default data
        setFallbackLanguageData();
      }
    };

    fetchExpenseStats();
    fetchLanguageStats();
  }, []);

  // Animation function
  const animateNumbers = (
    spentTarget: number,
    transactionsTarget: number,
    exercisesTarget: number,
    wordsTarget: number
  ) => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      // Expense Tracker
      if (spentTarget > 0 || transactionsTarget > 0) {
        setTotalSpent(spentTarget * progress);
        setTransactions(Math.floor(transactionsTarget * progress));
      }

      // Language Learner
      if (exercisesTarget > 0 || wordsTarget > 0) {
        setExercisesCount(Math.floor(exercisesTarget * progress));
        setWordsLearned(Math.floor(wordsTarget * progress));
      }

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  };

  // Fallback data if API fails
  const setFallbackExpenseData = () => {
    const pieChartColors = ['#47bdff', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7'];
    const fallbackData = [
      { category: '🍔 Food', amount: 1250.50, color: pieChartColors[0] },
      { category: '🚗 Transport', amount: 850.20, color: pieChartColors[1] },
      { category: '🏠 Home', amount: 650.30, color: pieChartColors[2] },
      { category: '🎬 Entertainment', amount: 456.50, color: pieChartColors[3] },
      { category: '🛍️ Shopping', amount: 249.00, color: pieChartColors[4] },
    ];
    setCategoryData(fallbackData);
    animateNumbers(3456.50, 127, 0, 0);
    setIsLoadingExpense(false);
  };

  const setFallbackLanguageData = () => {
    animateNumbers(0, 0, 234, 892);
    setIsLoadingLanguage(false);
  };

  // Handle navigation for authenticated and non-authenticated users
  const handleExpenseClick = () => {
    if (isAuthenticated) {
      navigate('/expense-tracker');
    } else {
      navigate('/login');
    }
  };

  const handleLanguageClick = () => {
    if (isAuthenticated) {
      navigate('/language-learner/dashboard');
    } else {
      navigate('/login');
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <motion.section
      className="relative py-12 sm:py-16 md:py-20 lg:py-32 overflow-hidden bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900"
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
        <motion.div className="text-center mb-8 sm:mb-12" variants={cardVariants}>
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-4 sm:mb-6">
            <Activity className="h-4 w-4 text-teal-400" />
            <span className="text-xs sm:text-sm font-medium text-white">
              Manage Your Life Smarter
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 px-4">
            <span className="text-white">Finance & Learning</span>
            <span className="text-teal-400"> Combined</span>
          </h2>

          <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto px-4">
            Track your expenses and learn new languages - all in one powerful platform
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
          {/* Left: Expense Tracker */}
          <motion.div variants={cardVariants} className="flex">
            <Card className="overflow-hidden border border-white/20 shadow-xl h-full w-full bg-white/10 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg">
                    <span className="text-4xl">💰</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Expense Tracker</h3>
                    <p className="text-sm text-white/60">Smart money management</p>
                  </div>
                </div>

                {/* Stats Grid - 2 Key Metrics */}
                <div className="flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {/* Total Spent */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="p-4 rounded-xl bg-white/10 backdrop-blur-sm shadow-md hover:shadow-lg transition-all border border-white/20"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">💸</span>
                      <span className="text-xs font-medium text-white/70">Total Spent</span>
                    </div>
                    <p className="text-3xl font-bold text-orange-400">
                      ${totalSpent.toFixed(2)}
                    </p>
                    <p className="text-xs text-white/50 mt-1">This month</p>
                  </motion.div>

                  {/* Transactions */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="p-4 rounded-xl bg-white/10 backdrop-blur-sm shadow-md hover:shadow-lg transition-all border border-white/20"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">📝</span>
                      <span className="text-xs font-medium text-white/70">Transactions</span>
                    </div>
                    <p className="text-3xl font-bold text-cyan-400">
                      {transactions}
                    </p>
                    <p className="text-xs text-white/50 mt-1">This month</p>
                  </motion.div>
                </div>

                {/* Spending by Category - Pie Chart */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="p-4 rounded-xl bg-white/10 backdrop-blur-sm shadow-md hover:shadow-lg transition-all border border-white/20 mb-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">📊</span>
                    <span className="text-sm font-medium text-white/70">Spending by Category</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Pie Chart - Left */}
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={30}
                            outerRadius={60}
                            paddingAngle={2}
                            dataKey="amount"
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: number) => [`$${value.toFixed(2)}`]}
                            contentStyle={{
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              fontSize: '12px'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Category Legend - Right */}
                    <div className="flex flex-col justify-center space-y-2">
                      {categoryData.map((item) => {
                        const total = categoryData.reduce((sum, cat) => sum + cat.amount, 0);
                        const percentage = (item.amount / total) * 100;
                        return (
                          <div key={item.category} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: item.color }}
                              />
                              <span className="text-white/80">{item.category}</span>
                            </div>
                            <span className="font-semibold text-white/60">
                              {percentage.toFixed(0)}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
                </div>

                {/* CTA Button */}
                <Button
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all mt-auto"
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate('/login');
                    } else {
                      navigate('/expense-tracker');
                    }
                  }}
                >
                  <span className="mr-2 text-xl">💰</span>
                  {isAuthenticated ? 'Go to Expense Tracker' : 'Start Expense Tracking'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right: Language Learner */}
          <motion.div variants={cardVariants} className="flex">
            <Card className="overflow-hidden border border-white/20 shadow-xl h-full w-full bg-white/10 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg">
                    <span className="text-4xl">🌍</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Language Learner</h3>
                    <p className="text-sm text-white/60">Master new languages</p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="space-y-4 mb-6 flex-1">
                  {/* Popular Languages - 2 Line Grid */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="p-4 rounded-xl bg-white/10 backdrop-blur-sm shadow-md hover:shadow-lg transition-all border border-white/20"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">🌐</span>
                      <span className="text-sm font-medium text-white/70">Popular Languages</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { flag: '🇪🇸', name: 'Spanish', color: 'bg-blue-500/20 border-blue-500/30' },
                        { flag: '🇫🇷', name: 'French', color: 'bg-red-500/20 border-red-500/30' },
                        { flag: '🇩🇪', name: 'German', color: 'bg-yellow-500/20 border-yellow-500/30' },
                        { flag: '🇯🇵', name: 'Japanese', color: 'bg-teal-500/20 border-teal-500/30' },
                        { flag: '🇮🇹', name: 'Italian', color: 'bg-green-500/20 border-green-500/30' },
                        { flag: '🇰🇷', name: 'Korean', color: 'bg-orange-500/20 border-orange-500/30' },
                        { flag: '🇨🇳', name: 'Chinese', color: 'bg-pink-500/20 border-pink-500/30' },
                        { flag: '🇵🇹', name: 'Portuguese', color: 'bg-cyan-500/20 border-cyan-500/30' },
                      ].map((lang, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20, scale: 0.8 }}
                          whileInView={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{
                            delay: 0.1 + (index * 0.05),
                            duration: 0.3,
                            ease: "easeOut"
                          }}
                          whileHover={{ scale: 1.1, y: -5 }}
                          whileTap={{ scale: 0.95 }}
                          className={`flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-lg ${lang.color} border cursor-pointer`}
                        >
                          <motion.span
                            className="text-2xl"
                            animate={{
                              rotate: [0, -10, 10, -10, 0],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              repeatDelay: 3,
                              ease: "easeInOut"
                            }}
                          >
                            {lang.flag}
                          </motion.span>
                          <span className="text-xs font-semibold text-white/80 text-center">{lang.name}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    {/* Exercises Available */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="p-4 rounded-xl bg-white/10 backdrop-blur-sm shadow-md hover:shadow-lg transition-all border border-white/20"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">📚</span>
                        <span className="text-xs font-medium text-white/70">Exercises</span>
                      </div>
                      <p className="text-3xl font-bold text-indigo-400">{exercisesCount.toLocaleString()}</p>
                      <p className="text-xs text-white/50 mt-1">Available</p>
                    </motion.div>

                    {/* Words Learned */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className="p-4 rounded-xl bg-white/10 backdrop-blur-sm shadow-md hover:shadow-lg transition-all border border-white/20"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">📝</span>
                        <span className="text-xs font-medium text-white/70">Vocabulary</span>
                      </div>
                      <p className="text-3xl font-bold text-pink-400">{wordsLearned.toLocaleString()}</p>
                      <p className="text-xs text-white/50 mt-1">Words mastered</p>
                    </motion.div>
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  className="w-full bg-gradient-to-r from-teal-600 to-indigo-600 text-white py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all mt-auto"
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate('/login');
                    } else {
                      navigate('/language-learner');
                    }
                  }}
                >
                  <span className="mr-2 text-xl">🌍</span>
                  {isAuthenticated ? 'Go to Language Learner' : 'Start Learning Languages'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          variants={cardVariants}
          className="text-center"
        >
          <Card className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg">
            <CardContent className="p-6">
              <p className="text-white/80 mb-4">
                Join thousands of users managing finances and learning languages effectively
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  size="lg"
                  className="bg-green-500/10 border border-green-400 text-green-400 hover:scale-105 transition-all duration-200"
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate('/login');
                    } else {
                      navigate('/expense-tracker');
                    }
                  }}
                >
                  💰 {isAuthenticated ? 'Go to Expense Tracker' : 'Explore Expense Tracker'}
                </Button>
                <Button
                  size="lg"
                  className="bg-teal-500/10 border border-teal-400 text-teal-400 hover:scale-105 transition-all duration-200"
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate('/login');
                    } else {
                      navigate('/language-learner');
                    }
                  }}
                >
                  🌍 {isAuthenticated ? 'Go to Language Learner' : 'Explore Language Learner'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default ExpenseLanguageSection;
