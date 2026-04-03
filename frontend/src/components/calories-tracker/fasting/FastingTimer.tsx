import React from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Progress } from '../../ui/progress';
import Icon from '@mdi/react';
import { 
  mdiPlay,
  mdiPause,
  mdiStop,
  mdiWater,
  mdiFoodOff
} from '@mdi/js';

interface FastingTimerProps {
  planName: string;
  startTime: Date;
  elapsedTime: number;
  targetDuration: number;
  isPaused: boolean;
  onPause: () => void;
  onStop: () => void;
}

const FastingTimer: React.FC<FastingTimerProps> = ({
  planName,
  startTime,
  elapsedTime,
  targetDuration,
  isPaused,
  onPause,
  onStop
}) => {
  // Safe values to prevent NaN
  const safeElapsedTime = elapsedTime || 0;
  const safeTargetDuration = targetDuration || 1;

  const formatTime = (seconds: number) => {
    const safeSeconds = isNaN(seconds) ? 0 : Math.max(0, seconds);
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const secs = Math.floor(safeSeconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const progress = (safeElapsedTime / (safeTargetDuration * 3600)) * 100;
    return isNaN(progress) ? 0 : Math.min(progress, 100);
  };

  const getRemainingTime = () => {
    const remaining = safeTargetDuration * 3600 - safeElapsedTime;
    return isNaN(remaining) ? 0 : Math.max(remaining, 0);
  };

  return (
    <Card className="p-8 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border border-teal-500/20">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            {planName} Fast
          </h2>
          <p className="text-white/60">
            Started {startTime instanceof Date && !isNaN(startTime.getTime())
              ? startTime.toLocaleTimeString()
              : 'now'}
          </p>
        </div>

        {/* Timer Display */}
        <div className="text-center">
          <div className="text-6xl font-bold text-teal-400 mb-2">
            {formatTime(safeElapsedTime)}
          </div>
          <p className="text-sm text-white/60">
            {formatTime(getRemainingTime())} remaining
          </p>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <Progress value={getProgress()} className="h-3 bg-white/10 [&>div]:bg-gradient-to-r [&>div]:from-teal-500 [&>div]:to-cyan-500" />
          <div className="flex justify-between text-sm text-white/60">
            <span>0h</span>
            <span>{Math.round(getProgress())}%</span>
            <span>{safeTargetDuration}h</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3 justify-center">
          <Button
            size="lg"
            onClick={onPause}
            className="bg-white/10 border border-white/20 text-white hover:bg-white/20"
          >
            <Icon path={isPaused ? mdiPlay : mdiPause} size={1} className="mr-2" />
            {isPaused ? 'Resume' : 'Pause'}
          </Button>

          <Button
            size="lg"
            onClick={onStop}
            className="bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30"
          >
            <Icon path={mdiStop} size={1} className="mr-2" />
            End Fast
          </Button>
        </div>

        {/* Tips */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="text-center p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
            <Icon path={mdiWater} size={1.5} className="text-cyan-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-white">Stay Hydrated</p>
            <p className="text-xs text-white/60">Drink water regularly</p>
          </div>

          <div className="text-center p-4 bg-orange-500/10 rounded-lg border border-orange-500/30">
            <Icon path={mdiFoodOff} size={1.5} className="text-orange-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-white">No Calories</p>
            <p className="text-xs text-white/60">Black coffee/tea OK</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default FastingTimer;