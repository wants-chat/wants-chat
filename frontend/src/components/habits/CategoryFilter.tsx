import React from 'react';
import { Badge } from '../ui/badge';
import { HABIT_CATEGORIES } from '../../types/habits';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  habitCounts?: Record<string, number>;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onCategoryChange,
  habitCounts = {}
}) => {
  const categories = ['all', ...HABIT_CATEGORIES];

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'all': return '🎯';
      case 'fitness': return '💪';
      case 'health': return '❤️';
      case 'learning': return '📚';
      case 'work': return '💼';
      case 'personal': return '🌟';
      case 'social': return '👥';
      case 'wellness': return '🧘';
      case 'finance': return '💰';
      case 'creativity': return '🎨';
      case 'mindfulness': return '🧠';
      default: return '📌';
    }
  };

  return (
    <div className="flex flex-wrap gap-2 p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg">
      {categories.map((category) => {
        const count = category === 'all'
          ? Object.values(habitCounts).reduce((sum, n) => sum + n, 0)
          : habitCounts[category] || 0;

        return (
          <Badge
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            className="cursor-pointer hover:shadow-md transition-shadow py-2 px-3"
            onClick={() => onCategoryChange(category)}
          >
            <span className="mr-2">{getCategoryIcon(category)}</span>
            <span className="capitalize">{category}</span>
            {count > 0 && (
              <span className="ml-2 bg-white/20 rounded-full px-2 py-0.5 text-xs">
                {count}
              </span>
            )}
          </Badge>
        );
      })}
    </div>
  );
};