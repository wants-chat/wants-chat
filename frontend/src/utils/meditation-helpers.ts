// @ts-nocheck
import { MeditationCategory, AudioContent, FeaturedCategory } from '../services/meditationService';
import { MeditationOption, SubOption } from '../types/meditation/meditation-types';
import {
  mdiWeatherNight,
  mdiAlarmMultiple,
  mdiWalk,
  mdiWeatherSunny,
  mdiCalendarMonth,
  mdiBriefcase,
  mdiCoffee,
  mdiHomeOutline,
  mdiEmoticonSad,
  mdiCarMultiple,
  mdiMeditation,
} from '@mdi/js';

const iconMap: { [key: string]: string } = {
  'stress-relief': mdiEmoticonSad,
  'sleep-better': mdiWeatherNight,
  'focus-concentration': mdiBriefcase,
  'anxiety-calm': mdiAlarmMultiple,
  'mindfulness-presence': mdiMeditation,
  'energy-boost': mdiWeatherSunny,
  'emotional-balance': mdiHomeOutline,
  'quick-reset': mdiCoffee,
  'big-event': mdiCalendarMonth,
  sleep: mdiWeatherNight,
  commute: mdiCarMultiple,
  sos: mdiAlarmMultiple,
  'tough-day': mdiEmoticonSad,
  walking: mdiWalk,
  'at-work': mdiBriefcase,
  morning: mdiWeatherSunny,
  'taking-break': mdiCoffee,
  'after-work': mdiHomeOutline,
};

export const mapCategoriesToOptions = (categories: MeditationCategory[]): MeditationOption[] => {
  return categories.map((category) => ({
    id: category.slug || category.id,
    label: category.name,
    icon: iconMap[category.slug || category.id] || mdiMeditation,
    description: category.description,
    sessions: category.sessionCount || 0,
    avgDuration: '5-20 min',
    subOptions: [],
  }));
};

export const enhanceCategoriesWithAudio = (
  categories: MeditationCategory[],
  audioLibrary: AudioContent[],
): MeditationOption[] => {
  if (!categories || categories.length === 0) {
    return [];
  }

  // Group audio by category - match using slug or id
  const audioByCategory: Record<string, any[]> = {};

  if (audioLibrary && audioLibrary.length > 0) {
    audioLibrary.forEach((audio) => {
      const audioCategory = audio.category || 'general';
      
      // Try to match with category slug or id
      categories.forEach((cat) => {
        const categoryKey = cat.slug || cat.id;
        // Match if audio category matches either slug or id (case-insensitive)
        if (
          audioCategory.toLowerCase() === categoryKey.toLowerCase() ||
          audioCategory.toLowerCase() === cat.id.toLowerCase() ||
          audioCategory.toLowerCase() === cat.name.toLowerCase().replace(/\s+/g, '-') ||
          // Special case for taking-break -> taking a break
          (audioCategory.toLowerCase() === 'taking-break' && cat.name.toLowerCase().includes('taking') && cat.name.toLowerCase().includes('break'))
        ) {
          if (!audioByCategory[categoryKey]) {
            audioByCategory[categoryKey] = [];
          }
          audioByCategory[categoryKey].push(audio);
        }
      });
    });
  }

  return categories.map((category) => {
    const categorySlug = category.slug || category.id;
    const categoryAudios = audioByCategory[categorySlug] || [];

    // Create subcategories from audio titles
    const audioSubOptions = categoryAudios.map((audio) => {
      // Calculate available durations based on actual audio duration
      const audioDurationSeconds = audio.durationSeconds || 600;
      const audioDurationMinutes = Math.round(audioDurationSeconds / 60);

      // For now, just provide all duration options - filtering will happen at display level
      const durations = [5, 10, 15, 20];

      return {
        id: audio.id,
        label: audio.title,
        description: audio.description || `Listen to ${audio.title}`,
        duration: durations,
        audioUrl: audio.file_url || audio.fileUrl,
        narrator: audio.narrator,
      };
    });

    const result = {
      id: categorySlug,
      label: category.name,
      icon: iconMap[categorySlug] || mdiMeditation,
      description: category.description,
      sessions: audioSubOptions.length,
      avgDuration: '5-20 min',
      subOptions: audioSubOptions,
    };

    return result;
  });
};

export const createFeaturedFormat = (categories: MeditationOption[]): FeaturedCategory[] => {
  return categories.map((cat) => ({
    id: cat.id,
    name: cat.label,
    description: cat.description,
    icon: cat.icon || '🧘',
    subOptions:
      cat.subOptions?.map((sub) => ({
        id: sub.id,
        name: sub.label,
        description: sub.description,
        sessions: sub.duration.map((dur) => ({
          duration: dur,
          title: sub.label,
          audioUrl: sub.audioUrl || '',
        })),
      })) || [],
  }));
};

export const mapFeaturedToOptions = (featured: FeaturedCategory[]): MeditationOption[] => {
  return featured.map((category) => {
    const subOptions: SubOption[] =
      category.subOptions?.map((subOption) => ({
        id: subOption.id,
        label: subOption.name,
        description: subOption.description,
        duration: subOption.sessions?.map((session) => session.duration) || [5, 10, 15],
      })) || [];

    return {
      id: category.id,
      label: category.name,
      icon: iconMap[category.id] || mdiMeditation,
      description: category.description,
      sessions: subOptions.length || 0,
      avgDuration: '5-30 min',
      subOptions,
    };
  });
};