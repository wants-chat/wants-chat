import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateCodeEditor = (
  resolved: ResolvedComponent,
  variant: 'basic' | 'withSyntax' | 'advanced' = 'basic'
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
import React, { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button, Loader2 } from '@/components/ui/button';
import {
  Copy, Check, Code, Play, Trash2, Maximize, Settings,
  ChevronDown
} from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';`;

  const variants = {
    basic: `
${commonImports}

interface CodeEditorProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onChange?: (code: string) => void;
}

const CodeEditorComponent: React.FC<CodeEditorProps> = ({
  ${dataName},
  className,
  onChange
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

  const editorData = propData || fetchedData || {};

  const [code, setCode] = useState(${getField('initialCode')});
  const [copied, setCopied] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const placeholder = ${getField('placeholder')};
  const copyCodeLabel = ${getField('copyCodeLabel')};
  const copiedLabel = ${getField('copiedLabel')};

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setCode(newCode);
    if (onChange) {
      onChange(newCode);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newCode);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div className={cn("w-full max-w-4xl mx-auto", className)}>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Code Editor</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="flex items-center gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm">{copiedLabel}</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span className="text-sm">{copyCodeLabel}</span>
              </>
            )}
          </Button>
        </div>

        {/* Editor */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full h-[400px] p-4 font-mono text-sm bg-gray-900 text-gray-100 outline-none resize-none"
          spellCheck={false}
        />
      </div>
    </div>
  );
};

export default CodeEditorComponent;
    `,

    withSyntax: `
${commonImports}

interface CodeEditorProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onChange?: (code: string, language: string) => void;
}

const CodeEditorComponent: React.FC<CodeEditorProps> = ({
  ${dataName},
  className,
  onChange
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

  const editorData = propData || fetchedData || {};

  const [code, setCode] = useState(${getField('initialCode')});
  const [copied, setCopied] = useState(false);
  const [language, setLanguage] = useState(${getField('defaultLanguage')});
  const [showLineNumbers, setShowLineNumbers] = useState(${getField('showLineNumbers')});

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const languages = ${getField('languages')};
  const placeholder = ${getField('placeholder')};

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setCode(newCode);
    if (onChange) {
      onChange(newCode, language);
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    if (onChange) {
      onChange(code, newLanguage);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newCode);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  const getLineNumbers = () => {
    const lines = code.split('\n');
    return lines.map((_, i) => i + 1).join('\n');
  };

  return (
    <div className={cn("w-full max-w-5xl mx-auto", className)}>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {languages.map((lang: any) => (
                <option key={lang.value} value={lang.value}>{lang.label}</option>
              ))}
            </select>

            <button
              onClick={() => setShowLineNumbers(!showLineNumbers)}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            >
              {showLineNumbers ? 'Hide' : 'Show'} Line Numbers
            </button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="flex items-center gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span className="text-sm">Copy</span>
              </>
            )}
          </Button>
        </div>

        {/* Editor */}
        <div className="flex bg-gray-900">
          {showLineNumbers && (
            <div className="py-4 px-3 bg-gray-800 text-gray-500 font-mono text-sm text-right select-none border-r border-gray-700">
              <pre>{getLineNumbers()}</pre>
            </div>
          )}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 h-[500px] p-4 font-mono text-sm bg-gray-900 text-gray-100 outline-none resize-none"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
};

export default CodeEditorComponent;
    `,

    advanced: `
${commonImports}

interface CodeEditorProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onChange?: (code: string, language: string) => void;
  onRun?: (code: string, language: string) => void;
}

const CodeEditorComponent: React.FC<CodeEditorProps> = ({
  ${dataName},
  className,
  onChange,
  onRun
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

  const editorData = propData || fetchedData || {};

  const [code, setCode] = useState(${getField('initialCode')});
  const [copied, setCopied] = useState(false);
  const [language, setLanguage] = useState(${getField('defaultLanguage')});
  const [theme, setTheme] = useState(${getField('defaultTheme')});
  const [showLineNumbers, setShowLineNumbers] = useState(${getField('showLineNumbers')});
  const [fontSize, setFontSize] = useState(14);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const languages = ${getField('languages')};
  const themes = ${getField('themes')};
  const placeholder = ${getField('placeholder')};

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setCode(newCode);
    if (onChange) {
      onChange(newCode, language);
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    if (onChange) {
      onChange(code, newLanguage);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleRun = () => {
    console.log('Running code:', { code, language });
    if (onRun) {
      onRun(code, language);
    } else {
      alert(\`Running \${language} code...\\n\\n(Connect to a code execution service)\`);
    }
  };

  const handleFormat = () => {
    console.log('Formatting code...');
    alert('Code formatted! (Connect to a formatting service)');
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear the code?')) {
      setCode('');
      if (onChange) {
        onChange('', language);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newCode);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  const getLineNumbers = () => {
    const lines = code.split('\n');
    return lines.map((_, i) => i + 1).join('\n');
  };

  const getThemeStyles = () => {
    switch (theme) {
      case 'light':
        return 'bg-white text-gray-900';
      case 'dark':
        return 'bg-gray-900 text-gray-100';
      case 'dracula':
        return 'bg-[#282a36] text-[#f8f8f2]';
      case 'monokai':
        return 'bg-[#272822] text-[#f8f8f2]';
      case 'github':
        return 'bg-[#f6f8fa] text-[#24292e]';
      default:
        return 'bg-gray-900 text-gray-100';
    }
  };

  return (
    <div className={cn("w-full max-w-6xl mx-auto", className)}>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
        {/* Advanced Header */}
        <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-3">
          {/* First Row */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {languages.map((lang: any) => (
                  <option key={lang.value} value={lang.value}>{lang.label}</option>
                ))}
              </select>

              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {themes.map((thm: any) => (
                  <option key={thm.value} value={thm.value}>{thm.label}</option>
                ))}
              </select>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 dark:text-gray-400">Font Size:</label>
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={12}>12px</option>
                  <option value={14}>14px</option>
                  <option value={16}>16px</option>
                  <option value={18}>18px</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowLineNumbers(!showLineNumbers)}>
                {showLineNumbers ? 'Hide' : 'Show'} Lines
              </Button>
              <Button variant="ghost" size="sm" onClick={handleFormat}>
                Format
              </Button>
              <Button variant="ghost" size="sm" onClick={handleClear}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Second Row - Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={handleRun}
                className="bg-green-600 hover:bg-green-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Run Code
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-600 mr-2" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  <span>Copy Code</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Editor */}
        <div className={\`flex \${getThemeStyles()}\`}>
          {showLineNumbers && (
            <div className="py-4 px-3 text-gray-500 font-mono text-right select-none border-r border-gray-700" style={{ fontSize: \`\${fontSize}px\` }}>
              <pre>{getLineNumbers()}</pre>
            </div>
          )}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={\`flex-1 h-[600px] p-4 font-mono outline-none resize-none \${getThemeStyles()}\`}
            style={{ fontSize: \`\${fontSize}px\` }}
            spellCheck={false}
          />
        </div>

        {/* Footer Stats */}
        <div className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <span>{code.split('\n').length} lines</span>
            <span>{code.length} characters</span>
            <span>Language: {language}</span>
          </div>
          <div className="text-xs">
            Theme: {theme}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditorComponent;
    `
  };

  return variants[variant] || variants.basic;
};
