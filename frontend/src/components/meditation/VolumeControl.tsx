import React from 'react';
import { Card } from '../ui/card';
import { Volume2 } from 'lucide-react';

interface VolumeControlProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
}

export const VolumeControl: React.FC<VolumeControlProps> = ({ volume, onVolumeChange }) => {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <Volume2 className="h-4 w-4 text-teal-400 flex-shrink-0" />
          <span className="text-sm font-medium">Volume</span>
        </div>
        <div className="flex items-center gap-3 flex-1 max-w-[180px] ml-4">
          <span className="text-xs text-muted-foreground flex-shrink-0">0</span>
          <div className="relative flex-1">
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-200 rounded-full"
                style={{ width: `${volume * 100}%` }}
              />
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <span className="text-xs text-muted-foreground min-w-[35px] text-right">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>
    </Card>
  );
};