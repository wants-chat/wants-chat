/**
 * Media Component Generators Index
 */

// Video Player generators
export { generateVideoPlayer, generatePlaylist, generateVideoGrid, type VideoPlayerOptions } from './video-player.generator';

// Audio Player generators
export { generateAudioPlayer, generateTrackList, generateAlbumGrid, type AudioPlayerOptions } from './audio-player.generator';

// Gallery generators
export { generateGallery, generateLightbox, generateImageUpload, type GalleryOptions } from './gallery.generator';

// Podcast generators
export {
  generatePodcastPlayer,
  generateEpisodeList,
  generatePodcastGrid,
  generatePodcastSearch,
  generateEpisodeCard,
  type PodcastOptions
} from './podcast.generator';

// Library generators
export {
  generateLibraryStats,
  generateLibraryActivity,
  generateLibraryTabs,
  generateMemberProfileLibrary,
  generateBookSearch,
  type LibraryOptions
} from './library.generator';

// Video generators (additional)
export {
  generateVideoCard,
  generateVideoComments,
  type VideoOptions
} from './video.generator';

// Music generators
export {
  generateMusicPlayer,
  generateGenreGrid,
  type MusicOptions
} from './music.generator';

// Author generators
export {
  generateAuthorCard,
  generateAuthorProfile,
  generateFeaturedArticle,
  type AuthorOptions
} from './author.generator';
