import React, { useState, useEffect } from 'react';
import { BookOpen, Volume2, ChevronLeft, ChevronRight, Eye, EyeOff, Play, Pause, Settings, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';

interface StoryParagraph {
  id: string;
  text: string;
  translation: string;
  audioUrl?: string;
  vocabulary: {
    word: string;
    translation: string;
    definition?: string;
  }[];
}

interface Story {
  id: string;
  title: string;
  author: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  imageUrl?: string;
  duration: number; // in minutes
  paragraphs: StoryParagraph[];
  questionsCount: number;
  xpReward: number;
}

interface StoryReaderProps {
  story: Story;
  onComplete?: (score: number) => void;
  onVocabularyClick?: (word: string) => void;
  onPlayAudio?: (text: string) => void;
  onStopAudio?: () => void;
  isPlaying?: boolean;
  className?: string;
}

const StoryReader: React.FC<StoryReaderProps> = ({
  story,
  onComplete,
  onVocabularyClick,
  onPlayAudio,
  onStopAudio,
  isPlaying = false,
  className = ''
}) => {
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [readingSpeed, setReadingSpeed] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [highlightedWords, setHighlightedWords] = useState<Set<string>>(new Set());
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [readProgress, setReadProgress] = useState(0);

  useEffect(() => {
    const progress = ((currentParagraph + 1) / story.paragraphs.length) * 100;
    setReadProgress(progress);
  }, [currentParagraph, story.paragraphs.length]);

  const handleNextParagraph = () => {
    if (currentParagraph < story.paragraphs.length - 1) {
      setCurrentParagraph(prev => prev + 1);
    } else if (onComplete) {
      // Story completed
      onComplete(100);
    }
  };

  const handlePreviousParagraph = () => {
    if (currentParagraph > 0) {
      setCurrentParagraph(prev => prev - 1);
    }
  };

  const handleWordClick = (word: string) => {
    const cleanWord = word.toLowerCase().replace(/[.,!?;:]/g, '');
    setHighlightedWords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cleanWord)) {
        newSet.delete(cleanWord);
      } else {
        newSet.add(cleanWord);
      }
      return newSet;
    });
    onVocabularyClick?.(cleanWord);
  };

  const renderTextWithHighlights = (text: string) => {
    const words = text.split(/\s+/);
    return words.map((word, index) => {
      const cleanWord = word.toLowerCase().replace(/[.,!?;:]/g, '');
      const isHighlighted = highlightedWords.has(cleanWord);
      const vocabularyItem = story.paragraphs[currentParagraph].vocabulary.find(
        v => v.word.toLowerCase() === cleanWord
      );

      return (
        <span key={index}>
          <span
            className={`
              cursor-pointer transition-all duration-200
              ${isHighlighted ? 'bg-yellow-200 dark:bg-yellow-900/50 px-1 rounded' : ''}
              ${vocabularyItem ? 'border-b-2 border-dotted border-[#47bdff] hover:bg-[#47bdff]/10' : ''}
              hover:bg-gray-100 dark:hover:bg-gray-800 px-0.5 rounded
            `}
            onClick={() => handleWordClick(word)}
            title={vocabularyItem ? vocabularyItem.translation : ''}
          >
            {word}
          </span>
          {index < words.length - 1 && ' '}
        </span>
      );
    });
  };

  const toggleAutoPlay = () => {
    if (isAutoPlaying) {
      // Stop auto-play
      setIsAutoPlaying(false);
      if (onStopAudio) {
        onStopAudio();
      }
    } else {
      // Start auto-play
      setIsAutoPlaying(true);
      if (onPlayAudio) {
        onPlayAudio(story.paragraphs[currentParagraph].text);
      }
    }
  };

  const currentPara = story.paragraphs[currentParagraph];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <BookOpen className="h-6 w-6 text-[#47bdff]" />
              <div>
                <h2 className="text-xl font-bold text-white">{story.title}</h2>
                <p className="text-sm text-white/60">
                  by {story.author} • {story.duration} min read
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="capitalize text-white/80 border-white/20">
                {story.level}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-white/60 mb-2">
              <span>Paragraph {currentParagraph + 1} of {story.paragraphs.length}</span>
              <span>{Math.round(readProgress)}% Complete</span>
            </div>
            <Progress value={readProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Settings Panel */}
      {showSettings && (
        <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-white">Reading Settings</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Font Size */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Font Size: {fontSize}px
              </label>
              <div className="flex space-x-2">
                <Button size="sm" onClick={() => setFontSize(Math.max(14, fontSize - 2))}>-</Button>
                <Button size="sm" onClick={() => setFontSize(Math.min(24, fontSize + 2))}>+</Button>
              </div>
            </div>

            {/* Reading Speed */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Reading Speed: {readingSpeed}x
              </label>
              <div className="flex space-x-2">
                <Button size="sm" onClick={() => setReadingSpeed(Math.max(0.5, readingSpeed - 0.1))}>Slower</Button>
                <Button size="sm" onClick={() => setReadingSpeed(Math.min(2, readingSpeed + 0.1))}>Faster</Button>
              </div>
            </div>

            {/* Display Options */}
            <div className="flex items-center space-x-4">
              <Button
                variant={showTranslation ? "default" : "outline"}
                size="sm"
                onClick={() => setShowTranslation(!showTranslation)}
              >
                {showTranslation ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                Translation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Story Content */}
      <Card className="min-h-[400px] bg-white/10 backdrop-blur-xl border border-white/20">
        <CardContent className="p-8">
          {/* Audio Controls */}
          <div className="flex justify-center mb-6 space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAutoPlay}
              className="rounded-full"
            >
              {isAutoPlaying ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause Reading
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Auto Read
                </>
              )}
            </Button>
            
            {onPlayAudio && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (isPlaying && onStopAudio) {
                    onStopAudio();
                  } else {
                    onPlayAudio(currentPara.text);
                  }
                }}
                className="rounded-full"
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Stop Audio
                  </>
                ) : (
                  <>
                    <Volume2 className="h-4 w-4 mr-2" />
                    Play Audio
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Story Text */}
          <div className="space-y-6">
            <div
              className="leading-relaxed text-white"
              style={{ fontSize: `${fontSize}px`, lineHeight: '1.8' }}
            >
              {renderTextWithHighlights(currentPara.text)}
            </div>

            {/* Translation */}
            {showTranslation && (
              <div className="p-4 bg-white/10 rounded-lg border border-white/20 backdrop-blur-sm">
                <p className="text-sm text-white/60 mb-1">Translation:</p>
                <p className="text-white" style={{ fontSize: `${fontSize - 2}px` }}>
                  {currentPara.translation}
                </p>
              </div>
            )}

            {/* Vocabulary Help */}
            {currentPara.vocabulary.length > 0 && (
              <div className="mt-6 p-4 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                <h4 className="text-sm font-semibold mb-3 text-white">
                  Key Vocabulary
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {currentPara.vocabulary.map((vocab, index) => (
                    <div
                      key={index}
                      className="text-sm cursor-pointer hover:bg-white/10 p-2 rounded transition-colors"
                      onClick={() => handleWordClick(vocab.word)}
                    >
                      <span className="font-medium text-white">
                        {vocab.word}
                      </span>
                      <span className="text-white/60 ml-2">
                        {vocab.translation}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePreviousParagraph}
              disabled={currentParagraph === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex space-x-2">
              {story.paragraphs.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentParagraph
                      ? 'bg-[#47bdff] w-8'
                      : index < currentParagraph
                      ? 'bg-emerald-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  onClick={() => setCurrentParagraph(index)}
                />
              ))}
            </div>

            <Button
              variant={currentParagraph === story.paragraphs.length - 1 ? "default" : "outline"}
              onClick={handleNextParagraph}
            >
              {currentParagraph === story.paragraphs.length - 1 ? 'Complete' : 'Next'}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StoryReader;