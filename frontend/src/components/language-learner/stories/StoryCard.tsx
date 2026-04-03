import React from 'react';
import { Clock, BookOpen, Play, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { Story } from '../../../types/story';

interface StoryCardProps {
  story: Story;
  onStoryClick: (story: Story) => void;
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

export const StoryCard: React.FC<StoryCardProps> = ({
  story,
  onStoryClick,
}) => {
  return (
    <Card
      className="cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20 hover:border-teal-500/50"
      onClick={() => onStoryClick(story)}
    >
      {/* Card Header with Thumbnail and Status */}
      <div className="relative p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          {story.thumbnail && story.thumbnail.startsWith('http') ? (
            <div className="w-16 h-16 rounded-2xl overflow-hidden">
              <img
                src={story.thumbnail}
                alt={story.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-teal-500/10 to-cyan-500/20 flex items-center justify-center text-2xl">📖</div>';
                }}
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500/10 to-cyan-500/20 flex items-center justify-center text-2xl">
              {story.thumbnail || '📖'}
            </div>
          )}
          <div className="flex flex-col gap-2">
            {story.isCompleted && (
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            )}
          </div>
        </div>

        {/* Title and Author */}
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white group-hover:text-teal-400 transition-colors line-clamp-2">
            {story.title}
          </h3>
          <p className="text-sm text-white/60">
            by {story.author}
          </p>
        </div>
      </div>

      {/* Card Content */}
      <CardContent className="px-6 pt-0 pb-6">
        {/* Preview Text */}
        <p className="text-sm text-white/60 mb-4 line-clamp-3 leading-relaxed">
          {story.preview}
        </p>

        {/* Progress Bar (if applicable) */}
        {story.completionRate > 0 && (
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-xs">
              <span className="text-white/60">Progress</span>
              <span className="text-white font-medium">{story.completionRate}%</span>
            </div>
            <Progress value={story.completionRate} className="h-2" />
          </div>
        )}

        {/* Story Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center space-x-2 text-xs text-white/60">
            <Clock className="h-3 w-3" />
            <span>{story.estimatedTime} min</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-white/60">
            <BookOpen className="h-3 w-3" />
            <span>{story.wordsCount} words</span>
          </div>
        </div>

        {/* Level */}
        <div className="mb-4">
          <Badge className={getLevelColor(story.level)}>
            {story.level}
          </Badge>
        </div>
      </CardContent>

      {/* Card Footer with Action Button */}
      <div className="px-6 pb-6">
        <div className="border-t border-white/20 pt-4">
          <Button
            size="sm"
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0 font-medium"
          >
            {story.completionRate > 0 ? (
              <>
                <Play className="h-4 w-4 mr-2" />
                Continue Reading
              </>
            ) : (
              <>
                <BookOpen className="h-4 w-4 mr-2" />
                Start Reading
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};
