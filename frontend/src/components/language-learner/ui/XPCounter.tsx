import React, { useState, useEffect } from 'react';
import { Crown } from 'lucide-react';

interface XPCounterProps {
  currentXP: number;
  targetXP: number;
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const XPCounter: React.FC<XPCounterProps> = ({
  currentXP,
  targetXP,
  animated = true,
  size = 'md'
}) => {
  const [displayXP, setDisplayXP] = useState(animated ? 0 : currentXP);
  
  useEffect(() => {
    if (!animated) {
      setDisplayXP(currentXP);
      return;
    }

    const duration = 1000; // 1 second
    const steps = 50;
    const stepValue = (currentXP - displayXP) / steps;
    
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setDisplayXP(currentXP);
        clearInterval(timer);
      } else {
        setDisplayXP(prev => prev + stepValue);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [currentXP, animated]);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'h-8 px-3',
          icon: 'h-4 w-4',
          text: 'text-sm',
          xp: 'text-sm'
        };
      case 'lg':
        return {
          container: 'h-12 px-6',
          icon: 'h-6 w-6',
          text: 'text-lg',
          xp: 'text-xl'
        };
      default:
        return {
          container: 'h-10 px-4',
          icon: 'h-5 w-5',
          text: 'text-base',
          xp: 'text-lg'
        };
    }
  };

  const classes = getSizeClasses();

  return (
    <div className={`
      ${classes.container} 
      bg-gradient-to-r from-primary/10 to-primary/20 
      border border-primary/20 
      rounded-full flex items-center space-x-2 
      transition-all duration-300 hover:shadow-lg
    `}>
      <Crown className={`${classes.icon} text-primary`} />
      <span className={`${classes.xp} font-bold text-foreground`}>
        {Math.floor(displayXP).toLocaleString()}
      </span>
      {targetXP && (
        <>
          <span className={`${classes.text} text-muted-foreground`}>/</span>
          <span className={`${classes.text} text-muted-foreground`}>
            {targetXP.toLocaleString()}
          </span>
        </>
      )}
      <span className={`${classes.text} text-primary font-medium`}>
        XP
      </span>
    </div>
  );
};

export default XPCounter;