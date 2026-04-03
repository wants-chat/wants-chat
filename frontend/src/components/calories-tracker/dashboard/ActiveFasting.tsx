import React, { useState, useEffect } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Progress } from '../../ui/progress';
import { Clock, Zap, CheckCircle, X } from 'lucide-react';

interface FastingPlan {
  name: string;
  duration: number; // in hours
  startTime: Date;
}

interface ActiveFastingProps {
  fastingPlan: FastingPlan;
  onEndFast: () => void;
}

const ActiveFasting: React.FC<ActiveFastingProps> = ({
  fastingPlan,
  onEndFast
}) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const elapsedMs = now.getTime() - new Date(fastingPlan.startTime).getTime();
      setElapsed(Math.floor(elapsedMs / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [fastingPlan.startTime]);

  const totalSeconds = fastingPlan.duration * 3600;
  const progress = Math.min((elapsed / totalSeconds) * 100, 100);
  const remaining = Math.max(totalSeconds - elapsed, 0);
  const isComplete = elapsed >= totalSeconds;

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${secs}s`;
  };

  const getStatus = () => {
    if (isComplete) return { text: 'Fasting Complete!', color: 'text-emerald-400' };
    if (progress > 80) return { text: 'Almost there!', color: 'text-teal-400' };
    if (progress > 50) return { text: 'Over halfway!', color: 'text-blue-400' };
    return { text: 'Keep going!', color: 'text-orange-400' };
  };

  // Validate fastingPlan structure - protect against invalid localStorage data
  const planName = typeof fastingPlan.name === 'string' ? fastingPlan.name : 'Fasting Session';

  return (
    <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Active Fasting</h3>
              <p className="text-sm text-white/60">{planName}</p>
            </div>
          </div>
          
          <Button
            size="sm"
            onClick={onEndFast}
            className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Timer Display */}
        <div className="text-center">
          <div className="text-4xl font-bold text-white mb-2">
            {formatTime(elapsed)}
          </div>
          <p className={`text-sm font-medium ${getStatus().color}`}>
            {getStatus().text}
          </p>
        </div>

        {/* Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Progress</span>
            <span className="text-sm font-medium text-white">
              {Math.round(progress)}%
            </span>
          </div>

          <Progress value={progress} className="h-3" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-white/60" />
              <span className="text-xs text-white/60">
                Started {new Date(fastingPlan.startTime).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })}
              </span>
            </div>
            <span className="text-xs font-medium text-white">
              {formatTime(remaining)} remaining
            </span>
          </div>
        </div>

        {/* Completion Actions */}
        {isComplete && (
          <div className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              <p className="font-medium text-white">
                Congratulations! You've completed your fast!
              </p>
            </div>
            <Button
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600"
              onClick={onEndFast}
            >
              End Fasting Session
            </Button>
          </div>
        )}

        {/* Tips */}
        <div className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg">
          <h4 className="text-sm font-medium text-white mb-2">Tips</h4>
          <ul className="space-y-1 text-xs text-white/60">
            <li>• Stay hydrated with water, tea, or black coffee</li>
            <li>• Keep yourself busy to avoid thinking about food</li>
            <li>• Listen to your body and stop if you feel unwell</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};

export default ActiveFasting;