import React, { useState, useEffect, useRef } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number; // Characters per second
  onComplete?: () => void;
  className?: string;
  children?: (displayedText: string, isComplete: boolean) => React.ReactNode;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 50, // Default: 50 characters per second (fast but visible)
  onComplete,
  className,
  children,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const indexRef = useRef(0);
  const lastTextRef = useRef(text);

  useEffect(() => {
    // Reset if text changes
    if (text !== lastTextRef.current) {
      indexRef.current = 0;
      setDisplayedText('');
      setIsComplete(false);
      lastTextRef.current = text;
    }

    if (isComplete) return;

    const intervalMs = 1000 / speed;

    const timer = setInterval(() => {
      if (indexRef.current < text.length) {
        // Add multiple characters per tick for faster typing
        const charsPerTick = Math.max(1, Math.floor(speed / 30));
        const nextIndex = Math.min(indexRef.current + charsPerTick, text.length);
        setDisplayedText(text.slice(0, nextIndex));
        indexRef.current = nextIndex;
      } else {
        setIsComplete(true);
        clearInterval(timer);
        onComplete?.();
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [text, speed, isComplete, onComplete]);

  // If children is a render function, use it
  if (children) {
    return <>{children(displayedText, isComplete)}</>;
  }

  return (
    <span className={className}>
      {displayedText}
      {!isComplete && (
        <span className="inline-block w-0.5 h-4 ml-0.5 bg-current animate-pulse" />
      )}
    </span>
  );
};

// Hook version for more flexibility
export const useTypewriter = (text: string, speed: number = 50) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const indexRef = useRef(0);
  const lastTextRef = useRef(text);

  useEffect(() => {
    // Reset if text changes
    if (text !== lastTextRef.current) {
      indexRef.current = 0;
      setDisplayedText('');
      setIsComplete(false);
      lastTextRef.current = text;
    }

    if (isComplete) return;

    const intervalMs = 1000 / speed;

    const timer = setInterval(() => {
      if (indexRef.current < text.length) {
        const charsPerTick = Math.max(1, Math.floor(speed / 30));
        const nextIndex = Math.min(indexRef.current + charsPerTick, text.length);
        setDisplayedText(text.slice(0, nextIndex));
        indexRef.current = nextIndex;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [text, speed, isComplete]);

  return { displayedText, isComplete };
};

export default TypewriterText;
