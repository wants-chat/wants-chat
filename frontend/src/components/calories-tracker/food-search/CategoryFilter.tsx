import React from 'react';
import { Button } from '../../ui/button';
import Icon from '@mdi/react';
import { mdiFoodApple } from '@mdi/js';

interface Category {
  id: string;
  name: string;
  icon?: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategoryChange
}) => {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2">
      {categories.map((category) => (
        <Button
          key={category.id}
          size="sm"
          onClick={() => onCategoryChange(category.id)}
          className={`whitespace-nowrap ${
            selectedCategory === category.id
              ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-transparent'
              : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
          }`}
        >
          {category.icon && <Icon path={category.icon} size={0.6} className="mr-1" />}
          {category.name}
        </Button>
      ))}
    </div>
  );
};

export default CategoryFilter;