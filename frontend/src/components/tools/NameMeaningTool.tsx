import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Search, Sparkles, Copy, Check, Heart, History, X, Hash } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

interface NameData {
  name: string;
  meaning: string;
  origin: string;
  gender: 'male' | 'female' | 'unisex';
  numerology: number;
  characteristics: string[];
  famousPeople: string[];
  variants: string[];
}

const nameDatabase: NameData[] = [
  { name: 'Alexander', meaning: 'Defender of the people', origin: 'Greek', gender: 'male', numerology: 1, characteristics: ['Leader', 'Ambitious', 'Courageous'], famousPeople: ['Alexander the Great', 'Alexander Hamilton'], variants: ['Alex', 'Xander', 'Sasha', 'Alexandro'] },
  { name: 'Sophia', meaning: 'Wisdom', origin: 'Greek', gender: 'female', numerology: 7, characteristics: ['Wise', 'Intuitive', 'Elegant'], famousPeople: ['Sophia Loren', 'Sofia Vergara'], variants: ['Sophie', 'Sofia', 'Zofia'] },
  { name: 'Muhammad', meaning: 'Praiseworthy', origin: 'Arabic', gender: 'male', numerology: 9, characteristics: ['Spiritual', 'Compassionate', 'Leader'], famousPeople: ['Muhammad Ali', 'Prophet Muhammad'], variants: ['Mohammed', 'Mohamed', 'Ahmad'] },
  { name: 'Emma', meaning: 'Whole, universal', origin: 'Germanic', gender: 'female', numerology: 5, characteristics: ['Creative', 'Independent', 'Adventurous'], famousPeople: ['Emma Watson', 'Emma Stone'], variants: ['Emmy', 'Emme', 'Emmanuelle'] },
  { name: 'William', meaning: 'Resolute protector', origin: 'Germanic', gender: 'male', numerology: 8, characteristics: ['Strong', 'Determined', 'Loyal'], famousPeople: ['William Shakespeare', 'Prince William'], variants: ['Will', 'Bill', 'Liam', 'Wilhelm'] },
  { name: 'Olivia', meaning: 'Olive tree', origin: 'Latin', gender: 'female', numerology: 6, characteristics: ['Peaceful', 'Nurturing', 'Artistic'], famousPeople: ['Olivia Newton-John', 'Olivia Wilde'], variants: ['Olive', 'Livia', 'Ollie'] },
  { name: 'James', meaning: 'Supplanter', origin: 'Hebrew', gender: 'male', numerology: 3, characteristics: ['Charming', 'Creative', 'Social'], famousPeople: ['James Dean', 'LeBron James'], variants: ['Jamie', 'Jim', 'Diego', 'Seamus'] },
  { name: 'Ava', meaning: 'Life, bird', origin: 'Latin', gender: 'female', numerology: 1, characteristics: ['Free-spirited', 'Independent', 'Charismatic'], famousPeople: ['Ava Gardner', 'Ava DuVernay'], variants: ['Eva', 'Avis', 'Evie'] },
  { name: 'Benjamin', meaning: 'Son of the right hand', origin: 'Hebrew', gender: 'male', numerology: 4, characteristics: ['Reliable', 'Practical', 'Hardworking'], famousPeople: ['Benjamin Franklin', 'Benjamin Netanyahu'], variants: ['Ben', 'Benny', 'Benji'] },
  { name: 'Isabella', meaning: 'Devoted to God', origin: 'Hebrew/Spanish', gender: 'female', numerology: 2, characteristics: ['Diplomatic', 'Graceful', 'Intuitive'], famousPeople: ['Queen Isabella I', 'Isabella Rossellini'], variants: ['Bella', 'Izzy', 'Isabel'] },
  { name: 'Lucas', meaning: 'Bringer of light', origin: 'Greek', gender: 'male', numerology: 7, characteristics: ['Intelligent', 'Analytical', 'Thoughtful'], famousPeople: ['George Lucas', 'Lucas Hedges'], variants: ['Luke', 'Luca', 'Lukas'] },
  { name: 'Mia', meaning: 'Mine, beloved', origin: 'Scandinavian', gender: 'female', numerology: 3, characteristics: ['Expressive', 'Creative', 'Joyful'], famousPeople: ['Mia Farrow', 'Mia Hamm'], variants: ['Maria', 'Miriam', 'Maya'] },
  { name: 'Henry', meaning: 'Ruler of the home', origin: 'Germanic', gender: 'male', numerology: 6, characteristics: ['Responsible', 'Caring', 'Traditional'], famousPeople: ['Henry Ford', 'Prince Harry'], variants: ['Harry', 'Hank', 'Henrik', 'Henri'] },
  { name: 'Charlotte', meaning: 'Free woman', origin: 'French', gender: 'female', numerology: 4, characteristics: ['Independent', 'Elegant', 'Strong'], famousPeople: ['Charlotte Bronte', 'Princess Charlotte'], variants: ['Charlie', 'Lottie', 'Carlotta'] },
  { name: 'Oliver', meaning: 'Olive tree', origin: 'Latin', gender: 'male', numerology: 5, characteristics: ['Peaceful', 'Adventurous', 'Friendly'], famousPeople: ['Oliver Cromwell', 'Oliver Stone'], variants: ['Ollie', 'Olivier', 'Noll'] },
  { name: 'Amelia', meaning: 'Industrious, striving', origin: 'Germanic', gender: 'female', numerology: 8, characteristics: ['Ambitious', 'Determined', 'Capable'], famousPeople: ['Amelia Earhart', 'Princess Amelia'], variants: ['Amy', 'Millie', 'Emily'] },
  { name: 'Daniel', meaning: 'God is my judge', origin: 'Hebrew', gender: 'male', numerology: 9, characteristics: ['Wise', 'Fair', 'Spiritual'], famousPeople: ['Daniel Radcliffe', 'Daniel Craig'], variants: ['Dan', 'Danny', 'Danilo'] },
  { name: 'Harper', meaning: 'Harp player', origin: 'English', gender: 'unisex', numerology: 3, characteristics: ['Artistic', 'Creative', 'Expressive'], famousPeople: ['Harper Lee'], variants: ['Harpy'] },
  { name: 'Ethan', meaning: 'Strong, firm', origin: 'Hebrew', gender: 'male', numerology: 2, characteristics: ['Steady', 'Reliable', 'Thoughtful'], famousPeople: ['Ethan Hawke', 'Ethan Allen'], variants: ['Eitan', 'Etan'] },
  { name: 'Aria', meaning: 'Air, song', origin: 'Italian', gender: 'female', numerology: 1, characteristics: ['Musical', 'Free-spirited', 'Elegant'], famousPeople: ['Aria from Game of Thrones'], variants: ['Arya', 'Arielle'] },
  { name: 'Noah', meaning: 'Rest, comfort', origin: 'Hebrew', gender: 'male', numerology: 5, characteristics: ['Peaceful', 'Patient', 'Wise'], famousPeople: ['Noah Wyle', 'Biblical Noah'], variants: ['Noa', 'Noach'] },
  { name: 'Luna', meaning: 'Moon', origin: 'Latin', gender: 'female', numerology: 7, characteristics: ['Mystical', 'Intuitive', 'Creative'], famousPeople: ['Luna Lovegood (Harry Potter)'], variants: ['Lunette', 'Selene'] },
  { name: 'Liam', meaning: 'Strong-willed warrior', origin: 'Irish', gender: 'male', numerology: 6, characteristics: ['Protective', 'Loyal', 'Brave'], famousPeople: ['Liam Neeson', 'Liam Hemsworth'], variants: ['William', 'Uilliam'] },
  { name: 'Grace', meaning: 'Elegance, blessing', origin: 'Latin', gender: 'female', numerology: 9, characteristics: ['Elegant', 'Kind', 'Graceful'], famousPeople: ['Grace Kelly', 'Grace Hopper'], variants: ['Gracie', 'Grazia', 'Gratia'] },
  { name: 'Jordan', meaning: 'To flow down', origin: 'Hebrew', gender: 'unisex', numerology: 4, characteristics: ['Adaptable', 'Balanced', 'Diplomatic'], famousPeople: ['Michael Jordan', 'Jordan Peele'], variants: ['Jordyn', 'Jorden'] },
  { name: 'Zoe', meaning: 'Life', origin: 'Greek', gender: 'female', numerology: 8, characteristics: ['Vibrant', 'Energetic', 'Ambitious'], famousPeople: ['Zoe Saldana', 'Zoe Kravitz'], variants: ['Zoey', 'Zoya', 'Zoi'] },
  { name: 'Michael', meaning: 'Who is like God', origin: 'Hebrew', gender: 'male', numerology: 2, characteristics: ['Strong', 'Spiritual', 'Leader'], famousPeople: ['Michael Jackson', 'Michael Jordan'], variants: ['Mike', 'Mick', 'Miguel', 'Michel'] },
  { name: 'Ella', meaning: 'Light, beautiful fairy', origin: 'Germanic', gender: 'female', numerology: 5, characteristics: ['Graceful', 'Charming', 'Creative'], famousPeople: ['Ella Fitzgerald'], variants: ['Elle', 'Ellie', 'Ellen'] },
  { name: 'David', meaning: 'Beloved', origin: 'Hebrew', gender: 'male', numerology: 3, characteristics: ['Loving', 'Creative', 'Charismatic'], famousPeople: ['David Bowie', 'Michelangelo\'s David'], variants: ['Dave', 'Davide', 'Dafydd'] },
  { name: 'Chloe', meaning: 'Blooming, fertility', origin: 'Greek', gender: 'female', numerology: 6, characteristics: ['Nurturing', 'Caring', 'Creative'], famousPeople: ['Chloe Grace Moretz'], variants: ['Cloe', 'Khloe'] },
];

const numerologyMeanings: Record<number, { trait: string; description: string }> = {
  1: { trait: 'Leader', description: 'Independent and pioneering spirit with strong leadership qualities' },
  2: { trait: 'Peacemaker', description: 'Diplomatic and cooperative with a talent for partnerships' },
  3: { trait: 'Communicator', description: 'Creative, expressive, and socially gifted' },
  4: { trait: 'Builder', description: 'Practical, reliable, and hardworking with strong foundations' },
  5: { trait: 'Freedom Seeker', description: 'Adventurous, versatile, and embracing of change' },
  6: { trait: 'Nurturer', description: 'Caring, responsible, and devoted to family and community' },
  7: { trait: 'Seeker', description: 'Analytical, intuitive, and spiritually inclined' },
  8: { trait: 'Achiever', description: 'Ambitious, authoritative, and materially successful' },
  9: { trait: 'Humanitarian', description: 'Compassionate, wise, and globally minded' },
};

interface NameMeaningToolProps {
  uiConfig?: UIConfig;
}

export const NameMeaningTool: React.FC<NameMeaningToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedName, setSelectedName] = useState<NameData | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female' | 'unisex'>('all');
  const [copied, setCopied] = useState(false);

  const filteredNames = useMemo(() => {
    let results = nameDatabase;

    if (genderFilter !== 'all') {
      results = results.filter(n => n.gender === genderFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(n =>
        n.name.toLowerCase().includes(query) ||
        n.meaning.toLowerCase().includes(query) ||
        n.origin.toLowerCase().includes(query)
      );
    }

    return results.sort((a, b) => a.name.localeCompare(b.name));
  }, [searchQuery, genderFilter]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.trim() && !searchHistory.includes(query.trim())) {
      setSearchHistory(prev => [query.trim(), ...prev].slice(0, 5));
    }
  }, [searchHistory]);

  const calculateNumerology = useCallback((name: string): number => {
    const values: Record<string, number> = {
      a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
      j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
      s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8,
    };

    let sum = name.toLowerCase().split('').reduce((acc, char) => acc + (values[char] || 0), 0);
    while (sum > 9 && sum !== 11 && sum !== 22) {
      sum = String(sum).split('').reduce((acc, d) => acc + parseInt(d), 0);
    }
    return sum;
  }, []);

  const toggleFavorite = useCallback((name: string) => {
    setFavorites(prev => {
      const newSet = new Set(prev);
      if (newSet.has(name)) {
        newSet.delete(name);
      } else {
        newSet.add(name);
      }
      return newSet;
    });
  }, []);

  const copyMeaning = useCallback(async () => {
    if (!selectedName) return;
    const text = `${selectedName.name}\nMeaning: ${selectedName.meaning}\nOrigin: ${selectedName.origin}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [selectedName]);

  const getGenderColor = (gender: string) => {
    const colors: Record<string, string> = {
      male: isDark ? 'text-blue-400 bg-blue-900/30 border-blue-700' : 'text-blue-600 bg-blue-50 border-blue-200',
      female: isDark ? 'text-pink-400 bg-pink-900/30 border-pink-700' : 'text-pink-600 bg-pink-50 border-pink-200',
      unisex: isDark ? 'text-purple-400 bg-purple-900/30 border-purple-700' : 'text-purple-600 bg-purple-50 border-purple-200',
    };
    return colors[gender] || colors.unisex;
  };

  const getGenderEmoji = (gender: string) => {
    return gender === 'male' ? '♂' : gender === 'female' ? '♀' : '⚥';
  };

  return (
    <div className={`min-h-screen p-4 md:p-6 ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-3 rounded-xl ${isDark ? 'bg-teal-900/50 text-teal-300' : 'bg-teal-100 text-teal-600'}`}>
            <User size={28} />
          </div>
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t('tools.nameMeaning.nameMeaningLookup', 'Name Meaning Lookup')}
            </h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.nameMeaning.discoverTheOriginAndMeaning', 'Discover the origin and meaning of names')}
            </p>
          </div>
        </div>

        {/* Search Section */}
        <div className={`p-4 rounded-xl border mb-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="relative mb-4">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={t('tools.nameMeaning.searchForAName', 'Search for a name...')}
              className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-colors ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-teal-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-teal-500'
              } focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`absolute right-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Gender Filter */}
          <div className="flex flex-wrap gap-2">
            {['all', 'male', 'female', 'unisex'].map(gender => (
              <button
                key={gender}
                onClick={() => setGenderFilter(gender as any)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  genderFilter === gender
                    ? isDark
                      ? 'bg-teal-900/50 text-teal-300'
                      : 'bg-teal-100 text-teal-700'
                    : isDark
                    ? 'bg-gray-700 text-gray-400 hover:text-gray-200'
                    : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                {gender === 'all' ? 'All Names' : `${getGenderEmoji(gender)} ${gender.charAt(0).toUpperCase() + gender.slice(1)}`}
              </button>
            ))}
          </div>

          {/* Search History */}
          {searchHistory.length > 0 && !searchQuery && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <History size={14} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('tools.nameMeaning.recentSearches', 'Recent searches')}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((term, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSearchQuery(term)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Names Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
          {filteredNames.map((name) => (
            <button
              key={name.name}
              onClick={() => setSelectedName(name)}
              className={`p-3 rounded-xl border text-left transition-all hover:shadow-md ${
                selectedName?.name === name.name
                  ? isDark
                    ? 'bg-teal-900/30 border-teal-600'
                    : 'bg-teal-50 border-teal-300'
                  : isDark
                  ? 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {name.name}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(name.name);
                  }}
                  className={favorites.has(name.name) ? 'text-pink-500' : isDark ? 'text-gray-600' : 'text-gray-300'}
                >
                  <Heart size={14} fill={favorites.has(name.name) ? t('tools.nameMeaning.currentcolor', 'currentColor') : 'none'} />
                </button>
              </div>
              <div className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {name.origin}
              </div>
              <span className={`inline-block mt-1 text-xs ${getGenderColor(name.gender)} px-1.5 py-0.5 rounded`}>
                {getGenderEmoji(name.gender)}
              </span>
            </button>
          ))}
        </div>

        {/* Empty State */}
        {filteredNames.length === 0 && (
          <div className={`text-center py-12 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <User size={48} className={`mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`text-lg font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.nameMeaning.noNamesFound', 'No names found')}
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              {t('tools.nameMeaning.trySearchingForADifferent', 'Try searching for a different name')}
            </p>
          </div>
        )}

        {/* Selected Name Detail */}
        {selectedName && (
          <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50`}>
            <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="sticky top-0 p-4 border-b flex items-center justify-between backdrop-blur-sm bg-inherit">
                <div className="flex items-center gap-3">
                  <Sparkles className={isDark ? 'text-teal-400' : 'text-teal-600'} size={24} />
                  <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {selectedName.name}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyMeaning}
                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                  >
                    {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                  </button>
                  <button
                    onClick={() => setSelectedName(null)}
                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Origin & Gender */}
                <div className="flex flex-wrap gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm border ${getGenderColor(selectedName.gender)}`}>
                    {getGenderEmoji(selectedName.gender)} {selectedName.gender.charAt(0).toUpperCase() + selectedName.gender.slice(1)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                    Origin: {selectedName.origin}
                  </span>
                </div>

                {/* Meaning */}
                <div className={`p-4 rounded-xl ${isDark ? 'bg-teal-900/20 border border-teal-800' : 'bg-teal-50 border border-teal-200'}`}>
                  <h3 className={`font-semibold mb-2 ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>
                    {t('tools.nameMeaning.meaning', 'Meaning')}
                  </h3>
                  <p className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    "{selectedName.meaning}"
                  </p>
                </div>

                {/* Numerology */}
                <div className={`p-4 rounded-xl ${isDark ? 'bg-purple-900/20 border border-purple-800' : 'bg-purple-50 border border-purple-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Hash size={16} className={isDark ? 'text-purple-400' : 'text-purple-600'} />
                    <h3 className={`font-semibold ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
                      Name Numerology: {selectedName.numerology}
                    </h3>
                  </div>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className="font-medium">{numerologyMeanings[selectedName.numerology]?.trait}:</span> {numerologyMeanings[selectedName.numerology]?.description}
                  </p>
                </div>

                {/* Characteristics */}
                <div>
                  <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.nameMeaning.personalityTraits', 'Personality Traits')}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedName.characteristics.map((trait, idx) => (
                      <span
                        key={idx}
                        className={`px-3 py-1 rounded-full text-sm ${
                          isDark ? 'bg-teal-900/50 text-teal-300' : 'bg-teal-100 text-teal-700'
                        }`}
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Variants */}
                <div>
                  <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('tools.nameMeaning.nameVariants', 'Name Variants')}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedName.variants.map((variant, idx) => (
                      <span
                        key={idx}
                        className={`px-3 py-1 rounded-lg text-sm ${
                          isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {variant}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Famous People */}
                <div className={`p-4 rounded-xl ${isDark ? 'bg-amber-900/20 border border-amber-800' : 'bg-amber-50 border border-amber-200'}`}>
                  <h3 className={`font-semibold mb-2 ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                    Famous People Named {selectedName.name}
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {selectedName.famousPeople.join(' • ')}
                  </p>
                </div>

                {/* Save Button */}
                <button
                  onClick={() => toggleFavorite(selectedName.name)}
                  className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 transition-colors ${
                    favorites.has(selectedName.name)
                      ? isDark
                        ? 'bg-pink-900/50 text-pink-300'
                        : 'bg-pink-100 text-pink-700'
                      : isDark
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Heart size={18} fill={favorites.has(selectedName.name) ? t('tools.nameMeaning.currentcolor2', 'currentColor') : 'none'} />
                  {favorites.has(selectedName.name) ? t('tools.nameMeaning.savedToFavorites', 'Saved to Favorites') : t('tools.nameMeaning.addToFavorites', 'Add to Favorites')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Favorites Section */}
        {favorites.size > 0 && !selectedName && (
          <div className={`mt-6 p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center gap-2 mb-3">
              <Heart size={18} className="text-pink-500" fill="currentColor" />
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Your Favorites ({favorites.size})
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {Array.from(favorites).map(name => (
                <button
                  key={name}
                  onClick={() => {
                    const nameData = nameDatabase.find(n => n.name === name);
                    if (nameData) setSelectedName(nameData);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 ${
                    isDark ? 'bg-pink-900/30 text-pink-300' : 'bg-pink-50 text-pink-700'
                  }`}
                >
                  {name}
                  <X
                    size={14}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(name);
                    }}
                    className="cursor-pointer hover:opacity-70"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NameMeaningTool;
