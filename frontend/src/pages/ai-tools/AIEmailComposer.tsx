import React, { useState } from 'react';
import { Mail, Loader2, Copy, Check, Wand2 } from 'lucide-react';
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
import { aiToolsApi, EmailComposerData } from '@/lib/api/ai-tools-api';
import { toast } from 'sonner';

const AIEmailComposer: React.FC = () => {
  const [formData, setFormData] = useState<EmailComposerData>({
    purpose: 'professional',
    recipient: '',
    subject: '',
    keyPoints: '',
    senderName: '',
    tone: 'formal',
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ subject: string; body: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!formData.recipient || !formData.keyPoints) {
      toast.error('Recipient and key points are required');
      return;
    }

    try {
      setLoading(true);
      const response = await aiToolsApi.composeEmail(formData);
      if (response.data) {
        setResult(response.data);
        toast.success('Email composed!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to compose email');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    const fullEmail = `Subject: ${result.subject}\n\n${result.body}`;
    try {
      await navigator.clipboard.writeText(fullEmail);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  return (
    <AIToolLayout
      title="AI Email Composer"
      description="Write professional emails instantly"
      icon={<Mail className="w-8 h-8" />}
      iconColor="text-cyan-400"
      iconBgColor="bg-cyan-500/20"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardContent className="p-6 space-y-4">
            <div>
              <Label className="text-white">Email Purpose *</Label>
              <Select
                value={formData.purpose}
                onValueChange={(value: any) => setFormData({ ...formData, purpose: value })}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="follow-up">Follow-up</SelectItem>
                  <SelectItem value="apology">Apology</SelectItem>
                  <SelectItem value="request">Request</SelectItem>
                  <SelectItem value="thank-you">Thank You</SelectItem>
                  <SelectItem value="announcement">Announcement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white">Recipient *</Label>
              <Input
                placeholder="John Smith, Marketing Manager"
                value={formData.recipient}
                onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            <div>
              <Label className="text-white">Key Points * (one per line)</Label>
              <Textarea
                placeholder="Meeting rescheduled to Friday&#10;New time: 2 PM&#10;Location: Conference Room B"
                value={formData.keyPoints}
                onChange={(e) => setFormData({ ...formData, keyPoints: e.target.value })}
                className="min-h-[100px] bg-white/10 border-white/20 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Your Name</Label>
                <Input
                  placeholder="Jane Doe"
                  value={formData.senderName}
                  onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                />
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
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
              {loading ? 'Composing...' : 'Compose Email'}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-white text-lg">Generated Email</CardTitle>
              {result && (
                <Button size="sm" variant="ghost" onClick={handleCopy}>
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              </div>
            ) : result ? (
              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-white/60 text-sm">Subject:</p>
                  <p className="text-white font-medium">{result.subject}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 max-h-[400px] overflow-y-auto">
                  <pre className="text-white text-sm whitespace-pre-wrap font-sans">{result.body}</pre>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[300px]">
                <Mail className="w-16 h-16 text-white/20 mb-4" />
                <p className="text-white/60">Your composed email will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AIToolLayout>
  );
};

export default AIEmailComposer;
