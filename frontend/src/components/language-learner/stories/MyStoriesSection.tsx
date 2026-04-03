import React from 'react';
import { BookOpen, Clock, Plus, X } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Story } from '../../../types/story';

interface MyStoriesSectionProps {
  myStories: Story[];
  currentLanguage: 'spanish' | 'english';
  deletingStoryId: string | null;
  onStoryClick: (story: Story) => void;
  onDeleteStory: (story: Story) => void;
  onCreateStory: () => void;
}

const getLevelColor = (level: string) => {
  switch (level) {
    case 'beginner':
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'intermediate':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'advanced':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    default:
      return 'bg-white/10 text-white/60 border-white/20';
  }
};

export const MyStoriesSection: React.FC<MyStoriesSectionProps> = ({
  myStories,
  currentLanguage,
  deletingStoryId,
  onStoryClick,
  onDeleteStory,
  onCreateStory,
}) => {
  if (myStories.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-teal-500/10 to-cyan-500/20 flex items-center justify-center">
          <BookOpen className="h-12 w-12 text-teal-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          No stories yet
        </h3>
        <p className="text-white/60 mb-6 max-w-md mx-auto">
          Create your first {currentLanguage === 'spanish' ? 'Spanish' : 'English'} story and share it with others learning the language.
        </p>
        <Button
          onClick={onCreateStory}
          className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Your First Story
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {myStories.map((story) => (
        <Card
          key={story.id}
          className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer bg-white/10 backdrop-blur-xl border border-white/20 hover:border-teal-500/50"
          onClick={() => onStoryClick(story)}
        >
          <div className="flex items-start space-x-6">
            {/* Story Thumbnail */}
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-teal-500/10 to-cyan-500/20 flex items-center justify-center text-3xl flex-shrink-0">
              {story.thumbnail}
            </div>

            {/* Story Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white hover:text-teal-400 transition-colors mb-1">
                    {story.title}
                  </h3>
                  <p className="text-sm text-white/60 mb-2">
                    Created by you • {currentLanguage === 'spanish' ? 'Spanish' : 'English'} story
                  </p>
                </div>
                <Badge className="bg-teal-500/10 text-teal-400 border-teal-500/20">
                  Your Story
                </Badge>
              </div>

              {/* Preview */}
              <p className="text-white/60 line-clamp-2 mb-4">
                {story.preview}
              </p>

              {/* Story Stats */}
              <div className="flex items-center space-x-6 text-sm text-white/60">
                <div className="flex items-center space-x-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{story.wordsCount} words</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{story.estimatedTime} min read</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Badge className={getLevelColor(story.level)}>
                    {story.level}
                  </Badge>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="px-2 py-1 bg-white/10 rounded text-xs text-white/80">
                    {story.category.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex-shrink-0 flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteStory(story);
                }}
                disabled={deletingStoryId === story.id}
                className="h-10 w-10 rounded-xl hover:bg-red-500/20 hover:text-red-400 transition-all duration-200"
              >
                {deletingStoryId === story.id ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onStoryClick(story);
                }}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Read Story
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
