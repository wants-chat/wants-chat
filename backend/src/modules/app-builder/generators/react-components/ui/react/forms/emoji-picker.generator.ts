import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateEmojiPicker = (
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
import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Smile, Clock, X, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';`;

  const variants = {
    dropdown: `
${commonImports}

interface EmojiPickerDropdownProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onEmojiSelect?: (emoji: string) => void;
}

const EmojiPickerDropdown: React.FC<EmojiPickerDropdownProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className, onEmojiSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('smileys');
  const [recentEmojis, setRecentEmojis] = useState<string[]>([]);
  const [selectedSkinTone, setSelectedSkinTone] = useState('default');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

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

  const emojiData = propData || fetchedData || {};

  const searchPlaceholder = ${getField('searchPlaceholder')};
  const categories = ${getField('categories')};
  const emojis = ${getField('emojis')};
  const recentLabel = ${getField('recentLabel')};
  const noResultsText = ${getField('noResultsText')};
  const skinTones = ${getField('skinTones')};

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
      if (event.key === '/' && isOpen) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect?.(emoji);
    setRecentEmojis(prev => {
      const filtered = prev.filter(e => e !== emoji);
      return [emoji, ...filtered].slice(0, 16);
    });
    setIsOpen(false);
    setSearchQuery('');
  };

  const getFilteredEmojis = () => {
    if (!searchQuery) {
      return emojis[selectedCategory] || [];
    }
    return Object.values(emojis).flat().filter((emoji: any) =>
      emoji.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredEmojis = getFilteredEmojis();

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center gap-2"
      >
        <Smile className="h-5 w-5" />
        <span>Add Emoji</span>
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 left-0 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50">
          {/* Search */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex gap-1 p-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            {categories.map((cat: any) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSearchQuery('');
                }}
                className={\`px-3 py-2 rounded-lg text-xl transition-colors \${
                  selectedCategory === cat.id
                    ? 'bg-blue-100 dark:bg-blue-900'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }\`}
                title={cat.name}
              >
                {cat.icon}
              </button>
            ))}
          </div>

          {/* Skin Tone Selector */}
          <div className="flex gap-1 p-2 border-b border-gray-200 dark:border-gray-700">
            {skinTones.map((tone: any) => (
              <button
                key={tone.id}
                onClick={() => setSelectedSkinTone(tone.id)}
                className={\`w-6 h-6 rounded-full border-2 transition-all \${
                  selectedSkinTone === tone.id
                    ? 'border-blue-500 scale-110'
                    : 'border-gray-300 dark:border-gray-600'
                }\`}
                style={{ backgroundColor: tone.color }}
                title={tone.name}
              />
            ))}
          </div>

          {/* Emoji Grid */}
          <div className="p-2 max-h-64 overflow-y-auto">
            {recentEmojis.length > 0 && !searchQuery && selectedCategory === 'smileys' && (
              <div className="mb-4">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 px-2">
                  {recentLabel}
                </div>
                <div className="grid grid-cols-8 gap-1">
                  {recentEmojis.map((emoji, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleEmojiClick(emoji)}
                      className="text-2xl p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {filteredEmojis.length > 0 ? (
              <div className="grid grid-cols-8 gap-1">
                {filteredEmojis.map((emoji: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => handleEmojiClick(emoji)}
                    className="text-2xl p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {noResultsText}
              </div>
            )}
          </div>

          {/* Keyboard Shortcuts */}
          <div className="p-2 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 flex gap-3">
              <span>Press / to search</span>
              <span>Esc to close</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmojiPickerDropdown;
    `,

    modal: `
${commonImports}

interface EmojiPickerModalProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onEmojiSelect?: (emoji: string) => void;
}

const EmojiPickerModal: React.FC<EmojiPickerModalProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className, onEmojiSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('smileys');
  const [recentEmojis, setRecentEmojis] = useState<string[]>([]);
  const [selectedSkinTone, setSelectedSkinTone] = useState('default');
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

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

  const emojiData = propData || fetchedData || {};

  const searchPlaceholder = ${getField('searchPlaceholder')};
  const categories = ${getField('categories')};
  const emojis = ${getField('emojis')};
  const recentLabel = ${getField('recentLabel')};
  const noResultsText = ${getField('noResultsText')};
  const skinTones = ${getField('skinTones')};
  const selectEmojiText = ${getField('selectEmojiText')};

  useEffect(() => {
    if (isOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleEmojiClick = (emoji: string) => {
    setSelectedEmoji(emoji);
  };

  const handleInsertEmoji = () => {
    if (selectedEmoji) {
      onEmojiSelect?.(selectedEmoji);
      setRecentEmojis(prev => {
        const filtered = prev.filter(e => e !== selectedEmoji);
        return [selectedEmoji, ...filtered].slice(0, 24);
      });
      setIsOpen(false);
      setSelectedEmoji(null);
      setSearchQuery('');
    }
  };

  const getFilteredEmojis = () => {
    if (!searchQuery) {
      return emojis[selectedCategory] || [];
    }
    return Object.values(emojis).flat().filter((emoji: any) =>
      emoji.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredEmojis = getFilteredEmojis();

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn("px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2", className)}
      >
        <Smile className="h-5 w-5" />
        <span>Select Emoji</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {selectEmojiText}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="flex gap-2 p-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
              {categories.map((cat: any) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setSearchQuery('');
                  }}
                  className={\`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all \${
                    selectedCategory === cat.id
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }\`}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-xs font-medium">{cat.name}</span>
                </button>
              ))}
            </div>

            {/* Skin Tone Selector */}
            <div className="flex items-center gap-2 p-4 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Skin Tone:</span>
              <div className="flex gap-2">
                {skinTones.map((tone: any) => (
                  <button
                    key={tone.id}
                    onClick={() => setSelectedSkinTone(tone.id)}
                    className={\`w-8 h-8 rounded-full border-2 transition-all \${
                      selectedSkinTone === tone.id
                        ? 'border-blue-500 scale-110 shadow-lg'
                        : 'border-gray-300 dark:border-gray-600'
                    }\`}
                    style={{ backgroundColor: tone.color }}
                    title={tone.name}
                  />
                ))}
              </div>
            </div>

            {/* Emoji Grid */}
            <div className="p-4 max-h-96 overflow-y-auto">
              {recentEmojis.length > 0 && !searchQuery && selectedCategory === 'smileys' && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{recentLabel}</span>
                  </div>
                  <div className="grid grid-cols-10 gap-2">
                    {recentEmojis.map((emoji, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleEmojiClick(emoji)}
                        className={\`text-3xl p-2 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-700 \${
                          selectedEmoji === emoji ? 'bg-blue-100 dark:bg-blue-900 scale-110' : ''
                        }\`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {filteredEmojis.length > 0 ? (
                <div className="grid grid-cols-10 gap-2">
                  {filteredEmojis.map((emoji: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => handleEmojiClick(emoji)}
                      className={\`text-3xl p-2 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-700 \${
                        selectedEmoji === emoji ? 'bg-blue-100 dark:bg-blue-900 scale-110' : ''
                      }\`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Smile className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>{noResultsText}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {selectedEmoji && (
                  <span>Selected: <span className="text-2xl">{selectedEmoji}</span></span>
                )}
              </div>
              <button
                onClick={handleInsertEmoji}
                disabled={!selectedEmoji}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-semibold rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                Insert Emoji
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmojiPickerModal;
    `,

    inline: `
${commonImports}

interface EmojiPickerInlineProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onEmojiSelect?: (emoji: string) => void;
}

const EmojiPickerInline: React.FC<EmojiPickerInlineProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className, onEmojiSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('smileys');
  const [recentEmojis, setRecentEmojis] = useState<string[]>([]);
  const [selectedSkinTone, setSelectedSkinTone] = useState('default');
  const [copiedEmoji, setCopiedEmoji] = useState<string | null>(null);

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

  const emojiData = propData || fetchedData || {};

  const searchPlaceholder = ${getField('searchPlaceholder')};
  const categories = ${getField('categories')};
  const emojis = ${getField('emojis')};
  const recentLabel = ${getField('recentLabel')};
  const noResultsText = ${getField('noResultsText')};
  const skinTones = ${getField('skinTones')};

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect?.(emoji);
    setRecentEmojis(prev => {
      const filtered = prev.filter(e => e !== emoji);
      return [emoji, ...filtered].slice(0, 32);
    });

    // Copy to clipboard
    navigator.clipboard.writeText(emoji);
    setCopiedEmoji(emoji);
    setTimeout(() => setCopiedEmoji(null), 1000);
  };

  const getFilteredEmojis = () => {
    if (!searchQuery) {
      return emojis[selectedCategory] || [];
    }
    return Object.values(emojis).flat().filter((emoji: any) =>
      emoji.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredEmojis = getFilteredEmojis();

  return (
    <div className={cn("bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden", className)}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
          Emoji Picker
        </h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-1 p-3 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {categories.map((cat: any) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.id);
              setSearchQuery('');
            }}
            className={\`flex flex-col items-center gap-1 px-3 py-2 rounded-lg min-w-max transition-all \${
              selectedCategory === cat.id
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
            }\`}
          >
            <span className="text-xl">{cat.icon}</span>
            <span className="text-xs font-medium">{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Skin Tone Selector */}
      <div className="flex items-center gap-2 p-3 border-b border-gray-200 dark:border-gray-700">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Skin Tone:</span>
        <div className="flex gap-2">
          {skinTones.map((tone: any) => (
            <button
              key={tone.id}
              onClick={() => setSelectedSkinTone(tone.id)}
              className={\`w-7 h-7 rounded-full border-2 transition-all \${
                selectedSkinTone === tone.id
                  ? 'border-blue-500 scale-110 shadow-md'
                  : 'border-gray-300 dark:border-gray-600 hover:scale-105'
              }\`}
              style={{ backgroundColor: tone.color }}
              title={tone.name}
            />
          ))}
        </div>
      </div>

      {/* Emoji Grid */}
      <div className="p-3 h-96 overflow-y-auto">
        {recentEmojis.length > 0 && !searchQuery && selectedCategory === 'smileys' && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{recentLabel}</span>
            </div>
            <div className="grid grid-cols-8 gap-2">
              {recentEmojis.map((emoji, idx) => (
                <button
                  key={idx}
                  onClick={() => handleEmojiClick(emoji)}
                  className="relative text-3xl p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all group"
                >
                  {emoji}
                  {copiedEmoji === emoji && (
                    <div className="absolute inset-0 flex items-center justify-center bg-green-500/90 rounded-lg text-white text-xs font-semibold">
                      Copied!
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {filteredEmojis.length > 0 ? (
          <div className="grid grid-cols-8 gap-2">
            {filteredEmojis.map((emoji: string, idx: number) => (
              <button
                key={idx}
                onClick={() => handleEmojiClick(emoji)}
                className="relative text-3xl p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all group"
              >
                {emoji}
                {copiedEmoji === emoji && (
                  <div className="absolute inset-0 flex items-center justify-center bg-green-500/90 rounded-lg text-white text-xs font-semibold">
                    Copied!
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Smile className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>{noResultsText}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Click any emoji to copy to clipboard
        </div>
      </div>
    </div>
  );
};

export default EmojiPickerInline;
    `
  };

  return variants[variant] || variants.dropdown;
};
