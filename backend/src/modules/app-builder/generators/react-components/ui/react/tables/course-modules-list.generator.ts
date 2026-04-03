import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateCourseModulesList = (
  resolved: ResolvedComponent,
  variant: 'accordion' | 'numbered' | 'cards' | 'minimal' = 'accordion'
) => {
  const dataSource = resolved.dataSource;

  // Get the resolved field names from the field resolver service
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
    return `/${dataSource || 'data'}`;
  };

  const apiRoute = getApiRoute();

  const commonImports = `
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { BookOpen, ChevronDown, ChevronRight, PlayCircle, FileText, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';`;

  const variants = {
    accordion: `
${commonImports}

interface CourseModulesListProps {
  data?: any;
  className?: string;
  [key: string]: any;
}

export default function CourseModulesList({ data, className }: CourseModulesListProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  // Fetch data using React Query
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['modules', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !data, // Only fetch if prop not provided
  });

  const sourceData = data || fetchedData;

  if (isLoading && !data) {
    return (
      <div className={cn("flex items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-lg", className)}>
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className={cn("flex items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-lg", className)}>
        <p className="text-red-500">Failed to load modules</p>
      </div>
    );
  }

  // Extract modules array from various possible data structures
  const modules = Array.isArray(sourceData) ? sourceData : (sourceData?.data || sourceData?.modules || sourceData?.items || []);

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  const handleModuleClick = (module: any) => {
    console.log('Module clicked:', module);
  };

  if (!modules || modules.length === 0) {
    return (
      <div className={cn("bg-white dark:bg-gray-800 rounded-lg p-8 text-center", className)}>
        <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500 dark:text-gray-400">No modules available for this course yet.</p>
      </div>
    );
  }

  return (
    <div className={cn("bg-white dark:bg-gray-800 rounded-lg shadow-sm", className)}>
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Course Content</h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {modules.length} {modules.length === 1 ? 'module' : 'modules'}
        </p>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {modules
          .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
          .map((module: any, index: number) => {
            const isExpanded = expandedModules.has(module.id);
            const lessons = module.lessons || [];

            return (
              <div key={module.id} className="overflow-hidden">
                <button
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  onClick={() => toggleModule(module.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center font-medium">
                      {index + 1}
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {module.title}
                      </h3>
                      {module.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                          {module.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {lessons.length > 0 && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'}
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {isExpanded && lessons.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-2">
                    {lessons.map((lesson: any, lessonIndex: number) => (
                      <div
                        key={lesson.id}
                        className="flex items-center gap-3 py-3 px-4 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors"
                        onClick={() => handleModuleClick(lesson)}
                      >
                        {lesson.type === 'video' ? (
                          <PlayCircle className="w-5 h-5 text-gray-400" />
                        ) : (
                          <FileText className="w-5 h-5 text-gray-400" />
                        )}
                        <span className="flex-1 text-gray-700 dark:text-gray-300">
                          {lesson.title}
                        </span>
                        {lesson.duration_minutes && (
                          <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {lesson.duration_minutes} min
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
    `,

    numbered: `
${commonImports}

interface CourseModulesListProps {
  data?: any;
  className?: string;
  [key: string]: any;
}

export default function CourseModulesList({ data, className }: CourseModulesListProps) {
  // Fetch data using React Query
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['modules', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !data, // Only fetch if prop not provided
  });

  const sourceData = data || fetchedData;

  // Extract modules array from various possible data structures
  const modules = Array.isArray(sourceData) ? sourceData : (sourceData?.data || sourceData?.modules || sourceData?.items || []);

  const handleModuleClick = (module: any) => {
    console.log('Module clicked:', module);
  };

  if (isLoading && !data) {
    return (
      <div className={cn("flex items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-lg", className)}>
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className={cn("flex items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-lg", className)}>
        <p className="text-red-500">Failed to load modules</p>
      </div>
    );
  }

  if (!modules || modules.length === 0) {
    return (
      <div className={cn("bg-white dark:bg-gray-800 rounded-lg p-8 text-center", className)}>
        <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500 dark:text-gray-400">No modules available for this course yet.</p>
      </div>
    );
  }

  return (
    <div className={cn("bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6", className)}>
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Course Curriculum</h2>
      </div>

      <div className="space-y-4">
        {modules
          .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
          .map((module: any, index: number) => (
            <div
              key={module.id}
              className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all cursor-pointer"
              onClick={() => handleModuleClick(module)}
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold text-lg">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                  {module.title}
                </h3>
                {module.description && (
                  <p className="text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                    {module.description}
                  </p>
                )}
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-2" />
            </div>
          ))}
      </div>
    </div>
  );
}
    `,

    cards: `
${commonImports}

interface CourseModulesListProps {
  data?: any;
  className?: string;
  [key: string]: any;
}

export default function CourseModulesList({ data, className }: CourseModulesListProps) {
  // Fetch data using React Query
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['modules', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !data, // Only fetch if prop not provided
  });

  const sourceData = data || fetchedData;

  // Extract modules array from various possible data structures
  const modules = Array.isArray(sourceData) ? sourceData : (sourceData?.data || sourceData?.modules || sourceData?.items || []);

  const handleModuleClick = (module: any) => {
    console.log('Module clicked:', module);
  };

  if (isLoading && !data) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <p className="text-red-500">Failed to load modules</p>
      </div>
    );
  }

  if (!modules || modules.length === 0) {
    return (
      <div className={cn("bg-white dark:bg-gray-800 rounded-lg p-8 text-center", className)}>
        <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500 dark:text-gray-400">No modules available for this course yet.</p>
      </div>
    );
  }

  return (
    <div className={cn("", className)}>
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Course Modules</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules
          .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
          .map((module: any, index: number) => (
            <div
              key={module.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleModuleClick(module)}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Module {index + 1}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {module.title}
              </h3>
              {module.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                  {module.description}
                </p>
              )}
              {module.lessons && module.lessons.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {module.lessons.length} {module.lessons.length === 1 ? 'lesson' : 'lessons'}
                  </span>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
    `,

    minimal: `
${commonImports}

interface CourseModulesListProps {
  data?: any;
  className?: string;
  [key: string]: any;
}

export default function CourseModulesList({ data, className }: CourseModulesListProps) {
  // Fetch data using React Query
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['modules', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !data, // Only fetch if prop not provided
  });

  const sourceData = data || fetchedData;

  // Extract modules array from various possible data structures
  const modules = Array.isArray(sourceData) ? sourceData : (sourceData?.data || sourceData?.modules || sourceData?.items || []);

  const handleModuleClick = (module: any) => {
    console.log('Module clicked:', module);
  };

  if (isLoading && !data) {
    return (
      <div className={cn("flex items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm", className)}>
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className={cn("flex items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm", className)}>
        <p className="text-red-500">Failed to load modules</p>
      </div>
    );
  }

  if (!modules || modules.length === 0) {
    return (
      <div className={cn("p-6 text-center", className)}>
        <p className="text-gray-500 dark:text-gray-400">No modules available.</p>
      </div>
    );
  }

  return (
    <div className={cn("bg-white dark:bg-gray-800 rounded-lg shadow-sm", className)}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="font-semibold text-gray-900 dark:text-white">Course Content</h2>
      </div>
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {modules
          .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
          .map((module: any, index: number) => (
            <li
              key={module.id}
              className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
              onClick={() => handleModuleClick(module)}
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-6">
                  {index + 1}.
                </span>
                <span className="text-gray-900 dark:text-white flex-1">
                  {module.title}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
}
    `
  };

  return variants[variant] || variants.accordion;
};
