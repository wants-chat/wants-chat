/**
 * Social Profile Component Generators
 *
 * Generates profile header, tabs, and user grid components.
 */

export interface ProfileOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateProfileHeader(options: ProfileOptions = {}): string {
  const { componentName = 'ProfileHeader', endpoint = '/users' } = options;

  return `import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, MapPin, Link as LinkIcon, Calendar, Edit } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!user) {
    return <div className="text-center py-8 text-gray-500">User not found</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Cover Image */}
      <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600">
        {user.cover_url && (
          <img src={user.cover_url} alt="Cover" className="w-full h-full object-cover" />
        )}
      </div>

      {/* Profile Info */}
      <div className="px-6 pb-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 md:-mt-12">
          <div className="flex items-end gap-4">
            <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden bg-gray-200 dark:bg-gray-700">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                  <span className="text-4xl font-bold text-white">
                    {(user.name || user.username || '?').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name || user.username}</h1>
              {user.username && <p className="text-gray-500">@{user.username}</p>}
            </div>
          </div>

          <div className="flex gap-2 mt-4 md:mt-0">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 font-medium">
              Follow
            </button>
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700">
              <Edit className="w-5 h-5" />
            </button>
          </div>
        </div>

        {user.bio && (
          <p className="mt-4 text-gray-700 dark:text-gray-300">{user.bio}</p>
        )}

        <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
          {user.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {user.location}
            </span>
          )}
          {user.website && (
            <a href={user.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-blue-600">
              <LinkIcon className="w-4 h-4" />
              {user.website.replace(/^https?:\\/\\//, '')}
            </a>
          )}
          {user.created_at && (
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
          )}
        </div>

        <div className="flex gap-6 mt-4">
          <span className="text-gray-900 dark:text-white">
            <strong>{user.following_count || 0}</strong>
            <span className="text-gray-500 ml-1">Following</span>
          </span>
          <span className="text-gray-900 dark:text-white">
            <strong>{user.followers_count || 0}</strong>
            <span className="text-gray-500 ml-1">Followers</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateProfileTabs(options: { componentName?: string } = {}): string {
  const componentName = options.componentName || 'ProfileTabs';

  return `import React, { useState } from 'react';

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface ${componentName}Props {
  tabs?: Tab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  children?: React.ReactNode;
}

const defaultTabs: Tab[] = [
  { id: 'posts', label: 'Posts' },
  { id: 'likes', label: 'Likes' },
  { id: 'media', label: 'Media' },
];

const ${componentName}: React.FC<${componentName}Props> = ({
  tabs = defaultTabs,
  activeTab: controlledActiveTab,
  onTabChange,
  children,
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(tabs[0]?.id || 'posts');
  const activeTab = controlledActiveTab ?? internalActiveTab;

  const handleTabChange = (tabId: string) => {
    if (onTabChange) {
      onTabChange(tabId);
    } else {
      setInternalActiveTab(tabId);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={\`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors \${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }\`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateUserGrid(options: { componentName?: string; endpoint?: string } = {}): string {
  const { componentName = 'UserGrid', endpoint = '/users' } = options;

  return `import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Users } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  title?: string;
  limit?: number;
}

const ${componentName}: React.FC<${componentName}Props> = ({ title = 'Users', limit }) => {
  const navigate = useNavigate();

  const { data: users, isLoading } = useQuery({
    queryKey: ['users', limit],
    queryFn: async () => {
      let url = '${endpoint}';
      if (limit) url += '?limit=' + limit;
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      {title && <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{title}</h2>}
      {users && users.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {users.map((user: any) => (
            <div
              key={user.id}
              onClick={() => navigate('/users/' + user.id)}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 text-center cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="w-16 h-16 mx-auto rounded-full overflow-hidden mb-3">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-xl font-bold text-white">
                      {(user.name || user.username || '?').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">{user.name || user.username}</h3>
              {user.username && <p className="text-sm text-gray-500 truncate">@{user.username}</p>}
              {user.followers_count !== undefined && (
                <p className="text-xs text-gray-400 mt-2">{user.followers_count} followers</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No users found</p>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}
