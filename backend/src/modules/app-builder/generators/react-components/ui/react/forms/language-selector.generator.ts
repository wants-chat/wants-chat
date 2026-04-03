import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateLanguageSelector = (
  resolved: ResolvedComponent,
  variant: 'dropdown' | 'modal' | 'inline' = 'dropdown'
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
import { useQuery } from '@tanstack/react-query';
import { Globe, Check, ChevronDown, Search, X, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';`;

  const variants = {
    dropdown: `
${commonImports}

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  region: string;
}

interface LanguageSelectorProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onLanguageChange?: (language: Language) => void;
  onAutoDetectChange?: (enabled: boolean) => void;
}

const LanguageSelectorComponent: React.FC<LanguageSelectorProps> = ({
  ${dataName},
  className,
  onLanguageChange,
  onAutoDetectChange
}) => {
  // Fetch data using useQuery
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity],
    queryFn: () => api.get<any>(\`${apiRoute}\`),
    enabled: !propData,
  });

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const languageData = propData || fetchedData || {};

  const currentLanguageCode = ${getField('currentLanguage')};
  const languages = ${getField('languages')};
  const autoDetectLabel = ${getField('autoDetectLabel')};

  const [selectedLanguage, setSelectedLanguage] = useState<string>(currentLanguageCode);
  const [autoDetect, setAutoDetect] = useState(false);

  const currentLang = languages.find((lang: Language) => lang.code === selectedLanguage);

  const handleLanguageSelect = (language: Language) => {
    setSelectedLanguage(language.code);
    setAutoDetect(false);
    if (onLanguageChange) {
      onLanguageChange(language);
    }
    // Store in localStorage for persistence
    localStorage.setItem('selectedLanguage', language.code);
  };

  const handleAutoDetectToggle = (checked: boolean) => {
    setAutoDetect(checked);
    if (onAutoDetectChange) {
      onAutoDetectChange(checked);
    }
    localStorage.setItem('autoDetectLanguage', String(checked));
  };

  useEffect(() => {
    // Load from localStorage on mount
    const savedLanguage = localStorage.getItem('selectedLanguage');
    const savedAutoDetect = localStorage.getItem('autoDetectLanguage') === 'true';

    if (savedLanguage) {
      setSelectedLanguage(savedLanguage);
    }
    setAutoDetect(savedAutoDetect);
  }, []);

  return (
    <div className={cn("min-h-screen bg-gray-50 flex items-center justify-center p-4", className)}>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Language Settings
          </CardTitle>
          <CardDescription>
            Select your preferred language for the interface
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="language-dropdown">Current Language</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  id="language-dropdown"
                  variant="outline"
                  className="w-full justify-between"
                  aria-label="Select language"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{currentLang?.flag}</span>
                    <div className="text-left">
                      <div className="font-medium">{currentLang?.name}</div>
                      <div className="text-xs text-gray-500">{currentLang?.nativeName}</div>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[400px] max-h-[400px] overflow-y-auto">
                {languages.map((language: Language) => (
                  <DropdownMenuItem
                    key={language.code}
                    onClick={() => handleLanguageSelect(language)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{language.flag}</span>
                        <div>
                          <div className="font-medium">{language.name}</div>
                          <div className="text-xs text-gray-500">{language.nativeName}</div>
                        </div>
                      </div>
                      {selectedLanguage === language.code && (
                        <Check className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
            <Checkbox
              id="auto-detect"
              checked={autoDetect}
              onCheckedChange={handleAutoDetectToggle}
            />
            <Label
              htmlFor="auto-detect"
              className="text-sm font-normal cursor-pointer"
            >
              {autoDetectLabel}
            </Label>
          </div>

          {autoDetect && (
            <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p>Language will be automatically detected based on your browser settings.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LanguageSelectorComponent;
    `,

    modal: `
${commonImports}

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  region: string;
}

interface LanguageSelectorProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onLanguageChange?: (language: Language) => void;
}

const LanguageSelectorComponent: React.FC<LanguageSelectorProps> = ({
  ${dataName},
  className,
  onLanguageChange
}) => {
  // Fetch data using useQuery
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity],
    queryFn: () => api.get<any>(\`${apiRoute}\`),
    enabled: !propData,
  });

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const languageData = propData || fetchedData || {};

  const title = ${getField('title')};
  const currentLanguageCode = ${getField('currentLanguage')};
  const languages = ${getField('languages')};
  const searchPlaceholder = ${getField('searchPlaceholder')};
  const applyButton = ${getField('applyButton')};
  const cancelButton = ${getField('cancelButton')};

  const [selectedLanguage, setSelectedLanguage] = useState<string>(currentLanguageCode);
  const [tempSelection, setTempSelection] = useState<string>(currentLanguageCode);
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);

  const currentLang = languages.find((lang: Language) => lang.code === selectedLanguage);

  const filteredLanguages = languages.filter((lang: Language) =>
    lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group languages by region
  const groupedLanguages = filteredLanguages.reduce((acc: any, lang: Language) => {
    if (!acc[lang.region]) {
      acc[lang.region] = [];
    }
    acc[lang.region].push(lang);
    return acc;
  }, {});

  const handleApply = () => {
    setSelectedLanguage(tempSelection);
    const language = languages.find((lang: Language) => lang.code === tempSelection);
    if (language && onLanguageChange) {
      onLanguageChange(language);
    }
    localStorage.setItem('selectedLanguage', tempSelection);
    setOpen(false);
  };

  const handleCancel = () => {
    setTempSelection(selectedLanguage);
    setSearchQuery('');
    setOpen(false);
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 flex items-center justify-center p-4", className)}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2" size="lg">
            <Globe className="w-5 h-5" />
            <span className="text-xl">{currentLang?.flag}</span>
            <span>{currentLang?.name}</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              {title}
            </DialogTitle>
            <DialogDescription>
              Choose your preferred language from the list below
            </DialogDescription>
          </DialogHeader>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 py-4">
            {Object.entries(groupedLanguages).map(([region, langs]) => (
              <div key={region}>
                <h3 className="text-sm font-semibold text-gray-500 mb-2 px-2">{region}</h3>
                <div className="space-y-1">
                  {(langs as Language[]).map((language) => (
                    <button
                      key={language.code}
                      onClick={() => setTempSelection(language.code)}
                      className={cn(
                        "w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 transition-colors",
                        tempSelection === language.code && "bg-blue-50 border-2 border-blue-500"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{language.flag}</span>
                        <div className="text-left">
                          <div className="font-medium">{language.name}</div>
                          <div className="text-sm text-gray-500">{language.nativeName}</div>
                        </div>
                      </div>
                      {tempSelection === language.code && (
                        <Check className="w-5 h-5 text-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleCancel} className="flex-1">
              {cancelButton}
            </Button>
            <Button onClick={handleApply} className="flex-1 bg-blue-600 hover:bg-blue-700">
              {applyButton}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LanguageSelectorComponent;
    `,

    inline: `
${commonImports}

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  region: string;
}

interface LanguageSelectorProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onLanguageChange?: (language: Language) => void;
}

const LanguageSelectorComponent: React.FC<LanguageSelectorProps> = ({
  ${dataName},
  className,
  onLanguageChange
}) => {
  // Fetch data using useQuery
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity],
    queryFn: () => api.get<any>(\`${apiRoute}\`),
    enabled: !propData,
  });

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const languageData = propData || fetchedData || {};

  const title = ${getField('title')};
  const currentLanguageCode = ${getField('currentLanguage')};
  const languages = ${getField('languages')};
  const searchPlaceholder = ${getField('searchPlaceholder')};

  const [selectedLanguage, setSelectedLanguage] = useState<string>(currentLanguageCode);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLanguages = languages.filter((lang: Language) =>
    lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLanguageSelect = (language: Language) => {
    setSelectedLanguage(language.code);
    if (onLanguageChange) {
      onLanguageChange(language);
    }
    localStorage.setItem('selectedLanguage', language.code);
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 flex items-center justify-center p-4", className)}>
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            {title}
          </CardTitle>
          <CardDescription>
            Select your preferred language
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredLanguages.map((language: Language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageSelect(language)}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all hover:shadow-md",
                  selectedLanguage === language.code
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : "border-gray-200 hover:border-gray-300"
                )}
                aria-label={\`Select \${language.name}\`}
              >
                <span className="text-4xl" role="img" aria-label={language.name}>
                  {language.flag}
                </span>
                <div className="text-center">
                  <div className="font-medium text-sm">{language.name}</div>
                  <div className="text-xs text-gray-500">{language.nativeName}</div>
                </div>
                {selectedLanguage === language.code && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-blue-600 rounded-full p-1">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>

          {filteredLanguages.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No languages found matching "{searchQuery}"
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LanguageSelectorComponent;
    `
  };

  return variants[variant] || variants.dropdown;
};
