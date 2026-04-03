import React from 'react';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { Sparkles } from 'lucide-react';
import { CircularMeditationWheel } from './CircularMeditationWheel';
import { SubCategoryCircularWheel } from './SubCategoryCircularWheel';
import { MeditationOption } from '../../types/meditation/meditation-types';
import { AudioContent } from '../../services/meditationService';

interface MeditationWheelContainerProps {
  selectedCategory: MeditationOption | null;
  selectedDuration: number;
  setSelectedDuration: (duration: number) => void;
  meditationOptions: MeditationOption[];
  typedAudioLibrary: AudioContent[];
  loading: boolean;
  onOptionClick: (option: MeditationOption) => void;
  onSubOptionClick: (categoryId: string, subOptionId: string) => void;
  onBackClick: () => void;
  getColorForCategory: (index: number) => string;
  getFilteredSessionCount: (option: MeditationOption) => number;
}

export const MeditationWheelContainer: React.FC<MeditationWheelContainerProps> = ({
  selectedCategory,
  selectedDuration,
  setSelectedDuration,
  meditationOptions,
  typedAudioLibrary,
  loading,
  onOptionClick,
  onSubOptionClick,
  onBackClick,
  getColorForCategory,
  getFilteredSessionCount
}) => {
  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-5 lg:col-span-2">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">
          {selectedCategory ? `${selectedCategory.label} Meditations` : 'Choose Your Journey'}
        </h2>
        {loading ? (
          <Skeleton className="w-20 h-6 rounded-full" />
        ) : (
          <Badge variant="secondary" className="gap-1 bg-white/10 text-white border-white/20">
            <Sparkles className="h-3 w-3" />
            {selectedCategory
              ? `${
                  selectedCategory.subOptions?.filter((sub) => {
                    const audio = typedAudioLibrary.find(a => a.id === sub.id);
                    if (!audio) return false;
                    const audioDurationMinutes = Math.round((audio.durationSeconds || 600) / 60);
                    return audioDurationMinutes <= selectedDuration;
                  }).length || 0
                } ${
                  selectedCategory.subOptions?.filter((sub) => {
                    const audio = typedAudioLibrary.find(a => a.id === sub.id);
                    if (!audio) return false;
                    const audioDurationMinutes = Math.round((audio.durationSeconds || 600) / 60);
                    return audioDurationMinutes <= selectedDuration;
                  }).length === 1
                    ? 'session'
                    : 'sessions'
                }`
              : `${meditationOptions.length} categories`}
          </Badge>
        )}
      </div>

      <div className="flex flex-col items-center">
        {selectedCategory ? (
          <SubCategoryCircularWheel
            selectedCategory={selectedCategory}
            selectedDuration={selectedDuration}
            typedAudioLibrary={typedAudioLibrary}
            onSubOptionClick={onSubOptionClick}
            onBackClick={onBackClick}
            getColorForCategory={getColorForCategory}
          />
        ) : (
          <CircularMeditationWheel
            meditationOptions={meditationOptions}
            loading={loading}
            onOptionClick={onOptionClick}
            getColorForCategory={getColorForCategory}
            getFilteredSessionCount={getFilteredSessionCount}
          />
        )}

        {/* Duration Selector */}
        <div className="mt-6">
          <h4 className="text-center text-sm font-medium mb-3 text-white">I have</h4>
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full p-1 border border-white/10">
            {[5, 10, 15, 20].map((duration) => (
              <button
                key={duration}
                onClick={() => setSelectedDuration(duration)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedDuration === duration
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {duration}
              </button>
            ))}
            <span className="text-sm font-medium text-white/60 px-3">MINUTES</span>
          </div>
        </div>
      </div>
    </div>
  );
};