import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Moon, Sun, Plus, Upload, Video, Image, Sparkles, ChefHat, Camera, Link, FileText, Delete, Check, X, ArrowLeft } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useCreateRecipe, useRecipe, useUpdateRecipe } from '../../hooks/useRecipes';
import { toast } from '../../components/ui/sonner';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { LegacyRecipe, UploadMethod, CreateRecipeData } from '../../types/recipe';
import { RecipeHeader } from '../../components/recipe/RecipeHeader';
import { UploadMethodSelector } from '../../components/recipe/UploadMethodSelector';
import { AIUploadInterface } from '../../components/recipe/AIUploadInterface';
import { RecipeForm } from '../../components/recipe/RecipeForm';
import { api } from '../../lib/api';
import { useConfirmation } from '../../hooks/useConfirmation';
import ConfirmationModal from '../../components/ui/confirmation-modal';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';

const AddRecipe: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get recipe ID if in edit mode
  const isEditMode = !!id;
  const { theme, toggleTheme } = useTheme();
  const createRecipe = useCreateRecipe();
  const updateRecipe = useUpdateRecipe();
  const { data: existingRecipe, loading } = useRecipe(isEditMode ? id : null);
  const [uploadMethod, setUploadMethod] = useState<UploadMethod>('manual');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state for manual recipe entry
  const [newRecipe, setNewRecipe] = useState<Partial<LegacyRecipe>>({
    title: '',
    description: '',
    cookTime: 30,
    prepTime: 15,
    servings: 4,
    difficulty: 'Medium',
    cuisine: '',
    ingredients: [''],
    instructions: [''],
    tags: []
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Confirmation modal hook
  const confirmation = useConfirmation();

  // Load existing recipe data when in edit mode
  useEffect(() => {
    if (isEditMode && existingRecipe) {
      setNewRecipe({
        title: existingRecipe.title,
        description: existingRecipe.description,
        cookTime: existingRecipe.cookTime,
        prepTime: existingRecipe.prepTime,
        servings: existingRecipe.servings,
        difficulty: (existingRecipe.difficulty.charAt(0).toUpperCase() + existingRecipe.difficulty.slice(1)) as 'Easy' | 'Medium' | 'Hard',
        cuisine: existingRecipe.cuisine,
        ingredients: existingRecipe.ingredients || [''],
        instructions: existingRecipe.instructions || [''],
        tags: existingRecipe.tags || [],
        image: existingRecipe.imageUrl
      });
      if (existingRecipe.imageUrl) {
        setImagePreview(existingRecipe.imageUrl);
      }
    }
  }, [isEditMode, existingRecipe]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setNewRecipe(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setNewRecipe(prev => ({ ...prev, image: undefined }));
    setUploadedFile(null);
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const analyzeWithAI = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const aiGeneratedRecipe = {
        title: 'AI-Analyzed Delicious Pasta',
        description: 'A beautiful pasta dish detected from your image with rich tomato sauce and fresh basil',
        cookTime: 20,
        prepTime: 10,
        servings: 4,
        difficulty: 'Medium' as const,
        cuisine: 'Italian',
        ingredients: [
          '400g pasta',
          '2 cups tomato sauce',
          'Fresh basil leaves',
          '100g Parmesan cheese',
          '3 cloves garlic',
          'Extra virgin olive oil'
        ],
        instructions: [
          'Boil pasta according to package directions',
          'Heat olive oil and sauté garlic',
          'Add tomato sauce and simmer',
          'Toss pasta with sauce',
          'Garnish with basil and Parmesan'
        ],
        tags: ['AI-Generated', 'Italian', 'Pasta'],
        aiAnalyzed: true
      };
      
      setNewRecipe(prev => ({ ...prev, ...aiGeneratedRecipe }));
      setIsAnalyzing(false);
    }, 2000);
  };

  const addIngredient = () => {
    setNewRecipe(prev => ({
      ...prev,
      ingredients: [...(prev.ingredients || []), '']
    }));
  };

  const removeIngredient = (index: number) => {
    setNewRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients?.filter((_, i) => i !== index) || []
    }));
  };

  const updateIngredient = (index: number, value: string) => {
    setNewRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients?.map((ingredient, i) => i === index ? value : ingredient) || []
    }));
  };

  const addInstruction = () => {
    setNewRecipe(prev => ({
      ...prev,
      instructions: [...(prev.instructions || []), '']
    }));
  };

  const removeInstruction = (index: number) => {
    setNewRecipe(prev => ({
      ...prev,
      instructions: prev.instructions?.filter((_, i) => i !== index) || []
    }));
  };

  const updateInstruction = (index: number, value: string) => {
    setNewRecipe(prev => ({
      ...prev,
      instructions: prev.instructions?.map((instruction, i) => i === index ? value : instruction) || []
    }));
  };

  const handleSaveRecipe = async () => {
    try {
      // Transform ingredients from strings to objects with proper structure
      const formattedIngredients = newRecipe.ingredients
        ?.filter(ingredient => ingredient.trim())
        .map(ingredient => {
          // Try to parse ingredient string (e.g., "2 cups all-purpose flour")
          const parts = ingredient.trim().split(' ');
          let amount = '';
          let unit = '';
          let name = ingredient;
          
          // Simple parsing: check if first part is a number
          if (parts.length > 1 && !isNaN(parseFloat(parts[0]))) {
            amount = parts[0];
            // Check if second part looks like a unit
            if (parts.length > 2 && ['cup', 'cups', 'tsp', 'tbsp', 'oz', 'lb', 'g', 'kg', 'ml', 'l'].includes(parts[1].toLowerCase())) {
              unit = parts[1];
              name = parts.slice(2).join(' ');
            } else {
              name = parts.slice(1).join(' ');
            }
          }
          
          return {
            name: name || ingredient,
            amount: amount || '1',
            unit: unit || 'piece'
          };
        }) || [];

      // Transform instructions from strings to objects with step numbers
      const formattedInstructions = newRecipe.instructions
        ?.filter(instruction => instruction.trim())
        .map((instruction, index) => ({
          step: index + 1,
          description: instruction
        })) || [];

      // Transform the LegacyRecipe format to the API's CreateRecipeData format
      const recipeData: any = {
        title: newRecipe.title || 'Untitled Recipe',
        description: newRecipe.description || '',
        ingredients: formattedIngredients,
        instructions: formattedInstructions,
        prep_time: newRecipe.prepTime || 15, // Use snake_case
        cook_time: newRecipe.cookTime || 30, // Use snake_case
        servings: newRecipe.servings || 4,
        difficulty: (newRecipe.difficulty?.toLowerCase() as 'easy' | 'medium' | 'hard') || 'medium',
        category: existingRecipe?.category || 'General',
        cuisine: newRecipe.cuisine || 'Other',
        is_public: existingRecipe?.isPublic ?? true, // Use snake_case
        tags: newRecipe.tags || [],
        nutrition: newRecipe.nutrition
      };

      // Handle image upload - similar to blog module
      let imageUrl: string | undefined;
      if (image) {
        const formData = new FormData();
        formData.append('file', image);
        try {
          const response = await api.uploadRecipeImage(formData);
          imageUrl = response.url;
          console.log('Recipe image uploaded successfully:', imageUrl);
        } catch (error) {
          console.error('Recipe image upload failed:', error);
          toast.error('Failed to upload the recipe image. Please try again.');
          return; // Stop if image upload fails
        }
      }

      // Add image URL to recipe data if available
      if (imageUrl) {
        recipeData.image_url = imageUrl.split('?')[0]; // Remove query params like blog does
      } else if (newRecipe.image && typeof newRecipe.image === 'string' && !newRecipe.image.startsWith('data:')) {
        // Use existing image URL if it's not a data URL (e.g., when editing)
        recipeData.image_url = newRecipe.image;
      }

      // Log the data being sent to backend for debugging
      console.log('Recipe data being sent to backend:', JSON.stringify(recipeData, null, 2));
      
      if (isEditMode) {
        // Update existing recipe
        console.log('Updating recipe with ID:', id);
        await updateRecipe.mutateAsync({ id, data: recipeData });
        console.log('Recipe updated successfully');
        toast.success('Your recipe has been updated successfully! 👨‍🍳');
      } else {
        // Create new recipe
        console.log('Creating new recipe...');
        const response = await createRecipe.mutateAsync(recipeData);
        console.log('Recipe created successfully:', response);
        toast.success('Your recipe has been saved successfully! 🎉');
      }
      
      // Navigate back to recipe builder after saving
      navigate('/recipe-builder?tab=recipes');
    } catch (error) {
      console.error(`Failed to ${isEditMode ? 'update' : 'save'} recipe:`, error);
      toast.error(`Failed to ${isEditMode ? 'update' : 'save'} recipe. Please try again.`);
    }
  };

  const handleCancel = async () => {
    // Check if form has been modified
    const hasChanges = newRecipe.title?.trim() !== '' ||
                      newRecipe.description?.trim() !== '' ||
                      newRecipe.ingredients?.some(ing => ing.trim() !== '') ||
                      newRecipe.instructions?.some(inst => inst.trim() !== '') ||
                      image !== null;

    if (hasChanges && !isEditMode) {
      const confirmed = await confirmation.showConfirmation({
        title: 'Discard Recipe',
        message: 'You have unsaved changes. Are you sure you want to leave without saving your recipe?',
        confirmText: 'Discard Changes',
        cancelText: 'Continue Editing',
        variant: 'default'
      });

      if (!confirmed) return;
    }

    navigate('/recipe-builder');
  };

  const handleResetForm = async () => {
    const hasChanges = newRecipe.title?.trim() !== '' ||
                      newRecipe.description?.trim() !== '' ||
                      newRecipe.ingredients?.some(ing => ing.trim() !== '') ||
                      newRecipe.instructions?.some(inst => inst.trim() !== '') ||
                      image !== null;

    if (hasChanges) {
      const confirmed = await confirmation.showConfirmation({
        title: 'Reset Form',
        message: 'Are you sure you want to reset the form? All your current changes will be lost.',
        confirmText: 'Reset Form',
        cancelText: 'Keep Changes',
        variant: 'default'
      });

      if (!confirmed) return;
    }

    resetForm();
  };

  const resetForm = () => {
    setNewRecipe({
      title: '',
      description: '',
      cookTime: 30,
      prepTime: 15,
      servings: 4,
      difficulty: 'Medium',
      cuisine: '',
      ingredients: [''],
      instructions: [''],
      tags: []
    });
    setUploadedFile(null);
    setImage(null);
    setImagePreview(null);
    setVideoUrl('');
    setUploadMethod('manual');
  };

  // Show loading state when fetching recipe in edit mode
  if (isEditMode && loading) {
    return (
      <div className="min-h-screen relative">
        <BackgroundEffects />
        <div className="relative z-10">
          <RecipeHeader
            title="Loading Recipe..."
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

  return (
    <div className="min-h-screen relative">
      <BackgroundEffects />

      <div className="relative z-10">
        <RecipeHeader
          title={isEditMode ? 'Edit Recipe' : 'Add New Recipe'}
          theme={theme}
          toggleTheme={toggleTheme}
          onBack={() => navigate('/recipe-builder')}
        />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6 sm:space-y-8">
          <UploadMethodSelector 
            uploadMethod={uploadMethod}
            onUploadMethodChange={setUploadMethod}
          />

          {uploadMethod !== 'manual' && (
            <AIUploadInterface
              uploadMethod={uploadMethod}
              isAnalyzing={isAnalyzing}
              uploadedFile={uploadedFile}
              videoUrl={videoUrl}
              recipeImage={newRecipe.image}
              fileInputRef={fileInputRef}
              onFileUpload={handleFileUpload}
              onVideoUrlChange={setVideoUrl}
              onAnalyzeWithAI={analyzeWithAI}
            />
          )}

          <RecipeForm
            recipe={newRecipe}
            onRecipeChange={setNewRecipe}
            onAddIngredient={addIngredient}
            onRemoveIngredient={removeIngredient}
            onUpdateIngredient={updateIngredient}
            onAddInstruction={addInstruction}
            onRemoveInstruction={removeInstruction}
            onUpdateInstruction={updateInstruction}
            uploadMethod={uploadMethod}
            onImageUpload={handleFileUpload}
            onRemoveImage={handleRemoveImage}
            imagePreview={imagePreview}
          />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="rounded-xl h-12 px-6 bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleResetForm}
                variant="outline"
                className="rounded-xl h-12 px-6 bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Reset Form
              </Button>
              <Button
                onClick={handleSaveRecipe}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl h-12 px-6 flex-1"
                disabled={!newRecipe.title?.trim() || createRecipe.loading}
              >
                {createRecipe.loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Save Recipe
                  </>
                )}
              </Button>
            </div>
          </div>
        </main>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmation.isOpen}
        onClose={confirmation.handleCancel}
        onConfirm={confirmation.handleConfirm}
        title={confirmation.title}
        message={confirmation.message}
        confirmText={confirmation.confirmText}
        cancelText={confirmation.cancelText}
        variant={confirmation.variant}
        icon={confirmation.icon}
      />
    </div>
  );
};

export default AddRecipe;