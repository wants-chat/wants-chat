import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Custom hook to manage selected lesson ID across the language learner module
 * Priority: URL parameter > localStorage
 */
export const useSelectedLesson = () => {
  const [searchParams] = useSearchParams();
  const [lessonId, setLessonId] = useState<string | null>(null);

  useEffect(() => {
    // Check URL parameter first, then localStorage
    const urlLessonId = searchParams.get('lesson_id');
    const storedLessonId = localStorage.getItem('selectedLessonId');

    const currentLessonId = urlLessonId || storedLessonId;

    if (currentLessonId) {
      setLessonId(currentLessonId);
      // Sync localStorage with URL if URL has lesson_id
      if (urlLessonId) {
        localStorage.setItem('selectedLessonId', urlLessonId);
      }
    } else {
      setLessonId(null);
    }
  }, [searchParams]);

  const selectLesson = (newLessonId: string) => {
    setLessonId(newLessonId);
    localStorage.setItem('selectedLessonId', newLessonId);
  };

  const clearSelectedLesson = () => {
    setLessonId(null);
    localStorage.removeItem('selectedLessonId');
  };

  return {
    lessonId,
    selectLesson,
    clearSelectedLesson,
    hasSelectedLesson: !!lessonId,
  };
};