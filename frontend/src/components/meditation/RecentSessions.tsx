import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { ArrowRight, Star } from 'lucide-react';
import Icon from '@mdi/react';
import { mdiChartLine, mdiEmoticonHappy, mdiEmoticonNeutral, mdiEmoticonSad } from '@mdi/js';

interface Session {
  id: string;
  type: string;
  duration: number;
  date: string;
  mood: {
    before: number;
    after: number;
  };
  rating?: number;
  notes?: string;
}

interface RecentSessionsProps {
  sessions: Session[];
  sessionsLoading?: boolean;
}

export const RecentSessions: React.FC<RecentSessionsProps> = ({
  sessions,
  sessionsLoading = false,
}) => {
  const navigate = useNavigate();

  // Get mood icon based on mood value
  const getMoodIcon = (mood?: number) => {
    if (!mood && mood !== 0) return null;
    if (mood >= 7) return <Icon path={mdiEmoticonHappy} size={0.8} className="text-green-500" />;
    if (mood >= 4) return <Icon path={mdiEmoticonNeutral} size={0.8} className="text-yellow-500" />;
    return <Icon path={mdiEmoticonSad} size={0.8} className="text-red-500" />;
  };

  // Get rating stars
  const getRatingStars = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`h-3 w-3 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <Card className="p-4 sm:p-6 bg-white/10 backdrop-blur-xl border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
          <Icon path={mdiChartLine} size={0.8} className="text-teal-400" />
          Recent Sessions
          {sessionsLoading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-400 ml-2"></div>
          )}
        </h3>
        <Button className="bg-white/10 border border-white/20 text-white hover:scale-105 transition-all duration-200" size="sm" onClick={() => navigate('/meditation/history')}>
          View All
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      <div className="space-y-3">
        {sessionsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="h-4 w-32 bg-white/10" />
                  <Skeleton className="h-5 w-16 bg-white/10" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-20 bg-white/10" />
                  <Skeleton className="h-3 w-24 bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        ) : sessions && sessions.length > 0 ? (
          sessions.map((session) => (
            <div key={session.id} className="p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                 onClick={() => navigate(`/meditation/session/${session.id}`)}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm text-white">{session.type}</h4>
                <Badge className="text-xs bg-teal-500/20 text-teal-400 border-teal-500/30">
                  {session.duration} min
                </Badge>
              </div>

              {/* Date and Notes */}
              <div className="flex items-center gap-3 text-xs text-white/60 mb-2">
                <span>{session.date}</span>
                {session.notes && (
                  <span className="italic flex-1">"{session.notes}"</span>
                )}
              </div>

              {/* Mood and Rating */}
              {(session.mood.before !== null || session.mood.after !== null || session.rating) && (
                <div className="flex items-center gap-4 mt-2">
                  {session.mood.before !== null && session.mood.before !== undefined && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-white/60">Before:</span>
                      {getMoodIcon(session.mood.before)}
                    </div>
                  )}
                  {session.mood.after !== null && session.mood.after !== undefined && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-white/60">After:</span>
                      {getMoodIcon(session.mood.after)}
                    </div>
                  )}
                  {session.rating && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-white/60">Rating:</span>
                      {getRatingStars(session.rating)}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-white/60">
            <p>No recent sessions found</p>
            <Button
              size="sm"
              className="mt-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
              onClick={() => navigate('/meditation')}
            >
              Start Your First Session
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};