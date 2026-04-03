/**
 * Client/Customer Profile Component Generators
 * Includes various industry-specific client profile components
 */

export interface ClientProfileOptions {
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
}

export function generateClientProfileFreelance(options: ClientProfileOptions = {}): string {
  const primary = options.colors?.primary || 'indigo';
  return `import React from 'react';
import { Building2, Mail, Phone, Globe, MapPin, Calendar, DollarSign, FileText, MessageCircle } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  status: 'active' | 'completed' | 'pending';
  budget: number;
  deadline: string;
}

interface Client {
  id: string;
  name: string;
  company?: string;
  logo?: string;
  email: string;
  phone?: string;
  website?: string;
  address?: string;
  totalProjects: number;
  totalRevenue: number;
  outstandingBalance: number;
  recentProjects: Project[];
  memberSince: string;
  notes?: string;
}

interface ClientProfileFreelanceProps {
  client: Client;
  onEdit?: () => void;
  onMessage?: () => void;
  onNewProject?: () => void;
  onInvoice?: () => void;
}

export function ClientProfileFreelance({
  client,
  onEdit,
  onMessage,
  onNewProject,
  onInvoice
}: ClientProfileFreelanceProps) {
  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'completed': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-${primary}-600 to-${primary}-700 px-6 py-8 text-white">
        <div className="flex items-start gap-4">
          {client.logo ? (
            <img src={client.logo} alt={client.name} className="w-16 h-16 rounded-xl bg-white p-1" />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center">
              <Building2 className="w-8 h-8" />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{client.name}</h1>
            {client.company && <p className="text-${primary}-100">{client.company}</p>}
            <p className="text-sm text-${primary}-200 mt-1">
              Client since {new Date(client.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onMessage}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-gray-700 border-b border-gray-100 dark:border-gray-700">
        <div className="p-4 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{client.totalProjects}</p>
          <p className="text-sm text-gray-500">Projects</p>
        </div>
        <div className="p-4 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            \${client.totalRevenue.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">Total Revenue</p>
        </div>
        <div className="p-4 text-center">
          <p className={\`text-2xl font-bold \${client.outstandingBalance > 0 ? 'text-orange-600' : 'text-green-600'}\`}>
            \${client.outstandingBalance.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">Outstanding</p>
        </div>
      </div>

      {/* Contact Info */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h3>
        <div className="space-y-3">
          <a href={\`mailto:\${client.email}\`} className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-${primary}-600">
            <Mail className="w-5 h-5" />
            {client.email}
          </a>
          {client.phone && (
            <a href={\`tel:\${client.phone}\`} className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-${primary}-600">
              <Phone className="w-5 h-5" />
              {client.phone}
            </a>
          )}
          {client.website && (
            <a href={client.website} target="_blank" rel="noopener" className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-${primary}-600">
              <Globe className="w-5 h-5" />
              {client.website}
            </a>
          )}
          {client.address && (
            <p className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
              <MapPin className="w-5 h-5" />
              {client.address}
            </p>
          )}
        </div>
      </div>

      {/* Recent Projects */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Recent Projects</h3>
          <button onClick={onNewProject} className="text-sm text-${primary}-600 hover:text-${primary}-700">
            + New Project
          </button>
        </div>
        <div className="space-y-3">
          {client.recentProjects.map(project => (
            <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{project.name}</p>
                <p className="text-sm text-gray-500">Due: {new Date(project.deadline).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <span className={\`px-2 py-1 rounded-full text-xs font-medium capitalize \${getStatusColor(project.status)}\`}>
                  {project.status}
                </span>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">\${project.budget.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      {client.notes && (
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Notes</h3>
          <p className="text-gray-600 dark:text-gray-400">{client.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="p-6 flex gap-3">
        <button
          onClick={onNewProject}
          className="flex-1 px-4 py-2 bg-${primary}-600 hover:bg-${primary}-700 text-white rounded-lg font-medium"
        >
          New Project
        </button>
        <button
          onClick={onInvoice}
          className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Create Invoice
        </button>
      </div>
    </div>
  );
}`;
}

export function generateClientProfileCatering(options: ClientProfileOptions = {}): string {
  const primary = options.colors?.primary || 'indigo';
  return `import React from 'react';
import { User, Mail, Phone, MapPin, Calendar, UtensilsCrossed, Star, History, AlertCircle, MessageCircle } from 'lucide-react';

interface Event {
  id: string;
  name: string;
  date: string;
  guestCount: number;
  total: number;
  status: 'upcoming' | 'completed' | 'cancelled';
}

interface Client {
  id: string;
  name: string;
  avatar?: string;
  email: string;
  phone: string;
  address?: string;
  eventCount: number;
  totalSpent: number;
  dietaryRestrictions?: string[];
  preferredCuisines?: string[];
  averageRating: number;
  upcomingEvents: Event[];
  memberSince: string;
  notes?: string;
}

interface ClientProfileCateringProps {
  client: Client;
  onBook?: () => void;
  onMessage?: () => void;
  onViewHistory?: () => void;
}

export function ClientProfileCatering({
  client,
  onBook,
  onMessage,
  onViewHistory
}: ClientProfileCateringProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-start gap-4">
          {client.avatar ? (
            <img src={client.avatar} alt={client.name} className="w-16 h-16 rounded-full" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-${primary}-100 dark:bg-${primary}-900/30 flex items-center justify-center">
              <span className="text-2xl font-bold text-${primary}-600">{client.name[0]}</span>
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{client.name}</h1>
            <div className="flex items-center gap-1 mt-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={\`w-4 h-4 \${i < Math.floor(client.averageRating) ? 'text-yellow-400' : 'text-gray-300'}\`}
                  fill={i < Math.floor(client.averageRating) ? 'currentColor' : 'none'}
                />
              ))}
              <span className="text-sm text-gray-500 ml-1">{client.averageRating.toFixed(1)}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Client since {new Date(client.memberSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onMessage}
              className="p-2 text-gray-400 hover:text-${primary}-600 hover:bg-${primary}-50 dark:hover:bg-${primary}-900/20 rounded-lg"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 divide-x divide-gray-100 dark:divide-gray-700 border-b border-gray-100 dark:border-gray-700">
        <div className="p-4 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{client.eventCount}</p>
          <p className="text-sm text-gray-500">Events</p>
        </div>
        <div className="p-4 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">\${client.totalSpent.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Total Spent</p>
        </div>
      </div>

      {/* Contact Info */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700 space-y-3">
        <a href={\`mailto:\${client.email}\`} className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-${primary}-600">
          <Mail className="w-5 h-5 text-gray-400" />
          {client.email}
        </a>
        <a href={\`tel:\${client.phone}\`} className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-${primary}-600">
          <Phone className="w-5 h-5 text-gray-400" />
          {client.phone}
        </a>
        {client.address && (
          <p className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
            <MapPin className="w-5 h-5 text-gray-400" />
            {client.address}
          </p>
        )}
      </div>

      {/* Preferences */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <UtensilsCrossed className="w-5 h-5 text-${primary}-600" />
          Preferences
        </h3>

        {client.dietaryRestrictions && client.dietaryRestrictions.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              Dietary Restrictions
            </p>
            <div className="flex flex-wrap gap-2">
              {client.dietaryRestrictions.map((restriction, i) => (
                <span key={i} className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-sm">
                  {restriction}
                </span>
              ))}
            </div>
          </div>
        )}

        {client.preferredCuisines && client.preferredCuisines.length > 0 && (
          <div>
            <p className="text-sm text-gray-500 mb-2">Preferred Cuisines</p>
            <div className="flex flex-wrap gap-2">
              {client.preferredCuisines.map((cuisine, i) => (
                <span key={i} className="px-3 py-1 bg-${primary}-100 dark:bg-${primary}-900/30 text-${primary}-700 dark:text-${primary}-400 rounded-full text-sm">
                  {cuisine}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Upcoming Events */}
      {client.upcomingEvents.length > 0 && (
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-${primary}-600" />
            Upcoming Events
          </h3>
          <div className="space-y-3">
            {client.upcomingEvents.map(event => (
              <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{event.name}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(event.date).toLocaleDateString()} - {event.guestCount} guests
                  </p>
                </div>
                <p className="font-semibold text-gray-900 dark:text-white">\${event.total.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {client.notes && (
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Notes</h3>
          <p className="text-gray-600 dark:text-gray-400">{client.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="p-6 flex gap-3">
        <button
          onClick={onBook}
          className="flex-1 px-4 py-2 bg-${primary}-600 hover:bg-${primary}-700 text-white rounded-lg font-medium"
        >
          Book Event
        </button>
        <button
          onClick={onViewHistory}
          className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <History className="w-4 h-4" />
          History
        </button>
      </div>
    </div>
  );
}`;
}

export function generateClientProfileSecurity(options: ClientProfileOptions = {}): string {
  const primary = options.colors?.primary || 'indigo';
  return `import React from 'react';
import { Building2, Mail, Phone, MapPin, Shield, FileText, AlertTriangle, Clock, Users, Calendar } from 'lucide-react';

interface Contract {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  value: number;
  status: 'active' | 'expiring' | 'expired';
}

interface Incident {
  id: string;
  type: string;
  date: string;
  severity: 'low' | 'medium' | 'high';
  status: 'resolved' | 'open';
}

interface Client {
  id: string;
  name: string;
  logo?: string;
  industry: string;
  email: string;
  phone: string;
  address: string;
  primaryContact: string;
  assignedGuards: number;
  totalSites: number;
  activeContracts: Contract[];
  recentIncidents: Incident[];
  memberSince: string;
}

interface ClientProfileSecurityProps {
  client: Client;
  onEdit?: () => void;
  onNewContract?: () => void;
  onViewReports?: () => void;
}

export function ClientProfileSecurity({
  client,
  onEdit,
  onNewContract,
  onViewReports
}: ClientProfileSecurityProps) {
  const getContractStatusColor = (status: Contract['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'expiring': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'expired': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getSeverityColor = (severity: Incident['severity']) => {
    switch (severity) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-8 text-white">
        <div className="flex items-start gap-4">
          {client.logo ? (
            <img src={client.logo} alt={client.name} className="w-16 h-16 rounded-xl bg-white p-1" />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center">
              <Building2 className="w-8 h-8" />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{client.name}</h1>
            <p className="text-gray-300">{client.industry}</p>
            <p className="text-sm text-gray-400 mt-1">
              <Shield className="w-4 h-4 inline mr-1" />
              Protected since {new Date(client.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-gray-700 border-b border-gray-100 dark:border-gray-700">
        <div className="p-4 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{client.totalSites}</p>
          <p className="text-sm text-gray-500">Sites</p>
        </div>
        <div className="p-4 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{client.assignedGuards}</p>
          <p className="text-sm text-gray-500">Guards Assigned</p>
        </div>
        <div className="p-4 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{client.activeContracts.length}</p>
          <p className="text-sm text-gray-500">Active Contracts</p>
        </div>
      </div>

      {/* Contact Info */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h3>
        <div className="space-y-3">
          <p className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
            <Users className="w-5 h-5 text-gray-400" />
            Primary: {client.primaryContact}
          </p>
          <a href={\`mailto:\${client.email}\`} className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-${primary}-600">
            <Mail className="w-5 h-5 text-gray-400" />
            {client.email}
          </a>
          <a href={\`tel:\${client.phone}\`} className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-${primary}-600">
            <Phone className="w-5 h-5 text-gray-400" />
            {client.phone}
          </a>
          <p className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
            <MapPin className="w-5 h-5 text-gray-400" />
            {client.address}
          </p>
        </div>
      </div>

      {/* Active Contracts */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-${primary}-600" />
            Contracts
          </h3>
          <button onClick={onNewContract} className="text-sm text-${primary}-600 hover:text-${primary}-700">
            + New Contract
          </button>
        </div>
        <div className="space-y-3">
          {client.activeContracts.map(contract => (
            <div key={contract.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{contract.type}</p>
                <p className="text-sm text-gray-500">
                  {new Date(contract.startDate).toLocaleDateString()} - {new Date(contract.endDate).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <span className={\`px-2 py-1 rounded-full text-xs font-medium capitalize \${getContractStatusColor(contract.status)}\`}>
                  {contract.status}
                </span>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">\${contract.value.toLocaleString()}/mo</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Incidents */}
      {client.recentIncidents.length > 0 && (
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Recent Incidents
          </h3>
          <div className="space-y-2">
            {client.recentIncidents.map(incident => (
              <div key={incident.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className={\`w-5 h-5 \${getSeverityColor(incident.severity)}\`} />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{incident.type}</p>
                    <p className="text-sm text-gray-500">{new Date(incident.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={\`px-2 py-1 rounded-full text-xs font-medium \${
                  incident.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }\`}>
                  {incident.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="p-6 flex gap-3">
        <button
          onClick={onNewContract}
          className="flex-1 px-4 py-2 bg-${primary}-600 hover:bg-${primary}-700 text-white rounded-lg font-medium"
        >
          New Contract
        </button>
        <button
          onClick={onViewReports}
          className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          View Reports
        </button>
      </div>
    </div>
  );
}`;
}

export function generateClientProfileTravel(options: ClientProfileOptions = {}): string {
  const primary = options.colors?.primary || 'indigo';
  return `import React from 'react';
import { User, Mail, Phone, MapPin, Plane, Hotel, Calendar, Star, CreditCard, Heart, MessageCircle } from 'lucide-react';

interface Trip {
  id: string;
  destination: string;
  dates: string;
  type: 'flight' | 'hotel' | 'package';
  status: 'upcoming' | 'completed' | 'cancelled';
  amount: number;
}

interface Client {
  id: string;
  name: string;
  avatar?: string;
  email: string;
  phone: string;
  passportNumber?: string;
  preferredAirlines?: string[];
  preferredHotels?: string[];
  loyaltyPrograms?: { program: string; number: string }[];
  totalTrips: number;
  totalSpent: number;
  upcomingTrips: Trip[];
  memberSince: string;
  preferences?: {
    seatPreference?: string;
    mealPreference?: string;
    roomPreference?: string;
  };
}

interface ClientProfileTravelProps {
  client: Client;
  onBook?: () => void;
  onMessage?: () => void;
  onViewHistory?: () => void;
}

export function ClientProfileTravel({
  client,
  onBook,
  onMessage,
  onViewHistory
}: ClientProfileTravelProps) {
  const getTripIcon = (type: Trip['type']) => {
    switch (type) {
      case 'flight': return <Plane className="w-5 h-5 text-blue-500" />;
      case 'hotel': return <Hotel className="w-5 h-5 text-purple-500" />;
      default: return <Calendar className="w-5 h-5 text-green-500" />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="relative">
        <div className="h-32 bg-gradient-to-r from-${primary}-600 to-purple-600" />
        <div className="absolute -bottom-12 left-6">
          {client.avatar ? (
            <img src={client.avatar} alt={client.name} className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800" />
          ) : (
            <div className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 bg-${primary}-100 dark:bg-${primary}-900/30 flex items-center justify-center">
              <span className="text-3xl font-bold text-${primary}-600">{client.name[0]}</span>
            </div>
          )}
        </div>
        <div className="absolute top-4 right-4">
          <button
            onClick={onMessage}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="pt-14 px-6 pb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{client.name}</h1>
        <p className="text-sm text-gray-500 mt-1">
          Member since {new Date(client.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{client.totalTrips}</p>
            <p className="text-sm text-gray-500">Total Trips</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">\${client.totalSpent.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Total Spent</p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-6 space-y-3">
          <a href={\`mailto:\${client.email}\`} className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-${primary}-600">
            <Mail className="w-5 h-5 text-gray-400" />
            {client.email}
          </a>
          <a href={\`tel:\${client.phone}\`} className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-${primary}-600">
            <Phone className="w-5 h-5 text-gray-400" />
            {client.phone}
          </a>
          {client.passportNumber && (
            <p className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
              <CreditCard className="w-5 h-5 text-gray-400" />
              Passport: {client.passportNumber}
            </p>
          )}
        </div>

        {/* Preferences */}
        {client.preferences && (
          <div className="mt-6 p-4 bg-${primary}-50 dark:bg-${primary}-900/20 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Heart className="w-5 h-5 text-${primary}-600" />
              Preferences
            </h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              {client.preferences.seatPreference && (
                <div>
                  <p className="text-gray-500">Seat</p>
                  <p className="font-medium text-gray-900 dark:text-white">{client.preferences.seatPreference}</p>
                </div>
              )}
              {client.preferences.mealPreference && (
                <div>
                  <p className="text-gray-500">Meal</p>
                  <p className="font-medium text-gray-900 dark:text-white">{client.preferences.mealPreference}</p>
                </div>
              )}
              {client.preferences.roomPreference && (
                <div>
                  <p className="text-gray-500">Room</p>
                  <p className="font-medium text-gray-900 dark:text-white">{client.preferences.roomPreference}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loyalty Programs */}
        {client.loyaltyPrograms && client.loyaltyPrograms.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Loyalty Programs
            </h3>
            <div className="space-y-2">
              {client.loyaltyPrograms.map((program, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="font-medium text-gray-900 dark:text-white">{program.program}</span>
                  <span className="text-gray-500">{program.number}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Trips */}
        {client.upcomingTrips.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Upcoming Trips</h3>
            <div className="space-y-3">
              {client.upcomingTrips.map(trip => (
                <div key={trip.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getTripIcon(trip.type)}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{trip.destination}</p>
                      <p className="text-sm text-gray-500">{trip.dates}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">\${trip.amount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onBook}
            className="flex-1 px-4 py-2 bg-${primary}-600 hover:bg-${primary}-700 text-white rounded-lg font-medium"
          >
            Book Trip
          </button>
          <button
            onClick={onViewHistory}
            className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Trip History
          </button>
        </div>
      </div>
    </div>
  );
}`;
}

export function generateClientProfileRecruitment(options: ClientProfileOptions = {}): string {
  const primary = options.colors?.primary || 'indigo';
  return `import React from 'react';
import { Building2, Mail, Phone, Globe, MapPin, Users, Briefcase, TrendingUp, Calendar, FileText } from 'lucide-react';

interface Position {
  id: string;
  title: string;
  department: string;
  status: 'open' | 'filled' | 'on-hold';
  candidates: number;
  posted: string;
}

interface Client {
  id: string;
  name: string;
  logo?: string;
  industry: string;
  size: string;
  website?: string;
  email: string;
  phone: string;
  address: string;
  primaryContact: string;
  openPositions: number;
  totalPlacements: number;
  averageFee: number;
  activePositions: Position[];
  memberSince: string;
}

interface ClientProfileRecruitmentProps {
  client: Client;
  onNewPosition?: () => void;
  onViewPlacements?: () => void;
  onContact?: () => void;
}

export function ClientProfileRecruitment({
  client,
  onNewPosition,
  onViewPlacements,
  onContact
}: ClientProfileRecruitmentProps) {
  const getStatusColor = (status: Position['status']) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'filled': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'on-hold': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-start gap-4">
          {client.logo ? (
            <img src={client.logo} alt={client.name} className="w-16 h-16 rounded-xl object-contain bg-gray-50 dark:bg-gray-700 p-2" />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-${primary}-100 dark:bg-${primary}-900/30 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-${primary}-600" />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{client.name}</h1>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-gray-600 dark:text-gray-400">{client.industry}</span>
              <span className="flex items-center gap-1 text-gray-500 text-sm">
                <Users className="w-4 h-4" />
                {client.size}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Client since {new Date(client.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-gray-700 border-b border-gray-100 dark:border-gray-700">
        <div className="p-4 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{client.openPositions}</p>
          <p className="text-sm text-gray-500">Open Positions</p>
        </div>
        <div className="p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{client.totalPlacements}</p>
          <p className="text-sm text-gray-500">Placements</p>
        </div>
        <div className="p-4 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">\${client.averageFee.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Avg. Fee</p>
        </div>
      </div>

      {/* Contact Info */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h3>
        <div className="space-y-3">
          <p className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
            <Users className="w-5 h-5 text-gray-400" />
            {client.primaryContact}
          </p>
          <a href={\`mailto:\${client.email}\`} className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-${primary}-600">
            <Mail className="w-5 h-5 text-gray-400" />
            {client.email}
          </a>
          <a href={\`tel:\${client.phone}\`} className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-${primary}-600">
            <Phone className="w-5 h-5 text-gray-400" />
            {client.phone}
          </a>
          {client.website && (
            <a href={client.website} target="_blank" rel="noopener" className="flex items-center gap-3 text-gray-600 dark:text-gray-400 hover:text-${primary}-600">
              <Globe className="w-5 h-5 text-gray-400" />
              {client.website}
            </a>
          )}
          <p className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
            <MapPin className="w-5 h-5 text-gray-400" />
            {client.address}
          </p>
        </div>
      </div>

      {/* Active Positions */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-${primary}-600" />
            Active Positions
          </h3>
          <button onClick={onNewPosition} className="text-sm text-${primary}-600 hover:text-${primary}-700">
            + New Position
          </button>
        </div>
        <div className="space-y-3">
          {client.activePositions.map(position => (
            <div key={position.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{position.title}</p>
                <p className="text-sm text-gray-500">{position.department}</p>
              </div>
              <div className="text-right">
                <span className={\`px-2 py-1 rounded-full text-xs font-medium capitalize \${getStatusColor(position.status)}\`}>
                  {position.status}
                </span>
                <p className="text-sm text-gray-500 mt-1">{position.candidates} candidates</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 flex gap-3">
        <button
          onClick={onNewPosition}
          className="flex-1 px-4 py-2 bg-${primary}-600 hover:bg-${primary}-700 text-white rounded-lg font-medium"
        >
          Add Position
        </button>
        <button
          onClick={onViewPlacements}
          className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          View Placements
        </button>
      </div>
    </div>
  );
}`;
}
