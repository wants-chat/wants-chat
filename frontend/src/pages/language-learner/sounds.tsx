import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Mic, Play, Square, RotateCcw, Award, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { GlassCard } from '../../components/ui/GlassCard';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelectedLesson } from '../../hooks/useSelectedLesson';
import { toast } from '../../components/ui/sonner';
import { languageApiService, Letter, Phoneme as ApiPhoneme, MinimalPair } from '../../services/languageApi';

interface PronunciationExercise {
  id: string;
  type: 'minimal-pairs' | 'word-practice' | 'sentence-practice';
  phoneme: string;
  words: string[];
  correctPronunciation: string;
  userScore?: number;
}

const SoundsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { lessonId } = useSelectedLesson();
  const [selectedPhoneme, setSelectedPhoneme] = useState<ApiPhoneme | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [pronunciationScore, setPronunciationScore] = useState<number | null>(null);
  const [pronunciationFeedback, setPronunciationFeedback] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [completedPhonemes, setCompletedPhonemes] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('vowels');
  const [practiceSubTab, setPracticeSubTab] = useState('minimal-pairs');
  const [currentLanguage, setCurrentLanguage] = useState<'spanish' | 'english'>('spanish');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [vowels, setVowels] = useState<ApiPhoneme[]>([]);
  const [consonants, setConsonants] = useState<ApiPhoneme[]>([]);
  const [allPhonemes, setAllPhonemes] = useState<ApiPhoneme[]>([]);
  const [minimalPairs, setMinimalPairs] = useState<MinimalPair[]>([]);
  const [totalLetters, setTotalLetters] = useState<number>(0);

  // Helper function to convert API Letter to Phoneme format
  const convertLetterToPhoneme = (letter: Letter): ApiPhoneme => {
    return {
      id: letter.id,
      symbol: letter.letter,
      ipa: letter.pronunciation || `/${letter.letter}/`,
      description: letter.description || '',
      examples: letter.examples || [],
      audioUrl: letter.audioUrl || '',
      difficulty: 'easy' as 'easy' | 'medium' | 'hard',
      category: letter.type as 'vowel' | 'consonant',
      position: '',
      manner: '',
    };
  };

  // Fetch letters, phonemes, and minimal pairs from API
  useEffect(() => {
    const fetchData = async () => {
      if (!currentLanguage) return;

      setIsLoading(true);
      try {
        const languageCode = currentLanguage === 'spanish' ? 'es' : 'en';

        // Fetch all letters (for total count), vowels, consonants, phonemes, and minimal pairs
        const [allLettersResponse, vowelsResponse, consonantsResponse, allPhonemesResponse, minimalPairsResponse] = await Promise.all([
          languageApiService.getLetters({ languageCode }),
          languageApiService.getLetters({ languageCode, type: 'vowel' }),
          languageApiService.getLetters({ languageCode, type: 'consonant' }),
          languageApiService.getPhonemes({ languageCode }),
          languageApiService.getMinimalPairs({ languageCode })
        ]);

        // Convert letters to phoneme format for vowels and consonants tabs
        const vowelPhonemes = vowelsResponse.letters.map(convertLetterToPhoneme);
        const consonantPhonemes = consonantsResponse.letters.map(convertLetterToPhoneme);

        setTotalLetters(allLettersResponse.totalCount);
        setVowels(vowelPhonemes);
        setConsonants(consonantPhonemes);
        setAllPhonemes(allPhonemesResponse.phonemes);
        setMinimalPairs(minimalPairsResponse.minimalPairs);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data. Please try again.');
        // Fallback to empty arrays
        setTotalLetters(0);
        setVowels([]);
        setConsonants([]);
        setAllPhonemes([]);
        setMinimalPairs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentLanguage]);

  // Detect current language from URL or localStorage
  useEffect(() => {
    const currentPath = location.pathname;
    const savedLanguage = localStorage.getItem('currentLanguagelearning');

    if (savedLanguage === 'english' || currentPath.includes('english')) {
      setCurrentLanguage('english');
    } else {
      setCurrentLanguage('spanish'); // Default to Spanish
    }
  }, [location]);


  const progressPercentage = allPhonemes.length > 0 ? (completedPhonemes.length / allPhonemes.length) * 100 : 0;

  const handlePhonemeSelect = (phoneme: ApiPhoneme) => {
    setSelectedPhoneme(phoneme);
    setPronunciationScore(null);
  };

  const handlePlayAudio = async (text: string) => {
    if (isPlaying) return;

    setIsPlaying(true);

    // Use browser's built-in speech synthesis (no CORS issues)
    const cleanText = text.trim();
    useSpeechSynthesis(cleanText);
  };

  const useSpeechSynthesis = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = currentLanguage === 'spanish' ? 'es-ES' : 'en-US';
      utterance.rate = 0.7;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      utterance.onstart = () => {
        console.log('Speech started');
      };
      
      utterance.onend = () => {
        console.log('Speech ended');
        setIsPlaying(false);
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        setIsPlaying(false);
      };
      
      // Wait for voices to load
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          const availableVoices = window.speechSynthesis.getVoices();
          const preferredVoice = availableVoices.find(voice => 
            voice.lang.startsWith(currentLanguage === 'spanish' ? 'es' : 'en')
          );
          if (preferredVoice) {
            utterance.voice = preferredVoice;
          }
          window.speechSynthesis.speak(utterance);
        };
      } else {
        const preferredVoice = voices.find(voice => 
          voice.lang.startsWith(currentLanguage === 'spanish' ? 'es' : 'en')
        );
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
        window.speechSynthesis.speak(utterance);
      }
    } else {
      console.error('Speech synthesis not supported');
      setIsPlaying(false);
    }
  };

  const handleStartRecording = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const recordedBlob = new Blob(chunks, { type: 'audio/wav' });
        setRecordedChunks([recordedBlob]);

        // Call API for pronunciation analysis
        if (selectedPhoneme) {
          setIsAnalyzing(true);
          setPronunciationFeedback(null);

          try {
            // Determine the expected text based on what user is practicing
            const expectedText = selectedPhoneme.exampleWords?.[0] || selectedPhoneme.symbol;

            const result = await languageApiService.analyzePronunciation(
              recordedBlob,
              expectedText,
              currentLanguage,
              selectedPhoneme.id
            );

            const score = result.score;
            setPronunciationScore(score);
            setPronunciationFeedback(result.feedback || result.overall_feedback);

            if (score >= 80 && !completedPhonemes.includes(selectedPhoneme.id)) {
              setCompletedPhonemes([...completedPhonemes, selectedPhoneme.id]);
              toast.success('Great pronunciation! Phoneme completed.');
            }
          } catch (error: any) {
            console.error('Pronunciation analysis failed:', error);
            // Show error state instead of fake score
            setPronunciationScore(null);
            setPronunciationFeedback('Analysis unavailable. Please try again.');
            toast.error('Could not analyze pronunciation. Please try again.');
          } finally {
            setIsAnalyzing(false);
          }
        }

        // Clean up
        stream.getTracks().forEach(track => track.stop());
      };
      
      setIsRecording(true);
      setPronunciationScore(null);
      mediaRecorder.start();
      
      // Auto-stop after 5 seconds
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
          setIsRecording(false);
        }
      }, 5000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone. Please check permissions.');
      setIsRecording(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'hard':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-white/20 text-white/60 border-white/20';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 80) return 'text-yellow-400';
    return 'text-red-400';
  };

  const renderPhonemeGrid = (phonemes: ApiPhoneme[], title: string) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {phonemes.map((phoneme) => (
          <GlassCard
            key={phoneme.id}
            className={`cursor-pointer transition-all duration-300 hover:scale-105 text-center ${
              selectedPhoneme?.id === phoneme.id
                ? 'ring-2 ring-teal-500 bg-teal-500/10 border-teal-500/50 scale-105'
                : ''
            } ${
              completedPhonemes.includes(phoneme.id)
                ? 'bg-emerald-500/10 border-emerald-500/50'
                : ''
            }`}
            hover={true}
            onClick={() => handlePhonemeSelect(phoneme)}
          >
            <div className="flex justify-center mb-2 relative">
              {completedPhonemes.includes(phoneme.id) && (
                <CheckCircle2 className="h-4 w-4 text-emerald-400 absolute -top-1 -right-1" />
              )}
              <div className="text-2xl font-bold text-white mb-1">
                {phoneme.symbol}
              </div>
            </div>
            <div className="text-xs text-white/60 mb-2">
              {phoneme.ipa}
            </div>
            <Badge className={getDifficultyColor(phoneme.difficulty)}>
              {phoneme.difficulty}
            </Badge>
          </GlassCard>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {currentLanguage === 'spanish' ? 'Spanish' : 'English'} Pronunciation Practice
          </h1>
          <p className="text-white/60">
            Master {currentLanguage === 'spanish' ? 'Spanish' : 'English'} sounds and phonetics
          </p>
        </div>

        <GlassCard className="text-right px-4 py-2" hover={false}>
          <div className="text-sm text-white/60">Total Letters</div>
          <div className="text-lg font-semibold text-white">
            {totalLetters}
          </div>
        </GlassCard>
      </div>

      <div>
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-teal-400 mx-auto mb-4" />
              <p className="text-white/60">Loading letters...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Phoneme Selection */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-xl border border-white/20">
                  <TabsTrigger value="vowels" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white text-white/60">Vowels</TabsTrigger>
                  <TabsTrigger value="consonants" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white text-white/60">Consonants</TabsTrigger>
                  <TabsTrigger value="practice" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white text-white/60">Practice</TabsTrigger>
                </TabsList>

                <TabsContent value="vowels" className="space-y-4">
                  {vowels.length > 0 ? (
                    renderPhonemeGrid(vowels, `${currentLanguage === 'spanish' ? 'Spanish' : 'English'} Vowels`)
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-white/60">No vowels found for this language.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="consonants" className="space-y-4">
                  {consonants.length > 0 ? (
                    renderPhonemeGrid(consonants, `${currentLanguage === 'spanish' ? 'Difficult Spanish' : 'Challenging English'} Consonants`)
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-white/60">No consonants found for this language.</p>
                    </div>
                  )}
                </TabsContent>
              
              <TabsContent value="practice" className="space-y-4">
                <Tabs value={practiceSubTab} onValueChange={setPracticeSubTab}>
                  <TabsList className="grid w-full grid-cols-2 bg-white/10 backdrop-blur-xl border border-white/20">
                    <TabsTrigger value="minimal-pairs" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white text-white/60">Minimal Pairs</TabsTrigger>
                    <TabsTrigger value="phonemes" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white text-white/60">Phonemes</TabsTrigger>
                  </TabsList>

                  <TabsContent value="minimal-pairs" className="space-y-4 mt-4">
                    {minimalPairs.length > 0 ? (
                      <div className="grid gap-3">
                        {minimalPairs.map((pair) => (
                          <GlassCard key={pair.id} hover={true}>
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center space-x-3 text-lg font-semibold text-white">
                                  <span>{pair.pair[0]}</span>
                                  <span className="text-sm text-white/40 font-normal">vs</span>
                                  <span>{pair.pair[1]}</span>
                                </div>
                                <p className="text-sm text-teal-400 mt-1">
                                  {pair.description}
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-white/20 bg-white/5 text-white hover:bg-gradient-to-r hover:from-teal-500 hover:to-cyan-500 hover:border-teal-500 transition-all duration-300 flex items-center gap-2"
                                onClick={() => {
                                  // Play both words in the minimal pair
                                  handlePlayAudio(pair.pair[0]);
                                  setTimeout(() => handlePlayAudio(pair.pair[1]), 2000);
                                }}
                              >
                                <Play className="h-4 w-4" />
                                <Volume2 className="h-4 w-4" />
                                Practice
                              </Button>
                            </div>
                          </GlassCard>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-white/60">No minimal pairs found for this language.</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="phonemes" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {allPhonemes.map((phoneme) => (
                        <GlassCard
                          key={phoneme.id}
                          className={`cursor-pointer transition-all duration-300 hover:scale-105 text-center ${
                            selectedPhoneme?.id === phoneme.id
                              ? 'ring-2 ring-teal-500 bg-teal-500/10 border-teal-500/50 scale-105'
                              : ''
                          }`}
                          hover={true}
                          onClick={() => handlePhonemeSelect(phoneme)}
                        >
                          <div className="text-2xl font-bold text-white mb-1">
                            {phoneme.symbol}
                          </div>
                          <div className="text-xs text-white/60 mb-2">
                            {phoneme.ipa}
                          </div>
                          <Badge className={getDifficultyColor(phoneme.difficulty)}>
                            {phoneme.difficulty}
                          </Badge>
                        </GlassCard>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </TabsContent>
            </Tabs>
          </div>

          {/* Practice Panel */}
          <div className="space-y-6">
            <GlassCard className="sticky top-6" hover={false}>
              <div className="flex items-center space-x-2 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500">
                  <Volume2 className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-semibold text-white">Practice Session</span>
              </div>
              <div className="space-y-6">
                {selectedPhoneme ? (
                  <>
                    {/* Phoneme Info */}
                    <div className="text-center">
                      <div className="text-4xl font-bold text-white mb-2">
                        {selectedPhoneme.symbol}
                      </div>
                      <div className="text-lg text-white/60 mb-2">
                        {selectedPhoneme.ipa}
                      </div>
                      <Badge className={getDifficultyColor(selectedPhoneme.difficulty)}>
                        {selectedPhoneme.difficulty}
                      </Badge>
                      <p className="text-sm text-white/60 mt-3">
                        {selectedPhoneme.description}
                      </p>
                    </div>

                    {/* Audio Controls */}
                    <div className="space-y-4">
                      <div className="text-center">
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => handlePlayAudio(selectedPhoneme.symbol)}
                          disabled={isPlaying}
                          className="w-full mb-4 h-16 text-lg font-semibold border-white/20 bg-white/5 text-white hover:bg-gradient-to-r hover:from-teal-500 hover:to-cyan-500 hover:border-teal-500 transition-all duration-300"
                        >
                          <Volume2 className={`h-6 w-6 mr-3 ${isPlaying ? 'animate-pulse' : ''}`} />
                          {isPlaying ? 'Playing...' : 'Listen to Sound'}
                        </Button>
                      </div>

                      {/* Examples */}
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-3">
                          Example Words:
                        </h4>
                        <div className="grid gap-2">
                          {selectedPhoneme.examples.map((example, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-white/5 border border-white/10 rounded-lg"
                            >
                              <span className="font-medium text-white">
                                {example}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePlayAudio(example)}
                                className="text-white/60 hover:text-teal-400 hover:bg-white/10 transition-all duration-200"
                              >
                                <Volume2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Volume2 className="h-16 w-16 text-white/20 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Select a Sound
                    </h3>
                    <p className="text-white/60 text-sm">
                      Choose a phoneme from the grid to start practicing pronunciation.
                    </p>
                  </div>
                )}
              </div>
            </GlassCard>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SoundsPage;