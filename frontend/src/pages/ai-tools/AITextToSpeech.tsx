import React, { useState, useRef } from 'react';
import { Volume2, Loader2, Play, Pause, Download, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AIToolLayout from '@/components/ai-tools/AIToolLayout';
import { aiToolsApi, TTSData } from '@/lib/api/ai-tools-api';
import { toast } from 'sonner';

const VOICES = [
  { id: 'alloy', name: 'Alloy', description: 'Neutral and balanced' },
  { id: 'echo', name: 'Echo', description: 'Warm and engaging' },
  { id: 'fable', name: 'Fable', description: 'Expressive and dramatic' },
  { id: 'onyx', name: 'Onyx', description: 'Deep and authoritative' },
  { id: 'nova', name: 'Nova', description: 'Friendly and upbeat' },
  { id: 'shimmer', name: 'Shimmer', description: 'Clear and professional' },
];

const AITextToSpeech: React.FC = () => {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('alloy');
  const [speed, setSpeed] = useState([1.0]);
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast.error('Please enter text to convert');
      return;
    }

    try {
      setLoading(true);
      const data: TTSData = {
        text: text.trim(),
        voice,
        speed: speed[0],
      };

      const response = await aiToolsApi.textToSpeech(data);
      // Response may have audioBase64 directly or nested in .data
      const audioBase64 = response.audioBase64 || response.data?.audioBase64;

      if (audioBase64) {
        const audioDataUrl = `data:audio/mp3;base64,${audioBase64}`;
        setAudioUrl(audioDataUrl);
        toast.success('Audio generated successfully!');
      } else {
        toast.error('No audio data received');
      }
    } catch (error: any) {
      console.error('TTS failed:', error);
      toast.error(error.message || 'Failed to generate audio');
    } finally {
      setLoading(false);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleDownload = async () => {
    if (!audioUrl) return;
    try {
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tts-audio-${Date.now()}.mp3`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Audio downloaded');
    } catch (error) {
      toast.error('Failed to download audio');
    }
  };

  return (
    <AIToolLayout
      title="AI Text-to-Speech"
      description="Convert text to natural-sounding speech"
      icon={<Volume2 className="w-8 h-8" />}
      iconColor="text-green-400"
      iconBgColor="bg-green-500/20"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardContent className="p-6 space-y-4">
            <div>
              <Label className="text-white">Text to Convert *</Label>
              <Textarea
                placeholder="Enter the text you want to convert to speech..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="mt-1 min-h-[150px] bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
              <p className="text-xs text-white/40 mt-1">{text.length} characters</p>
            </div>

            <div>
              <Label className="text-white">Voice</Label>
              <Select value={voice} onValueChange={setVoice}>
                <SelectTrigger className="mt-1 bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VOICES.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      <div className="flex flex-col">
                        <span>{v.name}</span>
                        <span className="text-xs text-muted-foreground">{v.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label className="text-white">Speed</Label>
                <span className="text-sm text-white/60">{speed[0].toFixed(1)}x</span>
              </div>
              <Slider
                value={speed}
                onValueChange={setSpeed}
                min={0.5}
                max={2.0}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-white/40 mt-1">
                <span>0.5x</span>
                <span>1.0x</span>
                <span>2.0x</span>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading || !text.trim()}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate Speech
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardContent className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center min-h-[300px]">
                <Loader2 className="w-12 h-12 text-green-400 animate-spin mb-4" />
                <p className="text-white/60">Converting text to speech...</p>
              </div>
            ) : audioUrl ? (
              <div className="flex flex-col items-center justify-center min-h-[300px] space-y-6">
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />

                {/* Audio Visualizer Placeholder */}
                <div className="w-full h-24 bg-white/5 rounded-lg flex items-center justify-center gap-1 px-4">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 bg-green-400/60 rounded-full transition-all duration-150 ${
                        isPlaying ? 'animate-pulse' : ''
                      }`}
                      style={{
                        height: `${Math.random() * 60 + 20}%`,
                        animationDelay: `${i * 50}ms`,
                      }}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={togglePlayback}
                    className="w-16 h-16 rounded-full border-2 border-green-400 flex items-center justify-center bg-green-500/20 hover:bg-green-500/30 transition-colors"
                  >
                    <span className="text-3xl">{isPlaying ? '⏸️' : '▶️'}</span>
                  </button>
                </div>

                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="border-white/20"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Audio
                </Button>

                <p className="text-sm text-white/40">
                  Voice: {VOICES.find((v) => v.id === voice)?.name} | Speed: {speed[0].toFixed(1)}x
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
                <Volume2 className="w-16 h-16 text-white/20 mb-4" />
                <p className="text-white/60">Your generated audio will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AIToolLayout>
  );
};

export default AITextToSpeech;
