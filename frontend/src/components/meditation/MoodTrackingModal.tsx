import React from 'react';
import { Button } from '../ui/button';
import SimpleMoodTracker from './SimpleMoodTracker';

interface MoodTrackingModalProps {
  isVisible: boolean;
  title: string;
  mood?: number;
  onMoodChange: (mood: number | undefined) => void;
  onSkip: () => void;
  onContinue: () => void;
  continueText?: string;
  skipText?: string;
  disabled?: boolean;
}

export const MoodTrackingModal: React.FC<MoodTrackingModalProps> = ({
  isVisible,
  title,
  mood,
  onMoodChange,
  onSkip,
  onContinue,
  continueText = "Continue",
  skipText = "Skip",
  disabled = false
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/95 border border-white/20 rounded-lg p-6 max-w-md w-full backdrop-blur-xl">
        <SimpleMoodTracker
          title={title}
          value={mood}
          onChange={onMoodChange}
        />
        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onSkip}
          >
            {skipText}
          </Button>
          <Button
            className="flex-1"
            disabled={disabled}
            onClick={onContinue}
          >
            {continueText}
          </Button>
        </div>
      </div>
    </div>
  );
};