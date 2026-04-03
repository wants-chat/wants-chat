/**
 * Team Generator
 *
 * Generates TeamMemberProfile components with:
 * - Profile card display
 * - Contact information
 * - Role/department badges
 * - Skills/expertise tags
 * - Social links
 * - Activity status
 */

import { pascalCase, snakeCase } from 'change-case';
import pluralize from 'pluralize';
import { formatFieldLabel } from '../utils/generator-helpers';

export interface TeamMemberProfileOptions {
  componentName?: string;
  entity?: string;
  endpoint?: string;
  queryKey?: string;
  showContact?: boolean;
  showSocial?: boolean;
  showSkills?: boolean;
  showActivity?: boolean;
  showStats?: boolean;
  layout?: 'card' | 'horizontal' | 'detailed';
}

/**
 * Generate a TeamMemberProfile component
 */
export function generateTeamMemberProfile(options: TeamMemberProfileOptions = {}): string {
  const {
    entity = 'team_member',
    showContact = true,
    showSocial = true,
    showSkills = true,
    showActivity = true,
    showStats = true,
    layout = 'card',
  } = options;

  const tableName = snakeCase(pluralize.plural(entity));
  const componentName = options.componentName || 'TeamMemberProfile';
  const endpoint = options.endpoint || '/' + tableName;
  const queryKey = options.queryKey || tableName;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Clock,
  ExternalLink,
  Loader2,
  CheckCircle,
  Circle,
  MessageSquare,
  Video,
  Globe,
  Github,
  Linkedin,
  Twitter,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface TeamMember {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  role?: string;
  title?: string;
  department?: string;
  location?: string;
  timezone?: string;
  bio?: string;
  skills?: string[];
  expertise?: string[];
  status?: 'online' | 'offline' | 'away' | 'busy';
  lastActive?: string;
  joinedAt?: string;
  social?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
  };
  stats?: {
    projects?: number;
    tasks?: number;
    reviews?: number;
  };
  manager?: {
    id: string;
    name: string;
    avatar?: string;
  };
  directReports?: number;
}

interface ${componentName}Props {
  className?: string;
  memberId?: string;
  data?: TeamMember;
  onMessage?: (member: TeamMember) => void;
  onSchedule?: (member: TeamMember) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  className,
  memberId: propMemberId,
  data: propData,
  onMessage,
  onSchedule,
}) => {
  const { id: paramId } = useParams<{ id: string }>();
  const memberId = propMemberId || paramId;

  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${queryKey}', memberId],
    queryFn: async () => {
      try {
        const response = await api.get<any>(\`${endpoint}/\${memberId}\`);
        return response?.data || response;
      } catch (err) {
        console.error('Failed to fetch team member:', err);
        return null;
      }
    },
    enabled: !!memberId && !propData,
  });

  const member = propData || fetchedData;

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; bgColor: string; label: string }> = {
      online: {
        color: 'bg-green-500',
        bgColor: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        label: 'Online'
      },
      offline: {
        color: 'bg-gray-400',
        bgColor: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
        label: 'Offline'
      },
      away: {
        color: 'bg-yellow-500',
        bgColor: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        label: 'Away'
      },
      busy: {
        color: 'bg-red-500',
        bgColor: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        label: 'Busy'
      },
    };
    return configs[status] || configs.offline;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  const formatLastActive = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return \`\${minutes}m ago\`;
    if (hours < 24) return \`\${hours}h ago\`;
    return \`\${days}d ago\`;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className={cn('bg-white dark:bg-gray-800 rounded-xl p-8 text-center', className)}>
        <User className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Team member not found</p>
      </div>
    );
  }

  const statusConfig = getStatusConfig(member.status || 'offline');
  const displayName = member.name || \`\${member.firstName || ''} \${member.lastName || ''}\`.trim();

  ${layout === 'detailed' ? `return (
    <div className={cn('space-y-6', className)}>
      {/* Header Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Cover/Banner */}
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600" />

        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="relative -mt-16 mb-4">
            <div className="relative inline-block">
              {member.avatar ? (
                <img
                  src={member.avatar}
                  alt={displayName}
                  className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {getInitials(displayName)}
                  </span>
                </div>
              )}
              ${showActivity ? `<span className={cn(
                'absolute bottom-2 right-2 w-5 h-5 rounded-full border-2 border-white dark:border-gray-800',
                statusConfig.color
              )} />` : ''}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {displayName}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {member.title || member.role}
              </p>
              {member.department && (
                <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm rounded-full">
                  <Briefcase className="w-3 h-3" />
                  {member.department}
                </span>
              )}
              ${showActivity ? `<div className="flex items-center gap-2 mt-3">
                <span className={cn('px-2 py-1 text-xs font-medium rounded-full', statusConfig.bgColor)}>
                  {statusConfig.label}
                </span>
                {member.lastActive && member.status !== 'online' && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Last seen {formatLastActive(member.lastActive)}
                  </span>
                )}
              </div>` : ''}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {onMessage && (
                <button
                  onClick={() => onMessage(member)}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <MessageSquare className="w-4 h-4" />
                  Message
                </button>
              )}
              {onSchedule && (
                <button
                  onClick={() => onSchedule(member)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Video className="w-4 h-4" />
                  Schedule
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio */}
          {member.bio && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">About</h2>
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">{member.bio}</p>
            </div>
          )}

          ${showSkills ? `{/* Skills */}
          {(member.skills?.length > 0 || member.expertise?.length > 0) && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Skills & Expertise</h2>
              <div className="flex flex-wrap gap-2">
                {[...(member.skills || []), ...(member.expertise || [])].map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}` : ''}

          ${showStats ? `{/* Stats */}
          {member.stats && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Activity</h2>
              <div className="grid grid-cols-3 gap-4">
                {member.stats.projects !== undefined && (
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{member.stats.projects}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Projects</p>
                  </div>
                )}
                {member.stats.tasks !== undefined && (
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{member.stats.tasks}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Tasks</p>
                  </div>
                )}
                {member.stats.reviews !== undefined && (
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{member.stats.reviews}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Reviews</p>
                  </div>
                )}
              </div>
            </div>
          )}` : ''}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          ${showContact ? `{/* Contact */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact</h2>
            <div className="space-y-4">
              {member.email && (
                <a
                  href={\`mailto:\${member.email}\`}
                  className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <Mail className="w-5 h-5" />
                  <span className="truncate">{member.email}</span>
                </a>
              )}
              {member.phone && (
                <a
                  href={\`tel:\${member.phone}\`}
                  className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <Phone className="w-5 h-5" />
                  <span>{member.phone}</span>
                </a>
              )}
              {member.location && (
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <MapPin className="w-5 h-5" />
                  <span>{member.location}</span>
                </div>
              )}
              {member.timezone && (
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <Clock className="w-5 h-5" />
                  <span>{member.timezone}</span>
                </div>
              )}
            </div>
          </div>` : ''}

          ${showSocial ? `{/* Social Links */}
          {member.social && Object.values(member.social).some(Boolean) && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Connect</h2>
              <div className="space-y-3">
                {member.social.linkedin && (
                  <a
                    href={member.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <Linkedin className="w-5 h-5" />
                    <span>LinkedIn</span>
                    <ExternalLink className="w-4 h-4 ml-auto" />
                  </a>
                )}
                {member.social.twitter && (
                  <a
                    href={member.social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <Twitter className="w-5 h-5" />
                    <span>Twitter</span>
                    <ExternalLink className="w-4 h-4 ml-auto" />
                  </a>
                )}
                {member.social.github && (
                  <a
                    href={member.social.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <Github className="w-5 h-5" />
                    <span>GitHub</span>
                    <ExternalLink className="w-4 h-4 ml-auto" />
                  </a>
                )}
                {member.social.website && (
                  <a
                    href={member.social.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <Globe className="w-5 h-5" />
                    <span>Website</span>
                    <ExternalLink className="w-4 h-4 ml-auto" />
                  </a>
                )}
              </div>
            </div>
          )}` : ''}

          {/* Joined */}
          {member.joinedAt && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Calendar className="w-5 h-5" />
                <span>Joined {formatDate(member.joinedAt)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );` : layout === 'horizontal' ? `return (
    <div className={cn(
      'bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6',
      className
    )}>
      <div className="flex flex-col sm:flex-row items-start gap-6">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {member.avatar ? (
            <img
              src={member.avatar}
              alt={displayName}
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {getInitials(displayName)}
              </span>
            </div>
          )}
          ${showActivity ? `<span className={cn(
            'absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800',
            statusConfig.color
          )} />` : ''}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{displayName}</h3>
              <p className="text-gray-600 dark:text-gray-400">{member.title || member.role}</p>
            </div>
            ${showActivity ? `<span className={cn('px-2 py-1 text-xs font-medium rounded-full', statusConfig.bgColor)}>
              {statusConfig.label}
            </span>` : ''}
          </div>

          ${showContact ? `<div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
            {member.email && (
              <a href={\`mailto:\${member.email}\`} className="flex items-center gap-1 hover:text-blue-600">
                <Mail className="w-4 h-4" />
                {member.email}
              </a>
            )}
            {member.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {member.location}
              </span>
            )}
          </div>` : ''}

          ${showSkills ? `{member.skills?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {member.skills.slice(0, 4).map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded"
                >
                  {skill}
                </span>
              ))}
              {member.skills.length > 4 && (
                <span className="px-2 py-0.5 text-gray-500 dark:text-gray-400 text-xs">
                  +{member.skills.length - 4} more
                </span>
              )}
            </div>
          )}` : ''}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {onMessage && (
            <button
              onClick={() => onMessage(member)}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              title="Send message"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          )}
          {onSchedule && (
            <button
              onClick={() => onSchedule(member)}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              title="Schedule meeting"
            >
              <Video className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );` : `return (
    <div className={cn(
      'bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden',
      className
    )}>
      {/* Avatar */}
      <div className="p-6 flex flex-col items-center text-center">
        <div className="relative mb-4">
          {member.avatar ? (
            <img
              src={member.avatar}
              alt={displayName}
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {getInitials(displayName)}
              </span>
            </div>
          )}
          ${showActivity ? `<span className={cn(
            'absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800',
            statusConfig.color
          )} />` : ''}
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{displayName}</h3>
        <p className="text-gray-600 dark:text-gray-400">{member.title || member.role}</p>

        {member.department && (
          <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full">
            {member.department}
          </span>
        )}

        ${showContact ? `<div className="flex items-center justify-center gap-3 mt-4">
          {member.email && (
            <a href={\`mailto:\${member.email}\`} className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
              <Mail className="w-5 h-5" />
            </a>
          )}
          {member.phone && (
            <a href={\`tel:\${member.phone}\`} className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
              <Phone className="w-5 h-5" />
            </a>
          )}
          ${showSocial ? `{member.social?.linkedin && (
            <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
              <Linkedin className="w-5 h-5" />
            </a>
          )}` : ''}
        </div>` : ''}
      </div>

      ${showSkills ? `{member.skills?.length > 0 && (
        <div className="px-6 pb-4">
          <div className="flex flex-wrap justify-center gap-1">
            {member.skills.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}` : ''}

      {/* Actions */}
      <div className="flex border-t border-gray-200 dark:border-gray-700">
        {onMessage && (
          <button
            onClick={() => onMessage(member)}
            className="flex-1 py-3 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Message
          </button>
        )}
        {onSchedule && (
          <button
            onClick={() => onSchedule(member)}
            className="flex-1 py-3 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center justify-center gap-2 border-l border-gray-200 dark:border-gray-700"
          >
            <Video className="w-4 h-4" />
            Schedule
          </button>
        )}
      </div>
    </div>
  );`}
};

export default ${componentName};
`;
}

/**
 * Generate team grid component
 */
export function generateTeamGrid(options: Partial<TeamMemberProfileOptions> = {}): string {
  const componentName = options.componentName || 'TeamGrid';
  const entity = options.entity || 'team_member';
  const tableName = snakeCase(pluralize.plural(entity));
  const endpoint = options.endpoint || '/' + tableName;
  const queryKey = options.queryKey || tableName;

  return `import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Loader2, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import TeamMemberProfile from './TeamMemberProfile';

interface ${componentName}Props {
  className?: string;
  onMemberClick?: (member: any) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  className,
  onMemberClick,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['${queryKey}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch team members:', err);
        return [];
      }
    },
  });

  const departments = useMemo(() => {
    const depts = new Set(members.map((m: any) => m.department).filter(Boolean));
    return Array.from(depts).sort();
  }, [members]);

  const filteredMembers = useMemo(() => {
    return members.filter((member: any) => {
      const matchesSearch = !searchQuery ||
        member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.role?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = !selectedDepartment || member.department === selectedDepartment;
      return matchesSearch && matchesDept;
    });
  }, [members, searchQuery, selectedDepartment]);

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Team</h2>
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm rounded-full">
            {members.length}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search team members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
        {departments.length > 0 && (
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        )}
      </div>

      {/* Grid */}
      {filteredMembers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No team members found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMembers.map((member: any) => (
            <div key={member.id} onClick={() => onMemberClick?.(member)} className="cursor-pointer">
              <TeamMemberProfile data={member} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}
