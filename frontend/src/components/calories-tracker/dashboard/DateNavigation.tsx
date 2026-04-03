import React from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import Icon from '@mdi/react';
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';

interface DateNavigationProps {
  selectedDate: Date;
  onDateChange: (direction: 'prev' | 'next') => void;
}

const DateNavigation: React.FC<DateNavigationProps> = ({ selectedDate, onDateChange }) => {
  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  return (
    <Card className="p-4 bg-white/5 border border-white/10">
      <div className="flex items-center justify-between">
        <Button
          size="icon"
          onClick={() => onDateChange('prev')}
          className="bg-transparent hover:bg-white/10 text-white"
        >
          <Icon path={mdiChevronLeft} size={1} />
        </Button>

        <div className="text-center">
          <h2 className="text-xl font-bold text-white">{formatDate(selectedDate)}</h2>
          <p className="text-sm text-white/60">
            {selectedDate.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        <Button
          size="icon"
          onClick={() => onDateChange('next')}
          disabled={selectedDate.toDateString() === new Date().toDateString()}
          className="bg-transparent hover:bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Icon path={mdiChevronRight} size={1} />
        </Button>
      </div>
    </Card>
  );
};

export default DateNavigation;