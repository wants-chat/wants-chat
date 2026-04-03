import React from 'react';
import Icon from '@mdi/react';
import { MeditationOption } from '../../types/meditation/meditation-types';
import { Skeleton } from '../ui/skeleton';

interface CircularMeditationWheelProps {
  meditationOptions: MeditationOption[];
  loading?: boolean;
  onOptionClick: (option: MeditationOption) => void;
  getColorForCategory: (index: number) => string;
  getFilteredSessionCount: (option: MeditationOption) => number;
}

export const CircularMeditationWheel: React.FC<CircularMeditationWheelProps> = ({
  meditationOptions,
  loading = false,
  onOptionClick,
  getColorForCategory,
  getFilteredSessionCount,
}) => {
  if (loading) {
    return (
      <div className="relative flex items-center justify-center py-4 sm:py-8">
        <div className="relative w-[360px] h-[360px] sm:w-[560px] sm:h-[560px]">
          <div className="absolute inset-0 flex items-center justify-center">
            <Skeleton className="w-24 h-24 sm:w-40 sm:h-40 rounded-full" />
          </div>
          <div className="absolute inset-0">
            {[...Array(6)].map((_, index) => {
              const angle = (360 / 6) * index - 90;
              const radius = 200;
              const x = 280 + radius * Math.cos((angle * Math.PI) / 180);
              const y = 280 + radius * Math.sin((angle * Math.PI) / 180);
              return (
                <div
                  key={index}
                  className="absolute hidden sm:block"
                  style={{
                    left: `${x}px`,
                    top: `${y}px`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div className="flex flex-col items-center">
                    <Skeleton className="w-20 h-20 rounded-full" />
                    <Skeleton className="h-4 w-20 mt-2" />
                    <Skeleton className="h-3 w-16 mt-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (!meditationOptions || meditationOptions.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">No meditation categories available</p>
          <p className="text-sm text-muted-foreground">Please try again later</p>
        </div>
      </div>
    );
  }


  return (
    <div className="relative flex items-center justify-center py-4 sm:py-8 overflow-x-hidden">
      <div className="relative w-[360px] h-[360px] sm:w-[560px] sm:h-[560px]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 border-2 border-primary/30 flex items-center justify-center shadow-xl backdrop-blur-sm">
            <div className="text-center">
              <h3 className="text-xs sm:text-base font-bold text-foreground mb-1">
                Choose Your
              </h3>
              <h3 className="text-xs sm:text-base font-bold text-primary">Journey</h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                Select a meditation
              </p>
            </div>
          </div>
        </div>

        {meditationOptions.map((option, index) => {
          const angle = (360 / meditationOptions.length) * index - 90;
          const radius = 200;
          const radiusMobile = 140;
          const x = 280 + radius * Math.cos((angle * Math.PI) / 180);
          const y = 280 + radius * Math.sin((angle * Math.PI) / 180);
          const xMobile = 180 + radiusMobile * Math.cos((angle * Math.PI) / 180);
          const yMobile = 180 + radiusMobile * Math.sin((angle * Math.PI) / 180);

          return (
            <React.Fragment key={option.id}>
              <div
                className="absolute sm:hidden"
                style={{
                  left: `${xMobile}px`,
                  top: `${yMobile}px`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <button
                  onClick={() => onOptionClick(option)}
                  className="flex flex-col items-center transition-all duration-300 hover:scale-105 group"
                >
                  <div
                    className={`w-12 h-12 rounded-full ${getColorForCategory(
                      index
                    )} shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center border-2 border-white/30 backdrop-blur-sm`}
                  >
                    <Icon
                      path={option.icon}
                      size={0.8}
                      className="text-white drop-shadow-md"
                    />
                  </div>
                  <div className="mt-0.5 text-center max-w-[50px]">
                    <p className="text-[9px] font-semibold text-foreground leading-tight truncate">
                      {option.label}
                    </p>
                    <p className="text-[8px] text-muted-foreground">
                      {getFilteredSessionCount(option)}{' '}
                      {getFilteredSessionCount(option) === 1 ? 'session' : 'sessions'}
                    </p>
                  </div>
                </button>
              </div>

              <div
                className="absolute hidden sm:block"
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <button
                  onClick={() => onOptionClick(option)}
                  className="flex flex-col items-center transition-all duration-300 hover:scale-105 group"
                >
                  <div
                    className={`w-20 h-20 rounded-full ${getColorForCategory(
                      index
                    )} shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center border-2 border-white/30 backdrop-blur-sm`}
                  >
                    <Icon
                      path={option.icon}
                      size={1.3}
                      className="text-white drop-shadow-md"
                    />
                  </div>
                  <div className="mt-2 text-center min-w-[80px]">
                    <p className="text-xs font-semibold text-foreground leading-tight">
                      {option.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {getFilteredSessionCount(option)}{' '}
                      {getFilteredSessionCount(option) === 1 ? 'session' : 'sessions'}
                    </p>
                  </div>
                </button>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};