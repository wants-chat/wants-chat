import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Baby, Heart, Shuffle, Filter, Copy, Check, X, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';

type Gender = 'male' | 'female' | 'neutral';
type Popularity = 'popular' | 'classic' | 'unique';

interface BabyName {
  name: string;
  gender: Gender;
  origin: string;
  meaning: string;
  popularity: Popularity;
}

const babyNames: BabyName[] = [
  { name: 'Liam', gender: 'male', origin: 'Irish', meaning: 'Strong-willed warrior and protector', popularity: 'popular' },
  { name: 'Olivia', gender: 'female', origin: 'Latin', meaning: 'Olive tree, symbol of peace', popularity: 'popular' },
  { name: 'Noah', gender: 'male', origin: 'Hebrew', meaning: 'Rest and comfort', popularity: 'popular' },
  { name: 'Emma', gender: 'female', origin: 'Germanic', meaning: 'Whole or universal', popularity: 'popular' },
  { name: 'Alexander', gender: 'male', origin: 'Greek', meaning: 'Defender of the people', popularity: 'classic' },
  { name: 'Sophia', gender: 'female', origin: 'Greek', meaning: 'Wisdom and knowledge', popularity: 'popular' },
  { name: 'Avery', gender: 'neutral', origin: 'English', meaning: 'Ruler of elves', popularity: 'popular' },
  { name: 'Magnus', gender: 'male', origin: 'Norse', meaning: 'Great and mighty', popularity: 'unique' },
  { name: 'Aaliyah', gender: 'female', origin: 'Arabic', meaning: 'Exalted, sublime', popularity: 'popular' },
  { name: 'Rowan', gender: 'neutral', origin: 'Irish', meaning: 'Little red one', popularity: 'unique' },
  { name: 'Sebastian', gender: 'male', origin: 'Greek', meaning: 'Venerable, revered', popularity: 'classic' },
  { name: 'Isabella', gender: 'female', origin: 'Spanish', meaning: 'Devoted to God', popularity: 'classic' },
  { name: 'Kai', gender: 'neutral', origin: 'Hawaiian', meaning: 'Sea or ocean', popularity: 'popular' },
  { name: 'Theodore', gender: 'male', origin: 'Greek', meaning: 'Gift of God', popularity: 'classic' },
  { name: 'Aurora', gender: 'female', origin: 'Latin', meaning: 'Dawn, goddess of sunrise', popularity: 'unique' },
  { name: 'Jordan', gender: 'neutral', origin: 'Hebrew', meaning: 'To flow down, descend', popularity: 'classic' },
  { name: 'Freya', gender: 'female', origin: 'Norse', meaning: 'Noble woman, goddess of love', popularity: 'unique' },
  { name: 'Mateo', gender: 'male', origin: 'Spanish', meaning: 'Gift of God', popularity: 'popular' },
  { name: 'Aria', gender: 'female', origin: 'Italian', meaning: 'Air, song or melody', popularity: 'popular' },
  { name: 'Quinn', gender: 'neutral', origin: 'Irish', meaning: 'Wisdom, intelligence', popularity: 'unique' },
  { name: 'Ezra', gender: 'male', origin: 'Hebrew', meaning: 'Helper, assistance', popularity: 'unique' },
  { name: 'Luna', gender: 'female', origin: 'Latin', meaning: 'Moon', popularity: 'popular' },
  { name: 'Riley', gender: 'neutral', origin: 'Irish', meaning: 'Courageous, valiant', popularity: 'popular' },
  { name: 'Atlas', gender: 'male', origin: 'Greek', meaning: 'Bearer of the heavens', popularity: 'unique' },
  { name: 'Elena', gender: 'female', origin: 'Greek', meaning: 'Shining light, bright one', popularity: 'classic' },
  { name: 'Morgan', gender: 'neutral', origin: 'Welsh', meaning: 'Sea-born, great circle', popularity: 'classic' },
  { name: 'Felix', gender: 'male', origin: 'Latin', meaning: 'Happy and fortunate', popularity: 'classic' },
  { name: 'Zara', gender: 'female', origin: 'Arabic', meaning: 'Princess, blooming flower', popularity: 'unique' },
  { name: 'Sage', gender: 'neutral', origin: 'English', meaning: 'Wise one, herb', popularity: 'unique' },
  { name: 'Odin', gender: 'male', origin: 'Norse', meaning: 'Fury, inspiration', popularity: 'unique' },
  { name: 'Miriam', gender: 'female', origin: 'Hebrew', meaning: 'Wished-for child, sea of bitterness', popularity: 'classic' },
  { name: 'Phoenix', gender: 'neutral', origin: 'Greek', meaning: 'Dark red, mythical bird', popularity: 'unique' },
  { name: 'Diego', gender: 'male', origin: 'Spanish', meaning: 'Supplanter, teacher', popularity: 'popular' },
  { name: 'Nadia', gender: 'female', origin: 'Arabic', meaning: 'Hope, tender', popularity: 'classic' },
  { name: 'Finley', gender: 'neutral', origin: 'Irish', meaning: 'Fair-haired hero', popularity: 'popular' },
];

interface BabyNameGeneratorToolProps {
  uiConfig?: UIConfig;
}

export const BabyNameGeneratorTool: React.FC<BabyNameGeneratorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);

  const [genderFilter, setGenderFilter] = useState<'all' | Gender>('all');
  const [popularityFilter, setPopularityFilter] = useState<'all' | Popularity>('all');
  const [startsWithFilter, setStartsWithFilter] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [shuffleKey, setShuffleKey] = useState(0);
  const [copiedName, setCopiedName] = useState<string | null>(null);

  const toggleFavorite = useCallback((name: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(name)) {
        newFavorites.delete(name);
      } else {
        newFavorites.add(name);
      }
      return newFavorites;
    });
  }, []);

  const copyToClipboard = useCallback(async (name: string) => {
    try {
      await navigator.clipboard.writeText(name);
      setCopiedName(name);
      setTimeout(() => setCopiedName(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  const shuffleNames = useCallback(() => {
    setShuffleKey((prev) => prev + 1);
  }, []);

  const filteredNames = useMemo(() => {
    let result = [...babyNames];

    if (genderFilter !== 'all') {
      result = result.filter((n) => n.gender === genderFilter);
    }

    if (popularityFilter !== 'all') {
      result = result.filter((n) => n.popularity === popularityFilter);
    }

    if (startsWithFilter.trim()) {
      result = result.filter((n) =>
        n.name.toLowerCase().startsWith(startsWithFilter.toLowerCase().trim())
      );
    }

    if (showFavoritesOnly) {
      result = result.filter((n) => favorites.has(n.name));
    }

    // Shuffle based on shuffleKey
    if (shuffleKey > 0) {
      result = result.sort(() => Math.random() - 0.5);
    }

    return result;
  }, [genderFilter, popularityFilter, startsWithFilter, showFavoritesOnly, favorites, shuffleKey]);

  const favoriteNames = useMemo(() => {
    return babyNames.filter((n) => favorites.has(n.name));
  }, [favorites]);

  const getGenderIcon = (gender: Gender) => {
    switch (gender) {
      case 'male':
        return '\u2642';
      case 'female':
        return '\u2640';
      case 'neutral':
        return '\u26A7';
    }
  };

  const getGenderColor = (gender: Gender) => {
    switch (gender) {
      case 'male':
        return isDark ? 'text-blue-400' : 'text-blue-600';
      case 'female':
        return isDark ? 'text-pink-400' : 'text-pink-600';
      case 'neutral':
        return isDark ? 'text-purple-400' : 'text-purple-600';
    }
  };

  const getGenderBgColor = (gender: Gender) => {
    switch (gender) {
      case 'male':
        return isDark ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200';
      case 'female':
        return isDark ? 'bg-pink-900/30 border-pink-700' : 'bg-pink-50 border-pink-200';
      case 'neutral':
        return isDark ? 'bg-purple-900/30 border-purple-700' : 'bg-purple-50 border-purple-200';
    }
  };

  const getPopularityBadge = (popularity: Popularity) => {
    const styles = {
      popular: isDark
        ? 'bg-green-900/50 text-green-300 border-green-700'
        : 'bg-green-100 text-green-700 border-green-300',
      classic: isDark
        ? 'bg-amber-900/50 text-amber-300 border-amber-700'
        : 'bg-amber-100 text-amber-700 border-amber-300',
      unique: isDark
        ? 'bg-cyan-900/50 text-cyan-300 border-cyan-700'
        : 'bg-cyan-100 text-cyan-700 border-cyan-300',
    };

    return (
      <span className={`text-xs px-2 py-0.5 rounded-full border ${styles[popularity]}`}>
        {popularity.charAt(0).toUpperCase() + popularity.slice(1)}
      </span>
    );
  };

  const clearFilters = () => {
    setGenderFilter('all');
    setPopularityFilter('all');
    setStartsWithFilter('');
    setShowFavoritesOnly(false);
  };

  const hasActiveFilters =
    genderFilter !== 'all' ||
    popularityFilter !== 'all' ||
    startsWithFilter.trim() !== '' ||
    showFavoritesOnly;

  // Apply prefill data from uiConfig.params when component mounts
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as ToolPrefillData;
      const textContent = params.text || params.content || '';
      if (textContent) {
        setStartsWithFilter(textContent);
        setIsPrefilled(true);
      }
    }
  }, [uiConfig?.params]);

  return (
    <div
      className={`min-h-screen p-4 md:p-6 ${
        isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
      }`}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className={`p-3 rounded-xl ${
              isDark ? 'bg-pink-900/50 text-pink-300' : 'bg-pink-100 text-pink-600'
            }`}
          >
            <Baby size={28} />
          </div>
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.babyNameGenerator.babyNameGenerator', 'Baby Name Generator')}
            </h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.babyNameGenerator.discoverThePerfectNameFor', 'Discover the perfect name for your little one')}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div
          className={`p-4 rounded-xl mb-6 border ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          <div className="flex items-center gap-2 mb-4">
            <Filter size={18} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
            <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('tools.babyNameGenerator.filters', 'Filters')}
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className={`ml-auto flex items-center gap-1 text-sm px-2 py-1 rounded-lg transition-colors ${
                  isDark
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <X size={14} />
                {t('tools.babyNameGenerator.clearAll', 'Clear all')}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Gender Filter */}
            <div>
              <label
                className={`block text-sm font-medium mb-1.5 ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {t('tools.babyNameGenerator.gender', 'Gender')}
              </label>
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value as 'all' | Gender)}
                className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-pink-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-pink-500'
                } focus:outline-none focus:ring-2 focus:ring-pink-500/20`}
              >
                <option value="all">{t('tools.babyNameGenerator.allGenders', 'All Genders')}</option>
                <option value="male">{t('tools.babyNameGenerator.male', 'Male')}</option>
                <option value="female">{t('tools.babyNameGenerator.female', 'Female')}</option>
                <option value="neutral">{t('tools.babyNameGenerator.neutral', 'Neutral')}</option>
              </select>
            </div>

            {/* Popularity Filter */}
            <div>
              <label
                className={`block text-sm font-medium mb-1.5 ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {t('tools.babyNameGenerator.popularity', 'Popularity')}
              </label>
              <select
                value={popularityFilter}
                onChange={(e) => setPopularityFilter(e.target.value as 'all' | Popularity)}
                className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-pink-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-pink-500'
                } focus:outline-none focus:ring-2 focus:ring-pink-500/20`}
              >
                <option value="all">{t('tools.babyNameGenerator.allTypes', 'All Types')}</option>
                <option value="popular">{t('tools.babyNameGenerator.popular', 'Popular')}</option>
                <option value="classic">{t('tools.babyNameGenerator.classic', 'Classic')}</option>
                <option value="unique">{t('tools.babyNameGenerator.unique', 'Unique')}</option>
              </select>
            </div>

            {/* Starts With Filter */}
            <div>
              <label
                className={`block text-sm font-medium mb-1.5 ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {t('tools.babyNameGenerator.startsWith', 'Starts with')}
              </label>
              <input
                type="text"
                value={startsWithFilter}
                onChange={(e) => setStartsWithFilter(e.target.value)}
                placeholder={t('tools.babyNameGenerator.eGAMaSo', 'e.g., A, Ma, So...')}
                className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-pink-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-pink-500'
                } focus:outline-none focus:ring-2 focus:ring-pink-500/20`}
              />
            </div>

            {/* Show Favorites Toggle */}
            <div>
              <label
                className={`block text-sm font-medium mb-1.5 ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {t('tools.babyNameGenerator.show', 'Show')}
              </label>
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`w-full px-3 py-2 rounded-lg border transition-colors flex items-center justify-center gap-2 ${
                  showFavoritesOnly
                    ? isDark
                      ? 'bg-pink-900/50 border-pink-600 text-pink-300'
                      : 'bg-pink-100 border-pink-300 text-pink-700'
                    : isDark
                    ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Heart size={16} fill={showFavoritesOnly ? t('tools.babyNameGenerator.currentcolor', 'currentColor') : 'none'} />
                {t('tools.babyNameGenerator.favoritesOnly', 'Favorites Only')}
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mb-6">
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Showing {filteredNames.length} name{filteredNames.length !== 1 ? 's' : ''}
          </p>
          <button
            onClick={shuffleNames}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isDark
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300'
            }`}
          >
            <Shuffle size={18} />
            {t('tools.babyNameGenerator.shuffle', 'Shuffle')}
          </button>
        </div>

        {/* Names Grid */}
        {filteredNames.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {filteredNames.map((nameData) => (
              <div
                key={nameData.name}
                className={`p-4 rounded-xl border transition-all hover:shadow-lg ${getGenderBgColor(
                  nameData.gender
                )}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xl font-bold ${getGenderColor(nameData.gender)}`}>
                      {nameData.name}
                    </span>
                    <span className={`text-lg ${getGenderColor(nameData.gender)}`}>
                      {getGenderIcon(nameData.gender)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => copyToClipboard(nameData.name)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isDark
                          ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                          : 'hover:bg-white/50 text-gray-500 hover:text-gray-700'
                      }`}
                      title={t('tools.babyNameGenerator.copyName', 'Copy name')}
                    >
                      {copiedName === nameData.name ? (
                        <Check size={16} className="text-green-500" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                    <button
                      onClick={() => toggleFavorite(nameData.name)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        favorites.has(nameData.name)
                          ? 'text-red-500'
                          : isDark
                          ? 'hover:bg-gray-700 text-gray-400 hover:text-red-400'
                          : 'hover:bg-white/50 text-gray-500 hover:text-red-400'
                      }`}
                      title={favorites.has(nameData.name) ? t('tools.babyNameGenerator.removeFromFavorites', 'Remove from favorites') : t('tools.babyNameGenerator.addToFavorites', 'Add to favorites')}
                    >
                      <Heart size={16} fill={favorites.has(nameData.name) ? t('tools.babyNameGenerator.currentcolor2', 'currentColor') : 'none'} />
                    </button>
                  </div>
                </div>

                <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Origin: <span className="font-medium">{nameData.origin}</span>
                </p>

                <blockquote
                  className={`text-sm italic mb-3 pl-3 border-l-2 ${
                    isDark ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'
                  }`}
                >
                  "{nameData.meaning}"
                </blockquote>

                <div>{getPopularityBadge(nameData.popularity)}</div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className={`text-center py-12 rounded-xl border ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <Baby size={48} className={`mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`text-lg font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.babyNameGenerator.noNamesFound', 'No names found')}
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              {t('tools.babyNameGenerator.tryAdjustingYourFilters', 'Try adjusting your filters')}
            </p>
          </div>
        )}

        {/* Favorites Section */}
        {favoriteNames.length > 0 && !showFavoritesOnly && (
          <div
            className={`p-4 rounded-xl border ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-4">
              <Heart size={20} className="text-red-500" fill="currentColor" />
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Your Favorites ({favoriteNames.length})
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {favoriteNames.map((nameData) => (
                <div
                  key={`fav-${nameData.name}`}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${getGenderBgColor(
                    nameData.gender
                  )}`}
                >
                  <span className={`font-medium ${getGenderColor(nameData.gender)}`}>
                    {nameData.name}
                  </span>
                  <span className={`text-sm ${getGenderColor(nameData.gender)}`}>
                    {getGenderIcon(nameData.gender)}
                  </span>
                  <button
                    onClick={() => toggleFavorite(nameData.name)}
                    className="text-red-500 hover:text-red-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BabyNameGeneratorTool;
