import React from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import Icon from '@mdi/react';
import { mdiChefHat, mdiPlus, mdiHeart } from '@mdi/js';

interface RecipeHeaderProps {
  onCreateRecipe: () => void;
  onViewFavorites: () => void;
}

const RecipeHeader: React.FC<RecipeHeaderProps> = ({
  onCreateRecipe,
  onViewFavorites
}) => {
  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-primary/20 rounded-xl">
          <Icon path={mdiChefHat} size={1.5} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Healthy Recipes</h1>
          <p className="text-muted-foreground">Delicious meals that fit your goals</p>
        </div>
      </div>
      
      <div className="flex gap-3">
        <Button size="sm" variant="outline" onClick={onCreateRecipe}>
          <Icon path={mdiPlus} size={0.8} className="mr-2" />
          Create Recipe
        </Button>
        <Button size="sm" variant="outline" onClick={onViewFavorites}>
          <Icon path={mdiHeart} size={0.8} className="mr-2" />
          My Favorites
        </Button>
      </div>
    </Card>
  );
};

export default RecipeHeader;