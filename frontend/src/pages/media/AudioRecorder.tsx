import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Download, Trash2, Save, Clock, Volume2 } from 'lucide-react';
import Header from '../../components/landing/Header';
import BackgroundEffects from '../../components/ui/BackgroundEffects';
import { useConfirm } from '../../contexts/ConfirmDialogContext';

interface Recording {
  id: number;
  name: string;
  duration: string;
  size: string;
  date: string;
  url: string;
}

const AudioRecorder: React.FC = () => {
  const { alert } = useConfirm();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [currentPlayingId, setCurrentPlayingId] = useState<number | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [visualizerData, setVisualizerData] = useState<number[]>(Array(40).fill(0));

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    return () => {
      stopRecording();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Setup audio context and analyser
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      // Start visualizer
      visualizeAudio();

      // Setup media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);

        const newRecording: Recording = {
          id: Date.now(),
          name: `Recording ${recordings.length + 1}`,
          duration: formatTime(recordingTime),
          size: `${(audioBlob.size / 1024).toFixed(2)} KB`,
          date: new Date().toLocaleString(),
          url: audioUrl
        };

        setRecordings(prev => [newRecording, ...prev]);
        setRecordingTime(0);
        setVisualizerData(Array(40).fill(0));
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);

      // Start timer
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      await alert({
        title: 'Microphone Access Error',
        message: 'Could not access microphone. Please check permissions.',
        variant: 'warning'
      });
    }
  };

  const visualizeAudio = () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);

      if (!analyserRef.current) return;
      analyserRef.current.getByteFrequencyData(dataArray);

      // Update visualizer data
      const step = Math.floor(bufferLength / 40);
      const newVisualizerData = Array(40).fill(0).map((_, i) => {
        const index = i * step;
        return (dataArray[index] / 255) * 100;
      });
      setVisualizerData(newVisualizerData);

      // Update audio level
      const average = dataArray.reduce((a, b) => a + b) / bufferLength;
      setAudioLevel((average / 255) * 100);
    };

    draw();
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        if (timerIntervalRef.current) {
          timerIntervalRef.current = setInterval(() => {
            setRecordingTime(prev => prev + 1);
          }, 1000);
        }
      } else {
        mediaRecorderRef.current.pause();
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
      }
      setIsPaused(!isPaused);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);

      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  };

  const playRecording = (recording: Recording) => {
    if (audioRef.current) {
      if (currentPlayingId === recording.id) {
        audioRef.current.pause();
        setCurrentPlayingId(null);
      } else {
        audioRef.current.src = recording.url;
        audioRef.current.play();
        setCurrentPlayingId(recording.id);
      }
    }
  };

  const downloadRecording = (recording: Recording) => {
    const link = document.createElement('a');
    link.href = recording.url;
    link.download = `${recording.name}.webm`;
    link.click();
  };

  const deleteRecording = (id: number) => {
    setRecordings(prev => prev.filter(r => r.id !== id));
    if (currentPlayingId === id) {
      setCurrentPlayingId(null);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-cyan-900">
      <BackgroundEffects />
      <Header />

      <div className="relative z-10 container mx-auto px-4 py-8 pt-24">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Audio Recorder</h1>
          <p className="text-cyan-300">Record, playback, and manage your audio recordings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recorder Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-cyan-500/30">
            <div className="flex flex-col items-center">
              {/* Timer */}
              <div className="mb-8">
                <div className="text-6xl font-bold text-white font-mono">
                  {formatTime(recordingTime)}
                </div>
                {isRecording && (
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <div className={`w-3 h-3 rounded-full ${isPaused ? 'bg-yellow-400' : 'bg-red-500 animate-pulse'}`} />
                    <span className="text-cyan-300">
                      {isPaused ? 'Paused' : 'Recording'}
                    </span>
                  </div>
                )}
              </div>

              {/* Visualizer */}
              <div className="w-full h-40 bg-black/20 rounded-2xl p-4 mb-8 flex items-end justify-around gap-1">
                {visualizerData.map((height, index) => (
                  <div
                    key={index}
                    className="flex-1 bg-gradient-to-t from-cyan-500 to-teal-400 rounded-full transition-all duration-75"
                    style={{ height: `${isRecording && !isPaused ? height : 0}%` }}
                  />
                ))}
              </div>

              {/* Audio Level Meter */}
              {isRecording && (
                <div className="w-full mb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <Volume2 size={20} className="text-cyan-400" />
                    <span className="text-white text-sm">Input Level</span>
                  </div>
                  <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 transition-all duration-100"
                      style={{ width: `${audioLevel}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Control Buttons */}
              <div className="flex items-center gap-4">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="p-8 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 transition shadow-2xl"
                  >
                    <Mic size={48} />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={pauseRecording}
                      className="p-6 rounded-full bg-yellow-500/20 border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-500/30 transition"
                    >
                      {isPaused ? <Play size={32} /> : <Pause size={32} />}
                    </button>
                    <button
                      onClick={stopRecording}
                      className="p-8 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 transition shadow-2xl"
                    >
                      <Square size={48} />
                    </button>
                  </>
                )}
              </div>

              {!isRecording && (
                <p className="text-cyan-300 mt-6 text-center">
                  Click the microphone to start recording
                </p>
              )}
            </div>
          </div>

          {/* Recordings List */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-cyan-500/30">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Recordings</h2>
              <span className="text-cyan-300">{recordings.length} total</span>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {recordings.length === 0 ? (
                <div className="text-center py-12">
                  <Mic size={48} className="mx-auto text-gray-500 mb-4" />
                  <p className="text-gray-400">No recordings yet</p>
                  <p className="text-gray-500 text-sm mt-2">Start recording to create your first audio</p>
                </div>
              ) : (
                recordings.map((recording) => (
                  <div
                    key={recording.id}
                    className={`bg-white/5 hover:bg-white/10 rounded-2xl p-4 transition ${
                      currentPlayingId === recording.id ? 'ring-2 ring-cyan-400' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => playRecording(recording)}
                        className={`p-4 rounded-full transition ${
                          currentPlayingId === recording.id
                            ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        {currentPlayingId === recording.id ? <Pause size={24} /> : <Play size={24} />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold truncate">{recording.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-cyan-300 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {recording.duration}
                          </span>
                          <span>{recording.size}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{recording.date}</p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => downloadRecording(recording)}
                          className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
                          title="Download"
                        >
                          <Download size={18} />
                        </button>
                        <button
                          onClick={() => deleteRecording(recording.id)}
                          className="p-3 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {currentPlayingId === recording.id && (
                      <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-cyan-400 to-teal-400 w-1/3 animate-pulse" />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <audio
              ref={audioRef}
              onEnded={() => setCurrentPlayingId(null)}
              className="hidden"
            />
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-cyan-500/30">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-cyan-500/20 rounded-xl">
                <Mic className="text-cyan-400" size={24} />
              </div>
              <h3 className="text-white font-semibold">High Quality</h3>
            </div>
            <p className="text-cyan-300 text-sm">Crystal clear audio recording with real-time visualization</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-cyan-500/30">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-teal-500/20 rounded-xl">
                <Download className="text-teal-400" size={24} />
              </div>
              <h3 className="text-white font-semibold">Easy Export</h3>
            </div>
            <p className="text-cyan-300 text-sm">Download your recordings in WebM format instantly</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-cyan-500/30">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Save className="text-purple-400" size={24} />
              </div>
              <h3 className="text-white font-semibold">Auto Save</h3>
            </div>
            <p className="text-cyan-300 text-sm">Recordings are automatically saved to your library</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioRecorder;
