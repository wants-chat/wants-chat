/**
 * Time Tracking Component Generators
 *
 * Generates time tracking components including:
 * - TimeTracker: General time tracking widget
 * - TimeTrackerConsulting: Consulting-specific time tracker with billable hours
 */

export interface TimeTrackerOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateTimeTracker(options: TimeTrackerOptions = {}): string {
  const { componentName = 'TimeTracker', endpoint = '/time-entries' } = options;

  return `import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Play, Pause, Clock, Plus, Calendar, Tag, Trash2, Edit2 } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ${componentName}Props {
  projectId?: string;
  taskId?: string;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ projectId, taskId, className }) => {
  const queryClient = useQueryClient();
  const [isTracking, setIsTracking] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [description, setDescription] = useState('');
  const [selectedProject, setSelectedProject] = useState(projectId || '');
  const [selectedTask, setSelectedTask] = useState(taskId || '');

  const { data: entries, isLoading } = useQuery({
    queryKey: ['time-entries', projectId, taskId],
    queryFn: async () => {
      let url = '${endpoint}';
      const params = [];
      if (projectId) params.push('project_id=' + projectId);
      if (taskId) params.push('task_id=' + taskId);
      if (params.length) url += '?' + params.join('&');
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('/projects');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch {
        return [];
      }
    },
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', selectedProject],
    queryFn: async () => {
      try {
        const url = selectedProject ? '/tasks?project_id=' + selectedProject : '/tasks';
        const response = await api.get<any>(url);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch {
        return [];
      }
    },
    enabled: !!selectedProject || !projectId,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('${endpoint}', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      toast.success('Time entry saved');
      setDescription('');
      setElapsedTime(0);
    },
    onError: () => toast.error('Failed to save time entry'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete('${endpoint}/' + id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      toast.success('Time entry deleted');
    },
    onError: () => toast.error('Failed to delete time entry'),
  });

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking, startTime]);

  const startTimer = useCallback(() => {
    setStartTime(new Date());
    setIsTracking(true);
  }, []);

  const stopTimer = useCallback(() => {
    if (startTime && elapsedTime > 0) {
      createMutation.mutate({
        project_id: selectedProject || projectId,
        task_id: selectedTask || taskId,
        description,
        start_time: startTime.toISOString(),
        end_time: new Date().toISOString(),
        duration: elapsedTime,
      });
    }
    setIsTracking(false);
    setStartTime(null);
  }, [startTime, elapsedTime, description, selectedProject, selectedTask, projectId, taskId, createMutation]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return \`\${hours.toString().padStart(2, '0')}:\${minutes.toString().padStart(2, '0')}:\${secs.toString().padStart(2, '0')}\`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return \`\${hours}h \${minutes}m\`;
    return \`\${minutes}m\`;
  };

  const getTotalTime = () => {
    return entries?.reduce((sum: number, entry: any) => sum + (entry.duration || 0), 0) || 0;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className={\`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 \${className || ''}\`}>
      {/* Timer Section */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Time Tracker
          </h3>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Tracked</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{formatDuration(getTotalTime())}</p>
          </div>
        </div>

        {/* Timer Display */}
        <div className="text-center mb-4">
          <div className={\`text-4xl font-mono font-bold \${isTracking ? 'text-blue-600' : 'text-gray-900 dark:text-white'}\`}>
            {formatTime(elapsedTime)}
          </div>
        </div>

        {/* Description Input */}
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What are you working on?"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 mb-4 focus:ring-2 focus:ring-blue-500"
        />

        {/* Project/Task Selection */}
        {!projectId && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <select
              value={selectedProject}
              onChange={(e) => {
                setSelectedProject(e.target.value);
                setSelectedTask('');
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm"
            >
              <option value="">Select Project</option>
              {projects.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name || p.title}</option>
              ))}
            </select>
            <select
              value={selectedTask}
              onChange={(e) => setSelectedTask(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm"
              disabled={!selectedProject}
            >
              <option value="">Select Task</option>
              {tasks.map((t: any) => (
                <option key={t.id} value={t.id}>{t.title || t.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Start/Stop Button */}
        <button
          onClick={isTracking ? stopTimer : startTimer}
          className={\`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors \${
            isTracking
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }\`}
        >
          {isTracking ? (
            <>
              <Pause className="w-5 h-5" />
              Stop Timer
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Start Timer
            </>
          )}
        </button>
      </div>

      {/* Time Entries List */}
      <div className="p-4">
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">Recent Entries</h4>
        <div className="space-y-3">
          {entries && entries.length > 0 ? (
            entries.slice(0, 10).map((entry: any) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {entry.description || 'No description'}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    {entry.project_name && (
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {entry.project_name}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(entry.start_time || entry.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDuration(entry.duration)}
                  </span>
                  <button
                    onClick={() => deleteMutation.mutate(entry.id)}
                    className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              No time entries yet
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

export function generateTimeTrackerConsulting(options: TimeTrackerOptions = {}): string {
  const { componentName = 'TimeTrackerConsulting', endpoint = '/time-entries' } = options;

  return `import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Play, Pause, Clock, Plus, Calendar, Tag, Trash2, DollarSign, Briefcase, FileText, Users, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ${componentName}Props {
  projectId?: string;
  className?: string;
}

const billingRates: Record<string, number> = {
  'senior-consultant': 250,
  'consultant': 175,
  'analyst': 125,
  'associate': 100,
};

const activityTypes = [
  { value: 'client-meeting', label: 'Client Meeting', billable: true },
  { value: 'internal-meeting', label: 'Internal Meeting', billable: false },
  { value: 'research', label: 'Research & Analysis', billable: true },
  { value: 'documentation', label: 'Documentation', billable: true },
  { value: 'presentation', label: 'Presentation Prep', billable: true },
  { value: 'travel', label: 'Travel', billable: true },
  { value: 'admin', label: 'Administrative', billable: false },
];

const ${componentName}: React.FC<${componentName}Props> = ({ projectId, className }) => {
  const queryClient = useQueryClient();
  const [isTracking, setIsTracking] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [description, setDescription] = useState('');
  const [selectedProject, setSelectedProject] = useState(projectId || '');
  const [activityType, setActivityType] = useState('');
  const [role, setRole] = useState('consultant');
  const [isBillable, setIsBillable] = useState(true);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');

  const { data: entries, isLoading } = useQuery({
    queryKey: ['time-entries', projectId, viewMode],
    queryFn: async () => {
      let url = '${endpoint}';
      const params = [];
      if (projectId) params.push('project_id=' + projectId);
      params.push('view=' + viewMode);
      if (params.length) url += '?' + params.join('&');
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('/projects');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch {
        return [];
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('${endpoint}', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      toast.success('Time entry saved');
      setDescription('');
      setElapsedTime(0);
      setActivityType('');
    },
    onError: () => toast.error('Failed to save time entry'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete('${endpoint}/' + id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      toast.success('Time entry deleted');
    },
    onError: () => toast.error('Failed to delete time entry'),
  });

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking, startTime]);

  // Update billable when activity type changes
  useEffect(() => {
    const activity = activityTypes.find(a => a.value === activityType);
    if (activity) {
      setIsBillable(activity.billable);
    }
  }, [activityType]);

  const startTimer = useCallback(() => {
    setStartTime(new Date());
    setIsTracking(true);
  }, []);

  const stopTimer = useCallback(() => {
    if (startTime && elapsedTime > 0) {
      const hourlyRate = billingRates[role] || 175;
      const hours = elapsedTime / 3600;
      const billableAmount = isBillable ? hours * hourlyRate : 0;

      createMutation.mutate({
        project_id: selectedProject || projectId,
        description,
        activity_type: activityType,
        role,
        is_billable: isBillable,
        hourly_rate: hourlyRate,
        billable_amount: billableAmount,
        start_time: startTime.toISOString(),
        end_time: new Date().toISOString(),
        duration: elapsedTime,
      });
    }
    setIsTracking(false);
    setStartTime(null);
  }, [startTime, elapsedTime, description, selectedProject, projectId, activityType, role, isBillable, createMutation]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return \`\${hours.toString().padStart(2, '0')}:\${minutes.toString().padStart(2, '0')}:\${secs.toString().padStart(2, '0')}\`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return \`\${hours}h \${minutes}m\`;
    return \`\${minutes}m\`;
  };

  const getTotalTime = () => {
    return entries?.reduce((sum: number, entry: any) => sum + (entry.duration || 0), 0) || 0;
  };

  const getBillableTime = () => {
    return entries?.filter((e: any) => e.is_billable)
      .reduce((sum: number, entry: any) => sum + (entry.duration || 0), 0) || 0;
  };

  const getTotalBillable = () => {
    return entries?.filter((e: any) => e.is_billable)
      .reduce((sum: number, entry: any) => sum + (entry.billable_amount || 0), 0) || 0;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className={\`\${className || ''}\`}>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Time</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{formatDuration(getTotalTime())}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Billable Amount</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                \${getTotalBillable().toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Billable Hours</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{formatDuration(getBillableTime())}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Timer Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Time Tracker
          </h3>
          <div className="flex items-center gap-2">
            {['day', 'week', 'month'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as 'day' | 'week' | 'month')}
                className={\`px-3 py-1 text-sm rounded-lg transition-colors \${
                  viewMode === mode
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }\`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Timer Display */}
        <div className="text-center mb-6">
          <div className={\`text-5xl font-mono font-bold \${isTracking ? 'text-blue-600' : 'text-gray-900 dark:text-white'}\`}>
            {formatTime(elapsedTime)}
          </div>
          {isTracking && (
            <p className="text-sm text-gray-500 mt-2">
              Tracking at \${billingRates[role]}/hr
              {isBillable ? ' (Billable)' : ' (Non-billable)'}
            </p>
          )}
        </div>

        {/* Description Input */}
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What are you working on?"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 mb-4 focus:ring-2 focus:ring-blue-500"
        />

        {/* Selection Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {/* Project */}
          {!projectId && (
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm"
            >
              <option value="">Select Project</option>
              {projects.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name || p.title}</option>
              ))}
            </select>
          )}

          {/* Activity Type */}
          <select
            value={activityType}
            onChange={(e) => setActivityType(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm"
          >
            <option value="">Activity Type</option>
            {activityTypes.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label} {a.billable ? '($)' : ''}
              </option>
            ))}
          </select>

          {/* Role */}
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm"
          >
            <option value="senior-consultant">Senior Consultant (\$250/hr)</option>
            <option value="consultant">Consultant (\$175/hr)</option>
            <option value="analyst">Analyst (\$125/hr)</option>
            <option value="associate">Associate (\$100/hr)</option>
          </select>

          {/* Billable Toggle */}
          <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 cursor-pointer">
            <input
              type="checkbox"
              checked={isBillable}
              onChange={(e) => setIsBillable(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Billable</span>
          </label>
        </div>

        {/* Start/Stop Button */}
        <button
          onClick={isTracking ? stopTimer : startTimer}
          className={\`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors \${
            isTracking
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }\`}
        >
          {isTracking ? (
            <>
              <Pause className="w-5 h-5" />
              Stop Timer
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Start Timer
            </>
          )}
        </button>
      </div>

      {/* Time Entries Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-white">Time Entries</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Billable</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {entries && entries.length > 0 ? (
                entries.map((entry: any) => (
                  <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {entry.description || 'No description'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-500">{entry.project_name || '-'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-500">
                        {activityTypes.find(a => a.value === entry.activity_type)?.label || entry.activity_type || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDuration(entry.duration)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {entry.is_billable ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                          <DollarSign className="w-3 h-3 mr-1" />
                          {entry.billable_amount?.toFixed(2) || '0.00'}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Non-billable</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-500">
                        {new Date(entry.start_time || entry.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => deleteMutation.mutate(entry.id)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    No time entries yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
