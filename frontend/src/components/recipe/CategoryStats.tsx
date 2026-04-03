import React from 'react';
import { Card, CardContent } from '../ui/card';

interface CategoryStatsProps {
  stats: {
    total: number;
    avgRating: number;
    avgTime: number;
    favorites: number;
  };
}

export const CategoryStats: React.FC<CategoryStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <Card className="rounded-xl bg-white/10 backdrop-blur-xl border border-white/20">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-primary mb-1">{stats.total}</div>
          <div className="text-sm text-white/60">Total Recipes</div>
        </CardContent>
      </Card>
      <Card className="rounded-xl bg-white/10 backdrop-blur-xl border border-white/20">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-500 mb-1">
            {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '0'}
          </div>
          <div className="text-sm text-white/60">Avg Rating</div>
        </CardContent>
      </Card>
      <Card className="rounded-xl bg-white/10 backdrop-blur-xl border border-white/20">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-500 mb-1">
            {stats.avgTime > 0 ? Math.round(stats.avgTime) : '0'}m
          </div>
          <div className="text-sm text-white/60">Avg Time</div>
        </CardContent>
      </Card>
      <Card className="rounded-xl bg-white/10 backdrop-blur-xl border border-white/20">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-red-500 mb-1">{stats.favorites}</div>
          <div className="text-sm text-white/60">Favorites</div>
        </CardContent>
      </Card>
    </div>
  );
};