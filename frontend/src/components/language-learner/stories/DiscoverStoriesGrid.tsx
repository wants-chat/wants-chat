import React from 'react';
import { BookOpen, RotateCcw, X } from 'lucide-react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { StoryCard } from './StoryCard';
import { Story } from '../../../types/story';

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface DiscoverStoriesGridProps {
  filteredStories: Story[];
  activeCategory: string;
  isLoadingStories: boolean;
  storiesError: Error | null;
  storiesResponse: { total: number; total_pages?: number } | null | undefined;
  categories: Category[];
  onStoryClick: (story: Story) => void;
  onCategoryChange: (categoryId: string) => void;
  onRefresh: () => void;
  onPageChange: (page: number) => void;
}

export const DiscoverStoriesGrid: React.FC<DiscoverStoriesGridProps> = ({
  filteredStories,
  activeCategory,
  isLoadingStories,
  storiesError,
  storiesResponse,
  categories,
  onStoryClick,
  onCategoryChange,
  onRefresh,
  onPageChange,
}) => {
  if (isLoadingStories) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mb-4"></div>
        <p className="text-white/60">Loading stories...</p>
      </div>
    );
  }

  if (storiesError) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-red-400 mb-4">
          <BookOpen className="h-12 w-12" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Error Loading Stories</h3>
        <p className="text-white/60 mb-4">{storiesError?.message || 'Failed to load stories'}</p>
        <Button onClick={onRefresh} className="bg-white/10 text-white border-white/20 hover:bg-white/20">
          <RotateCcw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-white">Discover Stories</h3>
          {storiesResponse && (
            <p className="text-sm text-white/60">
              {storiesResponse.total} stories available
            </p>
          )}
        </div>
        <Button
          size="sm"
          onClick={onRefresh}
          disabled={isLoadingStories}
          className="flex items-center gap-2 bg-white/10 text-white border-white/20 hover:bg-white/20"
        >
          <RotateCcw className={`h-4 w-4 ${isLoadingStories ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            size="sm"
            onClick={() => {
              onCategoryChange(category.id);
              onPageChange(1); // Reset page when changing category
            }}
            className={`text-sm ${
              activeCategory === category.id
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                : 'bg-white/10 text-white/80 border-white/20 hover:bg-white/20 hover:text-white'
            }`}
          >
            <span className="mr-2">{category.icon}</span>
            {category.name}
          </Button>
        ))}
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStories
          .filter(story => !story.id.startsWith('user-'))
          .map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              onStoryClick={onStoryClick}
            />
          ))}
      </div>
    </div>
  );
};
