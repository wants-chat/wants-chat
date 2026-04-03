import React from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import Icon from '@mdi/react';
import { mdiWater } from '@mdi/js';

interface WaterTrackerProps {
  waterIntake: number;
  waterGoal: number;
  onAddWater: (amount: number) => void;
  onRemoveWater: (amount: number) => void;
}

const WaterTracker: React.FC<WaterTrackerProps> = ({
  waterIntake,
  waterGoal,
  onAddWater,
  onRemoveWater
}) => {
  const waterProgress = (waterIntake / waterGoal) * 100;

  return (
    <Card className="p-6 bg-white/5 border border-white/10">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon path={mdiWater} size={1.2} className="text-blue-400" />
            <div>
              <h3 className="font-semibold text-white">Water Intake</h3>
              <p className="text-sm text-white/60">
                {(waterIntake / 1000).toFixed(1)}L of {(waterGoal / 1000).toFixed(1)}L
              </p>
            </div>
          </div>

          <Badge
            className={waterIntake >= waterGoal
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              : 'bg-white/10 text-white/70 border border-white/20'
            }
          >
            {Math.round(waterProgress)}%
          </Badge>
        </div>

        <Progress value={Math.min(waterProgress, 100)} className="h-3 bg-white/10 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-cyan-500" />

        <div className="space-y-3">
          {/* Add Water Buttons */}
          <div className="flex gap-2 justify-center">
            <Button size="sm" onClick={() => onAddWater(250)} className="bg-white/10 border border-white/20 text-white hover:bg-teal-500/20 hover:border-teal-400 hover:text-teal-400">
              +250ml
            </Button>
            <Button size="sm" onClick={() => onAddWater(500)} className="bg-white/10 border border-white/20 text-white hover:bg-teal-500/20 hover:border-teal-400 hover:text-teal-400">
              +500ml
            </Button>
            <Button size="sm" onClick={() => onAddWater(1000)} className="bg-white/10 border border-white/20 text-white hover:bg-teal-500/20 hover:border-teal-400 hover:text-teal-400">
              +1L
            </Button>
          </div>

          {/* Remove Water Buttons */}
          {waterIntake > 0 && (
            <div className="flex gap-2 justify-center">
              <Button
                size="sm"
                onClick={() => onRemoveWater(250)}
                disabled={waterIntake < 250}
                className="bg-white/5 border border-white/10 text-white/60 hover:bg-red-500/20 hover:border-red-400 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                -250ml
              </Button>
              <Button
                size="sm"
                onClick={() => onRemoveWater(500)}
                disabled={waterIntake < 500}
                className="bg-white/5 border border-white/10 text-white/60 hover:bg-red-500/20 hover:border-red-400 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                -500ml
              </Button>
              <Button
                size="sm"
                onClick={() => onRemoveWater(1000)}
                disabled={waterIntake < 1000}
                className="bg-white/5 border border-white/10 text-white/60 hover:bg-red-500/20 hover:border-red-400 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                -1L
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default WaterTracker;