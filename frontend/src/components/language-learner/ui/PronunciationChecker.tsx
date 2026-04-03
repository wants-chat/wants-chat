import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Progress } from '../../ui/progress';
import { Badge } from '../../ui/badge';

interface PronunciationCheckerProps {
  targetPhrase: string;
  language: string;
  onComplete?: (score: number) => void;
  allowSkip?: boolean;
  maxAttempts?: number;
  className?: string;
}

interface RecognitionResult {
  transcript: string;
  confidence: number;
  isCorrect: boolean;
  score: number;
}

const PronunciationChecker: React.FC<PronunciationCheckerProps> = ({
  targetPhrase,
  language = 'es-ES',
  onComplete,
  allowSkip = true,
  maxAttempts = 3,
  className = ''
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState<RecognitionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if Speech Recognition API is available
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Speech recognition is not supported in your browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcriptText = event.results[current][0].transcript;
      const confidence = event.results[current][0].confidence || 0.5;
      
      setTranscript(transcriptText);
      
      if (event.results[current].isFinal) {
        const score = calculateScore(transcriptText, targetPhrase);
        const isCorrect = score >= 70;
        
        setResult({
          transcript: transcriptText,
          confidence: confidence,
          isCorrect: isCorrect,
          score: score
        });
        
        setIsListening(false);
        setAttempts(prev => prev + 1);
        
        if (isCorrect && onComplete) {
          onComplete(score);
        }
      }
    };

    recognition.onerror = (event: any) => {
      setError(`Error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, targetPhrase, onComplete]);

  const calculateScore = (spoken: string, target: string): number => {
    const spokenWords = spoken.toLowerCase().trim().split(/\s+/);
    const targetWords = target.toLowerCase().trim().split(/\s+/);
    
    let matches = 0;
    const maxLength = Math.max(spokenWords.length, targetWords.length);
    
    for (let i = 0; i < Math.min(spokenWords.length, targetWords.length); i++) {
      if (spokenWords[i] === targetWords[i]) {
        matches++;
      } else if (levenshteinDistance(spokenWords[i], targetWords[i]) <= 2) {
        matches += 0.5; // Partial credit for close matches
      }
    }
    
    return Math.round((matches / maxLength) * 100);
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  const startListening = () => {
    if (!recognitionRef.current) return;
    
    setError(null);
    setTranscript('');
    setResult(null);
    setIsListening(true);
    
    try {
      recognitionRef.current.start();
    } catch (e) {
      setError('Could not start recording. Please try again.');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const playTargetAudio = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(targetPhrase);
      utterance.lang = language;
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const reset = () => {
    setTranscript('');
    setResult(null);
    setAttempts(0);
    setError(null);
  };

  if (!isSupported) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Speech recognition is not supported in your browser.
            Please use a modern browser like Chrome or Edge.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        {/* Target Phrase Display */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Say this phrase:
          </p>
          <div className="flex items-center justify-center space-x-4">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              "{targetPhrase}"
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={playTargetAudio}
              title="Listen to pronunciation"
            >
              <Volume2 className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Recording Button */}
        <div className="flex justify-center mb-6">
          <Button
            size="lg"
            variant={isListening ? "destructive" : "default"}
            onClick={isListening ? stopListening : startListening}
            disabled={attempts >= maxAttempts && !result?.isCorrect}
            className={`h-20 w-20 rounded-full ${
              isListening ? 'animate-pulse' : ''
            }`}
          >
            {isListening ? (
              <MicOff className="h-8 w-8" />
            ) : (
              <Mic className="h-8 w-8" />
            )}
          </Button>
        </div>

        {/* Live Transcript */}
        {(isListening || transcript) && !result && (
          <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {isListening ? 'Listening...' : 'You said:'}
            </p>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {transcript || '...'}
            </p>
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className={`mb-4 p-4 rounded-lg ${
            result.isCorrect 
              ? 'bg-emerald-50 dark:bg-emerald-900/20' 
              : 'bg-orange-50 dark:bg-orange-900/20'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {result.isCorrect ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    <span className="font-semibold text-emerald-600">Great job!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-orange-600" />
                    <span className="font-semibold text-orange-600">Keep trying!</span>
                  </>
                )}
              </div>
              <Badge variant={result.isCorrect ? "default" : "secondary"}>
                {result.score}% Match
              </Badge>
            </div>
            
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              You said: <strong>"{result.transcript}"</strong>
            </p>
            
            <Progress value={result.score} className="h-2" />
            
            {!result.isCorrect && attempts < maxAttempts && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {maxAttempts - attempts} attempts remaining
              </p>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          {result && !result.isCorrect && attempts < maxAttempts && (
            <Button
              variant="outline"
              onClick={reset}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
          
          {allowSkip && !result?.isCorrect && (
            <Button
              variant="ghost"
              onClick={() => onComplete?.(0)}
            >
              Skip
            </Button>
          )}
        </div>

        {/* Attempts Counter */}
        {attempts > 0 && (
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Attempt {attempts} of {maxAttempts}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PronunciationChecker;