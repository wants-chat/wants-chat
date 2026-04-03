import React from 'react';
import { Card } from '../../ui/card';
import Icon from '@mdi/react';
import { mdiFire, mdiWater, mdiTrendingUp, mdiTarget } from '@mdi/js';

interface QuickStatsProps {
  consumedCalories: number;
  remainingCalories: number;
  waterConsumed: number;
  waterGoal: number;
  currentWeight: number;
  weightChange: number;
  streak: number;
}

const QuickStats: React.FC<QuickStatsProps> = ({
  consumedCalories,
  remainingCalories,
  waterConsumed,
  waterGoal,
  currentWeight,
  weightChange,
  streak
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="p-4 text-center">
        <Icon path={mdiFire} size={1.5} className="text-destructive mx-auto mb-2" />
        <p className="text-2xl font-bold text-foreground">{consumedCalories}</p>
        <p className="text-xs text-muted-foreground">Calories Today</p>
        <p className={`text-xs font-medium ${remainingCalories > 0 ? 'text-emerald-600' : 'text-orange-600'}`}>
          {remainingCalories > 0 ? `${remainingCalories} left` : `${Math.abs(remainingCalories)} over`}
        </p>
      </Card>
      
      <Card className="p-4 text-center">
        <Icon path={mdiWater} size={1.5} className="text-primary mx-auto mb-2" />
        <p className="text-2xl font-bold text-foreground">{(waterConsumed / 1000).toFixed(1)}L</p>
        <p className="text-xs text-muted-foreground">Water Today</p>
        <p className="text-xs text-blue-600 font-medium">
          {Math.round((waterConsumed / waterGoal) * 100)}% of goal
        </p>
      </Card>
      
      <Card className="p-4 text-center">
        <Icon path={mdiTrendingUp} size={1.5} className="text-emerald-600 mx-auto mb-2" />
        <p className="text-2xl font-bold text-foreground">{currentWeight}kg</p>
        <p className="text-xs text-muted-foreground">Current Weight</p>
        <p className={`text-xs font-medium ${weightChange < 0 ? 'text-emerald-600' : 'text-orange-600'}`}>
          {weightChange > 0 ? '+' : ''}{weightChange}kg this week
        </p>
      </Card>
      
      <Card className="p-4 text-center">
        <Icon path={mdiTarget} size={1.5} className="text-primary mx-auto mb-2" />
        <p className="text-2xl font-bold text-foreground">{streak}</p>
        <p className="text-xs text-muted-foreground">Day Streak</p>
        <p className="text-xs text-primary font-medium">Keep it up!</p>
      </Card>
    </div>
  );
};

export default QuickStats;