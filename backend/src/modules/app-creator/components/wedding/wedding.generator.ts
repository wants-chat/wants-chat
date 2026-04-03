/**
 * Wedding Component Generators
 *
 * Generates wedding planning components including stats, countdown, timeline, and budget summary.
 */

export interface WeddingOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateWeddingStats(options: WeddingOptions = {}): string {
  const { componentName = 'WeddingStats', endpoint = '/wedding/stats' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Loader2,
  Users,
  CheckCircle2,
  Clock,
  DollarSign,
  Heart,
  Calendar,
  MapPin,
  Utensils,
} from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
  weddingId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ className, weddingId }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['wedding-stats', weddingId],
    queryFn: async () => {
      const url = weddingId ? '${endpoint}?weddingId=' + weddingId : '${endpoint}';
      const response = await api.get<any>(url);
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const statItems = [
    {
      label: 'Total Guests',
      value: stats?.totalGuests || 0,
      subtext: \`\${stats?.confirmedGuests || 0} confirmed\`,
      icon: Users,
      color: 'blue',
    },
    {
      label: 'Tasks Completed',
      value: stats?.completedTasks || 0,
      subtext: \`of \${stats?.totalTasks || 0} total\`,
      icon: CheckCircle2,
      color: 'green',
    },
    {
      label: 'Days Until',
      value: stats?.daysUntilWedding ?? '--',
      subtext: stats?.weddingDate ? new Date(stats.weddingDate).toLocaleDateString() : 'Set date',
      icon: Calendar,
      color: 'purple',
    },
    {
      label: 'Budget Spent',
      value: \`$\${(stats?.budgetSpent || 0).toLocaleString()}\`,
      subtext: \`of $\${(stats?.totalBudget || 0).toLocaleString()}\`,
      icon: DollarSign,
      color: 'orange',
    },
  ];

  const colorClasses: Record<string, { bg: string; icon: string }> = {
    blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', icon: 'text-blue-600 dark:text-blue-400' },
    green: { bg: 'bg-green-100 dark:bg-green-900/30', icon: 'text-green-600 dark:text-green-400' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', icon: 'text-purple-600 dark:text-purple-400' },
    orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', icon: 'text-orange-600 dark:text-orange-400' },
  };

  return (
    <div className={\`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 \${className || ''}\`}>
      {statItems.map((stat, index) => {
        const colors = colorClasses[stat.color];
        return (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5"
          >
            <div className="flex items-center gap-4">
              <div className={\`w-12 h-12 rounded-xl flex items-center justify-center \${colors.bg}\`}>
                <stat.icon className={\`w-6 h-6 \${colors.icon}\`} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-400">{stat.subtext}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateWeddingCountdown(options: WeddingOptions = {}): string {
  const { componentName = 'WeddingCountdown', endpoint = '/wedding/details' } = options;

  return `import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Heart, Calendar, MapPin, Clock } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
  weddingId?: string;
  weddingDate?: string;
  venueName?: string;
  coupleName?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  className,
  weddingId,
  weddingDate: propDate,
  venueName: propVenue,
  coupleName: propCouple,
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const { data: wedding, isLoading } = useQuery({
    queryKey: ['wedding-details', weddingId],
    queryFn: async () => {
      const url = weddingId ? '${endpoint}?weddingId=' + weddingId : '${endpoint}';
      const response = await api.get<any>(url);
      return response?.data || response;
    },
    enabled: !propDate,
  });

  const weddingDate = propDate || wedding?.date || wedding?.weddingDate;
  const venueName = propVenue || wedding?.venue || wedding?.venueName;
  const coupleName = propCouple || wedding?.couple || wedding?.coupleName;

  useEffect(() => {
    if (!weddingDate) return;

    const calculateTimeLeft = () => {
      const targetDate = new Date(weddingDate).getTime();
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [weddingDate]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const timeUnits = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <div
      className={\`bg-gradient-to-br from-rose-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-sm border border-rose-100 dark:border-gray-700 p-8 text-center \${className || ''}\`}
    >
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center">
          <Heart className="w-8 h-8 text-rose-500" fill="currentColor" />
        </div>
      </div>

      {coupleName && (
        <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-2">
          {coupleName}
        </h2>
      )}

      <p className="text-rose-600 dark:text-rose-400 font-medium mb-6">Counting Down to the Big Day</p>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {timeUnits.map((unit, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-rose-100 dark:border-gray-700"
          >
            <div className="text-3xl md:text-4xl font-bold text-rose-600 dark:text-rose-400">
              {String(unit.value).padStart(2, '0')}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">{unit.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
        {weddingDate && (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-rose-500" />
            <span>{new Date(weddingDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        )}
        {venueName && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-500" />
            <span>{venueName}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateWeddingTimeline(options: WeddingOptions = {}): string {
  const { componentName = 'WeddingTimeline', endpoint = '/wedding/timeline' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Loader2,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  Heart,
  Users,
  Music,
  Camera,
  Utensils,
  Car,
  Flower2,
  Gem,
} from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
  weddingId?: string;
}

const iconMap: Record<string, any> = {
  ceremony: Heart,
  reception: Utensils,
  photos: Camera,
  music: Music,
  guests: Users,
  transport: Car,
  flowers: Flower2,
  rings: Gem,
  default: Calendar,
};

const ${componentName}: React.FC<${componentName}Props> = ({ className, weddingId }) => {
  const { data: events, isLoading } = useQuery({
    queryKey: ['wedding-timeline', weddingId],
    queryFn: async () => {
      const url = weddingId ? '${endpoint}?weddingId=' + weddingId : '${endpoint}';
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const sortedEvents = [...(events || [])].sort((a: any, b: any) => {
    const dateA = new Date(a.time || a.date || a.startTime);
    const dateB = new Date(b.time || b.date || b.startTime);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 \${className || ''}\`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-rose-500" />
          Wedding Day Timeline
        </h3>
      </div>

      <div className="p-4">
        {sortedEvents.length > 0 ? (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-rose-200 dark:bg-rose-900/50" />

            <div className="space-y-6">
              {sortedEvents.map((event: any, index: number) => {
                const Icon = iconMap[event.type?.toLowerCase()] || iconMap.default;
                const isCompleted = event.completed || event.status === 'completed';

                return (
                  <div key={event.id || index} className="relative flex gap-4">
                    {/* Icon */}
                    <div
                      className={\`relative z-10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 \${
                        isCompleted
                          ? 'bg-green-100 dark:bg-green-900/30'
                          : 'bg-rose-100 dark:bg-rose-900/30'
                      }\`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      ) : (
                        <Icon className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className={\`font-medium \${isCompleted ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white'}\`}>
                            {event.title || event.name}
                          </h4>
                          {event.description && (
                            <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                          )}
                          {event.location && (
                            <p className="text-xs text-gray-400 mt-1">@ {event.location}</p>
                          )}
                        </div>
                        <span className="text-sm font-medium text-rose-600 dark:text-rose-400 whitespace-nowrap ml-4">
                          {event.time || (event.startTime && new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))}
                        </span>
                      </div>
                      {event.duration && (
                        <span className="inline-block mt-2 text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400">
                          Duration: {event.duration}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            No timeline events yet
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateBudgetSummaryWedding(options: WeddingOptions = {}): string {
  const { componentName = 'BudgetSummaryWedding', endpoint = '/wedding/budget' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Loader2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Utensils,
  Camera,
  Music,
  Flower2,
  Users,
  Shirt,
  MapPin,
  Cake,
  Car,
  Gem,
} from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
  weddingId?: string;
}

const categoryIcons: Record<string, any> = {
  venue: MapPin,
  catering: Utensils,
  photography: Camera,
  music: Music,
  flowers: Flower2,
  attire: Shirt,
  cake: Cake,
  transportation: Car,
  rings: Gem,
  invitations: Users,
};

const ${componentName}: React.FC<${componentName}Props> = ({ className, weddingId }) => {
  const { data: budget, isLoading } = useQuery({
    queryKey: ['wedding-budget', weddingId],
    queryFn: async () => {
      const url = weddingId ? '${endpoint}?weddingId=' + weddingId : '${endpoint}';
      const response = await api.get<any>(url);
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const totalBudget = budget?.totalBudget || budget?.total || 0;
  const totalSpent = budget?.totalSpent || budget?.spent || 0;
  const remaining = totalBudget - totalSpent;
  const percentSpent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const isOverBudget = remaining < 0;
  const isNearLimit = percentSpent >= 80 && percentSpent <= 100;

  const categories = budget?.categories || budget?.items || [];

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 \${className || ''}\`}>
      {/* Header Summary */}
      <div className="p-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-rose-500" />
            Wedding Budget
          </h3>
          {isOverBudget && (
            <span className="flex items-center gap-1 text-sm text-red-600">
              <AlertTriangle className="w-4 h-4" />
              Over Budget
            </span>
          )}
        </div>

        {/* Budget Overview */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Total Budget</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              \${totalBudget.toLocaleString()}
            </p>
          </div>
          <div className="text-center border-x border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Spent</p>
            <p className="text-xl font-bold text-rose-600">
              \${totalSpent.toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Remaining</p>
            <p className={\`text-xl font-bold \${isOverBudget ? 'text-red-600' : 'text-green-600'}\`}>
              \${Math.abs(remaining).toLocaleString()}
              {isOverBudget && ' over'}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500">{percentSpent.toFixed(0)}% spent</span>
            <span className={\`font-medium \${isOverBudget ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-green-600'}\`}>
              {isOverBudget ? 'Over Budget!' : isNearLimit ? 'Almost There' : 'On Track'}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className={\`h-3 rounded-full transition-all \${
                isOverBudget ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-rose-500'
              }\`}
              style={{ width: \`\${Math.min(percentSpent, 100)}%\` }}
            />
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="p-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">By Category</h4>
        <div className="space-y-3">
          {categories.length > 0 ? (
            categories.map((category: any, index: number) => {
              const Icon = categoryIcons[category.name?.toLowerCase()] || categoryIcons[category.category?.toLowerCase()] || DollarSign;
              const catBudget = category.budget || category.allocated || 0;
              const catSpent = category.spent || category.used || 0;
              const catProgress = catBudget > 0 ? (catSpent / catBudget) * 100 : 0;
              const catOver = catSpent > catBudget;

              return (
                <div key={category.id || index} className="group">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className={\`w-8 h-8 rounded-lg flex items-center justify-center \${catOver ? 'bg-red-100 dark:bg-red-900/30' : 'bg-rose-100 dark:bg-rose-900/30'}\`}>
                        <Icon className={\`w-4 h-4 \${catOver ? 'text-red-600' : 'text-rose-600'}\`} />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {category.name || category.category}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={\`text-sm font-medium \${catOver ? 'text-red-600' : 'text-gray-900 dark:text-white'}\`}>
                        \${catSpent.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-400"> / \${catBudget.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div
                      className={\`h-1.5 rounded-full transition-all \${catOver ? 'bg-red-500' : 'bg-rose-500'}\`}
                      style={{ width: \`\${Math.min(catProgress, 100)}%\` }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-4 text-gray-500 text-sm">
              No budget categories set
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      {isNearLimit && !isOverBudget && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-t border-yellow-100 dark:border-yellow-900/50">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 flex items-start gap-2">
            <TrendingUp className="w-4 h-4 mt-0.5 flex-shrink-0" />
            You're approaching your budget limit. Consider reviewing optional expenses.
          </p>
        </div>
      )}
      {isOverBudget && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-t border-red-100 dark:border-red-900/50">
          <p className="text-sm text-red-800 dark:text-red-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            You've exceeded your budget by \${Math.abs(remaining).toLocaleString()}. Review your expenses to find areas to cut back.
          </p>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}
