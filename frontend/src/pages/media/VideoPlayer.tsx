import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipBack, SkipForward, Upload, List, Settings, X } from 'lucide-react';
import Header from '../../components/landing/Header';
import BackgroundEffects from '../../components/ui/BackgroundEffects';

interface Video {
  id: number;
  title: string;
  duration: string;
  thumbnail: string;
  videoUrl: string;
  size: string;
  uploadDate: string;
}

const VideoPlayer: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([
    {
      id: 1,
      title: 'Introduction to Web Development',
      duration: '15:30',
      thumbnail: 'https://picsum.photos/seed/video1/640/360',
      videoUrl: '',
      size: '125 MB',
      uploadDate: '2024-12-20'
    },
    {
      id: 2,
      title: 'Advanced React Patterns',
      duration: '22:15',
      thumbnail: 'https://picsum.photos/seed/video2/640/360',
      videoUrl: '',
      size: '180 MB',
      uploadDate: '2024-12-19'
    },
    {
      id: 3,
      title: 'TypeScript Best Practices',
      duration: '18:45',
      thumbnail: 'https://picsum.photos/seed/video3/640/360',
      videoUrl: '',
      size: '150 MB',
      uploadDate: '2024-12-18'
    },
    {
      id: 4,
      title: 'Building REST APIs',
      duration: '25:00',
      thumbnail: 'https://picsum.photos/seed/video4/640/360',
      videoUrl: '',
      size: '200 MB',
      uploadDate: '2024-12-17'
    }
  ]);

  const [currentVideo, setCurrentVideo] = useState<Video>(videos[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [showPlaylist, setShowPlaylist] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      playNext();
    };

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('ended', handleEnded);
    };
  }, [currentVideo]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const playVideo = (video: Video) => {
    setCurrentVideo(video);
    setIsPlaying(true);
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play();
      }
    }, 100);
  };

  const playNext = () => {
    const currentIndex = videos.findIndex(v => v.id === currentVideo.id);
    const nextIndex = (currentIndex + 1) % videos.length;
    playVideo(videos[nextIndex]);
  };

  const playPrevious = () => {
    const currentIndex = videos.findIndex(v => v.id === currentVideo.id);
    const prevIndex = currentIndex === 0 ? videos.length - 1 : currentIndex - 1;
    playVideo(videos[prevIndex]);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (videoRef.current) {
      videoRef.current.volume = vol;
    }
    setIsMuted(vol === 0);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume;
        setIsMuted(false);
      } else {
        videoRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    setShowSettings(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      const newVideo: Video = {
        id: Date.now() + Math.random(),
        title: file.name,
        duration: '0:00',
        thumbnail: 'https://picsum.photos/seed/video-new/640/360',
        videoUrl: url,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        uploadDate: new Date().toISOString().split('T')[0]
      };
      setVideos(prev => [newVideo, ...prev]);
    });
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-cyan-900">
      <BackgroundEffects />
      <Header />

      <div className="relative z-10 container mx-auto px-4 py-8 pt-24">
        {/* Header Section */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Video Player</h1>
            <p className="text-cyan-300">Watch and manage your video library</p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-2xl hover:from-cyan-600 hover:to-teal-600 transition shadow-lg flex items-center gap-2"
          >
            <Upload size={20} />
            Upload Video
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <div
              ref={containerRef}
              className="bg-black rounded-3xl overflow-hidden relative group"
              onMouseMove={handleMouseMove}
              onMouseLeave={() => isPlaying && setShowControls(false)}
            >
              <video
                ref={videoRef}
                src={currentVideo.videoUrl}
                poster={currentVideo.thumbnail}
                className="w-full aspect-video object-contain"
                onClick={togglePlay}
              />

              {/* Play Button Overlay */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <button
                    onClick={togglePlay}
                    className="p-8 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-2xl hover:scale-110 transition"
                  >
                    <Play size={48} />
                  </button>
                </div>
              )}

              {/* Controls */}
              <div
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6 transition-opacity duration-300 ${
                  showControls ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {/* Progress Bar */}
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer mb-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400"
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={togglePlay}
                      className="text-white hover:text-cyan-400 transition"
                    >
                      {isPlaying ? <Pause size={28} /> : <Play size={28} />}
                    </button>
                    <button
                      onClick={playPrevious}
                      className="text-white hover:text-cyan-400 transition"
                    >
                      <SkipBack size={24} />
                    </button>
                    <button
                      onClick={playNext}
                      className="text-white hover:text-cyan-400 transition"
                    >
                      <SkipForward size={24} />
                    </button>
                    <div className="flex items-center gap-2">
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
                        className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400"
                      />
                    </div>
                    <span className="text-white text-sm">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="text-white hover:text-cyan-400 transition"
                      >
                        <Settings size={24} />
                      </button>
                      {showSettings && (
                        <div className="absolute bottom-full right-0 mb-2 bg-gray-900 rounded-xl p-2 min-w-[120px] border border-cyan-500/30">
                          <div className="text-white text-sm font-semibold mb-2 px-2">Speed</div>
                          {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                            <button
                              key={rate}
                              onClick={() => changePlaybackRate(rate)}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                                playbackRate === rate
                                  ? 'bg-cyan-500/30 text-cyan-400'
                                  : 'text-white hover:bg-white/10'
                              }`}
                            >
                              {rate}x
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={toggleFullscreen}
                      className="text-white hover:text-cyan-400 transition"
                    >
                      {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Info */}
            <div className="mt-6 bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-cyan-500/30">
              <h2 className="text-2xl font-bold text-white mb-2">{currentVideo.title}</h2>
              <div className="flex items-center gap-4 text-cyan-300">
                <span>{currentVideo.duration}</span>
                <span>•</span>
                <span>{currentVideo.size}</span>
                <span>•</span>
                <span>{currentVideo.uploadDate}</span>
              </div>
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
                <span className="text-cyan-300">{videos.length}</span>
              </div>

              <div className="space-y-3 max-h-[700px] overflow-y-auto">
                {videos.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => playVideo(video)}
                    className={`cursor-pointer rounded-xl overflow-hidden transition ${
                      currentVideo.id === video.id
                        ? 'ring-2 ring-cyan-400'
                        : 'hover:ring-2 hover:ring-white/30'
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-white text-xs">
                        {video.duration}
                      </div>
                      {currentVideo.id === video.id && isPlaying && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                    <div className={`p-3 ${
                      currentVideo.id === video.id
                        ? 'bg-gradient-to-r from-cyan-500/30 to-teal-500/30'
                        : 'bg-white/5'
                    }`}>
                      <h4 className="text-white font-semibold text-sm line-clamp-2 mb-1">
                        {video.title}
                      </h4>
                      <p className="text-cyan-300 text-xs">{video.size}</p>
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

export default VideoPlayer;
