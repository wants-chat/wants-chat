import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateForumPostEditor = (
  resolved: ResolvedComponent,
  variant: 'basic' | 'markdown' | 'rich' = 'basic'
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

  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'posts'}`;
  };
  const apiRoute = getApiRoute();
  const entity = dataSource || 'posts';

  const commonImports = `
import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';`;

  const variants = {
    basic: `
${commonImports}
import {
  Send, Save, Eye, X, Upload, Trash2, Plus, Tag,
  FolderOpen, FileText, Image as ImageIcon, BarChart3, Sparkles
} from 'lucide-react';

interface Category {
  id: number;
  name: string;
  color: string;
}

interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
}

interface ForumPostEditorProps {
  ${dataName}?: any;
  className?: string;
  onPost?: (post: any) => void;
  onSaveDraft?: (post: any) => void;
}

const ForumPostEditor: React.FC<ForumPostEditorProps> = ({
  ${dataName}: propData,
  className,
  onPost,
  onSaveDraft
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [tags, setTags] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [showPoll, setShowPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [isPreview, setIsPreview] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response[0] : (response?.data?.[0] || response?.data || response);
    },
    enabled: !propData,
    retry: 1,
  });

  // Fetch categories for the dropdown
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get<any>('/categories');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  // Mutation for creating a new post
  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      const response = await api.post<any>('${apiRoute}', postData);
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['${entity}'] });
      if (onPost) onPost(data);
      resetForm();
      navigate('/blog');
    },
    onError: (error: any) => {
      alert(error?.message || 'Failed to create post');
    },
  });

  // Mutation for saving as draft
  const saveDraftMutation = useMutation({
    mutationFn: async (draftData: any) => {
      const response = await api.post<any>('${apiRoute}', { ...draftData, status: 'draft' });
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['${entity}'] });
      if (onSaveDraft) onSaveDraft(data);
      alert('Draft saved successfully!');
    },
    onError: (error: any) => {
      alert(error?.message || 'Failed to save draft');
    },
  });

  const ${dataName} = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const editorData = ${dataName} || {};

  const titleLabel = ${getField('titleLabel')};
  const titlePlaceholder = ${getField('titlePlaceholder')};
  const contentLabel = ${getField('contentLabel')};
  const contentPlaceholder = ${getField('contentPlaceholder')};
  const categoryLabel = ${getField('categoryLabel')};
  const categoryPlaceholder = ${getField('categoryPlaceholder')};
  const tagsLabel = ${getField('tagsLabel')};
  const tagsPlaceholder = ${getField('tagsPlaceholder')};
  const attachFilesLabel = ${getField('attachFilesLabel')};
  const pollOptionsLabel = ${getField('pollOptionsLabel')};
  const addPollOptionButton = ${getField('addPollOptionButton')};
  const removePollButton = ${getField('removePollButton')};
  const createPollButton = ${getField('createPollButton')};
  const postButton = ${getField('postButton')};
  const saveDraftButton = ${getField('saveDraftButton')};
  const previewButton = ${getField('previewButton')};
  const cancelButton = ${getField('cancelButton')};
  const backToEditButton = ${getField('backToEditButton')};
  const uploadButton = ${getField('uploadButton')};
  const removeFileButton = ${getField('removeFileButton')};
  const editorTitle = ${getField('basicEditorTitle')};
  const editorDescription = ${getField('editorDescription')};
  const categories: Category[] = ${getField('categories')};
  const titleRequiredMessage = ${getField('titleRequiredMessage')};
  const contentRequiredMessage = ${getField('contentRequiredMessage')};
  const categoryRequiredMessage = ${getField('categoryRequiredMessage')};

  const handlePost = () => {
    if (!title.trim()) {
      alert(titleRequiredMessage);
      return;
    }
    if (!content.trim()) {
      alert(contentRequiredMessage);
      return;
    }

    const post = {
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      content,
      category_id: selectedCategory?.id,
      tags: tags.split(',').map(t => t.trim()).filter(t => t),
      status: 'published',
    };

    createPostMutation.mutate(post);
  };

  const handleSaveDraft = () => {
    const draft = {
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      content,
      category_id: selectedCategory?.id,
      tags: tags.split(',').map(t => t.trim()).filter(t => t),
      status: 'draft',
    };

    saveDraftMutation.mutate(draft);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: AttachedFile[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type
    }));

    console.log('Files attached:', newFiles);
    setAttachedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    console.log('File removed:', id);
    setAttachedFiles(prev => prev.filter(f => f.id !== id));
  };

  const addPollOption = () => {
    console.log('Poll option added');
    setPollOptions(prev => [...prev, '']);
  };

  const removePollOption = (index: number) => {
    console.log('Poll option removed:', index);
    setPollOptions(prev => prev.filter((_, i) => i !== index));
  };

  const updatePollOption = (index: number, value: string) => {
    setPollOptions(prev => prev.map((opt, i) => i === index ? value : opt));
  };

  const togglePoll = () => {
    console.log('Poll toggled:', !showPoll);
    setShowPoll(!showPoll);
    if (!showPoll) {
      setPollOptions(['', '']);
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setSelectedCategory(null);
    setTags('');
    setAttachedFiles([]);
    setShowPoll(false);
    setPollOptions(['', '']);
    setIsPreview(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getCategoryColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
      green: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
      purple: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
      red: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
      yellow: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
      gray: 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300'
    };
    return colors[color] || colors.gray;
  };

  if (isPreview) {
    return (
      <div className={cn("space-y-6", className)}>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Preview</h2>
            <Button onClick={() => setIsPreview(false)} variant="outline">
              {backToEditButton}
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title || 'Untitled Post'}</h1>
              {selectedCategory && (
                <span className={\`inline-block px-3 py-1 rounded-full text-sm font-medium \${getCategoryColor(selectedCategory.color)}\`}>
                  {selectedCategory.name}
                </span>
              )}
            </div>

            {tags && (
              <div className="flex flex-wrap gap-2">
                {tags.split(',').map((tag, idx) => (
                  <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-sm">
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            )}

            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{content || 'No content'}</p>
            </div>

            {attachedFiles.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Attached Files</h3>
                <div className="space-y-2">
                  {attachedFiles.map(file => (
                    <div key={file.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                      <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showPoll && pollOptions.some(o => o.trim()) && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Poll
                </h3>
                <div className="space-y-2">
                  {pollOptions.filter(o => o.trim()).map((option, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input type="radio" name="poll" disabled className="cursor-not-allowed" />
                      <span className="text-gray-700 dark:text-gray-300">{option}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{editorTitle}</h2>
        <p className="text-gray-600 dark:text-gray-400">{editorDescription}</p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {titleLabel} *
            </label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={titlePlaceholder}
              className="w-full"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {categoryLabel} *
            </label>
            <div className="relative">
              <button
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {selectedCategory ? (
                  <span className={\`px-3 py-1 rounded-full text-sm font-medium \${getCategoryColor(selectedCategory.color)}\`}>
                    {selectedCategory.name}
                  </span>
                ) : (
                  <span className="text-gray-500 dark:text-gray-400">{categoryPlaceholder}</span>
                )}
                <FolderOpen className="w-5 h-5 text-gray-400" />
              </button>

              {showCategoryDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowCategoryDropdown(false)} />
                  <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-20 max-h-60 overflow-y-auto">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          setSelectedCategory(category);
                          setShowCategoryDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <span className={\`px-3 py-1 rounded-full text-sm font-medium \${getCategoryColor(category.color)}\`}>
                          {category.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {contentLabel} *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={contentPlaceholder}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={10}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              {tagsLabel}
            </label>
            <Input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder={tagsPlaceholder}
              className="w-full"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Upload className="w-4 h-4" />
              {attachFilesLabel}
            </label>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploadButton}
            </Button>

            {attachedFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                {attachedFiles.map(file => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                      <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                    </div>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Poll */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            {!showPoll ? (
              <Button onClick={togglePoll} variant="outline" className="w-full">
                <BarChart3 className="w-4 h-4 mr-2" />
                {createPollButton}
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    {pollOptionsLabel}
                  </label>
                  <button
                    onClick={togglePoll}
                    className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                  >
                    {removePollButton}
                  </button>
                </div>

                {pollOptions.map((option, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={option}
                      onChange={(e) => updatePollOption(idx, e.target.value)}
                      placeholder={\`Option \${idx + 1}\`}
                      className="flex-1"
                    />
                    {pollOptions.length > 2 && (
                      <button
                        onClick={() => removePollOption(idx)}
                        className="text-gray-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}

                <Button onClick={addPollOption} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  {addPollOptionButton}
                </Button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button onClick={handlePost} className="flex-1">
              <Send className="w-4 h-4 mr-2" />
              {postButton}
            </Button>
            <Button onClick={handleSaveDraft} variant="outline">
              <Save className="w-4 h-4 mr-2" />
              {saveDraftButton}
            </Button>
            <Button onClick={() => setIsPreview(true)} variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              {previewButton}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ForumPostEditor;
    `,

    markdown: `
${commonImports}
import {
  Send, Save, Eye, X, Upload, Trash2, Plus, Tag,
  FolderOpen, FileText, Bold, Italic, Code, Link as LinkIcon,
  List, Quote, Heading, BarChart3, Sparkles
} from 'lucide-react';

interface Category {
  id: number;
  name: string;
  color: string;
}

interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
}

interface ForumPostEditorProps {
  ${dataName}?: any;
  className?: string;
  onPost?: (post: any) => void;
  onSaveDraft?: (post: any) => void;
}

const ForumPostEditor: React.FC<ForumPostEditorProps> = ({
  ${dataName}: propData,
  className,
  onPost,
  onSaveDraft
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [tags, setTags] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [showPoll, setShowPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [isPreview, setIsPreview] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response[0] : (response?.data?.[0] || response?.data || response);
    },
    enabled: !propData,
    retry: 1,
  });

  // Fetch categories for the dropdown
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get<any>('/categories');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  // Mutation for creating a new post
  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      const response = await api.post<any>('${apiRoute}', postData);
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['${entity}'] });
      if (onPost) onPost(data);
      resetForm();
      navigate('/blog');
    },
    onError: (error: any) => {
      alert(error?.message || 'Failed to create post');
    },
  });

  // Mutation for saving as draft
  const saveDraftMutation = useMutation({
    mutationFn: async (draftData: any) => {
      const response = await api.post<any>('${apiRoute}', { ...draftData, status: 'draft' });
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['${entity}'] });
      if (onSaveDraft) onSaveDraft(data);
      alert('Draft saved successfully!');
    },
    onError: (error: any) => {
      alert(error?.message || 'Failed to save draft');
    },
  });

  const ${dataName} = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const editorData = ${dataName} || {};

  const titleLabel = ${getField('titleLabel')};
  const titlePlaceholder = ${getField('titlePlaceholder')};
  const contentLabel = ${getField('contentLabel')};
  const contentPlaceholder = ${getField('contentPlaceholder')};
  const categoryLabel = ${getField('categoryLabel')};
  const categoryPlaceholder = ${getField('categoryPlaceholder')};
  const tagsLabel = ${getField('tagsLabel')};
  const tagsPlaceholder = ${getField('tagsPlaceholder')};
  const attachFilesLabel = ${getField('attachFilesLabel')};
  const pollOptionsLabel = ${getField('pollOptionsLabel')};
  const addPollOptionButton = ${getField('addPollOptionButton')};
  const removePollButton = ${getField('removePollButton')};
  const createPollButton = ${getField('createPollButton')};
  const postButton = ${getField('postButton')};
  const saveDraftButton = ${getField('saveDraftButton')};
  const previewButton = ${getField('previewButton')};
  const backToEditButton = ${getField('backToEditButton')};
  const uploadButton = ${getField('uploadButton')};
  const boldLabel = ${getField('boldLabel')};
  const italicLabel = ${getField('italicLabel')};
  const codeLabel = ${getField('codeLabel')};
  const linkLabel = ${getField('linkLabel')};
  const listLabel = ${getField('listLabel')};
  const quoteLabel = ${getField('quoteLabel')};
  const headingLabel = ${getField('headingLabel')};
  const editorTitle = ${getField('markdownEditorTitle')};
  const editorDescription = ${getField('markdownDescription')};
  const categories: Category[] = ${getField('categories')};
  const titleRequiredMessage = ${getField('titleRequiredMessage')};
  const contentRequiredMessage = ${getField('contentRequiredMessage')};
  const categoryRequiredMessage = ${getField('categoryRequiredMessage')};

  const insertMarkdown = (syntax: string, placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const text = selectedText || placeholder;

    let newText = '';
    let cursorOffset = 0;

    switch (syntax) {
      case 'bold':
        newText = \`**\${text}**\`;
        cursorOffset = selectedText ? newText.length : 2;
        break;
      case 'italic':
        newText = \`*\${text}*\`;
        cursorOffset = selectedText ? newText.length : 1;
        break;
      case 'code':
        newText = \`\\\`\${text}\\\`\`;
        cursorOffset = selectedText ? newText.length : 1;
        break;
      case 'link':
        newText = \`[\${text || 'link text'}](url)\`;
        cursorOffset = selectedText ? newText.length - 4 : 10;
        break;
      case 'list':
        newText = \`- \${text}\`;
        cursorOffset = newText.length;
        break;
      case 'quote':
        newText = \`> \${text}\`;
        cursorOffset = newText.length;
        break;
      case 'heading':
        newText = \`## \${text}\`;
        cursorOffset = newText.length;
        break;
    }

    const newContent = content.substring(0, start) + newText + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + cursorOffset, start + cursorOffset);
    }, 0);
  };

  const handlePost = () => {
    if (!title.trim()) {
      alert(titleRequiredMessage);
      return;
    }
    if (!content.trim()) {
      alert(contentRequiredMessage);
      return;
    }

    const post = {
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      content,
      category_id: selectedCategory?.id,
      tags: tags.split(',').map(t => t.trim()).filter(t => t),
      status: 'published',
    };

    createPostMutation.mutate(post);
  };

  const handleSaveDraft = () => {
    const draft = {
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      content,
      category_id: selectedCategory?.id,
      tags: tags.split(',').map(t => t.trim()).filter(t => t),
      status: 'draft',
    };

    saveDraftMutation.mutate(draft);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: AttachedFile[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type
    }));

    console.log('Files attached:', newFiles);
    setAttachedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    console.log('File removed:', id);
    setAttachedFiles(prev => prev.filter(f => f.id !== id));
  };

  const addPollOption = () => {
    console.log('Poll option added');
    setPollOptions(prev => [...prev, '']);
  };

  const removePollOption = (index: number) => {
    console.log('Poll option removed:', index);
    setPollOptions(prev => prev.filter((_, i) => i !== index));
  };

  const updatePollOption = (index: number, value: string) => {
    setPollOptions(prev => prev.map((opt, i) => i === index ? value : opt));
  };

  const togglePoll = () => {
    console.log('Poll toggled:', !showPoll);
    setShowPoll(!showPoll);
    if (!showPoll) {
      setPollOptions(['', '']);
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setSelectedCategory(null);
    setTags('');
    setAttachedFiles([]);
    setShowPoll(false);
    setPollOptions(['', '']);
    setIsPreview(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getCategoryColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
      green: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
      purple: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
      red: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
      yellow: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
      gray: 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300'
    };
    return colors[color] || colors.gray;
  };

  // Simple markdown to HTML converter
  const renderMarkdown = (text: string) => {
    return text
      .replace(/### (.*?)$/gm, '<h3 class="text-xl font-bold mt-4 mb-2">$1</h3>')
      .replace(/## (.*?)$/gm, '<h2 class="text-2xl font-bold mt-4 mb-2">$1</h2>')
      .replace(/# (.*?)$/gm, '<h1 class="text-3xl font-bold mt-4 mb-2">$1</h1>')
      .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')
      .replace(/\\*(.+?)\\*/g, '<em>$1</em>')
      .replace(/\`(.+?)\`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 rounded">$1</code>')
      .replace(/\\[(.+?)\\]\\((.+?)\\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>')
      .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 italic my-2">$1</blockquote>')
      .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
      .replace(/\\n/g, '<br />');
  };

  if (isPreview) {
    return (
      <div className={cn("space-y-6", className)}>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Preview</h2>
            <Button onClick={() => setIsPreview(false)} variant="outline">
              {backToEditButton}
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title || 'Untitled Post'}</h1>
              {selectedCategory && (
                <span className={\`inline-block px-3 py-1 rounded-full text-sm font-medium \${getCategoryColor(selectedCategory.color)}\`}>
                  {selectedCategory.name}
                </span>
              )}
            </div>

            {tags && (
              <div className="flex flex-wrap gap-2">
                {tags.split(',').map((tag, idx) => (
                  <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-sm">
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            )}

            <div
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content || 'No content') }}
            />

            {attachedFiles.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Attached Files</h3>
                <div className="space-y-2">
                  {attachedFiles.map(file => (
                    <div key={file.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                      <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showPoll && pollOptions.some(o => o.trim()) && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Poll
                </h3>
                <div className="space-y-2">
                  {pollOptions.filter(o => o.trim()).map((option, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input type="radio" name="poll" disabled className="cursor-not-allowed" />
                      <span className="text-gray-700 dark:text-gray-300">{option}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{editorTitle}</h2>
        <p className="text-gray-600 dark:text-gray-400">{editorDescription}</p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {titleLabel} *
            </label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={titlePlaceholder}
              className="w-full"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {categoryLabel} *
            </label>
            <div className="relative">
              <button
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {selectedCategory ? (
                  <span className={\`px-3 py-1 rounded-full text-sm font-medium \${getCategoryColor(selectedCategory.color)}\`}>
                    {selectedCategory.name}
                  </span>
                ) : (
                  <span className="text-gray-500 dark:text-gray-400">{categoryPlaceholder}</span>
                )}
                <FolderOpen className="w-5 h-5 text-gray-400" />
              </button>

              {showCategoryDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowCategoryDropdown(false)} />
                  <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-20 max-h-60 overflow-y-auto">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          setSelectedCategory(category);
                          setShowCategoryDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <span className={\`px-3 py-1 rounded-full text-sm font-medium \${getCategoryColor(category.color)}\`}>
                          {category.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Markdown Toolbar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {contentLabel} *
            </label>
            <div className="flex flex-wrap gap-1 mb-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-t-lg border border-b-0 border-gray-300 dark:border-gray-600">
              <button
                onClick={() => insertMarkdown('bold', 'bold text')}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                title={boldLabel}
                type="button"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                onClick={() => insertMarkdown('italic', 'italic text')}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                title={italicLabel}
                type="button"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                onClick={() => insertMarkdown('code', 'code')}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                title={codeLabel}
                type="button"
              >
                <Code className="w-4 h-4" />
              </button>
              <button
                onClick={() => insertMarkdown('link', 'link text')}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                title={linkLabel}
                type="button"
              >
                <LinkIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => insertMarkdown('heading', 'Heading')}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                title={headingLabel}
                type="button"
              >
                <Heading className="w-4 h-4" />
              </button>
              <button
                onClick={() => insertMarkdown('list', 'list item')}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                title={listLabel}
                type="button"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => insertMarkdown('quote', 'quote text')}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                title={quoteLabel}
                type="button"
              >
                <Quote className="w-4 h-4" />
              </button>
            </div>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={contentPlaceholder}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-b-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              rows={12}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              {tagsLabel}
            </label>
            <Input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder={tagsPlaceholder}
              className="w-full"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Upload className="w-4 h-4" />
              {attachFilesLabel}
            </label>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full"
              type="button"
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploadButton}
            </Button>

            {attachedFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                {attachedFiles.map(file => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                      <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                    </div>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      type="button"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Poll */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            {!showPoll ? (
              <Button onClick={togglePoll} variant="outline" className="w-full" type="button">
                <BarChart3 className="w-4 h-4 mr-2" />
                {createPollButton}
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    {pollOptionsLabel}
                  </label>
                  <button
                    onClick={togglePoll}
                    className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                    type="button"
                  >
                    {removePollButton}
                  </button>
                </div>

                {pollOptions.map((option, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={option}
                      onChange={(e) => updatePollOption(idx, e.target.value)}
                      placeholder={\`Option \${idx + 1}\`}
                      className="flex-1"
                    />
                    {pollOptions.length > 2 && (
                      <button
                        onClick={() => removePollOption(idx)}
                        className="text-gray-500 hover:text-red-600"
                        type="button"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}

                <Button onClick={addPollOption} variant="outline" size="sm" type="button">
                  <Plus className="w-4 h-4 mr-2" />
                  {addPollOptionButton}
                </Button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button onClick={handlePost} className="flex-1" type="button">
              <Send className="w-4 h-4 mr-2" />
              {postButton}
            </Button>
            <Button onClick={handleSaveDraft} variant="outline" type="button">
              <Save className="w-4 h-4 mr-2" />
              {saveDraftButton}
            </Button>
            <Button onClick={() => setIsPreview(true)} variant="outline" type="button">
              <Eye className="w-4 h-4 mr-2" />
              {previewButton}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ForumPostEditor;
    `,

    rich: `
${commonImports}
import {
  Send, Save, Eye, X, Upload, Trash2, Plus, Tag,
  FolderOpen, FileText, Bold, Italic, Underline, Code, Link as LinkIcon,
  List, ListOrdered, Quote, Heading1, Heading2, AlignLeft, AlignCenter, AlignRight, BarChart3, Image as ImageIcon, Sparkles
} from 'lucide-react';

interface Category {
  id: number;
  name: string;
  color: string;
}

interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
}

interface ForumPostEditorProps {
  ${dataName}?: any;
  className?: string;
  onPost?: (post: any) => void;
  onSaveDraft?: (post: any) => void;
}

const ForumPostEditor: React.FC<ForumPostEditorProps> = ({
  ${dataName}: propData,
  className,
  onPost,
  onSaveDraft
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [tags, setTags] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [showPoll, setShowPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [isPreview, setIsPreview] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [formatting, setFormatting] = useState({
    bold: false,
    italic: false,
    underline: false
  });
  const contentRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response[0] : (response?.data?.[0] || response?.data || response);
    },
    enabled: !propData,
    retry: 1,
  });

  // Fetch categories for the dropdown
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get<any>('/categories');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  // Mutation for creating a new post
  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      const response = await api.post<any>('${apiRoute}', postData);
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['${entity}'] });
      if (onPost) onPost(data);
      resetForm();
      navigate('/blog');
    },
    onError: (error: any) => {
      alert(error?.message || 'Failed to create post');
    },
  });

  // Mutation for saving as draft
  const saveDraftMutation = useMutation({
    mutationFn: async (draftData: any) => {
      const response = await api.post<any>('${apiRoute}', { ...draftData, status: 'draft' });
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['${entity}'] });
      if (onSaveDraft) onSaveDraft(data);
      alert('Draft saved successfully!');
    },
    onError: (error: any) => {
      alert(error?.message || 'Failed to save draft');
    },
  });

  const ${dataName} = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const editorData = ${dataName} || {};

  const titleLabel = ${getField('titleLabel')};
  const titlePlaceholder = ${getField('titlePlaceholder')};
  const contentLabel = ${getField('contentLabel')};
  const contentPlaceholder = ${getField('contentPlaceholder')};
  const categoryLabel = ${getField('categoryLabel')};
  const categoryPlaceholder = ${getField('categoryPlaceholder')};
  const tagsLabel = ${getField('tagsLabel')};
  const tagsPlaceholder = ${getField('tagsPlaceholder')};
  const attachFilesLabel = ${getField('attachFilesLabel')};
  const pollOptionsLabel = ${getField('pollOptionsLabel')};
  const addPollOptionButton = ${getField('addPollOptionButton')};
  const removePollButton = ${getField('removePollButton')};
  const createPollButton = ${getField('createPollButton')};
  const postButton = ${getField('postButton')};
  const saveDraftButton = ${getField('saveDraftButton')};
  const previewButton = ${getField('previewButton')};
  const backToEditButton = ${getField('backToEditButton')};
  const uploadButton = ${getField('uploadButton')};
  const boldLabel = ${getField('boldLabel')};
  const italicLabel = ${getField('italicLabel')};
  const underlineLabel = ${getField('underlineLabel')};
  const codeLabel = ${getField('codeLabel')};
  const linkLabel = ${getField('linkLabel')};
  const imageLabel = ${getField('imageLabel')};
  const listLabel = ${getField('listLabel')};
  const quoteLabel = ${getField('quoteLabel')};
  const headingLabel = ${getField('headingLabel')};
  const editorTitle = ${getField('richEditorTitle')};
  const editorDescription = ${getField('richDescription')};
  const categories: Category[] = ${getField('categories')};
  const titleRequiredMessage = ${getField('titleRequiredMessage')};
  const contentRequiredMessage = ${getField('contentRequiredMessage')};
  const categoryRequiredMessage = ${getField('categoryRequiredMessage')};

  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    contentRef.current?.focus();
  };

  const handleContentChange = () => {
    if (contentRef.current) {
      setContent(contentRef.current.innerHTML);
    }
  };

  const handlePost = () => {
    if (!title.trim()) {
      alert(titleRequiredMessage);
      return;
    }

    const textContent = contentRef.current?.textContent || '';
    if (!textContent.trim()) {
      alert(contentRequiredMessage);
      return;
    }

    const post = {
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      content: contentRef.current?.innerHTML || '',
      category_id: selectedCategory?.id,
      tags: tags.split(',').map(t => t.trim()).filter(t => t),
      status: 'published',
    };

    createPostMutation.mutate(post);
  };

  const handleSaveDraft = () => {
    const draft = {
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      content: contentRef.current?.innerHTML || '',
      category_id: selectedCategory?.id,
      tags: tags.split(',').map(t => t.trim()).filter(t => t),
      status: 'draft',
    };

    saveDraftMutation.mutate(draft);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: AttachedFile[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type
    }));

    console.log('Files attached:', newFiles);
    setAttachedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    console.log('File removed:', id);
    setAttachedFiles(prev => prev.filter(f => f.id !== id));
  };

  const addPollOption = () => {
    console.log('Poll option added');
    setPollOptions(prev => [...prev, '']);
  };

  const removePollOption = (index: number) => {
    console.log('Poll option removed:', index);
    setPollOptions(prev => prev.filter((_, i) => i !== index));
  };

  const updatePollOption = (index: number, value: string) => {
    setPollOptions(prev => prev.map((opt, i) => i === index ? value : opt));
  };

  const togglePoll = () => {
    console.log('Poll toggled:', !showPoll);
    setShowPoll(!showPoll);
    if (!showPoll) {
      setPollOptions(['', '']);
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    if (contentRef.current) {
      contentRef.current.innerHTML = '';
    }
    setSelectedCategory(null);
    setTags('');
    setAttachedFiles([]);
    setShowPoll(false);
    setPollOptions(['', '']);
    setIsPreview(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getCategoryColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
      green: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
      purple: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
      red: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
      yellow: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
      gray: 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300'
    };
    return colors[color] || colors.gray;
  };

  if (isPreview) {
    return (
      <div className={cn("space-y-6", className)}>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Preview</h2>
            <Button onClick={() => setIsPreview(false)} variant="outline">
              {backToEditButton}
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title || 'Untitled Post'}</h1>
              {selectedCategory && (
                <span className={\`inline-block px-3 py-1 rounded-full text-sm font-medium \${getCategoryColor(selectedCategory.color)}\`}>
                  {selectedCategory.name}
                </span>
              )}
            </div>

            {tags && (
              <div className="flex flex-wrap gap-2">
                {tags.split(',').map((tag, idx) => (
                  <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-sm">
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            )}

            <div
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: content || '<p class="text-gray-500">No content</p>' }}
            />

            {attachedFiles.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Attached Files</h3>
                <div className="space-y-2">
                  {attachedFiles.map(file => (
                    <div key={file.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                      <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showPoll && pollOptions.some(o => o.trim()) && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Poll
                </h3>
                <div className="space-y-2">
                  {pollOptions.filter(o => o.trim()).map((option, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input type="radio" name="poll" disabled className="cursor-not-allowed" />
                      <span className="text-gray-700 dark:text-gray-300">{option}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{editorTitle}</h2>
        <p className="text-gray-600 dark:text-gray-400">{editorDescription}</p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {titleLabel} *
            </label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={titlePlaceholder}
              className="w-full"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {categoryLabel} *
            </label>
            <div className="relative">
              <button
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                type="button"
              >
                {selectedCategory ? (
                  <span className={\`px-3 py-1 rounded-full text-sm font-medium \${getCategoryColor(selectedCategory.color)}\`}>
                    {selectedCategory.name}
                  </span>
                ) : (
                  <span className="text-gray-500 dark:text-gray-400">{categoryPlaceholder}</span>
                )}
                <FolderOpen className="w-5 h-5 text-gray-400" />
              </button>

              {showCategoryDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowCategoryDropdown(false)} />
                  <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-20 max-h-60 overflow-y-auto">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          setSelectedCategory(category);
                          setShowCategoryDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        type="button"
                      >
                        <span className={\`px-3 py-1 rounded-full text-sm font-medium \${getCategoryColor(category.color)}\`}>
                          {category.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Rich Text Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {contentLabel} *
            </label>

            {/* Rich Text Toolbar */}
            <div className="flex flex-wrap gap-1 mb-0 p-2 bg-gray-50 dark:bg-gray-800 rounded-t-lg border border-b-0 border-gray-300 dark:border-gray-600">
              <button onClick={() => execCommand('bold')} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors" title={boldLabel} type="button">
                <Bold className="w-4 h-4" />
              </button>
              <button onClick={() => execCommand('italic')} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors" title={italicLabel} type="button">
                <Italic className="w-4 h-4" />
              </button>
              <button onClick={() => execCommand('underline')} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors" title={underlineLabel} type="button">
                <Underline className="w-4 h-4" />
              </button>
              <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />
              <button onClick={() => execCommand('formatBlock', '<h1>')} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors" title="Heading 1" type="button">
                <Heading1 className="w-4 h-4" />
              </button>
              <button onClick={() => execCommand('formatBlock', '<h2>')} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors" title="Heading 2" type="button">
                <Heading2 className="w-4 h-4" />
              </button>
              <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />
              <button onClick={() => execCommand('insertUnorderedList')} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors" title="Bullet List" type="button">
                <List className="w-4 h-4" />
              </button>
              <button onClick={() => execCommand('insertOrderedList')} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors" title="Numbered List" type="button">
                <ListOrdered className="w-4 h-4" />
              </button>
              <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />
              <button onClick={() => execCommand('justifyLeft')} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors" title="Align Left" type="button">
                <AlignLeft className="w-4 h-4" />
              </button>
              <button onClick={() => execCommand('justifyCenter')} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors" title="Align Center" type="button">
                <AlignCenter className="w-4 h-4" />
              </button>
              <button onClick={() => execCommand('justifyRight')} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors" title="Align Right" type="button">
                <AlignRight className="w-4 h-4" />
              </button>
              <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />
              <button
                onClick={() => {
                  const url = prompt('Enter link URL:');
                  if (url) execCommand('createLink', url);
                }}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                title={linkLabel}
                type="button"
              >
                <LinkIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  const url = prompt('Enter image URL:');
                  if (url) execCommand('insertImage', url);
                }}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                title={imageLabel}
                type="button"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
              <button onClick={() => execCommand('formatBlock', '<blockquote>')} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors" title={quoteLabel} type="button">
                <Quote className="w-4 h-4" />
              </button>
            </div>

            {/* Editable Content Area */}
            <div
              ref={contentRef}
              contentEditable
              onInput={handleContentChange}
              className="w-full min-h-[300px] p-4 border border-gray-300 dark:border-gray-600 rounded-b-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 prose dark:prose-invert max-w-none"
              data-placeholder={contentPlaceholder}
              suppressContentEditableWarning
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              {tagsLabel}
            </label>
            <Input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder={tagsPlaceholder}
              className="w-full"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Upload className="w-4 h-4" />
              {attachFilesLabel}
            </label>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full"
              type="button"
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploadButton}
            </Button>

            {attachedFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                {attachedFiles.map(file => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                      <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                    </div>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      type="button"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Poll */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            {!showPoll ? (
              <Button onClick={togglePoll} variant="outline" className="w-full" type="button">
                <BarChart3 className="w-4 h-4 mr-2" />
                {createPollButton}
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    {pollOptionsLabel}
                  </label>
                  <button
                    onClick={togglePoll}
                    className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                    type="button"
                  >
                    {removePollButton}
                  </button>
                </div>

                {pollOptions.map((option, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={option}
                      onChange={(e) => updatePollOption(idx, e.target.value)}
                      placeholder={\`Option \${idx + 1}\`}
                      className="flex-1"
                    />
                    {pollOptions.length > 2 && (
                      <button
                        onClick={() => removePollOption(idx)}
                        className="text-gray-500 hover:text-red-600"
                        type="button"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}

                <Button onClick={addPollOption} variant="outline" size="sm" type="button">
                  <Plus className="w-4 h-4 mr-2" />
                  {addPollOptionButton}
                </Button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button onClick={handlePost} className="flex-1" type="button">
              <Send className="w-4 h-4 mr-2" />
              {postButton}
            </Button>
            <Button onClick={handleSaveDraft} variant="outline" type="button">
              <Save className="w-4 h-4 mr-2" />
              {saveDraftButton}
            </Button>
            <Button onClick={() => setIsPreview(true)} variant="outline" type="button">
              <Eye className="w-4 h-4 mr-2" />
              {previewButton}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ForumPostEditor;
    `
  };

  return variants[variant] || variants.basic;
};
