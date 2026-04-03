import React from 'react';

interface StoriesHeaderProps {
  currentLanguage: 'spanish' | 'english';
  totalStories: number;
  onBackClick: () => void;
}

export const StoriesHeader: React.FC<StoriesHeaderProps> = ({
  currentLanguage,
  totalStories,
  onBackClick,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white">
          {currentLanguage === 'spanish' ? 'Spanish' : 'English'} Stories & Reading
        </h1>
        <p className="text-white/60">
          Improve your {currentLanguage === 'spanish' ? 'Spanish' : 'English'} through engaging stories
        </p>
      </div>

      <div className="text-right">
        <div className="text-sm text-white/60">Total Stories</div>
        <div className="text-lg font-semibold text-white">
          {totalStories}
        </div>
      </div>
    </div>
  );
};
