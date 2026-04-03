import React, { useState, useRef } from 'react';
import { Mic, Loader2, Copy, Check, Upload, StopCircle, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AIToolLayout from '@/components/ai-tools/AIToolLayout';
import { aiToolsApi } from '@/lib/api/ai-tools-api';
import { toast } from 'sonner';

const LANGUAGES = [
  { code: 'auto', name: 'Auto Detect' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
];

const AISpeechToText: React.FC = () => {
  const [language, setLanguage] = useState('auto');
  const [loading, setLoading] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [copied, setCopied] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(blob);
        setAudioFile(null);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success('Recording started');
    } catch (error) {
      toast.error('Failed to access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success('Recording stopped');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('audio/')) {
        toast.error('Please upload an audio file');
        return;
      }
      setAudioFile(file);
      setRecordedBlob(null);
      toast.success('Audio file selected');
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleTranscribe = async () => {
    const audioSource = audioFile || recordedBlob;
    if (!audioSource) {
      toast.error('Please record or upload audio first');
      return;
    }

    try {
      setLoading(true);

      // Convert blob/file to base64
      const audioBase64 = await blobToBase64(audioSource);
      const mimeType = audioSource.type || 'audio/webm';

      const response = await aiToolsApi.speechToText({
        audioBase64,
        mimeType,
        language: language === 'auto' ? undefined : language,
      });

      // Handle response - text may be directly on response or nested
      const text = response.text || response.data?.text || response.data?.transcription || response.transcription;
      if (text) {
        setTranscription(text);
        toast.success('Transcription complete!');
      } else {
        toast.error('No transcription received');
      }
    } catch (error: any) {
      console.error('STT failed:', error);
      toast.error(error.message || 'Failed to transcribe audio');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!transcription) return;
    try {
      await navigator.clipboard.writeText(transcription);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const clearAudio = () => {
    setAudioFile(null);
    setRecordedBlob(null);
    setTranscription('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <AIToolLayout
      title="AI Speech-to-Text"
      description="Convert audio recordings to text"
      icon={<Mic className="w-8 h-8" />}
      iconColor="text-orange-400"
      iconBgColor="bg-orange-500/20"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardContent className="p-6 space-y-6">
            {/* Recording Section */}
            <div className="text-center space-y-4">
              <Label className="text-white block">Record Audio</Label>
              <div className="flex justify-center">
                <Button
                  size="lg"
                  variant={isRecording ? 'destructive' : 'outline'}
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-24 h-24 rounded-full ${
                    isRecording
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                      : 'border-orange-400/50 hover:bg-orange-500/20'
                  }`}
                >
                  {isRecording ? (
                    <StopCircle className="w-10 h-10" />
                  ) : (
                    <Mic className="w-10 h-10 text-orange-400" />
                  )}
                </Button>
              </div>
              <p className="text-sm text-white/40">
                {isRecording ? 'Recording... Click to stop' : 'Click to start recording'}
              </p>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-white/20" />
              <span className="text-white/40 text-sm">OR</span>
              <div className="flex-1 h-px bg-white/20" />
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label className="text-white">Upload Audio File</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-white/20"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose Audio File
              </Button>
              {audioFile && (
                <p className="text-sm text-white/60 truncate">
                  Selected: {audioFile.name}
                </p>
              )}
            </div>

            {/* Audio Status */}
            {(audioFile || recordedBlob) && (
              <div className="bg-white/5 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="text-white text-sm">
                    {audioFile ? 'File ready' : 'Recording ready'}
                  </span>
                </div>
                <Button size="sm" variant="ghost" onClick={clearAudio}>
                  Clear
                </Button>
              </div>
            )}

            {/* Language Selection */}
            <div>
              <Label className="text-white">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="mt-1 bg-white/10 border-white/20 text-white">
                  <span>{LANGUAGES.find((l) => l.code === language)?.name || 'Select language'}</span>
                </SelectTrigger>
                <SelectContent position="popper" side="top" sideOffset={5} className="max-h-[200px]">
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleTranscribe}
              disabled={loading || (!audioFile && !recordedBlob)}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Transcribing...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Transcribe Audio
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-white text-lg">Transcription</CardTitle>
              {transcription && (
                <Button size="sm" variant="ghost" onClick={handleCopy}>
                  {copied ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center min-h-[300px]">
                <Loader2 className="w-12 h-12 text-orange-400 animate-spin mb-4" />
                <p className="text-white/60">Converting speech to text...</p>
              </div>
            ) : transcription ? (
              <div className="bg-white/5 rounded-lg p-4 min-h-[300px] max-h-[400px] overflow-y-auto">
                <p className="text-white whitespace-pre-wrap">{transcription}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
                <Mic className="w-16 h-16 text-white/20 mb-4" />
                <p className="text-white/60">Your transcription will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AIToolLayout>
  );
};

export default AISpeechToText;
