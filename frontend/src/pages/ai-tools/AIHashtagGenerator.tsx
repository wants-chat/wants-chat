import React, { useState } from 'react';
import { Hash, Loader2, Copy, Check, Wand2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AIToolLayout from '@/components/ai-tools/AIToolLayout';
import { aiToolsApi, HashtagGeneratorData } from '@/lib/api/ai-tools-api';
import { toast } from 'sonner';

const AIHashtagGenerator: React.FC = () => {
  const [formData, setFormData] = useState<HashtagGeneratorData>({
    content: '',
    platform: 'instagram',
    count: 20,
    style: 'mixed',
  });

  const [loading, setLoading] = useState(false);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!formData.content.trim()) {
      toast.error('Please enter content description');
      return;
    }

    try {
      setLoading(true);
      const response = await aiToolsApi.generateHashtags(formData);
      if (response.data?.hashtags) {
        setHashtags(response.data.hashtags);
        toast.success('Hashtags generated!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate hashtags');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAll = async () => {
    if (hashtags.length === 0) return;
    try {
      await navigator.clipboard.writeText(hashtags.join(' '));
      setCopied(true);
      toast.success('All hashtags copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const handleCopyOne = async (tag: string) => {
    try {
      await navigator.clipboard.writeText(tag);
      toast.success(`Copied: ${tag}`);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  return (
    <AIToolLayout
      title="AI Hashtag Generator"
      description="Generate trending hashtags for your content"
      icon={<Hash className="w-8 h-8" />}
      iconColor="text-violet-400"
      iconBgColor="bg-violet-500/20"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardContent className="p-6 space-y-4">
            <div>
              <Label className="text-white">Content Description *</Label>
              <Textarea
                placeholder="Describe your post or content topic..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="mt-1 min-h-[100px] bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Platform</Label>
                <Select
                  value={formData.platform}
                  onValueChange={(value: any) => setFormData({ ...formData, platform: value })}
                >
                  <SelectTrigger className="mt-1 bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="twitter">Twitter/X</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white">Style</Label>
                <Select
                  value={formData.style}
                  onValueChange={(value: any) => setFormData({ ...formData, style: value })}
                >
                  <SelectTrigger className="mt-1 bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trending">Trending</SelectItem>
                    <SelectItem value="niche">Niche-Specific</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                    <SelectItem value="branded">Branded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label className="text-white">Number of Hashtags</Label>
                <span className="text-sm text-white/60">{formData.count}</span>
              </div>
              <Slider
                value={[formData.count]}
                onValueChange={([value]) => setFormData({ ...formData, count: value })}
                min={5}
                max={30}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-white/40 mt-1">
                <span>5</span>
                <span>30</span>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading || !formData.content.trim()}
              className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate Hashtags
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-white text-lg">Generated Hashtags</CardTitle>
              {hashtags.length > 0 && (
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={handleGenerate}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleCopyAll}>
                    {copied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
              </div>
            ) : hashtags.length > 0 ? (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {hashtags.map((tag, idx) => (
                    <Badge
                      key={idx}
                      className="bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 cursor-pointer transition-colors py-1.5 px-3"
                      onClick={() => handleCopyOne(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-white/40 mb-2">Copy all ({hashtags.length} hashtags):</p>
                  <p className="text-sm text-white/80 break-words">{hashtags.join(' ')}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
                <Hash className="w-16 h-16 text-white/20 mb-4" />
                <p className="text-white/60">Your generated hashtags will appear here</p>
                <p className="text-sm text-white/40 mt-2">Click any hashtag to copy it</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AIToolLayout>
  );
};

export default AIHashtagGenerator;
