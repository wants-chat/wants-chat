import React from 'react';
import { Card } from '../../ui/card';
import Icon from '@mdi/react';
import { mdiChefHat } from '@mdi/js';

const NoRecipesFound: React.FC = () => {
  return (
    <Card className="p-12">
      <div className="text-center text-muted-foreground">
        <Icon path={mdiChefHat} size={3} className="mx-auto mb-4 opacity-20" />
        <p className="text-lg">No recipes found</p>
        <p className="text-sm">Try adjusting your search or filters</p>
      </div>
    </Card>
  );
};

export default NoRecipesFound;