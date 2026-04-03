/**
 * Leaderboard Generator
 *
 * Generates leaderboard-related components:
 * - LeaderboardPreview: Compact leaderboard display
 */

import { pascalCase, snakeCase } from 'change-case';
import pluralize from 'pluralize';

export interface LeaderboardPreviewOptions {
  componentName?: string;
  entity?: string;
  endpoint?: string;
  queryKey?: string;
  maxItems?: number;
  showRank?: boolean;
  showScore?: boolean;
  showChange?: boolean;
  showAvatar?: boolean;
  title?: string;
  scoreLabel?: string;
}

/**
 * Generate a LeaderboardPreview component
 */
export function generateLeaderboardPreview(options: LeaderboardPreviewOptions = {}): string {
  const {
    componentName = 'LeaderboardPreview',
    entity = 'leaderboard',
    maxItems = 10,
    showRank = true,
    showScore = true,
    showChange = true,
    showAvatar = true,
    title = 'Leaderboard',
    scoreLabel = 'Points',
  } = options;

  const tableName = snakeCase(pluralize.plural(entity));
  const endpoint = options.endpoint || `/${tableName}`;
  const queryKey = options.queryKey || tableName;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  Medal,
  Crown,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  User,
  Loader2,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface LeaderboardEntry {
  id: string;
  rank: number;
  previousRank?: number;
  userId: string;
  userName: string;
  userAvatar?: string;
  score: number;
  level?: number;
  badge?: string;
  streak?: number;
  isCurrentUser?: boolean;
}

interface ${componentName}Props {
  entries?: LeaderboardEntry[];
  currentUserId?: string;
  className?: string;
  onEntryClick?: (entry: LeaderboardEntry) => void;
  onViewAll?: () => void;
}

const RANK_ICONS: Record<number, { icon: React.FC<any>; color: string }> = {
  1: { icon: Crown, color: 'text-yellow-500' },
  2: { icon: Medal, color: 'text-gray-400' },
  3: { icon: Medal, color: 'text-amber-600' },
};

const RANK_BACKGROUNDS: Record<number, string> = {
  1: 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-800',
  2: 'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 border-gray-200 dark:border-gray-700',
  3: 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800',
};

const ${componentName}: React.FC<${componentName}Props> = ({
  entries: propEntries,
  currentUserId,
  className,
  onEntryClick,
  onViewAll,
}) => {
  const navigate = useNavigate();

  const { data: fetchedEntries, isLoading } = useQuery({
    queryKey: ['${queryKey}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>(\`${endpoint}?limit=${maxItems}\`);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
        return [];
      }
    },
    enabled: !propEntries,
  });

  const entries = (propEntries || fetchedEntries || []).slice(0, ${maxItems});

  const getRankChange = (entry: LeaderboardEntry) => {
    if (entry.previousRank === undefined || entry.previousRank === entry.rank) {
      return { type: 'same', value: 0 };
    }
    if (entry.previousRank > entry.rank) {
      return { type: 'up', value: entry.previousRank - entry.rank };
    }
    return { type: 'down', value: entry.rank - entry.previousRank };
  };

  const formatScore = (score: number) => {
    if (score >= 1000000) return (score / 1000000).toFixed(1) + 'M';
    if (score >= 1000) return (score / 1000).toFixed(1) + 'K';
    return score.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className={cn('bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6', className)}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className={cn('bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6', className)}>
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">${title}</h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          No entries yet. Be the first!
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700', className)}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">${title}</h3>
          </div>
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Entries */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
        {entries.map((entry: LeaderboardEntry) => {
          const rankChange = getRankChange(entry);
          const RankIcon = RANK_ICONS[entry.rank]?.icon;
          const rankColor = RANK_ICONS[entry.rank]?.color;
          const isHighlighted = entry.isCurrentUser || entry.userId === currentUserId;

          return (
            <div
              key={entry.id}
              onClick={() => onEntryClick?.(entry)}
              className={cn(
                'px-4 py-3 transition-colors',
                entry.rank <= 3 ? RANK_BACKGROUNDS[entry.rank] : 'hover:bg-gray-50 dark:hover:bg-gray-700/50',
                isHighlighted && 'ring-2 ring-blue-500 ring-inset',
                onEntryClick && 'cursor-pointer'
              )}
            >
              <div className="flex items-center gap-3">
                ${showRank ? `{/* Rank */}
                <div className="flex-shrink-0 w-8 text-center">
                  {RankIcon ? (
                    <RankIcon className={cn('w-6 h-6 mx-auto', rankColor)} />
                  ) : (
                    <span className="text-lg font-bold text-gray-600 dark:text-gray-400">
                      {entry.rank}
                    </span>
                  )}
                </div>` : ''}

                ${showAvatar ? `{/* Avatar */}
                <div className="flex-shrink-0">
                  {entry.userAvatar ? (
                    <img
                      src={entry.userAvatar}
                      alt={entry.userName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-500" />
                    </div>
                  )}
                </div>` : ''}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'font-medium truncate',
                      isHighlighted ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                    )}>
                      {entry.userName}
                      {isHighlighted && ' (You)'}
                    </span>
                    {entry.badge && (
                      <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 text-xs rounded">
                        {entry.badge}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {entry.level !== undefined && (
                      <span>Level {entry.level}</span>
                    )}
                    {entry.streak !== undefined && entry.streak > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 text-orange-500" />
                        {entry.streak} streak
                      </span>
                    )}
                  </div>
                </div>

                ${showScore ? `{/* Score */}
                <div className="flex-shrink-0 text-right">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatScore(entry.score)}
                  </div>
                  <div className="text-xs text-gray-500">${scoreLabel}</div>
                </div>` : ''}

                ${showChange ? `{/* Change */}
                <div className="flex-shrink-0 w-10 text-right">
                  {rankChange.type === 'up' && (
                    <div className="flex items-center gap-0.5 text-green-600">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-xs font-medium">{rankChange.value}</span>
                    </div>
                  )}
                  {rankChange.type === 'down' && (
                    <div className="flex items-center gap-0.5 text-red-600">
                      <TrendingDown className="w-4 h-4" />
                      <span className="text-xs font-medium">{rankChange.value}</span>
                    </div>
                  )}
                  {rankChange.type === 'same' && (
                    <Minus className="w-4 h-4 text-gray-400 ml-auto" />
                  )}
                </div>` : ''}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      {onViewAll && entries.length >= ${maxItems} && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onViewAll}
            className="w-full text-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
          >
            View Full Leaderboard
          </button>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate leaderboard components for a specific domain
 */
export function generateLeaderboardComponents(domain: string): { preview: string } {
  const pascalDomain = pascalCase(domain);

  return {
    preview: generateLeaderboardPreview({
      componentName: `${pascalDomain}LeaderboardPreview`,
      entity: `${domain}Leaderboard`,
    }),
  };
}
