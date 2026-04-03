import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Search, Copy, Check, Bookmark, Heart, Share2, RefreshCw, Volume2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

interface Verse {
  surah: number;
  surahName: string;
  surahArabic: string;
  ayah: number;
  textArabic: string;
  textEnglish: string;
  reference: string;
}

interface QuranVerseFinderToolProps {
  uiConfig?: UIConfig;
}

// Sample verses database (in production, this would come from an API)
const SAMPLE_SURAHS: Record<number, { name: string; arabic: string; verses: Record<number, { arabic: string; english: string }> }> = {
  1: {
    name: 'Al-Fatihah',
    arabic: '\u0627\u0644\u0641\u0627\u062A\u062D\u0629',
    verses: {
      1: { arabic: '\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u064E\u0647\u0650 \u0627\u0644\u0631\u0651\u064E\u062D\u0652\u0645\u064E\u0670\u0646\u0650 \u0627\u0644\u0631\u0651\u064E\u062D\u0650\u064A\u0645\u0650', english: 'In the name of Allah, the Most Gracious, the Most Merciful.' },
      2: { arabic: '\u0627\u0644\u0652\u062D\u064E\u0645\u0652\u062F\u064F \u0644\u0650\u0644\u0651\u064E\u0647\u0650 \u0631\u064E\u0628\u0651\u0650 \u0627\u0644\u0652\u0639\u064E\u0627\u0644\u064E\u0645\u0650\u064A\u0646\u064E', english: 'All praise is due to Allah, Lord of the worlds.' },
      3: { arabic: '\u0627\u0644\u0631\u0651\u064E\u062D\u0652\u0645\u064E\u0670\u0646\u0650 \u0627\u0644\u0631\u0651\u064E\u062D\u0650\u064A\u0645\u0650', english: 'The Most Gracious, the Most Merciful.' },
      4: { arabic: '\u0645\u064E\u0627\u0644\u0650\u0643\u0650 \u064A\u064E\u0648\u0652\u0645\u0650 \u0627\u0644\u062F\u0651\u0650\u064A\u0646\u0650', english: 'Master of the Day of Judgment.' },
      5: { arabic: '\u0625\u0650\u064A\u0651\u064E\u0627\u0643\u064E \u0646\u064E\u0639\u0652\u0628\u064F\u062F\u064F \u0648\u064E\u0625\u0650\u064A\u0651\u064E\u0627\u0643\u064E \u0646\u064E\u0633\u0652\u062A\u064E\u0639\u0650\u064A\u0646\u064F', english: 'You alone we worship, and You alone we ask for help.' },
      6: { arabic: '\u0627\u0647\u0652\u062F\u0650\u0646\u064E\u0627 \u0627\u0644\u0635\u0651\u0650\u0631\u064E\u0627\u0637\u064E \u0627\u0644\u0652\u0645\u064F\u0633\u0652\u062A\u064E\u0642\u0650\u064A\u0645\u064E', english: 'Guide us to the straight path.' },
      7: { arabic: '\u0635\u0650\u0631\u064E\u0627\u0637\u064E \u0627\u0644\u0651\u064E\u0630\u0650\u064A\u0646\u064E \u0623\u064E\u0646\u0652\u0639\u064E\u0645\u0652\u062A\u064E \u0639\u064E\u0644\u064E\u064A\u0652\u0647\u0650\u0645\u0652 \u063A\u064E\u064A\u0652\u0631\u0650 \u0627\u0644\u0652\u0645\u064E\u063A\u0652\u0636\u064F\u0648\u0628\u0650 \u0639\u064E\u0644\u064E\u064A\u0652\u0647\u0650\u0645\u0652 \u0648\u064E\u0644\u064E\u0627 \u0627\u0644\u0636\u0651\u064E\u0627\u0644\u0651\u0650\u064A\u0646\u064E', english: 'The path of those upon whom You have bestowed favor, not of those who have evoked Your anger or of those who are astray.' },
    },
  },
  2: {
    name: 'Al-Baqarah',
    arabic: '\u0627\u0644\u0628\u0642\u0631\u0629',
    verses: {
      255: { arabic: '\u0627\u0644\u0644\u0651\u064E\u0647\u064F \u0644\u064E\u0627 \u0625\u0650\u0644\u064E\u0670\u0647\u064E \u0625\u0650\u0644\u0651\u064E\u0627 \u0647\u064F\u0648\u064E \u0627\u0644\u0652\u062D\u064E\u064A\u0651\u064F \u0627\u0644\u0652\u0642\u064E\u064A\u0651\u064F\u0648\u0645\u064F', english: 'Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence. (Ayat al-Kursi)' },
      256: { arabic: '\u0644\u064E\u0627 \u0625\u0650\u0643\u0652\u0631\u064E\u0627\u0647\u064E \u0641\u0650\u064A \u0627\u0644\u062F\u0651\u0650\u064A\u0646\u0650', english: 'There shall be no compulsion in religion.' },
      286: { arabic: '\u0644\u064E\u0627 \u064A\u064F\u0643\u064E\u0644\u0651\u0650\u0641\u064F \u0627\u0644\u0644\u0651\u064E\u0647\u064F \u0646\u064E\u0641\u0652\u0633\u064B\u0627 \u0625\u0650\u0644\u0651\u064E\u0627 \u0648\u064F\u0633\u0652\u0639\u064E\u0647\u064E\u0627', english: 'Allah does not burden a soul beyond that it can bear.' },
    },
  },
  3: {
    name: 'Ali Imran',
    arabic: '\u0622\u0644 \u0639\u0645\u0631\u0627\u0646',
    verses: {
      139: { arabic: '\u0648\u064E\u0644\u064E\u0627 \u062A\u064E\u0647\u0650\u0646\u064F\u0648\u0627 \u0648\u064E\u0644\u064E\u0627 \u062A\u064E\u062D\u0652\u0632\u064E\u0646\u064F\u0648\u0627 \u0648\u064E\u0623\u064E\u0646\u062A\u064F\u0645\u064F \u0627\u0644\u0652\u0623\u064E\u0639\u0652\u0644\u064E\u0648\u0652\u0646\u064E \u0625\u0650\u0646 \u0643\u064F\u0646\u062A\u064F\u0645 \u0645\u0651\u064F\u0624\u0652\u0645\u0650\u0646\u0650\u064A\u0646\u064E', english: 'So do not weaken and do not grieve, and you will be superior if you are believers.' },
    },
  },
  36: {
    name: 'Ya-Sin',
    arabic: '\u064A\u0633',
    verses: {
      1: { arabic: '\u064A\u0633', english: 'Ya, Sin.' },
      2: { arabic: '\u0648\u064E\u0627\u0644\u0652\u0642\u064F\u0631\u0652\u0622\u0646\u0650 \u0627\u0644\u0652\u062D\u064E\u0643\u0650\u064A\u0645\u0650', english: 'By the wise Quran.' },
      3: { arabic: '\u0625\u0650\u0646\u0651\u064E\u0643\u064E \u0644\u064E\u0645\u0650\u0646\u064E \u0627\u0644\u0652\u0645\u064F\u0631\u0652\u0633\u064E\u0644\u0650\u064A\u0646\u064E', english: 'Indeed you are from among the messengers.' },
    },
  },
  55: {
    name: 'Ar-Rahman',
    arabic: '\u0627\u0644\u0631\u062D\u0645\u0646',
    verses: {
      1: { arabic: '\u0627\u0644\u0631\u0651\u064E\u062D\u0652\u0645\u064E\u0670\u0646\u064F', english: 'The Most Merciful' },
      2: { arabic: '\u0639\u064E\u0644\u0651\u064E\u0645\u064E \u0627\u0644\u0652\u0642\u064F\u0631\u0652\u0622\u0646\u064E', english: 'Taught the Quran.' },
      13: { arabic: '\u0641\u064E\u0628\u0650\u0623\u064E\u064A\u0651\u0650 \u0622\u0644\u064E\u0627\u0621\u0650 \u0631\u064E\u0628\u0651\u0650\u0643\u064F\u0645\u064E\u0627 \u062A\u064F\u0643\u064E\u0630\u0651\u0650\u0628\u064E\u0627\u0646\u0650', english: 'So which of the favors of your Lord would you deny?' },
    },
  },
  112: {
    name: 'Al-Ikhlas',
    arabic: '\u0627\u0644\u0625\u062E\u0644\u0627\u0635',
    verses: {
      1: { arabic: '\u0642\u064F\u0644\u0652 \u0647\u064F\u0648\u064E \u0627\u0644\u0644\u0651\u064E\u0647\u064F \u0623\u064E\u062D\u064E\u062F\u064C', english: 'Say, "He is Allah, the One.' },
      2: { arabic: '\u0627\u0644\u0644\u0651\u064E\u0647\u064F \u0627\u0644\u0635\u0651\u064E\u0645\u064E\u062F\u064F', english: 'Allah, the Eternal Refuge.' },
      3: { arabic: '\u0644\u064E\u0645\u0652 \u064A\u064E\u0644\u0650\u062F\u0652 \u0648\u064E\u0644\u064E\u0645\u0652 \u064A\u064F\u0648\u0644\u064E\u062F\u0652', english: 'He neither begets nor is born.' },
      4: { arabic: '\u0648\u064E\u0644\u064E\u0645\u0652 \u064A\u064E\u0643\u064F\u0646 \u0644\u0651\u064E\u0647\u064F \u0643\u064F\u0641\u064F\u0648\u064B\u0627 \u0623\u064E\u062D\u064E\u062F\u064C', english: 'Nor is there to Him any equivalent."' },
    },
  },
  113: {
    name: 'Al-Falaq',
    arabic: '\u0627\u0644\u0641\u0644\u0642',
    verses: {
      1: { arabic: '\u0642\u064F\u0644\u0652 \u0623\u064E\u0639\u064F\u0648\u0630\u064F \u0628\u0650\u0631\u064E\u0628\u0651\u0650 \u0627\u0644\u0652\u0641\u064E\u0644\u064E\u0642\u0650', english: 'Say, "I seek refuge in the Lord of daybreak.' },
      2: { arabic: '\u0645\u0650\u0646 \u0634\u064E\u0631\u0651\u0650 \u0645\u064E\u0627 \u062E\u064E\u0644\u064E\u0642\u064E', english: 'From the evil of that which He created.' },
    },
  },
  114: {
    name: 'An-Nas',
    arabic: '\u0627\u0644\u0646\u0627\u0633',
    verses: {
      1: { arabic: '\u0642\u064F\u0644\u0652 \u0623\u064E\u0639\u064F\u0648\u0630\u064F \u0628\u0650\u0631\u064E\u0628\u0651\u0650 \u0627\u0644\u0646\u0651\u064E\u0627\u0633\u0650', english: 'Say, "I seek refuge in the Lord of mankind.' },
      2: { arabic: '\u0645\u064E\u0644\u0650\u0643\u0650 \u0627\u0644\u0646\u0651\u064E\u0627\u0633\u0650', english: 'The Sovereign of mankind.' },
      3: { arabic: '\u0625\u0650\u0644\u064E\u0670\u0647\u0650 \u0627\u0644\u0646\u0651\u064E\u0627\u0633\u0650', english: 'The God of mankind.' },
    },
  },
};

const POPULAR_VERSES = [
  { ref: '1:1', surah: 1, ayah: 1, name: 'Al-Fatihah 1:1' },
  { ref: '2:255', surah: 2, ayah: 255, name: 'Ayat al-Kursi' },
  { ref: '2:286', surah: 2, ayah: 286, name: 'Al-Baqarah 2:286' },
  { ref: '112:1', surah: 112, ayah: 1, name: 'Al-Ikhlas' },
  { ref: '55:13', surah: 55, ayah: 13, name: 'Ar-Rahman 55:13' },
];

export default function QuranVerseFinderTool({ uiConfig }: QuranVerseFinderToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSurah, setSelectedSurah] = useState<string>('');
  const [selectedAyah, setSelectedAyah] = useState<string>('');
  const [foundVerse, setFoundVerse] = useState<Verse | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showArabic, setShowArabic] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as { reference?: string; surah?: number };
      if (params.reference) {
        setSearchQuery(params.reference);
      }
      if (params.surah) {
        setSelectedSurah(params.surah.toString());
      }
    }

    // Load favorites from localStorage
    const saved = localStorage.getItem('quranFavorites');
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  }, [uiConfig?.params]);

  const getAyahsForSurah = (surahNum: number): number[] => {
    const surah = SAMPLE_SURAHS[surahNum];
    return surah ? Object.keys(surah.verses).map(Number).sort((a, b) => a - b) : [];
  };

  const searchVerse = () => {
    setLoading(true);
    setError('');
    setFoundVerse(null);

    try {
      // Parse search query like "2:255" or "Al-Fatihah 1"
      const match = searchQuery.match(/^(\d+):(\d+)$/);

      if (match) {
        const [, surahStr, ayahStr] = match;
        const surahNum = parseInt(surahStr);
        const ayahNum = parseInt(ayahStr);

        const surah = SAMPLE_SURAHS[surahNum];
        if (surah && surah.verses[ayahNum]) {
          setFoundVerse({
            surah: surahNum,
            surahName: surah.name,
            surahArabic: surah.arabic,
            ayah: ayahNum,
            textArabic: surah.verses[ayahNum].arabic,
            textEnglish: surah.verses[ayahNum].english,
            reference: `${surah.name} ${surahNum}:${ayahNum}`,
          });
        } else {
          setError('Verse not found in our database. Try a popular verse from the suggestions.');
        }
      } else if (selectedSurah && selectedAyah) {
        const surahNum = parseInt(selectedSurah);
        const ayahNum = parseInt(selectedAyah);

        const surah = SAMPLE_SURAHS[surahNum];
        if (surah && surah.verses[ayahNum]) {
          setFoundVerse({
            surah: surahNum,
            surahName: surah.name,
            surahArabic: surah.arabic,
            ayah: ayahNum,
            textArabic: surah.verses[ayahNum].arabic,
            textEnglish: surah.verses[ayahNum].english,
            reference: `${surah.name} ${surahNum}:${ayahNum}`,
          });
        } else {
          setError('Verse not found in our database.');
        }
      } else {
        setError('Please enter a verse reference (e.g., "2:255") or select from the dropdowns.');
      }
    } catch (err) {
      setError('Error searching verse. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadPopularVerse = (ref: { surah: number; ayah: number }) => {
    setSelectedSurah(ref.surah.toString());
    setSelectedAyah(ref.ayah.toString());
    setSearchQuery(`${ref.surah}:${ref.ayah}`);

    const surah = SAMPLE_SURAHS[ref.surah];
    if (surah && surah.verses[ref.ayah]) {
      setFoundVerse({
        surah: ref.surah,
        surahName: surah.name,
        surahArabic: surah.arabic,
        ayah: ref.ayah,
        textArabic: surah.verses[ref.ayah].arabic,
        textEnglish: surah.verses[ref.ayah].english,
        reference: `${surah.name} ${ref.surah}:${ref.ayah}`,
      });
    }
  };

  const getRandomVerse = () => {
    const allVerses: { surah: number; ayah: number }[] = [];

    Object.entries(SAMPLE_SURAHS).forEach(([surahNum, surah]) => {
      Object.keys(surah.verses).forEach((ayahNum) => {
        allVerses.push({ surah: parseInt(surahNum), ayah: parseInt(ayahNum) });
      });
    });

    const random = allVerses[Math.floor(Math.random() * allVerses.length)];
    loadPopularVerse(random);
  };

  const copyVerse = () => {
    if (foundVerse) {
      const text = showArabic && showTranslation
        ? `${foundVerse.textArabic}\n\n"${foundVerse.textEnglish}"\n- ${foundVerse.reference}`
        : showArabic
        ? `${foundVerse.textArabic}\n- ${foundVerse.reference}`
        : `"${foundVerse.textEnglish}"\n- ${foundVerse.reference}`;

      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleFavorite = () => {
    if (foundVerse) {
      const ref = `${foundVerse.surah}:${foundVerse.ayah}`;
      let newFavorites: string[];

      if (favorites.includes(ref)) {
        newFavorites = favorites.filter(f => f !== ref);
      } else {
        newFavorites = [...favorites, ref];
      }

      setFavorites(newFavorites);
      localStorage.setItem('quranFavorites', JSON.stringify(newFavorites));
    }
  };

  const shareVerse = () => {
    if (foundVerse && navigator.share) {
      navigator.share({
        title: foundVerse.reference,
        text: `${foundVerse.textEnglish}\n- ${foundVerse.reference}`,
      });
    }
  };

  const reset = () => {
    setSearchQuery('');
    setSelectedSurah('');
    setSelectedAyah('');
    setFoundVerse(null);
    setError('');
  };

  const currentFavRef = foundVerse ? `${foundVerse.surah}:${foundVerse.ayah}` : '';

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-2xl mx-auto">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#0D9488] rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.quranVerseFinder.quranVerseFinder', 'Quran Verse Finder')}
              </h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.quranVerseFinder.searchAndReadQuranVerses', 'Search and read Quran verses with translation')}
              </p>
            </div>
          </div>

          {/* Search Input */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.quranVerseFinder.searchByReference', 'Search by Reference')}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='e.g., "2:255" or "112:1"'
                onKeyDown={(e) => e.key === 'Enter' && searchVerse()}
                className={`flex-1 px-4 py-3 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              />
              <button
                onClick={searchVerse}
                disabled={loading}
                className="px-4 py-3 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Browse by Selection */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.quranVerseFinder.orBrowseBySurah', 'Or Browse by Surah')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={selectedSurah}
                onChange={(e) => {
                  setSelectedSurah(e.target.value);
                  setSelectedAyah('');
                }}
                className={`px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              >
                <option value="">{t('tools.quranVerseFinder.selectSurah', 'Select Surah')}</option>
                {Object.entries(SAMPLE_SURAHS).map(([num, surah]) => (
                  <option key={num} value={num}>
                    {num}. {surah.name} ({surah.arabic})
                  </option>
                ))}
              </select>
              <select
                value={selectedAyah}
                onChange={(e) => setSelectedAyah(e.target.value)}
                disabled={!selectedSurah}
                className={`px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488] disabled:opacity-50`}
              >
                <option value="">{t('tools.quranVerseFinder.selectAyah', 'Select Ayah')}</option>
                {selectedSurah && getAyahsForSurah(parseInt(selectedSurah)).map((ayah) => (
                  <option key={ayah} value={ayah}>Ayah {ayah}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Display Options */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.quranVerseFinder.displayOptions', 'Display Options')}
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showArabic}
                  onChange={(e) => setShowArabic(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                />
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.quranVerseFinder.arabic', 'Arabic')}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showTranslation}
                  onChange={(e) => setShowTranslation(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
                />
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t('tools.quranVerseFinder.englishTranslation', 'English Translation')}</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={searchVerse}
              disabled={loading}
              className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              Find Verse
            </button>
            <button
              onClick={getRandomVerse}
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('tools.quranVerseFinder.random', 'Random')}
            </button>
            <button
              onClick={reset}
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('tools.quranVerseFinder.reset', 'Reset')}
            </button>
          </div>

          {/* Popular Verses */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.quranVerseFinder.popularVerses', 'Popular Verses')}
            </label>
            <div className="flex flex-wrap gap-2">
              {POPULAR_VERSES.map((pv) => (
                <button
                  key={pv.ref}
                  onClick={() => loadPopularVerse(pv)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    theme === 'dark'
                      ? t('tools.quranVerseFinder.bgGray700TextGray', 'bg-gray-700 text-gray-300 hover:bg-[#0D9488] hover:text-white') : t('tools.quranVerseFinder.bgGray200TextGray', 'bg-gray-200 text-gray-700 hover:bg-[#0D9488] hover:text-white')
                  }`}
                >
                  {pv.name}
                </button>
              ))}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Verse Display */}
          {foundVerse && (
            <div className={`p-6 rounded-lg border-l-4 border-[#0D9488] ${
              theme === 'dark' ? 'bg-gray-700' : t('tools.quranVerseFinder.bg0d948810', 'bg-[#0D9488]/10')
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-[#0D9488]" />
                  <div>
                    <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {foundVerse.surahName} ({foundVerse.surahArabic})
                    </h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Surah {foundVerse.surah}, Ayah {foundVerse.ayah}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={toggleFavorite}
                    className={`p-2 rounded-lg transition-colors ${
                      favorites.includes(currentFavRef)
                        ? 'bg-red-500 text-white'
                        : theme === 'dark'
                        ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${favorites.includes(currentFavRef) ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={copyVerse}
                    className={`p-2 rounded-lg transition-colors ${
                      theme === 'dark'
                        ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                  {navigator.share && (
                    <button
                      onClick={shareVerse}
                      className={`p-2 rounded-lg transition-colors ${
                        theme === 'dark'
                          ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {showArabic && (
                <div className={`text-2xl leading-loose mb-4 text-right font-arabic ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`} dir="rtl">
                  {foundVerse.textArabic}
                </div>
              )}

              {showTranslation && (
                <blockquote className={`text-lg leading-relaxed italic ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  "{foundVerse.textEnglish}"
                </blockquote>
              )}

              <div className={`mt-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.quranVerseFinder.translationSahihInternational', '- Translation: Sahih International')}
              </div>
            </div>
          )}

          {/* Favorites */}
          {favorites.length > 0 && (
            <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <h3 className={`font-semibold mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <Heart className="w-4 h-4 text-red-500" />
                {t('tools.quranVerseFinder.yourFavorites', 'Your Favorites')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {favorites.map((fav) => {
                  const [surahNum, ayahNum] = fav.split(':').map(Number);
                  const surah = SAMPLE_SURAHS[surahNum];
                  return (
                    <button
                      key={fav}
                      onClick={() => loadPopularVerse({ surah: surahNum, ayah: ayahNum })}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        theme === 'dark'
                          ? t('tools.quranVerseFinder.bgGray600TextGray', 'bg-gray-600 text-gray-300 hover:bg-[#0D9488] hover:text-white') : t('tools.quranVerseFinder.bgWhiteTextGray700', 'bg-white text-gray-700 hover:bg-[#0D9488] hover:text-white')
                      }`}
                    >
                      {surah ? `${surah.name} ${fav}` : fav}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              This tool provides selected verses from the Quran with Sahih International translation.
              For the complete Quran, consider using a dedicated Quran app or website.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
