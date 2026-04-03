import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Users, Star, Heart, ChefHat, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Recipe } from '../../types/recipe';
import { useDeleteRecipe } from '../../hooks/useRecipes';
import { toast } from '../ui/sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

interface EmptyStateConfig {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}

interface RecipeGridProps {
  recipes: Recipe[];
  onToggleFavorite: (recipeId: string) => void;
  emptyStateConfig: EmptyStateConfig;
}

export const RecipeGrid: React.FC<RecipeGridProps> = ({
  recipes,
  onToggleFavorite,
  emptyStateConfig
}) => {
  const navigate = useNavigate();
  const deleteRecipe = useDeleteRecipe();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);

  const handleDelete = async () => {
    if (!recipeToDelete) return;
    
    try {
      await deleteRecipe.mutateAsync(recipeToDelete.id);
      toast.success('The recipe has been successfully deleted! 🗑️');
      // The list should refresh automatically through React Query
    } catch (error) {
      console.error('Failed to delete recipe:', error);
      toast.error('Failed to delete recipe. Please try again.');
    }
    setDeleteDialogOpen(false);
    setRecipeToDelete(null);
  };

  if (recipes.length === 0) {
    return (
      <Card className="rounded-xl p-12 text-center bg-white/10 backdrop-blur-xl border border-white/20">
        <ChefHat className="h-16 w-16 mx-auto mb-4 text-teal-400/50" />
        <h3 className="text-xl font-semibold mb-2 text-white">
          {emptyStateConfig.title}
        </h3>
        <p className="text-white/60 mb-6">
          {emptyStateConfig.description}
        </p>
        <Button
          onClick={emptyStateConfig.onAction}
          variant="ghost"
          className="rounded-xl border border-white/20 text-white hover:bg-white/10"
        >
          {emptyStateConfig.actionLabel}
        </Button>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {recipes.map((recipe) => (
        <Card
          key={recipe.id}
          className="cursor-pointer rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 border-l-4 border-l-primary hover:shadow-xl transition-all duration-300 overflow-hidden group"
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
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <ChefHat className="h-16 w-16 text-primary" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            
            {/* Top badges */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
              <div className="flex gap-2">
                <Badge className={`text-xs px-2 py-1 rounded-lg backdrop-blur-sm ${
                  recipe.difficulty === 'easy' ? 'bg-emerald-500/90 text-white' :
                  recipe.difficulty === 'medium' ? 'bg-yellow-500/90 text-white' :
                  'bg-red-500/90 text-white'
                }`}>
                  {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
                </Badge>
                {recipe.cuisine && (
                  <Badge className="text-xs px-2 py-1 rounded-lg backdrop-blur-sm bg-blue-500/90 text-white">
                    {recipe.cuisine}
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(recipe.id);
                  }}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm h-10 w-10 rounded-full"
                >
                  {recipe.isFavorited ? (
                    <Heart className="h-5 w-5 text-red-500 fill-current" />
                  ) : (
                    <Heart className="h-5 w-5 text-white" />
                  )}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-white/20 hover:bg-white/30 backdrop-blur-sm h-10 w-10 rounded-full"
                    >
                      <MoreVertical className="h-5 w-5 text-white" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/recipe-builder/edit/${recipe.id}`);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setRecipeToDelete(recipe);
                        setDeleteDialogOpen(true);
                      }}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Bottom info */}
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-lg font-bold text-white mb-2 leading-tight">
                {recipe.title}
              </h3>
              <div className="flex items-center gap-3 text-sm text-white/90">
                <span className="flex items-center gap-1 bg-black/20 rounded-lg px-2 py-1 backdrop-blur-sm">
                  <Clock className="h-4 w-4" />
                  {(recipe.cookTime || 0) + (recipe.prepTime || 0)}m
                </span>
                <span className="flex items-center gap-1 bg-black/20 rounded-lg px-2 py-1 backdrop-blur-sm">
                  <Users className="h-4 w-4" />
                  {recipe.servings}
                </span>
                {recipe.rating > 0 && (
                  <span className="flex items-center gap-1 bg-black/20 rounded-lg px-2 py-1 backdrop-blur-sm">
                    <Star className="h-4 w-4 fill-current text-yellow-400" />
                    {recipe.rating}
                  </span>
                )}
              </div>
            </div>
          </div>

          <CardContent className="p-4 space-y-4">
            <p className="text-sm text-white/80 leading-relaxed line-clamp-2">
              {recipe.description}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-white/20">
              <div className="flex flex-wrap gap-1">
                {(recipe.tags || []).slice(0, 2).map(tag => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs px-2 py-1 bg-teal-500/20 text-teal-400 border-0"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="text-xs text-white/60">
                {recipe.createdAt}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{recipeToDelete?.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRecipeToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Recipe
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};