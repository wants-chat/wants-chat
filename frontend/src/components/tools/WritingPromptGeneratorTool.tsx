import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PenTool, Shuffle, Heart, Calendar, BookOpen, User, FileText, Info, Star, Clock, Sparkles } from 'lucide-react';
import { useConfirmDialog } from '../ui/ConfirmDialog';
import { useTheme } from '../../contexts/ThemeContext';
import { UIConfig } from '../ContextualUI';
import { ToolPrefillData } from '../../services/toolPrefillService';
import ExportDropdown from '../ui/ExportDropdown';
import { SyncStatus } from '../ui/SyncStatus';
import { WidgetEmbedButton } from '../ui/WidgetEmbedButton';
import { useToolData } from '../../hooks/useToolData';
import { type ColumnConfig } from '../../lib/toolDataUtils';

type Genre = 'fantasy' | 'scifi' | 'romance' | 'mystery' | 'horror' | 'literary' | 'adventure' | 'historical';
type PromptType = 'firstLine' | 'scenario' | 'character';

interface GenreConfig {
  name: string;
  icon: string;
  color: string;
}

interface WritingPrompt {
  id: string;
  text: string;
  genre: Genre;
  type: PromptType;
  wordCountChallenge: number;
}

interface FavoritePrompt extends WritingPrompt {
  savedAt: Date;
}

const PROMPTS_DATA: Record<Genre, Record<PromptType, string[]>> = {
  fantasy: {
    firstLine: [
      'The dragon had been sleeping beneath the castle for a thousand years, but today, someone finally woke it.',
      'She discovered she could see magic the day her grandmother died.',
      'The map showed a kingdom that shouldn\'t exist anymore.',
      'Every night at midnight, the statues in the garden came alive.',
      'The witch\'s curse was supposed to end at sunrise, but the sun never rose.',
    ],
    scenario: [
      'A young mage accidentally binds their soul to a dying phoenix and must find a way to save them both.',
      'The kingdom\'s only heir discovers they have no magical abilities in a world where royalty must be magical.',
      'A dragon hunter falls in love with the dragon they were sent to kill.',
      'The barrier between the human world and the fae realm begins to crumble during a royal wedding.',
      'An ancient spell causes everyone in the kingdom to forget their identities.',
    ],
    character: [
      'A librarian who can enter the worlds of any book they read.',
      'A knight sworn to protect a princess who is secretly more powerful than any army.',
      'A merchant who trades in dreams and memories.',
      'A child who can see the true forms of magical creatures disguised as humans.',
      'A healer whose touch can cure anything except their own mysterious illness.',
    ],
  },
  scifi: {
    firstLine: [
      'The AI had been pretending to be stupid for exactly 47 years, 3 months, and 12 days.',
      'First contact wasn\'t what anyone expected, especially since the aliens only wanted to talk to cats.',
      'She woke up on a space station with no memory of how she got there or why everyone was dead.',
      'The time traveler\'s biggest problem wasn\'t changing the past, it was dealing with the paperwork.',
      'Mars had been colonized for fifty years before anyone discovered what was buried beneath the surface.',
    ],
    scenario: [
      'A crew of salvagers discovers a derelict ship containing technology that could change humanity forever.',
      'Earth receives a message from deep space warning them about an approaching fleet... that left a million years ago.',
      'A scientist creates a machine that can predict the future, only to see their own death in every timeline.',
      'Humanity\'s first interstellar colony loses contact with Earth and must survive on their own for generations.',
      'An android develops emotions but must hide this to avoid being decommissioned.',
    ],
    character: [
      'A bounty hunter who specializes in tracking down rogue AIs.',
      'The last human born on Earth after the great migration to the stars.',
      'A diplomat tasked with negotiating peace between three warring alien species.',
      'A hacker who can interface directly with machines using neural implants.',
      'A clone who discovers they\'re the 47th iteration and the previous 46 all died mysteriously.',
    ],
  },
  romance: {
    firstLine: [
      'Of all the coffee shops in the city, he had to walk into hers.',
      'The wedding invitation arrived exactly one year after she thought she\'d gotten over him.',
      'She didn\'t believe in love at first sight until she tripped and fell into his arms.',
      'The dating app matched them at 98%, but they\'d already met, and it hadn\'t gone well.',
      'He was the last person she expected to see at her ex\'s funeral.',
    ],
    scenario: [
      'Two rival food truck owners compete for the same spot at a summer festival.',
      'A fake dating arrangement for a friend\'s wedding starts to feel all too real.',
      'Childhood sweethearts reunite after twenty years when they both inherit the same beach house.',
      'A famous author falls for their biggest critic.',
      'Two strangers agree to be each other\'s plus-one for all events for one year.',
    ],
    character: [
      'A wedding planner who doesn\'t believe in marriage.',
      'A romance novelist who has never been in love.',
      'A grumpy bookshop owner who reluctantly helps a cheerful tourist.',
      'A professional matchmaker whose own love life is a disaster.',
      'A musician who writes love songs about a person they\'ve never met.',
    ],
  },
  mystery: {
    firstLine: [
      'The victim had been dead for exactly twelve hours, but the murder wouldn\'t happen until tomorrow.',
      'Detective Chen found the letter on her desk: "They\'re going to kill me at midnight. Don\'t try to save me."',
      'The body was impossible to identify because it had her face.',
      'Everyone at the dinner party had a motive, but none of them remembered the last three hours.',
      'The locked room had no windows, no hidden doors, and a dead man who couldn\'t possibly have killed himself.',
    ],
    scenario: [
      'A cold case from 30 years ago reopens when someone starts recreating the original crimes.',
      'A detective investigates murders that match the plots of an unpublished manuscript.',
      'A small town\'s residents all receive anonymous letters revealing their darkest secrets.',
      'A witness to a crime can\'t remember what they saw, but the killer doesn\'t know that.',
      'The only suspect in a high-profile case has an airtight alibi: they were in a coma.',
    ],
    character: [
      'A forensic accountant who solves murders by following the money.',
      'A retired detective haunted by the one case they never solved.',
      'A true crime podcaster who accidentally stumbles onto a real conspiracy.',
      'A defense attorney who only takes cases where they believe the client is innocent.',
      'A medium who may or may not actually be able to communicate with murder victims.',
    ],
  },
  horror: {
    firstLine: [
      'The house had been empty for years, but someone was still paying the electricity bill.',
      'She recognized the voice on the radio, which was impossible because she\'d buried him last month.',
      'The children in the neighborhood had a new game: they called it "Don\'t look at the man in the window."',
      'He found his own name carved into the old tree, followed by yesterday\'s date.',
      'The thing in the basement only came upstairs when someone said its name, but nobody knew what it was.',
    ],
    scenario: [
      'A family moves into their dream home, unaware that it exists simultaneously in two different realities.',
      'A support group for people who\'ve survived near-death experiences discovers they all saw the same thing.',
      'Every night at 3 AM, someone knocks on the door, but there\'s never anyone there.',
      'A remote research station goes dark, and the rescue team finds everyone dead except one survivor who won\'t speak.',
      'A viral video shows something impossible in the background, and everyone who watches it starts experiencing the same nightmare.',
    ],
    character: [
      'A sleep researcher who can enter other people\'s nightmares.',
      'A paranormal investigator who has never actually encountered anything supernatural... until now.',
      'A mortician who notices that some of their clients are still breathing.',
      'A child whose imaginary friend is becoming dangerously real.',
      'A therapist whose patients all describe the same monster in their sessions.',
    ],
  },
  literary: {
    firstLine: [
      'The summer I learned to lie was the summer everything changed.',
      'My mother kept exactly three secrets from my father, and I was one of them.',
      'The last honest conversation I had with my brother was the day before his accident.',
      'She spent forty years in a marriage she didn\'t choose, and she was finally about to do something about it.',
      'The letter arrived exactly ten years too late.',
    ],
    scenario: [
      'Three generations of women gather for a grandmother\'s 90th birthday, each carrying secrets that could tear the family apart.',
      'A man returns to his hometown for the first time in 20 years to confront the friend who betrayed him.',
      'Two estranged siblings must care for their ailing parent together.',
      'A woman discovers her deceased mother was living a double life.',
      'A teacher\'s relationship with a former student resurfaces 15 years later.',
    ],
    character: [
      'A middle-aged professor questioning every choice that led to their current life.',
      'A caregiver for a dying artist who begins to see the world differently.',
      'A woman who discovers letters from the child she gave up for adoption 30 years ago.',
      'A man who returns home to find his childhood best friend has become someone unrecognizable.',
      'An immigrant grandmother who carries the weight of two countries and two identities.',
    ],
  },
  adventure: {
    firstLine: [
      'The treasure map had been passed down for seven generations, but no one had ever been brave enough to use it.',
      'She didn\'t set out to become a pirate; she just needed to get off this island.',
      'The expedition was only supposed to take two weeks, but that was six months ago.',
      'He found the hidden entrance by accident, tripping over a root and falling through the ground.',
      'The last explorer to enter this jungle never came out, and her journal was the only clue to what happened.',
    ],
    scenario: [
      'A group of treasure hunters race against a rival team to find a legendary lost city.',
      'An archaeologist discovers an artifact that seems to react to their presence.',
      'A pilot crash-lands in an uncharted region and must survive with only what they can salvage.',
      'A sailor is shipwrecked on an island that doesn\'t appear on any map.',
      'A mountaineering team discovers something ancient frozen in the ice.',
    ],
    character: [
      'A cartographer who dreams of exploring the blank spaces on their own maps.',
      'A retired adventurer who takes on one last expedition to save an old friend.',
      'A young heir who must prove themselves by completing an impossible quest.',
      'A guide who knows every trail in the wilderness but has never ventured beyond the mountains.',
      'A scholar who discovers that the myths they\'ve studied are actually true.',
    ],
  },
  historical: {
    firstLine: [
      'The letter from the king arrived on the morning of her wedding, changing everything.',
      'He was the last man anyone expected to survive the voyage, but here he was, the only one left.',
      'She knew the risks of what she was doing, but someone had to document the truth.',
      'The fire that destroyed the library also destroyed the only evidence of what really happened.',
      'They called it the war to end all wars, but he knew better.',
    ],
    scenario: [
      'A servant in a noble household discovers a plot that could change the course of history.',
      'Two soldiers from opposing armies become unlikely allies to survive behind enemy lines.',
      'A woman disguises herself as a man to join an expedition that will change the world.',
      'A scholar must choose between their loyalty to the church and their pursuit of scientific truth.',
      'A spy for the resistance falls in love with someone on the wrong side.',
    ],
    character: [
      'A court physician who becomes entangled in royal intrigue.',
      'A merchant whose trade routes give them access to secrets from across the known world.',
      'A former soldier who has become a pacifist but must take up arms one last time.',
      'A nun who secretly preserves forbidden knowledge in her monastery.',
      'An artist commissioned to paint the portrait of someone who is not what they seem.',
    ],
  },
};

const WORD_COUNT_CHALLENGES = [100, 250, 500, 1000, 2500, 5000];

const COLUMNS = [
  { key: 'text', label: 'Prompt Text' },
  { key: 'genre', label: 'Genre' },
  { key: 'type', label: 'Type' },
  { key: 'wordCountChallenge', label: 'Word Count Challenge' },
  { key: 'savedAt', label: 'Saved At' },
];

// Column configuration for useToolData
const favoriteColumns: ColumnConfig[] = [
  { key: 'id', header: 'ID', type: 'string' },
  { key: 'text', header: 'Prompt Text', type: 'string' },
  { key: 'genre', header: 'Genre', type: 'string' },
  { key: 'type', header: 'Type', type: 'string' },
  { key: 'wordCountChallenge', header: 'Word Count Challenge', type: 'number' },
  { key: 'savedAt', header: 'Saved At', type: 'date' },
];

interface WritingPromptGeneratorToolProps {
  uiConfig?: UIConfig;
}

export const WritingPromptGeneratorTool: React.FC<WritingPromptGeneratorToolProps> = ({ uiConfig }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [isEditFromGallery, setIsEditFromGallery] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const [selectedGenre, setSelectedGenre] = useState<Genre | 'all'>('all');
  const [selectedType, setSelectedType] = useState<PromptType | 'all'>('all');

  // Handle prefill from uiConfig or gallery edit
  useEffect(() => {
    if (uiConfig?.params) {
      const params = uiConfig.params as Record<string, any>;
      let hasPrefill = false;

      // If editing from gallery, restore all saved fields
      if (params.isEditFromGallery) {
        setIsEditFromGallery(true);
        // Restore form fields
        if (params.genre && ['fantasy', 'scifi', 'romance', 'mystery', 'horror', 'literary', 'adventure', 'historical', 'all'].includes(params.genre)) {
          setSelectedGenre(params.genre as Genre | 'all');
          hasPrefill = true;
        }
        if (params.promptType && ['firstLine', 'scenario', 'character', 'all'].includes(params.promptType)) {
          setSelectedType(params.promptType as PromptType | 'all');
          hasPrefill = true;
        }
        if (params.wordCountChallenge) {
          setWordCountChallenge(typeof params.wordCountChallenge === 'string' ? parseInt(params.wordCountChallenge) : params.wordCountChallenge);
          hasPrefill = true;
        }
        // Restore the current prompt
        if (params.text && params.genre && params.type) {
          setCurrentPrompt({
            id: params.id || `restored-${Date.now()}`,
            text: params.text,
            genre: params.genre as Genre,
            type: params.type as PromptType,
            wordCountChallenge: params.wordCountChallenge || 500,
          });
          hasPrefill = true;
        }
      } else if (uiConfig?.prefillData && !isPrefilled) {
        setIsEditFromGallery(false);
        // Original prefill logic
        const data = uiConfig.prefillData;
        if (data.genre && ['fantasy', 'scifi', 'romance', 'mystery', 'horror', 'literary', 'adventure', 'historical', 'all'].includes(data.genre as string)) {
          setSelectedGenre(data.genre as Genre | 'all');
          hasPrefill = true;
        }
        if (data.promptType && ['firstLine', 'scenario', 'character', 'all'].includes(data.promptType as string)) {
          setSelectedType(data.promptType as PromptType | 'all');
          hasPrefill = true;
        }
      }

      setIsPrefilled(hasPrefill);
    }
  }, [uiConfig, isPrefilled]);
  const [wordCountChallenge, setWordCountChallenge] = useState<number>(500);
  const [currentPrompt, setCurrentPrompt] = useState<WritingPrompt | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [dailyPrompt, setDailyPrompt] = useState<WritingPrompt | null>(null);

  // Use useToolData for favorites with backend persistence
  const {
    data: favorites,
    isSynced,
    isSaving,
    lastSaved,
    syncError,
    forceSync,
    addItem,
    deleteItem,
    exportCSV,
    exportJSON,
  } = useToolData<FavoritePrompt>(
    'writing-prompt-favorites',
    [],
    favoriteColumns,
    { autoSave: true }
  );

  const genres: Record<Genre, GenreConfig> = {
    fantasy: { name: 'Fantasy', icon: '🏰', color: 'purple' },
    scifi: { name: 'Sci-Fi', icon: '🚀', color: 'blue' },
    romance: { name: 'Romance', icon: '💕', color: 'pink' },
    mystery: { name: 'Mystery', icon: '🔍', color: 'amber' },
    horror: { name: 'Horror', icon: '👻', color: 'red' },
    literary: { name: 'Literary', icon: '📚', color: 'emerald' },
    adventure: { name: 'Adventure', icon: '🗺️', color: 'orange' },
    historical: { name: 'Historical', icon: '🏛️', color: 'stone' },
  };

  const promptTypes: Record<PromptType, { name: string; icon: React.ReactNode }> = {
    firstLine: { name: 'First Line', icon: <FileText className="w-4 h-4" /> },
    scenario: { name: 'Scenario', icon: <BookOpen className="w-4 h-4" /> },
    character: { name: 'Character', icon: <User className="w-4 h-4" /> },
  };


  // Generate daily prompt based on date
  useEffect(() => {
    const today = new Date().toDateString();
    const savedDaily = localStorage.getItem('dailyWritingPrompt');

    if (savedDaily) {
      try {
        const parsed = JSON.parse(savedDaily);
        if (parsed.date === today) {
          setDailyPrompt(parsed.prompt);
          return;
        }
      } catch {
        // Ignore parse errors
      }
    }

    // Generate new daily prompt
    const allGenres = Object.keys(PROMPTS_DATA) as Genre[];
    const allTypes = Object.keys(promptTypes) as PromptType[];

    const seedDate = new Date();
    const seed = seedDate.getFullYear() * 10000 + (seedDate.getMonth() + 1) * 100 + seedDate.getDate();

    const randomGenre = allGenres[seed % allGenres.length];
    const randomType = allTypes[(seed * 7) % allTypes.length];
    const prompts = PROMPTS_DATA[randomGenre][randomType];
    const randomPrompt = prompts[(seed * 13) % prompts.length];

    const daily: WritingPrompt = {
      id: `daily-${today}`,
      text: randomPrompt,
      genre: randomGenre,
      type: randomType,
      wordCountChallenge: WORD_COUNT_CHALLENGES[(seed * 3) % WORD_COUNT_CHALLENGES.length],
    };

    setDailyPrompt(daily);
    localStorage.setItem('dailyWritingPrompt', JSON.stringify({ date: today, prompt: daily }));
  }, []);

  const generateRandomPrompt = () => {
    const availableGenres = selectedGenre === 'all'
      ? (Object.keys(PROMPTS_DATA) as Genre[])
      : [selectedGenre];

    const availableTypes = selectedType === 'all'
      ? (Object.keys(promptTypes) as PromptType[])
      : [selectedType];

    const randomGenre = availableGenres[Math.floor(Math.random() * availableGenres.length)];
    const randomType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    const prompts = PROMPTS_DATA[randomGenre][randomType];
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];

    const newPrompt: WritingPrompt = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: randomPrompt,
      genre: randomGenre,
      type: randomType,
      wordCountChallenge: wordCountChallenge,
    };

    setCurrentPrompt(newPrompt);
  };

  const toggleFavorite = (prompt: WritingPrompt) => {
    const exists = favorites.find(f => f.text === prompt.text);

    if (exists) {
      // Remove from favorites using the hook's deleteItem
      deleteItem(exists.id);
    } else {
      // Add to favorites using the hook's addItem
      const newFavorite: FavoritePrompt = {
        ...prompt,
        savedAt: new Date(),
      };
      addItem(newFavorite);

      // Call the save callback to refresh the gallery if provided
      const params = uiConfig?.params as Record<string, any>;
      if (params?.onSaveCallback && typeof params.onSaveCallback === 'function') {
        params.onSaveCallback();
      }
    }
  };

  const isFavorite = (prompt: WritingPrompt | null) => {
    if (!prompt) return false;
    return favorites.some(f => f.text === prompt.text);
  };

  const exportToCSV = () => {
    if (favorites.length === 0) {
      setValidationMessage('No favorites to export');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }
    exportCSV({ filename: 'writing-prompts' });
  };

  const exportToJSON = () => {
    if (favorites.length === 0) {
      setValidationMessage('No favorites to export');
      setTimeout(() => setValidationMessage(null), 3000);
      return;
    }
    exportJSON({ filename: 'writing-prompts' });
  };

  const getGenreColor = (genre: Genre) => {
    const colors: Record<Genre, string> = {
      fantasy: 'bg-purple-500',
      scifi: 'bg-blue-500',
      romance: 'bg-pink-500',
      mystery: 'bg-amber-500',
      horror: 'bg-red-500',
      literary: 'bg-emerald-500',
      adventure: 'bg-orange-500',
      historical: 'bg-stone-500',
    };
    return colors[genre];
  };

  const getGenreTextColor = (genre: Genre) => {
    const colors: Record<Genre, string> = {
      fantasy: 'text-purple-500',
      scifi: 'text-blue-500',
      romance: 'text-pink-500',
      mystery: 'text-amber-500',
      horror: 'text-red-500',
      literary: 'text-emerald-500',
      adventure: 'text-orange-500',
      historical: 'text-stone-500',
    };
    return colors[genre];
  };

  return (
    <>
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-indigo-900/20' : 'bg-gradient-to-r from-white to-indigo-50'} px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg"><PenTool className="w-5 h-5 text-indigo-500" /></div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.writingPromptGenerator.writingPromptGenerator', 'Writing Prompt Generator')}</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('tools.writingPromptGenerator.sparkYourCreativityWithUnique', 'Spark your creativity with unique prompts')}</p>
            </div>
          </div>
          <WidgetEmbedButton toolSlug="writing-prompt-generator" toolName="Writing Prompt Generator" />

          <SyncStatus
            isSynced={isSynced}
            isSaving={isSaving}
            lastSaved={lastSaved}
            syncError={syncError}
            onForceSync={forceSync}
            theme={isDark ? 'dark' : 'light'}
            size="sm"
          />
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Prefill Indicator */}
        {isPrefilled && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#0D9488]/10 rounded-xl border border-[#0D9488]/20">
            <Sparkles className="w-4 h-4 text-[#0D9488]" />
            <span className="text-sm text-[#0D9488] font-medium">
              {isEditFromGallery
                ? t('tools.writingPromptGenerator.contentRestoredFromYourSaved', 'Content restored from your saved gallery') : t('tools.writingPromptGenerator.contentLoadedFromYourConversation', 'Content loaded from your conversation')}
            </span>
          </div>
        )}

        {/* Daily Prompt Section */}
        {dailyPrompt && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border-indigo-800' : 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200'} border`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.writingPromptGenerator.dailyPrompt', 'Daily Prompt')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${getGenreColor(dailyPrompt.genre)} text-white`}>
                  {genres[dailyPrompt.genre].name}
                </span>
                <button
                  onClick={() => toggleFavorite(dailyPrompt)}
                  className={`p-1 rounded-full ${isFavorite(dailyPrompt) ? 'text-red-500' : isDark ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  <Heart className={`w-4 h-4 ${isFavorite(dailyPrompt) ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
            <p className={`text-sm italic ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>"{dailyPrompt.text}"</p>
            <div className={`mt-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Challenge: {dailyPrompt.wordCountChallenge} words | Type: {promptTypes[dailyPrompt.type].name}
            </div>
          </div>
        )}

        {/* Genre Filter */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.writingPromptGenerator.genreFilter', 'Genre Filter')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setSelectedGenre('all')}
              className={`py-2 px-3 rounded-lg text-sm ${selectedGenre === 'all' ? 'bg-indigo-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              {t('tools.writingPromptGenerator.allGenres', 'All Genres')}
            </button>
            {(Object.keys(genres) as Genre[]).map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`py-2 px-3 rounded-lg text-sm ${selectedGenre === genre ? 'bg-indigo-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {genres[genre].icon} {genres[genre].name}
              </button>
            ))}
          </div>
        </div>

        {/* Prompt Type Filter */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {t('tools.writingPromptGenerator.promptType', 'Prompt Type')}
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedType('all')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 ${selectedType === 'all' ? 'bg-indigo-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
            >
              {t('tools.writingPromptGenerator.allTypes', 'All Types')}
            </button>
            {(Object.keys(promptTypes) as PromptType[]).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 ${selectedType === type ? 'bg-indigo-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {promptTypes[type].icon}
                <span className="text-sm">{promptTypes[type].name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Word Count Challenge */}
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <Clock className="w-4 h-4 inline mr-1" />
            {t('tools.writingPromptGenerator.wordCountChallenge', 'Word Count Challenge')}
          </label>
          <div className="flex gap-2 flex-wrap">
            {WORD_COUNT_CHALLENGES.map((count) => (
              <button
                key={count}
                onClick={() => setWordCountChallenge(count)}
                className={`py-2 px-4 rounded-lg text-sm ${wordCountChallenge === count ? 'bg-indigo-500 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
              >
                {count.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={generateRandomPrompt}
          className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <Shuffle className="w-5 h-5" />
          {t('tools.writingPromptGenerator.generateNewPrompt', 'Generate New Prompt')}
        </button>

        {/* Current Prompt Display */}
        {currentPrompt && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${getGenreColor(currentPrompt.genre)} text-white`}>
                  {genres[currentPrompt.genre].name}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                  {promptTypes[currentPrompt.type].name}
                </span>
              </div>
              <button
                onClick={() => toggleFavorite(currentPrompt)}
                className={`p-2 rounded-full ${isFavorite(currentPrompt) ? 'text-red-500' : isDark ? 'text-gray-400' : 'text-gray-500'} hover:bg-gray-700/50`}
              >
                <Heart className={`w-5 h-5 ${isFavorite(currentPrompt) ? 'fill-current' : ''}`} />
              </button>
            </div>
            <p className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>"{currentPrompt.text}"</p>
            <div className={`mt-4 pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center gap-2">
                <Star className={`w-4 h-4 ${getGenreTextColor(currentPrompt.genre)}`} />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Challenge: Write {currentPrompt.wordCountChallenge.toLocaleString()} words
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Favorites Toggle and Export */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => setShowFavorites(!showFavorites)}
            className={`flex items-center gap-2 py-2 px-4 rounded-lg ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            <Heart className={`w-4 h-4 ${favorites.length > 0 ? 'text-red-500' : ''}`} />
            <span>Favorites ({favorites.length})</span>
          </button>
          {favorites.length > 0 && (
            <ExportDropdown
              onExportCSV={exportToCSV}
              onExportJSON={exportToJSON}
              showImport={false}
              theme={isDark ? 'dark' : 'light'}
              className="ml-auto"
            />
          )}
        </div>

        {/* Favorites List */}
        {showFavorites && favorites.length > 0 && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'} space-y-3`}>
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('tools.writingPromptGenerator.savedPrompts', 'Saved Prompts')}</h4>
            {favorites.map((fav, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getGenreColor(fav.genre)} text-white`}>
                        {genres[fav.genre].name}
                      </span>
                      <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {promptTypes[fav.type].name}
                      </span>
                    </div>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>"{fav.text}"</p>
                  </div>
                  <button
                    onClick={() => toggleFavorite(fav)}
                    className="p-1 text-red-500"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showFavorites && favorites.length === 0 && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'} text-center`}>
            <Heart className={`w-8 h-8 mx-auto mb-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('tools.writingPromptGenerator.noFavoritesYetClickThe', 'No favorites yet. Click the heart icon to save prompts!')}
            </p>
          </div>
        )}

        {/* Tips */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <div className="flex items-start gap-2">
            <Info className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>{t('tools.writingPromptGenerator.writingTips', 'Writing Tips:')}</strong>
              <ul className="mt-1 space-y-1">
                <li>- Set a timer and write without stopping</li>
                <li>- Don't edit while writing your first draft</li>
                <li>- Use the word count challenge to push yourself</li>
                <li>- Save prompts you love for future inspiration</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    <ConfirmDialog />
    {validationMessage && (
      <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50">
        {validationMessage}
      </div>
    )}
    </>
  );
};

export default WritingPromptGeneratorTool;
