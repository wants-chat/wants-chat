import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@mdi/react';
import {
  mdiWallet,
  mdiTrendingUp,
  mdiChartBar,
  mdiFood,
  mdiDumbbell,
  mdiHeart,
  mdiBrain,
  mdiAirplane,
  mdiMapMarker,
  mdiChevronLeft,
  mdiChevronRight,
  mdiArrowRight,
  mdiCurrencyUsd,
  mdiBook,
  mdiCheckCircle
} from '@mdi/js';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

const primaryColor = '#47BDFF';

// Combined All Main Modules Carousel Section
export const AllModulesSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const modules = [
    {
      id: 'recipe-builder',
      title: 'Recipe Builder',
      category: 'Cooking & Nutrition',
      description: 'Create & organize recipes with comprehensive dashboard, meal planning, and AI chat assistance',
      icon: mdiFood,
      color: '#22C55E',
      stats: {
        dashboard: 'Analytics',
        recipes: 'Collection',
        categories: 'Organization',
        mealPlan: 'Weekly Plans'
      },
      features: [
        'Recipe Dashboard',
        'AI Recipe Chat',
        'Meal Planning',
        'Category Management'
      ],
      bgGradient: 'from-green-500/10 to-emerald-500/10',
      route: '/recipe-builder'
    },
    {
      id: 'currency-converter',
      title: 'Currency Converter',
      category: 'Finance & Trading',
      description: 'Real-time exchange rates with currency conversion, rate charts, and smart alerts system',
      icon: mdiCurrencyUsd,
      color: '#06B6D4',
      stats: {
        convert: 'Live Rates',
        rates: 'Global Markets',
        charts: 'Analytics',
        alerts: 'Notifications'
      },
      features: [
        'Live Currency Conversion',
        'Exchange Rate Tables',
        'Interactive Charts',
        'Rate Alert System'
      ],
      bgGradient: 'from-cyan-500/10 to-blue-500/10',
      route: '/currency-exchange'
    },
    {
      id: 'habit-tracker',
      title: 'Habit Tracker',
      category: 'Productivity & Growth',
      description: 'Daily habits & streaks with calendar view, analytics charts, and achievement system',
      icon: mdiChartBar,
      color: '#EC4899',
      stats: {
        habits: 'Daily Tracking',
        calendar: 'Visual Progress',
        streaks: 'Achievements',
        analytics: 'Insights'
      },
      features: [
        'Habit Calendar',
        'Streak Tracking',
        'Progress Analytics',
        'Achievement Badges'
      ],
      bgGradient: 'from-pink-500/10 to-rose-500/10',
      route: '/habit-planner'
    },
    {
      id: 'todo-manager',
      title: 'Todo',
      category: 'Task & Project Management',
      description: 'Task & project management with comprehensive organization and deadline tracking system',
      icon: mdiCheckCircle,
      color: '#3B82F6',
      stats: {
        tasks: 'Organization',
        projects: 'Management',
        deadlines: 'Tracking',
        priorities: 'System'
      },
      features: [
        'Task Management',
        'Project Organization',
        'Deadline Alerts',
        'Priority Levels'
      ],
      bgGradient: 'from-blue-500/10 to-indigo-500/10',
      route: '/todo'
    },
    {
      id: 'language-learning',
      title: 'Language Learner',
      category: 'Education & Learning',
      description: 'Interactive language learning with 8+ languages, vocabulary building, and progress tracking',
      icon: mdiBrain,
      color: '#F59E0B',
      stats: {
        languages: '8+ Supported',
        vocabulary: 'Builder',
        lessons: 'Interactive',
        practice: 'Speaking'
      },
      features: [
        'Multi-Language Support',
        'Interactive Lessons',
        'Vocabulary Training',
        'Progress Dashboard'
      ],
      bgGradient: 'from-yellow-500/10 to-orange-500/10',
      route: '/language-learner'
    },
    {
      id: 'blog-platform',
      title: 'Blog',
      category: 'Content & Publishing',
      description: 'Content & community platform for creating, publishing, and managing blog posts with image support',
      icon: mdiBook,
      color: '#8B5CF6',
      stats: {
        posts: 'Publishing',
        images: 'Management',
        community: 'Features',
        editor: 'Rich Content'
      },
      features: [
        'Rich Text Editor',
        'Image Upload & Management',
        'Community Features',
        'Post Analytics'
      ],
      bgGradient: 'from-cyan-500/10 to-teal-500/10',
      route: '/blog'
    }
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % modules.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + modules.length) % modules.length);
  };

  const currentModule = modules[currentIndex];

  return (
    <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900">
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[120px]"
        animate={{
          x: [0, -80, 0],
          y: [0, 60, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-500/20 rounded-full blur-[120px]"
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
            <div className="p-2 rounded-full bg-teal-500/30">
              <Icon path={mdiChartBar} size={1} color="white" />
            </div>
            <span className="text-sm font-semibold text-white">Complete Life Management</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-white">
            Your Essential Life Apps
          </h2>
          <p className="text-lg max-w-3xl mx-auto text-white/70 leading-relaxed">
            Powerful tools designed to help you manage every aspect of your life with precision and ease
          </p>
        </motion.div>

        {/* Main Carousel */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <Card className="overflow-hidden bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
                  {/* Left Side - Content */}
                  <div className="p-8 lg:p-12 flex flex-col justify-center">
                    <div className="mb-6">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-4">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: currentModule.color }}
                        />
                        <span className="text-sm font-medium text-white">
                          {currentModule.category}
                        </span>
                      </div>
                      <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                        {currentModule.title}
                      </h3>
                      <p className="text-lg text-white/70 leading-relaxed mb-6">
                        {currentModule.description}
                      </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-8">
                      {currentModule.features.map((feature) => (
                        <div
                          key={feature}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10"
                        >
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: currentModule.color }}
                          />
                          <span className="text-sm font-medium text-white/80">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    <Button
                      className="w-fit group bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                      onClick={() => window.location.href = `/products#${currentModule.id}`}
                    >
                      Explore {currentModule.title.split(' ')[0]}
                      <Icon
                        path={mdiArrowRight}
                        size={0.8}
                        className="ml-2 group-hover:translate-x-1 transition-transform"
                      />
                    </Button>
                  </div>

                  {/* Right Side - Dashboard Preview */}
                  <div className="p-8 lg:p-12 flex items-center justify-center bg-white/5 backdrop-blur-sm">
                    <div className="w-full max-w-md">
                      <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20 shadow-xl">
                        <div className="flex items-center gap-3 mb-6">
                          <div
                            className="p-3 rounded-xl bg-white/10"
                          >
                            <Icon path={currentModule.icon} size={1.5} color={currentModule.color} />
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-white">
                              {currentModule.title}
                            </h4>
                            <p className="text-sm text-white/60">
                              Live Dashboard
                            </p>
                          </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4">
                          {Object.entries(currentModule.stats).map(([key, value]) => (
                            <div key={key} className="text-center p-3 rounded-lg bg-white/5 border border-white/10">
                              <p className="text-xs text-white/60 uppercase tracking-wide mb-1">
                                {key}
                              </p>
                              <p className="text-lg font-bold" style={{ color: currentModule.color }}>
                                {value}
                              </p>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 shadow-lg hover:shadow-xl transition-all z-10"
          >
            <Icon path={mdiChevronLeft} size={1} color="white" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 shadow-lg hover:shadow-xl transition-all z-10"
          >
            <Icon path={mdiChevronRight} size={1} color="white" />
          </button>

          {/* Indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {modules.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-teal-400 scale-125'
                    : 'bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Export individual sections for backward compatibility
export const MoneyNutritionSection = () => <AllModulesSection />;
export const WorkoutHealthSection = () => <div />; // Empty to avoid duplication
export const MeditationMentalHealthSection: React.FC = () => {
  return null;
};

export const TravelPlannerSection: React.FC = () => {
  const currentPlans = [
    {
      id: 'current-tokyo',
      destination: 'Tokyo, Japan',
      dates: 'Mar 15-22, 2025',
      status: 'Current Trip',
      progress: 65,
      days: { completed: 4, total: 7 },
      budget: { used: 1625, total: 2500, currency: '$' },
      todayActivity: 'Tokyo Skytree & Asakusa District',
      nextActivity: 'Shibuya Crossing & Shopping',
      image: '🏮',
      color: '#FF6B6B'
    }
  ];

  const upcomingPlans = [
    {
      id: 'upcoming-paris',
      destination: 'Paris, France',
      dates: 'Apr 10-16, 2025',
      status: 'Upcoming',
      daysUntil: 26,
      duration: 6,
      budget: 3200,
      style: 'Cultural',
      highlights: ['Eiffel Tower', 'Louvre Museum', 'Montmartre'],
      image: '🗼',
      color: '#4ECDC4'
    },
    {
      id: 'upcoming-bali',
      destination: 'Bali, Indonesia',
      dates: 'May 5-12, 2025',
      status: 'Planning',
      duration: 8,
      budget: 1800,
      style: 'Relaxation',
      highlights: ['Rice Terraces', 'Beach Resorts', 'Temples'],
      image: '🏝️',
      color: '#45B7D1'
    }
  ];

  return (
    <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900">
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[120px]"
        animate={{
          x: [0, -60, 0],
          y: [0, 80, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-1/4 left-0 w-[600px] h-[600px] bg-teal-500/20 rounded-full blur-[120px]"
        animate={{
          x: [0, 80, 0],
          y: [0, -60, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
            <div className="p-2 rounded-full bg-teal-500/30">
              <Icon path={mdiAirplane} size={1} color="white" />
            </div>
            <span className="text-sm font-semibold text-white">AI Travel Planning</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-white">
            Your Travel Journey
          </h2>
          <p className="text-lg max-w-3xl mx-auto text-white/70 leading-relaxed">
            Experience AI-powered trip generation with 3D globe visualization, smart itineraries,
            and comprehensive travel management across <strong>8 major destinations</strong>
          </p>
        </div>

        {/* Current Trip Section */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <h3 className="text-2xl font-bold text-white">Current Trip</h3>
            <div className="px-3 py-1 rounded-full bg-green-500/20 border border-green-400/30">
              <span className="text-xs font-semibold text-green-300">ACTIVE</span>
            </div>
          </div>

          {currentPlans.map((plan) => (
            <Card key={plan.id} className="p-6 bg-white/10 backdrop-blur-sm border-white/20 border-l-4" style={{ borderLeftColor: plan.color }}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Trip Info */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{plan.image}</span>
                    <div>
                      <h4 className="text-xl font-bold text-white">{plan.destination}</h4>
                      <p className="text-sm text-white/60">{plan.dates}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white/60">Trip Progress</span>
                        <span className="font-semibold" style={{ color: plan.color }}>{plan.progress}%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-300"
                          style={{ backgroundColor: plan.color, width: `${plan.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/10">
                        <p className="text-lg font-bold" style={{ color: plan.color }}>{plan.days.completed}/{plan.days.total}</p>
                        <p className="text-xs text-white/60">Days</p>
                      </div>
                      <div className="p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/10">
                        <p className="text-lg font-bold" style={{ color: plan.color }}>{plan.budget.currency}{plan.budget.used}/{plan.budget.total}</p>
                        <p className="text-xs text-white/60">Budget</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Today's Activity */}
                <div>
                  <h5 className="font-semibold text-white mb-3">Today's Adventure</h5>
                  <div className="p-4 bg-white/10 backdrop-blur-sm rounded-lg border-l-4 border-white/10" style={{ borderLeftColor: plan.color }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon path={mdiMapMarker} size={0.8} color={plan.color} />
                      <span className="font-medium text-white">Now</span>
                    </div>
                    <p className="text-sm text-white/70 mb-3">{plan.todayActivity}</p>
                    <div className="flex items-center gap-2 text-xs text-white/60">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span>In Progress</span>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon path={mdiMapMarker} size={0.7} color={primaryColor} />
                      <span className="text-xs font-medium text-white/60">Up Next</span>
                    </div>
                    <p className="text-sm text-white/70">{plan.nextActivity}</p>
                  </div>
                </div>

                {/* Live Stats */}
                <div>
                  <h5 className="font-semibold text-white mb-3">Live Travel Stats</h5>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 bg-white/10 backdrop-blur-sm rounded border border-white/10">
                      <span className="text-xs text-white/60">Activities Completed</span>
                      <span className="text-sm font-bold text-green-400">12/18</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white/10 backdrop-blur-sm rounded border border-white/10">
                      <span className="text-xs text-white/60">Photos Taken</span>
                      <span className="text-sm font-bold" style={{ color: primaryColor }}>247</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white/10 backdrop-blur-sm rounded border border-white/10">
                      <span className="text-xs text-white/60">Distance Traveled</span>
                      <span className="text-sm font-bold text-teal-400">45 km</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white/10 backdrop-blur-sm rounded border border-white/10">
                      <span className="text-xs text-white/60">Local Cuisine Tried</span>
                      <span className="text-sm font-bold text-orange-400">8 dishes</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Upcoming Trips Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white">Upcoming Adventures</h3>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Icon path={mdiTrendingUp} size={0.8} color="white" />
              <span>{upcomingPlans.length} trips planned</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingPlans.map((plan, index) => (
              <Card key={plan.id} className="p-6 bg-white/10 backdrop-blur-sm border-white/20 hover:shadow-lg hover:shadow-teal-500/20 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{plan.image}</span>
                    <div>
                      <h4 className="text-lg font-bold text-white">{plan.destination}</h4>
                      <p className="text-sm text-white/60">{plan.dates}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="px-2 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: `${plan.color}30`, color: plan.color }}>
                      {plan.status}
                    </div>
                    {plan.daysUntil && (
                      <p className="text-xs text-white/50 mt-1">{plan.daysUntil} days to go</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-2 bg-white/10 rounded border border-white/10">
                    <p className="text-sm font-bold" style={{ color: plan.color }}>{plan.duration}</p>
                    <p className="text-xs text-white/60">Days</p>
                  </div>
                  <div className="text-center p-2 bg-white/10 rounded border border-white/10">
                    <p className="text-sm font-bold" style={{ color: plan.color }}>${plan.budget}</p>
                    <p className="text-xs text-white/60">Budget</p>
                  </div>
                  <div className="text-center p-2 bg-white/10 rounded border border-white/10">
                    <p className="text-sm font-bold" style={{ color: plan.color }}>{plan.style}</p>
                    <p className="text-xs text-white/60">Style</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs font-medium text-white/60 mb-2">TOP HIGHLIGHTS</p>
                  <div className="flex flex-wrap gap-2">
                    {plan.highlights.map((highlight, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 text-xs rounded-full bg-white/10 border border-white/20 text-white/80"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <span className="text-sm font-medium" style={{ color: plan.color }}>
                    {index === 0 ? 'Review Itinerary' : 'Continue Planning'}
                  </span>
                  <Icon path={mdiArrowRight} size={0.8} color={plan.color} />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Advanced Features Showcase */}
        <Card className="p-8 bg-white/10 backdrop-blur-sm border-white/20">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">
              Advanced Travel Intelligence
            </h3>
            <p className="text-white/70">
              Powered by AI with 3D visualization and comprehensive travel management
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { icon: mdiMapMarker, title: 'Interactive 3D Globe', desc: 'NASA Earth imagery with country tracking', color: '#FF6B6B' },
              { icon: mdiBrain, title: 'AI Itinerary Generation', desc: 'Smart trip planning with preferences', color: '#4ECDC4' },
              { icon: mdiChartBar, title: 'Budget Analytics', desc: 'Real-time expense tracking & optimization', color: '#45B7D1' },
              { icon: mdiHeart, title: 'Smart Notifications', desc: '30-day countdown with reminders', color: '#96CEB4' }
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <div className="p-4 rounded-full w-16 h-16 mx-auto mb-3" style={{ backgroundColor: `${feature.color}30` }}>
                  <Icon path={feature.icon} size={1.5} color={feature.color} />
                </div>
                <h4 className="font-semibold text-white mb-1">{feature.title}</h4>
                <p className="text-xs text-white/60">{feature.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
              onClick={() => window.location.href = '/travel-planner'}
            >
              Explore 3D Travel Globe
              <Icon path={mdiAirplane} size={0.8} className="ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
              onClick={() => window.location.href = '/generate-travel-plan'}
            >
              Generate AI Trip Plan
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
};