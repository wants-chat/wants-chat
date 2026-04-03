import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateCookieConsentDetailed = (
  resolved: ResolvedComponent,
  variant: 'modal' | 'panel' | 'preferences' = 'modal'
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
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';`;

  const variants = {
    modal: `
${commonImports}
import { Cookie, Info, Check } from 'lucide-react';

interface CookieCategory {
  id: string;
  name: string;
  description: string;
  required: boolean;
  enabled: boolean;
}

interface ModalDetailedConsentProps {
  ${dataName}?: any;
  className?: string;
  onAcceptAll?: (preferences: Record<string, boolean>) => void;
  onAcceptSelected?: (preferences: Record<string, boolean>) => void;
  onRejectAll?: () => void;
}

const ModalDetailedCookieConsent: React.FC<ModalDetailedConsentProps> = ({
  ${dataName}: propData,
  className,
  onAcceptAll,
  onAcceptSelected,
  onRejectAll
}) => {
  const [isVisible, setIsVisible] = useState(false);

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

  const cookieData = ${dataName} || {};

  const title = ${getField('modalTitle')};
  const description = ${getField('modalDescription')};
  const categories: CookieCategory[] = ${getField('categories')};
  const acceptAllText = ${getField('acceptAllText')};
  const acceptSelectedText = ${getField('acceptSelectedText')};
  const rejectAllText = ${getField('rejectAllText')};
  const privacyPolicyUrl = ${getField('privacyPolicyUrl')};
  const privacyPolicyText = ${getField('privacyPolicyText')};
  const cookiePolicyUrl = ${getField('cookiePolicyUrl')};
  const cookiePolicyText = ${getField('cookiePolicyText')};

  const [preferences, setPreferences] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    categories.forEach(cat => {
      initial[cat.id] = cat.enabled;
    });
    return initial;
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent-detailed');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleToggle = (categoryId: string) => {
    setPreferences(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleAcceptAll = () => {
    const allAccepted: Record<string, boolean> = {};
    categories.forEach(cat => {
      allAccepted[cat.id] = true;
    });
    localStorage.setItem('cookie-consent-detailed', JSON.stringify(allAccepted));
    setIsVisible(false);
    if (onAcceptAll) {
      onAcceptAll(allAccepted);
    } else {
      console.log('All cookies accepted', allAccepted);
    }
  };

  const handleAcceptSelected = () => {
    localStorage.setItem('cookie-consent-detailed', JSON.stringify(preferences));
    setIsVisible(false);
    if (onAcceptSelected) {
      onAcceptSelected(preferences);
    } else {
      console.log('Selected cookies accepted', preferences);
    }
  };

  const handleRejectAll = () => {
    const onlyNecessary: Record<string, boolean> = {};
    categories.forEach(cat => {
      onlyNecessary[cat.id] = cat.required;
    });
    localStorage.setItem('cookie-consent-detailed', JSON.stringify(onlyNecessary));
    setIsVisible(false);
    if (onRejectAll) {
      onRejectAll();
    } else {
      console.log('All non-essential cookies rejected', onlyNecessary);
    }
  };

  if (!isVisible) return null;

  return (
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm", className)}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <Cookie className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {title}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {description}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="border dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {category.name}
                    </h3>
                    {category.required && (
                      <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-medium rounded">
                        Required
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {category.description}
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences[category.id]}
                    onChange={() => !category.required && handleToggle(category.id)}
                    disabled={category.required}
                    className="sr-only peer"
                  />
                  <div className={\`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 \${category.required ? 'opacity-50 cursor-not-allowed' : ''}\`} />
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between mb-4 text-xs">
            <a
              href={privacyPolicyUrl}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {privacyPolicyText}
            </a>
            <span className="text-gray-400">•</span>
            <a
              href={cookiePolicyUrl}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {cookiePolicyText}
            </a>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleRejectAll}
              className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm"
            >
              {rejectAllText}
            </button>
            <button
              onClick={handleAcceptSelected}
              className="flex-1 px-4 py-2.5 bg-gray-700 dark:bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors text-sm"
            >
              {acceptSelectedText}
            </button>
            <button
              onClick={handleAcceptAll}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              {acceptAllText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalDetailedCookieConsent;
    `,

    panel: `
${commonImports}
import { Cookie, ChevronDown, ChevronUp } from 'lucide-react';

interface CookieCategory {
  id: string;
  name: string;
  description: string;
  required: boolean;
  enabled: boolean;
}

interface PanelDetailedConsentProps {
  ${dataName}?: any;
  className?: string;
  onSave?: (preferences: Record<string, boolean>) => void;
}

const PanelDetailedCookieConsent: React.FC<PanelDetailedConsentProps> = ({
  ${dataName}: propData,
  className,
  onSave
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

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

  const cookieData = ${dataName} || {};

  const title = ${getField('panelTitle')};
  const description = ${getField('panelDescription')};
  const categories: CookieCategory[] = ${getField('categories')};
  const acceptAllText = ${getField('acceptAllText')};
  const savePreferencesText = ${getField('savePreferencesText')};
  const rejectAllText = ${getField('rejectAllText')};

  const [preferences, setPreferences] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    categories.forEach(cat => {
      initial[cat.id] = cat.enabled;
    });
    return initial;
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent-detailed');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleToggle = (categoryId: string) => {
    setPreferences(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleAcceptAll = () => {
    const allAccepted: Record<string, boolean> = {};
    categories.forEach(cat => {
      allAccepted[cat.id] = true;
    });
    setPreferences(allAccepted);
    localStorage.setItem('cookie-consent-detailed', JSON.stringify(allAccepted));
    setIsVisible(false);
    if (onSave) {
      onSave(allAccepted);
    }
  };

  const handleRejectAll = () => {
    const onlyNecessary: Record<string, boolean> = {};
    categories.forEach(cat => {
      onlyNecessary[cat.id] = cat.required;
    });
    setPreferences(onlyNecessary);
    localStorage.setItem('cookie-consent-detailed', JSON.stringify(onlyNecessary));
    setIsVisible(false);
    if (onSave) {
      onSave(onlyNecessary);
    }
  };

  const handleSave = () => {
    localStorage.setItem('cookie-consent-detailed', JSON.stringify(preferences));
    setIsVisible(false);
    if (onSave) {
      onSave(preferences);
    }
  };

  if (!isVisible) return null;

  return (
    <div className={cn("fixed bottom-0 right-0 z-50 m-4 max-w-md w-full shadow-2xl rounded-lg overflow-hidden animate-in slide-in-from-bottom-right duration-500", className)}>
      <div className="bg-white dark:bg-gray-900 border dark:border-gray-700">
        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex items-start gap-3 mb-3">
            <Cookie className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                {title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {description}
              </p>
            </div>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {categories.map((category) => (
            <div key={category.id} className="border-b dark:border-gray-700 last:border-0">
              <div
                onClick={() => toggleCategory(category.id)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences[category.id]}
                      onChange={(e) => {
                        e.stopPropagation();
                        !category.required && handleToggle(category.id);
                      }}
                      disabled={category.required}
                      className="sr-only peer"
                    />
                    <div className={\`w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 \${category.required ? 'opacity-50' : ''}\`} />
                  </label>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {category.name}
                  </span>
                </div>
                {expandedCategories.includes(category.id) ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>

              {expandedCategories.includes(category.id) && (
                <div className="px-4 pb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {category.description}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 space-y-2">
          <button
            onClick={handleAcceptAll}
            className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            {acceptAllText}
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleRejectAll}
              className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm"
            >
              {rejectAllText}
            </button>
            <button
              onClick={handleSave}
              className="flex-1 bg-gray-700 dark:bg-gray-600 text-white font-medium py-2.5 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors text-sm"
            >
              {savePreferencesText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanelDetailedCookieConsent;
    `,

    preferences: `
${commonImports}
import { Cookie, Settings } from 'lucide-react';

interface CookieCategory {
  id: string;
  name: string;
  description: string;
  required: boolean;
  enabled: boolean;
}

interface PreferencesDetailedConsentProps {
  ${dataName}?: any;
  className?: string;
  onSave?: (preferences: Record<string, boolean>) => void;
}

const PreferencesDetailedCookieConsent: React.FC<PreferencesDetailedConsentProps> = ({
  ${dataName}: propData,
  className,
  onSave
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

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

  const cookieData = ${dataName} || {};

  const title = ${getField('preferencesTitle')};
  const description = ${getField('preferencesDescription')};
  const categories: CookieCategory[] = ${getField('categories')};
  const acceptAllText = ${getField('acceptAllText')};
  const managePreferencesText = ${getField('managePreferencesText')};
  const savePreferencesText = ${getField('savePreferencesText')};

  const [preferences, setPreferences] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    categories.forEach(cat => {
      initial[cat.id] = cat.enabled;
    });
    return initial;
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent-detailed');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleToggle = (categoryId: string) => {
    setPreferences(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleAcceptAll = () => {
    const allAccepted: Record<string, boolean> = {};
    categories.forEach(cat => {
      allAccepted[cat.id] = true;
    });
    localStorage.setItem('cookie-consent-detailed', JSON.stringify(allAccepted));
    setIsVisible(false);
    if (onSave) {
      onSave(allAccepted);
    }
  };

  const handleSave = () => {
    localStorage.setItem('cookie-consent-detailed', JSON.stringify(preferences));
    setIsVisible(false);
    if (onSave) {
      onSave(preferences);
    }
  };

  if (!isVisible) return null;

  return (
    <div className={cn("fixed bottom-0 left-0 right-0 z-50", className)}>
      {!showPreferences ? (
        <div className="bg-white dark:bg-gray-900 shadow-2xl border-t dark:border-gray-700 animate-in slide-in-from-bottom duration-500">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Cookie className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <p className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                {description}
              </p>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => setShowPreferences(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  {managePreferencesText}
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-6 py-2 text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                >
                  {acceptAllText}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 shadow-2xl border-t dark:border-gray-700 max-h-[80vh] overflow-hidden flex flex-col">
          <div className="p-6 border-b dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {title}
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="border dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {category.name}
                  </h4>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences[category.id]}
                      onChange={() => !category.required && handleToggle(category.id)}
                      disabled={category.required}
                      className="sr-only peer"
                    />
                    <div className={\`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 \${category.required ? 'opacity-50' : ''}\`} />
                  </label>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {category.description}
                </p>
              </div>
            ))}
          </div>

          <div className="p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="max-w-7xl mx-auto flex justify-end gap-3">
              <button
                onClick={() => setShowPreferences(false)}
                className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                {savePreferencesText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreferencesDetailedCookieConsent;
    `
  };

  return variants[variant] || variants.modal;
};
