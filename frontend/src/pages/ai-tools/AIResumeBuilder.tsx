import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Loader2, Copy, Plus, Trash2, Check, Wand2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AIToolLayout from '@/components/ai-tools/AIToolLayout';
import { aiToolsApi, ResumeBuilderData } from '@/lib/api/ai-tools-api';
import { toast } from 'sonner';

const AIResumeBuilder: React.FC = () => {
  const [formData, setFormData] = useState<ResumeBuilderData>({
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      website: '',
    },
    professionalSummary: '',
    generateSummary: true,
    experience: [{ title: '', company: '', startDate: '', endDate: '', description: '' }],
    education: [{ degree: '', institution: '', year: '' }],
    skills: '',
    targetJob: '',
    resumeStyle: 'professional',
  });

  const [loading, setLoading] = useState(false);
  const [generatedResume, setGeneratedResume] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!formData.personalInfo.name || !formData.personalInfo.email) {
      toast.error('Name and email are required');
      return;
    }

    try {
      setLoading(true);
      const response = await aiToolsApi.generateResume(formData);
      const resumeText = response.resume || response.data?.resume;
      if (resumeText) {
        setGeneratedResume(resumeText);
        toast.success('Resume generated!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate resume');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedResume);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const handleDownloadPdf = () => {
    if (!generatedResume) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Resume - ${formData.personalInfo.name}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #333; line-height: 1.6; }
          h1 { color: #1a365d; border-bottom: 2px solid #1a365d; padding-bottom: 10px; margin-bottom: 5px; }
          h2 { color: #2c5282; margin-top: 25px; font-size: 1.1em; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
          .contact-info { color: #666; margin-bottom: 20px; font-size: 0.9em; }
          .content { white-space: pre-wrap; }
          ul { padding-left: 20px; }
          li { margin-bottom: 5px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="content">${generatedResume}</div>
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

  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [
        ...formData.experience,
        { title: '', company: '', startDate: '', endDate: '', description: '' },
      ],
    });
  };

  const removeExperience = (index: number) => {
    if (formData.experience.length === 1) return;
    setFormData({
      ...formData,
      experience: formData.experience.filter((_, i) => i !== index),
    });
  };

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [...formData.education, { degree: '', institution: '', year: '' }],
    });
  };

  const removeEducation = (index: number) => {
    if (formData.education.length === 1) return;
    setFormData({
      ...formData,
      education: formData.education.filter((_, i) => i !== index),
    });
  };

  return (
    <AIToolLayout
      title="AI Resume Builder"
      description="Create professional, ATS-optimized resumes"
      icon={<FileText className="w-8 h-8" />}
      iconColor="text-indigo-400"
      iconBgColor="bg-indigo-500/20"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <div className="space-y-4">
          {/* Personal Info */}
          <Card className="bg-white/10 backdrop-blur-xl border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-lg">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-white text-sm">Name *</Label>
                  <Input
                    value={formData.personalInfo.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        personalInfo: { ...formData.personalInfo, name: e.target.value },
                      })
                    }
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white text-sm">Email *</Label>
                  <Input
                    type="email"
                    value={formData.personalInfo.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        personalInfo: { ...formData.personalInfo, email: e.target.value },
                      })
                    }
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white text-sm">Phone</Label>
                  <Input
                    value={formData.personalInfo.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        personalInfo: { ...formData.personalInfo, phone: e.target.value },
                      })
                    }
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white text-sm">Location</Label>
                  <Input
                    value={formData.personalInfo.location}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        personalInfo: { ...formData.personalInfo, location: e.target.value },
                      })
                    }
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Experience */}
          <Card className="bg-white/10 backdrop-blur-xl border-white/20">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-white text-lg">Work Experience</CardTitle>
                <Button size="sm" variant="ghost" onClick={addExperience}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.experience.map((exp, idx) => (
                <div key={idx} className="space-y-2 p-3 bg-white/5 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-white/60 text-sm">Experience {idx + 1}</span>
                    {formData.experience.length > 1 && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => removeExperience(idx)}
                      >
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Job Title"
                      value={exp.title}
                      onChange={(e) => {
                        const newExp = [...formData.experience];
                        newExp[idx].title = e.target.value;
                        setFormData({ ...formData, experience: newExp });
                      }}
                      className="bg-white/10 border-white/20 text-white text-sm"
                    />
                    <Input
                      placeholder="Company"
                      value={exp.company}
                      onChange={(e) => {
                        const newExp = [...formData.experience];
                        newExp[idx].company = e.target.value;
                        setFormData({ ...formData, experience: newExp });
                      }}
                      className="bg-white/10 border-white/20 text-white text-sm"
                    />
                  </div>
                  <Textarea
                    placeholder="Description of your role and achievements..."
                    value={exp.description}
                    onChange={(e) => {
                      const newExp = [...formData.experience];
                      newExp[idx].description = e.target.value;
                      setFormData({ ...formData, experience: newExp });
                    }}
                    className="bg-white/10 border-white/20 text-white text-sm"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Skills & Target */}
          <Card className="bg-white/10 backdrop-blur-xl border-white/20">
            <CardContent className="space-y-3 pt-4">
              <div>
                <Label className="text-white text-sm">Skills (comma-separated)</Label>
                <Input
                  placeholder="React, TypeScript, Node.js, Python..."
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <Label className="text-white text-sm">Target Job</Label>
                <Input
                  placeholder="Senior Software Engineer"
                  value={formData.targetJob}
                  onChange={(e) => setFormData({ ...formData, targetJob: e.target.value })}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <Label className="text-white text-sm">Resume Style</Label>
                <Select
                  value={formData.resumeStyle}
                  onValueChange={(value: any) => setFormData({ ...formData, resumeStyle: value })}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="modern">Modern</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Resume
              </>
            )}
          </Button>
        </div>

        {/* Output Section */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-white text-lg">Generated Resume</CardTitle>
              {generatedResume && (
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
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              </div>
            ) : generatedResume ? (
              <div className="bg-white/5 rounded-lg p-4 min-h-[400px] max-h-[600px] overflow-y-auto">
                <pre className="text-white text-sm whitespace-pre-wrap font-sans">
                  {generatedResume}
                </pre>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <FileText className="w-16 h-16 text-white/20 mb-4" />
                <p className="text-white/60">Your generated resume will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AIToolLayout>
  );
};

export default AIResumeBuilder;
