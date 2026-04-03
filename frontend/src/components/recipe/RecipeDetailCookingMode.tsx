import React from 'react';
import { Timer } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { LegacyRecipe } from '../../types/recipe';

interface RecipeDetailCookingModeProps {
  recipe: LegacyRecipe;
  currentStep: number;
  onNextStep: () => void;
  onPrevStep: () => void;
  onExitCooking: () => void;
}

export const RecipeDetailCookingMode: React.FC<RecipeDetailCookingModeProps> = ({
  recipe,
  currentStep,
  onNextStep,
  onPrevStep,
  onExitCooking
}) => {
  return (
    <Card className="mb-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 border-l-4 border-l-teal-500">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <span className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-teal-400" />
            Cooking Mode - Step {currentStep + 1} of {recipe.instructions.length}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onExitCooking}
            className="rounded-xl border border-white/20 text-white hover:bg-white/10"
          >
            Exit
          </Button>
        </CardTitle>
        <Progress value={((currentStep + 1) / recipe.instructions.length) * 100} className="w-full" />
      </CardHeader>
      <CardContent>
        <div className="text-lg mb-4 leading-relaxed text-white/80">
          {recipe.instructions[currentStep]}
        </div>
        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={onPrevStep}
            disabled={currentStep === 0}
            className="rounded-xl border border-white/20 text-white hover:bg-white/10 disabled:opacity-50"
          >
            Previous
          </Button>
          <Button
            onClick={onNextStep}
            disabled={currentStep === recipe.instructions.length - 1}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl flex-1 disabled:opacity-50"
          >
            {currentStep === recipe.instructions.length - 1 ? 'Finish' : 'Next Step'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};