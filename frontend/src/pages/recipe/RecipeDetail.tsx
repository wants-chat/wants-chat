import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { Recipe } from '../../types/recipe';
import { useRecipe, useDeleteRecipe } from '../../hooks/useRecipes';
import { toast } from '../../components/ui/sonner';
import { recipeService } from '../../services/recipeService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { RecipeHeader } from '../../components/recipe/RecipeHeader';
import { RecipeDetailHero } from '../../components/recipe/RecipeDetailHero';
import { RecipeDetailCookingMode } from '../../components/recipe/RecipeDetailCookingMode';
import { RecipeDetailContent } from '../../components/recipe/RecipeDetailContent';
import { RecipeDetailSidebar } from '../../components/recipe/RecipeDetailSidebar';
import { RecipeRatingDisplay } from '../../components/recipe/RecipeRatingDisplay';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';

// Transform Recipe to LegacyRecipe format for compatibility
const transformToLegacyFormat = (recipe: Recipe): any => ({
  ...recipe,
  image: recipe.imageUrl,
  difficulty: recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1),
  isFavorite: recipe.isFavorited,
  userId: recipe.userId
});

const RecipeDetail: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { id } = useParams();
  const { data: apiRecipe, loading, error } = useRecipe(id || null);
  const [recipe, setRecipe] = useState<any>(null);
  const [isCooking, setIsCooking] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedIngredients, setCompletedIngredients] = useState<boolean[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const deleteRecipe = useDeleteRecipe();

  useEffect(() => {
    if (apiRecipe) {
      const transformedRecipe = transformToLegacyFormat(apiRecipe);
      setRecipe(transformedRecipe);
      setCompletedIngredients(new Array(transformedRecipe.ingredients.length).fill(false));
    }
  }, [apiRecipe]);

  const toggleFavorite = useCallback(async () => {
    if (!recipe || !id) return;

    const isCurrentlyFavorited = recipe.isFavorited;

    // Optimistically update UI
    setRecipe((prev: any) => prev ? { ...prev, isFavorited: !prev.isFavorited } : null);

    try {
      if (isCurrentlyFavorited) {
        await recipeService.removeFromFavorites(id);
        toast.success('Removed from favorites');
      } else {
        await recipeService.addToFavorites(id);
        toast.success('Added to favorites');
      }
    } catch (error) {
      // Revert on error
      setRecipe((prev: any) => prev ? { ...prev, isFavorited: isCurrentlyFavorited } : null);
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  }, [recipe, id]);

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await deleteRecipe.mutateAsync(id);
      toast.success('The recipe has been successfully deleted! 🗑️');
      navigate('/recipe-builder?tab=recipes');
    } catch (error) {
      console.error('Failed to delete recipe:', error);
      toast.error('Failed to delete recipe. Please try again.');
    }
    setShowDeleteDialog(false);
  };

  const toggleIngredient = (index: number) => {
    setCompletedIngredients((prev: boolean[]) => {
      const newCompleted = [...prev];
      newCompleted[index] = !newCompleted[index];
      return newCompleted;
    });
  };

  const startCooking = () => {
    setIsCooking(true);
    setCurrentStep(0);
  };

  const nextStep = () => {
    if (recipe && currentStep < recipe.instructions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <BackgroundEffects />
        <div className="relative z-10">
          <RecipeHeader
            title="Loading Recipe"
            theme={theme}
            toggleTheme={toggleTheme}
            onBack={() => navigate('/recipe-builder')}
          />
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mb-4"></div>
              <h2 className="text-xl font-semibold mb-2 text-white">Loading Recipe...</h2>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen relative">
        <BackgroundEffects />
        <div className="relative z-10">
          <RecipeHeader
            title="Recipe Not Found"
            theme={theme}
            toggleTheme={toggleTheme}
            onBack={() => navigate('/recipe-builder')}
          />
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2 text-white">Recipe Not Found</h2>
              <p className="text-white/60 mb-4">{error ? 'Failed to load recipe.' : "The recipe you're looking for doesn't exist."}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <BackgroundEffects />

      <div className="relative z-10">
        <RecipeHeader
          title={recipe.title}
          theme={theme}
          toggleTheme={toggleTheme}
          onBack={() => navigate('/recipe-builder')}
        />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <RecipeDetailHero 
          recipe={recipe}
          onToggleFavorite={toggleFavorite}
          onStartCooking={startCooking}
          onEdit={() => navigate(`/recipe-builder/edit/${id}`)}
          onDelete={() => setShowDeleteDialog(true)}
        />

        {isCooking && (
          <RecipeDetailCookingMode
            recipe={recipe}
            currentStep={currentStep}
            onNextStep={nextStep}
            onPrevStep={prevStep}
            onExitCooking={() => setIsCooking(false)}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-6">
            <RecipeDetailContent 
              recipe={recipe}
              isCooking={isCooking}
              currentStep={currentStep}
            />
            
            {/* Ratings Section */}
            {recipe.id && (
              <RecipeRatingDisplay
                recipeId={recipe.id}
                averageRating={recipe.rating || 0}
                totalRatings={recipe.ratingsCount || 0}
                showFullDetails={true}
                onRatingSubmit={() => {
                  // Refresh recipe data after rating
                  if (apiRecipe) {
                    const updatedRecipe = transformToLegacyFormat(apiRecipe);
                    setRecipe(updatedRecipe);
                  }
                }}
              />
            )}
          </div>
          
            <RecipeDetailSidebar
              recipe={recipe}
              completedIngredients={completedIngredients}
              onToggleIngredient={toggleIngredient}
            />
          </div>
        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{recipe?.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
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

export default RecipeDetail;