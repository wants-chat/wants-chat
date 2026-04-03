import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MeditationOption } from '../../types/meditation/meditation-types';
import { AudioContent } from '../../services/meditationService';

export const useMeditationWheelManager = (typedAudioLibrary: AudioContent[]) => {
  const navigate = useNavigate();
  const [selectedDuration, setSelectedDuration] = useState(10);
  const [selectedCategory, setSelectedCategory] = useState<MeditationOption | null>(null);

  // Helper function to get filtered session count for a category
  const getFilteredSessionCount = (option: MeditationOption) => {
    if (!option.subOptions || option.subOptions.length === 0) {
      return 0;
    }
    
    const filteredCount = option.subOptions.filter((subOption) => {
      const audio = typedAudioLibrary.find(a => a.id === subOption.id);
      if (!audio) {
        return false;
      }
      
      const audioDurationMinutes = Math.round((audio.durationSeconds || 600) / 60);
      return audioDurationMinutes <= selectedDuration;
    }).length;
    
    return filteredCount;
  };

  const handleOptionClick = (option: MeditationOption) => {
    setSelectedCategory(option);
  };

  const handleSubOptionClick = (categoryId: string, subOptionId: string) => {
    // Enhanced featured data should already be in session storage from useEffect
    const storedData = sessionStorage.getItem('meditationFeatured');
    if (storedData) {
      const enhancedFeatured = JSON.parse(storedData);
      const targetCategory = enhancedFeatured.find((c: any) => c.id === categoryId);
      const targetSubOption = targetCategory?.subOptions?.find((s: any) => s.id === subOptionId);
      const targetSession = targetSubOption?.sessions?.find(
        (s: any) => s.duration === selectedDuration,
      );

      // If we have audio data for this session, store it
      if (targetSession && targetSession.audioUrl) {
        sessionStorage.setItem(
          'quickSessionAudio',
          JSON.stringify({
            id: subOptionId,
            title: targetSession.title || targetSubOption?.name,
            description: targetSubOption?.description,
            audioUrl: targetSession.audioUrl,
            duration: selectedDuration,
            narrator: targetSession.narrator,
            category: categoryId,
            type: 'meditation',
          }),
        );
      }
    }

    // Check if subOptionId is a UUID (audio ID from audioLibrary)
    const isAudioId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      subOptionId,
    );
    if (isAudioId && typedAudioLibrary && typedAudioLibrary.length > 0) {
      const audioData = typedAudioLibrary.find((audio) => audio.id === subOptionId);
      if (audioData) {
        sessionStorage.setItem(
          'quickSessionAudio',
          JSON.stringify({
            id: audioData.id,
            title: audioData.title,
            description: audioData.description,
            audioUrl: audioData.fileUrl,
            duration: audioData.durationMinutes,
            narrator: audioData.narrator,
            category: audioData.category,
            type: audioData.type,
          }),
        );
        // Navigate with audio_id for audio library content
        navigate(`/meditation/player/${audioData.id}`);
        return;
      }
    }

    // For regular category/subcategory navigation
    navigate(`/meditation/player/${categoryId}/${subOptionId}/${selectedDuration}`);
  };

  const handleBackClick = () => {
    setSelectedCategory(null);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getColorForCategory = (index: number) => {
    const colors = [
      'bg-gradient-to-br from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700',
      'bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700',
      'bg-gradient-to-br from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700',
      'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
      'bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      'bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700',
      'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      'bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700',
      'bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
      'bg-gradient-to-br from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700',
    ];
    return colors[index % colors.length];
  };

  return {
    selectedDuration,
    setSelectedDuration,
    selectedCategory,
    setSelectedCategory,
    getFilteredSessionCount,
    handleOptionClick,
    handleSubOptionClick,
    handleBackClick,
    getGreeting,
    getColorForCategory
  };
};