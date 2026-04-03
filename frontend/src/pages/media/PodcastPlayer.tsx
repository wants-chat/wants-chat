import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Search, Heart, Download, Volume2, VolumeX, List, X } from 'lucide-react';
import Header from '../../components/landing/Header';
import BackgroundEffects from '../../components/ui/BackgroundEffects';

interface Podcast {
  id: number;
  title: string;
  author: string;
  duration: string;
  coverUrl: string;
  audioUrl: string;
  description: string;
}

const PodcastPlayer: React.FC = () => {
  const [podcasts, setPodcasts] = useState<Podcast[]>([
    {
      id: 1,
      title: 'The Science of Mindfulness',
      author: 'Wellness Weekly',
      duration: '45:30',
      coverUrl: 'https://picsum.photos/seed/podcast1/300/300',
      audioUrl: '',
      description: 'Exploring the benefits of mindfulness meditation'
    },
    {
      id: 2,
      title: 'Tech Trends 2025',
      author: 'Future Cast',
      duration: '38:15',
      coverUrl: 'https://picsum.photos/seed/podcast2/300/300',
      audioUrl: '',
      description: 'Latest innovations in technology and AI'
    },
    {
      id: 3,
      title: 'Healthy Living Tips',
      author: 'Life Balance',
      duration: '52:00',
      coverUrl: 'https://picsum.photos/seed/podcast3/300/300',
      audioUrl: '',
      description: 'Daily habits for a healthier lifestyle'
    }
  ]);

  const [currentPodcast, setCurrentPodcast] = useState<Podcast | null>(podcasts[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      playNext();
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentPodcast]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const playPodcast = (podcast: Podcast) => {
    setCurrentPodcast(podcast);
    setIsPlaying(true);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play();
      }
    }, 100);
  };

  const playNext = () => {
    if (!currentPodcast) return;
    const currentIndex = podcasts.findIndex(p => p.id === currentPodcast.id);
    const nextIndex = (currentIndex + 1) % podcasts.length;
    playPodcast(podcasts[nextIndex]);
  };

  const playPrevious = () => {
    if (!currentPodcast) return;
    const currentIndex = podcasts.findIndex(p => p.id === currentPodcast.id);
    const prevIndex = currentIndex === 0 ? podcasts.length - 1 : currentIndex - 1;
    playPodcast(podcasts[prevIndex]);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
    setIsMuted(vol === 0);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const toggleFavorite = (id: number) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
    );
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const filteredPodcasts = podcasts.filter(podcast =>
    podcast.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    podcast.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-cyan-900">
      <BackgroundEffects />
      <Header />

      <div className="relative z-10 container mx-auto px-4 py-8 pt-24">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Podcast Player</h1>
          <p className="text-cyan-300">Listen to your favorite podcasts</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400" size={20} />
          <input
            type="text"
            placeholder="Search podcasts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/10 backdrop-blur-lg border border-cyan-500/30 rounded-2xl py-3 pl-12 pr-4 text-white placeholder-cyan-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Now Playing Section */}
          <div className="lg:col-span-2">
            {currentPodcast && (
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-cyan-500/30">
                <div className="flex flex-col md:flex-row gap-6 mb-6">
                  <img
                    src={currentPodcast.coverUrl}
                    alt={currentPodcast.title}
                    className="w-full md:w-64 h-64 object-cover rounded-2xl shadow-2xl"
                  />
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-white mb-2">{currentPodcast.title}</h2>
                    <p className="text-cyan-300 mb-4">{currentPodcast.author}</p>
                    <p className="text-gray-300 mb-6">{currentPodcast.description}</p>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleFavorite(currentPodcast.id)}
                        className={`p-3 rounded-full transition ${
                          favorites.includes(currentPodcast.id)
                            ? 'bg-red-500/30 text-red-400'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        <Heart size={20} fill={favorites.includes(currentPodcast.id) ? 'currentColor' : 'none'} />
                      </button>
                      <button className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition">
                        <Download size={20} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400"
                  />
                  <div className="flex justify-between text-sm text-cyan-300 mt-2">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={playPrevious}
                      className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
                    >
                      <SkipBack size={24} />
                    </button>
                    <button
                      onClick={togglePlay}
                      className="p-4 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:from-cyan-600 hover:to-teal-600 transition shadow-lg"
                    >
                      {isPlaying ? <Pause size={32} /> : <Play size={32} />}
                    </button>
                    <button
                      onClick={playNext}
                      className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
                    >
                      <SkipForward size={24} />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <button onClick={toggleMute} className="text-white hover:text-cyan-400 transition">
                      {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-24 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400"
                    />
                  </div>
                </div>

                <audio ref={audioRef} src={currentPodcast.audioUrl} />
              </div>
            )}
          </div>

          {/* Playlist Section */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-cyan-500/30">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Playlist</h3>
                <button
                  onClick={() => setShowPlaylist(!showPlaylist)}
                  className="lg:hidden p-2 rounded-full bg-white/10 text-white"
                >
                  {showPlaylist ? <X size={20} /> : <List size={20} />}
                </button>
              </div>

              <div className={`space-y-3 ${showPlaylist || 'hidden lg:block'}`}>
                {filteredPodcasts.map((podcast) => (
                  <div
                    key={podcast.id}
                    onClick={() => playPodcast(podcast)}
                    className={`p-4 rounded-xl cursor-pointer transition ${
                      currentPodcast?.id === podcast.id
                        ? 'bg-gradient-to-r from-cyan-500/30 to-teal-500/30 border border-cyan-400'
                        : 'bg-white/5 hover:bg-white/10 border border-transparent'
                    }`}
                  >
                    <div className="flex gap-3">
                      <img
                        src={podcast.coverUrl}
                        alt={podcast.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-semibold truncate">{podcast.title}</h4>
                        <p className="text-cyan-300 text-sm truncate">{podcast.author}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-400">{podcast.duration}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(podcast.id);
                            }}
                            className="text-cyan-400 hover:text-red-400 transition"
                          >
                            <Heart size={16} fill={favorites.includes(podcast.id) ? 'currentColor' : 'none'} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PodcastPlayer;
