import React from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Progress } from '../../ui/progress';
import { Droplets, Plus, Minus } from 'lucide-react';

interface WaterIntakeProps {
  current: number;
  target: number;
  onUpdate: (glasses: number) => void;
}

const WaterIntake: React.FC<WaterIntakeProps> = ({
  current,
  target,
  onUpdate
}) => {
  const percentage = (current / target) * 100;
  const remaining = Math.max(target - current, 0);
  
  const getStatusColor = () => {
    if (percentage < 50) return 'text-orange-400';
    if (percentage >= 100) return 'text-emerald-400';
    return 'text-teal-400';
  };

  const getStatusMessage = () => {
    if (percentage < 50) return 'Keep hydrating!';
    if (percentage < 80) return 'Good progress';
    if (percentage < 100) return 'Almost there!';
    return 'Goal reached!';
  };

  return (
    <Card className="p-6 bg-white/5 border border-white/10">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <Droplets className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Water Intake</h3>
              <p className="text-sm text-white/60">Track your hydration</p>
            </div>
          </div>
        </div>

        {/* Visual Glass Grid */}
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: target }).map((_, index) => (
            <div
              key={index}
              className={`h-16 rounded-lg border-2 transition-all ${
                index < current
                  ? 'bg-gradient-to-b from-cyan-500 to-teal-500 border-cyan-400'
                  : 'bg-white/10 backdrop-blur-xl border-white/20'
              }`}
            />
          ))}
        </div>

        {/* Progress Info */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Progress</span>
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {current} / {target} glasses
            </span>
          </div>

          <Progress value={percentage} className="h-2" />

          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {getStatusMessage()}
            </span>
            <span className="text-sm text-white/60">
              {remaining > 0 ? `${remaining} more to go` : 'Complete!'}
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 bg-white/10 border border-white/20 text-white hover:bg-white/20"
            onClick={() => onUpdate(Math.max(0, current - 1))}
            disabled={current === 0}
          >
            <Minus className="h-4 w-4 mr-1" />
            Remove
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white"
            onClick={() => onUpdate(Math.min(target, current + 1))}
            disabled={current >= target}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Glass
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default WaterIntake;