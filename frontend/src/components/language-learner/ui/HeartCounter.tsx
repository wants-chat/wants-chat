import React from 'react';
import { Heart, Plus } from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';

interface HeartCounterProps {
  hearts: number;
  maxHearts: number;
  showRefill?: boolean;
  onRefill?: () => void;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const HeartCounter: React.FC<HeartCounterProps> = ({
  hearts,
  maxHearts,
  showRefill = false,
  onRefill,
  size = 'md',
  animated = true
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          heart: 'h-4 w-4',
          container: 'space-x-1',
          text: 'text-sm'
        };
      case 'lg':
        return {
          heart: 'h-8 w-8',
          container: 'space-x-2',
          text: 'text-xl'
        };
      default:
        return {
          heart: 'h-6 w-6',
          container: 'space-x-1.5',
          text: 'text-base'
        };
    }
  };

  const classes = getSizeClasses();
  const isLowHearts = hearts <= 1;

  return (
    <div className="flex items-center space-x-3">
      <div className={`flex items-center ${classes.container}`}>
        {Array.from({ length: maxHearts }).map((_, index) => (
          <div
            key={index}
            className={`${animated ? 'transition-all duration-300' : ''} ${
              index < hearts ? 'scale-100' : 'scale-90 opacity-60'
            }`}
          >
            <Heart
              className={`${classes.heart} ${
                index < hearts
                  ? 'text-red-500 fill-red-500'
                  : 'text-muted-foreground'
              } ${animated && index < hearts ? 'animate-pulse' : ''}`}
            />
          </div>
        ))}
      </div>

      <span className={`${classes.text} font-medium text-foreground`}>
        {hearts}/{maxHearts}
      </span>

      {isLowHearts && (
        <Badge variant="destructive" className="text-xs animate-pulse">
          Low Hearts!
        </Badge>
      )}

      {showRefill && hearts < maxHearts && (
        <Button
          size="sm"
          variant="outline"
          onClick={onRefill}
          className="h-8 px-3 text-xs border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          <Plus className="h-3 w-3 mr-1" />
          Refill Hearts
        </Button>
      )}
    </div>
  );
};

export default HeartCounter;