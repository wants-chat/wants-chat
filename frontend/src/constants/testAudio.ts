// Free meditation audio URLs for testing
// These are publicly available audio files that can be used for testing
export const TEST_AUDIO_URLS = [
  {
    id: 'test-1',
    title: 'Sample Audio Track',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: 360,
    description: '6 minute test audio'
  },
  {
    id: 'test-2',
    title: 'Sample Audio Track 2',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    duration: 480,
    description: '8 minute test audio'
  },
  {
    id: 'test-3',
    title: 'Sample Audio Track 3',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    duration: 315,
    description: '5 minute test audio'
  },
  {
    id: 'test-4',
    title: 'Short Test Audio',
    url: 'https://sample-videos.com/audio/mp3/wave.mp3',
    duration: 45,
    description: 'Short test audio sample'
  }
];

// Map test audio to meditation format
export const mapTestAudioToMeditation = () => {
  return TEST_AUDIO_URLS.map(audio => ({
    id: audio.id,
    title: audio.title,
    description: audio.description,
    file_url: audio.url,
    duration_seconds: audio.duration,
    file_size_mb: 5, // Estimate
    type: 'meditation',
    narrator: 'Test Narrator',
    category: 'test',
    tags: ['test', 'meditation'],
    language: 'en',
    is_premium: false,
    created_at: new Date().toISOString(),
    is_favorited: false,
    play_count: 0
  }));
};