import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generatePostComposer = (
  resolved: ResolvedComponent,
  variant: 'inline' | 'modal' | 'expanded' = 'inline'
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

  const variants = {
    inline: `
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Image, Smile, Video, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PostComposerProps {
  ${dataName}?: any;
  className?: string;
  onPost?: (content: string) => void;
}

export default function PostComposer({ ${dataName}: propData, className, onPost }: PostComposerProps) {
  const [content, setContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const queryClient = useQueryClient();

  // Mutation for creating a new post
  const createPostMutation = useMutation({
    mutationFn: async (postData: { content: string }) => {
      const response = await api.post<any>('${apiRoute}', postData);
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['${entity}'] });
      if (onPost) onPost(content);
      setContent('');
      setIsFocused(false);
    },
    onError: (error: any) => {
      console.error('Failed to create post:', error);
      alert(error?.message || 'Failed to create post');
    },
  });

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response[0] : (response?.data?.[0] || response?.data || response);
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

  const composerData = ${dataName} || {};

  const userAvatar = ${getField('userAvatar')};
  const placeholder = ${getField('placeholder')};
  const characterLimit = ${getField('characterLimit')};
  const postButton = ${getField('postButton')};
  const charactersRemainingLabel = ${getField('charactersRemainingLabel')};

  const remainingChars = characterLimit - content.length;
  const isOverLimit = remainingChars < 0;

  const handlePost = () => {
    if (content.trim() && !isOverLimit) {
      createPostMutation.mutate({ content });
    }
  };

  const handleMediaClick = (type: string) => {
    console.log(\`Add \${type} clicked\`);
  };

  return (
    <div className={cn("bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4", className)}>
      <div className="flex gap-3">
        <img
          src={userAvatar}
          alt="Your avatar"
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder={placeholder}
            className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:outline-none"
            rows={isFocused ? 4 : 2}
          />

          {(isFocused || content) && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleMediaClick('image')}
                    className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                    title="Add image"
                  >
                    <Image className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleMediaClick('video')}
                    className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                    title="Add video"
                  >
                    <Video className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleMediaClick('emoji')}
                    className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                    title="Add emoji"
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span className={cn(
                    "text-sm",
                    isOverLimit ? "text-red-500" : remainingChars < 20 ? "text-orange-500" : "text-gray-500 dark:text-gray-400"
                  )}>
                    {remainingChars}
                  </span>
                  <Button
                    onClick={handlePost}
                    disabled={!content.trim() || isOverLimit}
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {postButton}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
    `,

    modal: `
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { X, Image, Smile, Video, Globe, Users, Lock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PostComposerProps {
  ${dataName}?: any;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
  onPost?: (content: string, visibility: string) => void;
}

export default function PostComposer({ ${dataName}: propData, className, isOpen = true, onClose, onPost }: PostComposerProps) {
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);
  const queryClient = useQueryClient();

  // Mutation for creating a new post
  const createPostMutation = useMutation({
    mutationFn: async (postData: { content: string; visibility: string }) => {
      const response = await api.post<any>('${apiRoute}', postData);
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['${entity}'] });
      if (onPost) onPost(content, visibility);
      setContent('');
      if (onClose) onClose();
    },
    onError: (error: any) => {
      console.error('Failed to create post:', error);
      alert(error?.message || 'Failed to create post');
    },
  });

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response[0] : (response?.data?.[0] || response?.data || response);
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

  const composerData = ${dataName} || {};

  const userAvatar = ${getField('userAvatar')};
  const userName = ${getField('userName')};
  const placeholder = ${getField('placeholder')};
  const characterLimit = ${getField('characterLimit')};
  const postButton = ${getField('postButton')};
  const cancelButton = ${getField('cancelButton')};
  const visibilityOptions = ${getField('visibilityOptions')};
  const visibilityLabel = ${getField('visibilityLabel')};
  const defaultVisibility = ${getField('defaultVisibility')};

  // Update visibility when default changes
  React.useEffect(() => {
    if (defaultVisibility && visibility === 'public') {
      setVisibility(defaultVisibility);
    }
  }, [defaultVisibility]);

  const remainingChars = characterLimit - content.length;
  const isOverLimit = remainingChars < 0;

  const handlePost = () => {
    if (content.trim() && !isOverLimit) {
      createPostMutation.mutate({ content, visibility });
    }
  };

  const handleCancel = () => {
    setContent('');
    if (onClose) {
      onClose();
    }
  };

  const getVisibilityIcon = (value: string) => {
    switch(value) {
      case 'public': return Globe;
      case 'followers': return Users;
      case 'private': return Lock;
      default: return Globe;
    }
  };

  const currentVisibility = visibilityOptions.find((opt: any) => opt.value === visibility);
  const VisibilityIcon = currentVisibility ? getVisibilityIcon(currentVisibility.value) : Globe;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/50">
      <div className={cn("bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl", className)}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Create Post</h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <img
              src={userAvatar}
              alt={userName}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p className="font-bold text-gray-900 dark:text-white">{userName}</p>
              <div className="relative">
                <button
                  onClick={() => setShowVisibilityMenu(!showVisibilityMenu)}
                  className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <VisibilityIcon className="w-3 h-3" />
                  <span>{currentVisibility?.label || 'Public'}</span>
                </button>
                {showVisibilityMenu && (
                  <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                    {visibilityOptions.map((option: any) => {
                      const Icon = getVisibilityIcon(option.value);
                      return (
                        <button
                          key={option.value}
                          onClick={() => {
                            setVisibility(option.value);
                            setShowVisibilityMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-sm">{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Composer */}
        <div className="p-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            className="w-full h-32 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:outline-none text-lg"
            autoFocus
          />

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <button className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors">
                <Image className="w-5 h-5" />
              </button>
              <button className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors">
                <Video className="w-5 h-5" />
              </button>
              <button className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors">
                <Smile className="w-5 h-5" />
              </button>
            </div>

            <span className={cn(
              "text-sm",
              isOverLimit ? "text-red-500" : remainingChars < 20 ? "text-orange-500" : "text-gray-500 dark:text-gray-400"
            )}>
              {remainingChars}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={handleCancel}
            variant="outline"
            className="dark:border-gray-600 dark:text-gray-300"
          >
            {cancelButton}
          </Button>
          <Button
            onClick={handlePost}
            disabled={!content.trim() || isOverLimit}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {postButton}
          </Button>
        </div>
      </div>
    </div>
  );
}
    `,

    expanded: `
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Image, Smile, Video, Film, BarChart2, Calendar, X, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PostComposerProps {
  ${dataName}?: any;
  className?: string;
  onPost?: (data: any) => void;
}

export default function PostComposer({ ${dataName}: propData, className, onPost }: PostComposerProps) {
  const [content, setContent] = useState('');
  const [showPoll, setShowPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Mutation for creating a new post
  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      const response = await api.post<any>('${apiRoute}', postData);
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['${entity}'] });
      if (onPost) onPost(data);
      setContent('');
      setShowPoll(false);
      setPollOptions(['', '']);
      setMediaPreview(null);
    },
    onError: (error: any) => {
      console.error('Failed to create post:', error);
      alert(error?.message || 'Failed to create post');
    },
  });

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response[0] : (response?.data?.[0] || response?.data || response);
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

  const composerData = ${dataName} || {};

  const userAvatar = ${getField('userAvatar')};
  const placeholder = ${getField('placeholder')};
  const characterLimit = ${getField('extendedCharacterLimit')};
  const postButton = ${getField('postButton')};
  const addPollButton = ${getField('addPollButton')};
  const removePollButton = ${getField('removePollButton')};
  const pollQuestion = ${getField('pollQuestion')};
  const pollOption = ${getField('pollOption')};

  const remainingChars = characterLimit - content.length;
  const isOverLimit = remainingChars < 0;

  const handlePost = () => {
    if (content.trim() && !isOverLimit) {
      const postData = {
        content,
        poll: showPoll ? { options: pollOptions.filter(o => o.trim()) } : null,
        media: mediaPreview
      };
      createPostMutation.mutate(postData);
    }
  };

  const handleMediaUpload = (type: string) => {
    console.log(\`Upload \${type}\`);
    if (type === 'image') {
      setMediaPreview('https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop');
    }
  };

  const handleAddPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const handleRemovePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const handlePollOptionChange = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  return (
    <div className={cn("bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700", className)}>
      <div className="p-6">
        <div className="flex gap-4">
          <img
            src={userAvatar}
            alt="Your avatar"
            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
          />
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholder}
              className="w-full h-32 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:outline-none text-lg"
            />

            {/* Media Preview */}
            {mediaPreview && (
              <div className="relative mt-4 rounded-lg overflow-hidden">
                <img src={mediaPreview} alt="Preview" className="w-full max-h-80 object-cover" />
                <button
                  onClick={() => setMediaPreview(null)}
                  className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Poll */}
            {showPoll && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-gray-900 dark:text-white">Poll</h4>
                  <button
                    onClick={() => setShowPoll(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-2">
                  {pollOptions.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handlePollOptionChange(index, e.target.value)}
                        placeholder={\`\${pollOption} \${index + 1}\`}
                        className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {pollOptions.length > 2 && (
                        <button
                          onClick={() => handleRemovePollOption(index)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  {pollOptions.length < 4 && (
                    <button
                      onClick={handleAddPollOption}
                      className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-bold"
                    >
                      <Plus className="w-4 h-4" />
                      Add option
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Media Options */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMediaUpload('image')}
                    className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                    title="Add image"
                  >
                    <Image className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleMediaUpload('video')}
                    className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                    title="Add video"
                  >
                    <Video className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleMediaUpload('gif')}
                    className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                    title="Add GIF"
                  >
                    <Film className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowPoll(!showPoll)}
                    className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                    title="Add poll"
                  >
                    <BarChart2 className="w-5 h-5" />
                  </button>
                  <button
                    className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                    title="Add emoji"
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                  <button
                    className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                    title="Schedule post"
                  >
                    <Calendar className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span className={cn(
                    "text-sm",
                    isOverLimit ? "text-red-500" : remainingChars < 50 ? "text-orange-500" : "text-gray-500 dark:text-gray-400"
                  )}>
                    {remainingChars}
                  </span>
                  <Button
                    onClick={handlePost}
                    disabled={!content.trim() || isOverLimit}
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {postButton}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
    `
  };

  return variants[variant] || variants.inline;
};
