import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateRichTextEditor = (
  resolved: ResolvedComponent,
  variant: 'basic' | 'standard' | 'advanced' = 'basic'
) => {
  const dataSource = resolved.dataSource;

  // Special case: If dataSource is 'posts', generate a complete post creation form
  if (dataSource === 'posts') {
    return generatePostEditorForm();
  }

  // Special case: If dataSource is 'products', generate a complete product creation form
  if (dataSource === 'products') {
    return generateProductEditorForm();
  }

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
    return `/${dataSource || 'content'}`;
  };

  const apiRoute = getApiRoute();

  const commonImports = `
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Bold, Italic, Underline, Strikethrough, List, ListOrdered,
  Link as LinkIcon, Image, Code, Table, Quote, Undo, Redo, AlignLeft,
  AlignCenter, AlignRight, AlignJustify, Heading, Type,
  Palette, Save, Download, Eye, EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';`;

  const variants = {
    basic: `
${commonImports}

interface RichTextEditorProps {
  ${dataName}?: any;
  className?: string;
  onChange?: (content: string) => void;
}

const RichTextEditorComponent: React.FC<RichTextEditorProps> = ({
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
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);

  const placeholder = ${getField('placeholder')};
  const boldLabel = ${getField('boldLabel')};
  const italicLabel = ${getField('italicLabel')};
  const underlineLabel = ${getField('underlineLabel')};

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateToolbarState();
  };

  const updateToolbarState = () => {
    setIsBold(document.queryCommandState('bold'));
    setIsItalic(document.queryCommandState('italic'));
    setIsUnderline(document.queryCommandState('underline'));
  };

  const handleInput = () => {
    const newContent = editorRef.current?.innerHTML || '';
    setContent(newContent);
    if (onChange) {
      onChange(newContent);
    }
  };

  const ToolbarButton = ({
    onClick,
    active,
    icon: Icon,
    label
  }: {
    onClick: () => void;
    active?: boolean;
    icon: any;
    label: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
        active && "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
      )}
      title={label}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  return (
    <div className={cn("w-full max-w-4xl mx-auto", className)}>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        {/* Toolbar */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-2 flex items-center gap-1">
          <ToolbarButton
            onClick={() => execCommand('bold')}
            active={isBold}
            icon={Bold}
            label={boldLabel}
          />
          <ToolbarButton
            onClick={() => execCommand('italic')}
            active={isItalic}
            icon={Italic}
            label={italicLabel}
          />
          <ToolbarButton
            onClick={() => execCommand('underline')}
            active={isUnderline}
            icon={Underline}
            label={underlineLabel}
          />

          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

          <ToolbarButton
            onClick={() => execCommand('insertUnorderedList')}
            icon={List}
            label="Bullet List"
          />
          <ToolbarButton
            onClick={() => execCommand('insertOrderedList')}
            icon={ListOrdered}
            label="Numbered List"
          />
        </div>

        {/* Editor Area */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onMouseUp={updateToolbarState}
          onKeyUp={updateToolbarState}
          className="min-h-[300px] p-4 outline-none prose dark:prose-invert max-w-none text-gray-900 dark:text-gray-100"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
};

export default RichTextEditorComponent;
    `,

    standard: `
${commonImports}

interface RichTextEditorProps {
  ${dataName}?: any;
  className?: string;
  onChange?: (content: string) => void;
}

const RichTextEditorComponent: React.FC<RichTextEditorProps> = ({
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
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [currentHeading, setCurrentHeading] = useState('p');

  const editorRef = useRef<HTMLDivElement>(null);

  const placeholder = ${getField('placeholder')};

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateToolbarState();
  };

  const updateToolbarState = () => {
    setIsBold(document.queryCommandState('bold'));
    setIsItalic(document.queryCommandState('italic'));
    setIsUnderline(document.queryCommandState('underline'));
  };

  const handleInput = () => {
    const newContent = editorRef.current?.innerHTML || '';
    setContent(newContent);
    if (onChange) {
      onChange(newContent);
    }
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      execCommand('insertImage', url);
    }
  };

  const formatBlock = (tag: string) => {
    execCommand('formatBlock', tag);
    setCurrentHeading(tag);
  };

  const ToolbarButton = ({
    onClick,
    active,
    icon: Icon,
    label
  }: {
    onClick: () => void;
    active?: boolean;
    icon: any;
    label: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
        active && "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
      )}
      title={label}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  return (
    <div className={cn("w-full max-w-5xl mx-auto", className)}>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-md">
        {/* Toolbar */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-2 flex items-center gap-1 flex-wrap">
          {/* Formatting Group */}
          <div className="flex items-center gap-1">
            <select
              value={currentHeading}
              onChange={(e) => formatBlock(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="p">Paragraph</option>
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
            </select>
          </div>

          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

          {/* Text Style Group */}
          <div className="flex items-center gap-1">
            <ToolbarButton onClick={() => execCommand('bold')} active={isBold} icon={Bold} label="Bold" />
            <ToolbarButton onClick={() => execCommand('italic')} active={isItalic} icon={Italic} label="Italic" />
            <ToolbarButton onClick={() => execCommand('underline')} active={isUnderline} icon={Underline} label="Underline" />
            <ToolbarButton onClick={() => execCommand('strikethrough')} icon={Strikethrough} label="Strikethrough" />
          </div>

          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

          {/* Lists Group */}
          <div className="flex items-center gap-1">
            <ToolbarButton onClick={() => execCommand('insertUnorderedList')} icon={List} label="Bullet List" />
            <ToolbarButton onClick={() => execCommand('insertOrderedList')} icon={ListOrdered} label="Numbered List" />
          </div>

          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

          {/* Alignment Group */}
          <div className="flex items-center gap-1">
            <ToolbarButton onClick={() => execCommand('justifyLeft')} icon={AlignLeft} label="Align Left" />
            <ToolbarButton onClick={() => execCommand('justifyCenter')} icon={AlignCenter} label="Align Center" />
            <ToolbarButton onClick={() => execCommand('justifyRight')} icon={AlignRight} label="Align Right" />
          </div>

          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

          {/* Insert Group */}
          <div className="flex items-center gap-1">
            <ToolbarButton onClick={insertLink} icon={Link} label="Insert Link" />
            <ToolbarButton onClick={insertImage} icon={Image} label="Insert Image" />
            <ToolbarButton onClick={() => execCommand('formatBlock', 'blockquote')} icon={Quote} label="Blockquote" />
          </div>

          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

          {/* History Group */}
          <div className="flex items-center gap-1">
            <ToolbarButton onClick={() => execCommand('undo')} icon={Undo} label="Undo" />
            <ToolbarButton onClick={() => execCommand('redo')} icon={Redo} label="Redo" />
          </div>
        </div>

        {/* Editor Area */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onMouseUp={updateToolbarState}
          onKeyUp={updateToolbarState}
          className="min-h-[400px] p-6 outline-none prose dark:prose-invert max-w-none text-gray-900 dark:text-gray-100"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
};

export default RichTextEditorComponent;
    `,

    advanced: `
${commonImports}

interface RichTextEditorProps {
  ${dataName}?: any;
  className?: string;
  onChange?: (content: string) => void;
}

const RichTextEditorComponent: React.FC<RichTextEditorProps> = ({
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
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [currentHeading, setCurrentHeading] = useState('p');
  const [showSourceView, setShowSourceView] = useState(false);
  const [sourceCode, setSourceCode] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const editorRef = useRef<HTMLDivElement>(null);

  const placeholderAdvanced = ${getField('placeholderAdvanced')};

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateToolbarState();
  };

  const updateToolbarState = () => {
    setIsBold(document.queryCommandState('bold'));
    setIsItalic(document.queryCommandState('italic'));
    setIsUnderline(document.queryCommandState('underline'));
  };

  const updateCounts = (html: string) => {
    const text = html.replace(/<[^>]*>/g, '').trim();
    setCharCount(text.length);
    const words = text.split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  };

  const handleInput = () => {
    const newContent = editorRef.current?.innerHTML || '';
    setContent(newContent);
    updateCounts(newContent);
    if (onChange) {
      onChange(newContent);
    }
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      execCommand('insertImage', url);
    }
  };

  const insertTable = () => {
    const rows = prompt('Number of rows:', '3');
    const cols = prompt('Number of columns:', '3');
    if (rows && cols) {
      let tableHTML = '<table border="1" style="border-collapse: collapse; width: 100%;"><tbody>';
      for (let i = 0; i < parseInt(rows); i++) {
        tableHTML += '<tr>';
        for (let j = 0; j < parseInt(cols); j++) {
          tableHTML += '<td style="padding: 8px; border: 1px solid #ccc;">Cell</td>';
        }
        tableHTML += '</tr>';
      }
      tableHTML += '</tbody></table>';
      execCommand('insertHTML', tableHTML);
    }
  };

  const formatBlock = (tag: string) => {
    execCommand('formatBlock', tag);
    setCurrentHeading(tag);
  };

  const toggleSourceView = () => {
    if (!showSourceView) {
      setSourceCode(content);
    } else {
      setContent(sourceCode);
      if (editorRef.current) {
        editorRef.current.innerHTML = sourceCode;
      }
    }
    setShowSourceView(!showSourceView);
  };

  const handleSave = () => {
    console.log('Content saved:', content);
    alert('Content saved successfully!');
  };

  const handleExport = () => {
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const ToolbarButton = ({
    onClick,
    active,
    icon: Icon,
    label
  }: {
    onClick: () => void;
    active?: boolean;
    icon: any;
    label: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
        active && "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
      )}
      title={label}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  return (
    <div className={cn("w-full max-w-6xl mx-auto", className)}>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
        {/* Advanced Toolbar */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-3">
          {/* First Row */}
          <div className="flex items-center gap-1 flex-wrap mb-2">
            <select
              value={currentHeading}
              onChange={(e) => formatBlock(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="p">Paragraph</option>
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
              <option value="h4">Heading 4</option>
              <option value="h5">Heading 5</option>
            </select>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

            <ToolbarButton onClick={() => execCommand('bold')} active={isBold} icon={Bold} label="Bold" />
            <ToolbarButton onClick={() => execCommand('italic')} active={isItalic} icon={Italic} label="Italic" />
            <ToolbarButton onClick={() => execCommand('underline')} active={isUnderline} icon={Underline} label="Underline" />
            <ToolbarButton onClick={() => execCommand('strikethrough')} icon={Strikethrough} label="Strikethrough" />

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

            <ToolbarButton onClick={() => execCommand('insertUnorderedList')} icon={List} label="Bullet List" />
            <ToolbarButton onClick={() => execCommand('insertOrderedList')} icon={ListOrdered} label="Numbered List" />

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

            <ToolbarButton onClick={() => execCommand('justifyLeft')} icon={AlignLeft} label="Align Left" />
            <ToolbarButton onClick={() => execCommand('justifyCenter')} icon={AlignCenter} label="Align Center" />
            <ToolbarButton onClick={() => execCommand('justifyRight')} icon={AlignRight} label="Align Right" />
            <ToolbarButton onClick={() => execCommand('justifyFull')} icon={AlignJustify} label="Justify" />
          </div>

          {/* Second Row */}
          <div className="flex items-center gap-1 flex-wrap">
            <ToolbarButton onClick={insertLink} icon={Link} label="Insert Link" />
            <ToolbarButton onClick={insertImage} icon={Image} label="Insert Image" />
            <ToolbarButton onClick={() => execCommand('formatBlock', 'pre')} icon={Code} label="Code Block" />
            <ToolbarButton onClick={insertTable} icon={Table} label="Insert Table" />
            <ToolbarButton onClick={() => execCommand('formatBlock', 'blockquote')} icon={Quote} label="Blockquote" />

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

            <ToolbarButton onClick={() => execCommand('undo')} icon={Undo} label="Undo" />
            <ToolbarButton onClick={() => execCommand('redo')} icon={Redo} label="Redo" />
            <ToolbarButton onClick={() => execCommand('removeFormat')} icon={Type} label="Clear Format" />

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

            <ToolbarButton
              onClick={toggleSourceView}
              active={showSourceView}
              icon={showSourceView ? EyeOff : Eye}
              label="HTML Source"
            />

            <div className="flex-1" />

            <Button onClick={handleSave} size="sm" variant="outline" className="h-8">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button onClick={handleExport} size="sm" variant="outline" className="h-8">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Editor/Source View Area */}
        {showSourceView ? (
          <textarea
            value={sourceCode}
            onChange={(e) => setSourceCode(e.target.value)}
            className="w-full min-h-[500px] p-6 font-mono text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 outline-none resize-none"
            placeholder="HTML source code..."
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onMouseUp={updateToolbarState}
            onKeyUp={updateToolbarState}
            className="min-h-[500px] p-6 outline-none prose dark:prose-invert max-w-none text-gray-900 dark:text-gray-100"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}

        {/* Footer Stats */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-2 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <span>{wordCount} words</span>
            <span>{charCount} characters</span>
          </div>
          <div className="text-xs">
            {showSourceView ? 'Source View' : 'Visual Editor'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RichTextEditorComponent;
    `
  };

  return variants[variant] || variants.basic;
};

/**
 * Generate a complete post creation/editing form
 * This is used when the RICH_TEXT_EDITOR is for 'posts' entity
 */
const generatePostEditorForm = (): string => {
  return `
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bold, Italic, Underline, List, ListOrdered, Image, Save, Send, ArrowLeft, ChevronRight, X, Plus, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface PostEditorProps {
  data?: any;
  postId?: string;
  className?: string;
  onSubmit?: (data: any) => void;
  onPostClick?: (item: any) => void;
  onReadMore?: (itemId: string | number, item?: any) => void;
  onCategoryClick?: (category: string) => void;
  onAuthorClick?: (authorName: string) => void;
  onReadArticle?: (itemId: string | number, item?: any) => void;
}

const PostEditorComponent: React.FC<PostEditorProps> = ({ data: postData, postId: propPostId, className, onSubmit }) => {
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const editorRef = useRef<HTMLDivElement>(null);

  // Determine if we're in edit mode (either prop or route param)
  const postId = propPostId || routeId;
  const isEditMode = !!postId;

  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [status, setStatus] = useState('draft');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch existing post data in edit mode
  const { data: existingPost } = useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      const response = await api.get<any>(\`/posts/\${postId}\`);
      return response.data?.data || response.data || response;
    },
    enabled: isEditMode && !isInitialized,
  });

  // Load existing data into form when editing
  useEffect(() => {
    const dataToLoad = postData || existingPost;
    if (dataToLoad && !isInitialized) {
      setTitle(dataToLoad.title || '');
      setSlug(dataToLoad.slug || '');
      setContent(dataToLoad.content || '');
      setFeaturedImage(dataToLoad.featured_image || '');
      setImagePreview(dataToLoad.featured_image || '');
      setStatus(dataToLoad.status || 'draft');
      setTags(Array.isArray(dataToLoad.tags) ? dataToLoad.tags : []);

      // Set content in editor
      if (editorRef.current && dataToLoad.content) {
        editorRef.current.innerHTML = dataToLoad.content;
      }
      setIsInitialized(true);
    }
  }, [postData, existingPost, isInitialized]);

  // Editor state
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  // Auto-generate slug from title
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setSlug(generateSlug(newTitle));
  };

  // Tags management
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // Image upload state
  const [isUploading, setIsUploading] = useState(false);

  // Image upload - uploads to storage and saves URL
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);

      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to storage
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('bucket', 'blog-images');
        formData.append('folder', 'posts');

        const response = await api.post<any>('/storage/upload', formData, {
          requireAuth: true
        });

        const uploadedUrl = response.data?.url || response.url;
        if (uploadedUrl) {
          setFeaturedImage(uploadedUrl);
          toast.success('Image uploaded successfully!');
        }
      } catch (error: any) {
        console.error('Image upload failed:', error);
        toast.error('Failed to upload image. You can still enter a URL manually.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  // Rich text editor commands
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateToolbarState();
  };

  const updateToolbarState = () => {
    setIsBold(document.queryCommandState('bold'));
    setIsItalic(document.queryCommandState('italic'));
    setIsUnderline(document.queryCommandState('underline'));
  };

  const handleEditorInput = () => {
    const newContent = editorRef.current?.innerHTML || '';
    setContent(newContent);
  };

  // Create post mutation
  // Create mutation (for new posts)
  const createPostMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post<any>('/posts', data, { requireAuth: true });
      return response.data || response;
    },
    onSuccess: () => {
      toast.success('Post created successfully!');
      navigate('/admin/my-posts');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create post');
    },
  });

  // Update mutation (for editing existing posts)
  const updatePostMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.patch<any>(\`/posts/\${postId}\`, data, { requireAuth: true });
      return response.data || response;
    },
    onSuccess: () => {
      toast.success('Post updated successfully!');
      navigate('/admin/my-posts');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update post');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!content.trim()) {
      toast.error('Content is required');
      return;
    }

    const postPayload = {
      title,
      slug,
      content,
      featured_image: featuredImage || '', // Only use URL, not base64 (too large for varchar(255))
      status,
    };

    // Use update mutation for edit mode, create mutation for new posts
    if (isEditMode) {
      updatePostMutation.mutate(postPayload);
    } else {
      createPostMutation.mutate(postPayload);
    }
  };

  const isPending = createPostMutation.isPending || updatePostMutation.isPending;

  const handleSaveDraft = () => {
    setStatus('draft');
    handleSubmit(new Event('submit') as any);
  };

  const handlePublish = () => {
    setStatus('published');
    handleSubmit(new Event('submit') as any);
  };

  const ToolbarButton = ({ onClick, active, icon: Icon, label }: { onClick: () => void; active?: boolean; icon: any; label: string; }) => (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
        active && "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
      )}
      title={label}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  return (
    <div className={cn("space-y-6", className)}>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="Enter post title..."
                    className="text-xl font-semibold"
                    required
                  />
                </div>
                <div className="space-y-2 mt-4">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="post-url-slug"
                    className="font-mono text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content *</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg">
                  <div className="border-b p-2 flex items-center gap-1 bg-gray-50 dark:bg-gray-800">
                    <ToolbarButton onClick={() => execCommand('bold')} active={isBold} icon={Bold} label="Bold" />
                    <ToolbarButton onClick={() => execCommand('italic')} active={isItalic} icon={Italic} label="Italic" />
                    <ToolbarButton onClick={() => execCommand('underline')} active={isUnderline} icon={Underline} label="Underline" />
                    <div className="w-px h-6 bg-gray-300 mx-1" />
                    <ToolbarButton onClick={() => execCommand('insertUnorderedList')} icon={List} label="Bullet List" />
                    <ToolbarButton onClick={() => execCommand('insertOrderedList')} icon={ListOrdered} label="Numbered List" />
                    <div className="w-px h-6 bg-gray-300 mx-1" />
                    <ToolbarButton
                      onClick={() => {
                        const url = prompt('Enter image URL:');
                        if (url) execCommand('insertImage', url);
                      }}
                      icon={Image}
                      label="Insert Image"
                    />
                  </div>
                  <div
                    ref={editorRef}
                    contentEditable
                    onInput={handleEditorInput}
                    onMouseUp={updateToolbarState}
                    onKeyUp={updateToolbarState}
                    className="min-h-[400px] p-4 outline-none prose dark:prose-invert max-w-none"
                    suppressContentEditableWarning={true}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Publish</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={handleSaveDraft} disabled={isPending}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Draft
                  </Button>
                  <Button type="button" className="flex-1" onClick={handlePublish} disabled={isPending}>
                    <Send className="w-4 h-4 mr-2" />
                    {isPending ? (isEditMode ? 'Updating...' : 'Publishing...') : (isEditMode ? 'Update' : 'Publish')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Featured Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => { setImagePreview(''); setImageFile(null); }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 mb-2">Upload featured image</p>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="featured-image" />
                    <label htmlFor="featured-image" className="cursor-pointer inline-block">
                      <span className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3">
                        Choose File
                      </span>
                    </label>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Or enter image URL</Label>
                  <Input value={featuredImage} onChange={(e) => setFeaturedImage(e.target.value)} placeholder="https://example.com/image.jpg" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown} placeholder="Add a tag..." />
                  <Button type="button" onClick={addTag} size="icon">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-blue-900">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PostEditorComponent;
`;
};

/**
 * Generate a complete product creation/editing form
 * This is used when the RICH_TEXT_EDITOR is for 'products' entity
 */
const generateProductEditorForm = (): string => {
  return `
import React, { useState, useRef } from 'react';
import { Package, DollarSign, Image, ChevronRight, Loader2, Plus, X, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ProductEditorProps {
  data?: any;
  className?: string;
  onSubmit?: (data: any) => void;
  onPostClick?: (item: any) => void;
  onReadMore?: (itemId: string | number, item?: any) => void;
  onCategoryClick?: (category: string) => void;
  onAuthorClick?: (authorName: string) => void;
  onReadArticle?: (itemId: string | number, item?: any) => void;
}

const ProductEditorComponent: React.FC<ProductEditorProps> = ({ data: products, className, onSubmit }) => {
  const navigate = useNavigate();
  const descriptionRef = useRef<HTMLDivElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    sku: '',
    inventory_quantity: '',
    category_id: '',
    image_url: '',
    status: 'active'
  });

  // Variant state
  const [colors, setColors] = useState<string[]>([]);
  const [colorInput, setColorInput] = useState('');
  const [sizes, setSizes] = useState<string[]>([]);
  const [sizeInput, setSizeInput] = useState('');

  // Image state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');

  // Editor state
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Rich text editor commands
  const execCommand = (command: string) => {
    document.execCommand(command, false);
    descriptionRef.current?.focus();
    updateToolbarState();
  };

  const updateToolbarState = () => {
    setIsBold(document.queryCommandState('bold'));
    setIsItalic(document.queryCommandState('italic'));
  };

  const handleDescriptionInput = () => {
    const newContent = descriptionRef.current?.innerHTML || '';
    setFormData(prev => ({ ...prev, description: newContent }));
  };

  // Color management
  const addColor = () => {
    if (colorInput.trim() && !colors.includes(colorInput.trim())) {
      setColors([...colors, colorInput.trim()]);
      setColorInput('');
    }
  };

  const removeColor = (colorToRemove: string) => {
    setColors(colors.filter(c => c !== colorToRemove));
  };

  const handleColorKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addColor();
    }
  };

  // Size management
  const addSize = () => {
    if (sizeInput.trim() && !sizes.includes(sizeInput.trim())) {
      setSizes([...sizes, sizeInput.trim()]);
      setSizeInput('');
    }
  };

  const removeSize = (sizeToRemove: string) => {
    setSizes(sizes.filter(s => s !== sizeToRemove));
  };

  const handleSizeKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSize();
    }
  };

  // Image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImagePreview(base64String);
      setFormData(prev => ({ ...prev, image_url: base64String }));
    };
    reader.readAsDataURL(file);
  };

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      const response = await api.post<any>('/products', productData, { requireAuth: false, silentAuthFailure: true });
      return response.data || response;
    },
    onSuccess: () => {
      toast.success('Product created successfully!');
      navigate('/admin/products');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create product');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        inventory_quantity: parseInt(formData.inventory_quantity),
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        colors: colors.length > 0 ? JSON.stringify(colors) : null,
        sizes: sizes.length > 0 ? JSON.stringify(sizes) : null
      };

      createProductMutation.mutate(productData);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create product');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-6">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
          <Link to="/" className="hover:text-gray-900 dark:hover:text-gray-200">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/admin/dashboard" className="hover:text-gray-900 dark:hover:text-gray-200">Admin Panel</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/admin/products" className="hover:text-gray-900 dark:hover:text-gray-200">Products</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 dark:text-white font-medium">Create Product</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create New Product</h1>
          <p className="text-gray-600 dark:text-gray-400">Add a new product to your catalog</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h2>
            </div>

            <div className="space-y-5">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter product name"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Description with Rich Text Editor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                  {/* Toolbar */}
                  <div className="bg-gray-100 dark:bg-gray-900 border-b border-gray-300 dark:border-gray-600 p-2 flex gap-1">
                    <button
                      type="button"
                      onClick={() => execCommand('bold')}
                      className={cn(
                        "px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-bold",
                        isBold && "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                      )}
                      title="Bold"
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() => execCommand('italic')}
                      className={cn(
                        "px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors italic",
                        isItalic && "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                      )}
                      title="Italic"
                    >
                      I
                    </button>
                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
                    <button
                      type="button"
                      onClick={() => execCommand('insertUnorderedList')}
                      className="px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      title="Bullet List"
                    >
                      • List
                    </button>
                  </div>
                  {/* Editor Area */}
                  <div
                    ref={descriptionRef}
                    contentEditable
                    onInput={handleDescriptionInput}
                    onMouseUp={updateToolbarState}
                    onKeyUp={updateToolbarState}
                    className="min-h-[150px] p-4 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none prose dark:prose-invert max-w-none"
                    suppressContentEditableWarning={true}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Use the toolbar to format your description with bold, italic, and lists.
                </p>
              </div>
            </div>
          </div>

          {/* Pricing & Inventory Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pricing & Inventory</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* SKU */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  SKU <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  required
                  placeholder="e.g., PROD-001"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Inventory Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Stock Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="inventory_quantity"
                  value={formData.inventory_quantity}
                  onChange={handleChange}
                  required
                  min="0"
                  placeholder="0"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category ID
                </label>
                <input
                  type="number"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  placeholder="Optional"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Variants Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Product Variants</h2>
            </div>

            <div className="space-y-6">
              {/* Colors */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Colors
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={colorInput}
                    onChange={(e) => setColorInput(e.target.value)}
                    onKeyDown={handleColorKeyDown}
                    placeholder="Enter color (e.g., Red, Blue)"
                    className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={addColor}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
                {colors.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                      >
                        {color}
                        <button
                          type="button"
                          onClick={() => removeColor(color)}
                          className="hover:text-blue-900 dark:hover:text-blue-100"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Sizes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sizes
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={sizeInput}
                    onChange={(e) => setSizeInput(e.target.value)}
                    onKeyDown={handleSizeKeyDown}
                    placeholder="Enter size (e.g., S, M, L, XL)"
                    className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={addSize}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
                {sizes.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm"
                      >
                        {size}
                        <button
                          type="button"
                          onClick={() => removeSize(size)}
                          className="hover:text-green-900 dark:hover:text-green-100"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Media & Status Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Image className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Media & Status</h2>
            </div>

            <div className="space-y-5">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Product Image
                </label>
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview('');
                        setImageFile(null);
                        setFormData(prev => ({ ...prev, image_url: '' }));
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      Drag and drop an image, or click to browse
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="product-image"
                    />
                    <label
                      htmlFor="product-image"
                      className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </label>
                    <p className="text-xs text-gray-400 mt-2">Maximum file size: 5MB</p>
                  </div>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 pt-4">
            <button
              type="submit"
              disabled={createProductMutation.isPending}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {createProductMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Product'
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEditorComponent;
`;
};
