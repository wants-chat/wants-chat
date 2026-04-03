import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateMentionsTagsSystem = (
  resolved: ResolvedComponent,
  variant: 'inline' | 'autocomplete' | 'highlighted' = 'inline'
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
    return `/${dataSource || 'mentions'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'mentions';

  const commonImports = `
import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';`;

  const variants = {
    inline: `
${commonImports}
import { AtSign, Hash, Send, User, CheckCircle } from 'lucide-react';

interface UserSuggestion {
  id: number;
  name: string;
  username: string;
  avatar: string;
  title: string;
  verified: boolean;
}

interface HashtagSuggestion {
  id: number;
  tag: string;
  count: number;
  trending: boolean;
}

interface InlineMentionsProps {
  ${dataName}?: any;
  className?: string;
  onPost?: (content: string, mentions: string[], hashtags: string[]) => void;
}

const InlineMentions: React.FC<InlineMentionsProps> = ({ ${dataName}: propData, className, onPost }) => {
  const [content, setContent] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionType, setSuggestionType] = useState<'user' | 'hashtag' | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();

  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${apiRoute}');
        return response?.data || response;
      } catch (err) {
        console.error('Failed to fetch mentions data:', err);
        return {};
      }
    },
    enabled: !propData,
    retry: 1,
  });

  // Mutation for posting content
  const postMutation = useMutation({
    mutationFn: async (postData: { content: string; mentions: string[]; hashtags: string[] }) => {
      const response = await api.post<any>('${apiRoute}', postData);
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['${entity}'] });
      if (onPost) onPost(content, [], []);
    },
  });

  // Use prop data if available, otherwise use fetched data
  const ${dataName} = propData || fetchedData || {};

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="ml-2 text-gray-500">Loading...</p>
      </div>
    );
  }

  const mentionData = ${dataName} || {};

  const title = ${getField('inlineTitle')};
  const subtitle = ${getField('inlineSubtitle')};
  const textareaPlaceholder = ${getField('textareaPlaceholder')};
  const postButton = ${getField('postButton')};
  const userSuggestions = ${getField('userSuggestions')};
  const hashtagSuggestions = ${getField('hashtagSuggestions')};
  const noSuggestionsLabel = ${getField('noSuggestionsLabel')};

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart || 0;

    setContent(value);
    setCursorPosition(cursorPos);

    // Get text before cursor
    const textBeforeCursor = value.substring(0, cursorPos);
    const words = textBeforeCursor.split(/\\s/);
    const currentWord = words[words.length - 1];

    // Check for @ mention
    if (currentWord.startsWith('@') && currentWord.length > 0) {
      const query = currentWord.substring(1).toLowerCase();
      const filtered = userSuggestions.filter((user: UserSuggestion) =>
        user.username.toLowerCase().includes(query) ||
        user.name.toLowerCase().includes(query)
      );
      setSuggestions(filtered);
      setSuggestionType('user');
      setShowSuggestions(true);
      setSelectedIndex(0);
    }
    // Check for # hashtag
    else if (currentWord.startsWith('#') && currentWord.length > 0) {
      const query = currentWord.substring(1).toLowerCase();
      const filtered = hashtagSuggestions.filter((tag: HashtagSuggestion) =>
        tag.tag.toLowerCase().includes(query)
      );
      setSuggestions(filtered);
      setSuggestionType('hashtag');
      setShowSuggestions(true);
      setSelectedIndex(0);
    } else {
      setShowSuggestions(false);
      setSuggestionType(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter' && suggestions.length > 0) {
      e.preventDefault();
      insertSuggestion(suggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const insertSuggestion = (suggestion: UserSuggestion | HashtagSuggestion) => {
    const textBeforeCursor = content.substring(0, cursorPosition);
    const textAfterCursor = content.substring(cursorPosition);
    const words = textBeforeCursor.split(/\\s/);
    const lastWordIndex = textBeforeCursor.lastIndexOf(words[words.length - 1]);

    let replacement = '';
    if (suggestionType === 'user') {
      replacement = \`@\${(suggestion as UserSuggestion).username} \`;
    } else {
      replacement = \`#\${(suggestion as HashtagSuggestion).tag} \`;
    }

    const newContent = textBeforeCursor.substring(0, lastWordIndex) + replacement + textAfterCursor;
    setContent(newContent);
    setShowSuggestions(false);

    // Move cursor
    const newCursorPos = lastWordIndex + replacement.length;
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const extractMentionsAndHashtags = (text: string) => {
    const mentions = (text.match(/@(\\w+)/g) || []).map(m => m.substring(1));
    const hashtags = (text.match(/#(\\w+)/g) || []).map(h => h.substring(1));
    return { mentions, hashtags };
  };

  const handlePost = () => {
    if (!content.trim()) return;

    const { mentions, hashtags } = extractMentionsAndHashtags(content);

    // Submit via API mutation
    postMutation.mutate({ content, mentions, hashtags });
    setContent('');
  };

  return (
    <div className={cn("", className)}>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>

      <Card className="p-6">
        <div className="relative">
          <div className="flex items-start gap-2 mb-2">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={handleContentChange}
                onKeyDown={handleKeyDown}
                placeholder={textareaPlaceholder}
                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
              />

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <Card className="absolute bottom-full left-0 mb-2 w-full max-h-64 overflow-y-auto shadow-lg z-10">
                  {suggestionType === 'user' ? (
                    suggestions.map((user: UserSuggestion, index: number) => (
                      <div
                        key={user.id}
                        onClick={() => insertSuggestion(user)}
                        className={cn(
                          "flex items-center gap-3 p-3 cursor-pointer transition-colors",
                          index === selectedIndex ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-800"
                        )}
                      >
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                              {user.name}
                            </p>
                            {user.verified && (
                              <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            @{user.username} • {user.title}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    suggestions.map((tag: HashtagSuggestion, index: number) => (
                      <div
                        key={tag.id}
                        onClick={() => insertSuggestion(tag)}
                        className={cn(
                          "flex items-center justify-between p-3 cursor-pointer transition-colors",
                          index === selectedIndex ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-800"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {tag.tag}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {tag.count.toLocaleString()} posts
                          </span>
                          {tag.trending && (
                            <span className="text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-2 py-0.5 rounded">
                              Trending
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </Card>
              )}

              {showSuggestions && suggestions.length === 0 && (
                <Card className="absolute bottom-full left-0 mb-2 w-full p-4 shadow-lg z-10">
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    {noSuggestionsLabel}
                  </p>
                </Card>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <AtSign className="h-4 w-4" />
                <span>Type @ to mention</span>
              </div>
              <div className="flex items-center gap-1">
                <Hash className="h-4 w-4" />
                <span>Type # for hashtag</span>
              </div>
            </div>
            <button
              onClick={handlePost}
              disabled={!content.trim()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              {postButton}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default InlineMentions;
    `,

    autocomplete: `
${commonImports}
import { AtSign, Hash, X, CheckCircle, TrendingUp } from 'lucide-react';

interface UserSuggestion {
  id: number;
  name: string;
  username: string;
  avatar: string;
  title: string;
  verified: boolean;
}

interface HashtagSuggestion {
  id: number;
  tag: string;
  count: number;
  trending: boolean;
}

interface AutocompleteMentionsProps {
  ${dataName}?: any;
  className?: string;
  onSubmit?: (content: string, mentions: string[], hashtags: string[]) => void;
}

const AutocompleteMentions: React.FC<AutocompleteMentionsProps> = ({ ${dataName}: propData, className, onSubmit }) => {
  const [content, setContent] = useState('');
  const [selectedMentions, setSelectedMentions] = useState<UserSuggestion[]>([]);
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  const [showUserSuggestions, setShowUserSuggestions] = useState(false);
  const [showHashtagSuggestions, setShowHashtagSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${apiRoute}');
        return response?.data || response;
      } catch (err) {
        console.error('Failed to fetch mentions data:', err);
        return {};
      }
    },
    enabled: !propData,
    retry: 1,
  });

  // Mutation for submitting content
  const submitMutation = useMutation({
    mutationFn: async (submitData: { content: string; mentions: string[]; hashtags: string[] }) => {
      const response = await api.post<any>('${apiRoute}', submitData);
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['${entity}'] });
      if (onSubmit) onSubmit(content, selectedMentions.map(m => m.username), selectedHashtags);
    },
  });

  // Use prop data if available, otherwise use fetched data
  const ${dataName} = propData || fetchedData || {};

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className={cn("max-w-2xl mx-auto flex items-center justify-center py-12", className)}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="ml-2 text-gray-500">Loading...</p>
      </div>
    );
  }

  const mentionData = ${dataName} || {};

  const title = ${getField('autocompleteTitle')};
  const subtitle = ${getField('autocompleteSubtitle')};
  const commentPlaceholder = ${getField('commentPlaceholder')};
  const sendButton = ${getField('sendButton')};
  const userSuggestions = ${getField('userSuggestions')};
  const hashtagSuggestions = ${getField('hashtagSuggestions')};
  const recentLabel = ${getField('recentLabel')};
  const trendingLabel = ${getField('trendingLabel')};

  const addMention = (user: UserSuggestion) => {
    if (!selectedMentions.find(m => m.id === user.id)) {
      setSelectedMentions(prev => [...prev, user]);
    }
    setShowUserSuggestions(false);
  };

  const removeMention = (userId: number) => {
    setSelectedMentions(prev => prev.filter(m => m.id !== userId));
  };

  const addHashtag = (tag: string) => {
    if (!selectedHashtags.includes(tag)) {
      setSelectedHashtags(prev => [...prev, tag]);
    }
    setShowHashtagSuggestions(false);
  };

  const removeHashtag = (tag: string) => {
    setSelectedHashtags(prev => prev.filter(t => t !== tag));
  };

  const handleSubmit = () => {
    if (!content.trim() && selectedMentions.length === 0 && selectedHashtags.length === 0) return;

    const mentions = selectedMentions.map(m => m.username);

    // Submit via API mutation
    submitMutation.mutate({ content, mentions, hashtags: selectedHashtags });

    setContent('');
    setSelectedMentions([]);
    setSelectedHashtags([]);
  };

  return (
    <div className={cn("max-w-2xl mx-auto", className)}>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>

      <Card className="p-6">
        {/* Selected Mentions */}
        {selectedMentions.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mentioned Users:
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedMentions.map(user => (
                <div
                  key={user.id}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium">@{user.username}</span>
                  <button
                    onClick={() => removeMention(user.id)}
                    className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Hashtags */}
        {selectedHashtags.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hashtags:
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedHashtags.map(tag => (
                <div
                  key={tag}
                  className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full"
                >
                  <Hash className="h-3 w-3" />
                  <span className="text-sm font-medium">{tag}</span>
                  <button
                    onClick={() => removeHashtag(tag)}
                    className="hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="mb-4">
          <textarea
            ref={inputRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={commentPlaceholder}
            className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <button
              onClick={() => setShowUserSuggestions(!showUserSuggestions)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <AtSign className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Add Mention</span>
            </button>

            {showUserSuggestions && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserSuggestions(false)}
                />
                <Card className="absolute top-full left-0 mt-2 w-80 max-h-64 overflow-y-auto shadow-lg z-20">
                  <div className="p-2">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-2">
                      {recentLabel}
                    </p>
                    {userSuggestions.map((user: UserSuggestion) => (
                      <button
                        key={user.id}
                        onClick={() => addMention(user)}
                        disabled={selectedMentions.some(m => m.id === user.id)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1 text-left min-w-0">
                          <div className="flex items-center gap-1">
                            <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                              {user.name}
                            </p>
                            {user.verified && (
                              <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            @{user.username}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </Card>
              </>
            )}
          </div>

          <div className="relative flex-1">
            <button
              onClick={() => setShowHashtagSuggestions(!showHashtagSuggestions)}
              className="w-full flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Hash className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Add Hashtag</span>
            </button>

            {showHashtagSuggestions && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowHashtagSuggestions(false)}
                />
                <Card className="absolute top-full left-0 mt-2 w-80 max-h-64 overflow-y-auto shadow-lg z-20">
                  <div className="p-2">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-2">
                      {trendingLabel}
                    </p>
                    {hashtagSuggestions.map((tag: HashtagSuggestion) => (
                      <button
                        key={tag.id}
                        onClick={() => addHashtag(tag.tag)}
                        disabled={selectedHashtags.includes(tag.tag)}
                        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {tag.tag}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {tag.count.toLocaleString()}
                          </span>
                          {tag.trending && (
                            <TrendingUp className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </Card>
              </>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!content.trim() && selectedMentions.length === 0 && selectedHashtags.length === 0}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sendButton}
        </button>
      </Card>
    </div>
  );
};

export default AutocompleteMentions;
    `,

    highlighted: `
${commonImports}
import { User, Hash, ExternalLink } from 'lucide-react';

interface HighlightedMentionsProps {
  ${dataName}?: any;
  className?: string;
  onMentionClick?: (username: string) => void;
  onHashtagClick?: (hashtag: string) => void;
}

const HighlightedMentions: React.FC<HighlightedMentionsProps> = ({
  ${dataName}: propData,
  className,
  onMentionClick,
  onHashtagClick
}) => {
  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${apiRoute}');
        return response?.data || response;
      } catch (err) {
        console.error('Failed to fetch mentions data:', err);
        return {};
      }
    },
    enabled: !propData,
    retry: 1,
  });

  // Use prop data if available, otherwise use fetched data
  const ${dataName} = propData || fetchedData || {};

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className={cn("max-w-2xl mx-auto flex items-center justify-center py-12", className)}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="ml-2 text-gray-500">Loading...</p>
      </div>
    );
  }

  const mentionData = ${dataName} || {};

  const title = ${getField('highlightedTitle')};
  const subtitle = ${getField('highlightedSubtitle')};
  const sampleContent = ${getField('sampleContent')};

  const parseContent = (text: string) => {
    const parts: { type: 'text' | 'mention' | 'hashtag'; content: string }[] = [];
    const regex = /(@\\w+)|(#\\w+)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Add text before match
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.substring(lastIndex, match.index)
        });
      }

      // Add match
      if (match[1]) {
        // Mention
        parts.push({
          type: 'mention',
          content: match[1]
        });
      } else if (match[2]) {
        // Hashtag
        parts.push({
          type: 'hashtag',
          content: match[2]
        });
      }

      lastIndex = regex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex)
      });
    }

    return parts;
  };

  const handleMentionClick = (mention: string) => {
    const username = mention.substring(1); // Remove @
    if (onMentionClick) {
      onMentionClick(username);
    } else {
      console.log('Mention clicked:', username);
    }
  };

  const handleHashtagClick = (hashtag: string) => {
    const tag = hashtag.substring(1); // Remove #
    if (onHashtagClick) {
      onHashtagClick(tag);
    } else {
      console.log('Hashtag clicked:', tag);
    }
  };

  const parts = parseContent(sampleContent);

  return (
    <div className={cn("max-w-2xl mx-auto", className)}>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          {/* Example 1: Inline highlighting */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              Inline Highlighting
            </h3>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-gray-900 dark:text-white leading-relaxed">
                {parts.map((part, index) => {
                  if (part.type === 'mention') {
                    return (
                      <button
                        key={index}
                        onClick={() => handleMentionClick(part.content)}
                        className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        {part.content}
                      </button>
                    );
                  } else if (part.type === 'hashtag') {
                    return (
                      <button
                        key={index}
                        onClick={() => handleHashtagClick(part.content)}
                        className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
                      >
                        {part.content}
                      </button>
                    );
                  }
                  return <span key={index}>{part.content}</span>;
                })}
              </p>
            </div>
          </div>

          {/* Example 2: Badge style */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              Badge Style
            </h3>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-gray-900 dark:text-white leading-relaxed">
                {parts.map((part, index) => {
                  if (part.type === 'mention') {
                    return (
                      <button
                        key={index}
                        onClick={() => handleMentionClick(part.content)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 mx-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                      >
                        <User className="h-3 w-3" />
                        <span className="text-sm font-medium">{part.content}</span>
                      </button>
                    );
                  } else if (part.type === 'hashtag') {
                    return (
                      <button
                        key={index}
                        onClick={() => handleHashtagClick(part.content)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 mx-0.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                      >
                        <Hash className="h-3 w-3" />
                        <span className="text-sm font-medium">{part.content}</span>
                      </button>
                    );
                  }
                  return <span key={index}>{part.content}</span>;
                })}
              </p>
            </div>
          </div>

          {/* Example 3: Tooltip style */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              With Icons
            </h3>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-gray-900 dark:text-white leading-relaxed">
                {parts.map((part, index) => {
                  if (part.type === 'mention') {
                    return (
                      <button
                        key={index}
                        onClick={() => handleMentionClick(part.content)}
                        className="inline-flex items-center gap-0.5 text-blue-600 dark:text-blue-400 hover:underline font-medium group"
                      >
                        <User className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {part.content}
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    );
                  } else if (part.type === 'hashtag') {
                    return (
                      <button
                        key={index}
                        onClick={() => handleHashtagClick(part.content)}
                        className="inline-flex items-center gap-0.5 text-purple-600 dark:text-purple-400 hover:underline font-medium group"
                      >
                        <Hash className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {part.content}
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    );
                  }
                  return <span key={index}>{part.content}</span>;
                })}
              </p>
            </div>
          </div>

          {/* Example 4: Highlighted background */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              Highlighted Background
            </h3>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-gray-900 dark:text-white leading-relaxed">
                {parts.map((part, index) => {
                  if (part.type === 'mention') {
                    return (
                      <button
                        key={index}
                        onClick={() => handleMentionClick(part.content)}
                        className="px-1 bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-100 hover:bg-blue-300 dark:hover:bg-blue-800 rounded font-medium transition-colors"
                      >
                        {part.content}
                      </button>
                    );
                  } else if (part.type === 'hashtag') {
                    return (
                      <button
                        key={index}
                        onClick={() => handleHashtagClick(part.content)}
                        className="px-1 bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-100 hover:bg-purple-300 dark:hover:bg-purple-800 rounded font-medium transition-colors"
                      >
                        {part.content}
                      </button>
                    );
                  }
                  return <span key={index}>{part.content}</span>;
                })}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default HighlightedMentions;
    `
  };

  return variants[variant] || variants.inline;
};
