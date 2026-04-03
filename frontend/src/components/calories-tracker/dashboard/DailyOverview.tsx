import React from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Progress } from '../../ui/progress';
import Icon from '@mdi/react';
import { 
  mdiFire,
  mdiWater,
  mdiDumbbell,
  mdiTargetAccount,
  mdiChartLine,
  mdiTrendingUp,
  mdiCalendarToday
} from '@mdi/js';
import NutritionRing from '../ui/NutritionRing';

interface DailyOverviewProps {
  date: Date;
  totalCalories: number;
  goalCalories: number;
  totalProtein: number;
  goalProtein: number;
  totalCarbs: number;
  goalCarbs: number;
  totalFat: number;
  goalFat: number;
  totalWater: number;
  goalWater: number;
  onUpdateGoals?: () => void;
  onViewProgress?: () => void;
}

const DailyOverview: React.FC<DailyOverviewProps> = ({
  date,
  totalCalories,
  goalCalories,
  totalProtein,
  goalProtein,
  totalCarbs,
  goalCarbs,
  totalFat,
  goalFat,
  totalWater,
  goalWater,
  onUpdateGoals,
  onViewProgress
}) => {
  const caloriesPercentage = (totalCalories / goalCalories) * 100;
  const remainingCalories = Math.max(0, goalCalories - totalCalories);
  const isOverGoal = totalCalories > goalCalories;

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon path={mdiCalendarToday} size={1} className="text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{formatDate(date)}</h2>
            <p className="text-sm text-muted-foreground">
              {date.toLocaleDateString('en-US', { 
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {onViewProgress && (
            <Button
              variant="outline"
              size="sm"
              onClick={onViewProgress}
            >
              <Icon path={mdiChartLine} size={0.6} className="mr-1" />
              Progress
            </Button>
          )}
          {onUpdateGoals && (
            <Button
              variant="outline"
              size="sm"
              onClick={onUpdateGoals}
            >
              <Icon path={mdiTargetAccount} size={0.6} className="mr-1" />
              Goals
            </Button>
          )}
        </div>
      </div>

      {/* Main Calories Card */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/20 rounded-xl">
                <Icon path={mdiFire} size={1.5} className="text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Daily Calories</h3>
                <p className="text-sm text-muted-foreground">
                  {isOverGoal ? 'Over goal' : 'On track'}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-3xl font-bold text-foreground">{totalCalories}</p>
              <p className="text-sm text-muted-foreground">/ {goalCalories} cal</p>
            </div>
          </div>

          <div className="space-y-2">
            <Progress 
              value={Math.min(caloriesPercentage, 100)} 
              className="h-3"
            />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {caloriesPercentage.toFixed(0)}% of daily goal
              </span>
              {isOverGoal ? (
                <span className="text-destructive font-medium">
                  +{totalCalories - goalCalories} calories over
                </span>
              ) : (
                <span className="text-emerald-600 font-medium">
                  {remainingCalories} calories remaining
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Macronutrients */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Macronutrients</h3>
            <Button variant="ghost" size="sm">
              <Icon path={mdiTrendingUp} size={0.6} className="mr-1" />
              View Trends
            </Button>
          </div>
          
          <div className="grid grid-cols-3 gap-6">
            <NutritionRing
              current={totalProtein}
              goal={goalProtein}
              label="Protein"
              unit="g"
              color="emerald"
              size="md"
            />
            <NutritionRing
              current={totalCarbs}
              goal={goalCarbs}
              label="Carbs"
              unit="g"
              color="blue"
              size="md"
            />
            <NutritionRing
              current={totalFat}
              goal={goalFat}
              label="Fat"
              unit="g"
              color="orange"
              size="md"
            />
          </div>
        </div>
      </Card>

      {/* Water Intake */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Icon path={mdiWater} size={1.5} className="text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Water Intake</h3>
                <p className="text-sm text-muted-foreground">Stay hydrated</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">
                {(totalWater / 1000).toFixed(1)}L
              </p>
              <p className="text-sm text-muted-foreground">
                / {(goalWater / 1000).toFixed(1)}L
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Progress 
              value={(totalWater / goalWater) * 100} 
              className="h-3 bg-blue-100 dark:bg-blue-950/30"
            />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {Math.round((totalWater / goalWater) * 100)}% of daily goal
              </span>
              <span className="text-blue-600 font-medium">
                {Math.max(0, goalWater - totalWater)}ml remaining
              </span>
            </div>
          </div>

          <Button
            size="sm"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Icon path={mdiWater} size={0.6} className="mr-1" />
            Add Water
          </Button>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="space-y-2">
            <Icon path={mdiFire} size={1} className="text-destructive mx-auto" />
            <p className="text-2xl font-bold text-foreground">{totalCalories}</p>
            <p className="text-xs text-muted-foreground">Calories</p>
          </div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="space-y-2">
            <Icon path={mdiDumbbell} size={1} className="text-emerald-600 mx-auto" />
            <p className="text-2xl font-bold text-foreground">{totalProtein}g</p>
            <p className="text-xs text-muted-foreground">Protein</p>
          </div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="space-y-2">
            <Icon path={mdiWater} size={1} className="text-primary mx-auto" />
            <p className="text-2xl font-bold text-foreground">{(totalWater / 1000).toFixed(1)}L</p>
            <p className="text-xs text-muted-foreground">Water</p>
          </div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="space-y-2">
            <Icon path={mdiTargetAccount} size={1} className="text-primary mx-auto" />
            <p className="text-2xl font-bold text-foreground">{Math.round(caloriesPercentage)}%</p>
            <p className="text-xs text-muted-foreground">Goal</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DailyOverview;