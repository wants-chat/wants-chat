import React from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import Icon from '@mdi/react';
import { 
  mdiPlus,
  mdiSilverwareForkKnife,
  mdiClockOutline,
  mdiChevronRight,
  mdiFire
} from '@mdi/js';
import { MealType, FoodEntry } from '../../../types/calories-tracker';

interface MealCardProps {
  mealType: MealType;
  entries: FoodEntry[];
  totalCalories: number;
  goalCalories?: number;
  onAddFood?: (mealType: MealType) => void;
  onViewMeal?: (mealType: MealType) => void;
  showProgress?: boolean;
}

const MealCard: React.FC<MealCardProps> = ({
  mealType,
  entries,
  totalCalories,
  goalCalories,
  onAddFood,
  onViewMeal,
  showProgress = true
}) => {
  const getMealIcon = (meal: MealType) => {
    return mdiSilverwareForkKnife;
  };

  const getMealTime = (meal: MealType) => {
    switch (meal) {
      case 'breakfast':
        return '7:00 - 10:00 AM';
      case 'lunch':
        return '12:00 - 2:00 PM';
      case 'dinner':
        return '6:00 - 9:00 PM';
      case 'snacks':
        return 'Anytime';
      default:
        return '';
    }
  };

  const getMealColor = (meal: MealType) => {
    switch (meal) {
      case 'breakfast':
        return 'from-orange-500/10 to-yellow-500/10 border-orange-200';
      case 'lunch':
        return 'from-emerald-500/10 to-green-500/10 border-emerald-200';
      case 'dinner':
        return 'from-blue-500/10 to-indigo-500/10 border-blue-200';
      case 'snacks':
        return 'from-purple-500/10 to-pink-500/10 border-purple-200';
      default:
        return 'from-gray-500/10 to-gray-600/10 border-gray-200';
    }
  };

  const progressPercentage = goalCalories ? (totalCalories / goalCalories) * 100 : 0;

  return (
    <Card className={`p-4 bg-gradient-to-br ${getMealColor(mealType)} border-2 hover:shadow-lg transition-all duration-200`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg">
              <Icon path={getMealIcon(mealType)} size={1} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground capitalize">
                {mealType}
              </h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Icon path={mdiClockOutline} size={0.5} />
                <span>{getMealTime(mealType)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {onViewMeal && entries.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onViewMeal(mealType)}
                className="h-8 w-8 p-0"
              >
                <Icon path={mdiChevronRight} size={0.6} />
              </Button>
            )}
            {onAddFood && (
              <Button
                size="sm"
                onClick={() => onAddFood(mealType)}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-primary-foreground h-8"
              >
                <Icon path={mdiPlus} size={0.6} className="mr-1" />
                Add
              </Button>
            )}
          </div>
        </div>

        {/* Calories Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon path={mdiFire} size={0.8} className="text-destructive" />
            <span className="text-2xl font-bold text-foreground">{totalCalories}</span>
            <span className="text-sm text-muted-foreground">
              {goalCalories ? `/ ${goalCalories} cal` : 'calories'}
            </span>
          </div>
          
          {entries.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {entries.length} item{entries.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {/* Progress Bar */}
        {showProgress && goalCalories && (
          <div className="space-y-1">
            <div className="h-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{progressPercentage.toFixed(0)}% of goal</span>
              {progressPercentage > 100 && (
                <span className="text-destructive font-medium">
                  +{(totalCalories - goalCalories)} over
                </span>
              )}
            </div>
          </div>
        )}

        {/* Food Items Preview */}
        {entries.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Recent items:</div>
            <div className="space-y-1">
              {entries.slice(0, 2).map((entry, index) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between text-sm bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg p-2"
                >
                  <span className="font-medium text-white truncate">
                    {entry.food.name}
                  </span>
                  <span className="text-white/60 whitespace-nowrap ml-2">
                    {Math.round(entry.food.calories * entry.quantity)} cal
                  </span>
                </div>
              ))}
              {entries.length > 2 && (
                <div className="text-xs text-muted-foreground text-center py-1">
                  +{entries.length - 2} more item{entries.length - 2 > 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {entries.length === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              No foods added yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Track your {mealType} to see progress
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default MealCard;