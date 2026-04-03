import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateTagCloudWidget = (
  resolved: ResolvedComponent,
  variant: 'cloud' | 'list' | 'weighted' = 'cloud'
) => {
  const dataSource = resolved.dataSource;

  const getField = (fieldName: string): string => {
    const mapping = resolved.fieldMappings.find(m => m.targetField === fieldName);
    if (mapping?.sourceField) {
      return `data?.${mapping.sourceField}`;
    }
    // Return undefined/empty for missing data - let component handle gracefully
    // For ID fields
    if (fieldName === 'id' || fieldName.endsWith('Id')) {
      return `data?.id || data?._id`;
    }
    // For array fields
    if (fieldName.match(/items|steps|updates|timeline|list|array|images|products|users|orders|features|links|stats|statistics|metrics|categories|tags|members|avatars|methods|examples|reviews|comments|notifications|messages|events|courses|lessons|modules|posts|articles|videos|photos|data|results|activities|cards|testimonials|faqs|questions|answers|options|choices|variants|attributes|filters|transactions|invoices|payments|receipts|shipments|deliveries/i)) {
      return `data?.${fieldName} || ([] as any[])`;
    }
    // For object fields
    if (fieldName.match(/address|metadata|config|settings|tracking|gallery/i)) {
      return `data?.${fieldName} || ({} as any)`;
    }
    // For scalar values - return empty string as fallback
    return `data?.${fieldName} || ''`;
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
    return `/${dataSource || 'tags'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource || 'tags';

  const commonImports = `
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';`;

  const variants = {
    cloud: `
${commonImports}
import { Tags } from 'lucide-react';

interface Tag {
  name: string;
  count: number;
  slug: string;
}

interface CloudTagWidgetProps {
  ${dataName}?: any;
  className?: string;
  onTagClick?: (slug: string) => void;
  maxTags?: number;
}

const CloudTagWidget: React.FC<CloudTagWidgetProps> = ({
  ${dataName}: propData,
  className,
  onTagClick,
  maxTags = 20
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !propData,
    retry: 1,
  });

  const data = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const blogData = data || {};

  const title = ${getField('cloudTitle')};
  const subtitle = ${getField('cloudSubtitle')};
  const tags = ${getField('tags')};

  const handleTagClick = (slug: string) => {
    if (onTagClick) {
      onTagClick(slug);
    } else {
      console.log('Tag clicked:', slug);
    }
  };

  // Calculate font sizes based on count
  const maxCount = Math.max(...tags.map((t: Tag) => t.count));
  const minCount = Math.min(...tags.map((t: Tag) => t.count));

  const getFontSize = (count: number): string => {
    const ratio = (count - minCount) / (maxCount - minCount);
    const minSize = 0.75; // rem
    const maxSize = 1.5; // rem
    const size = minSize + ratio * (maxSize - minSize);
    return \`\${size}rem\`;
  };

  const colors = [
    'text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30',
    'text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/30',
    'text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30',
    'text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/30',
    'text-pink-600 hover:bg-pink-100 dark:hover:bg-pink-900/30',
    'text-cyan-600 hover:bg-cyan-100 dark:hover:bg-cyan-900/30'
  ];

  const getColor = (index: number): string => {
    return colors[index % colors.length];
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tags className="h-5 w-5" />
          {title}
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {tags.slice(0, maxTags).map((tag: Tag, index: number) => (
            <button
              key={tag.slug}
              onClick={() => handleTagClick(tag.slug)}
              className={\`\${getColor(index)} px-3 py-1 rounded-full font-medium transition-all hover:scale-110\`}
              style={{ fontSize: getFontSize(tag.count) }}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CloudTagWidget;
    `,

    list: `
${commonImports}
import { Tags, Hash } from 'lucide-react';

interface Tag {
  name: string;
  count: number;
  slug: string;
}

interface ListTagWidgetProps {
  ${dataName}?: any;
  className?: string;
  onTagClick?: (slug: string) => void;
  maxTags?: number;
  sortBy?: 'popular' | 'alphabetical';
}

const ListTagWidget: React.FC<ListTagWidgetProps> = ({
  ${dataName}: propData,
  className,
  onTagClick,
  maxTags = 20,
  sortBy = 'popular'
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !propData,
    retry: 1,
  });

  const data = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const blogData = data || {};

  const title = ${getField('listTitle')};
  const subtitle = ${getField('listSubtitle')};
  let tags = ${getField('tags')};

  // Sort tags
  const sortedTags = [...tags].sort((a: Tag, b: Tag) => {
    if (sortBy === 'alphabetical') {
      return a.name.localeCompare(b.name);
    }
    return b.count - a.count;
  });

  const handleTagClick = (slug: string) => {
    if (onTagClick) {
      onTagClick(slug);
    } else {
      console.log('Tag clicked:', slug);
    }
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tags className="h-5 w-5" />
          {title}
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sortedTags.slice(0, maxTags).map((tag: Tag) => (
            <button
              key={tag.slug}
              onClick={() => handleTagClick(tag.slug)}
              className="w-full flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors group text-left"
            >
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {tag.name}
                </span>
              </div>
              <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                {tag.count}
              </span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ListTagWidget;
    `,

    weighted: `
${commonImports}
import { Tags, TrendingUp } from 'lucide-react';

interface Tag {
  name: string;
  count: number;
  slug: string;
}

interface WeightedTagWidgetProps {
  ${dataName}?: any;
  className?: string;
  onTagClick?: (slug: string) => void;
  maxTags?: number;
}

const WeightedTagWidget: React.FC<WeightedTagWidgetProps> = ({
  ${dataName}: propData,
  className,
  onTagClick,
  maxTags = 20
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !propData,
    retry: 1,
  });

  const data = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const blogData = data || {};

  const title = ${getField('weightedTitle')};
  const subtitle = ${getField('weightedSubtitle')};
  const tags = ${getField('tags')};

  const handleTagClick = (slug: string) => {
    if (onTagClick) {
      onTagClick(slug);
    } else {
      console.log('Tag clicked:', slug);
    }
  };

  // Calculate weights
  const maxCount = Math.max(...tags.map((t: Tag) => t.count));
  const minCount = Math.min(...tags.map((t: Tag) => t.count));

  const getWeight = (count: number): 1 | 2 | 3 | 4 | 5 => {
    const ratio = (count - minCount) / (maxCount - minCount);
    if (ratio > 0.8) return 5;
    if (ratio > 0.6) return 4;
    if (ratio > 0.4) return 3;
    if (ratio > 0.2) return 2;
    return 1;
  };

  const getWeightStyle = (weight: number) => {
    const styles = {
      1: 'text-xs px-2 py-1',
      2: 'text-sm px-2.5 py-1',
      3: 'text-base px-3 py-1.5 font-medium',
      4: 'text-lg px-3.5 py-1.5 font-semibold',
      5: 'text-xl px-4 py-2 font-bold'
    };
    return styles[weight as keyof typeof styles];
  };

  const getWeightColor = (weight: number) => {
    const colors = {
      1: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700',
      2: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50',
      3: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50',
      4: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/50',
      5: 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 shadow-lg'
    };
    return colors[weight as keyof typeof colors];
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tags className="h-5 w-5" />
          {title}
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          {subtitle}
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {tags.slice(0, maxTags).map((tag: Tag) => {
            const weight = getWeight(tag.count);
            return (
              <button
                key={tag.slug}
                onClick={() => handleTagClick(tag.slug)}
                className={\`\${getWeightStyle(weight)} \${getWeightColor(weight)} rounded-full transition-all hover:scale-110\`}
              >
                {tag.name}
                {weight >= 4 && (
                  <span className="ml-1 text-xs opacity-75">
                    ({tag.count})
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t dark:border-gray-700">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span>Size indicates popularity:</span>
            <div className="flex items-center gap-1">
              <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Less</span>
              <span>→</span>
              <span className="px-2 py-0.5 bg-purple-600 text-white rounded text-xs font-bold">More</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeightedTagWidget;
    `
  };

  return variants[variant] || variants.cloud;
};
