/**
 * Forum Profile Component Generators
 */

export interface ProfileOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateProfileStats(options: ProfileOptions = {}): string {
  const { componentName = 'ProfileStats', endpoint = '/forum/members' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Loader2, MessageSquare, ThumbsUp, Eye, Award,
  TrendingUp, Calendar, Clock, Target, Zap
} from 'lucide-react';
import { api } from '@/lib/api';

interface MemberStats {
  post_count: number;
  thread_count: number;
  reply_count: number;
  like_count: number;
  likes_received: number;
  view_count: number;
  reputation: number;
  rank: number;
  total_members: number;
  joined_at: string;
  last_active: string;
  streak_days: number;
  best_answer_count: number;
  badges_count: number;
  followers_count: number;
  following_count: number;
}

interface ${componentName}Props {
  memberId: string;
  layout?: 'grid' | 'list' | 'compact';
}

const ${componentName}: React.FC<${componentName}Props> = ({ memberId, layout = 'grid' }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['member-stats', memberId],
    queryFn: async () => {
      const response = await api.get<MemberStats>('${endpoint}/' + memberId + '/stats');
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statItems = [
    {
      label: 'Posts',
      value: stats.post_count,
      icon: MessageSquare,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    },
    {
      label: 'Threads',
      value: stats.thread_count,
      icon: MessageSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      label: 'Likes Given',
      value: stats.like_count,
      icon: ThumbsUp,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100 dark:bg-pink-900/30',
    },
    {
      label: 'Likes Received',
      value: stats.likes_received,
      icon: ThumbsUp,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
    },
    {
      label: 'Best Answers',
      value: stats.best_answer_count,
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      label: 'Reputation',
      value: stats.reputation,
      icon: TrendingUp,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    },
    {
      label: 'Badges',
      value: stats.badges_count,
      icon: Award,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    },
    {
      label: 'Day Streak',
      value: stats.streak_days,
      icon: Zap,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
    },
  ];

  if (layout === 'compact') {
    return (
      <div className="flex flex-wrap gap-4 text-sm">
        {statItems.slice(0, 4).map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Icon className={\`w-4 h-4 \${color}\`} />
            <span className="font-medium text-gray-900 dark:text-white">{value.toLocaleString()}</span>
            <span>{label}</span>
          </div>
        ))}
      </div>
    );
  }

  if (layout === 'list') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
        {statItems.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Icon className={\`w-5 h-5 \${color}\`} />
              <span className="text-gray-600 dark:text-gray-400">{label}</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">
              {value.toLocaleString()}
            </span>
          </div>
        ))}

        {/* Rank */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span className="text-gray-600 dark:text-gray-400">Community Rank</span>
          </div>
          <span className="font-semibold text-purple-600">
            #{stats.rank} of {stats.total_members.toLocaleString()}
          </span>
        </div>

        {/* Dates */}
        <div className="px-4 py-3 space-y-2 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Joined {new Date(stats.joined_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Last active {new Date(stats.last_active).toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  }

  // Grid layout (default)
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5" />
        Statistics
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statItems.map(({ label, value, icon: Icon, color, bgColor }) => (
          <div
            key={label}
            className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 text-center"
          >
            <div className={\`w-10 h-10 mx-auto rounded-lg \${bgColor} flex items-center justify-center mb-2\`}>
              <Icon className={\`w-5 h-5 \${color}\`} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {value.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Rank Progress */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Community Rank
          </span>
          <span className="text-sm font-bold text-purple-600">
            #{stats.rank} of {stats.total_members.toLocaleString()}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-500"
            style={{ width: \`\${Math.max(5, 100 - (stats.rank / stats.total_members) * 100)}%\` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Top {((stats.rank / stats.total_members) * 100).toFixed(1)}% of members
        </p>
      </div>

      {/* Activity Info */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>Joined {new Date(stats.joined_at).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>Last seen {new Date(stats.last_active).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateBadgeList(options: ProfileOptions = {}): string {
  const { componentName = 'BadgeList', endpoint = '/forum/badges' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Award, Star, Shield, Zap, Trophy, Target, Crown, Sparkles, Lock } from 'lucide-react';
import { api } from '@/lib/api';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon?: string;
  color: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'special';
  category: string;
  earned_at?: string;
  progress?: number;
  requirement?: number;
  is_locked?: boolean;
}

interface ${componentName}Props {
  memberId?: string;
  showLocked?: boolean;
  layout?: 'grid' | 'list';
  maxItems?: number;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  memberId,
  showLocked = false,
  layout = 'grid',
  maxItems,
}) => {
  const { data: badges, isLoading } = useQuery({
    queryKey: ['badges', memberId, showLocked],
    queryFn: async () => {
      const url = memberId
        ? '${endpoint}?member_id=' + memberId + '&show_locked=' + showLocked
        : '${endpoint}?show_locked=' + showLocked;
      const response = await api.get<Badge[]>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const getIconComponent = (iconName?: string) => {
    const icons: Record<string, React.ElementType> = {
      star: Star,
      shield: Shield,
      zap: Zap,
      trophy: Trophy,
      target: Target,
      crown: Crown,
      sparkles: Sparkles,
    };
    return icons[iconName || 'award'] || Award;
  };

  const getTierStyles = (tier: Badge['tier']) => {
    switch (tier) {
      case 'bronze':
        return 'from-amber-600 to-amber-800';
      case 'silver':
        return 'from-gray-400 to-gray-600';
      case 'gold':
        return 'from-yellow-400 to-yellow-600';
      case 'platinum':
        return 'from-purple-400 to-purple-600';
      case 'special':
        return 'from-pink-500 to-purple-500';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const displayBadges = maxItems ? badges?.slice(0, maxItems) : badges;

  if (!displayBadges || displayBadges.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Award className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
        <p>No badges earned yet</p>
      </div>
    );
  }

  // Group badges by category
  const groupedBadges = displayBadges.reduce((acc, badge) => {
    const category = badge.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(badge);
    return acc;
  }, {} as Record<string, Badge[]>);

  if (layout === 'list') {
    return (
      <div className="space-y-6">
        {Object.entries(groupedBadges).map(([category, categoryBadges]) => (
          <div key={category}>
            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              {category}
            </h4>
            <div className="space-y-2">
              {categoryBadges.map((badge) => {
                const Icon = getIconComponent(badge.icon);
                const isLocked = badge.is_locked;

                return (
                  <div
                    key={badge.id}
                    className={\`flex items-center gap-4 p-3 rounded-xl border transition-colors \${
                      isLocked
                        ? 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 opacity-60'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
                    }\`}
                  >
                    <div
                      className={\`relative w-12 h-12 rounded-xl bg-gradient-to-br \${getTierStyles(badge.tier)} flex items-center justify-center\`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                      {isLocked && (
                        <div className="absolute inset-0 bg-gray-900/50 rounded-xl flex items-center justify-center">
                          <Lock className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-gray-900 dark:text-white">
                        {badge.name}
                      </h5>
                      <p className="text-sm text-gray-500 line-clamp-1">
                        {badge.description}
                      </p>
                      {badge.progress !== undefined && badge.requirement && (
                        <div className="mt-1">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>Progress</span>
                            <span>{badge.progress} / {badge.requirement}</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div
                              className="bg-purple-600 h-1.5 rounded-full"
                              style={{ width: \`\${Math.min(100, (badge.progress / badge.requirement) * 100)}%\` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    {badge.earned_at && (
                      <div className="text-xs text-gray-500 text-right">
                        <p>Earned</p>
                        <p>{new Date(badge.earned_at).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Grid layout (default)
  return (
    <div className="space-y-6">
      {Object.entries(groupedBadges).map(([category, categoryBadges]) => (
        <div key={category}>
          <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            {category}
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categoryBadges.map((badge) => {
              const Icon = getIconComponent(badge.icon);
              const isLocked = badge.is_locked;

              return (
                <div
                  key={badge.id}
                  className={\`relative group p-4 rounded-xl border text-center transition-all \${
                    isLocked
                      ? 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 opacity-60'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-lg'
                  }\`}
                >
                  <div
                    className={\`relative w-14 h-14 mx-auto rounded-xl bg-gradient-to-br \${getTierStyles(badge.tier)} flex items-center justify-center shadow-lg\`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                    {isLocked && (
                      <div className="absolute inset-0 bg-gray-900/50 rounded-xl flex items-center justify-center">
                        <Lock className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                  <h5 className="font-medium text-gray-900 dark:text-white mt-3 text-sm">
                    {badge.name}
                  </h5>
                  <p className="text-xs text-gray-500 capitalize mt-0.5">
                    {badge.tier}
                  </p>

                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-48 z-10">
                    <p className="font-medium">{badge.name}</p>
                    <p className="text-gray-300 mt-1">{badge.description}</p>
                    {badge.earned_at && (
                      <p className="text-gray-400 mt-1">
                        Earned {new Date(badge.earned_at).toLocaleDateString()}
                      </p>
                    )}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateMemberProfileCard(options: ProfileOptions = {}): string {
  const { componentName = 'MemberProfileCard', endpoint = '/forum/members' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Loader2, User, Calendar, MapPin, Globe, Mail,
  MessageSquare, Award, TrendingUp, UserPlus, UserMinus, Flag
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface Member {
  id: string;
  name?: string;
  username: string;
  avatar_url?: string;
  cover_url?: string;
  bio?: string;
  location?: string;
  website?: string;
  role?: string;
  post_count: number;
  thread_count: number;
  like_count: number;
  reputation: number;
  joined_at: string;
  last_active?: string;
  is_online?: boolean;
  is_following?: boolean;
  followers_count: number;
  following_count: number;
  badges?: { id: string; name: string; color?: string }[];
}

interface ${componentName}Props {
  memberId: string;
  variant?: 'full' | 'compact' | 'mini';
  showActions?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  memberId,
  variant = 'full',
  showActions = true,
}) => {
  const queryClient = useQueryClient();

  const { data: member, isLoading } = useQuery({
    queryKey: ['member', memberId],
    queryFn: async () => {
      const response = await api.get<Member>('${endpoint}/' + memberId);
      return response?.data || response;
    },
  });

  const followMutation = useMutation({
    mutationFn: () => api.post('${endpoint}/' + memberId + '/follow', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member', memberId] });
      toast.success(member?.is_following ? 'Unfollowed' : 'Following');
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="text-center py-8 text-gray-500">
        <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>Member not found</p>
      </div>
    );
  }

  if (variant === 'mini') {
    return (
      <Link
        to={\`/forum/member/\${member.username || member.id}\`}
        className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
      >
        <div className="relative">
          {member.avatar_url ? (
            <img src={member.avatar_url} alt="" className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-purple-600" />
            </div>
          )}
          {member.is_online && (
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
          )}
        </div>
        <div className="min-w-0">
          <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
            {member.name || member.username}
          </p>
          <p className="text-xs text-gray-500">@{member.username}</p>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-4">
          <Link to={\`/forum/member/\${member.username || member.id}\`} className="relative flex-shrink-0">
            {member.avatar_url ? (
              <img src={member.avatar_url} alt="" className="w-14 h-14 rounded-full" />
            ) : (
              <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <User className="w-7 h-7 text-purple-600" />
              </div>
            )}
            {member.is_online && (
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
            )}
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Link
                to={\`/forum/member/\${member.username || member.id}\`}
                className="font-semibold text-gray-900 dark:text-white hover:text-purple-600 truncate"
              >
                {member.name || member.username}
              </Link>
              {member.role && (
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded text-xs">
                  {member.role}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">@{member.username}</p>
            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
              <span>{member.post_count} posts</span>
              <span>{member.reputation} rep</span>
            </div>
          </div>

          {showActions && (
            <button
              onClick={() => followMutation.mutate()}
              disabled={followMutation.isPending}
              className={\`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors \${
                member.is_following
                  ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-red-100 hover:text-red-600'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }\`}
            >
              {member.is_following ? (
                <>
                  <UserMinus className="w-4 h-4" />
                  Unfollow
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Follow
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Full variant
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Cover */}
      <div
        className="h-32 bg-gradient-to-r from-purple-500 to-pink-500"
        style={member.cover_url ? { backgroundImage: \`url(\${member.cover_url})\`, backgroundSize: 'cover' } : undefined}
      />

      <div className="px-6 pb-6">
        {/* Avatar and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
          <Link to={\`/forum/member/\${member.username || member.id}\`} className="relative flex-shrink-0">
            {member.avatar_url ? (
              <img
                src={member.avatar_url}
                alt=""
                className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800"
              />
            ) : (
              <div className="w-24 h-24 bg-purple-100 dark:bg-purple-900/30 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center">
                <User className="w-12 h-12 text-purple-600" />
              </div>
            )}
            {member.is_online && (
              <span className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-3 border-white dark:border-gray-800 rounded-full" />
            )}
          </Link>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Link
                to={\`/forum/member/\${member.username || member.id}\`}
                className="text-xl font-bold text-gray-900 dark:text-white hover:text-purple-600"
              >
                {member.name || member.username}
              </Link>
              {member.role && (
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded text-sm">
                  {member.role}
                </span>
              )}
            </div>
            <p className="text-gray-500">@{member.username}</p>
          </div>

          {showActions && (
            <div className="flex gap-2">
              <button
                onClick={() => followMutation.mutate()}
                disabled={followMutation.isPending}
                className={\`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors \${
                  member.is_following
                    ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-red-100 hover:text-red-600'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }\`}
              >
                {followMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : member.is_following ? (
                  <>
                    <UserMinus className="w-4 h-4" />
                    Unfollow
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Follow
                  </>
                )}
              </button>
              <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <MessageSquare className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <Flag className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Bio */}
        {member.bio && (
          <p className="mt-4 text-gray-600 dark:text-gray-400">{member.bio}</p>
        )}

        {/* Info */}
        <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
          {member.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {member.location}
            </span>
          )}
          {member.website && (
            <a
              href={member.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-purple-600 hover:text-purple-700"
            >
              <Globe className="w-4 h-4" />
              Website
            </a>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            Joined {new Date(member.joined_at).toLocaleDateString()}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{member.post_count}</p>
            <p className="text-xs text-gray-500">Posts</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{member.thread_count}</p>
            <p className="text-xs text-gray-500">Threads</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{member.reputation}</p>
            <p className="text-xs text-gray-500">Reputation</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{member.followers_count}</p>
            <p className="text-xs text-gray-500">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{member.following_count}</p>
            <p className="text-xs text-gray-500">Following</p>
          </div>
        </div>

        {/* Badges */}
        {member.badges && member.badges.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {member.badges.slice(0, 5).map((badge) => (
              <span
                key={badge.id}
                className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: (badge.color || '#8B5CF6') + '20',
                  color: badge.color || '#8B5CF6',
                }}
              >
                <Award className="w-3 h-3" />
                {badge.name}
              </span>
            ))}
            {member.badges.length > 5 && (
              <Link
                to={\`/forum/member/\${member.username || member.id}#badges\`}
                className="px-2 py-1 text-xs text-purple-600 hover:text-purple-700"
              >
                +{member.badges.length - 5} more
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
