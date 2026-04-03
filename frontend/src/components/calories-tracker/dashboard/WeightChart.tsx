import React from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import Icon from '@mdi/react';
import { 
  mdiScale,
  mdiTrendingUp,
  mdiTrendingDown,
  mdiMinus,
  mdiPlus,
  mdiTarget
} from '@mdi/js';

interface WeightData {
  date: Date;
  weight?: number;
  calories: number;
}

interface WeightChartProps {
  currentWeight: number;
  goalWeight: number;
  weeklyData: WeightData[];
  onLogWeight: () => void;
}

const WeightChart: React.FC<WeightChartProps> = ({
  currentWeight,
  goalWeight,
  weeklyData,
  onLogWeight
}) => {
  const weightDifference = currentWeight - goalWeight;
  const isLosingWeight = weightDifference > 0;
  const progressPercentage = Math.abs(weightDifference) < 0.1 ? 100 : 
    Math.max(0, 100 - (Math.abs(weightDifference) / Math.abs(weightDifference + 10)) * 100);

  const getWeightTrend = () => {
    const weightEntries = weeklyData.filter(d => d.weight !== undefined);
    if (weightEntries.length < 2) return null;
    
    const recent = weightEntries[weightEntries.length - 1].weight!;
    const previous = weightEntries[weightEntries.length - 2].weight!;
    const change = recent - previous;
    
    return {
      change: Math.abs(change),
      direction: change < 0 ? 'down' : change > 0 ? 'up' : 'stable',
      percentage: Math.abs((change / previous) * 100)
    };
  };

  const trend = getWeightTrend();
  
  const getMotivationMessage = () => {
    if (Math.abs(weightDifference) < 0.5) {
      return "You're at your goal weight! Great job maintaining!";
    }
    
    if (isLosingWeight) {
      if (weightDifference > 10) return `${weightDifference.toFixed(1)}kg to go. You've got this!`;
      if (weightDifference > 5) return `${weightDifference.toFixed(1)}kg to go. You're making progress!`;
      return `Only ${weightDifference.toFixed(1)}kg left. Almost there!`;
    } else {
      return `${Math.abs(weightDifference).toFixed(1)}kg to gain. Stay consistent!`;
    }
  };

  const getEstimatedTimeToGoal = () => {
    if (Math.abs(weightDifference) < 0.5) return null;
    
    // Assume healthy weight loss/gain of 0.5kg per week
    const weeksToGoal = Math.ceil(Math.abs(weightDifference) / 0.5);
    
    if (weeksToGoal <= 4) return `${weeksToGoal} weeks`;
    if (weeksToGoal <= 16) return `${Math.ceil(weeksToGoal / 4)} months`;
    return `${Math.ceil(weeksToGoal / 52)} years`;
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon path={mdiScale} size={1.2} className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Weight Progress</h3>
              <p className="text-sm text-muted-foreground">Track your weight journey</p>
            </div>
          </div>
          
          <Button 
            onClick={onLogWeight}
            size="sm"
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-primary-foreground"
          >
            <Icon path={mdiPlus} size={0.6} className="mr-1" />
            Log Weight
          </Button>
        </div>

        {/* Current Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-secondary/20 rounded-lg">
            <p className="text-2xl font-bold text-foreground">{currentWeight}kg</p>
            <p className="text-xs text-muted-foreground">Current</p>
          </div>
          
          <div className="text-center p-4 bg-secondary/20 rounded-lg">
            <p className="text-2xl font-bold text-primary">{goalWeight}kg</p>
            <p className="text-xs text-muted-foreground">Goal</p>
          </div>
          
          <div className="text-center p-4 bg-secondary/20 rounded-lg">
            <p className={`text-2xl font-bold ${
              Math.abs(weightDifference) < 0.5 ? 'text-emerald-600' : 
              isLosingWeight ? 'text-orange-600' : 'text-blue-600'
            }`}>
              {Math.abs(weightDifference) < 0.1 ? '0' : 
               `${isLosingWeight ? '-' : '+'}${Math.abs(weightDifference).toFixed(1)}`}kg
            </p>
            <p className="text-xs text-muted-foreground">Difference</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Progress to Goal</span>
            <Badge variant={Math.abs(weightDifference) < 0.5 ? "default" : "secondary"}>
              {progressPercentage.toFixed(0)}%
            </Badge>
          </div>
          
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-700 ${
                Math.abs(weightDifference) < 0.5 ? 'bg-emerald-500' : 'bg-primary'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Weekly Trend */}
        {trend && (
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <Icon 
                path={trend.direction === 'down' ? mdiTrendingDown : 
                      trend.direction === 'up' ? mdiTrendingUp : mdiMinus} 
                size={1} 
                className={
                  trend.direction === 'down' ? 'text-emerald-600' : 
                  trend.direction === 'up' ? 'text-orange-600' : 'text-gray-600'
                } 
              />
              <div>
                <p className="font-medium text-foreground">
                  {trend.change.toFixed(1)}kg this week
                </p>
                <p className="text-xs text-muted-foreground">
                  {trend.direction === 'down' ? 'Great progress!' : 
                   trend.direction === 'up' ? 'Stay focused' : 'Staying stable'}
                </p>
              </div>
            </div>
            
            <Badge 
              variant={trend.direction === 'down' ? "default" : "secondary"}
              className={
                trend.direction === 'down' ? 'bg-emerald-100 text-emerald-800' :
                trend.direction === 'up' ? 'bg-orange-100 text-orange-800' :
                'bg-gray-100 text-gray-800'
              }
            >
              {trend.percentage.toFixed(1)}%
            </Badge>
          </div>
        )}

        {/* Motivation & Timeline */}
        <div className="space-y-3">
          <div className="text-center p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20">
            <Icon path={mdiTarget} size={1.2} className="text-primary mx-auto mb-2" />
            <p className="font-medium text-foreground mb-1">
              {getMotivationMessage()}
            </p>
            {getEstimatedTimeToGoal() && (
              <p className="text-sm text-muted-foreground">
                Estimated time to goal: {getEstimatedTimeToGoal()}
              </p>
            )}
          </div>
        </div>

        {/* Mini Chart Representation */}
        <div className="space-y-3">
          <h4 className="font-medium text-foreground">7-Day Overview</h4>
          <div className="flex items-end justify-between gap-1 h-16">
            {weeklyData.map((day, index) => {
              const hasWeight = day.weight !== undefined;
              const height = hasWeight ? 
                Math.max(20, ((day.weight! - goalWeight + 10) / 20) * 100) : 
                Math.max(20, (day.calories / 2500) * 100);
              
              return (
                <div 
                  key={index} 
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div 
                    className={`w-full rounded-t ${
                      hasWeight ? 'bg-primary' : 'bg-secondary'
                    } transition-all duration-300`}
                    style={{ height: `${Math.min(height, 100)}%` }}
                  />
                  <p className="text-xs text-muted-foreground">
                    {day.date.getDate()}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-primary rounded" />
              <span>Weight logged</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-secondary rounded" />
              <span>Calories only</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default WeightChart;