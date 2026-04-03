import React from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import Icon from '@mdi/react';
import { mdiMagnify } from '@mdi/js';
import FoodItem, { Food } from './FoodItem';

interface SearchResultsProps {
  searchQuery: string;
  searchResults: Food[];
  isSearching: boolean;
  favoriteFoods: Food[];
  onSelectFood: (food: Food) => void;
  onToggleFavorite: (foodId: string) => void;
  onCreateCustomFood: () => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  searchQuery,
  searchResults,
  isSearching,
  favoriteFoods,
  onSelectFood,
  onToggleFavorite,
  onCreateCustomFood
}) => {
  if (!searchQuery) return null;

  return (
    <Card className="p-6 bg-white/5 border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-4">
        {isSearching ? 'Searching...' : `${searchResults.length} Results`}
      </h3>

      {!isSearching && searchResults.length === 0 ? (
        <div className="text-center py-8 text-white/60">
          <Icon path={mdiMagnify} size={2} className="mx-auto mb-2 opacity-50" />
          <p>No foods found</p>
          <Button className="mt-2 text-teal-400 hover:text-teal-300 bg-transparent hover:bg-transparent" onClick={onCreateCustomFood}>
            Create custom food
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {searchResults.map((food) => (
            <FoodItem
              key={food.id}
              food={food}
              onSelect={onSelectFood}
              onToggleFavorite={onToggleFavorite}
              isFavorite={favoriteFoods.some(f => f.id === food.id)}
            />
          ))}
        </div>
      )}
    </Card>
  );
};

export default SearchResults;