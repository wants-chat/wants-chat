import React, { useState } from 'react';
import { Volume2, Shuffle, RotateCcw } from 'lucide-react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Progress } from '../../ui/progress';

export interface VocabularyWord {
  id: string;
  word: string;
  translation: string;
  definition: string;
  pronunciation: string;
  audioUrl: string;
  partOfSpeech: 'noun' | 'verb' | 'adjective' | 'adverb' | 'preposition' | 'conjunction' | 'interjection';
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  examples: VocabularyExample[];
  mastery: number;
  timesReviewed: number;
  timesCorrect: number;
  timesIncorrect: number;
  lastReviewed: Date;
  nextReview: Date;
  dateAdded: Date;
  source: 'lesson' | 'story' | 'manual';
  isFavorite: boolean;
  tags: string[];
}

export interface VocabularyExample {
  sentence: string;
  translation: string;
  audioUrl: string;
}

interface VocabularyFlashcardProps {
  words: VocabularyWord[];
  onPlayAudio?: (text: string) => void;
  onShuffle?: () => void;
  onReset?: () => void;
}

const VocabularyFlashcard: React.FC<VocabularyFlashcardProps> = ({
  words,
  onPlayAudio,
  onShuffle,
  onReset
}) => {
  const [currentCard, setCurrentCard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const nextCard = () => {
    setShowAnswer(false);
    setCurrentCard((prev) => (prev + 1) % words.length);
  };

  const previousCard = () => {
    setShowAnswer(false);
    setCurrentCard((prev) => (prev - 1 + words.length) % words.length);
  };

  const handleShuffle = () => {
    setShowAnswer(false);
    setCurrentCard(0);
    onShuffle?.();
  };

  const handleReset = () => {
    setShowAnswer(false);
    setCurrentCard(0);
    onReset?.();
  };

  if (words.length === 0) {
    return (
      <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
        <CardContent className="p-8 text-center">
          <h3 className="text-lg font-semibold text-white mb-2">
            No Words to Study
          </h3>
          <p className="text-white/60">
            Add some words to your vocabulary or adjust your filters to start studying.
          </p>
        </CardContent>
      </Card>
    );
  }

  const currentWord = words[currentCard];

  return (
    <div className="space-y-6">
      {/* Flashcard Controls */}
      <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-white/60">
                Card {currentCard + 1} of {words.length}
              </div>
              <Progress 
                value={((currentCard + 1) / words.length) * 100} 
                className="w-32 h-2"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleShuffle}
                title="Shuffle cards"
              >
                <Shuffle className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleReset}
                title="Reset progress"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Flashcard */}
      <Card className="min-h-96 bg-white/10 backdrop-blur-xl border border-white/20">
        <CardContent className="p-8">
          <div
            className="text-center cursor-pointer h-80 flex flex-col justify-center"
            onClick={() => setShowAnswer(!showAnswer)}
          >
            {!showAnswer ? (
              <div>
                <div className="text-4xl font-bold text-white mb-4">
                  {currentWord.word}
                </div>
                <div className="text-lg text-white/60 mb-6">
                  {currentWord.pronunciation}
                </div>
                {onPlayAudio && (
                  <Button
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlayAudio(currentWord.word);
                    }}
                  >
                    <Volume2 className="h-8 w-8" />
                  </Button>
                )}
              </div>
            ) : (
              <div>
                <div className="text-3xl font-bold text-white mb-4">
                  {currentWord.translation}
                </div>
                <div className="text-lg text-white/60 mb-4">
                  {currentWord.definition}
                </div>
                {currentWord.examples.length > 0 && (
                  <div className="mt-6 p-4 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                    <div className="text-white mb-2">
                      {currentWord.examples[0].sentence}
                    </div>
                    <div className="text-sm text-white/60">
                      {currentWord.examples[0].translation}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-8 text-sm text-white/60">
              {showAnswer ? 'Click to hide answer' : 'Click to reveal answer'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-center space-x-4">
        <Button 
          onClick={previousCard}
          variant="outline"
        >
          Previous Card
        </Button>
        <Button onClick={nextCard} className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white">
          Next Card
        </Button>
      </div>
    </div>
  );
};

export default VocabularyFlashcard;