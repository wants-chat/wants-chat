import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Languages, Loader2, Copy, ArrowLeftRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
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
  { code: 'bn', name: 'Bengali' },
  { code: 'tr', name: 'Turkish' },
  { code: 'nl', name: 'Dutch' },
  { code: 'pl', name: 'Polish' },
  { code: 'sv', name: 'Swedish' },
  { code: 'th', name: 'Thai' },
  { code: 'vi', name: 'Vietnamese' },
];

const AITranslator: React.FC = () => {
  const [sourceText, setSourceText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('auto');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [translatedText, setTranslatedText] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      toast.error('Please enter text to translate');
      return;
    }

    try {
      setLoading(true);
      const response = await aiToolsApi.translate({
        text: sourceText.trim(),
        sourceLanguage,
        targetLanguage,
      });

      if (response.data?.translatedText) {
        setTranslatedText(response.data.translatedText);
        if (response.data.detectedLanguage) {
          setDetectedLanguage(response.data.detectedLanguage);
        }
        toast.success('Translation complete!');
      }
    } catch (error: any) {
      console.error('Translation failed:', error);
      toast.error(error.message || 'Translation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSwapLanguages = () => {
    if (sourceLanguage === 'auto') return;
    const temp = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(temp);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const handleCopy = async () => {
    if (!translatedText) return;
    try {
      await navigator.clipboard.writeText(translatedText);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  return (
    <AIToolLayout
      title="AI Translator"
      description="Translate text between 20+ languages instantly"
      icon={<Languages className="w-8 h-8" />}
      iconColor="text-cyan-400"
      iconBgColor="bg-cyan-500/20"
    >
      <Card className="bg-white/10 backdrop-blur-xl border-white/20">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 mb-6">
            <div>
              <Label className="text-white">From</Label>
              <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                <SelectTrigger className="mt-1 bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSwapLanguages}
                disabled={sourceLanguage === 'auto'}
                className="mb-0.5"
              >
                <ArrowLeftRight className="w-4 h-4 text-white/60" />
              </Button>
            </div>

            <div>
              <Label className="text-white">To</Label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger className="mt-1 bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.filter((l) => l.code !== 'auto').map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <Label className="text-white">Source Text</Label>
                <span className="text-xs text-white/40">
                  {sourceText.length} characters
                </span>
              </div>
              <Textarea
                placeholder="Enter text to translate..."
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                className="min-h-[200px] bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <Label className="text-white">Translation</Label>
                {detectedLanguage && sourceLanguage === 'auto' && (
                  <span className="text-xs text-cyan-400">
                    Detected: {LANGUAGES.find((l) => l.code === detectedLanguage)?.name || detectedLanguage}
                  </span>
                )}
              </div>
              <div className="relative">
                <Textarea
                  placeholder="Translation will appear here..."
                  value={translatedText}
                  readOnly
                  className="min-h-[200px] bg-white/5 border-white/20 text-white placeholder:text-white/40"
                />
                {translatedText && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleCopy}
                    className="absolute top-2 right-2"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-white/60" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>

          <Button
            onClick={handleTranslate}
            disabled={loading || !sourceText.trim()}
            className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Translating...
              </>
            ) : (
              <>
                <Languages className="w-4 h-4 mr-2" />
                Translate
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </AIToolLayout>
  );
};

export default AITranslator;
