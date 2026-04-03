import React, { useState } from 'react';
import { GraduationCap, Loader2, Copy, Check, Wand2 } from 'lucide-react';
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
import { aiToolsApi, StudyNotesData } from '@/lib/api/ai-tools-api';
import { toast } from 'sonner';

const AIStudyNotes: React.FC = () => {
  const [formData, setFormData] = useState<StudyNotesData>({
    content: '',
    subject: '',
    format: 'cornell',
    difficulty: 'intermediate',
    includeQuiz: true,
    includeFlashcards: true,
  });

  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState<{
    summary: string;
    keyTerms: { term: string; definition: string }[];
    mainPoints: string[];
    quiz: { question: string; answer: string }[];
    flashcards: { front: string; back: string }[];
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!formData.content.trim()) {
      toast.error('Please enter content to study');
      return;
    }

    try {
      setLoading(true);
      const response = await aiToolsApi.generateStudyNotes(formData);
      if (response.data) {
        setNotes(response.data);
        toast.success('Study notes generated!');
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
SUMMARY
${notes.summary}

KEY TERMS
${notes.keyTerms.map((t) => `${t.term}: ${t.definition}`).join('\n')}

MAIN POINTS
${notes.mainPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

QUIZ
${notes.quiz.map((q, i) => `Q${i + 1}: ${q.question}\nA: ${q.answer}`).join('\n\n')}
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
      title="AI Study Notes"
      description="Transform any content into organized study materials"
      icon={<GraduationCap className="w-8 h-8" />}
      iconColor="text-amber-400"
      iconBgColor="bg-amber-500/20"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardContent className="p-6 space-y-4">
            <div>
              <Label className="text-white">Content to Study *</Label>
              <Textarea
                placeholder="Paste text, lecture notes, or any content you want to study..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="mt-1 min-h-[150px] bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Subject</Label>
                <Input
                  placeholder="Biology, History, etc."
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="mt-1 bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Difficulty</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value: any) => setFormData({ ...formData, difficulty: value })}
                >
                  <SelectTrigger className="mt-1 bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-white">Note Format</Label>
              <Select
                value={formData.format}
                onValueChange={(value: any) => setFormData({ ...formData, format: value })}
              >
                <SelectTrigger className="mt-1 bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cornell">Cornell Method</SelectItem>
                  <SelectItem value="outline">Outline</SelectItem>
                  <SelectItem value="mindmap">Mind Map Style</SelectItem>
                  <SelectItem value="summary">Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading || !formData.content.trim()}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate Study Notes
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-white text-lg">Study Notes</CardTitle>
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
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
              </div>
            ) : notes ? (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {/* Summary */}
                <div className="bg-amber-500/10 rounded-lg p-4">
                  <h4 className="text-amber-400 font-medium text-sm mb-2">Summary</h4>
                  <p className="text-white text-sm">{notes.summary}</p>
                </div>

                {/* Key Terms */}
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white/60 font-medium text-sm mb-2">Key Terms</h4>
                  <div className="space-y-2">
                    {notes.keyTerms.map((item, idx) => (
                      <div key={idx} className="bg-white/5 rounded p-2">
                        <span className="text-amber-400 font-medium">{item.term}</span>
                        <p className="text-white/80 text-sm mt-1">{item.definition}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Main Points */}
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white/60 font-medium text-sm mb-2">Main Points</h4>
                  <ul className="space-y-2">
                    {notes.mainPoints.map((point, idx) => (
                      <li key={idx} className="text-white text-sm flex gap-2">
                        <span className="text-amber-400 font-bold">{idx + 1}.</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Quiz */}
                {notes.quiz.length > 0 && (
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-white/60 font-medium text-sm mb-2">Self-Quiz</h4>
                    <div className="space-y-3">
                      {notes.quiz.map((q, idx) => (
                        <div key={idx} className="bg-white/5 rounded p-3">
                          <p className="text-white text-sm font-medium">Q: {q.question}</p>
                          <p className="text-white/60 text-sm mt-2">A: {q.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Flashcards Preview */}
                {notes.flashcards.length > 0 && (
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-white/60 font-medium text-sm mb-2">
                      Flashcards ({notes.flashcards.length})
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {notes.flashcards.slice(0, 4).map((card, idx) => (
                        <div
                          key={idx}
                          className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded p-2 text-center"
                        >
                          <p className="text-white text-xs truncate">{card.front}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <GraduationCap className="w-16 h-16 text-white/20 mb-4" />
                <p className="text-white/60">Your study notes will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AIToolLayout>
  );
};

export default AIStudyNotes;
