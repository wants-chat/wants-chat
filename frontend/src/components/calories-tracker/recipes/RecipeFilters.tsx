import React from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import Icon from '@mdi/react';
import { mdiMagnify, mdiFilter } from '@mdi/js';

interface Category {
  id: string;
  name: string;
}

interface RecipeFiltersProps {
  searchQuery: string;
  selectedCategory: string;
  selectedDifficulty: string;
  showFilters: boolean;
  categories: Category[];
  onSearchChange: (query: string) => void;
  onCategoryChange: (categoryId: string) => void;
  onDifficultyChange: (difficulty: string) => void;
  onToggleFilters: () => void;
}

const RecipeFilters: React.FC<RecipeFiltersProps> = ({
  searchQuery,
  selectedCategory,
  selectedDifficulty,
  showFilters,
  categories,
  onSearchChange,
  onCategoryChange,
  onDifficultyChange,
  onToggleFilters
}) => {
  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Icon 
              path={mdiMagnify} 
              size={0.8} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
            />
            <Input
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={onToggleFilters}
          >
            <Icon path={mdiFilter} size={0.8} />
          </Button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => onCategoryChange(category.id)}
              className="whitespace-nowrap"
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Additional Filters */}
        {showFilters && (
          <div className="pt-2 border-t border-border">
            <p className="text-sm font-medium text-foreground mb-2">Difficulty</p>
            <div className="flex gap-2">
              {['all', 'easy', 'medium', 'hard'].map((level) => (
                <Button
                  key={level}
                  variant={selectedDifficulty === level ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onDifficultyChange(level)}
                  className="capitalize"
                >
                  {level === 'all' ? 'All Levels' : level}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default RecipeFilters;