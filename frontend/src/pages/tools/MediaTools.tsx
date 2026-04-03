import { useState, useRef } from 'react';
import Header from '../../components/landing/Header';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Music, Video, Upload, Download } from 'lucide-react';
import { useConfirm } from '../../contexts/ConfirmDialogContext';

export default function MediaTools() {
  const { alert } = useConfirm();
  // Audio Converter State
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioFormat, setAudioFormat] = useState('mp3');
  const [audioBitrate, setAudioBitrate] = useState('192');
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Video Compressor State
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoQuality, setVideoQuality] = useState('medium');
  const [videoResolution, setVideoResolution] = useState('1080');
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
    } else {
      await alert({
        title: 'Invalid File',
        message: 'Please select a valid audio file',
        variant: 'warning'
      });
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
    } else {
      await alert({
        title: 'Invalid File',
        message: 'Please select a valid video file',
        variant: 'warning'
      });
    }
  };

  const convertAudio = async () => {
    if (!audioFile) {
      await alert({
        title: 'No File Selected',
        message: 'Please select an audio file first',
        variant: 'warning'
      });
      return;
    }

    await alert({
      title: 'Implementation Required',
      message: `Audio conversion to ${audioFormat.toUpperCase()} at ${audioBitrate}kbps would be performed here. This requires FFmpeg or a similar audio processing library on the backend.`,
      variant: 'info'
    });
  };

  const compressVideo = async () => {
    if (!videoFile) {
      await alert({
        title: 'No File Selected',
        message: 'Please select a video file first',
        variant: 'warning'
      });
      return;
    }

    await alert({
      title: 'Implementation Required',
      message: `Video compression at ${videoQuality} quality (${videoResolution}p) would be performed here. This requires FFmpeg or a video processing service on the backend.`,
      variant: 'info'
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <BackgroundEffects />
      <Header />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              Media Tools
            </h1>
            <p className="text-gray-400">Convert and compress audio and video files</p>
          </div>

          <Tabs defaultValue="audio" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 backdrop-blur-sm">
              <TabsTrigger value="audio" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500">
                <Music className="w-4 h-4 mr-2" />
                Audio
              </TabsTrigger>
              <TabsTrigger value="video" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500">
                <Video className="w-4 h-4 mr-2" />
                Video
              </TabsTrigger>
            </TabsList>

            <TabsContent value="audio" className="space-y-4 mt-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Audio Converter</h2>

                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center">
                    <input
                      type="file"
                      ref={audioInputRef}
                      accept="audio/*"
                      onChange={handleAudioUpload}
                      className="hidden"
                    />
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                    <button
                      onClick={() => audioInputRef.current?.click()}
                      className="px-6 py-2 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                    >
                      Choose Audio File
                    </button>
                    {audioFile && (
                      <div className="mt-4 text-sm text-gray-400">
                        <p>Selected: {audioFile.name}</p>
                        <p>Size: {formatFileSize(audioFile.size)}</p>
                        <p>Type: {audioFile.type}</p>
                      </div>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Output Format</label>
                      <select
                        value={audioFormat}
                        onChange={(e) => setAudioFormat(e.target.value)}
                        className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white focus:border-teal-500 focus:outline-none"
                      >
                        <option value="mp3">MP3</option>
                        <option value="wav">WAV</option>
                        <option value="ogg">OGG</option>
                        <option value="aac">AAC</option>
                        <option value="flac">FLAC</option>
                        <option value="m4a">M4A</option>
                        <option value="wma">WMA</option>
                        <option value="opus">OPUS</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Bitrate (kbps)</label>
                      <select
                        value={audioBitrate}
                        onChange={(e) => setAudioBitrate(e.target.value)}
                        className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white focus:border-teal-500 focus:outline-none"
                      >
                        <option value="64">64 kbps (Low)</option>
                        <option value="128">128 kbps (Standard)</option>
                        <option value="192">192 kbps (High)</option>
                        <option value="256">256 kbps (Very High)</option>
                        <option value="320">320 kbps (Maximum)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={convertAudio}
                    disabled={!audioFile}
                    className="w-full px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Convert Audio
                  </button>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <h3 className="font-semibold text-blue-400 mb-2">Supported Formats:</h3>
                      <ul className="text-sm text-blue-300 space-y-1">
                        <li>MP3, WAV, OGG</li>
                        <li>AAC, FLAC, M4A</li>
                        <li>WMA, OPUS, AIFF</li>
                        <li>And many more...</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <h3 className="font-semibold text-green-400 mb-2">Features:</h3>
                      <ul className="text-sm text-green-300 space-y-1">
                        <li>Batch conversion</li>
                        <li>Quality control</li>
                        <li>Metadata preservation</li>
                        <li>Fast processing</li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <h3 className="font-semibold text-yellow-400 mb-2">Implementation Required:</h3>
                    <p className="text-sm text-yellow-300 mb-2">
                      Audio conversion requires backend implementation using:
                    </p>
                    <ul className="text-sm text-yellow-300 list-disc list-inside space-y-1">
                      <li><strong>FFmpeg</strong> - Industry-standard multimedia framework</li>
                      <li><strong>fluent-ffmpeg</strong> - Node.js FFmpeg wrapper</li>
                      <li><strong>pydub</strong> - Python audio processing library</li>
                      <li><strong>CloudConvert API</strong> - Cloud-based conversion service</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="video" className="space-y-4 mt-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Video Compressor</h2>

                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center">
                    <input
                      type="file"
                      ref={videoInputRef}
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="hidden"
                    />
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                    <button
                      onClick={() => videoInputRef.current?.click()}
                      className="px-6 py-2 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                    >
                      Choose Video File
                    </button>
                    {videoFile && (
                      <div className="mt-4 text-sm text-gray-400">
                        <p>Selected: {videoFile.name}</p>
                        <p>Size: {formatFileSize(videoFile.size)}</p>
                        <p>Type: {videoFile.type}</p>
                      </div>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Compression Quality</label>
                      <select
                        value={videoQuality}
                        onChange={(e) => setVideoQuality(e.target.value)}
                        className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white focus:border-teal-500 focus:outline-none"
                      >
                        <option value="low">Low (High Compression)</option>
                        <option value="medium">Medium (Balanced)</option>
                        <option value="high">High (Best Quality)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Resolution</label>
                      <select
                        value={videoResolution}
                        onChange={(e) => setVideoResolution(e.target.value)}
                        className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-white focus:border-teal-500 focus:outline-none"
                      >
                        <option value="480">480p (SD)</option>
                        <option value="720">720p (HD)</option>
                        <option value="1080">1080p (Full HD)</option>
                        <option value="1440">1440p (2K)</option>
                        <option value="2160">2160p (4K)</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">Advanced Options</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Output Format</label>
                        <select className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2 text-white text-sm focus:border-teal-500 focus:outline-none">
                          <option value="mp4">MP4 (H.264)</option>
                          <option value="webm">WebM (VP9)</option>
                          <option value="avi">AVI</option>
                          <option value="mov">MOV</option>
                          <option value="mkv">MKV</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Frame Rate</label>
                        <select className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2 text-white text-sm focus:border-teal-500 focus:outline-none">
                          <option value="24">24 fps (Cinema)</option>
                          <option value="30">30 fps (Standard)</option>
                          <option value="60">60 fps (Smooth)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={compressVideo}
                    disabled={!videoFile}
                    className="w-full px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Compress Video
                  </button>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                      <h3 className="font-semibold text-purple-400 mb-2 text-sm">Compression</h3>
                      <p className="text-xs text-purple-300">
                        Reduce file size by up to 90% while maintaining visual quality
                      </p>
                    </div>
                    <div className="p-4 bg-pink-500/10 border border-pink-500/30 rounded-lg">
                      <h3 className="font-semibold text-pink-400 mb-2 text-sm">Resolution</h3>
                      <p className="text-xs text-pink-300">
                        Scale videos from 480p to 4K resolution
                      </p>
                    </div>
                    <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                      <h3 className="font-semibold text-indigo-400 mb-2 text-sm">Formats</h3>
                      <p className="text-xs text-indigo-300">
                        Convert between MP4, WebM, AVI, MOV, and more
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <h3 className="font-semibold text-yellow-400 mb-2">Implementation Required:</h3>
                    <p className="text-sm text-yellow-300 mb-2">
                      Video processing requires backend implementation using:
                    </p>
                    <ul className="text-sm text-yellow-300 list-disc list-inside space-y-1">
                      <li><strong>FFmpeg</strong> - Complete video processing solution</li>
                      <li><strong>HandBrake CLI</strong> - Video transcoder</li>
                      <li><strong>MediaConvert (AWS)</strong> - Cloud video processing</li>
                      <li><strong>Cloudflare Stream</strong> - Video encoding service</li>
                      <li><strong>Mux API</strong> - Video streaming and encoding</li>
                    </ul>
                    <p className="text-sm text-yellow-300 mt-2">
                      Note: Video processing is resource-intensive and typically handled on the server side with background job queues.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
