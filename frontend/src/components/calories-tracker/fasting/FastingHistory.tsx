import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import Icon from '@mdi/react';
import { 
  mdiCalendarRange,
  mdiCheckCircle,
  mdiClockOutline
} from '@mdi/js';

export interface FastingSession {
  id: string;
  startTime: Date;
  targetDuration: number;
  actualDuration?: number;
  completed: boolean;
  planId: string;
  planName?: string;
}

interface FastingHistoryProps {
  sessions: FastingSession[];
  plans: { id: string; name: string }[];
  onViewAll?: () => void;
}

const FastingHistory: React.FC<FastingHistoryProps> = ({
  sessions,
  plans,
  onViewAll
}) => {
  const navigate = useNavigate();
  
  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    } else {
      navigate('/calories-tracker/profile');
    }
  };

  const getPlanName = (session: FastingSession) => {
    // First check if the session has a plan name directly
    if (session.planName) {
      return session.planName;
    }
    // Fallback to looking up in the plans array
    return plans.find(p => p.id === session.planId)?.name || 'Unknown Plan';
  };

  return (
    <Card className="p-6 bg-white/5 border border-white/10">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Recent Fasts</h3>
          <Button size="sm" onClick={handleViewAll} className="bg-transparent text-white/70 hover:bg-white/10 hover:text-white">
            <Icon path={mdiCalendarRange} size={0.8} className="mr-2" />
            View All
          </Button>
        </div>

        {sessions.length > 0 ? (
          <div className="space-y-2">
            {sessions.slice(-5).reverse().map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg"
              >
                <div>
                  <p className="font-medium text-white">
                    {getPlanName(session)}
                  </p>
                  <p className="text-sm text-white/60">
                    {new Date(session.startTime).toLocaleDateString()} •
                    {session.actualDuration && !isNaN(Number(session.actualDuration))
                      ? ` ${Number(session.actualDuration).toFixed(1)}h`
                      : ' In progress'}
                  </p>
                </div>

                {session.completed ? (
                  <Icon path={mdiCheckCircle} size={1} className="text-emerald-400" />
                ) : (
                  <Badge className="bg-white/10 text-white/70 border border-white/20">Incomplete</Badge>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-white/60">
            <Icon path={mdiClockOutline} size={2} className="mx-auto mb-2 opacity-50" />
            <p>No fasting history yet</p>
            <p className="text-sm">Start your first fast to track progress</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default FastingHistory;