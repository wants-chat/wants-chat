import React, { useState, useRef } from 'react';
import { FileSearch, Loader2, Copy, Check, Wand2, Upload, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { aiToolsApi, ContractAnalyzerData } from '@/lib/api/ai-tools-api';
import { toast } from 'sonner';

const AIContractAnalyzer: React.FC = () => {
  const [formData, setFormData] = useState<ContractAnalyzerData>({
    contractText: '',
    contractType: 'general',
    focusAreas: [],
  });

  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<{
    summary: string;
    keyTerms: { term: string; explanation: string }[];
    risks: { level: 'high' | 'medium' | 'low'; description: string }[];
    recommendations: string[];
    importantDates: { date: string; description: string }[];
    parties: string[];
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const focusOptions = [
    'Liability',
    'Payment Terms',
    'Termination',
    'Confidentiality',
    'Intellectual Property',
    'Dispute Resolution',
  ];

  const handleFocusToggle = (focus: string) => {
    setFormData((prev) => ({
      ...prev,
      focusAreas: prev.focusAreas?.includes(focus)
        ? prev.focusAreas.filter((f) => f !== focus)
        : [...(prev.focusAreas || []), focus],
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/plain' && !file.name.endsWith('.txt')) {
      toast.error('Please upload a text file');
      return;
    }

    try {
      const text = await file.text();
      setFormData({ ...formData, contractText: text });
      toast.success('Contract loaded');
    } catch (error) {
      toast.error('Failed to read file');
    }
  };

  const handleAnalyze = async () => {
    if (!formData.contractText.trim()) {
      toast.error('Please enter contract text');
      return;
    }

    try {
      setLoading(true);
      const response = await aiToolsApi.analyzeContract(formData);
      if (response.data) {
        setAnalysis(response.data);
        toast.success('Contract analyzed!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to analyze contract');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!analysis) return;
    const text = `
CONTRACT ANALYSIS SUMMARY
${analysis.summary}

PARTIES INVOLVED
${analysis.parties.join(', ')}

KEY TERMS
${analysis.keyTerms.map((t) => `${t.term}: ${t.explanation}`).join('\n')}

RISKS IDENTIFIED
${analysis.risks.map((r) => `[${r.level.toUpperCase()}] ${r.description}`).join('\n')}

IMPORTANT DATES
${analysis.importantDates.map((d) => `${d.date}: ${d.description}`).join('\n')}

RECOMMENDATIONS
${analysis.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}
    `.trim();

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Analysis copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-red-500/20 text-red-400';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'low':
        return 'bg-green-500/20 text-green-400';
      default:
        return 'bg-white/20 text-white';
    }
  };

  return (
    <AIToolLayout
      title="AI Contract Analyzer"
      description="Analyze contracts and identify key terms, risks, and obligations"
      icon={<FileSearch className="w-8 h-8" />}
      iconColor="text-rose-400"
      iconBgColor="bg-rose-500/20"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardContent className="p-6 space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <Label className="text-white">Contract Text *</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-1" />
                  Upload
                </Button>
              </div>
              <Textarea
                placeholder="Paste your contract text here..."
                value={formData.contractText}
                onChange={(e) => setFormData({ ...formData, contractText: e.target.value })}
                className="min-h-[200px] bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
              <p className="text-xs text-white/40 mt-1">
                {formData.contractText.length} characters
              </p>
            </div>

            <div>
              <Label className="text-white">Contract Type</Label>
              <Select
                value={formData.contractType}
                onValueChange={(value: any) => setFormData({ ...formData, contractType: value })}
              >
                <SelectTrigger className="mt-1 bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="employment">Employment</SelectItem>
                  <SelectItem value="nda">NDA</SelectItem>
                  <SelectItem value="service">Service Agreement</SelectItem>
                  <SelectItem value="lease">Lease/Rental</SelectItem>
                  <SelectItem value="sale">Sale/Purchase</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white mb-2 block">Focus Areas (optional)</Label>
              <div className="flex flex-wrap gap-2">
                {focusOptions.map((focus) => (
                  <Badge
                    key={focus}
                    className={`cursor-pointer transition-colors ${
                      formData.focusAreas?.includes(focus)
                        ? 'bg-rose-500 text-white'
                        : 'bg-white/10 text-white/60 hover:bg-white/20'
                    }`}
                    onClick={() => handleFocusToggle(focus)}
                  >
                    {focus}
                  </Badge>
                ))}
              </div>
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={loading || !formData.contractText.trim()}
              className="w-full bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Analyze Contract
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-white text-lg">Analysis Results</CardTitle>
              {analysis && (
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
                <Loader2 className="w-8 h-8 text-rose-400 animate-spin" />
              </div>
            ) : analysis ? (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {/* Summary */}
                <div className="bg-rose-500/10 rounded-lg p-4">
                  <h4 className="text-rose-400 font-medium text-sm mb-2">Summary</h4>
                  <p className="text-white text-sm">{analysis.summary}</p>
                </div>

                {/* Parties */}
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white/60 font-medium text-sm mb-2">Parties Involved</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.parties.map((party, idx) => (
                      <Badge key={idx} className="bg-blue-500/20 text-blue-400">
                        {party}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Risks */}
                {analysis.risks.length > 0 && (
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-white/60 font-medium text-sm mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Risks Identified
                    </h4>
                    <div className="space-y-2">
                      {analysis.risks.map((risk, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Badge className={`${getRiskColor(risk.level)} text-xs`}>
                            {risk.level}
                          </Badge>
                          <p className="text-white text-sm">{risk.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Terms */}
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white/60 font-medium text-sm mb-2">Key Terms</h4>
                  <div className="space-y-2">
                    {analysis.keyTerms.map((item, idx) => (
                      <div key={idx} className="bg-white/5 rounded p-2">
                        <span className="text-rose-400 font-medium">{item.term}</span>
                        <p className="text-white/80 text-sm mt-1">{item.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Important Dates */}
                {analysis.importantDates.length > 0 && (
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-white/60 font-medium text-sm mb-2">Important Dates</h4>
                    <div className="space-y-2">
                      {analysis.importantDates.map((date, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                            {date.date}
                          </Badge>
                          <span className="text-white text-sm">{date.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                <div className="bg-green-500/10 rounded-lg p-4">
                  <h4 className="text-green-400 font-medium text-sm mb-2">Recommendations</h4>
                  <ul className="space-y-1">
                    {analysis.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-white text-sm flex gap-2">
                        <span className="text-green-400">{idx + 1}.</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <FileSearch className="w-16 h-16 text-white/20 mb-4" />
                <p className="text-white/60">Your contract analysis will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AIToolLayout>
  );
};

export default AIContractAnalyzer;
