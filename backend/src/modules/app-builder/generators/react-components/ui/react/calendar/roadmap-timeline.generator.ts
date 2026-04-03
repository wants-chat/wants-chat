import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateRoadmapTimeline = (
  resolved: ResolvedComponent,
  variant: 'timeline' | 'kanban' | 'list' = 'timeline'
) => {
  const dataSource = resolved.dataSource;

  const getField = (fieldName: string): string => {
    const mapping = resolved.fieldMappings.find(m => m.targetField === fieldName);
    if (mapping?.sourceField) {
      return `propData?.${mapping.sourceField}`;
    }
    // Return undefined/empty for missing data - let component handle gracefully
    // For ID fields
    if (fieldName === 'id' || fieldName.endsWith('Id')) {
      return `propData?.id || ${dataName}?._id`;
    }
    // For array fields
    if (fieldName.match(/items|steps|updates|timeline|list|array|images|products|users|orders|features|links|stats|statistics|metrics|categories|tags|members|avatars|methods|examples|reviews|comments|notifications|messages|events|courses|lessons|modules|posts|articles|videos|photos|data|results|activities|cards|testimonials|faqs|questions|answers|options|choices|variants|attributes|filters|transactions|invoices|payments|receipts|shipments|deliveries/i)) {
      return `propData?.${fieldName} || ([] as any[])`;
    }
    // For object fields
    if (fieldName.match(/address|metadata|config|settings|tracking|gallery/i)) {
      return `propData?.${fieldName} || ({} as any)`;
    }
    // For scalar values - return empty string as fallback
    return `propData?.${fieldName} || ''`;
  };

  // Parse data source for clean prop naming (sanitize to camelCase)
  const sanitizeVariableName = (name: string): string => {
    // Replace dots and underscores with camelCase
    return name
      .split(/[._]/)
      .map((part, index) => {
        if (index === 0) {
          return part;
        }
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join('');
  };

  const getDataPath = () => {
    if (!dataSource || dataSource.trim() === '') return 'data';
    const parts = dataSource.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart ? sanitizeVariableName(lastPart) : 'data';
  };

  const dataName = getDataPath();

  // Get API route for data fetching
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'roadmap'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource || 'roadmap';

  const commonImports = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ThumbsUp, Bell, BellOff, Calendar, TrendingUp, Check, Loader, Loader2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';`;

  const variants = {
    timeline: `
${commonImports}

interface Feature {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in_progress' | 'planned';
  category: string;
  priority: 'high' | 'medium' | 'low';
  votes: number;
  estimatedDate: string;
  completedDate: string | null;
  progress: number;
}

interface RoadmapProps {
  ${dataName}?: any;
  className?: string;
  onVote?: (featureId: string) => void;
  onSubscribe?: (featureId: string) => void;
  onFeatureClick?: (feature: Feature) => void;
}

const RoadmapTimeline: React.FC<RoadmapProps> = ({
  ${dataName}: propData,
  className,
  onVote,
  onSubscribe,
  onFeatureClick
}) => {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData;
  const roadmapData = ${dataName} || {};

  if (isLoading && !propData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const features = ${getField('features')} as Feature[];
  const categories = ${getField('categories')} as string[];
  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const voteText = ${getField('voteText')};
  const votedText = ${getField('votedText')};
  const votesText = ${getField('votesText')};
  const subscribeText = ${getField('subscribeText')};
  const subscribedText = ${getField('subscribedText')};
  const filterByCategoryText = ${getField('filterByCategoryText')};
  const completedText = ${getField('completedText')};
  const inProgressText = ${getField('inProgressText')};
  const plannedText = ${getField('plannedText')};
  const estimatedText = ${getField('estimatedText')};
  const progressText = ${getField('progressText')};

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [votedFeatures, setVotedFeatures] = useState<string[]>([]);
  const [subscribedFeatures, setSubscribedFeatures] = useState<string[]>([]);

  const handleVote = (featureId: string) => {
    if (votedFeatures.includes(featureId)) {
      setVotedFeatures(votedFeatures.filter(id => id !== featureId));
    } else {
      setVotedFeatures([...votedFeatures, featureId]);
    }
    onVote?.(featureId);
  };

  const handleSubscribe = (featureId: string) => {
    if (subscribedFeatures.includes(featureId)) {
      setSubscribedFeatures(subscribedFeatures.filter(id => id !== featureId));
    } else {
      setSubscribedFeatures([...subscribedFeatures, featureId]);
    }
    onSubscribe?.(featureId);
  };

  const handleFeatureClick = (feature: Feature) => {
    onFeatureClick?.(feature);
  };

  const filteredFeatures = selectedCategory === 'All'
    ? features
    : features.filter(f => f.category === selectedCategory);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'planned':
        return 'bg-gray-400 dark:bg-gray-600';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return completedText;
      case 'in_progress':
        return inProgressText;
      case 'planned':
        return plannedText;
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="w-4 h-4" />;
      case 'in_progress':
        return <Loader className="w-4 h-4 animate-spin" />;
      case 'planned':
        return <Clock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4", className)}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {subtitle}
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {filterByCategoryText}
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium transition-colors",
                  selectedCategory === category
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-12 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700 hidden md:block" />

          {/* Feature entries */}
          <div className="space-y-8">
            {filteredFeatures.map((feature) => {
              const isVoted = votedFeatures.includes(feature.id);
              const isSubscribed = subscribedFeatures.includes(feature.id);

              return (
                <div key={feature.id} className="relative md:pl-24">
                  {/* Timeline dot */}
                  <div className={cn(
                    "absolute left-9 top-6 w-6 h-6 rounded-full border-4 border-white dark:border-gray-900 shadow-lg hidden md:flex items-center justify-center",
                    getStatusColor(feature.status)
                  )}>
                    <div className="text-white text-xs">
                      {getStatusIcon(feature.status)}
                    </div>
                  </div>

                  {/* Date badge */}
                  <div className="absolute left-0 top-4 text-right mr-4 hidden md:block" style={{ width: '80px' }}>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {formatDate(feature.estimatedDate)}
                    </div>
                  </div>

                  {/* Content card */}
                  <div
                    onClick={() => handleFeatureClick(feature)}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            {feature.title}
                          </h3>
                          <span className={cn(
                            "px-3 py-1 rounded-full text-xs font-medium text-white flex items-center gap-1",
                            getStatusColor(feature.status)
                          )}>
                            {getStatusIcon(feature.status)}
                            {getStatusText(feature.status)}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-3">
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                            {feature.category}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {estimatedText}: {formatDate(feature.estimatedDate)}
                          </span>
                        </div>

                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                          {feature.description}
                        </p>

                        {/* Progress bar for in-progress items */}
                        {feature.status === 'in_progress' && (
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                              <span>{progressText}</span>
                              <span>{feature.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: \`\${feature.progress}%\` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleVote(feature.id); }}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                          isVoted
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        )}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>{isVoted ? votedText : voteText}</span>
                        <span className="ml-1">({feature.votes + (isVoted ? 1 : 0)})</span>
                      </button>

                      <button
                        onClick={(e) => { e.stopPropagation(); handleSubscribe(feature.id); }}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                          isSubscribed
                            ? "bg-green-600 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        )}
                      >
                        {isSubscribed ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                        <span>{isSubscribed ? subscribedText : subscribeText}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapTimeline;
    `,

    kanban: `
${commonImports}

interface Feature {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in_progress' | 'planned';
  category: string;
  priority: 'high' | 'medium' | 'low';
  votes: number;
  estimatedDate: string;
  completedDate: string | null;
  progress: number;
}

interface RoadmapProps {
  ${dataName}?: any;
  className?: string;
  onVote?: (featureId: string) => void;
  onSubscribe?: (featureId: string) => void;
  onFeatureClick?: (feature: Feature) => void;
}

const RoadmapTimeline: React.FC<RoadmapProps> = ({
  ${dataName}: propData,
  className,
  onVote,
  onSubscribe,
  onFeatureClick
}) => {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData;
  const roadmapData = ${dataName} || {};

  if (isLoading && !propData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const features = ${getField('features')} as Feature[];
  const categories = ${getField('categories')} as string[];
  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const voteText = ${getField('voteText')};
  const votedText = ${getField('votedText')};
  const completedText = ${getField('completedText')};
  const inProgressText = ${getField('inProgressText')};
  const plannedText = ${getField('plannedText')};
  const filterByCategoryText = ${getField('filterByCategoryText')};

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [votedFeatures, setVotedFeatures] = useState<string[]>([]);

  const handleVote = (featureId: string) => {
    if (votedFeatures.includes(featureId)) {
      setVotedFeatures(votedFeatures.filter(id => id !== featureId));
    } else {
      setVotedFeatures([...votedFeatures, featureId]);
    }
    onVote?.(featureId);
  };

  const handleFeatureClick = (feature: Feature) => {
    onFeatureClick?.(feature);
  };

  const filteredFeatures = selectedCategory === 'All'
    ? features
    : features.filter(f => f.category === selectedCategory);

  const completedFeatures = filteredFeatures.filter(f => f.status === 'completed');
  const inProgressFeatures = filteredFeatures.filter(f => f.status === 'in_progress');
  const plannedFeatures = filteredFeatures.filter(f => f.status === 'planned');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-400';
    }
  };

  const FeatureCard = ({ feature }: { feature: Feature }) => {
    const isVoted = votedFeatures.includes(feature.id);

    return (
      <div
        onClick={() => handleFeatureClick(feature)}
        className={cn(
          "bg-white dark:bg-gray-800 rounded-lg shadow-sm border-l-4 border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:shadow-md transition-shadow",
          getPriorityColor(feature.priority)
        )}
      >
        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {feature.title}
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {feature.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300">
            {feature.category}
          </span>

          <button
            onClick={(e) => { e.stopPropagation(); handleVote(feature.id); }}
            className={cn(
              "flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors",
              isVoted
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            )}
          >
            <ThumbsUp className="w-3 h-3" />
            <span>{feature.votes + (isVoted ? 1 : 0)}</span>
          </button>
        </div>

        {feature.status === 'in_progress' && (
          <div className="mt-3">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all"
                style={{ width: \`\${feature.progress}%\` }}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4", className)}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {subtitle}
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {filterByCategoryText}
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium transition-colors",
                  selectedCategory === category
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Completed Column */}
          <div>
            <div className="bg-green-100 dark:bg-green-900/20 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h3 className="font-semibold text-green-900 dark:text-green-400">
                  {completedText}
                </h3>
                <span className="ml-auto text-sm text-green-700 dark:text-green-500">
                  {completedFeatures.length}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              {completedFeatures.map(feature => (
                <FeatureCard key={feature.id} feature={feature} />
              ))}
            </div>
          </div>

          {/* In Progress Column */}
          <div>
            <div className="bg-blue-100 dark:bg-blue-900/20 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2">
                <Loader className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-semibold text-blue-900 dark:text-blue-400">
                  {inProgressText}
                </h3>
                <span className="ml-auto text-sm text-blue-700 dark:text-blue-500">
                  {inProgressFeatures.length}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              {inProgressFeatures.map(feature => (
                <FeatureCard key={feature.id} feature={feature} />
              ))}
            </div>
          </div>

          {/* Planned Column */}
          <div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {plannedText}
                </h3>
                <span className="ml-auto text-sm text-gray-600 dark:text-gray-400">
                  {plannedFeatures.length}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              {plannedFeatures.map(feature => (
                <FeatureCard key={feature.id} feature={feature} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapTimeline;
    `,

    list: `
${commonImports}

interface Feature {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in_progress' | 'planned';
  category: string;
  priority: 'high' | 'medium' | 'low';
  votes: number;
  estimatedDate: string;
  completedDate: string | null;
  progress: number;
}

interface RoadmapProps {
  ${dataName}?: any;
  className?: string;
  onVote?: (featureId: string) => void;
  onSubscribe?: (featureId: string) => void;
  onFeatureClick?: (feature: Feature) => void;
}

const RoadmapTimeline: React.FC<RoadmapProps> = ({
  ${dataName}: propData,
  className,
  onVote,
  onSubscribe,
  onFeatureClick
}) => {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData;
  const roadmapData = ${dataName} || {};

  if (isLoading && !propData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const features = ${getField('features')} as Feature[];
  const categories = ${getField('categories')} as string[];
  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const voteText = ${getField('voteText')};
  const votedText = ${getField('votedText')};
  const subscribeText = ${getField('subscribeText')};
  const subscribedText = ${getField('subscribedText')};
  const filterByCategoryText = ${getField('filterByCategoryText')};
  const estimatedText = ${getField('estimatedText')};

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [votedFeatures, setVotedFeatures] = useState<string[]>([]);
  const [subscribedFeatures, setSubscribedFeatures] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'votes' | 'date'>('votes');

  const handleVote = (featureId: string) => {
    if (votedFeatures.includes(featureId)) {
      setVotedFeatures(votedFeatures.filter(id => id !== featureId));
    } else {
      setVotedFeatures([...votedFeatures, featureId]);
    }
    onVote?.(featureId);
  };

  const handleSubscribe = (featureId: string) => {
    if (subscribedFeatures.includes(featureId)) {
      setSubscribedFeatures(subscribedFeatures.filter(id => id !== featureId));
    } else {
      setSubscribedFeatures([...subscribedFeatures, featureId]);
    }
    onSubscribe?.(featureId);
  };

  const handleFeatureClick = (feature: Feature) => {
    onFeatureClick?.(feature);
  };

  const filteredFeatures = selectedCategory === 'All'
    ? features
    : features.filter(f => f.category === selectedCategory);

  const sortedFeatures = [...filteredFeatures].sort((a, b) => {
    if (sortBy === 'votes') {
      return b.votes - a.votes;
    } else {
      return new Date(a.estimatedDate).getTime() - new Date(b.estimatedDate).getTime();
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: <Check className="w-3 h-3" /> };
      case 'in_progress':
        return { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: <Loader className="w-3 h-3" /> };
      case 'planned':
        return { color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400', icon: <Clock className="w-3 h-3" /> };
      default:
        return { color: 'bg-gray-100 text-gray-700', icon: null };
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4", className)}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {subtitle}
          </p>
        </div>

        {/* Filters and Sort */}
        <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {filterByCategoryText}
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    selectedCategory === category
                      ? "bg-blue-600 text-white"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'votes' | 'date')}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="votes">Most Voted</option>
              <option value="date">Date</option>
            </select>
          </div>
        </div>

        {/* Feature List */}
        <div className="space-y-4">
          {sortedFeatures.map((feature) => {
            const isVoted = votedFeatures.includes(feature.id);
            const isSubscribed = subscribedFeatures.includes(feature.id);
            const statusBadge = getStatusBadge(feature.status);

            return (
              <div
                key={feature.id}
                onClick={() => handleFeatureClick(feature)}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* Vote button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleVote(feature.id); }}
                    className={cn(
                      "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px]",
                      isVoted
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    )}
                  >
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-xs font-medium">{feature.votes + (isVoted ? 1 : 0)}</span>
                  </button>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                          {feature.title}
                        </h3>

                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className={\`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 \${statusBadge.color}\`}>
                            {statusBadge.icon}
                            {feature.status.replace('_', ' ')}
                          </span>
                          <span className={cn('px-2 py-1 rounded-full text-xs font-medium', getPriorityBadge(feature.priority))}>
                            {feature.priority} priority
                          </span>
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300">
                            {feature.category}
                          </span>
                          <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {estimatedText}: {formatDate(feature.estimatedDate)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {feature.description}
                    </p>

                    {/* Progress bar for in-progress items */}
                    {feature.status === 'in_progress' && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <span>Progress</span>
                          <span>{feature.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: \`\${feature.progress}%\` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Subscribe button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSubscribe(feature.id); }}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                        isSubscribed
                          ? "bg-green-600 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      )}
                    >
                      {isSubscribed ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                      <span>{isSubscribed ? subscribedText : subscribeText}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RoadmapTimeline;
    `
  };

  return variants[variant] || variants.timeline;
};
