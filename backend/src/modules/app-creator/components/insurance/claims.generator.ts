/**
 * Insurance Claims Component Generators
 */

export interface ClaimsOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateClaimsList(options: ClaimsOptions = {}): string {
  const { componentName = 'ClaimsList', endpoint = '/claims' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, FileText, Clock, CheckCircle, XCircle, AlertTriangle, DollarSign, Search, Filter, Calendar } from 'lucide-react';
import { api } from '@/lib/api';

interface Claim {
  id: string;
  claim_number: string;
  policy_number: string;
  type: string;
  status: string;
  amount_claimed: number;
  amount_approved: number;
  incident_date: string;
  filed_date: string;
  description: string;
  claimant_name: string;
}

const ${componentName}: React.FC = () => {
  const [status, setStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: claims, isLoading } = useQuery({
    queryKey: ['claims', status, searchTerm],
    queryFn: async () => {
      let url = '${endpoint}';
      const params = new URLSearchParams();
      if (status !== 'all') params.append('status', status);
      if (searchTerm) params.append('search', searchTerm);
      if (params.toString()) url += '?' + params.toString();
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        };
      case 'pending':
        return {
          icon: <Clock className="w-4 h-4" />,
          color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        };
      case 'under_review':
        return {
          icon: <AlertTriangle className="w-4 h-4" />,
          color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        };
      case 'rejected':
        return {
          icon: <XCircle className="w-4 h-4" />,
          color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        };
      case 'paid':
        return {
          icon: <DollarSign className="w-4 h-4" />,
          color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        };
      default:
        return {
          icon: <FileText className="w-4 h-4" />,
          color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
        };
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['all', 'pending', 'under_review', 'approved', 'rejected', 'paid'].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={\`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors \${
                status === s
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }\`}
            >
              {s === 'under_review' ? 'Under Review' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search claims..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent w-64"
            />
          </div>
          <Link
            to="/claims/new"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <FileText className="w-4 h-4" />
            File Claim
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {claims && claims.length > 0 ? (
            claims.map((claim: Claim) => {
              const statusConfig = getStatusConfig(claim.status);
              return (
                <Link
                  key={claim.id}
                  to={\`/claims/\${claim.id}\`}
                  className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-gray-900 dark:text-white">#{claim.claim_number}</span>
                        <span className={\`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium \${statusConfig.color}\`}>
                          {statusConfig.icon}
                          {claim.status?.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-2">{claim.description}</p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" />
                          Policy: {claim.policy_number}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(claim.incident_date).toLocaleDateString()}
                        </span>
                        <span>{claim.claimant_name}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Claimed</p>
                      <p className="font-semibold text-gray-900 dark:text-white">\${claim.amount_claimed?.toLocaleString()}</p>
                      {claim.amount_approved > 0 && (
                        <>
                          <p className="text-sm text-gray-500 mt-2">Approved</p>
                          <p className="font-semibold text-green-600">\${claim.amount_approved?.toLocaleString()}</p>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="p-8 text-center text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              No claims found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateClaimsStats(options: ClaimsOptions = {}): string {
  const { componentName = 'ClaimsStats', endpoint = '/claims/stats' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, FileText, Clock, CheckCircle, XCircle, DollarSign, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';

interface ClaimsStatsData {
  total_claims: number;
  pending_claims: number;
  approved_claims: number;
  rejected_claims: number;
  total_claimed: number;
  total_paid: number;
  average_processing_time: number;
  approval_rate: number;
  claims_this_month: number;
  claims_last_month: number;
}

const ${componentName}: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['claims-stats'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const claimsTrend = stats?.claims_this_month > stats?.claims_last_month;
  const trendPercentage = stats?.claims_last_month > 0
    ? Math.round(((stats.claims_this_month - stats.claims_last_month) / stats.claims_last_month) * 100)
    : 0;

  const statCards = [
    {
      label: 'Total Claims',
      value: stats?.total_claims || 0,
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    },
    {
      label: 'Pending',
      value: stats?.pending_claims || 0,
      icon: <Clock className="w-6 h-6" />,
      color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
    },
    {
      label: 'Approved',
      value: stats?.approved_claims || 0,
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    },
    {
      label: 'Rejected',
      value: stats?.rejected_claims || 0,
      icon: <XCircle className="w-6 h-6" />,
      color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={\`w-12 h-12 rounded-xl flex items-center justify-center \${stat.color}\`}>
                {stat.icon}
              </div>
              {stat.label === 'Total Claims' && trendPercentage !== 0 && (
                <div className={\`flex items-center gap-1 text-sm \${claimsTrend ? 'text-red-500' : 'text-green-500'}\`}>
                  {claimsTrend ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {Math.abs(trendPercentage)}%
                </div>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value.toLocaleString()}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Claimed</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">\${(stats?.total_claimed || 0).toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Paid</p>
              <p className="text-xl font-bold text-green-600">\${(stats?.total_paid || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-sm text-gray-500">Approval Rate</p>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.approval_rate || 0}%</p>
          <div className="mt-3 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-500"
              style={{ width: \`\${stats?.approval_rate || 0}%\` }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-sm text-gray-500">Avg. Processing Time</p>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.average_processing_time || 0} days</p>
          <p className="text-sm text-gray-500 mt-1">From filing to resolution</p>
        </div>
      </div>

      {stats?.pending_claims > 5 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-400">High Pending Claims</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-500">
                There are {stats.pending_claims} claims awaiting review. Consider prioritizing claim processing.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateClaimForm(options: ClaimsOptions = {}): string {
  const { componentName = 'ClaimForm', endpoint = '/claims' } = options;

  return `import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Loader2, Upload, X, FileText, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ClaimFormData {
  policy_id: string;
  type: string;
  incident_date: string;
  incident_location: string;
  description: string;
  amount_claimed: number;
  witnesses: string;
  police_report_number: string;
}

const ${componentName}: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ClaimFormData>({
    policy_id: '',
    type: '',
    incident_date: '',
    incident_location: '',
    description: '',
    amount_claimed: 0,
    witnesses: '',
    police_report_number: '',
  });
  const [documents, setDocuments] = useState<File[]>([]);

  const { data: policies } = useQuery({
    queryKey: ['user-policies'],
    queryFn: async () => {
      const response = await api.get<any>('/policies?status=active');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const formDataToSend = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formDataToSend.append(key, value as string);
      });
      documents.forEach((doc) => {
        formDataToSend.append('documents', doc);
      });
      return api.post('${endpoint}', formDataToSend);
    },
    onSuccess: () => {
      toast.success('Claim filed successfully!');
      navigate('/claims');
    },
    onError: () => toast.error('Failed to file claim'),
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setDocuments([...documents, ...Array.from(e.target.files)]);
    }
  };

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const claimTypes = [
    { value: 'accident', label: 'Accident' },
    { value: 'theft', label: 'Theft' },
    { value: 'damage', label: 'Property Damage' },
    { value: 'medical', label: 'Medical Expense' },
    { value: 'liability', label: 'Liability' },
    { value: 'natural_disaster', label: 'Natural Disaster' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-6 h-6 text-purple-600" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">File Insurance Claim</h1>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Policy *</label>
            <select
              name="policy_id"
              value={formData.policy_id}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
            >
              <option value="">Choose a policy</option>
              {policies?.map((policy: any) => (
                <option key={policy.id} value={policy.id}>
                  {policy.policy_number} - {policy.type} ({policy.holder_name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Claim Type *</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
            >
              <option value="">Select claim type</option>
              {claimTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                Incident Date *
              </label>
              <input
                type="date"
                name="incident_date"
                value={formData.incident_date}
                onChange={handleInputChange}
                required
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Amount Claimed *
              </label>
              <input
                type="number"
                name="amount_claimed"
                value={formData.amount_claimed}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Incident Location *</label>
            <input
              type="text"
              name="incident_location"
              value={formData.incident_location}
              onChange={handleInputChange}
              required
              placeholder="Address or location of incident"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              placeholder="Provide a detailed description of what happened..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent resize-none"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Witnesses (if any)</label>
              <input
                type="text"
                name="witnesses"
                value={formData.witnesses}
                onChange={handleInputChange}
                placeholder="Names and contact info"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Police Report # (if applicable)</label>
              <input
                type="text"
                name="police_report_number"
                value={formData.police_report_number}
                onChange={handleInputChange}
                placeholder="Report number"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-medium text-gray-900 dark:text-white mb-4">Supporting Documents</h3>
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
            id="documents"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          />
          <label htmlFor="documents" className="cursor-pointer">
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
            <p className="text-xs text-gray-400 mt-1">PDF, Images, or Documents (max 10MB each)</p>
          </label>
        </div>

        {documents.length > 0 && (
          <div className="mt-4 space-y-2">
            {documents.map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-xs">{doc.name}</span>
                  <span className="text-xs text-gray-400">({(doc.size / 1024).toFixed(1)} KB)</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeDocument(index)}
                  className="p-1 text-gray-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-yellow-800 dark:text-yellow-400">Important Notice</p>
            <p className="text-yellow-700 dark:text-yellow-500 mt-1">
              By submitting this claim, you certify that all information provided is true and accurate.
              False claims may result in policy cancellation and legal action.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => navigate('/claims')}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Submit Claim
        </button>
      </div>
    </form>
  );
};

export default ${componentName};
`;
}

export function generateClaimTimeline(options: ClaimsOptions = {}): string {
  const { componentName = 'ClaimTimeline', endpoint = '/claims' } = options;

  return `import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, FileText, Clock, CheckCircle, XCircle, MessageSquare, Upload, DollarSign, AlertTriangle, User } from 'lucide-react';
import { api } from '@/lib/api';

interface TimelineEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  created_at: string;
  user_name?: string;
  metadata?: Record<string, any>;
}

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: timeline, isLoading } = useQuery({
    queryKey: ['claim-timeline', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id + '/timeline');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const getEventConfig = (type: string) => {
    switch (type) {
      case 'filed':
        return {
          icon: <FileText className="w-4 h-4" />,
          color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
          lineColor: 'bg-blue-200 dark:bg-blue-800',
        };
      case 'document_uploaded':
        return {
          icon: <Upload className="w-4 h-4" />,
          color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
          lineColor: 'bg-purple-200 dark:bg-purple-800',
        };
      case 'under_review':
        return {
          icon: <Clock className="w-4 h-4" />,
          color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
          lineColor: 'bg-yellow-200 dark:bg-yellow-800',
        };
      case 'info_requested':
        return {
          icon: <AlertTriangle className="w-4 h-4" />,
          color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
          lineColor: 'bg-orange-200 dark:bg-orange-800',
        };
      case 'approved':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
          lineColor: 'bg-green-200 dark:bg-green-800',
        };
      case 'rejected':
        return {
          icon: <XCircle className="w-4 h-4" />,
          color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
          lineColor: 'bg-red-200 dark:bg-red-800',
        };
      case 'payment_processed':
        return {
          icon: <DollarSign className="w-4 h-4" />,
          color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
          lineColor: 'bg-green-200 dark:bg-green-800',
        };
      case 'comment':
        return {
          icon: <MessageSquare className="w-4 h-4" />,
          color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
          lineColor: 'bg-gray-200 dark:bg-gray-700',
        };
      default:
        return {
          icon: <Clock className="w-4 h-4" />,
          color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
          lineColor: 'bg-gray-200 dark:bg-gray-700',
        };
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Claim Timeline</h2>
      </div>

      <div className="p-4">
        {timeline && timeline.length > 0 ? (
          <div className="relative">
            {timeline.map((event: TimelineEvent, index: number) => {
              const config = getEventConfig(event.type);
              const isLast = index === timeline.length - 1;

              return (
                <div key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
                  {!isLast && (
                    <div className={\`absolute left-[18px] top-10 w-0.5 h-[calc(100%-24px)] \${config.lineColor}\`} />
                  )}
                  <div className={\`relative z-10 w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 \${config.color}\`}>
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">{event.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{event.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span>{new Date(event.created_at).toLocaleString()}</span>
                      {event.user_name && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {event.user_name}
                        </span>
                      )}
                    </div>
                    {event.metadata?.amount && (
                      <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-sm">
                        <DollarSign className="w-3.5 h-3.5" />
                        {event.metadata.amount.toLocaleString()}
                      </div>
                    )}
                    {event.metadata?.reason && (
                      <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-900/50 rounded text-sm text-gray-600 dark:text-gray-400">
                        {event.metadata.reason}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            No timeline events yet
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
