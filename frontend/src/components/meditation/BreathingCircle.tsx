import React from 'react';
import Icon from '@mdi/react';
import { mdiMeditation } from '@mdi/js';

interface BreathingCircleProps {
  isPlaying: boolean;
}

export const BreathingCircle: React.FC<BreathingCircleProps> = ({ isPlaying }) => {
  return (
    <div className="relative mb-8 flex justify-center">
      <div
        className={`w-64 h-64 rounded-full bg-gradient-to-br from-teal-500/10 to-cyan-500/20 flex items-center justify-center ${
          isPlaying ? 'animate-pulse' : ''
        } border-2 border-teal-400/30 shadow-2xl`}
      >
        <div
          className={`w-48 h-48 rounded-full bg-gradient-to-br from-teal-500/20 to-cyan-500/30 flex items-center justify-center ${
            isPlaying ? 'animate-pulse' : ''
          }`}
        >
          <div
            className={`w-32 h-32 rounded-full bg-gradient-to-br from-teal-500/30 to-cyan-500/40 flex items-center justify-center ${
              isPlaying ? 'animate-pulse' : ''
            }`}
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center">
              <Icon path={mdiMeditation} size={1.5} className="text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};