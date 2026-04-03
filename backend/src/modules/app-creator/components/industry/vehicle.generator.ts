/**
 * Vehicle Component Generators
 * For fleet management, transportation, and logistics
 */

export interface VehicleOptions {
  primaryColor?: string;
  secondaryColor?: string;
}

/**
 * Generate Vehicle Filters Component
 */
export function generateVehicleFilters(options: VehicleOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface VehicleFiltersProps {
      onFilterChange?: (filters: any) => void;
    }

    const VehicleFilters: React.FC<VehicleFiltersProps> = ({ onFilterChange }) => {
      const [filters, setFilters] = React.useState({
        search: '',
        type: '',
        status: '',
        location: '',
        fuelType: '',
      });

      const handleChange = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange?.(newFilters);
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search by ID, plate..."
                value={filters.search}
                onChange={(e) => handleChange('search', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Types</option>
                <option value="sedan">Sedan</option>
                <option value="suv">SUV</option>
                <option value="truck">Truck</option>
                <option value="van">Van</option>
                <option value="motorcycle">Motorcycle</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Status</option>
                <option value="available">Available</option>
                <option value="in-use">In Use</option>
                <option value="maintenance">Maintenance</option>
                <option value="out-of-service">Out of Service</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <select
                value={filters.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Locations</option>
                <option value="depot-1">Main Depot</option>
                <option value="depot-2">North Branch</option>
                <option value="depot-3">South Branch</option>
                <option value="on-route">On Route</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
              <select
                value={filters.fuelType}
                onChange={(e) => handleChange('fuelType', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Fuel Types</option>
                <option value="gasoline">Gasoline</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Electric</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Vehicle Card Component
 */
export function generateVehicleCard(options: VehicleOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface VehicleCardProps {
      vehicle: {
        id: string;
        make: string;
        model: string;
        year: number;
        licensePlate: string;
        type: string;
        status: 'available' | 'in-use' | 'maintenance' | 'out-of-service';
        fuelLevel: number;
        mileage: number;
        lastService: string;
        imageUrl?: string;
        assignedDriver?: string;
      };
      onSelect?: (id: string) => void;
    }

    const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onSelect }) => {
      const statusColors = {
        'available': 'bg-green-100 text-green-800',
        'in-use': 'bg-blue-100 text-blue-800',
        'maintenance': 'bg-yellow-100 text-yellow-800',
        'out-of-service': 'bg-red-100 text-red-800',
      };

      const statusLabels = {
        'available': 'Available',
        'in-use': 'In Use',
        'maintenance': 'Maintenance',
        'out-of-service': 'Out of Service',
      };

      return (
        <div
          className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onSelect?.(vehicle.id)}
        >
          <div className="h-40 bg-gray-100 relative">
            {vehicle.imageUrl ? (
              <img src={vehicle.imageUrl} alt={vehicle.make} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <span className="text-5xl">🚗</span>
              </div>
            )}
            <span className={\`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium \${statusColors[vehicle.status]}\`}>
              {statusLabels[vehicle.status]}
            </span>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg">{vehicle.year} {vehicle.make} {vehicle.model}</h3>
            <p className="text-sm text-gray-500 mb-3">{vehicle.licensePlate} • {vehicle.type}</p>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Fuel Level</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: \`\${vehicle.fuelLevel}%\`,
                        backgroundColor: vehicle.fuelLevel > 30 ? '#22C55E' : '#EF4444'
                      }}
                    />
                  </div>
                  <span>{vehicle.fuelLevel}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Mileage</span>
                <span>{vehicle.mileage.toLocaleString()} mi</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Last Service</span>
                <span>{vehicle.lastService}</span>
              </div>
              {vehicle.assignedDriver && (
                <div className="flex items-center justify-between text-sm pt-2 border-t mt-2">
                  <span className="text-gray-500">Driver</span>
                  <span className="font-medium">{vehicle.assignedDriver}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Vehicle Detail Component
 */
export function generateVehicleDetail(options: VehicleOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface VehicleDetailProps {
      vehicle: {
        id: string;
        make: string;
        model: string;
        year: number;
        licensePlate: string;
        vin: string;
        type: string;
        status: 'available' | 'in-use' | 'maintenance' | 'out-of-service';
        fuelLevel: number;
        fuelType: string;
        mileage: number;
        lastService: string;
        nextService: string;
        imageUrl?: string;
        assignedDriver?: { name: string; phone: string };
        insurance: { provider: string; policyNumber: string; expiry: string };
        registration: { number: string; expiry: string };
      };
      onEdit?: () => void;
      onScheduleMaintenance?: () => void;
    }

    const VehicleDetail: React.FC<VehicleDetailProps> = ({ vehicle, onEdit, onScheduleMaintenance }) => {
      const statusColors = {
        'available': 'bg-green-100 text-green-800',
        'in-use': 'bg-blue-100 text-blue-800',
        'maintenance': 'bg-yellow-100 text-yellow-800',
        'out-of-service': 'bg-red-100 text-red-800',
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="h-56 bg-gray-100 relative">
            {vehicle.imageUrl ? (
              <img src={vehicle.imageUrl} alt={vehicle.make} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <span className="text-7xl">🚗</span>
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold">{vehicle.year} {vehicle.make} {vehicle.model}</h1>
                <p className="text-gray-500">{vehicle.licensePlate} • {vehicle.type}</p>
              </div>
              <span className={\`px-3 py-1 rounded-full text-sm font-medium \${statusColors[vehicle.status]}\`}>
                {vehicle.status.replace('-', ' ').replace(/\\b\\w/g, l => l.toUpperCase())}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <h3 className="font-semibold mb-3">Vehicle Information</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-500">VIN:</span> {vehicle.vin}</p>
                  <p><span className="text-gray-500">Fuel Type:</span> {vehicle.fuelType}</p>
                  <p><span className="text-gray-500">Mileage:</span> {vehicle.mileage.toLocaleString()} mi</p>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Fuel Level:</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: \`\${vehicle.fuelLevel}%\`,
                          backgroundColor: vehicle.fuelLevel > 30 ? '#22C55E' : '#EF4444'
                        }}
                      />
                    </div>
                    <span>{vehicle.fuelLevel}%</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Maintenance</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-500">Last Service:</span> {vehicle.lastService}</p>
                  <p><span className="text-gray-500">Next Service:</span> {vehicle.nextService}</p>
                </div>
                <button
                  onClick={onScheduleMaintenance}
                  className="mt-3 px-3 py-1 text-sm border rounded hover:bg-gray-50"
                >
                  Schedule Maintenance
                </button>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Documents</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-500">Registration:</span> {vehicle.registration.number}</p>
                  <p><span className="text-gray-500">Reg. Expiry:</span> {vehicle.registration.expiry}</p>
                  <p><span className="text-gray-500">Insurance:</span> {vehicle.insurance.provider}</p>
                  <p><span className="text-gray-500">Ins. Expiry:</span> {vehicle.insurance.expiry}</p>
                </div>
              </div>
            </div>

            {vehicle.assignedDriver && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Assigned Driver</h3>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-xl">👤</span>
                  </div>
                  <div>
                    <p className="font-medium">{vehicle.assignedDriver.name}</p>
                    <p className="text-sm text-gray-500">{vehicle.assignedDriver.phone}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
              <button
                onClick={onEdit}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Edit Vehicle
              </button>
              <button
                className="px-4 py-2 text-white rounded-lg hover:opacity-90"
                style={{ backgroundColor: '${primaryColor}' }}
              >
                View History
              </button>
            </div>
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Truck Schedule Component
 */
export function generateTruckSchedule(options: VehicleOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    interface TruckScheduleProps {
      schedules: Array<{
        id: string;
        truckId: string;
        truckName: string;
        driver: string;
        route: string;
        departureTime: string;
        arrivalTime: string;
        status: 'scheduled' | 'in-transit' | 'completed' | 'delayed';
        stops: number;
      }>;
      onSelect?: (id: string) => void;
    }

    const TruckSchedule: React.FC<TruckScheduleProps> = ({ schedules, onSelect }) => {
      const statusColors = {
        'scheduled': 'bg-blue-100 text-blue-800',
        'in-transit': 'bg-yellow-100 text-yellow-800',
        'completed': 'bg-green-100 text-green-800',
        'delayed': 'bg-red-100 text-red-800',
      };

      return (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-lg">Truck Schedule</h2>
          </div>
          <div className="divide-y">
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className="p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelect?.(schedule.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🚚</span>
                    <div>
                      <p className="font-medium">{schedule.truckName}</p>
                      <p className="text-sm text-gray-500">Driver: {schedule.driver}</p>
                    </div>
                  </div>
                  <span className={\`px-2 py-1 rounded-full text-xs font-medium \${statusColors[schedule.status]}\`}>
                    {schedule.status.replace('-', ' ').replace(/\\b\\w/g, l => l.toUpperCase())}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 ml-10">
                  <span>📍 {schedule.route}</span>
                  <span>🕐 {schedule.departureTime} - {schedule.arrivalTime}</span>
                  <span>📦 {schedule.stops} stops</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    };
  `;
}

/**
 * Generate Fleet Stats Component
 */
export function generateFleetStats(options: VehicleOptions = {}): string {
  const { primaryColor = '#3B82F6' } = options;

  return `
    const FleetStats: React.FC = () => {
      const stats = [
        { label: 'Total Vehicles', value: '48', icon: '🚗', change: '+3 this month' },
        { label: 'Available', value: '32', icon: '✅', change: '67%' },
        { label: 'In Transit', value: '12', icon: '🛣️', change: '25%' },
        { label: 'Maintenance', value: '4', icon: '🔧', change: '8%' },
      ];

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                </div>
                <span className="text-3xl">{stat.icon}</span>
              </div>
            </div>
          ))}
        </div>
      );
    };
  `;
}
