import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Book, Search, Copy, Check, Bookmark, Heart, Share2, RefreshCw } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';

interface Verse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  reference: string;
}

interface BibleVerseFinderToolProps {
  uiConfig?: UIConfig;
}

// Sample verses database (in production, this would come from an API)
const SAMPLE_VERSES: Record<string, Record<number, Record<number, string>>> = {
  'Genesis': {
    1: {
      1: 'In the beginning God created the heavens and the earth.',
      2: 'Now the earth was formless and empty, darkness was over the surface of the deep, and the Spirit of God was hovering over the waters.',
      3: 'And God said, "Let there be light," and there was light.',
      26: 'Then God said, "Let us make mankind in our image, in our likeness, so that they may rule over the fish in the sea and the birds in the sky, over the livestock and all the wild animals, and over all the creatures that move along the ground."',
      27: 'So God created mankind in his own image, in the image of God he created them; male and female he created them.',
    },
  },
  'Psalms': {
    23: {
      1: 'The Lord is my shepherd, I lack nothing.',
      2: 'He makes me lie down in green pastures, he leads me beside quiet waters,',
      3: 'he refreshes my soul. He guides me along the right paths for his name\'s sake.',
      4: 'Even though I walk through the darkest valley, I will fear no evil, for you are with me; your rod and your staff, they comfort me.',
      5: 'You prepare a table before me in the presence of my enemies. You anoint my head with oil; my cup overflows.',
      6: 'Surely your goodness and love will follow me all the days of my life, and I will dwell in the house of the Lord forever.',
    },
    91: {
      1: 'Whoever dwells in the shelter of the Most High will rest in the shadow of the Almighty.',
      2: 'I will say of the Lord, "He is my refuge and my fortress, my God, in whom I trust."',
      11: 'For he will command his angels concerning you to guard you in all your ways;',
    },
    119: {
      105: 'Your word is a lamp for my feet, a light on my path.',
    },
  },
  'Proverbs': {
    3: {
      5: 'Trust in the Lord with all your heart and lean not on your own understanding;',
      6: 'in all your ways submit to him, and he will make your paths straight.',
    },
    22: {
      6: 'Start children off on the way they should go, and even when they are old they will not turn from it.',
    },
  },
  'Isaiah': {
    40: {
      31: 'but those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.',
    },
    41: {
      10: 'So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.',
    },
  },
  'Jeremiah': {
    29: {
      11: '"For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you, plans to give you hope and a future."',
    },
  },
  'Matthew': {
    5: {
      3: 'Blessed are the poor in spirit, for theirs is the kingdom of heaven.',
      4: 'Blessed are those who mourn, for they will be comforted.',
      5: 'Blessed are the meek, for they will inherit the earth.',
      6: 'Blessed are those who hunger and thirst for righteousness, for they will be filled.',
      7: 'Blessed are the merciful, for they will be shown mercy.',
      8: 'Blessed are the pure in heart, for they will see God.',
      9: 'Blessed are the peacemakers, for they will be called children of God.',
    },
    6: {
      33: 'But seek first his kingdom and his righteousness, and all these things will be given to you as well.',
    },
    28: {
      19: 'Therefore go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit,',
      20: 'and teaching them to obey everything I have commanded you. And surely I am with you always, to the very end of the age."',
    },
  },
  'John': {
    3: {
      16: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
      17: 'For God did not send his Son into the world to condemn the world, but to save the world through him.',
    },
    14: {
      6: 'Jesus answered, "I am the way and the truth and the life. No one comes to the Father except through me.',
      27: 'Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.',
    },
  },
  'Romans': {
    8: {
      28: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.',
      31: 'What, then, shall we say in response to these things? If God is for us, who can be against us?',
    },
    12: {
      2: 'Do not conform to the pattern of this world, but be transformed by the renewing of your mind. Then you will be able to test and approve what God\'s will is—his good, pleasing and perfect will.',
    },
  },
  'Philippians': {
    4: {
      6: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.',
      7: 'And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.',
      13: 'I can do all this through him who gives me strength.',
    },
  },
};

const BIBLE_BOOKS = Object.keys(SAMPLE_VERSES);

const POPULAR_VERSES = [
  { ref: 'John 3:16', book: 'John', chapter: 3, verse: 16 },
  { ref: 'Psalm 23:1', book: 'Psalms', chapter: 23, verse: 1 },
  { ref: 'Jeremiah 29:11', book: 'Jeremiah', chapter: 29, verse: 11 },
  { ref: 'Philippians 4:13', book: 'Philippians', chapter: 4, verse: 13 },
  { ref: 'Romans 8:28', book: 'Romans', chapter: 8, verse: 28 },
  { ref: 'Proverbs 3:5', book: 'Proverbs', chapter: 3, verse: 5 },
];

export default function BibleVerseFinderTool({ uiConfig }: BibleVerseFinderToolProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [selectedVerse, setSelectedVerse] = useState<string>('');
  const [foundVerse, setFoundVerse] = useState<Verse | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as { reference?: string; book?: string };
      if (params.reference) {
        setSearchQuery(params.reference);
      }
      if (params.book) {
        setSelectedBook(params.book);
      }
    }

    // Load favorites from localStorage
    const saved = localStorage.getItem('bibleFavorites');
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  }, [uiConfig?.params]);

  const getChaptersForBook = (book: string): number[] => {
    const chapters = SAMPLE_VERSES[book];
    return chapters ? Object.keys(chapters).map(Number).sort((a, b) => a - b) : [];
  };

  const getVersesForChapter = (book: string, chapter: number): number[] => {
    const verses = SAMPLE_VERSES[book]?.[chapter];
    return verses ? Object.keys(verses).map(Number).sort((a, b) => a - b) : [];
  };

  const searchVerse = () => {
    setLoading(true);
    setError('');
    setFoundVerse(null);

    try {
      // Parse search query like "John 3:16" or "Psalm 23:1"
      const match = searchQuery.match(/^(\d?\s*[A-Za-z]+)\s+(\d+):(\d+)$/);

      if (match) {
        const [, bookPart, chapterStr, verseStr] = match;
        const book = bookPart.trim();
        const chapter = parseInt(chapterStr);
        const verse = parseInt(verseStr);

        // Find matching book
        const foundBook = BIBLE_BOOKS.find(b =>
          b.toLowerCase().startsWith(book.toLowerCase())
        );

        if (foundBook && SAMPLE_VERSES[foundBook]?.[chapter]?.[verse]) {
          setFoundVerse({
            book: foundBook,
            chapter,
            verse,
            text: SAMPLE_VERSES[foundBook][chapter][verse],
            reference: `${foundBook} ${chapter}:${verse}`,
          });
        } else {
          setError('Verse not found in our database. Try a popular verse from the suggestions.');
        }
      } else if (selectedBook && selectedChapter && selectedVerse) {
        const chapter = parseInt(selectedChapter);
        const verse = parseInt(selectedVerse);

        if (SAMPLE_VERSES[selectedBook]?.[chapter]?.[verse]) {
          setFoundVerse({
            book: selectedBook,
            chapter,
            verse,
            text: SAMPLE_VERSES[selectedBook][chapter][verse],
            reference: `${selectedBook} ${chapter}:${verse}`,
          });
        } else {
          setError('Verse not found in our database.');
        }
      } else {
        setError('Please enter a verse reference (e.g., "John 3:16") or select from the dropdowns.');
      }
    } catch (err) {
      setError('Error searching verse. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadPopularVerse = (ref: { book: string; chapter: number; verse: number }) => {
    setSelectedBook(ref.book);
    setSelectedChapter(ref.chapter.toString());
    setSelectedVerse(ref.verse.toString());
    setSearchQuery(`${ref.book} ${ref.chapter}:${ref.verse}`);

    if (SAMPLE_VERSES[ref.book]?.[ref.chapter]?.[ref.verse]) {
      setFoundVerse({
        book: ref.book,
        chapter: ref.chapter,
        verse: ref.verse,
        text: SAMPLE_VERSES[ref.book][ref.chapter][ref.verse],
        reference: `${ref.book} ${ref.chapter}:${ref.verse}`,
      });
    }
  };

  const getRandomVerse = () => {
    const allVerses: Verse[] = [];

    Object.entries(SAMPLE_VERSES).forEach(([book, chapters]) => {
      Object.entries(chapters).forEach(([chapter, verses]) => {
        Object.entries(verses).forEach(([verse, text]) => {
          allVerses.push({
            book,
            chapter: parseInt(chapter),
            verse: parseInt(verse),
            text,
            reference: `${book} ${chapter}:${verse}`,
          });
        });
      });
    });

    const random = allVerses[Math.floor(Math.random() * allVerses.length)];
    setFoundVerse(random);
    setSearchQuery(random.reference);
  };

  const copyVerse = () => {
    if (foundVerse) {
      navigator.clipboard.writeText(`"${foundVerse.text}" - ${foundVerse.reference} (NIV)`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleFavorite = () => {
    if (foundVerse) {
      const ref = foundVerse.reference;
      let newFavorites: string[];

      if (favorites.includes(ref)) {
        newFavorites = favorites.filter(f => f !== ref);
      } else {
        newFavorites = [...favorites, ref];
      }

      setFavorites(newFavorites);
      localStorage.setItem('bibleFavorites', JSON.stringify(newFavorites));
    }
  };

  const shareVerse = () => {
    if (foundVerse && navigator.share) {
      navigator.share({
        title: foundVerse.reference,
        text: `"${foundVerse.text}" - ${foundVerse.reference} (NIV)`,
      });
    }
  };

  const reset = () => {
    setSearchQuery('');
    setSelectedBook('');
    setSelectedChapter('');
    setSelectedVerse('');
    setFoundVerse(null);
    setError('');
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} py-8 px-4`}>
      <div className="max-w-2xl mx-auto">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#0D9488] rounded-lg">
              <Book className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('tools.bibleVerseFinder.bibleVerseFinder', 'Bible Verse Finder')}
              </h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.bibleVerseFinder.searchAndReadBibleVerses', 'Search and read Bible verses (NIV)')}
              </p>
            </div>
          </div>

          {/* Search Input */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.bibleVerseFinder.searchByReference', 'Search by Reference')}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='e.g., "John 3:16" or "Psalm 23:1"'
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
              {t('tools.bibleVerseFinder.orBrowse', 'Or Browse')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <select
                value={selectedBook}
                onChange={(e) => {
                  setSelectedBook(e.target.value);
                  setSelectedChapter('');
                  setSelectedVerse('');
                }}
                className={`px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488]`}
              >
                <option value="">{t('tools.bibleVerseFinder.book', 'Book')}</option>
                {BIBLE_BOOKS.map((book) => (
                  <option key={book} value={book}>{book}</option>
                ))}
              </select>
              <select
                value={selectedChapter}
                onChange={(e) => {
                  setSelectedChapter(e.target.value);
                  setSelectedVerse('');
                }}
                disabled={!selectedBook}
                className={`px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488] disabled:opacity-50`}
              >
                <option value="">{t('tools.bibleVerseFinder.chapter', 'Chapter')}</option>
                {selectedBook && getChaptersForBook(selectedBook).map((ch) => (
                  <option key={ch} value={ch}>{ch}</option>
                ))}
              </select>
              <select
                value={selectedVerse}
                onChange={(e) => setSelectedVerse(e.target.value)}
                disabled={!selectedChapter}
                className={`px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-[#0D9488] disabled:opacity-50`}
              >
                <option value="">{t('tools.bibleVerseFinder.verse', 'Verse')}</option>
                {selectedBook && selectedChapter && getVersesForChapter(selectedBook, parseInt(selectedChapter)).map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
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
              {t('tools.bibleVerseFinder.random', 'Random')}
            </button>
            <button
              onClick={reset}
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('tools.bibleVerseFinder.reset', 'Reset')}
            </button>
          </div>

          {/* Popular Verses */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('tools.bibleVerseFinder.popularVerses', 'Popular Verses')}
            </label>
            <div className="flex flex-wrap gap-2">
              {POPULAR_VERSES.map((pv) => (
                <button
                  key={pv.ref}
                  onClick={() => loadPopularVerse(pv)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    theme === 'dark'
                      ? t('tools.bibleVerseFinder.bgGray700TextGray', 'bg-gray-700 text-gray-300 hover:bg-[#0D9488] hover:text-white') : t('tools.bibleVerseFinder.bgGray200TextGray', 'bg-gray-200 text-gray-700 hover:bg-[#0D9488] hover:text-white')
                  }`}
                >
                  {pv.ref}
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
              theme === 'dark' ? 'bg-gray-700' : t('tools.bibleVerseFinder.bg0d948810', 'bg-[#0D9488]/10')
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-[#0D9488]" />
                  <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {foundVerse.reference}
                  </h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={toggleFavorite}
                    className={`p-2 rounded-lg transition-colors ${
                      favorites.includes(foundVerse.reference)
                        ? 'bg-red-500 text-white'
                        : theme === 'dark'
                        ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${favorites.includes(foundVerse.reference) ? 'fill-current' : ''}`} />
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

              <blockquote className={`text-lg leading-relaxed italic ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                "{foundVerse.text}"
              </blockquote>

              <div className={`mt-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('tools.bibleVerseFinder.newInternationalVersionNiv', '- New International Version (NIV)')}
              </div>
            </div>
          )}

          {/* Favorites */}
          {favorites.length > 0 && (
            <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <h3 className={`font-semibold mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <Heart className="w-4 h-4 text-red-500" />
                {t('tools.bibleVerseFinder.yourFavorites', 'Your Favorites')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {favorites.map((fav) => (
                  <button
                    key={fav}
                    onClick={() => setSearchQuery(fav)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      theme === 'dark'
                        ? t('tools.bibleVerseFinder.bgGray600TextGray', 'bg-gray-600 text-gray-300 hover:bg-[#0D9488] hover:text-white') : t('tools.bibleVerseFinder.bgWhiteTextGray700', 'bg-white text-gray-700 hover:bg-[#0D9488] hover:text-white')
                    }`}
                  >
                    {fav}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              This tool provides verses from the New International Version (NIV). For the full Bible,
              consider using a dedicated Bible app or website.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
