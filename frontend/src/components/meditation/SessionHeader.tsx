import React from 'react';
import { Button } from '../ui/button';
import { ArrowLeft, Heart, Moon, Sun, Settings } from 'lucide-react';
import Icon from '@mdi/react';
import { mdiMeditation } from '@mdi/js';

interface SessionHeaderProps {
  category?: string;
  isLiked: boolean;
  theme: string;
  onNavigateBack: () => void;
  onToggleLike: () => void;
  onToggleTheme: () => void;
}

export const SessionHeader: React.FC<SessionHeaderProps> = ({
  category,
  isLiked,
  theme,
  onNavigateBack,
  onToggleLike,
  onToggleTheme,
}) => {
  const formatCategory = (cat?: string) => {
    if (!cat) return 'Meditation';
    return cat
      .split('-')
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  return (
    <header className="bg-white/5 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onNavigateBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <Icon path={mdiMeditation} size={1.2} className="text-teal-400" />
              <div>
                <h1 className="text-lg font-semibold">
                  {formatCategory(category)} Session
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onToggleLike}>
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button variant="ghost" size="icon" onClick={onToggleTheme} aria-label="Toggle theme">
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};