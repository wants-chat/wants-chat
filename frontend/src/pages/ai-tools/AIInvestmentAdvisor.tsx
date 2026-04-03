import React, { useState } from 'react';
import { TrendingUp, Loader2, Copy, Check, Wand2, PieChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AIToolLayout from '@/components/ai-tools/AIToolLayout';
import { aiToolsApi, InvestmentAdvisorData } from '@/lib/api/ai-tools-api';
import { toast } from 'sonner';

const AIInvestmentAdvisor: React.FC = () => {
  const [formData, setFormData] = useState<InvestmentAdvisorData>({
    investmentAmount: 10000,
    riskTolerance: 'moderate',
    investmentGoal: 'growth',
    timeHorizon: 'medium',
    age: 30,
    existingPortfolio: '',
  });

  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<{
    recommendation: string;
    allocation: { asset: string; percentage: number; color: string }[];
    strategies: string[];
    risks: string[];
    expectedReturns: { conservative: number; moderate: number; aggressive: number };
    tips: string[];
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGetAdvice = async () => {
    if (!formData.investmentAmount || formData.investmentAmount <= 0) {
      toast.error('Please enter a valid investment amount');
      return;
    }

    try {
      setLoading(true);
      const response = await aiToolsApi.getInvestmentAdvice(formData);
      if (response.data) {
        setAdvice(response.data);
        toast.success('Investment advice generated!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to get advice');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!advice) return;
    const text = `
INVESTMENT ADVICE

${advice.recommendation}

RECOMMENDED ALLOCATION
${advice.allocation.map((a) => `${a.asset}: ${a.percentage}%`).join('\n')}

STRATEGIES
${advice.strategies.map((s, i) => `${i + 1}. ${s}`).join('\n')}

EXPECTED RETURNS (Annual)
Conservative: ${advice.expectedReturns.conservative}%
Moderate: ${advice.expectedReturns.moderate}%
Aggressive: ${advice.expectedReturns.aggressive}%

TIPS
${advice.tips.map((t, i) => `${i + 1}. ${t}`).join('\n')}
    `.trim();

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Advice copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <AIToolLayout
      title="AI Investment Advisor"
      description="Get personalized investment recommendations based on your goals"
      icon={<TrendingUp className="w-8 h-8" />}
      iconColor="text-sky-400"
      iconBgColor="bg-sky-500/20"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardContent className="p-6 space-y-4">
            <div>
              <Label className="text-white">Investment Amount *</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60">$</span>
                <Input
                  type="number"
                  placeholder="10000"
                  value={formData.investmentAmount || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, investmentAmount: Number(e.target.value) })
                  }
                  className="pl-8 bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Your Age</Label>
                <Input
                  type="number"
                  placeholder="30"
                  value={formData.age || ''}
                  onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                  className="mt-1 bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Risk Tolerance</Label>
                <Select
                  value={formData.riskTolerance}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, riskTolerance: value })
                  }
                >
                  <SelectTrigger className="mt-1 bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conservative">Conservative</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="aggressive">Aggressive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Investment Goal</Label>
                <Select
                  value={formData.investmentGoal}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, investmentGoal: value })
                  }
                >
                  <SelectTrigger className="mt-1 bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="growth">Growth</SelectItem>
                    <SelectItem value="income">Income/Dividends</SelectItem>
                    <SelectItem value="preservation">Wealth Preservation</SelectItem>
                    <SelectItem value="retirement">Retirement</SelectItem>
                    <SelectItem value="education">Education Fund</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white">Time Horizon</Label>
                <Select
                  value={formData.timeHorizon}
                  onValueChange={(value: any) => setFormData({ ...formData, timeHorizon: value })}
                >
                  <SelectTrigger className="mt-1 bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short (1-3 years)</SelectItem>
                    <SelectItem value="medium">Medium (3-7 years)</SelectItem>
                    <SelectItem value="long">Long (7+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-white">Current Portfolio (optional)</Label>
              <Input
                placeholder="e.g., 50% stocks, 30% bonds, 20% cash"
                value={formData.existingPortfolio}
                onChange={(e) => setFormData({ ...formData, existingPortfolio: e.target.value })}
                className="mt-1 bg-white/10 border-white/20 text-white"
              />
            </div>

            <Button
              onClick={handleGetAdvice}
              disabled={loading || !formData.investmentAmount}
              className="w-full bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Get Investment Advice
                </>
              )}
            </Button>

            <p className="text-xs text-white/40 text-center">
              This is educational content only, not financial advice. Consult a professional.
            </p>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-white text-lg">Investment Recommendations</CardTitle>
              {advice && (
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
                <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
              </div>
            ) : advice ? (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {/* Recommendation */}
                <div className="bg-sky-500/10 rounded-lg p-4">
                  <h4 className="text-sky-400 font-medium text-sm mb-2">Recommendation</h4>
                  <p className="text-white text-sm">{advice.recommendation}</p>
                </div>

                {/* Allocation Chart */}
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white/60 font-medium text-sm mb-3 flex items-center gap-2">
                    <PieChart className="w-4 h-4" />
                    Suggested Allocation
                  </h4>
                  <div className="space-y-2">
                    {advice.allocation.map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-white">{item.asset}</span>
                          <span className="text-white/60">{item.percentage}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${item.percentage}%`,
                              backgroundColor: item.color,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Expected Returns */}
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white/60 font-medium text-sm mb-3">
                    Expected Annual Returns
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 bg-green-500/10 rounded">
                      <p className="text-xs text-white/60">Conservative</p>
                      <p className="text-green-400 font-bold">
                        {advice.expectedReturns.conservative}%
                      </p>
                    </div>
                    <div className="text-center p-2 bg-yellow-500/10 rounded">
                      <p className="text-xs text-white/60">Moderate</p>
                      <p className="text-yellow-400 font-bold">
                        {advice.expectedReturns.moderate}%
                      </p>
                    </div>
                    <div className="text-center p-2 bg-red-500/10 rounded">
                      <p className="text-xs text-white/60">Aggressive</p>
                      <p className="text-red-400 font-bold">
                        {advice.expectedReturns.aggressive}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Strategies */}
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white/60 font-medium text-sm mb-2">Strategies</h4>
                  <ul className="space-y-1">
                    {advice.strategies.map((strategy, idx) => (
                      <li key={idx} className="text-white text-sm flex gap-2">
                        <span className="text-sky-400">{idx + 1}.</span>
                        {strategy}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Risks */}
                {advice.risks.length > 0 && (
                  <div className="bg-red-500/10 rounded-lg p-4">
                    <h4 className="text-red-400 font-medium text-sm mb-2">Key Risks</h4>
                    <ul className="space-y-1">
                      {advice.risks.map((risk, idx) => (
                        <li key={idx} className="text-white text-sm flex gap-2">
                          <span className="text-red-400">•</span>
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tips */}
                <div className="bg-emerald-500/10 rounded-lg p-4">
                  <h4 className="text-emerald-400 font-medium text-sm mb-2">Investment Tips</h4>
                  <ul className="space-y-1">
                    {advice.tips.map((tip, idx) => (
                      <li key={idx} className="text-white text-sm flex gap-2">
                        <span className="text-emerald-400">✓</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <TrendingUp className="w-16 h-16 text-white/20 mb-4" />
                <p className="text-white/60">Your investment advice will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AIToolLayout>
  );
};

export default AIInvestmentAdvisor;
