import React from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import Icon from '@mdi/react';
import { mdiTarget } from '@mdi/js';

interface MotivationCardProps {
  streak: number;
  remainingCalories: number;
  onLogFood: () => void;
}

const MotivationCard: React.FC<MotivationCardProps> = ({
  streak,
  remainingCalories,
  onLogFood
}) => {
  const getStreakMessage = (streak: number) => {
    if (streak === 0) return 'Start your tracking streak today!';
    if (streak === 1) return 'Great start! Keep it going.';
    if (streak < 7) return `${streak} days strong! You're building a habit.`;
    if (streak < 30) return `${streak} day streak! You're doing amazing.`;
    return `${streak} days! You're a tracking champion!`;
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <div className="text-center space-y-3">
        <Icon path={mdiTarget} size={1.5} className="text-primary mx-auto" />
        <div>
          <h3 className="font-semibold text-foreground">
            {getStreakMessage(streak)}
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            {remainingCalories > 0 
              ? `You have ${remainingCalories} calories left for today. Stay on track!`
              : 'You\'ve reached your calorie goal for today. Great work!'
            }
          </p>
        </div>
        <Button
          size="sm"
          onClick={onLogFood}
          className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-primary-foreground"
        >
          Log Food
        </Button>
      </div>
    </Card>
  );
};

export default MotivationCard;