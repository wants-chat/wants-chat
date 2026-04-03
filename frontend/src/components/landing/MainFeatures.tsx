import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import TranslateIcon from '@mui/icons-material/Translate';
import ArticleIcon from '@mui/icons-material/Article';

const MainFeatures: React.FC = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Real features based on actual project implementation
  const features = [
    {
      id: 'fitness-tracker',
      title: 'Fitness',
      category: 'Health & Fitness',
      description: 'Workout plans & tracking with comprehensive onboarding, dashboard, custom workout builder, and progress analytics.',
      icon: DirectionsRunIcon,
      color: 'from-orange-500 to-red-500',
      route: '/fitness',
      status: 'Available',
      routes: 8, // fitness, onboarding, dashboard, workout-plans, custom-plan, workout-session, progress, profile
      realFeatures: [
        'Smart Workout Plans (7-180 days)',
        'Live Workout Sessions',
        'Custom Exercise Builder',
        'Progress Analytics & BMI Tracking'
      ],
      stats: {
        workouts: 'Plans Available',
        sessions: 'Live Tracking',
        progress: 'Analytics',
        custom: 'Builder'
      }
    },
    {
      id: 'calories-tracker',
      title: 'Calories Tracker',
      category: 'Health & Nutrition',
      description: 'Nutrition & meal tracking with food database, meal planning, macro management, and intermittent fasting support.',
      icon: RestaurantIcon,
      color: 'from-green-500 to-emerald-500',
      route: '/calories-tracker',
      status: 'Available',
      routes: 9, // calories-tracker, onboarding, plan-selection, customization, dashboard, diary, fasting, progress, profile, food-search, log-food
      realFeatures: [
        'Food Database & Search',
        'Macro & Nutrient Tracking',
        'Intermittent Fasting Timer',
        'Water Intake Monitoring'
      ],
      stats: {
        database: 'Food Search',
        tracking: 'Macros',
        fasting: 'Timer',
        water: 'Monitor'
      }
    },
    {
      id: 'meditation',
      title: 'Meditation',
      category: 'Mental Wellness',
      description: 'Mindfulness & stress relief with interactive meditation wheel, guided sessions, and series tracking.',
      icon: SelfImprovementIcon,
      color: 'from-teal-500 to-pink-500',
      route: '/meditation',
      status: 'Available',
      routes: 6, // meditation, series, session, profile, player
      realFeatures: [
        'Circular Meditation Wheel Interface',
        'Guided Session Categories',
        'Breathing Exercise Library',
        'Meditation Streak Tracking'
      ],
      stats: {
        wheel: 'Interactive',
        sessions: 'Guided',
        series: 'Categories',
        streaks: 'Tracking'
      }
    },
    {
      id: 'health-tracker',
      title: 'Health Tracker',
      category: 'Medical & Wellness',
      description: 'Medical records & vitals with comprehensive health management, appointments, and specialized care tracking.',
      icon: LocalHospitalIcon,
      color: 'from-blue-500 to-cyan-500',
      route: '/health',
      status: 'Available',
      routes: 3, // health, medical-records
      realFeatures: [
        'Medical Records Management',
        'Vital Signs Tracking',
        'Prescription Management',
        'Appointment Scheduling'
      ],
      stats: {
        records: 'Medical',
        vitals: 'Tracking',
        appointments: 'Schedule',
        care: 'Specialized'
      }
    },
    {
      id: 'expense-tracker',
      title: 'Expense Tracker',
      category: 'Finance & Management',
      description: 'Budget & financial management with expense tracking, analytics, CSV export, and comprehensive reporting.',
      icon: AccountBalanceWalletIcon,
      color: 'from-emerald-500 to-teal-500',
      route: '/expense-tracker',
      status: 'Available',
      routes: 2, // expense-tracker, add-expense
      realFeatures: [
        'Multi-category Budget Management',
        'Advanced Analytics & Charts',
        'CSV Export & Reports',
        'Expense Search & Filtering'
      ],
      stats: {
        budgets: 'Management',
        analytics: 'Charts',
        export: 'CSV Reports',
        search: 'Filtering'
      }
    },
    {
      id: 'travel-planner',
      title: 'Travel Planner',
      category: 'Travel & Planning',
      description: 'AI-powered trip planning with interactive 3D globe interface and smart itinerary generation.',
      icon: FlightTakeoffIcon,
      color: 'from-indigo-500 to-teal-500',
      route: '/travel-planner',
      status: 'Available',
      routes: 2, // travel-planner, generate-travel-plan
      realFeatures: [
        'Interactive 3D Globe Interface',
        'AI-Generated Smart Itineraries',
        'Budget & Cost Planning',
        'Multi-destination Support'
      ],
      stats: {
        globe: '3D Interface',
        ai: 'Smart Plans',
        budget: 'Planning',
        destinations: 'Multi-stop'
      }
    },
    {
      id: 'recipe-builder',
      title: 'Recipe Builder',
      category: 'Health & Nutrition',
      description: 'Create and organize recipes with ingredient management, shopping lists, and meal planning.',
      icon: MenuBookIcon,
      color: 'from-yellow-500 to-orange-500',
      route: '/recipe-builder',
      status: 'Available',
      routes: 4,
      realFeatures: [
        'Custom Recipe Creator',
        'Ingredient Management',
        'Shopping List Generator',
        'Nutritional Information'
      ],
      stats: {
        recipes: 'Custom Creator',
        ingredients: 'Management',
        shopping: 'Lists',
        nutrition: 'Info'
      }
    },
    {
      id: 'currency-converter',
      title: 'Currency Converter',
      category: 'Finance & Money',
      description: 'Real-time currency exchange rates with multi-currency support and conversion history.',
      icon: CurrencyExchangeIcon,
      color: 'from-cyan-500 to-blue-500',
      route: '/currency-exchange',
      status: 'Available',
      routes: 1,
      realFeatures: [
        'Real-time Exchange Rates',
        'Multi-currency Support',
        'Conversion History',
        'Favorite Currencies'
      ],
      stats: {
        rates: 'Real-time',
        currencies: 'Multi-currency',
        history: 'Tracking',
        favorites: 'Quick Access'
      }
    },
    {
      id: 'habit-tracker',
      title: 'Habit Tracker',
      category: 'Productivity Tools',
      description: 'Build better habits with daily tracking, streaks, and progress analytics.',
      icon: TrackChangesIcon,
      color: 'from-pink-500 to-rose-500',
      route: '/habit-planner',
      status: 'Available',
      routes: 4,
      realFeatures: [
        'Daily Habit Tracking',
        'Streak Monitoring',
        'Progress Analytics',
        'Habit Calendar View'
      ],
      stats: {
        tracking: 'Daily',
        streaks: 'Monitoring',
        analytics: 'Progress',
        calendar: 'Visual'
      }
    },
    {
      id: 'todo-manager',
      title: 'Todo Manager',
      category: 'Productivity Tools',
      description: 'Task and project management with priorities, due dates, and completion tracking.',
      icon: CheckBoxIcon,
      color: 'from-cyan-500 to-teal-500',
      route: '/todo',
      status: 'Available',
      routes: 1,
      realFeatures: [
        'Task Organization',
        'Priority Management',
        'Due Date Tracking',
        'Completion Analytics'
      ],
      stats: {
        tasks: 'Organization',
        priority: 'Management',
        dates: 'Tracking',
        analytics: 'Completion'
      }
    },
    {
      id: 'language-learner',
      title: 'Language Learner',
      category: 'Travel & Learning',
      description: 'Interactive language learning with lessons, practice exercises, and progress tracking.',
      icon: TranslateIcon,
      color: 'from-sky-500 to-indigo-500',
      route: '/language-learner',
      status: 'Available',
      routes: 8,
      realFeatures: [
        'Interactive Lessons',
        'Practice Exercises',
        'Vocabulary Builder',
        'Progress Tracking'
      ],
      stats: {
        lessons: 'Interactive',
        practice: 'Exercises',
        vocabulary: 'Builder',
        progress: 'Tracking'
      }
    },
    {
      id: 'blog-platform',
      title: 'Blog Platform',
      category: 'Creative & Content',
      description: 'Content creation and publishing platform with community features and analytics.',
      icon: ArticleIcon,
      color: 'from-slate-500 to-gray-600',
      route: '/blog',
      status: 'Available',
      routes: 5,
      realFeatures: [
        'Rich Text Editor',
        'Content Publishing',
        'Community Engagement',
        'Analytics Dashboard'
      ],
      stats: {
        editor: 'Rich Text',
        publishing: 'Content',
        community: 'Engagement',
        analytics: 'Dashboard'
      }
    }
  ];

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

  const handleFeatureClick = (featureId: string) => {
    // Navigate to the feature's route
    const feature = features.find(f => f.id === featureId);
    if (feature && feature.route) {
      navigate(feature.route);
    }
  };

  // Split features into main (first 6) and slider (remaining 6)
  const mainFeatures = features.slice(0, 6);
  const sliderFeatures = features.slice(6);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sliderFeatures.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + sliderFeatures.length) % sliderFeatures.length);
  };

  return (
    <motion.section
      className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
    >
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-0 left-0 w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-[120px]"
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[120px]"
        animate={{
          x: [0, -80, 0],
          y: [0, -60, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          variants={cardVariants}
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
            <AutoAwesomeIcon className="h-5 w-5 text-teal-400" />
            <span className="text-sm font-semibold text-white">Complete Life Management Suite</span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-white">
            Everything You Need in
            <span className="text-teal-400"> One Platform</span>
          </h2>

          <p className="text-xl text-white/70 max-w-4xl mx-auto leading-relaxed">
            Transform every aspect of your life with our comprehensive suite of <strong>12 apps</strong>,
            featuring advanced functionality built with modern technology.
          </p>

          {/* Platform Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-8 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5 text-green-400" />
              <span className="text-white/70"><strong>12 Apps</strong> Fully Operational</span>
            </div>
            <div className="flex items-center gap-2">
              <PlayCircleIcon className="h-5 w-5 text-teal-400" />
              <span className="text-white/70"><strong>Production-Ready</strong> Experience</span>
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
          variants={containerVariants}
        >
          {mainFeatures.map((feature) => (
            <motion.div
              key={feature.id}
              variants={cardVariants}
              whileHover={{ 
                y: -8,
                transition: { type: "spring", stiffness: 300, damping: 20 }
              }}
              className="group"
            >
              <Card
                className="p-8 h-full cursor-pointer relative overflow-hidden bg-white/10 backdrop-blur-sm border-white/20 hover:border-white/40 transition-all duration-500 hover:shadow-2xl hover:shadow-teal-500/20"
                onClick={() => handleFeatureClick(feature.id)}
              >
                {/* Background Gradient Effect */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-10 rounded-full -translate-y-8 translate-x-8 group-hover:opacity-20 transition-opacity duration-500`} />

                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-500/20 text-green-300 border-green-400/30">
                      {feature.status}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="mb-6">
                  <div className="text-xs text-teal-400 font-medium mb-2 uppercase tracking-wide">
                    {feature.category}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white group-hover:text-teal-400 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-white/70 text-sm leading-relaxed mb-4">
                    {feature.description}
                  </p>
                </div>

                {/* Real Features List */}
                <div className="mb-6">
                  <div className="text-xs font-semibold text-white mb-3 uppercase tracking-wide">
                    Key Features
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {feature.realFeatures.slice(0, 4).map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-white/70">
                        <CheckCircleIcon className="h-3 w-3 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="leading-tight">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>


                {/* Action */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/20">
                  <span className="text-sm font-medium text-teal-400">
                    Explore {feature.title.split(' ')[0]}
                  </span>
                  <ArrowForwardIcon className="h-5 w-5 text-teal-400 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>


      </div>
    </motion.section>
  );
};

export default MainFeatures;