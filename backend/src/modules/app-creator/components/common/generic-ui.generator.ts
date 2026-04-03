/**
 * Generic UI Component Generators
 * Reusable UI components for common patterns
 */

export interface GenericUIOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateFilterForm(options: GenericUIOptions = {}): string {
  const { componentName = 'FilterForm' } = options;

  return `import React from 'react';
import { Search } from 'lucide-react';

interface ${componentName}Props {
  filters?: string[];
}

const ${componentName}: React.FC<${componentName}Props> = ({ filters = ['category', 'price_range'] }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-fit">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Filters</h3>
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2 border rounded-lg" />
        </div>
        {filters.includes('category') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
            <select className="w-full px-3 py-2 border rounded-lg"><option value="">All Categories</option></select>
          </div>
        )}
        {filters.includes('price_range') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price Range</label>
            <div className="flex gap-2">
              <input type="number" placeholder="Min" className="w-1/2 px-3 py-2 border rounded-lg" />
              <input type="number" placeholder="Max" className="w-1/2 px-3 py-2 border rounded-lg" />
            </div>
          </div>
        )}
        <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Apply Filters</button>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateDetailView(options: GenericUIOptions = {}): string {
  const { componentName = 'DetailView', endpoint = '' } = options;
  const entity = endpoint || 'item';

  return `import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

const pluralize = (word: string): string => {
  if (word.endsWith('y') && !['ay', 'ey', 'iy', 'oy', 'uy'].some(suffix => word.endsWith(suffix))) return word.slice(0, -1) + 'ies';
  if (word.endsWith('s') || word.endsWith('x') || word.endsWith('z') || word.endsWith('ch') || word.endsWith('sh')) return word + 'es';
  return word + 's';
};

interface ${componentName}Props {
  entity?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ entity = '${entity}' }) => {
  const { id } = useParams<{ id: string }>();
  const endpoint = pluralize(entity);

  const { data, isLoading } = useQuery({
    queryKey: [endpoint, id],
    queryFn: async () => { const r = await api.get<any>('/' + endpoint + '/' + id); return r?.data || r; },
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;
  if (!data) return <div className="text-center py-12">Not found</div>;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 capitalize">{entity} Details</h2>
      <dl className="grid grid-cols-2 gap-4">
        {Object.entries(data).map(([key, value]) => (
          <div key={key}>
            <dt className="text-sm text-gray-500 capitalize">{key.replace(/_/g, ' ')}</dt>
            <dd className="text-gray-900 dark:text-white font-medium">{typeof value === 'object' ? JSON.stringify(value) : String(value ?? '-')}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateDataList(options: GenericUIOptions = {}): string {
  const { componentName = 'DataList', endpoint = '/items' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['${endpoint.replace('/', '')}'],
    queryFn: async () => { const r = await api.get<any>('${endpoint}'); return Array.isArray(r) ? r : (r?.data || []); },
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {data?.map((item: any) => (
          <Link key={item.id} to={\`${endpoint}/\${item.id}\`} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">{item.title || item.name}</h4>
              {item.description && <p className="text-sm text-gray-500 line-clamp-1">{item.description}</p>}
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>
        )) || <div className="p-8 text-center text-gray-500">No items found</div>}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateSearchBar(options: GenericUIOptions = {}): string {
  const { componentName = 'SearchBar' } = options;

  return `import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

interface ${componentName}Props {
  placeholder?: string;
  onSearch?: (query: string) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ placeholder = 'Search...', onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(query);
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
      />
      {query && (
        <button type="button" onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
          <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
        </button>
      )}
    </form>
  );
};

export default ${componentName};
`;
}

export function generateCreateForm(options: GenericUIOptions = {}): string {
  const { componentName = 'CreateForm', endpoint = '/items' } = options;

  return `import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Save } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const ${componentName}: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Record<string, string>>({ title: '', description: '' });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('${endpoint}', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${endpoint.replace('/', '')}'] });
      toast.success('Created successfully');
      navigate('${endpoint}');
    },
    onError: () => toast.error('Failed to create'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Create New</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
          <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
          <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg" rows={4} />
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={createMutation.isPending} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
        </button>
      </div>
    </form>
  );
};

export default ${componentName};
`;
}

export function generateEditForm(options: GenericUIOptions = {}): string {
  const { componentName = 'EditForm', endpoint = '/items' } = options;

  return `import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Save } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['${endpoint.replace('/', '')}', id],
    queryFn: async () => { const r = await api.get<any>('${endpoint}/' + id); return r?.data || r; },
  });

  useEffect(() => { if (data) setFormData(data); }, [data]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.put('${endpoint}/' + id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${endpoint.replace('/', '')}'] });
      toast.success('Updated successfully');
      navigate('${endpoint}');
    },
    onError: () => toast.error('Failed to update'),
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;

  return (
    <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate(formData); }} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Edit</h2>
      <div className="space-y-4">
        {Object.entries(formData).filter(([k]) => !['id', 'created_at', 'updated_at'].includes(k)).map(([key, value]) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">{key.replace(/_/g, ' ')}</label>
            <input type="text" value={String(value || '')} onChange={(e) => setFormData({ ...formData, [key]: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={updateMutation.isPending} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
        </button>
      </div>
    </form>
  );
};

export default ${componentName};
`;
}

export function generateContactForm(options: GenericUIOptions = {}): string {
  const { componentName = 'ContactForm', endpoint = '/contact' } = options;

  return `import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Loader2, Send, Mail, User, MessageSquare } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const ${componentName}: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const submitMutation = useMutation({
    mutationFn: (data: any) => api.post('${endpoint}', data),
    onSuccess: () => { toast.success('Message sent!'); setFormData({ name: '', email: '', message: '' }); },
    onError: () => toast.error('Failed to send message'),
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); submitMutation.mutate(formData); }} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Contact Us</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"><User className="w-4 h-4 inline mr-1" /> Name</label>
          <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"><Mail className="w-4 h-4 inline mr-1" /> Email</label>
          <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"><MessageSquare className="w-4 h-4 inline mr-1" /> Message</label>
          <textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="w-full px-3 py-2 border rounded-lg" rows={5} required />
        </div>
      </div>
      <button type="submit" disabled={submitMutation.isPending} className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
        {submitMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send Message
      </button>
    </form>
  );
};

export default ${componentName};
`;
}

export function generateSettingsForm(options: GenericUIOptions = {}): string {
  const { componentName = 'SettingsForm', endpoint = '/settings' } = options;

  return `import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Save, Settings } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const ${componentName}: React.FC = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Record<string, any>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => { const r = await api.get<any>('${endpoint}'); return r?.data || r || {}; },
  });

  useEffect(() => { if (data) setFormData(data); }, [data]);

  const saveMutation = useMutation({
    mutationFn: (data: any) => api.put('${endpoint}', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['settings'] }); toast.success('Settings saved'); },
    onError: () => toast.error('Failed to save settings'),
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;

  return (
    <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(formData); }} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"><Settings className="w-5 h-5" /> Settings</h2>
      <div className="space-y-4">
        {Object.entries(formData).map(([key, value]) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">{key.replace(/_/g, ' ')}</label>
            {typeof value === 'boolean' ? (
              <input type="checkbox" checked={value} onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })} className="w-4 h-4" />
            ) : (
              <input type="text" value={String(value || '')} onChange={(e) => setFormData({ ...formData, [key]: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
            )}
          </div>
        ))}
      </div>
      <button type="submit" disabled={saveMutation.isPending} className="mt-6 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
        {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Settings
      </button>
    </form>
  );
};

export default ${componentName};
`;
}

export function generateProfileView(options: GenericUIOptions = {}): string {
  const { componentName = 'ProfileView', endpoint = '/profile' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, User, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => { const r = await api.get<any>('${endpoint}'); return r?.data || r; },
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;
  if (!profile) return <div className="text-center py-12">Profile not found</div>;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
          {(profile.name || profile.email || '?').charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{profile.name}</h2>
          <p className="text-gray-500">{profile.role || profile.title}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {profile.email && <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"><Mail className="w-5 h-5 text-gray-400" /><div><p className="text-xs text-gray-500">Email</p><p className="text-gray-900 dark:text-white">{profile.email}</p></div></div>}
        {profile.phone && <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"><Phone className="w-5 h-5 text-gray-400" /><div><p className="text-xs text-gray-500">Phone</p><p className="text-gray-900 dark:text-white">{profile.phone}</p></div></div>}
        {profile.location && <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"><MapPin className="w-5 h-5 text-gray-400" /><div><p className="text-xs text-gray-500">Location</p><p className="text-gray-900 dark:text-white">{profile.location}</p></div></div>}
        {profile.joined_at && <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"><Calendar className="w-5 h-5 text-gray-400" /><div><p className="text-xs text-gray-500">Joined</p><p className="text-gray-900 dark:text-white">{new Date(profile.joined_at).toLocaleDateString()}</p></div></div>}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateStatsCards(options: GenericUIOptions = {}): string {
  const { componentName = 'StatsCards', endpoint = '/stats' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, Users, DollarSign, ShoppingCart, Eye } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => { const r = await api.get<any>('${endpoint}'); return r?.data || r || {}; },
  });

  const cards = [
    { label: 'Total Users', value: stats?.users || 0, icon: Users, color: 'blue', change: stats?.users_change },
    { label: 'Revenue', value: '$' + (stats?.revenue || 0).toLocaleString(), icon: DollarSign, color: 'green', change: stats?.revenue_change },
    { label: 'Orders', value: stats?.orders || 0, icon: ShoppingCart, color: 'purple', change: stats?.orders_change },
    { label: 'Views', value: stats?.views || 0, icon: Eye, color: 'orange', change: stats?.views_change },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">{card.label}</span>
            <card.icon className={\`w-5 h-5 text-\${card.color}-500\`} />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</div>
          {card.change !== undefined && (
            <div className={\`flex items-center gap-1 text-sm mt-1 \${card.change >= 0 ? 'text-green-500' : 'text-red-500'}\`}>
              {card.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {Math.abs(card.change)}%
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateCalendarView(options: GenericUIOptions = {}): string {
  const { componentName = 'CalendarView', endpoint = '/events' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: events, isLoading } = useQuery({
    queryKey: ['events', currentDate.getMonth(), currentDate.getFullYear()],
    queryFn: async () => { const r = await api.get<any>('${endpoint}?month=' + (currentDate.getMonth() + 1) + '&year=' + currentDate.getFullYear()); return Array.isArray(r) ? r : (r?.data || []); },
  });

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const getEventsForDay = (day: number) => events?.filter((e: any) => new Date(e.date || e.start_date).getDate() === day) || [];

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><ChevronLeft className="w-5 h-5" /></button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><ChevronRight className="w-5 h-5" /></button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="text-center text-sm font-medium text-gray-500 py-2">{d}</div>)}
        {Array(firstDayOfMonth).fill(null).map((_, i) => <div key={'empty-' + i} />)}
        {days.map(day => {
          const dayEvents = getEventsForDay(day);
          return (
            <div key={day} className="aspect-square p-1 border border-gray-100 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
              <span className="text-sm text-gray-900 dark:text-white">{day}</span>
              {dayEvents.length > 0 && <div className="mt-1 w-2 h-2 bg-blue-500 rounded-full" />}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateBlogDetail(options: GenericUIOptions = {}): string {
  const { componentName = 'BlogDetail', endpoint = '/posts' } = options;

  return `import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Calendar, User, Clock, Tag } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: post, isLoading } = useQuery({
    queryKey: ['post', id],
    queryFn: async () => { const r = await api.get<any>('${endpoint}/' + id); return r?.data || r; },
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;
  if (!post) return <div className="text-center py-12">Post not found</div>;

  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {post.image && <img src={post.image} alt={post.title} className="w-full h-64 object-cover" />}
      <div className="p-6">
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
          {post.author && <span className="flex items-center gap-1"><User className="w-4 h-4" />{post.author}</span>}
          {post.created_at && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(post.created_at).toLocaleDateString()}</span>}
          {post.read_time && <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{post.read_time} min read</span>}
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{post.title}</h1>
        <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
        {post.tags && post.tags.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2 flex-wrap">
            <Tag className="w-4 h-4 text-gray-400" />
            {post.tags.map((tag: string, i: number) => <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">{tag}</span>)}
          </div>
        )}
      </div>
    </article>
  );
};

export default ${componentName};
`;
}

export function generateTrendingTopics(options: GenericUIOptions = {}): string {
  const { componentName = 'TrendingTopics', endpoint = '/trending' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { TrendingUp, Hash, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { data: topics, isLoading } = useQuery({
    queryKey: ['trending'],
    queryFn: async () => { const r = await api.get<any>('${endpoint}'); return Array.isArray(r) ? r : (r?.data || []); },
  });

  if (isLoading) return <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5" /> Trending</h3>
      <div className="space-y-3">
        {topics?.slice(0, 10).map((topic: any, i: number) => (
          <Link key={topic.id || i} to={\`/topics/\${topic.slug || topic.id}\`} className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg">
            <Hash className="w-4 h-4 text-gray-400" />
            <div className="flex-1">
              <span className="text-gray-900 dark:text-white">{topic.name || topic.title}</span>
              {topic.count && <span className="text-xs text-gray-500 ml-2">{topic.count} posts</span>}
            </div>
          </Link>
        )) || <div className="text-gray-500 text-center py-4">No trending topics</div>}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateUserSuggestions(options: GenericUIOptions = {}): string {
  const { componentName = 'UserSuggestions', endpoint = '/users/suggestions' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { UserPlus, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { data: users, isLoading } = useQuery({
    queryKey: ['suggestions'],
    queryFn: async () => { const r = await api.get<any>('${endpoint}'); return Array.isArray(r) ? r : (r?.data || []); },
  });

  if (isLoading) return <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Suggested for You</h3>
      <div className="space-y-3">
        {users?.slice(0, 5).map((user: any) => (
          <div key={user.id} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              {(user.name || user.username || '?').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <Link to={\`/users/\${user.id}\`} className="font-medium text-gray-900 dark:text-white hover:text-blue-600 truncate block">{user.name || user.username}</Link>
              {user.bio && <p className="text-sm text-gray-500 truncate">{user.bio}</p>}
            </div>
            <button className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"><UserPlus className="w-5 h-5" /></button>
          </div>
        )) || <div className="text-gray-500 text-center py-4">No suggestions</div>}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateTeamList(options: GenericUIOptions = {}): string {
  const { componentName = 'TeamList', endpoint = '/team' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Mail, Shield } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { data: members, isLoading } = useQuery({
    queryKey: ['team'],
    queryFn: async () => { const r = await api.get<any>('${endpoint}'); return Array.isArray(r) ? r : (r?.data || []); },
  });

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Team Members</h3>
      <div className="space-y-3">
        {members?.map((member: any) => (
          <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              {(member.name || member.email || '?').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">{member.name || member.email}</p>
              <p className="text-sm text-gray-500 flex items-center gap-1"><Shield className="w-3 h-3" />{member.role || 'Member'}</p>
            </div>
            {member.email && <a href={\`mailto:\${member.email}\`} className="p-2 text-gray-400 hover:text-blue-600"><Mail className="w-4 h-4" /></a>}
          </div>
        )) || <div className="text-gray-500 text-center py-4">No team members</div>}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generatePostDetail(options: GenericUIOptions = {}): string {
  const { componentName = 'PostDetail', endpoint = '/posts' } = options;
  return generateBlogDetail({ componentName, endpoint });
}

export function generateCreatePost(options: GenericUIOptions = {}): string {
  const { componentName = 'CreatePost', endpoint = '/posts' } = options;

  return `import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Send, Image, X } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const ${componentName}: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('${endpoint}', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Post created!');
      navigate('${endpoint}');
    },
    onError: () => toast.error('Failed to create post'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) createMutation.mutate({ title, content });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create Post</h2>
      <div className="space-y-4">
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (optional)" className="w-full px-3 py-2 border rounded-lg" />
        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="What's on your mind?" className="w-full px-3 py-2 border rounded-lg resize-none" rows={5} required />
      </div>
      <div className="flex items-center justify-between mt-4">
        <button type="button" className="p-2 text-gray-400 hover:text-gray-600"><Image className="w-5 h-5" /></button>
        <button type="submit" disabled={!content.trim() || createMutation.isPending} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Post
        </button>
      </div>
    </form>
  );
};

export default ${componentName};
`;
}
