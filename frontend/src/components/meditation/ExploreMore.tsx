import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { BookOpen, User, TrendingUp, Settings } from 'lucide-react';

export const ExploreMore: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Card className="p-5">
      <h3 className="text-lg font-semibold mb-4">Explore More</h3>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="h-24 flex-col gap-2"
          onClick={() => navigate('/meditation/series')}
        >
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="text-sm">Series</span>
          <span className="text-xs text-muted-foreground">Programs</span>
        </Button>

        <Button
          variant="outline"
          className="h-24 flex-col gap-2"
          onClick={() => navigate('/meditation/profile')}
        >
          <User className="h-6 w-6 text-primary" />
          <span className="text-sm">Profile</span>
          <span className="text-xs text-muted-foreground">Your Stats</span>
        </Button>

        <Button
          variant="outline"
          className="h-24 flex-col gap-2"
          onClick={() => navigate('/meditation/history')}
        >
          <TrendingUp className="h-6 w-6 text-primary" />
          <span className="text-sm">History</span>
          <span className="text-xs text-muted-foreground">Sessions</span>
        </Button>

        <Button variant="outline" className="h-24 flex-col gap-2">
          <Settings className="h-6 w-6 text-primary" />
          <span className="text-sm">Settings</span>
          <span className="text-xs text-muted-foreground">Preferences</span>
        </Button>
      </div>
    </Card>
  );
};