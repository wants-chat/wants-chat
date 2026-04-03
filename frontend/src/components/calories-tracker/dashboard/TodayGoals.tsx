import React from 'react';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import Icon from '@mdi/react';
import { mdiTarget } from '@mdi/js';

interface TodayGoalsProps {
  caloriesProgress: number;
  waterConsumed: number;
  waterGoal: number;
}

const TodayGoals: React.FC<TodayGoalsProps> = ({
  caloriesProgress,
  waterConsumed,
  waterGoal
}) => {
  return (
    <Card className="p-6">
      <h3 className="font-semibold text-foreground mb-4">Today's Goals</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Track meals</span>
          <Badge className="bg-emerald-100 text-emerald-800">
            <Icon path={mdiTarget} size={0.5} className="mr-1" />
            Complete
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Meet calorie goal</span>
          <Badge variant={caloriesProgress >= 90 && caloriesProgress <= 110 ? "default" : "secondary"}>
            {Math.round(caloriesProgress)}%
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Drink 2.5L water</span>
          <Badge variant={waterConsumed >= waterGoal * 0.8 ? "default" : "secondary"}>
            {Math.round((waterConsumed / waterGoal) * 100)}%
          </Badge>
        </div>
      </div>
    </Card>
  );
};

export default TodayGoals;