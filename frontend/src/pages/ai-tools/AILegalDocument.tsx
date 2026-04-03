import React, { useState } from 'react';
import { Scale, Loader2, Copy, Check, Wand2, Download } from 'lucide-react';
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
import { aiToolsApi, LegalDocumentData } from '@/lib/api/ai-tools-api';
import { toast } from 'sonner';

const AILegalDocument: React.FC = () => {
  const [formData, setFormData] = useState<LegalDocumentData>({
    documentType: 'nda',
    parties: [],
    keyTerms: '',
    jurisdiction: 'US',
    additionalClauses: '',
  });

  const [partyInputs, setPartyInputs] = useState({ party1: '', party2: '' });
  const [loading, setLoading] = useState(false);
  const [document, setDocument] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    const parties = [partyInputs.party1, partyInputs.party2].filter((p) => p.trim());
    if (parties.length < 2) {
      toast.error('Please enter at least two parties');
      return;
    }

    try {
      setLoading(true);
      const response = await aiToolsApi.generateLegalDocument({
        ...formData,
        parties,
      });
      if (response.data?.document) {
        setDocument(response.data.document);
        toast.success('Document generated!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate document');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!document) return;
    try {
      await navigator.clipboard.writeText(document);
      setCopied(true);
      toast.success('Document copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const handleDownload = () => {
    if (!document) return;
    const blob = new Blob([document], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${formData.documentType}-${Date.now()}.txt`;
    window.document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    window.document.body.removeChild(a);
    toast.success('Document downloaded');
  };

  return (
    <AIToolLayout
      title="AI Legal Document"
      description="Generate legal documents and agreements"
      icon={<Scale className="w-8 h-8" />}
      iconColor="text-slate-400"
      iconBgColor="bg-slate-500/20"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardContent className="p-6 space-y-4">
            <div>
              <Label className="text-white">Document Type *</Label>
              <Select
                value={formData.documentType}
                onValueChange={(value: any) => setFormData({ ...formData, documentType: value })}
              >
                <SelectTrigger className="mt-1 bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nda">Non-Disclosure Agreement (NDA)</SelectItem>
                  <SelectItem value="employment">Employment Contract</SelectItem>
                  <SelectItem value="service">Service Agreement</SelectItem>
                  <SelectItem value="freelance">Freelance Contract</SelectItem>
                  <SelectItem value="partnership">Partnership Agreement</SelectItem>
                  <SelectItem value="lease">Lease Agreement</SelectItem>
                  <SelectItem value="sale">Sale Agreement</SelectItem>
                  <SelectItem value="terms">Terms of Service</SelectItem>
                  <SelectItem value="privacy">Privacy Policy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Party 1 *</Label>
                <Input
                  placeholder="First party name"
                  value={partyInputs.party1}
                  onChange={(e) => setPartyInputs({ ...partyInputs, party1: e.target.value })}
                  className="mt-1 bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Party 2 *</Label>
                <Input
                  placeholder="Second party name"
                  value={partyInputs.party2}
                  onChange={(e) => setPartyInputs({ ...partyInputs, party2: e.target.value })}
                  className="mt-1 bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>

            <div>
              <Label className="text-white">Jurisdiction</Label>
              <Select
                value={formData.jurisdiction}
                onValueChange={(value: any) => setFormData({ ...formData, jurisdiction: value })}
              >
                <SelectTrigger className="mt-1 bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="UK">United Kingdom</SelectItem>
                  <SelectItem value="EU">European Union</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="AU">Australia</SelectItem>
                  <SelectItem value="IN">India</SelectItem>
                  <SelectItem value="SG">Singapore</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white">Key Terms & Conditions</Label>
              <Textarea
                placeholder="Specific terms you want included (e.g., duration, payment terms, deliverables)..."
                value={formData.keyTerms}
                onChange={(e) => setFormData({ ...formData, keyTerms: e.target.value })}
                className="mt-1 min-h-[80px] bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>

            <div>
              <Label className="text-white">Additional Clauses (optional)</Label>
              <Textarea
                placeholder="Any specific clauses or provisions you need..."
                value={formData.additionalClauses}
                onChange={(e) => setFormData({ ...formData, additionalClauses: e.target.value })}
                className="mt-1 min-h-[60px] bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading || !partyInputs.party1.trim() || !partyInputs.party2.trim()}
              className="w-full bg-gradient-to-r from-slate-500 to-gray-500 hover:from-slate-600 hover:to-gray-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate Document
                </>
              )}
            </Button>

            <p className="text-xs text-white/40 text-center">
              Note: This is a template. Please consult a legal professional for official documents.
            </p>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-white text-lg">Generated Document</CardTitle>
              {document && (
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={handleDownload}>
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleCopy}>
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
              <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
              </div>
            ) : document ? (
              <div className="bg-white/5 rounded-lg p-4 min-h-[400px] max-h-[600px] overflow-y-auto">
                <pre className="text-white text-sm whitespace-pre-wrap font-sans">
                  {document}
                </pre>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <Scale className="w-16 h-16 text-white/20 mb-4" />
                <p className="text-white/60">Your legal document will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AIToolLayout>
  );
};

export default AILegalDocument;
