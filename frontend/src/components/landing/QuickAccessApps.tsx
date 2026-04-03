import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '@mdi/react';
import {
  mdiArrowRight
} from '@mdi/js';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TranslateIcon from '@mui/icons-material/Translate';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import ChecklistIcon from '@mui/icons-material/Checklist';
import ArticleIcon from '@mui/icons-material/Article';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const QuickAccessApps: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = [
    { 
      id: 'fitness', 
      name: 'Fitness', 
      icon: FitnessCenterIcon, 
      color: 'from-orange-500 to-red-500',
      description: 'Physical wellness and training'
    },
    { 
      id: 'health', 
      name: 'Health', 
      icon: LocalHospitalIcon, 
      color: 'from-blue-500 to-cyan-500',
      description: 'Medical care and nutrition'
    },
    { 
      id: 'travel', 
      name: 'Travel', 
      icon: FlightTakeoffIcon, 
      color: 'from-indigo-500 to-teal-500',
      description: 'Trip planning'
    },
    { 
      id: 'finance', 
      name: 'Finance', 
      icon: AccountBalanceWalletIcon, 
      color: 'from-green-500 to-emerald-500',
      description: 'Money management'
    },
    { 
      id: 'learning', 
      name: 'Learning', 
      icon: TranslateIcon, 
      color: 'from-yellow-500 to-orange-500',
      description: 'Education'
    },
    { 
      id: 'tools', 
      name: 'Tools', 
      icon: ChecklistIcon, 
      color: 'from-pink-500 to-rose-500',
      description: 'Productivity'
    },
    { 
      id: 'publication', 
      name: 'Publication', 
      icon: ArticleIcon, 
      color: 'from-cyan-500 to-teal-500',
      description: 'Content creation'
    }
  ];

  const apps = [
    {
      id: 'meditation',
      title: 'Meditation',
      description: 'Practice mindfulness and reduce stress with guided sessions',
      category: 'fitness',
      status: 'Available',
      icon: SelfImprovementIcon,
      color: 'from-teal-500 to-pink-500',
      route: '/meditation'
    },
    {
      id: 'workout',
      title: 'Workout',
      description: 'Track workouts and create custom fitness plans',
      category: 'fitness',
      status: 'Available',
      icon: DirectionsRunIcon,
      color: 'from-orange-500 to-red-500',
      route: '/fitness'
    },
    {
      id: 'calories',
      title: 'Calories Tracker',
      description: 'Monitor nutrition, log meals, and track macros',
      category: 'health',
      status: 'Available',
      icon: RestaurantIcon,
      color: 'from-green-500 to-emerald-500',
      route: '/calories-tracker'
    },
    {
      id: 'health',
      title: 'Health Tracker',
      description: 'Manage medical records and track vital signs',
      category: 'health',
      status: 'Available',
      icon: LocalHospitalIcon,
      color: 'from-blue-500 to-cyan-500',
      route: '/health'
    },
    {
      id: 'travel',
      title: 'Travel Planner',
      description: 'AI-powered travel planning with smart recommendations',
      category: 'travel',
      status: 'Available',
      icon: FlightTakeoffIcon,
      color: 'from-indigo-500 to-teal-500',
      route: '/travel-planner'
    },
    {
      id: 'expense',
      title: 'Expense Tracker',
      description: 'Track spending, create budgets, and manage finances',
      category: 'finance',
      status: 'Available',
      icon: AccountBalanceWalletIcon,
      color: 'from-emerald-500 to-teal-500',
      route: '/expense-tracker'
    },
    {
      id: 'language',
      title: 'Language',
      description: 'Learn new languages with interactive lessons',
      category: 'learning',
      status: 'Coming Soon',
      icon: TranslateIcon,
      color: 'from-yellow-500 to-orange-500',
      route: '/language'
    },
    {
      id: 'habits',
      title: 'Habit Tracker',
      description: 'Build positive habits and track daily progress',
      category: 'tools',
      status: 'Coming Soon',
      icon: TrackChangesIcon,
      color: 'from-pink-500 to-rose-500',
      route: '/habits'
    },
    {
      id: 'currency',
      title: 'Currency Converter',
      description: 'Real-time currency conversion and exchange rates',
      category: 'finance',
      status: 'Coming Soon',
      icon: CurrencyExchangeIcon,
      color: 'from-teal-500 to-cyan-500',
      route: '/currency'
    },
    {
      id: 'todo',
      title: 'Todo',
      description: 'Organize tasks, set priorities, and manage projects',
      category: 'tools',
      status: 'Coming Soon',
      icon: ChecklistIcon,
      color: 'from-cyan-500 to-blue-500',
      route: '/todo'
    },
    {
      id: 'blog',
      title: 'Blog',
      description: 'Share insights and engage with the community',
      category: 'publication',
      status: 'Available',
      icon: ArticleIcon,
      color: 'from-cyan-500 to-teal-500',
      route: '/blog'
    }
  ];

  const filteredApps = activeCategory === 'All' 
    ? apps 
    : apps.filter(app => app.category === activeCategory);

  const handleAppClick = (route: string, status: string) => {
    if (status === 'Available') {
      if (!isAuthenticated) {
        // Redirect to login if not authenticated
        navigate('/login');
      } else {
        // Navigate to the app if authenticated
        navigate(route);
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const
      }
    }
  };

  return (
    <motion.section
      id="quick-access"
      className="py-20 lg:py-32 relative overflow-hidden bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
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
          className="text-center mb-16"
          variants={cardVariants}
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
            <AutoAwesomeIcon className="h-5 w-5 text-teal-400" />
            <span className="text-sm font-semibold text-teal-400 tracking-wide">QUICK ACCESS APPS</span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white">
            Your Life Management
            <span className="text-teal-400"> Hub</span>
          </h2>

          <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
            Access all your essential life management tools through our beautifully organized, categorized interface.
          </p>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-12"
          variants={cardVariants}
        >
          <button
            onClick={() => setActiveCategory('All')}
            className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
              activeCategory === 'All'
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25'
                : 'bg-white/10 text-white/80 border border-white/20 hover:bg-white/20'
            }`}
          >
            All Apps
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeCategory === category.id
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25'
                  : 'bg-white/10 text-white/80 border border-white/20 hover:bg-white/20'
              }`}
            >
              <category.icon className="h-4 w-4" />
              {category.name}
            </button>
          ))}
        </motion.div>

        {/* Category Description */}
        {activeCategory !== 'All' && (
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {categories.map((category) =>
              activeCategory === category.id && (
                <div key={category.id} className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                  <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center`}>
                    <category.icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-white/80 font-medium">{category.description}</span>
                </div>
              )
            )}
          </motion.div>
        )}

        {/* Apps Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          variants={containerVariants}
          key={activeCategory}
        >
          {filteredApps.map((app, index) => (
            <motion.div
              key={app.id}
              variants={cardVariants}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ 
                y: -8,
                transition: { type: "spring", stiffness: 400, damping: 25 }
              }}
            >
              <div
                className={`group relative bg-white/10 backdrop-blur-xl rounded-2xl p-6 h-full
                  border border-white/20 hover:bg-white/15 hover:border-white/30
                  transition-all duration-500 cursor-pointer ${
                    app.status === 'Coming Soon' ? 'opacity-80' : ''
                  }`}
                onClick={() => handleAppClick(app.route, app.status)}
              >
                {/* Background Gradient */}
                <div className={`absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br ${app.color} opacity-10 rounded-full group-hover:opacity-20 transition-opacity duration-500`} />

                {/* Header with Icon and Badge */}
                <div className="flex justify-between items-start mb-4">
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${app.color} flex items-center justify-center shadow-lg shadow-black/20 group-hover:scale-110 transition-transform duration-300`}>
                    <app.icon className="h-6 w-6 text-white" />
                  </div>
                  <Badge
                    variant={app.status === 'Available' ? 'default' : 'secondary'}
                    className={`text-xs font-semibold ${
                      app.status === 'Available'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {app.status}
                  </Badge>
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold mb-2 text-white group-hover:text-teal-400 transition-colors duration-300">
                  {app.title}
                </h3>

                <p className="text-white/70 text-sm leading-relaxed mb-4">
                  {app.description}
                </p>

                {/* Action Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <span className={`text-sm font-semibold ${app.status === 'Available' ? 'text-teal-400' : 'text-white/40'}`}>
                    {app.status === 'Available' ? 'Open App' : 'Coming Soon'}
                  </span>
                  {app.status === 'Available' && (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-teal-500/20 group-hover:bg-teal-500 group-hover:scale-110 transition-all duration-300">
                      <Icon
                        path={mdiArrowRight}
                        size={0.6}
                        className="text-teal-400 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-300"
                      />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced CTA Section */}
        <motion.div
          className="mt-20 text-center bg-white/5 backdrop-blur-xl rounded-3xl p-12 border border-white/10"
          variants={cardVariants}
        >
          <h3 className="text-3xl font-bold mb-4 text-white">
            Start Your Journey Today
          </h3>
          <p className="text-white/70 mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
            Join thousands of users who have transformed their productivity and wellness with our comprehensive app suite.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="group font-semibold px-8 py-4 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 shadow-lg shadow-teal-500/25 hover:shadow-xl transition-all duration-300"
              onClick={() => navigate('/login')}
            >
              ✨ Get Started Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="font-semibold px-8 py-4 rounded-full border-2 border-white/20 text-white hover:bg-white/10 transition-all duration-300"
              onClick={() => navigate('/products')}
            >
              Explore Products
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>7 Apps Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-amber-500" />
              <span>4 Apps Coming Soon</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-cyan-500" />
              <span>Free Trial Available</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default QuickAccessApps;