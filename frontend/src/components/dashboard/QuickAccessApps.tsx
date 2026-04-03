import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Sparkles } from 'lucide-react';
import { useAppPreferences } from '../../contexts/AppPreferencesContext';
import { categories as allCategories, getAllApps, type App, type Category } from '../../data/categories';

// Map category IDs to display names and colors for filter buttons
const categoryDisplayConfig: Record<string, { name: string; color: string }> = {
  'life-management': { name: 'Life', color: 'from-teal-500 to-cyan-500' },
  'ai-tools': { name: 'AI Tools', color: 'from-purple-500 to-indigo-500' },
  'productivity': { name: 'Productivity', color: 'from-amber-500 to-orange-500' },
  'developer-tools': { name: 'Dev Tools', color: 'from-blue-500 to-cyan-500' },
  'utilities': { name: 'Utilities', color: 'from-green-500 to-emerald-500' },
  'media-entertainment': { name: 'Media', color: 'from-pink-500 to-rose-500' },
  'security-privacy': { name: 'Security', color: 'from-red-500 to-orange-500' },
  'sensors-detection': { name: 'Sensors', color: 'from-indigo-500 to-purple-500' },
  'calculators-tools': { name: 'Calculators', color: 'from-yellow-500 to-amber-500' },
  'camera-utilities': { name: 'Camera', color: 'from-gray-500 to-slate-500' },
  'home-life': { name: 'Home & Life', color: 'from-emerald-500 to-teal-500' },
};

// Helper to get gradient color from hex color
const getGradientFromColor = (color?: string): string => {
  if (!color) return 'from-gray-500 to-slate-500';
  // Convert hex to gradient
  const colorMap: Record<string, string> = {
    '#E91E63': 'from-pink-500 to-rose-500',
    '#9C27B0': 'from-purple-500 to-violet-500',
    '#FF5722': 'from-orange-500 to-red-500',
    '#4CAF50': 'from-green-500 to-emerald-500',
    '#2196F3': 'from-blue-500 to-cyan-500',
    '#4ECDC4': 'from-teal-500 to-cyan-500',
    '#00BCD4': 'from-cyan-500 to-blue-500',
    '#009688': 'from-teal-500 to-green-500',
    '#00ACC1': 'from-cyan-500 to-teal-500',
    '#7C4DFF': 'from-violet-500 to-purple-500',
    '#FF5252': 'from-red-500 to-pink-500',
    '#3F51B5': 'from-indigo-500 to-blue-500',
    '#D500F9': 'from-fuchsia-500 to-purple-500',
    '#5E35B1': 'from-violet-600 to-purple-600',
    '#7E57C2': 'from-violet-500 to-purple-500',
    '#FF4081': 'from-pink-500 to-rose-500',
    '#795548': 'from-amber-700 to-yellow-700',
    '#607D8B': 'from-slate-500 to-gray-500',
    '#00897B': 'from-teal-600 to-green-600',
    '#1565C0': 'from-blue-600 to-indigo-600',
    '#FFB74D': 'from-amber-400 to-orange-400',
    '#5C6BC0': 'from-indigo-500 to-blue-500',
    '#8D6E63': 'from-amber-600 to-yellow-700',
    '#AB47BC': 'from-purple-500 to-pink-500',
    '#1976D2': 'from-blue-600 to-cyan-600',
    '#388E3C': 'from-green-600 to-emerald-600',
    '#FF6F00': 'from-orange-500 to-amber-500',
    '#7B1FA2': 'from-purple-600 to-pink-600',
    '#0288D1': 'from-blue-500 to-cyan-500',
    '#D32F2F': 'from-red-600 to-rose-600',
    '#00796B': 'from-teal-600 to-green-600',
    '#42A5F5': 'from-blue-400 to-cyan-400',
    '#EF5350': 'from-red-500 to-rose-500',
    '#FFA726': 'from-orange-400 to-amber-400',
    '#43A047': 'from-green-500 to-emerald-500',
    '#8E24AA': 'from-purple-600 to-pink-600',
    '#26A69A': 'from-teal-500 to-green-500',
    '#FF7043': 'from-orange-500 to-red-500',
    '#1E88E5': 'from-blue-500 to-indigo-500',
    '#FFC107': 'from-yellow-500 to-amber-500',
    '#FFD700': 'from-yellow-400 to-amber-400',
    '#4A5568': 'from-gray-600 to-slate-600',
    '#00FF00': 'from-green-400 to-emerald-400',
    '#212121': 'from-gray-800 to-slate-800',
    '#FF8A65': 'from-orange-400 to-red-400',
  };
  return colorMap[color] || 'from-gray-500 to-slate-500';
};

const QuickAccessApps: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const { isAppSelected } = useAppPreferences();

  // Get all apps with their category info
  const appsWithCategory = useMemo(() => {
    const result: Array<App & { categoryId: string }> = [];
    allCategories.forEach(category => {
      category.apps.forEach(app => {
        result.push({ ...app, categoryId: category.id });
      });
    });
    return result;
  }, []);

  // Filter apps based on user's selected apps
  const userSelectedApps = useMemo(() => {
    return appsWithCategory.filter(app => isAppSelected(app.id));
  }, [appsWithCategory, isAppSelected]);

  // Then filter by category
  const filteredApps = useMemo(() => {
    if (activeCategory === 'All') {
      return userSelectedApps;
    }
    return userSelectedApps.filter(app => app.categoryId === activeCategory);
  }, [userSelectedApps, activeCategory]);

  // Get available categories based on selected apps
  const availableCategories = useMemo(() => {
    const categoryIds = new Set(userSelectedApps.map(app => app.categoryId));
    return allCategories.filter(cat => categoryIds.has(cat.id));
  }, [userSelectedApps]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut" as const
      }
    }
  };

  const handleAppClick = (link?: string) => {
    if (link) {
      navigate(link);
    }
  };

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="mt-8 mb-8"
    >
      <div>
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/20 backdrop-blur-sm border border-teal-500/30 mb-4">
              <AutoAwesomeIcon className="h-4 w-4 text-teal-400" />
              <span className="text-sm font-medium text-teal-400">Quick Access</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Your Selected Apps
            </h2>
            <p className="text-white/60 mt-2">
              {userSelectedApps.length} apps selected from {getAllApps().length} available
            </p>
          </div>
        </motion.div>

        {/* Category Filters - Sticky */}
        <motion.div
          variants={itemVariants}
          className="sticky top-0 z-10 bg-white/10 backdrop-blur-xl border-b border-white/20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 mb-8"
        >
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory('All')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === 'All'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md shadow-teal-500/25'
                  : 'bg-white/10 text-white/70 border border-white/20 hover:bg-white/20 hover:text-white'
              }`}
            >
              All ({userSelectedApps.length})
            </button>
            {availableCategories.map((category) => {
              const config = categoryDisplayConfig[category.id] || { name: category.name, color: 'from-gray-500 to-slate-500' };
              const count = userSelectedApps.filter(app => app.categoryId === category.id).length;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                    activeCategory === category.id
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md shadow-teal-500/25'
                      : 'bg-white/10 text-white/70 border border-white/20 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  <span>{category.icon}</span>
                  {config.name} ({count})
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Apps Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          key={activeCategory}
        >
          {filteredApps.map((app) => {
            const gradientColor = getGradientFromColor(app.color);
            return (
              <motion.div
                key={`${activeCategory}-${app.id}`}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                whileHover={{
                  y: -4,
                  transition: { type: "spring", stiffness: 300, damping: 20 }
                }}
              >
                <div
                  className="group relative bg-white/10 backdrop-blur-xl rounded-2xl p-4 h-full
                    border border-white/20 hover:bg-white/15 hover:border-white/30 hover:shadow-xl hover:shadow-teal-500/10
                    transition-all duration-300 cursor-pointer"
                  onClick={() => handleAppClick(app.link)}
                >
                  {/* Background Gradient */}
                  <div className={`absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br ${gradientColor} opacity-10 rounded-full group-hover:opacity-20 transition-opacity duration-300`} />

                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${gradientColor} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                      <span className="text-lg">{app.icon || '📱'}</span>
                    </div>
                    {app.isAI && (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-purple-500/20 border border-purple-500/30">
                        <Sparkles className="h-3 w-3 text-purple-400" />
                        <span className="text-xs text-purple-400 font-medium">AI</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="font-bold text-sm mb-1 text-white group-hover:text-teal-400 transition-colors duration-300">
                      {app.name}
                    </h3>
                    <p className="text-xs text-white/60 leading-relaxed line-clamp-2">
                      {app.description}
                    </p>
                  </div>

                  {/* Action Indicator */}
                  <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowForwardIcon className="h-3 w-3 text-teal-400" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Empty State */}
        {filteredApps.length === 0 && (
          <div className="text-center py-12">
            <AutoAwesomeIcon className="h-12 w-12 text-white/40 mx-auto mb-4" />
            <p className="text-white/60">No apps found in this category</p>
            <p className="text-xs text-white/40 mt-2">
              Try selecting a different category or add more apps
            </p>
          </div>
        )}
      </div>
    </motion.section>
  );
};

export default QuickAccessApps;
