import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { usePublicRecipes } from '../../hooks/useRecipes';
import { Recipe } from '../../types/recipe';
import { api } from '../../lib/api';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ChefHatIcon from '@mui/icons-material/RestaurantMenu';
import TimerIcon from '@mui/icons-material/Timer';
import PeopleIcon from '@mui/icons-material/People';
import StarIcon from '@mui/icons-material/Star';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const RecipeSection: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch public recipes
  const { data, isLoading, error } = usePublicRecipes({
    page: 1,
    limit: 12,
    sort_by: 'created_at',
    sort_order: 'desc',
    public_only: true,
  });

  const recipes: Recipe[] = data?.data || [];

  // Fetch recipe stats
  const [stats, setStats] = useState<{
    totalRecipes: number;
    totalFavorites: number;
    averageRating: number;
    mostPopularCuisine: string;
  } | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsData = await api.getRecipeStats();
        console.log('Recipe stats received:', statsData);
        setStats(statsData);
      } catch (error) {
        console.error('Failed to fetch recipe stats:', error);
        // Set default values if API fails
        setStats({
          totalRecipes: 0,
          totalFavorites: 0,
          averageRating: 0,
          mostPopularCuisine: 'N/A'
        });
      }
    };
    fetchStats();
  }, []);

  const [recipesPerView, setRecipesPerView] = useState(3);

  // Update recipes per view based on screen size - Always 2 for large screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setRecipesPerView(1);
      } else {
        setRecipesPerView(2); // Always show 2 cards per slide on tablet and above
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, Math.ceil(recipes.length / recipesPerView) - 1);

  // Auto-play functionality
  useEffect(() => {
    if (recipes.length === 0) return;

    const startAutoPlay = () => {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          const next = prev + 1;
          return next > maxIndex ? 0 : next;
        });
      }, 4000); // Auto-slide every 4 seconds
    };

    startAutoPlay();

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [recipes.length, maxIndex]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
    // Reset auto-play timer
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
    // Reset auto-play timer
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  };

  const handleRecipeClick = (recipeId: string) => {
    navigate(`/recipe-builder/recipe/${recipeId}`);
  };

  // Helper function to get recipe image
  const getRecipeImage = (recipe: Recipe): string => {
    if (recipe.imageUrl) {
      return recipe.imageUrl;
    }

    // Default images based on cuisine or category
    const defaultImages = {
      'Italian': 'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?w=500&h=400&fit=crop&q=80',
      'Chinese': 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=500&h=400&fit=crop&q=80',
      'Mexican': 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=500&h=400&fit=crop&q=80',
      'Indian': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&h=400&fit=crop&q=80',
      'Japanese': 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=500&h=400&fit=crop&q=80',
      'American': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=400&fit=crop&q=80',
      'Mediterranean': 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500&h=400&fit=crop&q=80',
      'Thai': 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=500&h=400&fit=crop&q=80',
    };

    if (recipe.cuisine && recipe.cuisine in defaultImages) {
      return defaultImages[recipe.cuisine as keyof typeof defaultImages];
    }

    // Generic food images as fallback
    const fallbackImages = [
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=400&fit=crop&q=80',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&h=400&fit=crop&q=80',
      'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=500&h=400&fit=crop&q=80',
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500&h=400&fit=crop&q=80',
    ];

    const index = recipe.id ? Math.abs(recipe.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % fallbackImages.length : 0;
    return fallbackImages[index];
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
          className="text-center mb-16"
          variants={cardVariants}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
            <RestaurantIcon className="h-5 w-5 text-orange-400" />
            <span className="text-sm font-semibold text-white">Delicious Recipes</span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 text-white">
            Explore Mouth-Watering <span className="text-orange-400">Recipes</span>
          </h2>

          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Discover amazing recipes from our community of food lovers and culinary experts
          </p>
        </motion.div>

        {/* Main Content Grid: Carousel + Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recipe Carousel - Left Side (2 columns on large screens) */}
          <div className="lg:col-span-2 relative">
          {/* Navigation Buttons */}
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white shadow-lg transition-all ${
              currentIndex === 0
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:scale-110 hover:shadow-xl hover:bg-white/20'
            }`}
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === maxIndex}
            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white shadow-lg transition-all ${
              currentIndex === maxIndex
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:scale-110 hover:shadow-xl hover:bg-white/20'
            }`}
          >
            <ChevronRightIcon className="h-6 w-6" />
          </button>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center h-64">
              <div className="text-lg text-white/60">Loading recipes...</div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="text-lg text-red-400 mb-2">Failed to load recipes</div>
                <div className="text-sm text-white/60">Please try again later.</div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && recipes.length === 0 && (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="text-lg text-white/60 mb-2">No recipes found</div>
                <div className="text-sm text-white/60">Check back later for new recipes.</div>
              </div>
            </div>
          )}

          {/* Carousel Container */}
          {!isLoading && !error && recipes.length > 0 && (
            <div className="overflow-hidden px-4" ref={carouselRef}>
              <motion.div
                className="flex gap-6"
                animate={{ x: -currentIndex * 100 + '%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                {recipes.map((recipe) => (
                  <motion.div
                    key={recipe.id}
                    className="min-w-full md:min-w-[calc(50%-12px)]"
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <Card
                      className="overflow-hidden h-full flex flex-col cursor-pointer bg-white/10 backdrop-blur-xl border border-white/20 hover:shadow-xl hover:shadow-teal-500/20 transition-all duration-300"
                      onClick={() => handleRecipeClick(recipe.id)}
                    >
                      {/* Recipe Image */}
                      <div className="relative h-56 overflow-hidden">
                        <img
                          src={getRecipeImage(recipe)}
                          alt={recipe.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=400&fit=crop&q=80';
                          }}
                        />

                        {/* Cuisine Badge */}
                        {recipe.cuisine && (
                          <div className="absolute top-4 left-4">
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white">
                              {recipe.cuisine}
                            </span>
                          </div>
                        )}

                        {/* Difficulty Badge */}
                        {recipe.difficulty && (
                          <div className="absolute top-4 right-4">
                            <span className={`px-3 py-1 backdrop-blur-sm rounded-full text-xs font-medium ${
                              recipe.difficulty === 'easy'
                                ? 'bg-green-500/90 text-white'
                                : recipe.difficulty === 'medium'
                                ? 'bg-yellow-500/90 text-white'
                                : 'bg-red-500/90 text-white'
                            }`}>
                              {recipe.difficulty}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Recipe Content */}
                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-xl font-bold mb-3 text-white hover:text-orange-400 transition-colors line-clamp-2">
                          {recipe.title}
                        </h3>

                        {recipe.description && (
                          <p className="text-white/60 mb-4 flex-1 line-clamp-2">
                            {recipe.description}
                          </p>
                        )}

                        {/* Recipe Meta */}
                        <div className="flex items-center justify-between text-sm text-white/60 pt-4 border-t border-white/20">
                          <div className="flex items-center gap-4">
                            {(recipe.prepTime || recipe.cookTime) && (
                              <span className="flex items-center gap-1">
                                <TimerIcon className="h-4 w-4" />
                                {(recipe.prepTime || 0) + (recipe.cookTime || 0)} min
                              </span>
                            )}
                            {recipe.servings && (
                              <span className="flex items-center gap-1">
                                <PeopleIcon className="h-4 w-4" />
                                {recipe.servings}
                              </span>
                            )}
                          </div>
                          {recipe.averageRating && recipe.averageRating > 0 && (
                            <span className="flex items-center gap-1 text-yellow-500">
                              <StarIcon className="h-4 w-4 fill-current" />
                              {recipe.averageRating.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}

            {/* Carousel Indicators */}
            {!isLoading && !error && recipes.length > 0 && maxIndex > 0 && (
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentIndex(index);
                      if (autoPlayRef.current) {
                        clearInterval(autoPlayRef.current);
                      }
                    }}
                    className={`h-2 transition-all ${
                      index === currentIndex
                        ? 'w-8 bg-orange-500'
                        : 'w-2 bg-gray-300 dark:bg-gray-600 hover:bg-orange-500/50'
                    } rounded-full`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Stats Section - Right Side */}
          <div className="hidden lg:flex lg:items-start">
            <Card className="rounded-2xl p-6 bg-white/10 backdrop-blur-xl border border-white/20 flex flex-col w-full">
              <h3 className="text-2xl font-bold mb-6 text-white">Recipe Stats</h3>

              <div className="space-y-6">
                {/* Total Recipes */}
                <div className="p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white/60">Total Recipes</p>
                      <p className="text-3xl font-bold text-orange-400">{stats?.totalRecipes || 0}</p>
                    </div>
                    <RestaurantIcon className="h-12 w-12 text-orange-400 opacity-50" />
                  </div>
                </div>

                {/* Community Stats */}
                <div className="p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/10">
                  <p className="text-sm text-white/60 mb-3">Community</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white/80">Total Favorites</span>
                      <span className="text-lg font-bold text-orange-400">{stats?.totalFavorites || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white/80">Popular Cuisine</span>
                      <span className="text-sm text-white/60">{stats?.mostPopularCuisine || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Average Rating */}
                <div className="p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/10">
                  <p className="text-sm text-white/60 mb-3">Quick Stats</p>
                  <div className="flex items-center gap-2">
                    <StarIcon className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="text-sm text-white">{stats?.averageRating ? stats.averageRating.toFixed(1) : '0.0'} Average Rating</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* View All Button */}
        <motion.div
          className="text-center mt-16"
          variants={cardVariants}
        >
          <Button
            size="lg"
            className="group px-6 py-3 text-base font-medium bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl shadow-lg shadow-teal-500/25 hover:shadow-xl transition-all duration-200"
            onClick={() => navigate('/recipe-builder')}
          >
            <ChefHatIcon className="mr-2 h-5 w-5" />
            Explore All Recipes
            <ArrowForwardIcon className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default RecipeSection;