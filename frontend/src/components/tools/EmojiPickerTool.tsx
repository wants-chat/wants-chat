import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Smile, Check, Search, Clock, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import { ExportDropdown } from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';

interface EmojiCategory {
  name: string;
  icon: string;
  emojis: string[];
}

interface EmojiPickerToolProps {
  uiConfig?: UIConfig;
  prefillData?: ToolPrefillData;
}

// Interface for recent emoji entries
interface RecentEmoji {
  id: string;
  emoji: string;
  usedAt: string;
}

// Column configuration for recent emojis
const recentEmojiColumns: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'emoji', header: 'Emoji', type: 'string' },
  { key: 'usedAt', header: 'Used At', type: 'date' },
];

export const EmojiPickerTool: React.FC<EmojiPickerToolProps> = ({ uiConfig, prefillData }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [search, setSearch] = useState('');

  // Use useToolData hook for recent emojis persistence
  const {
    data: recentDataItems,
    addItem,
    updateItem,
    deleteItem,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
  } = useToolData<RecentEmoji>(
    'emoji-picker-recent',
    [],
    recentEmojiColumns,
    { autoSave: true }
  );

  // Extract just the emoji strings for display (ordered by usedAt descending, limited to 20)
  const recent = useMemo(() => {
    return recentDataItems
      .sort((a, b) => new Date(b.usedAt).getTime() - new Date(a.usedAt).getTime())
      .slice(0, 20)
      .map(item => item.emoji);
  }, [recentDataItems]);

  // Apply prefill data
  useEffect(() => {
    if (prefillData?.params) {
      if (prefillData.params.search) setSearch(prefillData.params.search);
      if (prefillData.params.category) setCategory(prefillData.params.category);
      setIsPrefilled(true);
    }
  }, [prefillData]);
  const [category, setCategory] = useState('smileys');
  const [copied, setCopied] = useState('');

  const categories: EmojiCategory[] = [
    {
      name: 'smileys',
      icon: '😀',
      emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '😮‍💨', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐'],
    },
    {
      name: 'gestures',
      icon: '👋',
      emojis: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄'],
    },
    {
      name: 'people',
      icon: '👤',
      emojis: ['👶', '🧒', '👦', '👧', '🧑', '👱', '👨', '🧔', '👩', '🧓', '👴', '👵', '🙍', '🙎', '🙅', '🙆', '💁', '🙋', '🧏', '🙇', '🤦', '🤷', '👮', '🕵️', '💂', '🥷', '👷', '🤴', '👸', '👳', '👲', '🧕', '🤵', '👰', '🤰', '🤱', '👼', '🎅', '🤶', '🦸', '🦹', '🧙', '🧚', '🧛', '🧜', '🧝', '🧞', '🧟', '💆', '💇', '🚶', '🧍', '🧎', '🏃', '💃', '🕺', '🕴️', '👯', '🧖', '🧗', '🤸', '🏌️'],
    },
    {
      name: 'animals',
      icon: '🐱',
      emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🪱', '🐛', '🦋', '🐌', '🐞', '🐜', '🪰', '🪲', '🪳', '🦟', '🦗', '🕷️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊'],
    },
    {
      name: 'food',
      icon: '🍔',
      emojis: ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🫓', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤'],
    },
    {
      name: 'travel',
      icon: '✈️',
      emojis: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🦯', '🦽', '🦼', '🛴', '🚲', '🛵', '🏍️', '🛺', '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟', '🚃', '🚋', '🚞', '🚝', '🚄', '🚅', '🚈', '🚂', '🚆', '🚇', '🚊', '🚉', '✈️', '🛫', '🛬', '🛩️', '💺', '🛰️', '🚀', '🛸', '🚁', '🛶', '⛵', '🚤', '🛥️', '🛳️', '⛴️', '🚢', '⚓', '🪝', '⛽', '🚧', '🚦', '🚥', '🚏', '🗺️', '🗿'],
    },
    {
      name: 'objects',
      icon: '💡',
      emojis: ['⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️', '💸', '💵', '💴', '💶', '💷', '🪙', '💰', '💳', '💎', '⚖️', '🪜', '🧰', '🪛', '🔧', '🔨', '⚒️', '🛠️', '⛏️', '🪚', '🔩', '⚙️'],
    },
    {
      name: 'symbols',
      icon: '❤️',
      emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘'],
    },
  ];

  const filteredEmojis = useMemo(() => {
    if (!search) {
      const cat = categories.find(c => c.name === category);
      return cat?.emojis || [];
    }

    // Simple search through all emojis
    const allEmojis = categories.flatMap(c => c.emojis);
    return allEmojis;
  }, [category, search, categories]);

  const handleCopy = (emoji: string) => {
    navigator.clipboard.writeText(emoji);
    setCopied(emoji);
    setTimeout(() => setCopied(''), 1500);

    // Add to recent using useToolData hook
    // Check if emoji already exists in recent data
    const existingEntry = recentDataItems.find(item => item.emoji === emoji);

    if (existingEntry) {
      // Update the existing entry's usedAt timestamp
      updateItem(existingEntry.id, { usedAt: new Date().toISOString() });
    } else {
      // Add new entry
      const newEntry: RecentEmoji = {
        id: `emoji-${Date.now()}`,
        emoji,
        usedAt: new Date().toISOString(),
      };
      addItem(newEntry);

      // Keep only the 20 most recent emojis
      if (recentDataItems.length >= 20) {
        const sorted = [...recentDataItems].sort(
          (a, b) => new Date(a.usedAt).getTime() - new Date(b.usedAt).getTime()
        );
        // Delete the oldest entry
        if (sorted.length > 0) {
          deleteItem(sorted[0].id);
        }
      }
    }
  };

  const copyMultiple = (emojis: string[]) => {
    navigator.clipboard.writeText(emojis.join(''));
    setCopied('multiple');
    setTimeout(() => setCopied(''), 1500);
  };

  // Export handlers
  const COLUMNS = ['category', 'emoji'];

  const handleExportCSV = () => {
    const rows = categories.flatMap(cat =>
      cat.emojis.map(emoji => [cat.name, emoji])
    );

    const csv = [
      COLUMNS.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'emojis.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const data = categories.map(cat => ({
      category: cat.name,
      icon: cat.icon,
      emojis: cat.emojis
    }));

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'emojis.json';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleCopyToClipboard = async (): Promise<boolean> => {
    const allEmojis = categories.flatMap(c => c.emojis);
    try {
      await navigator.clipboard.writeText(allEmojis.join(''));
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-yellow-900/20' : 'bg-gradient-to-r from-white to-yellow-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Smile className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.emojiPicker.emojiPicker', 'Emoji Picker')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.emojiPicker.findAndCopyEmojisQuickly', 'Find and copy emojis quickly')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <WidgetEmbedButton toolSlug="emoji-picker" toolName="Emoji Picker" />

            <SyncStatus
              isSynced={isSynced}
              isSaving={isSaving}
              lastSaved={lastSaved}
              syncError={syncError}
              onForceSync={forceSync}
              theme={isDark ? 'dark' : 'light'}
              size="sm"
            />
            <ExportDropdown
              onExportCSV={handleExportCSV}
              onExportJSON={handleExportJSON}
              onCopyToClipboard={handleCopyToClipboard}
              showImport={false}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>
        </div>
      </div>

      {/* Prefill Indicator */}
      {isPrefilled && (
        <div className={`mx-6 mt-4 flex items-center gap-2 text-sm ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
          <Sparkles className="w-4 h-4" />
          <span>{t('tools.emojiPicker.preFilledFromYourRequest', 'Pre-filled from your request')}</span>
        </div>
      )}

      <div className="p-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('tools.emojiPicker.searchEmojis', 'Search emojis...')}
            className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
              isDark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>

        {/* Recent */}
        {recent.length > 0 && !search && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('tools.emojiPicker.recent', 'Recent')}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {recent.map((emoji, i) => (
                <button
                  key={i}
                  onClick={() => handleCopy(emoji)}
                  className={`text-2xl p-2 rounded-lg transition-colors ${
                    copied === emoji
                      ? 'bg-green-500/20'
                      : isDark
                      ? 'hover:bg-gray-800'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Category Tabs */}
        {!search && (
          <div className="flex gap-1 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setCategory(cat.name)}
                className={`px-3 py-2 rounded-lg text-xl transition-colors flex-shrink-0 ${
                  category === cat.name
                    ? 'bg-yellow-500/20 ring-2 ring-yellow-500'
                    : isDark
                    ? 'hover:bg-gray-800'
                    : 'hover:bg-gray-100'
                }`}
                title={cat.name}
              >
                {cat.icon}
              </button>
            ))}
          </div>
        )}

        {/* Emoji Grid */}
        <div className={`p-4 rounded-xl max-h-64 overflow-y-auto ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="grid grid-cols-8 gap-1">
            {filteredEmojis.map((emoji, i) => (
              <button
                key={i}
                onClick={() => handleCopy(emoji)}
                className={`text-2xl p-2 rounded-lg transition-all hover:scale-125 ${
                  copied === emoji
                    ? 'bg-green-500/20'
                    : isDark
                    ? 'hover:bg-gray-700'
                    : 'hover:bg-white'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Copy Status */}
        {copied && (
          <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-green-900/20' : 'bg-green-50'}`}>
            <Check className="w-5 h-5 inline text-green-500 mr-2" />
            <span className="text-green-500">
              {copied === 'multiple' ? 'Emojis copied!' : `${copied} copied!`}
            </span>
          </div>
        )}

        {/* Quick Combos */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('tools.emojiPicker.quickReactions', 'Quick Reactions')}
          </div>
          <div className="flex gap-2">
            {['👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '🔥', '💯', '✨'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleCopy(emoji)}
                className={`text-2xl p-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmojiPickerTool;
