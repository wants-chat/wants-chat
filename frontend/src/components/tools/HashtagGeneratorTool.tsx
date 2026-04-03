import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Hash, Copy, Check, Sparkles, TrendingUp, Instagram, Twitter } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';

type Platform = 'instagram' | 'twitter' | 'tiktok' | 'linkedin' | 'general';

interface HashtagCategory {
  name: string;
  tags: string[];
}

const platformLimits: Record<Platform, number> = {
  instagram: 30,
  twitter: 5,
  tiktok: 100,
  linkedin: 5,
  general: 30,
};

const popularHashtags: Record<string, HashtagCategory[]> = {
  business: [
    { name: 'General', tags: ['business', 'entrepreneur', 'startup', 'success', 'motivation', 'goals'] },
    { name: 'Marketing', tags: ['marketing', 'digitalmarketing', 'socialmedia', 'branding', 'growth'] },
    { name: 'Leadership', tags: ['leadership', 'mindset', 'hustle', 'ceo', 'founder', 'innovation'] },
  ],
  fitness: [
    { name: 'Workout', tags: ['fitness', 'workout', 'gym', 'training', 'exercise', 'fitfam'] },
    { name: 'Health', tags: ['health', 'healthy', 'nutrition', 'wellness', 'lifestyle', 'fit'] },
    { name: 'Motivation', tags: ['fitnessmotivation', 'gymlife', 'getfit', 'strongnotskinny', 'gains'] },
  ],
  food: [
    { name: 'General', tags: ['food', 'foodie', 'yummy', 'delicious', 'homemade', 'cooking'] },
    { name: 'Healthy', tags: ['healthyfood', 'cleaneating', 'mealprep', 'eatclean', 'nutrition'] },
    { name: 'Desserts', tags: ['dessert', 'baking', 'cake', 'chocolate', 'sweet', 'foodporn'] },
  ],
  travel: [
    { name: 'General', tags: ['travel', 'wanderlust', 'explore', 'adventure', 'travelgram', 'vacation'] },
    { name: 'Photography', tags: ['travelphotography', 'instatravel', 'travelphoto', 'beautifuldestinations'] },
    { name: 'Lifestyle', tags: ['travelblogger', 'traveling', 'trip', 'holiday', 'tourism', 'backpacking'] },
  ],
  photography: [
    { name: 'General', tags: ['photography', 'photo', 'photooftheday', 'photographer', 'picoftheday'] },
    { name: 'Portrait', tags: ['portrait', 'portraitphotography', 'model', 'photoshoot', 'canonphotography'] },
    { name: 'Nature', tags: ['naturephotography', 'landscape', 'nature', 'sunset', 'wildlife'] },
  ],
  fashion: [
    { name: 'Style', tags: ['fashion', 'style', 'ootd', 'fashionblogger', 'outfit', 'fashionista'] },
    { name: 'Beauty', tags: ['beauty', 'makeup', 'skincare', 'cosmetics', 'beautyblogger'] },
    { name: 'Shopping', tags: ['shopping', 'newin', 'fashionstyle', 'instafashion', 'streetstyle'] },
  ],
  tech: [
    { name: 'General', tags: ['technology', 'tech', 'innovation', 'coding', 'programming', 'developer'] },
    { name: 'AI', tags: ['ai', 'artificialintelligence', 'machinelearning', 'datascience', 'automation'] },
    { name: 'Startup', tags: ['startup', 'saas', 'webapp', 'software', 'productdesign', 'ux'] },
  ],
};

interface HashtagGeneratorToolProps {
  uiConfig?: UIConfig;
}

const COLUMNS = [
  { key: 'hashtag', label: 'Hashtag' },
  { key: 'platform', label: 'Platform' },
  { key: 'timestamp', label: 'Created At' },
];

export const HashtagGeneratorTool: React.FC<HashtagGeneratorToolProps> = ({
  uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState<Platform>('instagram');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const handleKeywordSearch = () => {
    const keywords = topic.toLowerCase().split(/[\s,]+/).filter(Boolean);
    const foundTags: string[] = [];

    Object.values(popularHashtags).forEach(categories => {
      categories.forEach(category => {
        category.tags.forEach(tag => {
          if (keywords.some(kw => tag.includes(kw) || kw.includes(tag))) {
            if (!foundTags.includes(tag)) {
              foundTags.push(tag);
            }
          }
        });
      });
    });

    // Generate related tags from topic
    keywords.forEach(kw => {
      if (kw.length > 2 && !foundTags.includes(kw)) {
        foundTags.push(kw);
      }
    });

    setCustomTags(foundTags.slice(0, 10));
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else if (selectedTags.length < platformLimits[platform]) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const addAllFromCategory = (tags: string[]) => {
    const remaining = platformLimits[platform] - selectedTags.length;
    const newTags = tags.filter(t => !selectedTags.includes(t)).slice(0, remaining);
    setSelectedTags([...selectedTags, ...newTags]);
  };

  const clearAll = () => {
    setSelectedTags([]);
  };

  const formatHashtags = (): string => {
    return selectedTags.map(t => `#${t}`).join(' ');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(formatHashtags());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const prepareExportData = () => {
    return selectedTags.map((tag, index) => ({
      hashtag: `#${tag}`,
      platform,
      timestamp: new Date().toISOString().split('T')[0],
    }));
  };

  const handleExportCSV = () => {
    const data = prepareExportData();
    const headers = COLUMNS.map(col => col.label).join(',');
    const rows = data.map(item =>
      COLUMNS.map(col => {
        const value = item[col.key as keyof typeof item];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(',')
    );
    const csv = [headers, ...rows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hashtags-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const data = prepareExportData();
    const json = JSON.stringify({
      exported: new Date().toISOString(),
      platform,
      totalHashtags: selectedTags.length,
      hashtags: data,
    }, null, 2);

    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hashtags-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleCopyToClipboard = async (): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(formatHashtags());
      return true;
    } catch {
      return false;
    }
  };

  const platforms: { value: Platform; label: string; icon: any; limit: number }[] = [
    { value: 'instagram', label: 'Instagram', icon: Instagram, limit: 30 },
    { value: 'twitter', label: 'Twitter/X', icon: Twitter, limit: 5 },
    { value: 'tiktok', label: 'TikTok', icon: TrendingUp, limit: 100 },
    { value: 'linkedin', label: 'LinkedIn', icon: Hash, limit: 5 },
    { value: 'general', label: 'General', icon: Hash, limit: 30 },
  ];

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      const textContent = params.text || params.content || params.title || '';
      if (textContent) {
        setTopic(textContent);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-fuchsia-900/20' : 'bg-gradient-to-r from-white to-fuchsia-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-fuchsia-500/10 rounded-lg">
            <Hash className="w-5 h-5 text-fuchsia-500" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.hashtagGenerator.hashtagGenerator', 'Hashtag Generator')}</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.hashtagGenerator.generateTrendingHashtagsForSocial', 'Generate trending hashtags for social media')}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Platform Selection */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.hashtagGenerator.platform', 'Platform')}
          </label>
          <div className="flex flex-wrap gap-2">
            {platforms.map((p) => (
              <button
                key={p.value}
                onClick={() => { setPlatform(p.value); setSelectedTags(selectedTags.slice(0, p.limit)); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                  platform === p.value
                    ? 'bg-fuchsia-500 text-white'
                    : isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <p.icon className="w-4 h-4" />
                {p.label}
                <span className={`text-xs ${platform === p.value ? 'text-fuchsia-200' : isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  ({p.limit})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Topic Search */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.hashtagGenerator.searchByTopic', 'Search by Topic')}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleKeywordSearch()}
              placeholder={t('tools.hashtagGenerator.enterTopicOrKeywords', 'Enter topic or keywords...')}
              className={`flex-1 px-4 py-2.5 rounded-lg border ${
                isDark
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
            <button
              onClick={handleKeywordSearch}
              className="px-4 py-2.5 bg-fuchsia-500 hover:bg-fuchsia-600 text-white rounded-lg flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {t('tools.hashtagGenerator.generate', 'Generate')}
            </button>
          </div>
        </div>

        {/* Custom Generated Tags */}
        {customTags.length > 0 && (
          <div className={`p-4 rounded-xl ${isDark ? 'bg-fuchsia-900/20 border-fuchsia-800' : 'bg-fuchsia-50 border-fuchsia-100'} border`}>
            <div className="flex justify-between items-center mb-3">
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Suggested for "{topic}"
              </h4>
              <button
                onClick={() => addAllFromCategory(customTags)}
                className="text-sm text-fuchsia-500 hover:text-fuchsia-400"
              >
                {t('tools.hashtagGenerator.addAll', 'Add all')}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {customTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-fuchsia-500 text-white'
                      : isDark
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-white hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Category Selection */}
        <div className="space-y-3">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.hashtagGenerator.browseByCategory', 'Browse by Category')}
          </label>
          <div className="flex flex-wrap gap-2">
            {Object.keys(popularHashtags).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  selectedCategory === cat
                    ? 'bg-fuchsia-500 text-white'
                    : isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Category Tags */}
        {selectedCategory && (
          <div className="space-y-4">
            {popularHashtags[selectedCategory]?.map((category) => (
              <div key={category.name} className={`p-4 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                <div className="flex justify-between items-center mb-3">
                  <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {category.name}
                  </h4>
                  <button
                    onClick={() => addAllFromCategory(category.tags)}
                    className="text-sm text-fuchsia-500 hover:text-fuchsia-400"
                  >
                    {t('tools.hashtagGenerator.addAll2', 'Add all')}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {category.tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-fuchsia-500 text-white'
                          : isDark
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                          : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Selected Hashtags */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex justify-between items-center mb-3">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Selected Hashtags ({selectedTags.length}/{platformLimits[platform]})
            </h4>
            <div className="flex gap-2">
              {selectedTags.length > 0 && (
                <>
                  <ExportDropdown
                    onExportCSV={handleExportCSV}
                    onExportJSON={handleExportJSON}
                    onCopyToClipboard={handleCopyToClipboard}
                    disabled={selectedTags.length === 0}
                    showImport={false}
                    theme={isDark ? 'dark' : 'light'}
                    className="text-sm"
                  />
                  <button
                    onClick={clearAll}
                    className={`text-sm ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {t('tools.hashtagGenerator.clearAll', 'Clear all')}
                  </button>
                </>
              )}
            </div>
          </div>

          {selectedTags.length > 0 ? (
            <>
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className="px-3 py-1.5 bg-fuchsia-500 text-white rounded-full text-sm cursor-pointer hover:bg-fuchsia-600"
                  >
                    #{tag} ×
                  </span>
                ))}
              </div>
              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                <p className={`text-sm break-all ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {formatHashtags()}
                </p>
              </div>
              <button
                onClick={handleCopy}
                className={`mt-3 w-full py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-fuchsia-500 hover:bg-fuchsia-600 text-white'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? t('tools.hashtagGenerator.copied', 'Copied!') : t('tools.hashtagGenerator.copyHashtags', 'Copy Hashtags')}
              </button>
            </>
          ) : (
            <p className={`text-sm text-center py-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {t('tools.hashtagGenerator.clickOnHashtagsAboveTo', 'Click on hashtags above to add them')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HashtagGeneratorTool;
