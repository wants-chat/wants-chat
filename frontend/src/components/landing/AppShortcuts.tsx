import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { categories, getAllApps, TOTAL_APPS_COUNT } from '../../data/categories';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SettingsIcon from '@mui/icons-material/Settings';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const AppShortcuts: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.05 });
  const [activeCategory, setActiveCategory] = useState('All');

  // Get all apps from categories.ts
  const allApps = getAllApps();

  // Filter apps based on selected category
  const filteredApps = activeCategory === 'All'
    ? allApps
    : categories.find(cat => cat.id === activeCategory)?.apps || [];

  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 1, y: 0 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut" as const
      }
    }
  };

  const handleAppClick = (link?: string) => {
    if (link) {
      if (!isAuthenticated) {
        navigate('/login');
      } else {
        navigate(link);
      }
    }
  };

  // Color mapping for gradient backgrounds
  const getGradientFromColor = (color?: string): string => {
    if (!color) return 'from-teal-500 to-cyan-500';
    // Create gradient from single color
    return `from-[${color}] to-[${color}]`;
  };

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
      className="relative py-20 lg:py-32 overflow-hidden bg-gray-950"
    >
      {/* Animated gradient orbs - matching login page */}
      <motion.div
        className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl"
        animate={{ x: [0, -50, 0], y: [0, 50, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-3xl"
        animate={{ x: [0, 50, 0], y: [0, -30, 0], scale: [1, 1.3, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900/50 backdrop-blur-sm border border-gray-800 mb-4">
              <AutoAwesomeIcon className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-medium text-white">{TOTAL_APPS_COUNT}+ Apps Available</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Your Essential Apps
            </h2>
            <p className="text-white/60 mt-2">
              Access all your life management tools in one place
            </p>
          </div>
          <Button
            className="mt-4 sm:mt-0 group bg-gray-900/50 border border-gray-800 text-white hover:bg-gray-800/50 hover:scale-105 transition-all duration-200"
            onClick={() => {
              const element = document.getElementById('products');
              if (element) {
                const yOffset = -80;
                const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({ top: y, behavior: 'smooth' });
              }
            }}
          >
            Explore Categories
            <ArrowForwardIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap gap-2 mb-8"
        >
          <button
            onClick={() => setActiveCategory('All')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              activeCategory === 'All'
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/25'
                : 'bg-gray-900/50 text-white/80 border border-gray-800 hover:bg-gray-800/50'
            }`}
          >
            All ({TOTAL_APPS_COUNT})
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                activeCategory === category.id
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/25'
                  : 'bg-gray-900/50 text-white/80 border border-gray-800 hover:bg-gray-800/50'
              }`}
            >
              <span>{category.icon}</span>
              {category.name} ({category.apps.length})
            </button>
          ))}
        </motion.div>

        {/* Apps Grid */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
          key={activeCategory}
        >
          {filteredApps.map((app, index) => (
            <motion.div
              key={app.id}
              variants={itemVariants}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: Math.min(index * 0.03, 0.5) }}
              whileHover={{
                y: -4,
                transition: { type: "spring", stiffness: 300, damping: 20 }
              }}
            >
              <div
                className="group relative bg-gray-900/50 backdrop-blur-sm rounded-2xl p-4 h-full
                  border border-gray-800 hover:border-gray-700 hover:bg-gray-800/50 hover:shadow-xl hover:shadow-emerald-500/20
                  transition-all duration-300 cursor-pointer"
                onClick={() => handleAppClick(app.link)}
              >
                {/* Background Gradient */}
                <div
                  className="absolute -top-4 -right-4 w-16 h-16 opacity-10 rounded-full group-hover:opacity-20 transition-opacity duration-300"
                  style={{ background: `linear-gradient(135deg, ${app.color || '#14b8a6'}, ${app.color || '#06b6d4'})` }}
                />

                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300 text-xl"
                    style={{ background: `linear-gradient(135deg, ${app.color || '#14b8a6'}, ${app.color || '#06b6d4'}88)` }}
                  >
                    {app.icon}
                  </div>
                  {app.isAI && (
                    <Badge
                      variant="secondary"
                      className="text-xs bg-purple-500/20 text-purple-400 border-purple-500/30"
                    >
                      AI
                    </Badge>
                  )}
                </div>

                {/* Content */}
                <div>
                  <h3 className="font-bold text-sm mb-1 text-white group-hover:text-emerald-400 transition-colors duration-300">
                    {app.name}
                  </h3>
                  <p className="text-xs text-white/60 leading-relaxed line-clamp-2">
                    {app.description}
                  </p>
                </div>

                {/* Action Indicator */}
                <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ArrowForwardIcon className="h-3 w-3 text-emerald-400" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* App Settings Hint */}
        {isAuthenticated && (
          <motion.div
            variants={itemVariants}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 p-4 rounded-2xl bg-gray-900/50 border border-gray-800"
          >
            <div className="flex items-center gap-3 text-white/70">
              <AddCircleOutlineIcon className="h-5 w-5 text-emerald-400" />
              <span className="text-sm">
                Want to customize your apps? Add or remove apps from your quick access.
              </span>
            </div>
            <Button
              size="sm"
              className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:scale-105 transition-all duration-200"
              onClick={() => navigate('/app-settings')}
            >
              <SettingsIcon className="h-4 w-4 mr-2" />
              Manage Apps
            </Button>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
};

export default AppShortcuts;
