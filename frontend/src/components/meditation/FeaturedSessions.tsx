import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Play, ChevronRight } from 'lucide-react';

interface FeaturedSession {
  id: string;
  title: string;
  duration: string;
  description: string;
  category: string;
  audioUrl?: string;
}

interface FeaturedSessionsProps {
  sessions: FeaturedSession[];
}

export const FeaturedSessions: React.FC<FeaturedSessionsProps> = ({ sessions }) => {
  const navigate = useNavigate();

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Featured Sessions</h3>
        <Button variant="ghost" size="sm" onClick={() => navigate('/meditation/series')}>
          View All
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      <div className="space-y-3">
        {sessions.map((session, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg border border-border/50 hover:bg-secondary/20 cursor-pointer transition-colors"
            onClick={() => {
              if (session.audioUrl) {
                navigate(`/meditation/player/${session.id}`);
              } else {
                navigate('/meditation/player/featured/session/' + (index + 1));
              }
            }}
          >
            <div className="flex-1">
              <h4 className="font-medium text-sm mb-1">{session.title}</h4>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{session.duration}</span>
                <span>•</span>
                <span>{session.description}</span>
                <Badge variant="outline" className="text-xs">
                  {session.category}
                </Badge>
              </div>
            </div>
            <Play className="h-5 w-5 text-primary" />
          </div>
        ))}
      </div>
    </Card>
  );
};