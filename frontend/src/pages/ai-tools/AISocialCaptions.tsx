import React, { useState } from 'react';
import { MessageSquare, Loader2, Copy, Check, Wand2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AIToolLayout from '@/components/ai-tools/AIToolLayout';
import { aiToolsApi, SocialCaptionData } from '@/lib/api/ai-tools-api';
import { toast } from 'sonner';

const AISocialCaptions: React.FC = () => {
  const [formData, setFormData] = useState<SocialCaptionData>({
    topic: '',
    platform: 'instagram',
    tone: 'casual',
    length: 'medium',
    includeEmojis: true,
    includeHashtags: true,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ caption: string; hashtags: string[] } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!formData.topic) {
      toast.error('Please enter a topic');
      return;
    }

    try {
      setLoading(true);
      const response = await aiToolsApi.generateSocialCaption(formData);
      if (response.data) {
        setResult(response.data);
        toast.success('Caption generated!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate caption');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    const fullText = result.caption + '\n\n' + result.hashtags.join(' ');
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      toast.success('Copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  return (
    <AIToolLayout
      title="AI Social Captions"
      description="Create engaging social media captions"
      icon={<MessageSquare className="w-8 h-8" />}
      iconColor="text-pink-400"
      iconBgColor="bg-pink-500/20"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardContent className="p-6 space-y-4">
            <div>
              <Label className="text-white">Topic/Content *</Label>
              <Textarea
                placeholder="Describe your post content..."
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Platform</Label>
                <Select
                  value={formData.platform}
                  onValueChange={(value: any) => setFormData({ ...formData, platform: value })}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="twitter">Twitter/X</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white">Tone</Label>
                <Select
                  value={formData.tone}
                  onValueChange={(value: any) => setFormData({ ...formData, tone: value })}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="humorous">Humorous</SelectItem>
                    <SelectItem value="inspirational">Inspirational</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-white">Length</Label>
              <Select
                value={formData.length}
                onValueChange={(value: any) => setFormData({ ...formData, length: value })}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="long">Long</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-white">Include Emojis</Label>
              <Switch
                checked={formData.includeEmojis}
                onCheckedChange={(checked) => setFormData({ ...formData, includeEmojis: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-white">Include Hashtags</Label>
              <Switch
                checked={formData.includeHashtags}
                onCheckedChange={(checked) => setFormData({ ...formData, includeHashtags: checked })}
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
              {loading ? 'Generating...' : 'Generate Caption'}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-white text-lg">Generated Caption</CardTitle>
              {result && (
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={handleGenerate}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleCopy}>
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
              </div>
            ) : result ? (
              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-white whitespace-pre-wrap">{result.caption}</p>
                </div>
                {result.hashtags.length > 0 && (
                  <div>
                    <p className="text-white/60 text-sm mb-2">Hashtags:</p>
                    <div className="flex flex-wrap gap-2">
                      {result.hashtags.map((tag, idx) => (
                        <Badge key={idx} className="bg-pink-500/20 text-pink-400">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[300px]">
                <MessageSquare className="w-16 h-16 text-white/20 mb-4" />
                <p className="text-white/60">Your caption will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AIToolLayout>
  );
};

export default AISocialCaptions;
