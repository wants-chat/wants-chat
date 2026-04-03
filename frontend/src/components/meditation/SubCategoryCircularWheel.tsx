import React from 'react';
import Icon from '@mdi/react';
import { Button } from '../ui/button';
import { MeditationOption } from '../../types/meditation/meditation-types';
import { AudioContent } from '../../services/meditationService';

interface SubCategoryCircularWheelProps {
  selectedCategory: MeditationOption | null;
  selectedDuration: number;
  typedAudioLibrary: AudioContent[];
  onSubOptionClick: (categoryId: string, subOptionId: string) => void;
  onBackClick: () => void;
  getColorForCategory: (index: number) => string;
}

export const SubCategoryCircularWheel: React.FC<SubCategoryCircularWheelProps> = ({
  selectedCategory,
  selectedDuration,
  typedAudioLibrary,
  onSubOptionClick,
  onBackClick,
  getColorForCategory,
}) => {
  if (!selectedCategory) return null;

  const filteredSubOptions = selectedCategory.subOptions?.filter((subOption) => {
    const audio = typedAudioLibrary.find((a) => a.id === subOption.id);
    if (!audio) {
      return false;
    }

    const audioDurationMinutes = Math.round((audio.durationSeconds || 600) / 60);
    const shouldShow = audioDurationMinutes <= selectedDuration;
    return shouldShow;
  });

  return (
    <div className="relative flex items-center justify-center py-4 sm:py-8 overflow-x-hidden">
      <div className="relative w-[320px] h-[320px] sm:w-[520px] sm:h-[520px]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-28 h-28 sm:w-44 sm:h-44 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 border-2 border-primary/30 flex items-center justify-center shadow-xl backdrop-blur-sm">
            <div className="text-center p-2">
              <Icon
                path={selectedCategory.icon}
                size={1.2}
                className="text-primary mb-1 mx-auto sm:hidden"
              />
              <Icon
                path={selectedCategory.icon}
                size={2.2}
                className="text-primary mb-2 mx-auto hidden sm:block"
              />
              <h3 className="text-xs sm:text-base font-bold text-foreground mb-1">
                {selectedCategory.label}
              </h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">
                {filteredSubOptions?.length || 0} sessions
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackClick}
                className="mt-1 sm:mt-2 text-[10px] sm:text-xs h-6 sm:h-8 px-2"
              >
                ← Back
              </Button>
            </div>
          </div>
        </div>

        {(filteredSubOptions || []).map((subOption, index, filteredOptions) => {
          const angle = (360 / filteredOptions.length) * index - 90;
          const radius = 180;
          const radiusMobile = 120;
          const x = 260 + radius * Math.cos((angle * Math.PI) / 180);
          const y = 260 + radius * Math.sin((angle * Math.PI) / 180);
          const xMobile = 160 + radiusMobile * Math.cos((angle * Math.PI) / 180);
          const yMobile = 160 + radiusMobile * Math.sin((angle * Math.PI) / 180);

          const audioData = typedAudioLibrary.find((a) => a.id === subOption.id);
          const audioDurationMinutes = audioData
            ? Math.round((audioData.durationSeconds || 600) / 60)
            : subOption.duration[0];

          return (
            <>
              <div
                key={subOption.id + '-mobile'}
                className="absolute sm:hidden"
                style={{
                  left: `${xMobile}px`,
                  top: `${yMobile}px`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <button
                  onClick={() => onSubOptionClick(selectedCategory.id, subOption.id)}
                  className="flex flex-col items-center transition-all duration-300 hover:scale-105 group"
                >
                  <div
                    className={`w-12 h-12 rounded-full ${getColorForCategory(
                      index
                    )} shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center border-2 border-white/30 backdrop-blur-sm`}
                  >
                    <span className="text-white text-xs font-bold">
                      {audioDurationMinutes}
                    </span>
                  </div>
                  <div className="mt-0.5 text-center max-w-[60px]">
                    <p className="text-[9px] font-semibold text-foreground leading-tight truncate">
                      {subOption.label}
                    </p>
                    <p className="text-[8px] text-muted-foreground">
                      {audioDurationMinutes} min
                    </p>
                  </div>
                </button>
              </div>

              <div
                key={subOption.id + '-desktop'}
                className="absolute hidden sm:block"
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <button
                  onClick={() => onSubOptionClick(selectedCategory.id, subOption.id)}
                  className="flex flex-col items-center transition-all duration-300 hover:scale-105 group"
                >
                  <div
                    className={`w-20 h-20 rounded-full ${getColorForCategory(
                      index
                    )} shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center border-2 border-white/30 backdrop-blur-sm`}
                  >
                    <span className="text-white text-lg font-bold">
                      {audioDurationMinutes}
                    </span>
                  </div>
                  <div className="mt-2 text-center max-w-[100px]">
                    <p className="text-xs font-semibold text-foreground leading-tight line-clamp-2">
                      {subOption.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {audioDurationMinutes} min
                    </p>
                  </div>
                </button>
              </div>
            </>
          );
        })}
      </div>
    </div>
  );
};