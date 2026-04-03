/**
 * Customer & Staff Profile Component Generators
 *
 * Generates React components for customer details and staff profiles
 */

export interface CustomerStaffOptions {
  title?: string;
  className?: string;
}

/**
 * Generates CustomerDetailHvac component
 */
export function generateCustomerDetailHvac(options: CustomerStaffOptions = {}): string {
  const { className = '' } = options;

  return `import React from 'react';
import { User, Phone, Mail, MapPin, Home, Thermometer, Calendar, Wrench, FileText, Clock } from 'lucide-react';

interface Equipment {
  id: string;
  type: string;
  brand: string;
  model: string;
  installDate: string;
  lastService: string;
  status: 'operational' | 'needs-service' | 'critical';
}

interface ServiceHistory {
  id: string;
  date: string;
  type: string;
  technician: string;
  notes: string;
  cost: number;
}

interface CustomerDetailHvacProps {
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    propertyType: string;
    squareFootage?: number;
    equipment: Equipment[];
    serviceHistory: ServiceHistory[];
    notes?: string;
    preferredContact?: string;
    memberSince?: string;
  };
  onScheduleService?: () => void;
  onEditCustomer?: () => void;
  className?: string;
}

const statusColors = {
  operational: 'bg-green-100 text-green-800',
  'needs-service': 'bg-yellow-100 text-yellow-800',
  critical: 'bg-red-100 text-red-800',
};

export default function CustomerDetailHvac({
  customer,
  onScheduleService,
  onEditCustomer,
  className = '',
}: CustomerDetailHvacProps) {
  return (
    <div className={\`space-y-6 \${className}\`}>
      {/* Customer Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
              <div className="mt-2 space-y-1 text-gray-600">
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {customer.email}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {customer.phone}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {customer.address}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onEditCustomer}
              className="px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Edit
            </button>
            <button
              onClick={onScheduleService}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Schedule Service
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Home className="w-4 h-4" />
              Property
            </div>
            <p className="mt-1 font-medium">{customer.propertyType}</p>
          </div>
          {customer.squareFootage && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">Square Footage</div>
              <p className="mt-1 font-medium">{customer.squareFootage.toLocaleString()} sq ft</p>
            </div>
          )}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Thermometer className="w-4 h-4" />
              Equipment
            </div>
            <p className="mt-1 font-medium">{customer.equipment.length} units</p>
          </div>
          {customer.memberSince && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                Customer Since
              </div>
              <p className="mt-1 font-medium">{new Date(customer.memberSince).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </div>

      {/* Equipment */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-blue-600" />
            HVAC Equipment
          </h2>
        </div>
        <div className="divide-y divide-gray-100">
          {customer.equipment.map((equip) => (
            <div key={equip.id} className="p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-900">{equip.type}</h3>
                  <span className={\`px-2 py-0.5 text-xs rounded-full \${statusColors[equip.status]}\`}>
                    {equip.status.replace('-', ' ')}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{equip.brand} {equip.model}</p>
              </div>
              <div className="text-right text-sm">
                <p className="text-gray-500">Installed: {new Date(equip.installDate).toLocaleDateString()}</p>
                <p className="text-gray-500">Last Service: {new Date(equip.lastService).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Service History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-blue-600" />
            Service History
          </h2>
        </div>
        <div className="divide-y divide-gray-100">
          {customer.serviceHistory.slice(0, 5).map((service) => (
            <div key={service.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{service.type}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(service.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Technician: {service.technician}</p>
                  <p className="text-sm text-gray-500 mt-1">{service.notes}</p>
                </div>
                <span className="font-medium text-gray-900">\${service.cost.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      {customer.notes && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-blue-600" />
            Notes
          </h2>
          <p className="text-gray-600 whitespace-pre-wrap">{customer.notes}</p>
        </div>
      )}
    </div>
  );
}`;
}

/**
 * Generates CustomerDetailPlumbing component
 */
export function generateCustomerDetailPlumbing(options: CustomerStaffOptions = {}): string {
  const { className = '' } = options;

  return `import React from 'react';
import { User, Phone, Mail, MapPin, Home, Droplets, Calendar, Wrench, FileText, AlertTriangle } from 'lucide-react';

interface PlumbingIssue {
  id: string;
  location: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'emergency';
  reportedDate: string;
  status: 'open' | 'scheduled' | 'in-progress' | 'resolved';
}

interface ServiceCall {
  id: string;
  date: string;
  type: string;
  technician: string;
  description: string;
  cost: number;
  parts?: string[];
}

interface CustomerDetailPlumbingProps {
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    propertyType: string;
    propertyAge?: number;
    mainShutoffLocation?: string;
    issues: PlumbingIssue[];
    serviceHistory: ServiceCall[];
    notes?: string;
    preferredTechnician?: string;
  };
  onScheduleService?: () => void;
  onReportIssue?: () => void;
  className?: string;
}

const severityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  emergency: 'bg-red-100 text-red-800',
};

const statusColors = {
  open: 'bg-gray-100 text-gray-800',
  scheduled: 'bg-blue-100 text-blue-800',
  'in-progress': 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-800',
};

export default function CustomerDetailPlumbing({
  customer,
  onScheduleService,
  onReportIssue,
  className = '',
}: CustomerDetailPlumbingProps) {
  const openIssues = customer.issues.filter(i => i.status !== 'resolved');

  return (
    <div className={\`space-y-6 \${className}\`}>
      {/* Customer Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
              <div className="mt-2 space-y-1 text-gray-600">
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {customer.email}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {customer.phone}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {customer.address}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onReportIssue}
              className="px-4 py-2 text-orange-700 border border-orange-200 bg-orange-50 rounded-lg hover:bg-orange-100"
            >
              Report Issue
            </button>
            <button
              onClick={onScheduleService}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Schedule Service
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Home className="w-4 h-4" />
              Property
            </div>
            <p className="mt-1 font-medium">{customer.propertyType}</p>
          </div>
          {customer.propertyAge && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">Property Age</div>
              <p className="mt-1 font-medium">{customer.propertyAge} years</p>
            </div>
          )}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <AlertTriangle className="w-4 h-4" />
              Open Issues
            </div>
            <p className={\`mt-1 font-medium \${openIssues.length > 0 ? 'text-red-600' : 'text-green-600'}\`}>
              {openIssues.length}
            </p>
          </div>
          {customer.mainShutoffLocation && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Droplets className="w-4 h-4" />
                Main Shutoff
              </div>
              <p className="mt-1 font-medium">{customer.mainShutoffLocation}</p>
            </div>
          )}
        </div>
      </div>

      {/* Open Issues */}
      {openIssues.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200 bg-red-50">
            <h2 className="text-lg font-semibold text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Open Issues ({openIssues.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {openIssues.map((issue) => (
              <div key={issue.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">{issue.type}</h3>
                    <span className={\`px-2 py-0.5 text-xs rounded-full \${severityColors[issue.severity]}\`}>
                      {issue.severity}
                    </span>
                    <span className={\`px-2 py-0.5 text-xs rounded-full \${statusColors[issue.status]}\`}>
                      {issue.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Location: {issue.location}</p>
                  <p className="text-sm text-gray-500">Reported: {new Date(issue.reportedDate).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Service History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-blue-600" />
            Service History
          </h2>
        </div>
        <div className="divide-y divide-gray-100">
          {customer.serviceHistory.slice(0, 5).map((service) => (
            <div key={service.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{service.type}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(service.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Technician: {service.technician}</p>
                  <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                  {service.parts && service.parts.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {service.parts.map((part, i) => (
                        <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                          {part}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <span className="font-medium text-gray-900">\${service.cost.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      {customer.notes && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-blue-600" />
            Notes
          </h2>
          <p className="text-gray-600 whitespace-pre-wrap">{customer.notes}</p>
        </div>
      )}
    </div>
  );
}`;
}

/**
 * Generates DriverProfile component
 */
export function generateDriverProfile(options: CustomerStaffOptions = {}): string {
  const { className = '' } = options;

  return `import React from 'react';
import { User, Phone, Mail, MapPin, Truck, Star, Calendar, Clock, Shield, Award, Navigation } from 'lucide-react';

interface DeliveryStats {
  totalDeliveries: number;
  onTimeRate: number;
  averageRating: number;
  totalMiles: number;
}

interface RecentDelivery {
  id: string;
  date: string;
  destination: string;
  status: 'completed' | 'in-progress' | 'cancelled';
  rating?: number;
}

interface DriverProfileProps {
  driver: {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
    licenseNumber: string;
    licenseExpiry: string;
    vehicleAssigned?: string;
    status: 'available' | 'on-delivery' | 'off-duty' | 'on-break';
    hireDate: string;
    stats: DeliveryStats;
    recentDeliveries: RecentDelivery[];
    certifications?: string[];
    notes?: string;
  };
  onAssignDelivery?: () => void;
  onEditDriver?: () => void;
  className?: string;
}

const statusColors = {
  available: 'bg-green-100 text-green-800',
  'on-delivery': 'bg-blue-100 text-blue-800',
  'off-duty': 'bg-gray-100 text-gray-800',
  'on-break': 'bg-yellow-100 text-yellow-800',
};

export default function DriverProfile({
  driver,
  onAssignDelivery,
  onEditDriver,
  className = '',
}: DriverProfileProps) {
  return (
    <div className={\`space-y-6 \${className}\`}>
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            {driver.avatar ? (
              <img src={driver.avatar} alt={driver.name} className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-blue-600" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{driver.name}</h1>
                <span className={\`px-3 py-1 text-sm font-medium rounded-full \${statusColors[driver.status]}\`}>
                  {driver.status.replace('-', ' ')}
                </span>
              </div>
              <div className="mt-2 space-y-1 text-gray-600">
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {driver.email}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {driver.phone}
                </p>
                {driver.vehicleAssigned && (
                  <p className="flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    {driver.vehicleAssigned}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onEditDriver}
              className="px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Edit
            </button>
            {driver.status === 'available' && (
              <button
                onClick={onAssignDelivery}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Assign Delivery
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <Truck className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{driver.stats.totalDeliveries}</p>
            <p className="text-sm text-gray-500">Total Deliveries</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <Clock className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{driver.stats.onTimeRate}%</p>
            <p className="text-sm text-gray-500">On-Time Rate</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{driver.stats.averageRating.toFixed(1)}</p>
            <p className="text-sm text-gray-500">Avg Rating</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <Navigation className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{driver.stats.totalMiles.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Total Miles</p>
          </div>
        </div>
      </div>

      {/* License & Certifications */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-blue-600" />
          License & Certifications
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-500">Driver License</p>
            <p className="font-medium text-gray-900">{driver.licenseNumber}</p>
            <p className="text-sm text-gray-500 mt-1">
              Expires: {new Date(driver.licenseExpiry).toLocaleDateString()}
            </p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-500">Hire Date</p>
            <p className="font-medium text-gray-900">
              {new Date(driver.hireDate).toLocaleDateString()}
            </p>
          </div>
        </div>
        {driver.certifications && driver.certifications.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">Certifications</p>
            <div className="flex flex-wrap gap-2">
              {driver.certifications.map((cert, i) => (
                <span key={i} className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  {cert}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent Deliveries */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Deliveries</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {driver.recentDeliveries.slice(0, 5).map((delivery) => (
            <div key={delivery.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{delivery.destination}</p>
                <p className="text-sm text-gray-500">{new Date(delivery.date).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-4">
                {delivery.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-medium">{delivery.rating}</span>
                  </div>
                )}
                <span className={\`px-2 py-1 text-xs rounded-full \${
                  delivery.status === 'completed' ? 'bg-green-100 text-green-800' :
                  delivery.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }\`}>
                  {delivery.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}`;
}

/**
 * Generates TechnicianProfile component
 */
export function generateTechnicianProfile(options: CustomerStaffOptions = {}): string {
  const { className = '' } = options;

  return `import React from 'react';
import { User, Phone, Mail, Wrench, Star, Calendar, Clock, Award, Briefcase, CheckCircle } from 'lucide-react';

interface TechnicianProfileProps {
  technician: {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
    specialties: string[];
    status: 'available' | 'on-job' | 'off-duty' | 'on-break';
    hireDate: string;
    certifications: { name: string; expiryDate?: string }[];
    stats: {
      totalJobs: number;
      completionRate: number;
      averageRating: number;
      avgResponseTime: string;
    };
    todaySchedule?: { time: string; customer: string; jobType: string }[];
    notes?: string;
  };
  onAssignJob?: () => void;
  onViewSchedule?: () => void;
  className?: string;
}

const statusColors = {
  available: 'bg-green-100 text-green-800',
  'on-job': 'bg-blue-100 text-blue-800',
  'off-duty': 'bg-gray-100 text-gray-800',
  'on-break': 'bg-yellow-100 text-yellow-800',
};

export default function TechnicianProfile({
  technician,
  onAssignJob,
  onViewSchedule,
  className = '',
}: TechnicianProfileProps) {
  return (
    <div className={\`space-y-6 \${className}\`}>
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            {technician.avatar ? (
              <img src={technician.avatar} alt={technician.name} className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
                <Wrench className="w-10 h-10 text-orange-600" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{technician.name}</h1>
                <span className={\`px-3 py-1 text-sm font-medium rounded-full \${statusColors[technician.status]}\`}>
                  {technician.status.replace('-', ' ')}
                </span>
              </div>
              <div className="mt-2 space-y-1 text-gray-600">
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {technician.email}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {technician.phone}
                </p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {technician.specialties.map((specialty, i) => (
                  <span key={i} className="px-2 py-1 bg-orange-50 text-orange-700 text-sm rounded-full">
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onViewSchedule}
              className="px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              View Schedule
            </button>
            {technician.status === 'available' && (
              <button
                onClick={onAssignJob}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Assign Job
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <Briefcase className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{technician.stats.totalJobs}</p>
            <p className="text-sm text-gray-500">Total Jobs</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{technician.stats.completionRate}%</p>
            <p className="text-sm text-gray-500">Completion Rate</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{technician.stats.averageRating.toFixed(1)}</p>
            <p className="text-sm text-gray-500">Avg Rating</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{technician.stats.avgResponseTime}</p>
            <p className="text-sm text-gray-500">Avg Response</p>
          </div>
        </div>
      </div>

      {/* Certifications */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-orange-600" />
          Certifications
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {technician.certifications.map((cert, i) => (
            <div key={i} className="p-3 border border-gray-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-900">{cert.name}</span>
              </div>
              {cert.expiryDate && (
                <span className="text-sm text-gray-500">
                  Exp: {new Date(cert.expiryDate).toLocaleDateString()}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Today's Schedule */}
      {technician.todaySchedule && technician.todaySchedule.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-600" />
              Today's Schedule
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {technician.todaySchedule.map((slot, i) => (
              <div key={i} className="p-4 flex items-center gap-4">
                <div className="w-20 text-center">
                  <span className="font-medium text-gray-900">{slot.time}</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{slot.customer}</p>
                  <p className="text-sm text-gray-500">{slot.jobType}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}`;
}

/**
 * Generates StaffScheduleBoarding component
 */
export function generateStaffScheduleBoarding(options: CustomerStaffOptions = {}): string {
  const { title = 'Staff Schedule', className = '' } = options;

  return `import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, User, Clock, Dog, Cat } from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  avatar?: string;
  role: string;
}

interface ScheduleSlot {
  id: string;
  staffId: string;
  startTime: string;
  endTime: string;
  task: string;
  petName?: string;
  petType?: 'dog' | 'cat' | 'other';
  notes?: string;
}

interface StaffScheduleBoardingProps {
  staff?: StaffMember[];
  schedules?: ScheduleSlot[];
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
  onSlotClick?: (slot: ScheduleSlot) => void;
  className?: string;
}

export default function StaffScheduleBoarding({
  staff = [],
  schedules = [],
  selectedDate = new Date(),
  onDateChange,
  onSlotClick,
  className = '',
}: StaffScheduleBoardingProps) {
  const [currentDate, setCurrentDate] = useState(selectedDate);
  const hours = Array.from({ length: 12 }, (_, i) => i + 7); // 7 AM to 6 PM

  const handleDateChange = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
    onDateChange?.(newDate);
  };

  const getScheduleForStaff = (staffId: string, hour: number) => {
    return schedules.filter(s => {
      if (s.staffId !== staffId) return false;
      const startHour = parseInt(s.startTime.split(':')[0]);
      const endHour = parseInt(s.endTime.split(':')[0]);
      return hour >= startHour && hour < endHour;
    });
  };

  const formatHour = (hour: number) => {
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    return \`\${displayHour} \${suffix}\`;
  };

  return (
    <div className={\`bg-white rounded-lg shadow-sm border border-gray-200 \${className}\`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">${title}</h2>
        <div className="flex items-center gap-4">
          <button onClick={() => handleDateChange(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-medium min-w-[180px] text-center">
            {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </span>
          <button onClick={() => handleDateChange(1)} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Time Header */}
          <div className="flex border-b border-gray-200">
            <div className="w-48 flex-shrink-0 p-3 bg-gray-50 font-medium text-gray-700">Staff</div>
            {hours.map((hour) => (
              <div key={hour} className="flex-1 min-w-[80px] p-2 text-center text-sm text-gray-500 bg-gray-50 border-l border-gray-200">
                {formatHour(hour)}
              </div>
            ))}
          </div>

          {/* Staff Rows */}
          {staff.map((member) => (
            <div key={member.id} className="flex border-b border-gray-100">
              <div className="w-48 flex-shrink-0 p-3 flex items-center gap-3 bg-white">
                {member.avatar ? (
                  <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{member.name}</p>
                  <p className="text-xs text-gray-500">{member.role}</p>
                </div>
              </div>
              {hours.map((hour) => {
                const slots = getScheduleForStaff(member.id, hour);
                return (
                  <div key={hour} className="flex-1 min-w-[80px] border-l border-gray-100 p-1">
                    {slots.map((slot) => {
                      const isStart = parseInt(slot.startTime.split(':')[0]) === hour;
                      if (!isStart) return null;
                      const duration = parseInt(slot.endTime.split(':')[0]) - parseInt(slot.startTime.split(':')[0]);
                      return (
                        <div
                          key={slot.id}
                          onClick={() => onSlotClick?.(slot)}
                          className="bg-blue-100 border border-blue-200 rounded p-1 text-xs cursor-pointer hover:bg-blue-200"
                          style={{ width: \`\${duration * 100}%\` }}
                        >
                          <div className="font-medium text-blue-800 truncate">{slot.task}</div>
                          {slot.petName && (
                            <div className="text-blue-600 truncate flex items-center gap-1">
                              {slot.petType === 'dog' ? <Dog className="w-3 h-3" /> :
                               slot.petType === 'cat' ? <Cat className="w-3 h-3" /> : null}
                              {slot.petName}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}`;
}
