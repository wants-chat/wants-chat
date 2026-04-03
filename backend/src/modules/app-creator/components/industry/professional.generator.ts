/**
 * Professional Services Component Generators
 * Includes consulting, freelance, legal, recruitment, and accounting
 */

export interface ProfessionalOptions {
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
}

export function generateTimeTracker(options: ProfessionalOptions = {}): string {
  const primary = options.colors?.primary || 'indigo';
  return `import React, { useState, useEffect } from 'react';
import { Play, Pause, Clock, Tag, FolderOpen, Save, X } from 'lucide-react';

interface TimeEntry {
  id: string;
  description: string;
  project?: string;
  tags?: string[];
  startTime: Date;
  endTime?: Date;
  duration: number;
}

interface TimeTrackerProps {
  projects?: { id: string; name: string }[];
  tags?: string[];
  onSave?: (entry: TimeEntry) => void;
  recentEntries?: TimeEntry[];
}

export function TimeTracker({ projects = [], tags = [], onSave, recentEntries = [] }: TimeTrackerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [description, setDescription] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && startTime) {
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return \`\${hrs.toString().padStart(2, '0')}:\${mins.toString().padStart(2, '0')}:\${secs.toString().padStart(2, '0')}\`;
  };

  const handleStart = () => {
    setIsRunning(true);
    setStartTime(new Date());
  };

  const handleStop = () => {
    setIsRunning(false);
    if (startTime) {
      const entry: TimeEntry = {
        id: Date.now().toString(),
        description,
        project: selectedProject,
        tags: selectedTags,
        startTime,
        endTime: new Date(),
        duration: elapsed,
      };
      onSave?.(entry);
      // Reset
      setDescription('');
      setSelectedProject('');
      setSelectedTags([]);
      setElapsed(0);
      setStartTime(null);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      {/* Timer */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What are you working on?"
            className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-${primary}-500 focus:border-transparent text-lg"
          />

          {/* Timer display */}
          <div className="text-3xl font-mono font-bold text-gray-900 dark:text-white min-w-[140px] text-center">
            {formatTime(elapsed)}
          </div>

          {/* Start/Stop button */}
          <button
            onClick={isRunning ? handleStop : handleStart}
            className={\`w-14 h-14 rounded-full flex items-center justify-center transition-colors \${
              isRunning
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-${primary}-600 hover:bg-${primary}-700 text-white'
            }\`}
          >
            {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
          </button>
        </div>

        {/* Options */}
        <div className="flex items-center gap-4 mt-4">
          {/* Project selector */}
          <div className="relative">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg appearance-none bg-white dark:bg-gray-800 cursor-pointer"
            >
              <option value="">No Project</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
            <FolderOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2 flex-1">
            <Tag className="w-4 h-4 text-gray-400" />
            {tags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={\`px-3 py-1 rounded-full text-sm transition-colors \${
                  selectedTags.includes(tag)
                    ? 'bg-${primary}-100 dark:bg-${primary}-900/30 text-${primary}-700 dark:text-${primary}-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }\`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent entries */}
      {recentEntries.length > 0 && (
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Recent</h3>
          <div className="space-y-2">
            {recentEntries.slice(0, 5).map(entry => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {entry.description || 'No description'}
                    </p>
                    <p className="text-sm text-gray-500">{entry.project}</p>
                  </div>
                </div>
                <span className="font-mono text-gray-600 dark:text-gray-400">
                  {formatTime(entry.duration)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}`;
}

export function generateTimeTrackerConsulting(options: ProfessionalOptions = {}): string {
  const primary = options.colors?.primary || 'indigo';
  return `import React, { useState, useEffect } from 'react';
import { Play, Pause, Clock, Briefcase, DollarSign, FileText, ChevronDown } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  hourlyRate: number;
}

interface Matter {
  id: string;
  name: string;
  clientId: string;
}

interface TimeEntry {
  id: string;
  description: string;
  clientId: string;
  matterId?: string;
  isBillable: boolean;
  startTime: Date;
  endTime?: Date;
  duration: number;
  amount: number;
}

interface TimeTrackerConsultingProps {
  clients: Client[];
  matters?: Matter[];
  defaultClient?: string;
  onSave?: (entry: TimeEntry) => void;
}

export function TimeTrackerConsulting({
  clients,
  matters = [],
  defaultClient,
  onSave
}: TimeTrackerConsultingProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [description, setDescription] = useState('');
  const [selectedClient, setSelectedClient] = useState(defaultClient || '');
  const [selectedMatter, setSelectedMatter] = useState('');
  const [isBillable, setIsBillable] = useState(true);

  const client = clients.find(c => c.id === selectedClient);
  const clientMatters = matters.filter(m => m.clientId === selectedClient);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && startTime) {
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return \`\${hrs.toString().padStart(2, '0')}:\${mins.toString().padStart(2, '0')}:\${secs.toString().padStart(2, '0')}\`;
  };

  const calculateAmount = () => {
    if (!client || !isBillable) return 0;
    const hours = elapsed / 3600;
    return hours * client.hourlyRate;
  };

  const handleStart = () => {
    setIsRunning(true);
    setStartTime(new Date());
  };

  const handleStop = () => {
    setIsRunning(false);
    if (startTime && selectedClient) {
      const entry: TimeEntry = {
        id: Date.now().toString(),
        description,
        clientId: selectedClient,
        matterId: selectedMatter,
        isBillable,
        startTime,
        endTime: new Date(),
        duration: elapsed,
        amount: calculateAmount(),
      };
      onSave?.(entry);
      // Reset
      setDescription('');
      setSelectedMatter('');
      setElapsed(0);
      setStartTime(null);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-${primary}-600 to-${primary}-700 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Time Tracker
          </h2>
          {client && isBillable && (
            <div className="text-right">
              <p className="text-sm text-${primary}-200">Estimated billable</p>
              <p className="text-2xl font-bold">\${calculateAmount().toFixed(2)}</p>
            </div>
          )}
        </div>

        {/* Timer display */}
        <div className="text-center py-8">
          <div className="text-5xl font-mono font-bold mb-4">
            {formatTime(elapsed)}
          </div>
          <button
            onClick={isRunning ? handleStop : handleStart}
            disabled={!selectedClient}
            className={\`px-8 py-3 rounded-full font-medium transition-all \${
              isRunning
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-white hover:bg-gray-100 text-${primary}-700 disabled:opacity-50 disabled:cursor-not-allowed'
            }\`}
          >
            {isRunning ? 'Stop Timer' : 'Start Timer'}
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="p-6 space-y-4">
        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What are you working on?"
            rows={2}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-${primary}-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Client */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Briefcase className="w-4 h-4 inline mr-1" />
            Client
          </label>
          <select
            value={selectedClient}
            onChange={(e) => {
              setSelectedClient(e.target.value);
              setSelectedMatter('');
            }}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-${primary}-500 focus:border-transparent"
          >
            <option value="">Select a client</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} (\${c.hourlyRate}/hr)
              </option>
            ))}
          </select>
        </div>

        {/* Matter */}
        {clientMatters.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Matter / Project
            </label>
            <select
              value={selectedMatter}
              onChange={(e) => setSelectedMatter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-${primary}-500 focus:border-transparent"
            >
              <option value="">Select a matter</option>
              {clientMatters.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Billable toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex items-center gap-3">
            <DollarSign className={\`w-5 h-5 \${isBillable ? 'text-green-500' : 'text-gray-400'}\`} />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Billable Time</p>
              <p className="text-sm text-gray-500">
                {isBillable && client ? \`\${client.hourlyRate}/hour\` : 'Not billable'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsBillable(!isBillable)}
            className={\`relative w-12 h-6 rounded-full transition-colors \${
              isBillable ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
            }\`}
          >
            <span
              className={\`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform \${
                isBillable ? 'left-7' : 'left-1'
              }\`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}`;
}

export function generateFreelancerProfile(options: ProfessionalOptions = {}): string {
  const primary = options.colors?.primary || 'indigo';
  return `import React from 'react';
import { Star, MapPin, Clock, Award, Briefcase, MessageCircle, Heart, ExternalLink, CheckCircle } from 'lucide-react';

interface Skill {
  name: string;
  level: 'beginner' | 'intermediate' | 'expert';
}

interface Portfolio {
  id: string;
  title: string;
  image: string;
  category: string;
}

interface Freelancer {
  id: string;
  name: string;
  title: string;
  avatar?: string;
  location: string;
  timezone: string;
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  successRate: number;
  skills: Skill[];
  portfolio: Portfolio[];
  bio: string;
  isOnline?: boolean;
  isVerified?: boolean;
  isFeatured?: boolean;
}

interface FreelancerProfileProps {
  freelancer: Freelancer;
  onHire?: () => void;
  onMessage?: () => void;
  onSave?: () => void;
  isSaved?: boolean;
}

export function FreelancerProfile({
  freelancer,
  onHire,
  onMessage,
  onSave,
  isSaved
}: FreelancerProfileProps) {
  const skillColors = {
    beginner: 'bg-gray-100 text-gray-700',
    intermediate: 'bg-blue-100 text-blue-700',
    expert: 'bg-${primary}-100 text-${primary}-700',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="relative">
        <div className="h-32 bg-gradient-to-r from-${primary}-600 to-${primary}-700" />
        <div className="absolute bottom-0 left-6 transform translate-y-1/2">
          <div className="relative">
            {freelancer.avatar ? (
              <img
                src={freelancer.avatar}
                alt={freelancer.name}
                className="w-24 h-24 rounded-xl border-4 border-white dark:border-gray-800 object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-xl border-4 border-white dark:border-gray-800 bg-${primary}-100 dark:bg-${primary}-900/30 flex items-center justify-center">
                <span className="text-3xl font-bold text-${primary}-600">{freelancer.name[0]}</span>
              </div>
            )}
            {freelancer.isOnline && (
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
            )}
          </div>
        </div>
        {freelancer.isFeatured && (
          <div className="absolute top-4 right-4 px-3 py-1 bg-yellow-500 text-white text-sm font-medium rounded-full flex items-center gap-1">
            <Award className="w-4 h-4" />
            Featured
          </div>
        )}
      </div>

      {/* Profile Info */}
      <div className="pt-16 px-6 pb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{freelancer.name}</h1>
              {freelancer.isVerified && (
                <CheckCircle className="w-5 h-5 text-blue-500" fill="currentColor" />
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-400">{freelancer.title}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {freelancer.location}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {freelancer.timezone}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">\${freelancer.hourlyRate}</p>
            <p className="text-sm text-gray-500">/hour</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 mt-6 py-4 border-y border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" fill="currentColor" />
            <span className="font-bold text-gray-900 dark:text-white">{freelancer.rating.toFixed(1)}</span>
            <span className="text-gray-500">({freelancer.reviewCount} reviews)</span>
          </div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-gray-400" />
            <span className="text-gray-600 dark:text-gray-400">{freelancer.completedJobs} jobs</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-gray-600 dark:text-gray-400">{freelancer.successRate}% success</span>
          </div>
        </div>

        {/* Bio */}
        <div className="mt-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">About</h3>
          <p className="text-gray-600 dark:text-gray-400">{freelancer.bio}</p>
        </div>

        {/* Skills */}
        <div className="mt-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {freelancer.skills.map(skill => (
              <span
                key={skill.name}
                className={\`px-3 py-1 rounded-full text-sm \${skillColors[skill.level]}\`}
              >
                {skill.name}
              </span>
            ))}
          </div>
        </div>

        {/* Portfolio preview */}
        {freelancer.portfolio.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Portfolio</h3>
              <button className="text-sm text-${primary}-600 hover:text-${primary}-700 flex items-center gap-1">
                View all <ExternalLink className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {freelancer.portfolio.slice(0, 3).map(item => (
                <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white text-sm font-medium px-2 text-center">{item.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onHire}
            className="flex-1 px-6 py-3 bg-${primary}-600 hover:bg-${primary}-700 text-white rounded-lg font-medium"
          >
            Hire Me
          </button>
          <button
            onClick={onMessage}
            className="px-6 py-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
          <button
            onClick={onSave}
            className={\`px-6 py-3 border rounded-lg \${
              isSaved
                ? 'border-red-200 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }\`}
          >
            <Heart className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
    </div>
  );
}`;
}

export function generateClientHeaderConsulting(options: ProfessionalOptions = {}): string {
  const primary = options.colors?.primary || 'indigo';
  return `import React from 'react';
import { Building2, Phone, Mail, Globe, MapPin, Calendar, DollarSign, Clock, MoreVertical, Edit, Trash2 } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  logo?: string;
  industry: string;
  website?: string;
  email: string;
  phone: string;
  address: string;
  totalBilled: number;
  outstandingBalance: number;
  activeProjects: number;
  totalHours: number;
  clientSince: string;
  status: 'active' | 'inactive' | 'pending';
}

interface ClientHeaderConsultingProps {
  client: Client;
  onEdit?: () => void;
  onDelete?: () => void;
  onNewProject?: () => void;
  onInvoice?: () => void;
}

export function ClientHeaderConsulting({
  client,
  onEdit,
  onDelete,
  onNewProject,
  onInvoice
}: ClientHeaderConsultingProps) {
  const statusStyles = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between">
          {/* Left: Logo & Basic Info */}
          <div className="flex items-start gap-4">
            {client.logo ? (
              <img src={client.logo} alt={client.name} className="w-16 h-16 rounded-xl object-contain bg-gray-50 dark:bg-gray-700 p-2" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-${primary}-100 dark:bg-${primary}-900/30 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-${primary}-600" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{client.name}</h1>
                <span className={\`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize \${statusStyles[client.status]}\`}>
                  {client.status}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">{client.industry}</p>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <a href={\`mailto:\${client.email}\`} className="flex items-center gap-1 text-gray-500 hover:text-${primary}-600">
                  <Mail className="w-4 h-4" />
                  {client.email}
                </a>
                <a href={\`tel:\${client.phone}\`} className="flex items-center gap-1 text-gray-500 hover:text-${primary}-600">
                  <Phone className="w-4 h-4" />
                  {client.phone}
                </a>
                {client.website && (
                  <a href={client.website} target="_blank" rel="noopener" className="flex items-center gap-1 text-gray-500 hover:text-${primary}-600">
                    <Globe className="w-4 h-4" />
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onNewProject}
              className="px-4 py-2 bg-${primary}-600 hover:bg-${primary}-700 text-white rounded-lg text-sm font-medium"
            >
              New Project
            </button>
            <button
              onClick={onInvoice}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Create Invoice
            </button>
            <div className="relative group">
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <MoreVertical className="w-5 h-5" />
              </button>
              <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button
                  onClick={onEdit}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <Edit className="w-4 h-4" />
                  Edit Client
                </button>
                <button
                  onClick={onDelete}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Client
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm">Total Billed</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              \${client.totalBilled.toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
              <DollarSign className="w-4 h-4 text-yellow-500" />
              <span className="text-sm">Outstanding</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">
              \${client.outstandingBalance.toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
              <Building2 className="w-4 h-4" />
              <span className="text-sm">Active Projects</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{client.activeProjects}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Total Hours</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{client.totalHours.toLocaleString()}</p>
          </div>
        </div>

        {/* Address & Since */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {client.address}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            Client since {new Date(client.clientSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </span>
        </div>
      </div>
    </div>
  );
}`;
}

export function generateProjectFiltersConsulting(options: ProfessionalOptions = {}): string {
  const primary = options.colors?.primary || 'indigo';
  return `import React, { useState } from 'react';
import { Search, Filter, ChevronDown, Calendar, X, FolderOpen, User } from 'lucide-react';

interface Client {
  id: string;
  name: string;
}

interface FilterState {
  search: string;
  status: string[];
  clientId: string;
  dateRange: { start: string; end: string } | null;
  sortBy: string;
}

interface ProjectFiltersConsultingProps {
  clients: Client[];
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  projectCount?: number;
}

export function ProjectFiltersConsulting({
  clients,
  filters,
  onChange,
  projectCount
}: ProjectFiltersConsultingProps) {
  const [showFilters, setShowFilters] = useState(false);

  const statuses = ['Active', 'Completed', 'On Hold', 'Planning', 'Cancelled'];
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'name', label: 'Name A-Z' },
    { value: 'deadline', label: 'Deadline' },
    { value: 'budget', label: 'Budget (High-Low)' },
  ];

  const toggleStatus = (status: string) => {
    const newStatuses = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    onChange({ ...filters, status: newStatuses });
  };

  const hasActiveFilters = filters.status.length > 0 || filters.clientId || filters.dateRange;

  const clearFilters = () => {
    onChange({
      search: filters.search,
      status: [],
      clientId: '',
      dateRange: null,
      sortBy: 'newest',
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
      {/* Search and main controls */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Search projects..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-${primary}-500 focus:border-transparent"
          />
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={\`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors \${
            hasActiveFilters
              ? 'border-${primary}-500 bg-${primary}-50 text-${primary}-700 dark:bg-${primary}-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
          }\`}
        >
          <Filter className="w-5 h-5" />
          Filters
          {hasActiveFilters && (
            <span className="w-5 h-5 bg-${primary}-600 text-white rounded-full text-xs flex items-center justify-center">
              {filters.status.length + (filters.clientId ? 1 : 0) + (filters.dateRange ? 1 : 0)}
            </span>
          )}
        </button>

        {/* Sort */}
        <select
          value={filters.sortBy}
          onChange={(e) => onChange({ ...filters, sortBy: e.target.value })}
          className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-${primary}-500"
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      {/* Extended filters */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                {statuses.map(status => (
                  <button
                    key={status}
                    onClick={() => toggleStatus(status)}
                    className={\`px-3 py-1.5 rounded-lg text-sm transition-colors \${
                      filters.status.includes(status)
                        ? 'bg-${primary}-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }\`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Client */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Client
              </label>
              <select
                value={filters.clientId}
                onChange={(e) => onChange({ ...filters, clientId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
              >
                <option value="">All Clients</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>

            {/* Date range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date Range
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={filters.dateRange?.start || ''}
                  onChange={(e) => onChange({
                    ...filters,
                    dateRange: { start: e.target.value, end: filters.dateRange?.end || '' }
                  })}
                  className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
                />
                <input
                  type="date"
                  value={filters.dateRange?.end || ''}
                  onChange={(e) => onChange({
                    ...filters,
                    dateRange: { start: filters.dateRange?.start || '', end: e.target.value }
                  })}
                  className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Active filters & clear */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="flex flex-wrap gap-2">
                {filters.status.map(status => (
                  <span
                    key={status}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-${primary}-100 dark:bg-${primary}-900/30 text-${primary}-700 dark:text-${primary}-400 rounded-full text-sm"
                  >
                    {status}
                    <button onClick={() => toggleStatus(status)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {filters.clientId && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-${primary}-100 dark:bg-${primary}-900/30 text-${primary}-700 dark:text-${primary}-400 rounded-full text-sm">
                    {clients.find(c => c.id === filters.clientId)?.name}
                    <button onClick={() => onChange({ ...filters, clientId: '' })}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results count */}
      {projectCount !== undefined && (
        <p className="mt-4 text-sm text-gray-500">
          Showing {projectCount} project{projectCount !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}`;
}

export function generateProjectTimelineConsulting(options: ProfessionalOptions = {}): string {
  const primary = options.colors?.primary || 'indigo';
  return `import React from 'react';
import { CheckCircle, Clock, AlertCircle, Circle, FileText, MessageCircle, DollarSign, Users, Calendar } from 'lucide-react';

interface TimelineEvent {
  id: string;
  type: 'milestone' | 'task' | 'meeting' | 'invoice' | 'comment' | 'payment';
  title: string;
  description?: string;
  date: string;
  status?: 'completed' | 'pending' | 'overdue';
  user?: { name: string; avatar?: string };
  amount?: number;
}

interface ProjectTimelineConsultingProps {
  events: TimelineEvent[];
  projectStartDate: string;
  projectEndDate?: string;
}

export function ProjectTimelineConsulting({
  events,
  projectStartDate,
  projectEndDate
}: ProjectTimelineConsultingProps) {
  const getEventIcon = (type: TimelineEvent['type'], status?: string) => {
    const iconClass = \`w-5 h-5 \${
      status === 'completed' ? 'text-green-500' :
      status === 'overdue' ? 'text-red-500' :
      'text-${primary}-600'
    }\`;

    switch (type) {
      case 'milestone':
        return status === 'completed'
          ? <CheckCircle className={iconClass} />
          : <Circle className={iconClass} />;
      case 'task':
        return status === 'completed'
          ? <CheckCircle className={iconClass} />
          : status === 'overdue'
          ? <AlertCircle className={iconClass} />
          : <Clock className={iconClass} />;
      case 'meeting':
        return <Users className={iconClass} />;
      case 'invoice':
        return <FileText className={iconClass} />;
      case 'comment':
        return <MessageCircle className={iconClass} />;
      case 'payment':
        return <DollarSign className="w-5 h-5 text-green-500" />;
      default:
        return <Circle className={iconClass} />;
    }
  };

  const getEventBg = (type: TimelineEvent['type'], status?: string) => {
    if (status === 'completed') return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    if (status === 'overdue') return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    if (type === 'payment') return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-${primary}-600" />
        Project Timeline
      </h3>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

        {/* Project start */}
        <div className="relative flex items-center gap-4 mb-6">
          <div className="w-8 h-8 rounded-full bg-${primary}-600 flex items-center justify-center z-10">
            <Circle className="w-4 h-4 text-white" fill="currentColor" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Project Started</p>
            <p className="text-sm text-gray-500">{formatDate(projectStartDate)}</p>
          </div>
        </div>

        {/* Events */}
        <div className="space-y-4 ml-1">
          {events.map((event) => (
            <div key={event.id} className="relative flex gap-4">
              {/* Icon */}
              <div className={\`w-6 h-6 rounded-full flex items-center justify-center z-10 \${
                event.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30' :
                event.status === 'overdue' ? 'bg-red-100 dark:bg-red-900/30' :
                'bg-${primary}-100 dark:bg-${primary}-900/30'
              }\`}>
                {getEventIcon(event.type, event.status)}
              </div>

              {/* Content */}
              <div className={\`flex-1 p-4 rounded-lg border \${getEventBg(event.type, event.status)}\`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{event.title}</p>
                    {event.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{event.description}</p>
                    )}
                    {event.amount !== undefined && (
                      <p className="text-lg font-bold text-green-600 mt-2">\${event.amount.toLocaleString()}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{formatDate(event.date)}</p>
                    {event.user && (
                      <div className="flex items-center gap-2 mt-2 justify-end">
                        {event.user.avatar ? (
                          <img src={event.user.avatar} alt="" className="w-6 h-6 rounded-full" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <span className="text-xs font-medium">{event.user.name[0]}</span>
                          </div>
                        )}
                        <span className="text-sm text-gray-500">{event.user.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Project end (if completed) */}
        {projectEndDate && (
          <div className="relative flex items-center gap-4 mt-6">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center z-10">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Project Completed</p>
              <p className="text-sm text-gray-500">{formatDate(projectEndDate)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}`;
}

export function generateRevenueReportConsulting(options: ProfessionalOptions = {}): string {
  const primary = options.colors?.primary || 'indigo';
  return `import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar, Download, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface RevenueData {
  period: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface ClientRevenue {
  clientId: string;
  clientName: string;
  revenue: number;
  percentage: number;
}

interface RevenueReportConsultingProps {
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  revenueChange: number;
  expenseChange: number;
  profitChange: number;
  monthlyData: RevenueData[];
  topClients: ClientRevenue[];
  period: string;
  onExport?: () => void;
}

export function RevenueReportConsulting({
  totalRevenue,
  totalExpenses,
  profit,
  revenueChange,
  expenseChange,
  profitChange,
  monthlyData,
  topClients,
  period,
  onExport
}: RevenueReportConsultingProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUpRight className="w-4 h-4 text-green-500" />;
    if (change < 0) return <ArrowDownRight className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getChangeColor = (change: number, isExpense = false) => {
    if (isExpense) {
      // For expenses, down is good
      if (change > 0) return 'text-red-500';
      if (change < 0) return 'text-green-500';
    } else {
      if (change > 0) return 'text-green-500';
      if (change < 0) return 'text-red-500';
    }
    return 'text-gray-500';
  };

  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Revenue Report</h2>
          <p className="text-gray-500 flex items-center gap-1 mt-1">
            <Calendar className="w-4 h-4" />
            {period}
          </p>
        </div>
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500">Total Revenue</span>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalRevenue)}</p>
          <div className={\`flex items-center gap-1 mt-2 text-sm \${getChangeColor(revenueChange)}\`}>
            {getChangeIcon(revenueChange)}
            {Math.abs(revenueChange).toFixed(1)}% vs last period
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500">Total Expenses</span>
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalExpenses)}</p>
          <div className={\`flex items-center gap-1 mt-2 text-sm \${getChangeColor(expenseChange, true)}\`}>
            {getChangeIcon(expenseChange)}
            {Math.abs(expenseChange).toFixed(1)}% vs last period
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500">Net Profit</span>
            <div className={\`w-10 h-10 rounded-lg flex items-center justify-center \${
              profit >= 0
                ? 'bg-${primary}-100 dark:bg-${primary}-900/30'
                : 'bg-red-100 dark:bg-red-900/30'
            }\`}>
              <TrendingUp className={\`w-5 h-5 \${profit >= 0 ? 'text-${primary}-600' : 'text-red-600'}\`} />
            </div>
          </div>
          <p className={\`text-2xl font-bold \${profit >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-600'}\`}>
            {formatCurrency(profit)}
          </p>
          <div className={\`flex items-center gap-1 mt-2 text-sm \${getChangeColor(profitChange)}\`}>
            {getChangeIcon(profitChange)}
            {Math.abs(profitChange).toFixed(1)}% vs last period
          </div>
        </div>
      </div>

      {/* Monthly chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Monthly Revenue</h3>
        <div className="space-y-3">
          {monthlyData.map((month) => (
            <div key={month.period} className="flex items-center gap-4">
              <span className="w-12 text-sm text-gray-500">{month.period}</span>
              <div className="flex-1 h-8 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-${primary}-500 to-${primary}-600 rounded-full"
                  style={{ width: \`\${(month.revenue / maxRevenue) * 100}%\` }}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {formatCurrency(month.revenue)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top clients */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Revenue by Client</h3>
        <div className="space-y-4">
          {topClients.map((client, index) => (
            <div key={client.clientId} className="flex items-center gap-4">
              <span className={\`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold \${
                index === 0 ? 'bg-yellow-100 text-yellow-700' :
                index === 1 ? 'bg-gray-200 text-gray-700' :
                index === 2 ? 'bg-orange-100 text-orange-700' :
                'bg-gray-100 text-gray-600'
              }\`}>
                {index + 1}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900 dark:text-white">{client.clientName}</span>
                  <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(client.revenue)}</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-${primary}-500 rounded-full"
                    style={{ width: \`\${client.percentage}%\` }}
                  />
                </div>
              </div>
              <span className="text-sm text-gray-500 w-12 text-right">{client.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}`;
}
