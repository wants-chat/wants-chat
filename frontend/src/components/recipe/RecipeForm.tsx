import React, { useRef } from 'react';
import { Plus, Delete, ChefHat, Sparkles, Upload, Image, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { LegacyRecipe, UploadMethod } from '../../types/recipe';

interface RecipeFormProps {
  recipe: Partial<LegacyRecipe>;
  onRecipeChange: (recipe: Partial<LegacyRecipe>) => void;
  onAddIngredient: () => void;
  onRemoveIngredient: (index: number) => void;
  onUpdateIngredient: (index: number, value: string) => void;
  onAddInstruction: () => void;
  onRemoveInstruction: (index: number) => void;
  onUpdateInstruction: (index: number, value: string) => void;
  uploadMethod: UploadMethod;
  onImageUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage?: () => void;
  imagePreview?: string | null;
}

export const RecipeForm: React.FC<RecipeFormProps> = ({
  recipe,
  onRecipeChange,
  onAddIngredient,
  onRemoveIngredient,
  onUpdateIngredient,
  onAddInstruction,
  onRemoveInstruction,
  onUpdateInstruction,
  uploadMethod,
  onImageUpload,
  onRemoveImage,
  imagePreview
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  return (
    <Card className="mb-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 border-l-4 border-l-primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl font-bold text-white">
          <ChefHat className="h-6 w-6 text-primary" />
          Recipe Details
          {recipe.aiAnalyzed && (
            <Badge className="bg-purple-500 text-white ml-2">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Generated
            </Badge>
          )}
        </CardTitle>
        <CardDescription className="text-base text-white/80">
          {uploadMethod === 'manual' ? 'Fill in your recipe information below' : 'Review and edit the AI-generated recipe details'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-semibold text-white">Recipe Title *</Label>
              <Input
                id="title"
                value={recipe.title || ''}
                onChange={(e) => onRecipeChange({ ...recipe, title: e.target.value })}
                placeholder="Enter recipe title"
                className="h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cuisine" className="text-sm font-semibold text-white">Cuisine</Label>
              <Select
                value={recipe.cuisine || ''}
                onValueChange={(value) => onRecipeChange({ ...recipe, cuisine: value })}
              >
                <SelectTrigger className="h-12 rounded-xl bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select cuisine type" />
                </SelectTrigger>
                <SelectContent className="bg-teal-800/90 border-teal-400/30">
                  <SelectItem value="Italian" className="text-white hover:bg-white/10 focus:bg-white/10">Italian</SelectItem>
                  <SelectItem value="Chinese" className="text-white hover:bg-white/10 focus:bg-white/10">Chinese</SelectItem>
                  <SelectItem value="Mexican" className="text-white hover:bg-white/10 focus:bg-white/10">Mexican</SelectItem>
                  <SelectItem value="Indian" className="text-white hover:bg-white/10 focus:bg-white/10">Indian</SelectItem>
                  <SelectItem value="Bengali" className="text-white hover:bg-white/10 focus:bg-white/10">Bengali</SelectItem>
                  <SelectItem value="Thai" className="text-white hover:bg-white/10 focus:bg-white/10">Thai</SelectItem>
                  <SelectItem value="Japanese" className="text-white hover:bg-white/10 focus:bg-white/10">Japanese</SelectItem>
                  <SelectItem value="French" className="text-white hover:bg-white/10 focus:bg-white/10">French</SelectItem>
                  <SelectItem value="Mediterranean" className="text-white hover:bg-white/10 focus:bg-white/10">Mediterranean</SelectItem>
                  <SelectItem value="Korean" className="text-white hover:bg-white/10 focus:bg-white/10">Korean</SelectItem>
                  <SelectItem value="Vietnamese" className="text-white hover:bg-white/10 focus:bg-white/10">Vietnamese</SelectItem>
                  <SelectItem value="Greek" className="text-white hover:bg-white/10 focus:bg-white/10">Greek</SelectItem>
                  <SelectItem value="Spanish" className="text-white hover:bg-white/10 focus:bg-white/10">Spanish</SelectItem>
                  <SelectItem value="Turkish" className="text-white hover:bg-white/10 focus:bg-white/10">Turkish</SelectItem>
                  <SelectItem value="Lebanese" className="text-white hover:bg-white/10 focus:bg-white/10">Lebanese</SelectItem>
                  <SelectItem value="Moroccan" className="text-white hover:bg-white/10 focus:bg-white/10">Moroccan</SelectItem>
                  <SelectItem value="Brazilian" className="text-white hover:bg-white/10 focus:bg-white/10">Brazilian</SelectItem>
                  <SelectItem value="Peruvian" className="text-white hover:bg-white/10 focus:bg-white/10">Peruvian</SelectItem>
                  <SelectItem value="British" className="text-white hover:bg-white/10 focus:bg-white/10">British</SelectItem>
                  <SelectItem value="German" className="text-white hover:bg-white/10 focus:bg-white/10">German</SelectItem>
                  <SelectItem value="American" className="text-white hover:bg-white/10 focus:bg-white/10">American</SelectItem>
                  <SelectItem value="Fusion" className="text-white hover:bg-white/10 focus:bg-white/10">Fusion</SelectItem>
                  <SelectItem value="Others" className="text-white hover:bg-white/10 focus:bg-white/10">Others</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-semibold text-white">Description</Label>
          <Textarea
            id="description"
            value={recipe.description || ''}
            onChange={(e) => onRecipeChange({ ...recipe, description: e.target.value })}
            placeholder="Describe your recipe..."
            rows={3}
            className="rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40"
          />
        </div>

        {/* Image Upload - Only show for manual entry */}
        {uploadMethod === 'manual' && (
          <div className="space-y-4">
            <Label className="text-sm font-semibold text-white">Recipe Image</Label>
            
            {imagePreview ? (
              <div className="relative">
                <div className="relative w-full h-48 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Recipe preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={onRemoveImage}
                      className="h-8 w-8 p-0 rounded-full"
                      title="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-xl bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Change Image
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div
                  className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => {
                    console.log('Upload area clicked');
                    fileInputRef.current?.click();
                  }}
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <Image className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-white mb-2">
                        Add Recipe Image
                      </p>
                      <p className="text-sm text-white/60 mb-4">
                        Upload an image of your finished dish
                      </p>
                      <Button
                        variant="outline"
                        className="rounded-xl bg-white/10 border-white/20 text-white hover:bg-white/20"
                        type="button"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Image
                      </Button>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-white/50 text-center">
                  Supported formats: JPG, PNG, GIF (max 5MB)
                </p>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                console.log('File input changed:', e.target.files);
                if (onImageUpload) {
                  onImageUpload(e);
                } else {
                  console.error('onImageUpload handler not provided');
                }
              }}
              className="hidden"
            />
          </div>
        )}

        {/* Time and Servings */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <Label htmlFor="prep-time" className="text-sm font-semibold text-white">Prep Time (min)</Label>
            <Input
              id="prep-time"
              type="number"
              value={recipe.prepTime || 0}
              onChange={(e) => onRecipeChange({ ...recipe, prepTime: parseInt(e.target.value) || 0 })}
              className="h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40"
              min="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cook-time" className="text-sm font-semibold text-white">Cook Time (min)</Label>
            <Input
              id="cook-time"
              type="number"
              value={recipe.cookTime || 0}
              onChange={(e) => onRecipeChange({ ...recipe, cookTime: parseInt(e.target.value) || 0 })}
              className="h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40"
              min="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="servings" className="text-sm font-semibold text-white">Servings</Label>
            <Input
              id="servings"
              type="number"
              value={recipe.servings || 1}
              onChange={(e) => onRecipeChange({ ...recipe, servings: parseInt(e.target.value) || 1 })}
              className="h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40"
              min="1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="difficulty" className="text-sm font-semibold text-white">Difficulty</Label>
            <Select
              value={recipe.difficulty}
              onValueChange={(value) => onRecipeChange({ ...recipe, difficulty: value as LegacyRecipe['difficulty'] })}
            >
              <SelectTrigger className="h-12 rounded-xl bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-teal-800/90 border-teal-400/30">
                <SelectItem value="Easy" className="text-white hover:bg-white/10 focus:bg-white/10">Easy</SelectItem>
                <SelectItem value="Medium" className="text-white hover:bg-white/10 focus:bg-white/10">Medium</SelectItem>
                <SelectItem value="Hard" className="text-white hover:bg-white/10 focus:bg-white/10">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Ingredients */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold text-white">Ingredients</Label>
            <Button
              type="button"
              onClick={onAddIngredient}
              size="sm"
              variant="outline"
              className="rounded-xl bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Ingredient
            </Button>
          </div>
          <div className="space-y-4">
            {recipe.ingredients?.map((ingredient, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center text-sm font-semibold text-teal-400">
                  {index + 1}
                </div>
                <Input
                  value={ingredient}
                  onChange={(e) => onUpdateIngredient(index, e.target.value)}
                  placeholder="e.g., 2 cups all-purpose flour"
                  className="h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
                {(recipe.ingredients?.length || 0) > 1 && (
                  <Button
                    type="button"
                    onClick={() => onRemoveIngredient(index)}
                    size="icon"
                    variant="outline"
                    className="rounded-xl flex-shrink-0 h-12 w-12 bg-white/10 border-white/20 text-white/60 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30"
                  >
                    <Delete className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold text-white">Instructions</Label>
            <Button
              type="button"
              onClick={onAddInstruction}
              size="sm"
              variant="outline"
              className="rounded-xl bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Step
            </Button>
          </div>
          <div className="space-y-4">
            {recipe.instructions?.map((instruction, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0 w-10 bg-teal-500/20 rounded-xl flex items-start justify-center text-sm font-semibold text-teal-400 pt-4">
                  {index + 1}
                </div>
                <Textarea
                  value={instruction}
                  onChange={(e) => onUpdateInstruction(index, e.target.value)}
                  placeholder="Describe this cooking step in detail..."
                  rows={3}
                  className="rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
                {(recipe.instructions?.length || 0) > 1 && (
                  <Button
                    type="button"
                    onClick={() => onRemoveInstruction(index)}
                    size="icon"
                    variant="outline"
                    className="rounded-xl flex-shrink-0 h-12 w-12 mt-1 bg-white/10 border-white/20 text-white/60 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30"
                  >
                    <Delete className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};