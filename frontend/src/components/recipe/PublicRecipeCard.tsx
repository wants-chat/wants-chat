import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Users, Star, ChefHat } from 'lucide-react';
import { Badge } from '../ui/badge';

interface PublicRecipe {
  id: string;
  title: string;
  description?: string;
  cuisine?: string;
  difficulty?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  imageUrl?: string;
  tags?: string[];
  rating?: number;
  ratingsCount?: number;
  createdAt?: string;
}

interface PublicRecipeCardProps {
  recipe: PublicRecipe;
}

export const PublicRecipeCard: React.FC<PublicRecipeCardProps> = ({ recipe }) => {
  const navigate = useNavigate();

  const totalTime = (recipe.cookTime || 0) + (recipe.prepTime || 0);

  return (
    <div
      className="cursor-pointer rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 hover:border-teal-500/40 hover:shadow-xl hover:shadow-teal-500/10 transition-all duration-300 overflow-hidden group"
      onClick={() => navigate(`/recipe-builder/recipe/${recipe.id}`)}
    >
      <div className="h-48 relative overflow-hidden">
        {recipe.imageUrl ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-teal-500/20 to-cyan-500/10 flex items-center justify-center">
            <ChefHat className="h-16 w-16 text-teal-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

        {/* Top badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <div className="flex gap-2 flex-wrap">
            {recipe.difficulty && (
              <Badge className={`text-xs px-2 py-1 rounded-lg backdrop-blur-sm ${
                recipe.difficulty === 'easy' ? 'bg-emerald-500/90 text-white' :
                recipe.difficulty === 'medium' ? 'bg-yellow-500/90 text-white' :
                'bg-red-500/90 text-white'
              }`}>
                {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
              </Badge>
            )}
            {recipe.cuisine && (
              <Badge className="text-xs px-2 py-1 rounded-lg backdrop-blur-sm bg-blue-500/90 text-white">
                {recipe.cuisine}
              </Badge>
            )}
          </div>
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-lg font-bold text-white mb-2 leading-tight">
            {recipe.title}
          </h3>
          <div className="flex items-center gap-3 text-sm text-white/90">
            {totalTime > 0 && (
              <span className="flex items-center gap-1 bg-black/30 rounded-lg px-2 py-1 backdrop-blur-sm">
                <Clock className="h-4 w-4" />
                {totalTime}m
              </span>
            )}
            {recipe.servings && (
              <span className="flex items-center gap-1 bg-black/30 rounded-lg px-2 py-1 backdrop-blur-sm">
                <Users className="h-4 w-4" />
                {recipe.servings}
              </span>
            )}
            {recipe.rating && recipe.rating > 0 && (
              <span className="flex items-center gap-1 bg-black/30 rounded-lg px-2 py-1 backdrop-blur-sm">
                <Star className="h-4 w-4 fill-current text-yellow-400" />
                {recipe.rating.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {recipe.description && (
          <p className="text-sm text-white/60 leading-relaxed line-clamp-2">
            {recipe.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <div className="flex flex-wrap gap-1">
            {(recipe.tags || []).slice(0, 2).map(tag => (
              <Badge
                key={tag}
                className="text-xs px-2 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/30"
              >
                {tag}
              </Badge>
            ))}
          </div>
          {recipe.ratingsCount && recipe.ratingsCount > 0 && (
            <div className="text-xs text-white/50">
              {recipe.ratingsCount} {recipe.ratingsCount === 1 ? 'review' : 'reviews'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
