import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateMarkdownEditor = (
  resolved: ResolvedComponent,
  variant: 'split' | 'preview' | 'tabbed' = 'split'
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
  Bold, Italic, Heading, Link, Image, Code, Quote, List,
  ListOrdered, CheckSquare, Eye, EyeOff, Maximize, HelpCircle,
  Upload
} from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';`;

  const variants = {
    split: `
${commonImports}

interface MarkdownEditorProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onChange?: (content: string) => void;
}

const MarkdownEditorComponent: React.FC<MarkdownEditorProps> = ({
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

  const [content, setContent] = useState(${getField('initialContent')});
  const [showGuide, setShowGuide] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const placeholder = ${getField('placeholder')};
  const guideItems = ${getField('guideItems')};

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    if (onChange) {
      onChange(newContent);
    }
  };

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);

    setContent(newText);
    if (onChange) {
      onChange(newText);
    }

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const renderMarkdown = (text: string) => {
    let html = text
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\`(.*?)\`/g, '<code>$1</code>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
      .replace(/\n/g, '<br />');

    return html;
  };

  const ToolbarButton = ({
    onClick,
    icon: Icon,
    label
  }: {
    onClick: () => void;
    icon: any;
    label: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      title={label}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  return (
    <div className={cn("w-full max-w-7xl mx-auto", className)}>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
        {/* Toolbar */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <ToolbarButton onClick={() => insertMarkdown('**', '**')} icon={Bold} label="Bold" />
            <ToolbarButton onClick={() => insertMarkdown('*', '*')} icon={Italic} label="Italic" />
            <ToolbarButton onClick={() => insertMarkdown('# ')} icon={Heading} label="Heading" />
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
            <ToolbarButton onClick={() => insertMarkdown('[', '](url)')} icon={Link} label="Link" />
            <ToolbarButton onClick={() => insertMarkdown('![alt](', ')')} icon={Image} label="Image" />
            <ToolbarButton onClick={() => insertMarkdown('\`', '\`')} icon={Code} label="Code" />
            <ToolbarButton onClick={() => insertMarkdown('> ')} icon={Quote} label="Quote" />
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
            <ToolbarButton onClick={() => insertMarkdown('- ')} icon={List} label="List" />
            <ToolbarButton onClick={() => insertMarkdown('1. ')} icon={ListOrdered} label="Numbered List" />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowGuide(!showGuide)}
            className="flex items-center gap-2"
          >
            <HelpCircle className="w-4 h-4" />
            Guide
          </Button>
        </div>

        {/* Editor and Preview Split */}
        <div className="grid grid-cols-2 divide-x divide-gray-200 dark:divide-gray-700">
          {/* Editor */}
          <div className="relative">
            <div className="absolute top-2 right-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              Editor
            </div>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleChange}
              placeholder={placeholder}
              className="w-full h-[600px] p-6 font-mono text-sm bg-transparent text-gray-900 dark:text-gray-100 outline-none resize-none"
            />
          </div>

          {/* Preview */}
          <div className="relative">
            <div className="absolute top-2 right-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              Preview
            </div>
            <div
              className="h-[600px] p-6 overflow-y-auto prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
            />
          </div>
        </div>

        {/* Guide Panel */}
        {showGuide && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Markdown Quick Guide</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {guideItems.map((item: any, idx: number) => (
                <div key={idx} className="text-sm">
                  <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded text-xs">{item.syntax}</code>
                  <p className="text-gray-600 dark:text-gray-400 mt-1 text-xs">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkdownEditorComponent;
    `,

    preview: `
${commonImports}

interface MarkdownEditorProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onChange?: (content: string) => void;
}

const MarkdownEditorComponent: React.FC<MarkdownEditorProps> = ({
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

  const [content, setContent] = useState(${getField('initialContent')});
  const [showPreview, setShowPreview] = useState(true);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const placeholder = ${getField('placeholder')};

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    if (onChange) {
      onChange(newContent);
    }
  };

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);

    setContent(newText);
    if (onChange) {
      onChange(newText);
    }

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const renderMarkdown = (text: string) => {
    let html = text
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\`(.*?)\`/g, '<code>$1</code>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
      .replace(/\n/g, '<br />');

    return html;
  };

  const ToolbarButton = ({
    onClick,
    icon: Icon,
    label
  }: {
    onClick: () => void;
    icon: any;
    label: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      title={label}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  return (
    <div className={cn("w-full max-w-5xl mx-auto", className)}>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
        {/* Toolbar */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <ToolbarButton onClick={() => insertMarkdown('**', '**')} icon={Bold} label="Bold" />
            <ToolbarButton onClick={() => insertMarkdown('*', '*')} icon={Italic} label="Italic" />
            <ToolbarButton onClick={() => insertMarkdown('# ')} icon={Heading} label="Heading" />
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
            <ToolbarButton onClick={() => insertMarkdown('[', '](url)')} icon={Link} label="Link" />
            <ToolbarButton onClick={() => insertMarkdown('![alt](', ')')} icon={Image} label="Image" />
            <ToolbarButton onClick={() => insertMarkdown('\`', '\`')} icon={Code} label="Code" />
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
            <ToolbarButton onClick={() => insertMarkdown('- ')} icon={List} label="List" />
            <ToolbarButton onClick={() => insertMarkdown('1. ')} icon={ListOrdered} label="Numbered List" />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2"
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showPreview ? 'Hide' : 'Show'} Preview
          </Button>
        </div>

        {/* Editor Area */}
        <div className="p-6">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleChange}
            placeholder={placeholder}
            className="w-full h-[400px] p-4 font-mono text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 outline-none resize-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Preview Area */}
        {showPreview && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <h4 className="font-semibold text-gray-900 dark:text-white">Preview</h4>
            </div>
            <div
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkdownEditorComponent;
    `,

    tabbed: `
${commonImports}

interface MarkdownEditorProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onChange?: (content: string) => void;
}

const MarkdownEditorComponent: React.FC<MarkdownEditorProps> = ({
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

  const [content, setContent] = useState(${getField('initialContent')});
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const placeholder = ${getField('placeholder')};
  const editorTab = ${getField('editorTab')};
  const previewTab = ${getField('previewTab')};

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    if (onChange) {
      onChange(newContent);
    }
  };

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);

    setContent(newText);
    if (onChange) {
      onChange(newText);
    }

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const renderMarkdown = (text: string) => {
    let html = text
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\`(.*?)\`/g, '<code>$1</code>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
      .replace(/\n/g, '<br />');

    return html;
  };

  const ToolbarButton = ({
    onClick,
    icon: Icon,
    label
  }: {
    onClick: () => void;
    icon: any;
    label: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      title={label}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  return (
    <div className={cn("w-full max-w-5xl mx-auto", className)}>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 flex items-center">
          <button
            onClick={() => setActiveTab('editor')}
            className={cn(
              "px-6 py-3 font-medium transition-colors border-b-2",
              activeTab === 'editor'
                ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400"
                : "text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-200"
            )}
          >
            {editorTab}
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={cn(
              "px-6 py-3 font-medium transition-colors border-b-2",
              activeTab === 'preview'
                ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400"
                : "text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-200"
            )}
          >
            {previewTab}
          </button>
        </div>

        {/* Toolbar (visible only in editor tab) */}
        {activeTab === 'editor' && (
          <div className="border-b border-gray-200 dark:border-gray-700 p-2 flex items-center gap-1">
            <ToolbarButton onClick={() => insertMarkdown('**', '**')} icon={Bold} label="Bold" />
            <ToolbarButton onClick={() => insertMarkdown('*', '*')} icon={Italic} label="Italic" />
            <ToolbarButton onClick={() => insertMarkdown('# ')} icon={Heading} label="Heading" />
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
            <ToolbarButton onClick={() => insertMarkdown('[', '](url)')} icon={Link} label="Link" />
            <ToolbarButton onClick={() => insertMarkdown('![alt](', ')')} icon={Image} label="Image" />
            <ToolbarButton onClick={() => insertMarkdown('\`', '\`')} icon={Code} label="Code" />
            <ToolbarButton onClick={() => insertMarkdown('> ')} icon={Quote} label="Quote" />
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
            <ToolbarButton onClick={() => insertMarkdown('- ')} icon={List} label="List" />
            <ToolbarButton onClick={() => insertMarkdown('1. ')} icon={ListOrdered} label="Numbered List" />
            <ToolbarButton onClick={() => insertMarkdown('- [ ] ')} icon={CheckSquare} label="Checklist" />
          </div>
        )}

        {/* Content Area */}
        <div className="p-6">
          {activeTab === 'editor' ? (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleChange}
              placeholder={placeholder}
              className="w-full h-[500px] p-4 font-mono text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 outline-none resize-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <div
              className="min-h-[500px] prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MarkdownEditorComponent;
    `
  };

  return variants[variant] || variants.split;
};
