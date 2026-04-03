/**
 * Media Component Generators for React Native
 *
 * This module exports all media-related component generators including:
 * - Video player and video grid components
 * - Audio player and track list components
 * - Gallery and lightbox components
 * - Podcast player and episode components
 * - Library components (stats, activity, tabs)
 * - Music player components
 * - Author profile and card components
 */

// Video Player generators
export {
  generateVideoPlayer,
  generatePlaylist,
  generateVideoGrid,
} from './video-player.generator';

export type { VideoPlayerOptions } from './video-player.generator';

// Audio Player generators
export {
  generateAudioPlayer,
  generateTrackList,
  generateAlbumGrid,
} from './audio-player.generator';

export type { AudioPlayerOptions } from './audio-player.generator';

// Gallery generators
export {
  generateGallery,
  generateLightbox,
  generateImageUpload,
} from './gallery.generator';

export type { GalleryOptions } from './gallery.generator';

// Podcast generators
export {
  generatePodcastPlayer,
  generateEpisodeList,
  generatePodcastGrid,
  generatePodcastSearch,
  generateEpisodeCard,
} from './podcast.generator';

export type { PodcastOptions } from './podcast.generator';

// Library generators
export {
  generateLibraryStats,
  generateLibraryActivity,
  generateLibraryTabs,
  generateMemberProfileLibrary,
  generateBookSearch,
} from './library.generator';

export type { LibraryOptions } from './library.generator';

// Music generators
export {
  generateMusicPlayerFull,
  generateMiniPlayer,
  generatePlaylistCard,
  generateArtistCard,
  generateQueueList,
} from './music.generator';

export type { MusicOptions } from './music.generator';

// Video generators
export {
  generateVideoCard,
  generateVideoComments,
} from './video.generator';

export type { VideoOptions } from './video.generator';

// Author generators
export {
  generateAuthorProfile,
  generateAuthorList,
  generateAuthorCard,
} from './author.generator';

export type { AuthorOptions } from './author.generator';
