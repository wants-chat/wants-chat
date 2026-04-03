import React, { useState } from 'react';
import { Calculator, Loader2, Copy, Check, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { aiToolsApi, TaxCalculatorData } from '@/lib/api/ai-tools-api';
import { toast } from 'sonner';

const AITaxCalculator: React.FC = () => {
  const [formData, setFormData] = useState<TaxCalculatorData>({
    income: 0,
    filingStatus: 'single',
    country: 'US',
    state: '',
    deductions: 0,
    selfEmployed: false,
    additionalIncome: 0,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    taxableIncome: number;
    federalTax: number;
    stateTax: number;
    effectiveRate: number;
    marginalRate: number;
    takeHome: number;
    breakdown: { bracket: string; rate: number; amount: number }[];
    tips: string[];
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCalculate = async () => {
    if (!formData.income || formData.income <= 0) {
      toast.error('Please enter a valid income');
      return;
    }

    try {
      setLoading(true);
      const response = await aiToolsApi.calculateTax(formData);
      if (response.data) {
        setResult(response.data);
        toast.success('Tax calculated!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to calculate tax');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    const text = `
TAX CALCULATION SUMMARY

Gross Income: $${formData.income.toLocaleString()}
Taxable Income: $${result.taxableIncome.toLocaleString()}

Federal Tax: $${result.federalTax.toLocaleString()}
State Tax: $${result.stateTax.toLocaleString()}
Total Tax: $${(result.federalTax + result.stateTax).toLocaleString()}

Effective Tax Rate: ${result.effectiveRate.toFixed(1)}%
Marginal Tax Rate: ${result.marginalRate.toFixed(1)}%
Take Home: $${result.takeHome.toLocaleString()}

TAX-SAVING TIPS
${result.tips.map((t, i) => `${i + 1}. ${t}`).join('\n')}
    `.trim();

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Results copied!');
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
      title="AI Tax Calculator"
      description="Calculate your estimated taxes with AI-powered insights"
      icon={<Calculator className="w-8 h-8" />}
      iconColor="text-emerald-400"
      iconBgColor="bg-emerald-500/20"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardContent className="p-6 space-y-4">
            <div>
              <Label className="text-white">Annual Gross Income *</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60">$</span>
                <Input
                  type="number"
                  placeholder="100000"
                  value={formData.income || ''}
                  onChange={(e) => setFormData({ ...formData, income: Number(e.target.value) })}
                  className="pl-8 bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Filing Status</Label>
                <Select
                  value={formData.filingStatus}
                  onValueChange={(value: any) => setFormData({ ...formData, filingStatus: value })}
                >
                  <SelectTrigger className="mt-1 bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married_joint">Married Filing Jointly</SelectItem>
                    <SelectItem value="married_separate">Married Filing Separately</SelectItem>
                    <SelectItem value="head_household">Head of Household</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white">Country</Label>
                <Select
                  value={formData.country}
                  onValueChange={(value: any) => setFormData({ ...formData, country: value })}
                >
                  <SelectTrigger className="mt-1 bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="UK">United Kingdom</SelectItem>
                    <SelectItem value="CA">Canada</SelectItem>
                    <SelectItem value="AU">Australia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white">State (US only)</Label>
                <Input
                  placeholder="CA, NY, TX..."
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                  className="mt-1 bg-white/10 border-white/20 text-white"
                  maxLength={2}
                />
              </div>
              <div>
                <Label className="text-white">Deductions</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60">$</span>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.deductions || ''}
                    onChange={(e) => setFormData({ ...formData, deductions: Number(e.target.value) })}
                    className="pl-8 bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-white">Additional Income (investments, etc.)</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60">$</span>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.additionalIncome || ''}
                  onChange={(e) => setFormData({ ...formData, additionalIncome: Number(e.target.value) })}
                  className="pl-8 bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-white">Self-Employed</Label>
              <Switch
                checked={formData.selfEmployed}
                onCheckedChange={(checked) => setFormData({ ...formData, selfEmployed: checked })}
              />
            </div>

            <Button
              onClick={handleCalculate}
              disabled={loading || !formData.income}
              className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Calculate Tax
                </>
              )}
            </Button>

            <p className="text-xs text-white/40 text-center">
              This is an estimate. Consult a tax professional for accurate calculations.
            </p>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-white text-lg">Tax Breakdown</CardTitle>
              {result && (
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
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              </div>
            ) : result ? (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-emerald-500/10 rounded-lg p-3 text-center">
                    <p className="text-white/60 text-xs">Take Home</p>
                    <p className="text-emerald-400 text-xl font-bold">
                      {formatCurrency(result.takeHome)}
                    </p>
                  </div>
                  <div className="bg-red-500/10 rounded-lg p-3 text-center">
                    <p className="text-white/60 text-xs">Total Tax</p>
                    <p className="text-red-400 text-xl font-bold">
                      {formatCurrency(result.federalTax + result.stateTax)}
                    </p>
                  </div>
                </div>

                {/* Tax Details */}
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white/60 font-medium text-sm mb-3">Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white/60 text-sm">Taxable Income</span>
                      <span className="text-white">{formatCurrency(result.taxableIncome)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60 text-sm">Federal Tax</span>
                      <span className="text-white">{formatCurrency(result.federalTax)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60 text-sm">State Tax</span>
                      <span className="text-white">{formatCurrency(result.stateTax)}</span>
                    </div>
                    <div className="h-px bg-white/10 my-2" />
                    <div className="flex justify-between">
                      <span className="text-white/60 text-sm">Effective Rate</span>
                      <span className="text-emerald-400">{result.effectiveRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60 text-sm">Marginal Rate</span>
                      <span className="text-amber-400">{result.marginalRate.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                {/* Bracket Breakdown */}
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white/60 font-medium text-sm mb-3">Tax Brackets</h4>
                  <div className="space-y-2">
                    {result.breakdown.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="flex-1 bg-white/5 rounded h-6 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-green-500"
                            style={{
                              width: `${(item.amount / result.federalTax) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-white/60 text-xs w-16 text-right">
                          {item.rate}%
                        </span>
                        <span className="text-white text-xs w-20 text-right">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tips */}
                <div className="bg-blue-500/10 rounded-lg p-4">
                  <h4 className="text-blue-400 font-medium text-sm mb-2">Tax-Saving Tips</h4>
                  <ul className="space-y-1">
                    {result.tips.map((tip, idx) => (
                      <li key={idx} className="text-white text-sm flex gap-2">
                        <span className="text-blue-400">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <Calculator className="w-16 h-16 text-white/20 mb-4" />
                <p className="text-white/60">Your tax breakdown will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AIToolLayout>
  );
};

export default AITaxCalculator;
