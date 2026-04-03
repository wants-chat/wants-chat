import React, { useState } from 'react';
import { Video, Loader2, Copy, Check, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { aiToolsApi, VideoScriptData } from '@/lib/api/ai-tools-api';
import { toast } from 'sonner';

const AIVideoScript: React.FC = () => {
  const [formData, setFormData] = useState<VideoScriptData>({
    topic: '',
    platform: 'youtube',
    duration: 'medium',
    style: 'educational',
    targetAudience: '',
    keyPoints: '',
  });

  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState<{
    hook: string;
    intro: string;
    mainContent: string[];
    callToAction: string;
    fullScript: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!formData.topic.trim()) {
      toast.error('Please enter a video topic');
      return;
    }

    try {
      setLoading(true);
      const response = await aiToolsApi.generateVideoScript(formData);
      if (response.data) {
        setScript(response.data);
        toast.success('Video script generated!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate script');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!script) return;
    try {
      await navigator.clipboard.writeText(script.fullScript);
      setCopied(true);
      toast.success('Script copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  return (
    <AIToolLayout
      title="AI Video Script"
      description="Generate engaging video scripts for any platform"
      icon={<Video className="w-8 h-8" />}
      iconColor="text-red-400"
      iconBgColor="bg-red-500/20"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardContent className="p-6 space-y-4">
            <div>
              <Label className="text-white">Video Topic *</Label>
              <Input
                placeholder="How to build a successful startup"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className="mt-1 bg-white/10 border-white/20 text-white"
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
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="instagram">Instagram Reels</SelectItem>
                    <SelectItem value="shorts">YouTube Shorts</SelectItem>
                    <SelectItem value="podcast">Podcast</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white">Duration</Label>
                <Select
                  value={formData.duration}
                  onValueChange={(value: any) => setFormData({ ...formData, duration: value })}
                >
                  <SelectTrigger className="mt-1 bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short (30s - 1min)</SelectItem>
                    <SelectItem value="medium">Medium (3-5 min)</SelectItem>
                    <SelectItem value="long">Long (10-15 min)</SelectItem>
                    <SelectItem value="extended">Extended (20+ min)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                  <SelectItem value="educational">Educational</SelectItem>
                  <SelectItem value="entertaining">Entertaining</SelectItem>
                  <SelectItem value="storytelling">Storytelling</SelectItem>
                  <SelectItem value="tutorial">Tutorial</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="vlog">Vlog</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white">Target Audience</Label>
              <Input
                placeholder="Entrepreneurs, tech enthusiasts"
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                className="mt-1 bg-white/10 border-white/20 text-white"
              />
            </div>

            <div>
              <Label className="text-white">Key Points to Cover</Label>
              <Textarea
                placeholder="Main ideas you want to include in the video..."
                value={formData.keyPoints}
                onChange={(e) => setFormData({ ...formData, keyPoints: e.target.value })}
                className="mt-1 min-h-[80px] bg-white/10 border-white/20 text-white"
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading || !formData.topic.trim()}
              className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate Script
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-white text-lg">Generated Script</CardTitle>
              {script && (
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
              <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-red-400 animate-spin" />
              </div>
            ) : script ? (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {/* Hook */}
                <div className="bg-red-500/10 rounded-lg p-4">
                  <h4 className="text-red-400 font-medium text-sm mb-2">Hook</h4>
                  <p className="text-white text-sm">{script.hook}</p>
                </div>

                {/* Intro */}
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white/60 font-medium text-sm mb-2">Introduction</h4>
                  <p className="text-white text-sm">{script.intro}</p>
                </div>

                {/* Main Content */}
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white/60 font-medium text-sm mb-2">Main Content</h4>
                  <div className="space-y-3">
                    {script.mainContent.map((point, idx) => (
                      <div key={idx} className="flex gap-3">
                        <span className="text-red-400 font-bold">{idx + 1}.</span>
                        <p className="text-white text-sm">{point}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Call to Action */}
                <div className="bg-green-500/10 rounded-lg p-4">
                  <h4 className="text-green-400 font-medium text-sm mb-2">Call to Action</h4>
                  <p className="text-white text-sm">{script.callToAction}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <Video className="w-16 h-16 text-white/20 mb-4" />
                <p className="text-white/60">Your video script will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AIToolLayout>
  );
};

export default AIVideoScript;
