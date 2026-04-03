import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Image, Loader2, Download, Copy, RefreshCw, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { aiToolsApi, ImageGeneratorData } from '@/lib/api/ai-tools-api';
import { toast } from 'sonner';

const IMAGE_SIZES = [
  { value: 'square', label: 'Square (1:1)', width: 1024, height: 1024 },
  { value: 'portrait', label: 'Portrait (3:4)', width: 768, height: 1024 },
  { value: 'landscape', label: 'Landscape (4:3)', width: 1024, height: 768 },
  { value: 'wide', label: 'Wide (16:9)', width: 1024, height: 576 },
  { value: 'tall', label: 'Tall (9:16)', width: 576, height: 1024 },
];

const AIImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [size, setSize] = useState<string>('square');
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    try {
      setLoading(true);
      const selectedSize = IMAGE_SIZES.find((s) => s.value === size);
      const data: ImageGeneratorData = {
        prompt: prompt.trim(),
        negativePrompt: negativePrompt.trim() || undefined,
        size: size as any,
        width: selectedSize?.width,
        height: selectedSize?.height,
      };

      const response = await aiToolsApi.generateImage(data);
      if (response.data?.imageUrl) {
        setGeneratedImage(response.data.imageUrl);
        toast.success('Image generated successfully!');
      }
    } catch (error: any) {
      console.error('Failed to generate image:', error);
      toast.error(error.message || 'Failed to generate image');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedImage) return;
    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Image downloaded');
    } catch (error) {
      toast.error('Failed to download image');
    }
  };

  const handleCopyUrl = async () => {
    if (!generatedImage) return;
    try {
      await navigator.clipboard.writeText(generatedImage);
      toast.success('URL copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy URL');
    }
  };

  return (
    <AIToolLayout
      title="AI Image Generator"
      description="Create stunning images from text prompts"
      icon={<Image className="w-8 h-8" />}
      iconColor="text-purple-400"
      iconBgColor="bg-purple-500/20"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardContent className="p-6 space-y-4">
            <div>
              <Label className="text-white">Prompt *</Label>
              <Textarea
                placeholder="A majestic mountain landscape at sunset with golden clouds..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="mt-1 min-h-[100px] bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>

            <div>
              <Label className="text-white">Negative Prompt (Optional)</Label>
              <Textarea
                placeholder="Elements to exclude: blur, low quality, watermark..."
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>

            <div>
              <Label className="text-white">Image Size</Label>
              <Select value={size} onValueChange={setSize}>
                <SelectTrigger className="mt-1 bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {IMAGE_SIZES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate Image
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
                <Loader2 className="w-12 h-12 text-purple-400 animate-spin mb-4" />
                <p className="text-white/60">Creating your masterpiece...</p>
              </div>
            ) : generatedImage ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="relative rounded-lg overflow-hidden bg-black/20">
                  <img
                    src={generatedImage}
                    alt="Generated"
                    className="w-full h-auto"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    className="flex-1 border-white/20"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    onClick={handleCopyUrl}
                    variant="outline"
                    className="flex-1 border-white/20"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy URL
                  </Button>
                  <Button
                    onClick={handleGenerate}
                    variant="outline"
                    className="border-white/20"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
                <Image className="w-16 h-16 text-white/20 mb-4" />
                <p className="text-white/60">Your generated image will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AIToolLayout>
  );
};

export default AIImageGenerator;
