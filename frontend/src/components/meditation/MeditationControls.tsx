import React from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Play, Pause, SkipForward, SkipBack, Volume2 } from 'lucide-react';

interface MeditationControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onSkipForward: () => void;
  onSkipBackward: () => void;
  onProgressClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  formatTime: (seconds: number) => string;
}

export const MeditationControls: React.FC<MeditationControlsProps> = ({
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onSkipForward,
  onSkipBackward,
  onProgressClick,
  formatTime,
}) => {
  const progress = (currentTime / duration) * 100;

  return (
    <div className="text-center">
      {/* Time Display */}
      <div className="text-center mb-8">
        <div className="text-6xl font-light mb-3 text-white">
          {formatTime(currentTime)}
        </div>
        <div className="text-lg text-white/60">of {formatTime(duration)}</div>
        <div className="mt-4">
          <Badge className={isPlaying ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-4 py-1' : 'bg-white/10 text-white/60 px-4 py-1'}>
            {isPlaying ? 'Playing' : 'Paused'}
          </Badge>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-3 mb-8">
        <div
          className="h-2 bg-white/10 rounded-full overflow-hidden cursor-pointer hover:h-3 transition-all duration-200"
          onClick={onProgressClick}
        >
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-white/60">
          <span>{formatTime(Math.floor(currentTime))}</span>
          <span>{formatTime(Math.floor(duration))}</span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-6 mb-6">
        <Button
          size="icon"
          onClick={onSkipBackward}
          className="w-12 h-12 rounded-full bg-white/10 border border-white/20 text-white hover:scale-105 transition-all duration-200"
        >
          <SkipBack className="h-5 w-5" />
        </Button>

        <Button
          size="icon"
          onClick={onPlayPause}
          className="w-20 h-20 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {isPlaying ? (
            <Pause className="h-10 w-10" />
          ) : (
            <Play className="h-10 w-10 ml-1" />
          )}
        </Button>

        <Button
          size="icon"
          onClick={onSkipForward}
          className="w-12 h-12 rounded-full bg-white/10 border border-white/20 text-white hover:scale-105 transition-all duration-200"
        >
          <SkipForward className="h-5 w-5" />
        </Button>
      </div>

      {/* Audio Description */}
      <div className="flex items-center justify-center gap-2 text-white/60 bg-white/10 py-3 px-6 rounded-full">
        <Volume2 className="h-4 w-4" />
        <span className="text-sm">Voice guidance with calming background music</span>
      </div>
    </div>
  );
};