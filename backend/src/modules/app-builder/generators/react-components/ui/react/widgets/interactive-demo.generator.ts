import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateInteractiveDemo = (
  resolved: ResolvedComponent,
  variant: 'sandbox' | 'guided' | 'video' = 'sandbox'
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
    return `/${dataSource || 'data'}`;
  };

  const apiRoute = getApiRoute();

  const commonImports = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Play, RotateCcw, Rocket, Eye, ChevronRight, ChevronLeft, X, Check, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';`;

  const variants = {
    sandbox: `
${commonImports}

interface DemoProps {
  ${dataName}?: any;
  className?: string;
  onReset?: () => void;
  onSignUp?: () => void;
  onAction?: (action: string, data?: any) => void;
}

const InteractiveDemo: React.FC<DemoProps> = ({
  ${dataName}: propData,
  className,
  onReset,
  onSignUp,
  onAction
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const demoData = ${dataName} || {};

  const demoTitle = ${getField('demoTitle')};
  const demoDescription = ${getField('demoDescription')};
  const sampleData = ${getField('sampleData')};
  const resetDemoText = ${getField('resetDemoText')};
  const signUpText = ${getField('signUpText')};
  const tryActionText = ${getField('tryActionText')};
  const liveDemoText = ${getField('liveDemoText')};
  const sandboxModeText = ${getField('sandboxModeText')};

  const [isDemoActive, setIsDemoActive] = useState(true);
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [dataState, setDataState] = useState(sampleData);

  const handleReset = () => {
    setDataState(sampleData);
    setActionLog([]);
    onReset?.();
  };

  const handleSignUp = () => {
    onSignUp?.();
  };

  const logAction = (action: string) => {
    setActionLog([...actionLog, \`\${new Date().toLocaleTimeString()}: \${action}\`]);
    onAction?.(action);
  };

  const handleAddUser = () => {
    const newUser = {
      id: dataState.users.length + 1,
      name: \`User \${dataState.users.length + 1}\`,
      email: \`user\${dataState.users.length + 1}@example.com\`,
      role: 'User'
    };
    setDataState({
      ...dataState,
      users: [...dataState.users, newUser]
    });
    logAction('Added new user');
  };

  const handleDeleteUser = (userId: number) => {
    setDataState({
      ...dataState,
      users: dataState.users.filter((u: any) => u.id !== userId)
    });
    logAction(\`Deleted user #\${userId}\`);
  };

  const handleUpdateStats = () => {
    setDataState({
      ...dataState,
      stats: {
        ...dataState.stats,
        activeUsers: dataState.stats.activeUsers + 10,
        revenue: dataState.stats.revenue + 1000
      }
    });
    logAction('Updated statistics');
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4", className)}>
      <div className="max-w-7xl mx-auto">
        {/* Demo Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-6 h-6" />
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                  {sandboxModeText}
                </span>
              </div>
              <h1 className="text-3xl font-bold mb-2">{demoTitle}</h1>
              <p className="text-blue-100">{demoDescription}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                {resetDemoText}
              </button>
              <button
                onClick={handleSignUp}
                className="flex items-center gap-2 px-6 py-2 bg-white text-blue-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                <Rocket className="w-4 h-4" />
                {signUpText}
              </button>
            </div>
          </div>
        </div>

        {/* Demo Content */}
        <div className="bg-white dark:bg-gray-800 rounded-b-2xl shadow-xl p-6">
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {/* Stats Cards */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Total Users</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{dataState.stats.totalUsers.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Active Users</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{dataState.stats.activeUsers.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Revenue</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">$\{dataState.stats.revenue.toLocaleString()}</p>
            </div>
          </div>

          {/* Interactive Actions */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">{tryActionText}</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleAddUser}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Add New User
              </button>
              <button
                onClick={handleUpdateStats}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Update Stats
              </button>
              <button
                onClick={() => logAction('Exported data')}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Export Data
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Users</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Role</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dataState.users.map((user: any) => (
                    <tr key={user.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
                      <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{user.name}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs">
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Log */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Activity Log</h3>
            <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4 max-h-48 overflow-y-auto">
              {actionLog.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No actions yet. Try interacting with the demo!</p>
              ) : (
                <div className="space-y-2">
                  {actionLog.map((log, index) => (
                    <div key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveDemo;
    `,

    guided: `
${commonImports}

interface TourStep {
  target: string;
  title: string;
  content: string;
}

interface DemoProps {
  ${dataName}?: any;
  className?: string;
  onComplete?: () => void;
  onSignUp?: () => void;
}

const InteractiveDemo: React.FC<DemoProps> = ({
  ${dataName}: propData,
  className,
  onComplete,
  onSignUp
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const demoData = ${dataName} || {};

  const demoTitle = ${getField('demoTitle')};
  const demoDescription = ${getField('demoDescription')};
  const tourSteps = ${getField('tourSteps')} as TourStep[];
  const guidedTourText = ${getField('guidedTourText')};
  const skipTourText = ${getField('skipTourText')};
  const nextStepText = ${getField('nextStepText')};
  const previousStepText = ${getField('previousStepText')};
  const finishTourText = ${getField('finishTourText')};
  const signUpText = ${getField('signUpText')};

  const [currentStep, setCurrentStep] = useState(0);
  const [isTourActive, setIsTourActive] = useState(true);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsTourActive(false);
      onComplete?.();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setIsTourActive(false);
    onComplete?.();
  };

  const handleSignUp = () => {
    onSignUp?.();
  };

  const currentTourStep = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4", className)}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {demoTitle}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            {demoDescription}
          </p>

          {isTourActive && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
              <Eye className="w-4 h-4" />
              <span className="text-sm font-medium">{guidedTourText}</span>
            </div>
          )}
        </div>

        {/* Demo Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-6">
          <div id="dashboard" className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Dashboard</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Metric A</h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">1,234</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
                <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Metric B</h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">5,678</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
                <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">Metric C</h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">9,012</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <button
              id="create-button"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Create New Item
            </button>
          </div>

          <div id="data-table">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Sample Data</h3>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-750">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-200 dark:border-gray-700">
                    <td className="py-3 px-4 text-gray-900 dark:text-gray-100">Item 1</td>
                    <td className="py-3 px-4"><span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs">Active</span></td>
                    <td className="py-3 px-4 text-gray-900 dark:text-gray-100">$100</td>
                  </tr>
                  <tr className="border-t border-gray-200 dark:border-gray-700">
                    <td className="py-3 px-4 text-gray-900 dark:text-gray-100">Item 2</td>
                    <td className="py-3 px-4"><span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs">Pending</span></td>
                    <td className="py-3 px-4 text-gray-900 dark:text-gray-100">$200</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Tour Overlay */}
        {isTourActive && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40" />
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 rounded-t-2xl shadow-2xl border-t-4 border-blue-500 p-6">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                        {currentStep + 1}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {currentTourStep.title}
                      </h3>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 ml-13">
                      {currentTourStep.content}
                    </p>
                  </div>
                  <button
                    onClick={handleSkip}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  {tourSteps.map((_, index) => (
                    <div
                      key={index}
                      className={cn(
                        "h-2 rounded-full transition-all",
                        index === currentStep ? "w-8 bg-blue-600" : "w-2 bg-gray-300 dark:bg-gray-600"
                      )}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={handleSkip}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    {skipTourText}
                  </button>

                  <div className="flex items-center gap-3">
                    {currentStep > 0 && (
                      <button
                        onClick={handlePrevious}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        {previousStepText}
                      </button>
                    )}
                    <button
                      onClick={handleNext}
                      className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                    >
                      {isLastStep ? finishTourText : nextStepText}
                      {!isLastStep && <ChevronRight className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Sign Up CTA */}
        {!isTourActive && (
          <div className="text-center">
            <button
              onClick={handleSignUp}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg text-lg font-medium transition-all shadow-lg hover:shadow-xl"
            >
              {signUpText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveDemo;
    `,

    video: `
${commonImports}

interface DemoProps {
  ${dataName}?: any;
  className?: string;
  onSignUp?: () => void;
}

const InteractiveDemo: React.FC<DemoProps> = ({
  ${dataName}: propData,
  className,
  onSignUp
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const demoData = ${dataName} || {};

  const demoTitle = ${getField('demoTitle')};
  const demoDescription = ${getField('demoDescription')};
  const signUpText = ${getField('signUpText')};
  const tryActionText = ${getField('tryActionText')};

  const [isPlaying, setIsPlaying] = useState(false);

  const handleSignUp = () => {
    onSignUp?.();
  };

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4", className)}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            {demoTitle}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {demoDescription}
          </p>
        </div>

        {/* Video Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="relative aspect-video bg-black">
            {!isPlaying ? (
              <div
                onClick={() => setIsPlaying(true)}
                className="absolute inset-0 flex items-center justify-center cursor-pointer group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/80 to-purple-600/80" />
                <div className="relative z-10">
                  <div className="w-24 h-24 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-12 h-12 text-blue-600 ml-1" fill="currentColor" />
                  </div>
                  <p className="text-white text-center mt-4 font-medium">Watch Demo Video</p>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                <p>Video Player Placeholder</p>
              </div>
            )}
          </div>

          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              See FluxEZ in Action
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Watch how easy it is to build powerful backends with our platform. This 5-minute demo covers all the essential features.
            </p>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Quick Setup</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Get started in minutes</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">No Code Required</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Build without coding</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Production Ready</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Deploy instantly</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleSignUp}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg text-lg font-medium transition-all"
            >
              {signUpText}
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              title: 'Real-time Database',
              description: 'Automatic schema generation and real-time synchronization',
              icon: '🗄️'
            },
            {
              title: 'Instant APIs',
              description: 'RESTful and GraphQL APIs generated automatically',
              icon: '⚡'
            },
            {
              title: 'Built-in Auth',
              description: 'Authentication and authorization out of the box',
              icon: '🔐'
            },
            {
              title: 'Analytics Dashboard',
              description: 'Monitor your app with real-time analytics',
              icon: '📊'
            }
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InteractiveDemo;
    `
  };

  return variants[variant] || variants.sandbox;
};
