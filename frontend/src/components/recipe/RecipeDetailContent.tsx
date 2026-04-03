import React from 'react';
import { ChefHat, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { LegacyRecipe } from '../../types/recipe';

interface RecipeDetailContentProps {
  recipe: LegacyRecipe;
  isCooking: boolean;
  currentStep: number;
}

export const RecipeDetailContent: React.FC<RecipeDetailContentProps> = ({
  recipe,
  isCooking,
  currentStep
}) => {
  return (
    <div className="lg:col-span-2 space-y-6 sm:space-y-8">
      {/* Description */}
      <Card className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <ChefHat className="h-6 w-6 text-primary" />
            About This Recipe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/80 leading-relaxed">
            {recipe.description}
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {recipe.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs bg-white/10 text-white border border-white/20">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <Edit className="h-6 w-6 text-primary" />
            Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recipe.instructions.map((instruction, index) => (
              <div
                key={index}
                className={`flex gap-4 p-4 rounded-xl transition-colors ${
                  isCooking && index === currentStep
                    ? 'bg-primary/10 border border-primary/20'
                    : 'bg-white/5 backdrop-blur-sm border border-white/10'
                }`}
              >
                <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-semibold text-primary">
                  {index + 1}
                </div>
                <p className="text-white/80 leading-relaxed">
                  {instruction}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};