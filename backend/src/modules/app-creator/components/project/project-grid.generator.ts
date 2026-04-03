/**
 * Project Grid Component Generator
 *
 * Generates project management components including grid view,
 * project header, milestone tracker, and team members.
 */

export interface ProjectGridOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateProjectGrid(options: ProjectGridOptions = {}): string {
  const { componentName = 'ProjectGrid', endpoint = '/projects' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, FolderKanban, Users, Calendar, Clock } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  filter?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ filter }) => {
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects', filter],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}' + (filter ? '?status=' + filter : ''));
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

  const statusColors: Record<string, string> = {
    planning: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    active: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'on-hold': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects && projects.length > 0 ? (
        projects.map((project: any) => (
          <Link
            key={project.id}
            to={\`/projects/\${project.id}\`}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <FolderKanban className="w-6 h-6 text-blue-600" />
              </div>
              <span className={\`px-3 py-1 rounded-full text-xs font-medium \${statusColors[project.status] || statusColors.planning}\`}>
                {project.status || 'Planning'}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{project.name || project.title}</h3>
            <p className="text-sm text-gray-500 line-clamp-2 mb-4">{project.description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              {project.team_size && (
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {project.team_size}
                </span>
              )}
              {project.due_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(project.due_date).toLocaleDateString()}
                </span>
              )}
            </div>
            {project.progress !== undefined && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-medium text-gray-900 dark:text-white">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: \`\${project.progress}%\` }}
                  />
                </div>
              </div>
            )}
          </Link>
        ))
      ) : (
        <div className="col-span-full text-center py-12 text-gray-500">
          <FolderKanban className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          No projects found
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateProjectHeader(options: { componentName?: string; endpoint?: string } = {}): string {
  const { componentName = 'ProjectHeader', endpoint = '/projects' } = options;

  return `import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Calendar, Users, Clock, Edit2 } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
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

  if (!project) {
    return <div className="text-center py-8 text-gray-500">Project not found</div>;
  }

  const statusColors: Record<string, string> = {
    planning: 'bg-gray-100 text-gray-700',
    active: 'bg-blue-100 text-blue-700',
    'on-hold': 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{project.name || project.title}</h1>
            <span className={\`px-3 py-1 rounded-full text-sm font-medium \${statusColors[project.status] || statusColors.planning}\`}>
              {project.status || 'Planning'}
            </span>
          </div>
          <p className="text-gray-500">{project.description}</p>
        </div>
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          <Edit2 className="w-5 h-5 text-gray-500" />
        </button>
      </div>
      <div className="flex flex-wrap gap-6 text-sm">
        {project.start_date && (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500">Started:</span>
            <span className="text-gray-900 dark:text-white">{new Date(project.start_date).toLocaleDateString()}</span>
          </div>
        )}
        {project.due_date && (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500">Due:</span>
            <span className="text-gray-900 dark:text-white">{new Date(project.due_date).toLocaleDateString()}</span>
          </div>
        )}
        {project.team_size && (
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500">Team:</span>
            <span className="text-gray-900 dark:text-white">{project.team_size} members</span>
          </div>
        )}
      </div>
      {project.progress !== undefined && (
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500">Overall Progress</span>
            <span className="font-medium text-gray-900 dark:text-white">{project.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all"
              style={{ width: \`\${project.progress}%\` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateMilestoneTracker(options: { componentName?: string; endpoint?: string } = {}): string {
  const { componentName = 'MilestoneTracker', endpoint = '/milestones' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, CheckCircle, Circle, Clock } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  projectId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ projectId }) => {
  const { data: milestones, isLoading } = useQuery({
    queryKey: ['milestones', projectId],
    queryFn: async () => {
      const url = projectId ? '${endpoint}?project_id=' + projectId : '${endpoint}';
      const response = await api.get<any>(url);
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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Milestones</h2>
      <div className="relative">
        {milestones && milestones.length > 0 ? (
          <div className="space-y-6">
            {milestones.map((milestone: any, index: number) => (
              <div key={milestone.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  {milestone.status === 'completed' ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : milestone.status === 'in-progress' ? (
                    <Clock className="w-6 h-6 text-blue-600" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-300" />
                  )}
                  {index < milestones.length - 1 && (
                    <div className={\`w-0.5 h-full mt-2 \${milestone.status === 'completed' ? 'bg-green-300' : 'bg-gray-200 dark:bg-gray-700'}\`} />
                  )}
                </div>
                <div className="flex-1 pb-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className={\`font-medium \${milestone.status === 'completed' ? 'text-green-600' : 'text-gray-900 dark:text-white'}\`}>
                        {milestone.name || milestone.title}
                      </h3>
                      {milestone.description && (
                        <p className="text-sm text-gray-500 mt-1">{milestone.description}</p>
                      )}
                    </div>
                    {milestone.due_date && (
                      <span className="text-sm text-gray-500">
                        {new Date(milestone.due_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">No milestones yet</div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateTeamMembers(options: { componentName?: string; endpoint?: string } = {}): string {
  const { componentName = 'TeamMembers', endpoint = '/team-members' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Mail, MoreVertical } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  projectId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ projectId }) => {
  const { data: members, isLoading } = useQuery({
    queryKey: ['team-members', projectId],
    queryFn: async () => {
      const url = projectId ? '${endpoint}?project_id=' + projectId : '${endpoint}';
      const response = await api.get<any>(url);
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

  const roleColors: Record<string, string> = {
    owner: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    admin: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    member: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    viewer: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Team Members</h2>
        <button className="text-sm text-blue-600 hover:text-blue-700">+ Add Member</button>
      </div>
      <div className="space-y-4">
        {members && members.length > 0 ? (
          members.map((member: any) => (
            <div key={member.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                {member.avatar_url ? (
                  <img src={member.avatar_url} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {(member.name || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{member.name}</p>
                  <p className="text-sm text-gray-500">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={\`px-3 py-1 rounded-full text-xs font-medium \${roleColors[member.role] || roleColors.member}\`}>
                  {member.role || 'Member'}
                </span>
                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">No team members yet</div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
