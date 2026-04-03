import React, { useState } from 'react';
import { Users, Loader2, Copy, Check, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AIToolLayout from '@/components/ai-tools/AIToolLayout';
import { aiToolsApi, MeetingNotesData } from '@/lib/api/ai-tools-api';
import { toast } from 'sonner';

const AIMeetingNotes: React.FC = () => {
  const [formData, setFormData] = useState<MeetingNotesData>({
    transcript: '',
    meetingType: 'team',
    participants: '',
    duration: '',
    outputFormat: 'structured',
  });

  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState<{
    summary: string;
    keyPoints: string[];
    actionItems: { task: string; owner: string; deadline: string }[];
    decisions: string[];
    nextSteps: string[];
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!formData.transcript.trim()) {
      toast.error('Please enter meeting transcript or notes');
      return;
    }

    try {
      setLoading(true);
      const response = await aiToolsApi.generateMeetingNotes(formData);
      if (response.data) {
        setNotes(response.data);
        toast.success('Meeting notes generated!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate notes');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!notes) return;
    const text = `
MEETING SUMMARY
${notes.summary}

KEY POINTS
${notes.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

ACTION ITEMS
${notes.actionItems.map((a) => `- ${a.task} (Owner: ${a.owner}, Due: ${a.deadline})`).join('\n')}

DECISIONS
${notes.decisions.map((d) => `- ${d}`).join('\n')}

NEXT STEPS
${notes.nextSteps.map((n) => `- ${n}`).join('\n')}
    `.trim();

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Notes copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  return (
    <AIToolLayout
      title="AI Meeting Notes"
      description="Transform meeting transcripts into organized notes"
      icon={<Users className="w-8 h-8" />}
      iconColor="text-teal-400"
      iconBgColor="bg-teal-500/20"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardContent className="p-6 space-y-4">
            <div>
              <Label className="text-white">Meeting Transcript/Notes *</Label>
              <Textarea
                placeholder="Paste your meeting transcript or rough notes here..."
                value={formData.transcript}
                onChange={(e) => setFormData({ ...formData, transcript: e.target.value })}
                className="mt-1 min-h-[150px] bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Meeting Type</Label>
                <Select
                  value={formData.meetingType}
                  onValueChange={(value: any) => setFormData({ ...formData, meetingType: value })}
                >
                  <SelectTrigger className="mt-1 bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="team">Team Meeting</SelectItem>
                    <SelectItem value="standup">Daily Standup</SelectItem>
                    <SelectItem value="client">Client Meeting</SelectItem>
                    <SelectItem value="planning">Planning Session</SelectItem>
                    <SelectItem value="review">Review/Retrospective</SelectItem>
                    <SelectItem value="one-on-one">1-on-1</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white">Output Format</Label>
                <Select
                  value={formData.outputFormat}
                  onValueChange={(value: any) => setFormData({ ...formData, outputFormat: value })}
                >
                  <SelectTrigger className="mt-1 bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="structured">Structured</SelectItem>
                    <SelectItem value="bullet">Bullet Points</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                    <SelectItem value="executive">Executive Summary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Participants</Label>
                <Input
                  placeholder="John, Sarah, Mike"
                  value={formData.participants}
                  onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
                  className="mt-1 bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Duration</Label>
                <Input
                  placeholder="30 minutes"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="mt-1 bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading || !formData.transcript.trim()}
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate Notes
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-white text-lg">Meeting Notes</CardTitle>
              {notes && (
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
                <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
              </div>
            ) : notes ? (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {/* Summary */}
                <div className="bg-teal-500/10 rounded-lg p-4">
                  <h4 className="text-teal-400 font-medium text-sm mb-2">Summary</h4>
                  <p className="text-white text-sm">{notes.summary}</p>
                </div>

                {/* Key Points */}
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white/60 font-medium text-sm mb-2">Key Points</h4>
                  <ul className="space-y-2">
                    {notes.keyPoints.map((point, idx) => (
                      <li key={idx} className="text-white text-sm flex gap-2">
                        <span className="text-teal-400">•</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Items */}
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white/60 font-medium text-sm mb-2">Action Items</h4>
                  <div className="space-y-2">
                    {notes.actionItems.map((item, idx) => (
                      <div key={idx} className="bg-white/5 rounded p-2">
                        <p className="text-white text-sm">{item.task}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                            {item.owner}
                          </Badge>
                          <Badge className="bg-orange-500/20 text-orange-400 text-xs">
                            {item.deadline}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Decisions */}
                {notes.decisions.length > 0 && (
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-white/60 font-medium text-sm mb-2">Decisions Made</h4>
                    <ul className="space-y-1">
                      {notes.decisions.map((decision, idx) => (
                        <li key={idx} className="text-white text-sm flex gap-2">
                          <span className="text-green-400">✓</span>
                          {decision}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Next Steps */}
                {notes.nextSteps.length > 0 && (
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-white/60 font-medium text-sm mb-2">Next Steps</h4>
                    <ul className="space-y-1">
                      {notes.nextSteps.map((step, idx) => (
                        <li key={idx} className="text-white text-sm flex gap-2">
                          <span className="text-teal-400">→</span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <Users className="w-16 h-16 text-white/20 mb-4" />
                <p className="text-white/60">Your meeting notes will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AIToolLayout>
  );
};

export default AIMeetingNotes;
