import React from 'react';
import Icon from '@mdi/react';
import { mdiHeart } from '@mdi/js';
import { Card } from '../../ui/card';

interface MotivationalQuoteProps {
  streak: number;
}

const MotivationalQuote: React.FC<MotivationalQuoteProps> = ({ streak }) => {
  const quotes = [
    "Progress, not perfection",
    "Every workout counts",
    "Your only limit is you",
    "Stronger than yesterday",
    "Consistency is everything"
  ];

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <Card className="p-8 bg-gradient-to-r from-teal-500/20 via-cyan-500/10 to-purple-500/20 backdrop-blur-xl border border-white/20 shadow-lg">
      <div className="text-center">
        <div className="p-3 bg-teal-500/20 rounded-full w-fit mx-auto mb-4">
          <Icon path={mdiHeart} size={2} className="text-teal-400" />
        </div>
        <p className="text-xl font-semibold mb-2 text-white">
          "{randomQuote}"
        </p>
        <p className="text-white/60">
          You're on a {streak} day streak! Keep building those healthy habits. 🌟
        </p>
      </div>
    </Card>
  );
};

export default MotivationalQuote;