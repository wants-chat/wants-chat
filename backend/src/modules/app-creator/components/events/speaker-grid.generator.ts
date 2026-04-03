/**
 * Speaker Grid Component Generator
 */

export interface SpeakerGridOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateSpeakerGrid(options: SpeakerGridOptions = {}): string {
  const { componentName = 'SpeakerGrid', endpoint = '/speakers' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Loader2, User, Linkedin, Twitter, Globe } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: speakers, isLoading } = useQuery({
    queryKey: ['speakers', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}?event_id=' + id);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

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
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Speakers</h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {speakers && speakers.length > 0 ? (
          speakers.map((speaker: any) => (
            <div key={speaker.id} className="text-center p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              {speaker.avatar_url ? (
                <img src={speaker.avatar_url} alt={speaker.name} className="w-24 h-24 rounded-full object-cover mx-auto mb-3" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-3">
                  <User className="w-12 h-12 text-purple-600" />
                </div>
              )}
              <h3 className="font-semibold text-gray-900 dark:text-white">{speaker.name}</h3>
              {speaker.title && (
                <p className="text-sm text-gray-500">{speaker.title}</p>
              )}
              {speaker.company && (
                <p className="text-sm text-purple-600">{speaker.company}</p>
              )}
              <div className="flex justify-center gap-2 mt-3">
                {speaker.linkedin_url && (
                  <a href={speaker.linkedin_url} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <Linkedin className="w-4 h-4 text-gray-400" />
                  </a>
                )}
                {speaker.twitter_url && (
                  <a href={speaker.twitter_url} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <Twitter className="w-4 h-4 text-gray-400" />
                  </a>
                )}
                {speaker.website_url && (
                  <a href={speaker.website_url} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <Globe className="w-4 h-4 text-gray-400" />
                  </a>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-500">No speakers listed</div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateSponsorGrid(options: SpeakerGridOptions = {}): string {
  const { componentName = 'SponsorGrid', endpoint = '/sponsors' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Loader2, ExternalLink } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: sponsors, isLoading } = useQuery({
    queryKey: ['sponsors', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}?event_id=' + id);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Group sponsors by tier
  const tiers = sponsors?.reduce((acc: any, sponsor: any) => {
    const tier = sponsor.tier || 'Partner';
    if (!acc[tier]) acc[tier] = [];
    acc[tier].push(sponsor);
    return acc;
  }, {}) || {};

  const tierOrder = ['Platinum', 'Gold', 'Silver', 'Bronze', 'Partner'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Sponsors</h2>
      </div>
      <div className="p-6">
        {tierOrder.filter((tier) => tiers[tier]?.length > 0).length > 0 ? (
          tierOrder.filter((tier) => tiers[tier]?.length > 0).map((tier) => (
            <div key={tier} className="mb-8 last:mb-0">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">{tier} Sponsors</h3>
              <div className={\`grid gap-6 \${
                tier === 'Platinum' ? 'grid-cols-2' :
                tier === 'Gold' ? 'grid-cols-3' :
                'grid-cols-4'
              }\`}>
                {tiers[tier].map((sponsor: any) => (
                  <a
                    key={sponsor.id}
                    href={sponsor.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    {sponsor.logo_url ? (
                      <img
                        src={sponsor.logo_url}
                        alt={sponsor.name}
                        className={\`object-contain mb-2 \${
                          tier === 'Platinum' ? 'h-16' :
                          tier === 'Gold' ? 'h-12' :
                          'h-10'
                        }\`}
                      />
                    ) : (
                      <div className={\`flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded mb-2 \${
                        tier === 'Platinum' ? 'w-32 h-16' :
                        tier === 'Gold' ? 'w-24 h-12' :
                        'w-20 h-10'
                      }\`}>
                        <span className="text-xs text-gray-400">{sponsor.name}</span>
                      </div>
                    )}
                    <span className="text-sm text-gray-500 group-hover:text-purple-600 flex items-center gap-1">
                      {sponsor.name}
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                    </span>
                  </a>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">No sponsors listed</div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
