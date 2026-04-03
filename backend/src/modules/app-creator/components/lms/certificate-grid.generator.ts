/**
 * Certificate Grid Component Generator
 *
 * Generates certificate display and management components.
 */

export interface CertificateGridOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateCertificateGrid(options: CertificateGridOptions = {}): string {
  const { componentName = 'CertificateGrid', endpoint = '/certificates' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Award, Download, Share2, ExternalLink } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { data: certificates, isLoading } = useQuery({
    queryKey: ['certificates'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {certificates && certificates.length > 0 ? (
        certificates.map((cert: any) => (
          <div
            key={cert.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-center">{cert.course_name || cert.title}</h3>
            </div>
            <div className="p-4">
              <div className="text-center text-sm text-gray-500 mb-4">
                <p>Completed on {new Date(cert.issued_at || cert.created_at).toLocaleDateString()}</p>
                {cert.credential_id && (
                  <p className="mt-1">Credential ID: {cert.credential_id}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-1">
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button className="flex-1 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-1">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                {cert.verify_url && (
                  <a
                    href={cert.verify_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full text-center py-12 text-gray-500">
          <Award className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          No certificates earned yet
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}
