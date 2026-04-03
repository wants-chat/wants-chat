import React, { useState } from 'react';
import { FileText, Loader2, Copy, Check, Wand2, Download } from 'lucide-react';
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
import { aiToolsApi, CoverLetterData } from '@/lib/api/ai-tools-api';
import { toast } from 'sonner';

const AICoverLetter: React.FC = () => {
  const [formData, setFormData] = useState<CoverLetterData>({
    jobTitle: '',
    companyName: '',
    jobDescription: '',
    yourName: '',
    yourExperience: '',
    keySkills: '',
    tone: 'professional',
  });

  const [loading, setLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!formData.jobTitle || !formData.companyName || !formData.yourName) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      setLoading(true);
      // Map frontend form fields to backend expected fields
      const apiData = {
        applicantName: formData.yourName,
        jobTitle: formData.jobTitle,
        companyName: formData.companyName,
        experience: formData.yourExperience,
        skills: formData.keySkills,
        whyInterested: formData.jobDescription,
        tone: formData.tone,
      };
      const response = await aiToolsApi.generateCoverLetter(apiData as any);
      const coverLetterText = response.coverLetter || response.data?.coverLetter;
      if (coverLetterText) {
        setCoverLetter(coverLetterText);
        toast.success('Cover letter generated!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate cover letter');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!coverLetter) return;
    try {
      await navigator.clipboard.writeText(coverLetter);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const handleDownloadPdf = () => {
    if (!coverLetter) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Cover Letter - ${formData.yourName}</title>
        <style>
          body { font-family: Georgia, serif; max-width: 700px; margin: 0 auto; padding: 50px; color: #333; line-height: 1.8; }
          .date { text-align: right; color: #666; margin-bottom: 30px; }
          .content { white-space: pre-wrap; text-align: justify; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="date">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        <div class="content">${coverLetter}</div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  return (
    <AIToolLayout
      title="AI Cover Letter"
      description="Generate personalized cover letters for job applications"
      icon={<FileText className="w-8 h-8" />}
      iconColor="text-blue-400"
      iconBgColor="bg-blue-500/20"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Your Name *</Label>
                <Input
                  placeholder="John Doe"
                  value={formData.yourName}
                  onChange={(e) => setFormData({ ...formData, yourName: e.target.value })}
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
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="confident">Confident</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Job Title *</Label>
                <Input
                  placeholder="Software Engineer"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Company Name *</Label>
                <Input
                  placeholder="Tech Corp"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>

            <div>
              <Label className="text-white">Job Description</Label>
              <Textarea
                placeholder="Paste the job description here..."
                value={formData.jobDescription}
                onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                className="min-h-[80px] bg-white/10 border-white/20 text-white"
              />
            </div>

            <div>
              <Label className="text-white">Your Experience</Label>
              <Textarea
                placeholder="Briefly describe your relevant experience..."
                value={formData.yourExperience}
                onChange={(e) => setFormData({ ...formData, yourExperience: e.target.value })}
                className="min-h-[80px] bg-white/10 border-white/20 text-white"
              />
            </div>

            <div>
              <Label className="text-white">Key Skills (comma-separated)</Label>
              <Input
                placeholder="React, TypeScript, Node.js"
                value={formData.keySkills}
                onChange={(e) => setFormData({ ...formData, keySkills: e.target.value })}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate Cover Letter
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-white text-lg">Generated Cover Letter</CardTitle>
              {coverLetter && (
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={handleCopy} title="Copy">
                    {copied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleDownloadPdf} title="Download PDF">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              </div>
            ) : coverLetter ? (
              <div className="bg-white/5 rounded-lg p-4 min-h-[400px] max-h-[600px] overflow-y-auto">
                <pre className="text-white text-sm whitespace-pre-wrap font-sans">
                  {coverLetter}
                </pre>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <FileText className="w-16 h-16 text-white/20 mb-4" />
                <p className="text-white/60">Your cover letter will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AIToolLayout>
  );
};

export default AICoverLetter;
