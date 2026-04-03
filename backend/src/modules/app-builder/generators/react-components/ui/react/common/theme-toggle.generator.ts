import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateThemeToggle = (
  resolved: ResolvedComponent,
  variant: 'toggle' | 'buttons' | 'auto' = 'toggle'
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
import React, { useState, useEffect } from 'react';
import { Sun, Moon, Monitor, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';`;

  const variants = {
    toggle: `
${commonImports}

type Theme = 'light' | 'dark';

interface ThemeToggleProps {
  ${dataName}?: any;
  className?: string;
  onThemeChange?: (theme: Theme) => void;
}

const ThemeToggleComponent: React.FC<ThemeToggleProps> = ({
  ${dataName}: propData,
  className,
  onThemeChange
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}'],
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

  const themeData = ${dataName} || {};

  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const lightLabel = ${getField('lightLabel')};
  const darkLabel = ${getField('darkLabel')};
  const currentThemeValue = ${getField('currentTheme')};

  const [theme, setTheme] = useState<Theme>(currentThemeValue as Theme);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleThemeChange = (checked: boolean) => {
    setIsTransitioning(true);
    const newTheme: Theme = checked ? 'dark' : 'light';

    // Add transition class to document
    document.documentElement.classList.add('theme-transitioning');

    setTimeout(() => {
      setTheme(newTheme);
      if (onThemeChange) {
        onThemeChange(newTheme);
      }

      // Apply theme to document
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(newTheme);

      // Store preference
      localStorage.setItem('theme', newTheme);

      setTimeout(() => {
        document.documentElement.classList.remove('theme-transitioning');
        setIsTransitioning(false);
      }, 300);
    }, 150);
  };

  useEffect(() => {
    // Load theme from localStorage on mount
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.add(savedTheme);
    }
  }, []);

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 transition-colors duration-300", className)}>
      <style>{\`
        .theme-transitioning,
        .theme-transitioning *,
        .theme-transitioning *:before,
        .theme-transitioning *:after {
          transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease !important;
        }
      \`}</style>

      <Card className="w-full max-w-md dark:bg-gray-800 dark:border-gray-700 shadow-2xl border-2 border-gray-200 dark:border-gray-700 rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center shadow-lg",
              theme === 'light'
                ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                : "bg-gradient-to-r from-blue-600 to-purple-600"
            )}>
              {theme === 'light' ? (
                <Sun className="w-5 h-5 text-white" />
              ) : (
                <Moon className="w-5 h-5 text-white" />
              )}
            </div>
            <span className="bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent dark:from-white dark:to-blue-400 font-bold">{title}</span>
          </CardTitle>
          <CardDescription className="dark:text-gray-400">
            {subtitle}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 rounded-xl border-2 border-blue-200 dark:border-purple-700 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
                <Sun className="w-4 h-4 text-white" />
              </div>
              <Label htmlFor="theme-switch" className="text-sm font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent dark:from-yellow-400 dark:to-orange-400">
                {lightLabel}
              </Label>
            </div>

            <Switch
              id="theme-switch"
              checked={theme === 'dark'}
              onCheckedChange={handleThemeChange}
              disabled={isTransitioning}
              aria-label="Toggle theme"
              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-600 data-[state=checked]:to-purple-600"
            />

            <div className="flex items-center gap-3">
              <Label htmlFor="theme-switch" className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
                {darkLabel}
              </Label>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                <Moon className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className={cn(
              "p-4 rounded-xl border-2 transition-all duration-300 shadow-md hover:shadow-lg",
              theme === 'light'
                ? "border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20"
                : "border-gray-200 dark:border-gray-700 hover:border-yellow-300 dark:hover:border-yellow-700"
            )}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
                  <Sun className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent dark:from-yellow-400 dark:to-orange-400">{lightLabel} Mode</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {${getField('lightDescription')}}
                  </p>
                </div>
              </div>
            </div>

            <div className={cn(
              "p-4 rounded-xl border-2 transition-all duration-300 shadow-md hover:shadow-lg",
              theme === 'dark'
                ? "border-blue-400 dark:border-purple-500 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20"
                : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-purple-700"
            )}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                  <Moon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">{darkLabel} Mode</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {${getField('darkDescription')}}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThemeToggleComponent;
    `,

    buttons: `
${commonImports}

type Theme = 'light' | 'dark';

interface ThemeToggleProps {
  ${dataName}?: any;
  className?: string;
  onThemeChange?: (theme: Theme) => void;
}

const ThemeToggleComponent: React.FC<ThemeToggleProps> = ({
  ${dataName}: propData,
  className,
  onThemeChange
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}'],
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

  const themeData = ${dataName} || {};

  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const lightLabel = ${getField('lightLabel')};
  const darkLabel = ${getField('darkLabel')};
  const currentThemeValue = ${getField('currentTheme')};

  const [theme, setTheme] = useState<Theme>(currentThemeValue as Theme);

  const handleThemeChange = (newTheme: Theme) => {
    document.documentElement.classList.add('theme-transitioning');

    setTimeout(() => {
      setTheme(newTheme);
      if (onThemeChange) {
        onThemeChange(newTheme);
      }

      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(newTheme);
      localStorage.setItem('theme', newTheme);

      setTimeout(() => {
        document.documentElement.classList.remove('theme-transitioning');
      }, 300);
    }, 150);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.add(savedTheme);
    }
  }, []);

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 transition-colors duration-300", className)}>
      <style>{\`
        .theme-transitioning,
        .theme-transitioning *,
        .theme-transitioning *:before,
        .theme-transitioning *:after {
          transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease !important;
        }
      \`}</style>

      <Card className="w-full max-w-md dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">{title}</CardTitle>
          <CardDescription className="dark:text-gray-400">
            {subtitle}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleThemeChange('light')}
              className={cn(
                "h-auto flex-col gap-3 py-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-xl",
                theme === 'light'
                  ? "bg-gradient-to-r from-yellow-400 to-orange-500 border-transparent text-white"
                  : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-yellow-400"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center mx-auto",
                theme === 'light' ? "bg-white/20" : "bg-gradient-to-r from-yellow-400 to-orange-500"
              )}>
                <Sun className={cn("w-8 h-8", theme === 'light' ? "text-white" : "text-white")} />
              </div>
              <span className="text-sm font-bold">{lightLabel}</span>
            </button>

            <button
              onClick={() => handleThemeChange('dark')}
              className={cn(
                "h-auto flex-col gap-3 py-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-xl",
                theme === 'dark'
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 border-transparent text-white"
                  : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-400 dark:hover:border-purple-500"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center mx-auto",
                theme === 'dark' ? "bg-white/20" : "bg-gradient-to-r from-blue-600 to-purple-600"
              )}>
                <Moon className={cn("w-8 h-8", theme === 'dark' ? "text-white" : "text-white")} />
              </div>
              <span className="text-sm font-bold">{darkLabel}</span>
            </button>
          </div>

          <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <h3 className="text-sm font-medium mb-2 dark:text-white">Preview</h3>
            <div className="space-y-2">
              <div className="h-8 bg-white dark:bg-gray-800 rounded border dark:border-gray-600"></div>
              <div className="h-8 bg-white dark:bg-gray-800 rounded border dark:border-gray-600"></div>
              <div className="h-8 bg-white dark:bg-gray-800 rounded border dark:border-gray-600"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThemeToggleComponent;
    `,

    auto: `
${commonImports}

type Theme = 'light' | 'dark' | 'system';

interface ThemeToggleProps {
  ${dataName}?: any;
  className?: string;
  onThemeChange?: (theme: Theme) => void;
}

const ThemeToggleComponent: React.FC<ThemeToggleProps> = ({
  ${dataName}: propData,
  className,
  onThemeChange
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}'],
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

  const themeData = ${dataName} || {};

  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const lightLabel = ${getField('lightLabel')};
  const darkLabel = ${getField('darkLabel')};
  const systemLabel = ${getField('systemLabel')};
  const currentThemeValue = ${getField('currentTheme')};

  const [theme, setTheme] = useState<Theme>(currentThemeValue as Theme);
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');

  const getEffectiveTheme = (): 'light' | 'dark' => {
    return theme === 'system' ? systemTheme : theme as 'light' | 'dark';
  };

  const handleThemeChange = (newTheme: Theme) => {
    document.documentElement.classList.add('theme-transitioning');

    setTimeout(() => {
      setTheme(newTheme);
      if (onThemeChange) {
        onThemeChange(newTheme);
      }

      const effectiveTheme = newTheme === 'system' ? systemTheme : newTheme;
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(effectiveTheme);
      localStorage.setItem('theme', newTheme);

      setTimeout(() => {
        document.documentElement.classList.remove('theme-transitioning');
      }, 300);
    }, 150);
  };

  useEffect(() => {
    // Check system theme preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
      if (theme === 'system') {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);

    // Load saved theme
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      const effectiveTheme = savedTheme === 'system' ? systemTheme : savedTheme;
      document.documentElement.classList.add(effectiveTheme);
    }

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (theme === 'system') {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(systemTheme);
    }
  }, [systemTheme, theme]);

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 transition-colors duration-300", className)}>
      <style>{\`
        .theme-transitioning,
        .theme-transitioning *,
        .theme-transitioning *:before,
        .theme-transitioning *:after {
          transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease !important;
        }
      \`}</style>

      <Card className="w-full max-w-md dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">{title}</CardTitle>
          <CardDescription className="dark:text-gray-400">
            {subtitle}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleThemeChange('light')}
              className={cn(
                "h-auto flex-col gap-2 py-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg",
                theme === 'light'
                  ? "bg-gradient-to-r from-yellow-400 to-orange-500 border-transparent text-white"
                  : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-yellow-400"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center mx-auto",
                theme === 'light' ? "bg-white/20" : "bg-gradient-to-r from-yellow-400 to-orange-500"
              )}>
                <Sun className={cn("w-6 h-6", theme === 'light' ? "text-white" : "text-white")} />
              </div>
              <span className="text-xs font-bold">{lightLabel}</span>
            </button>

            <button
              onClick={() => handleThemeChange('dark')}
              className={cn(
                "h-auto flex-col gap-2 py-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg",
                theme === 'dark'
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 border-transparent text-white"
                  : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-400 dark:hover:border-purple-500"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center mx-auto",
                theme === 'dark' ? "bg-white/20" : "bg-gradient-to-r from-blue-600 to-purple-600"
              )}>
                <Moon className={cn("w-6 h-6", theme === 'dark' ? "text-white" : "text-white")} />
              </div>
              <span className="text-xs font-bold">{darkLabel}</span>
            </button>

            <button
              onClick={() => handleThemeChange('system')}
              className={cn(
                "h-auto flex-col gap-2 py-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg",
                theme === 'system'
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 border-transparent text-white"
                  : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-green-400"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center mx-auto",
                theme === 'system' ? "bg-white/20" : "bg-gradient-to-r from-green-500 to-emerald-500"
              )}>
                <Monitor className={cn("w-6 h-6", theme === 'system' ? "text-white" : "text-white")} />
              </div>
              <span className="text-xs font-bold">{systemLabel}</span>
            </button>
          </div>

          <div className="space-y-3 mt-6">
            <div className={cn(
              "p-4 rounded-lg border-2",
              theme === 'light' && "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            )}>
              <div className="flex items-start gap-3">
                <Sun className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <h3 className="font-medium text-sm dark:text-white">{lightLabel} Mode</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {${getField('lightDescription')}}
                  </p>
                </div>
              </div>
            </div>

            <div className={cn(
              "p-4 rounded-lg border-2",
              theme === 'dark' && "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            )}>
              <div className="flex items-start gap-3">
                <Moon className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <h3 className="font-medium text-sm dark:text-white">{darkLabel} Mode</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {${getField('darkDescription')}}
                  </p>
                </div>
              </div>
            </div>

            <div className={cn(
              "p-4 rounded-lg border-2",
              theme === 'system' && "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            )}>
              <div className="flex items-start gap-3">
                <Monitor className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                <div>
                  <h3 className="font-medium text-sm dark:text-white">{systemLabel} Default</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {${getField('systemDescription')}}
                  </p>
                  {theme === 'system' && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Currently using: {systemTheme === 'dark' ? darkLabel : lightLabel}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThemeToggleComponent;
    `
  };

  return variants[variant] || variants.toggle;
};
