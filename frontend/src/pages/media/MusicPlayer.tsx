import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, VolumeX, Heart, List, Music, Search } from 'lucide-react';
import Header from '../../components/landing/Header';
import BackgroundEffects from '../../components/ui/BackgroundEffects';

interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  coverUrl: string;
  audioUrl: string;
}

const MusicPlayer: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([
    {
      id: 1,
      title: 'Midnight Dreams',
      artist: 'Luna Sky',
      album: 'Night Vibes',
      duration: '3:45',
      coverUrl: 'https://picsum.photos/seed/music1/400/400',
      audioUrl: ''
    },
    {
      id: 2,
      title: 'Electric Pulse',
      artist: 'Neon Waves',
      album: 'Synthwave',
      duration: '4:12',
      coverUrl: 'https://picsum.photos/seed/music2/400/400',
      audioUrl: ''
    },
    {
      id: 3,
      title: 'Ocean Breeze',
      artist: 'Coastal Sounds',
      album: 'Relaxation',
      duration: '3:28',
      coverUrl: 'https://picsum.photos/seed/music3/400/400',
      audioUrl: ''
    },
    {
      id: 4,
      title: 'Urban Rhythm',
      artist: 'City Beats',
      album: 'Street Life',
      duration: '3:55',
      coverUrl: 'https://picsum.photos/seed/music4/400/400',
      audioUrl: ''
    },
    {
      id: 5,
      title: 'Mountain Echo',
      artist: 'Nature Symphony',
      album: 'Wilderness',
      duration: '4:30',
      coverUrl: 'https://picsum.photos/seed/music5/400/400',
      audioUrl: ''
    }
  ]);

  const [currentSong, setCurrentSong] = useState<Song>(songs[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [showPlaylist, setShowPlaylist] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<number[]>([1, 3]);
  const [visualizerData, setVisualizerData] = useState<number[]>(Array(20).fill(0));

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play();
      } else {
        playNext();
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentSong, repeatMode]);

  // Visualizer animation
  useEffect(() => {
    if (!isPlaying) {
      setVisualizerData(Array(20).fill(0));
      return;
    }

    const interval = setInterval(() => {
      setVisualizerData(prev =>
        prev.map(() => Math.random() * 100)
      );
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

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

  const playSong = (song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play();
      }
    }, 100);
  };

  const playNext = () => {
    const currentIndex = songs.findIndex(s => s.id === currentSong.id);
    let nextIndex;

    if (isShuffled) {
      nextIndex = Math.floor(Math.random() * songs.length);
    } else {
      nextIndex = (currentIndex + 1) % songs.length;
    }

    playSong(songs[nextIndex]);
  };

  const playPrevious = () => {
    if (currentTime > 3) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    } else {
      const currentIndex = songs.findIndex(s => s.id === currentSong.id);
      const prevIndex = currentIndex === 0 ? songs.length - 1 : currentIndex - 1;
      playSong(songs[prevIndex]);
    }
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

  const toggleRepeat = () => {
    const modes: Array<'off' | 'all' | 'one'> = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    setRepeatMode(modes[(currentIndex + 1) % modes.length]);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.album.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-cyan-900">
      <BackgroundEffects />
      <Header />

      <div className="relative z-10 container mx-auto px-4 py-8 pt-24">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Music Player</h1>
          <p className="text-cyan-300">Enjoy your favorite music</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Player */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-cyan-500/30">
              {/* Album Art & Info */}
              <div className="flex flex-col md:flex-row gap-8 mb-8">
                <div className="relative group">
                  <img
                    src={currentSong.coverUrl}
                    alt={currentSong.title}
                    className="w-full md:w-80 h-80 object-cover rounded-2xl shadow-2xl"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={togglePlay}
                      className="p-6 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-2xl transform scale-110"
                    >
                      {isPlaying ? <Pause size={48} /> : <Play size={48} />}
                    </button>
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-center">
                  <h2 className="text-4xl font-bold text-white mb-2">{currentSong.title}</h2>
                  <p className="text-2xl text-cyan-300 mb-4">{currentSong.artist}</p>
                  <p className="text-lg text-gray-400 mb-6">{currentSong.album}</p>

                  <button
                    onClick={() => toggleFavorite(currentSong.id)}
                    className={`w-fit px-6 py-3 rounded-full transition ${
                      favorites.includes(currentSong.id)
                        ? 'bg-red-500/30 text-red-400'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    } flex items-center gap-2`}
                  >
                    <Heart size={20} fill={favorites.includes(currentSong.id) ? 'currentColor' : 'none'} />
                    {favorites.includes(currentSong.id) ? 'Liked' : 'Like'}
                  </button>
                </div>
              </div>

              {/* Visualizer */}
              <div className="mb-6 h-24 bg-black/20 rounded-2xl p-4 flex items-end justify-around gap-1">
                {visualizerData.map((height, index) => (
                  <div
                    key={index}
                    className="w-full bg-gradient-to-t from-cyan-500 to-teal-400 rounded-full transition-all duration-100"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
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
                    onClick={() => setIsShuffled(!isShuffled)}
                    className={`p-3 rounded-full transition ${
                      isShuffled
                        ? 'bg-cyan-500/30 text-cyan-400'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <Shuffle size={20} />
                  </button>
                  <button
                    onClick={playPrevious}
                    className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
                  >
                    <SkipBack size={28} />
                  </button>
                  <button
                    onClick={togglePlay}
                    className="p-5 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:from-cyan-600 hover:to-teal-600 transition shadow-lg"
                  >
                    {isPlaying ? <Pause size={36} /> : <Play size={36} />}
                  </button>
                  <button
                    onClick={playNext}
                    className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
                  >
                    <SkipForward size={28} />
                  </button>
                  <button
                    onClick={toggleRepeat}
                    className={`p-3 rounded-full transition relative ${
                      repeatMode !== 'off'
                        ? 'bg-cyan-500/30 text-cyan-400'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <Repeat size={20} />
                    {repeatMode === 'one' && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-400 text-gray-900 rounded-full text-xs flex items-center justify-center font-bold">
                        1
                      </span>
                    )}
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

              <audio ref={audioRef} src={currentSong.audioUrl} />
            </div>
          </div>

          {/* Playlist */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-cyan-500/30">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <List size={24} />
                  Playlist
                </h3>
                <span className="text-cyan-300">{songs.length} songs</span>
              </div>

              <div className="mb-4 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" size={18} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/10 border border-cyan-500/30 rounded-xl py-2 pl-10 pr-3 text-white placeholder-cyan-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm"
                />
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredSongs.map((song) => (
                  <div
                    key={song.id}
                    onClick={() => playSong(song)}
                    className={`p-3 rounded-xl cursor-pointer transition ${
                      currentSong.id === song.id
                        ? 'bg-gradient-to-r from-cyan-500/30 to-teal-500/30 border border-cyan-400'
                        : 'bg-white/5 hover:bg-white/10 border border-transparent'
                    }`}
                  >
                    <div className="flex gap-3">
                      <img
                        src={song.coverUrl}
                        alt={song.title}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-semibold truncate text-sm">{song.title}</h4>
                        <p className="text-cyan-300 text-xs truncate">{song.artist}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-400">{song.duration}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(song.id);
                            }}
                            className="text-cyan-400 hover:text-red-400 transition"
                          >
                            <Heart size={14} fill={favorites.includes(song.id) ? 'currentColor' : 'none'} />
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

export default MusicPlayer;
