/**
 * Insurance Customer Component Generators
 */

export interface CustomerOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateCustomerProfile(options: CustomerOptions = {}): string {
  const { componentName = 'CustomerProfile', endpoint = '/customers' } = options;

  return `import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, User, Mail, Phone, MapPin, Calendar, Shield, FileText, DollarSign, Clock, AlertCircle, Edit, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';

interface Customer {
  id: string;
  customer_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  date_of_birth: string;
  avatar_url?: string;
  created_at: string;
  policies: Array<{
    id: string;
    policy_number: string;
    type: string;
    status: string;
    premium: number;
    end_date: string;
  }>;
  claims: Array<{
    id: string;
    claim_number: string;
    status: string;
    amount_claimed: number;
    created_at: string;
  }>;
  total_premium: number;
  total_coverage: number;
  active_policies_count: number;
  pending_claims_count: number;
}

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'expired': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'approved': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!customer) {
    return <div className="text-center py-12 text-gray-500">Customer not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-6">
          <div className="flex-shrink-0">
            {customer.avatar_url ? (
              <img
                src={customer.avatar_url}
                alt={customer.first_name}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <User className="w-12 h-12 text-purple-600" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {customer.first_name} {customer.last_name}
                </h1>
                <p className="text-gray-500">Customer #{customer.customer_number}</p>
              </div>
              <Link
                to={\`/customers/\${id}/edit\`}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Link>
            </div>
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Mail className="w-4 h-4 text-gray-400" />
                {customer.email}
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Phone className="w-4 h-4 text-gray-400" />
                {customer.phone}
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4 text-gray-400" />
                {customer.address}
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4 text-gray-400" />
                DOB: {new Date(customer.date_of_birth).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{customer.active_policies_count || 0}</p>
              <p className="text-sm text-gray-500">Active Policies</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">\${customer.total_coverage?.toLocaleString() || 0}</p>
              <p className="text-sm text-gray-500">Total Coverage</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">\${customer.total_premium?.toLocaleString() || 0}</p>
              <p className="text-sm text-gray-500">Monthly Premium</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{customer.pending_claims_count || 0}</p>
              <p className="text-sm text-gray-500">Pending Claims</p>
            </div>
          </div>
        </div>
      </div>

      {/* Policies */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600" />
            Policies
          </h2>
          <Link to={\`/policies/new?customer=\${id}\`} className="text-sm text-purple-600 hover:text-purple-700">
            + Add Policy
          </Link>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {customer.policies && customer.policies.length > 0 ? (
            customer.policies.map((policy: any) => (
              <Link
                key={policy.id}
                to={\`/policies/\${policy.id}\`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{policy.policy_number}</p>
                    <p className="text-sm text-gray-500 capitalize">{policy.type} Insurance</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">\${policy.premium}/mo</p>
                    <p className="text-xs text-gray-500">Expires {new Date(policy.end_date).toLocaleDateString()}</p>
                  </div>
                  <span className={\`px-2 py-1 rounded-full text-xs font-medium \${getStatusColor(policy.status)}\`}>
                    {policy.status}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </Link>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              No policies found
            </div>
          )}
        </div>
      </div>

      {/* Recent Claims */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            Recent Claims
          </h2>
          <Link to={\`/claims?customer=\${id}\`} className="text-sm text-purple-600 hover:text-purple-700">
            View All
          </Link>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {customer.claims && customer.claims.length > 0 ? (
            customer.claims.slice(0, 5).map((claim: any) => (
              <Link
                key={claim.id}
                to={\`/claims/\${claim.id}\`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">#{claim.claim_number}</p>
                  <p className="text-sm text-gray-500">{new Date(claim.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-medium text-gray-900 dark:text-white">\${claim.amount_claimed?.toLocaleString()}</p>
                  <span className={\`px-2 py-1 rounded-full text-xs font-medium \${getStatusColor(claim.status)}\`}>
                    {claim.status}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </Link>
            ))
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

export function generateDocumentList(options: CustomerOptions = {}): string {
  const { componentName = 'DocumentList', endpoint = '/documents' } = options;

  return `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, FileText, Download, Trash2, Upload, Eye, Search, Filter, FolderOpen, Image, File, FileSpreadsheet, Plus, MoreVertical, X } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface Document {
  id: string;
  name: string;
  type: string;
  category: string;
  size: number;
  url: string;
  uploaded_at: string;
  policy_number?: string;
  claim_number?: string;
}

interface DocumentListProps {
  customerId?: string;
  policyId?: string;
  claimId?: string;
}

const ${componentName}: React.FC<DocumentListProps> = ({ customerId, policyId, claimId }) => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState('');

  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents', customerId, policyId, claimId, category, searchTerm],
    queryFn: async () => {
      let url = '${endpoint}';
      const params = new URLSearchParams();
      if (customerId) params.append('customer_id', customerId);
      if (policyId) params.append('policy_id', policyId);
      if (claimId) params.append('claim_id', claimId);
      if (category !== 'all') params.append('category', category);
      if (searchTerm) params.append('search', searchTerm);
      if (params.toString()) url += '?' + params.toString();
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return api.post('${endpoint}', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Document uploaded successfully');
      setUploadModalOpen(false);
      setSelectedFile(null);
      setUploadCategory('');
    },
    onError: () => toast.error('Failed to upload document'),
  });

  const deleteMutation = useMutation({
    mutationFn: (documentId: string) => api.delete('${endpoint}/' + documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Document deleted');
    },
    onError: () => toast.error('Failed to delete document'),
  });

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return <Image className="w-5 h-5 text-blue-500" />;
    if (type.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    if (type.includes('spreadsheet') || type.includes('excel')) return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !uploadCategory) return;

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('category', uploadCategory);
    if (customerId) formData.append('customer_id', customerId);
    if (policyId) formData.append('policy_id', policyId);
    if (claimId) formData.append('claim_id', claimId);

    uploadMutation.mutate(formData);
  };

  const categories = [
    { value: 'all', label: 'All Documents' },
    { value: 'identity', label: 'Identity Documents' },
    { value: 'policy', label: 'Policy Documents' },
    { value: 'claim', label: 'Claim Documents' },
    { value: 'medical', label: 'Medical Records' },
    { value: 'financial', label: 'Financial Documents' },
    { value: 'other', label: 'Other' },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={\`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors \${
                category === cat.value
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }\`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent w-48"
            />
          </div>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Upload className="w-4 h-4" />
            Upload
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        {documents && documents.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {documents.map((doc: Document) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    {getFileIcon(doc.type)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{doc.name}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span>{formatFileSize(doc.size)}</span>
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs capitalize">{doc.category}</span>
                      <span>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                  >
                    <Eye className="w-4 h-4" />
                  </a>
                  <a
                    href={doc.url}
                    download
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this document?')) {
                        deleteMutation.mutate(doc.id);
                      }
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No documents</h3>
            <p className="text-gray-500 mb-4">Upload your first document to get started</p>
            <button
              onClick={() => setUploadModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Upload className="w-4 h-4" />
              Upload Document
            </button>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upload Document</h3>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpload} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent"
                >
                  <option value="">Select category</option>
                  {categories.slice(1).map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">File *</label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-2">
                        {getFileIcon(selectedFile.type)}
                        <span className="text-gray-700 dark:text-gray-300">{selectedFile.name}</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-500">Click to select a file</p>
                      </>
                    )}
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedFile || !uploadCategory || uploadMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {uploadMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}
