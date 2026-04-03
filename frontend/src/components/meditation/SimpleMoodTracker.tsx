import React from 'react';
import { Card } from '../ui/card';
import Icon from '@mdi/react';
import { 
  mdiEmoticonAngry,
  mdiEmoticonSad,
  mdiEmoticonNeutral,
  mdiEmoticonHappy,
  mdiEmoticonExcited
} from '@mdi/js';

interface SimpleMoodTrackerProps {
  title: string;
  value?: number;
  onChange: (mood: number) => void;
}

const SimpleMoodTracker: React.FC<SimpleMoodTrackerProps> = ({ title, value, onChange }) => {
  const moods = [
    { value: 2, icon: mdiEmoticonAngry, color: 'text-red-500', label: 'Very Bad' },
    { value: 4, icon: mdiEmoticonSad, color: 'text-orange-500', label: 'Bad' },
    { value: 6, icon: mdiEmoticonNeutral, color: 'text-yellow-500', label: 'Neutral' },
    { value: 8, icon: mdiEmoticonHappy, color: 'text-green-500', label: 'Good' },
    { value: 10, icon: mdiEmoticonExcited, color: 'text-emerald-500', label: 'Excellent' }
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="flex justify-between items-center gap-2">
        {moods.map((mood) => (
          <button
            key={mood.value}
            onClick={() => onChange(mood.value)}
            className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-200 ${
              value === mood.value
                ? 'bg-teal-500/10 scale-110 shadow-lg'
                : 'hover:bg-secondary/50 hover:scale-105'
            }`}
          >
            <Icon 
              path={mood.icon} 
              size={1.5} 
              className={`${mood.color} transition-all duration-200 ${
                value === mood.value ? 'scale-110' : ''
              }`}
            />
            <span className={`text-xs font-medium ${
              value === mood.value ? 'text-teal-400' : 'text-muted-foreground'
            }`}>
              {mood.label}
            </span>
          </button>
        ))}
      </div>
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          Selected: {value ? `${value}/10` : 'Not selected'}
        </p>
      </div>
    </Card>
  );
};

export default SimpleMoodTracker;