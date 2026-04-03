import React from 'react';
import { ArrowLeft, ChefHat } from 'lucide-react';
import { Button } from '../ui/button';

interface RecipeHeaderProps {
  title: string;
  theme?: string;
  toggleTheme?: () => void;
  onBack?: () => void;
  subtitle?: string;
}

export const RecipeHeader: React.FC<RecipeHeaderProps> = ({
  title,
  onBack,
  subtitle
}) => {
  return (
    <header className="bg-white/10 backdrop-blur-xl border-b border-white/20">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-18">
          <div className="flex items-center space-x-2 sm:space-x-3">
            {onBack && (
              <Button
                variant="ghost"
                onClick={onBack}
                className="mr-2 p-2 text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <ChefHat className="h-5 w-5 sm:h-6 sm:w-6 text-teal-400" />
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-semibold text-white">
                <span className="hidden sm:inline">{title}</span>
                <span className="sm:hidden">{title.split(' ').slice(0, 2).join(' ')}</span>
              </span>
              {subtitle && (
                <span className="text-sm text-white/60">{subtitle}</span>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};