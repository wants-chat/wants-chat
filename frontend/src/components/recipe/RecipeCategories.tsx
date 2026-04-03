import React, { useEffect, useState } from 'react';
import { ChefHat, Clock, Users, Star, ArrowRight, Utensils, Coffee, Pizza, Soup, Cookie, Globe } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Recipe } from '../../types/recipe';
import { useRecipes } from '../../hooks/useRecipes';

interface RecipeCategoriesProps {
  recipes?: Recipe[];
  onNavigate: (path: string) => void;
}

// Cuisine icons mapping
const getCuisineIcon = (cuisine: string) => {
  const cuisineMap: { [key: string]: any } = {
    'Italian': Pizza,
    'Asian': Soup,
    'American': Coffee,
    'Mexican': Utensils,
    'French': ChefHat,
    'Indian': Soup,
    'Chinese': Soup,
    'Japanese': Soup,
    'Thai': Soup,
    'Mediterranean': Utensils,
    'Dessert': Cookie,
    'Other': Globe
  };
  return cuisineMap[cuisine] || ChefHat;
};

// Cuisine colors mapping
const getCuisineColor = (cuisine: string) => {
  const colorMap: { [key: string]: string } = {
    'Italian': 'from-red-500 to-green-500',
    'Asian': 'from-orange-500 to-red-500',
    'American': 'from-blue-500 to-red-500',
    'Mexican': 'from-green-500 to-red-500',
    'French': 'from-blue-500 to-purple-500',
    'Indian': 'from-orange-500 to-yellow-500',
    'Chinese': 'from-red-500 to-yellow-500',
    'Japanese': 'from-pink-500 to-purple-500',
    'Thai': 'from-green-500 to-orange-500',
    'Mediterranean': 'from-blue-500 to-cyan-500',
    'Dessert': 'from-pink-500 to-purple-500',
    'Other': 'from-gray-500 to-gray-600'
  };
  return colorMap[cuisine] || 'from-primary to-primary/80';
};

export const RecipeCategories: React.FC<RecipeCategoriesProps> = ({ recipes: propRecipes, onNavigate }) => {
  const [allRecipes, setAllRecipes] = useState<Recipe[]>(propRecipes || []);
  const [loading, setLoading] = useState(!propRecipes);
  
  // Fetch recipes if not provided via props
  const { data: fetchedRecipes } = useRecipes();
  
  useEffect(() => {
    if (!propRecipes && fetchedRecipes?.data) {
      setAllRecipes(fetchedRecipes.data);
      setLoading(false);
    } else if (propRecipes) {
      setAllRecipes(propRecipes);
      setLoading(false);
    }
  }, [propRecipes, fetchedRecipes]);

  // Get unique cuisines with recipe counts and ratings
  const cuisines = Array.from(new Set(allRecipes.map(recipe => recipe.cuisine).filter(Boolean))) as string[];
  
  const categoryData = cuisines.map(cuisine => {
    const cuisineRecipes = allRecipes.filter(r => r.cuisine === cuisine);
    const avgRating = cuisineRecipes.reduce((acc, r) => acc + r.rating, 0) / cuisineRecipes.length || 0;
    const totalTime = cuisineRecipes.reduce((acc, r) => acc + (r.prepTime || 0) + (r.cookTime || 0), 0) / cuisineRecipes.length || 0;
    const avgServings = cuisineRecipes.reduce((acc, r) => acc + r.servings, 0) / cuisineRecipes.length || 0;
    
    // Get difficulty distribution
    const difficulties = {
      easy: cuisineRecipes.filter(r => r.difficulty === 'easy').length,
      medium: cuisineRecipes.filter(r => r.difficulty === 'medium').length,
      hard: cuisineRecipes.filter(r => r.difficulty === 'hard').length
    };
    
    return {
      name: cuisine,
      count: cuisineRecipes.length,
      avgRating: avgRating,
      avgTime: Math.round(totalTime),
      avgServings: Math.round(avgServings),
      difficulties,
      recipes: cuisineRecipes.slice(0, 3), // Get top 3 recipes for preview
      featuredImage: cuisineRecipes.find(r => r.imageUrl)?.imageUrl
    };
  });

  // Sort by recipe count (descending)
  categoryData.sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Recipe Categories</h2>
        <p className="text-white/80">
          Explore recipes by cuisine type
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mb-4"></div>
            <p className="text-white/60">Loading categories...</p>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      {!loading && categoryData.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryData.map(category => {
            const IconComponent = getCuisineIcon(category.name);
            const gradientColor = getCuisineColor(category.name);
            
            return (
              <div
                key={category.name}
                className="rounded-2xl overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20 hover:border-teal-500/40 hover:shadow-xl hover:shadow-teal-500/10 transition-all duration-300 cursor-pointer group"
                onClick={() => onNavigate(`/recipe-builder/category/${encodeURIComponent(category.name)}`)}
              >
                {/* Featured Image or Gradient Header */}
                <div className="h-32 relative overflow-hidden">
                  {category.featuredImage ? (
                    <>
                      <img
                        src={category.featuredImage}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                    </>
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${gradientColor}`}></div>
                  )}

                  {/* Cuisine Icon */}
                  <div className="absolute top-4 left-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                  </div>

                  {/* Recipe Count Badge */}
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-black/50 backdrop-blur-sm text-white border-0">
                      {category.count} {category.count === 1 ? 'Recipe' : 'Recipes'}
                    </Badge>
                  </div>

                  {/* Cuisine Name */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-bold text-white">
                      {category.name}
                    </h3>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  {/* Stats Row */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      {category.avgRating > 0 && (
                        <span className="flex items-center gap-1 text-yellow-400">
                          <Star className="h-4 w-4 fill-current" />
                          {category.avgRating.toFixed(1)}
                        </span>
                      )}
                      {category.avgTime > 0 && (
                        <span className="flex items-center gap-1 text-white/60">
                          <Clock className="h-4 w-4" />
                          {category.avgTime}m
                        </span>
                      )}
                      {category.avgServings > 0 && (
                        <span className="flex items-center gap-1 text-white/60">
                          <Users className="h-4 w-4" />
                          {category.avgServings}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Difficulty Distribution */}
                  {(category.difficulties.easy > 0 || category.difficulties.medium > 0 || category.difficulties.hard > 0) && (
                    <div className="flex gap-2 flex-wrap">
                      {category.difficulties.easy > 0 && (
                        <Badge className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Easy: {category.difficulties.easy}
                        </Badge>
                      )}
                      {category.difficulties.medium > 0 && (
                        <Badge className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                          Medium: {category.difficulties.medium}
                        </Badge>
                      )}
                      {category.difficulties.hard > 0 && (
                        <Badge className="text-xs bg-red-500/20 text-red-400 border border-red-500/30">
                          Hard: {category.difficulties.hard}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Recipe Previews */}
                  {category.recipes.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-white/10">
                      <p className="text-xs font-semibold text-white/60 mb-1">Popular recipes:</p>
                      {category.recipes.map((recipe, idx) => (
                        <div key={recipe.id} className="text-sm text-white/70 truncate">
                          • {recipe.title}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* View All Button */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm text-teal-400 font-semibold group-hover:underline flex items-center gap-1">
                      View All
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : !loading ? (
        <div className="rounded-xl p-12 text-center bg-white/10 backdrop-blur-xl border border-white/20">
          <ChefHat className="h-16 w-16 mx-auto mb-4 text-white/30" />
          <h3 className="text-xl font-semibold mb-2 text-white">No Categories Available</h3>
          <p className="text-white/60 mb-6">
            Add some recipes with cuisine types to see categories here.
          </p>
        </div>
      ) : null}
    </div>
  );
};