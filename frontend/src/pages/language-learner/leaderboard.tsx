import React, { useState, useEffect } from 'react';
import { Trophy, Users, Medal, Target, TrendingUp, Award, Loader2 } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import LanguageFlag from '../../components/language-learner/ui/LanguageFlag';
import { languageApiService, SimpleLeaderboardEntry } from '../../services/languageApi';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../../components/ui/sonner';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { GlassCard, StatCard } from '../../components/ui/GlassCard';

const LeaderboardPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<'weekly' | 'monthly' | 'all-time'>('weekly');
  const [leaderboardData, setLeaderboardData] = useState<SimpleLeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch leaderboard data from API
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        // Map period to API format (all-time -> all_time)
        const apiPeriod = selectedPeriod === 'all-time' ? 'all_time' : selectedPeriod;

        const data = await languageApiService.getLeaderboard({
          page: 1,
          limit: 50,
          sort_by: 'total_points',
          sort_order: 'desc',
          period: apiPeriod as any,
          language_code: 'es' // Spanish
        });
        setLeaderboardData(data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        toast.error('Failed to load leaderboard. Please try again.');
        setLeaderboardData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [selectedPeriod]);

  // Find current user in leaderboard data
  const currentUserData = leaderboardData.find(entry => entry.user_id === user?.id);
  const myRank = currentUserData?.rank || 0;
  const myXP = currentUserData?.total_points || 0;
  const highestXP = leaderboardData.length > 0 ? Math.max(...leaderboardData.map(u => u.total_points || 0)) : 0;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-muted-foreground" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600 dark:text-amber-500" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Leaderboards
        </h1>
        <p className="text-white/60">
          Compete with friends and learners worldwide
        </p>
      </div>

      <div className="space-y-6">
          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="My Rank"
              value={isLoading ? '-' : `#${myRank}`}
              icon={<Trophy />}
              color="from-blue-500 to-cyan-500"
            />

            <StatCard
              title="Total Users"
              value={isLoading ? '-' : leaderboardData.length.toString()}
              icon={<Users />}
              color="from-emerald-500 to-green-500"
            />

            <StatCard
              title="My Earned XP"
              value={isLoading ? '-' : myXP.toLocaleString()}
              icon={<Target />}
              color="from-orange-500 to-amber-500"
            />

            <StatCard
              title="Highest XP"
              value={isLoading ? '-' : highestXP.toLocaleString()}
              icon={<TrendingUp />}
              color="from-purple-500 to-pink-500"
            />
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-semibold text-white">Global Leaderboard</h2>
              <Badge variant="outline" className="bg-white/10 text-white border-white/20">Worldwide competition</Badge>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant={selectedPeriod === 'weekly' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod('weekly')}
                className={selectedPeriod === 'weekly' ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white' : 'bg-white/10 text-white border-white/20 hover:bg-white/20'}
              >
                Weekly
              </Button>
              <Button
                variant={selectedPeriod === 'monthly' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod('monthly')}
                className={selectedPeriod === 'monthly' ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white' : 'bg-white/10 text-white border-white/20 hover:bg-white/20'}
              >
                Monthly
              </Button>
              <Button
                variant={selectedPeriod === 'all-time' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod('all-time')}
                className={selectedPeriod === 'all-time' ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white' : 'bg-white/10 text-white border-white/20 hover:bg-white/20'}
              >
                All Time
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-teal-400" />
            </div>
          ) : leaderboardData.length > 0 ? (
            <div className="space-y-3">
              {leaderboardData.map((entry, index) => (
                <GlassCard
                  key={entry.user_id || `leaderboard-${index}`}
                  hover={true}
                  glow={entry.user_id === user?.id}
                  className={entry.user_id === user?.id ? 'ring-2 ring-teal-500' : ''}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-12">
                        {getRankIcon(entry.rank)}
                      </div>

                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold">
                          {entry.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-white truncate">
                            {entry.username}
                          </h3>
                          {entry.user_id === user?.id && (
                            <Badge variant="outline" className="text-xs bg-teal-500/20 text-teal-400 border-teal-500/30">You</Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-3 text-sm text-white/60">
                          <LanguageFlag languageCode={entry.language_code || 'es'} size="sm" />
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-bold text-white">
                          {(entry.total_points || 0).toLocaleString()}
                        </div>
                        <div className="text-xs text-white/60">
                          XP
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </GlassCard>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-white/60">No leaderboard data available</p>
            </div>
          )}
        </div>
      </div>
  );
};

export default LeaderboardPage;