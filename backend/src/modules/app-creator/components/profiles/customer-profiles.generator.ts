/**
 * Customer Profile Component Generators
 *
 * Industry-specific customer profile components.
 */

export interface CustomerProfileOptions {
  title?: string;
  industry?: string;
}

// Bakery Customer Profile
export function generateCustomerProfileBakery(options: CustomerProfileOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

interface BakeryCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  memberSince: string;
  loyaltyPoints: number;
  favoriteItems: string[];
  allergies: string[];
  orderCount: number;
  totalSpent: number;
  recentOrders: { id: string; date: string; items: string[]; total: number }[];
}

export default function CustomerProfileBakery() {
  const [customer, setCustomer] = useState<BakeryCustomer | null>(null);

  useEffect(() => {
    setCustomer({
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah@email.com',
      phone: '555-0123',
      memberSince: '2023-06-15',
      loyaltyPoints: 450,
      favoriteItems: ['Croissants', 'Sourdough Bread', 'Apple Pie'],
      allergies: ['Peanuts'],
      orderCount: 24,
      totalSpent: 680,
      recentOrders: [
        { id: '1', date: '2024-01-15', items: ['Croissants (6)', 'Coffee Cake'], total: 32 },
        { id: '2', date: '2024-01-10', items: ['Birthday Cake - Custom'], total: 85 }
      ]
    });
  }, []);

  if (!customer) return <div className="animate-pulse h-64 bg-gray-100 rounded-lg" />;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{customer.name}</h2>
            <p className="text-gray-600">{customer.email} • {customer.phone}</p>
            <p className="text-sm text-gray-500">Customer since {new Date(customer.memberSince).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-lg">
              <div className="text-2xl font-bold">{customer.loyaltyPoints}</div>
              <div className="text-sm">Loyalty Points</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold">{customer.orderCount}</div>
            <div className="text-sm text-gray-600">Total Orders</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold">\${customer.totalSpent}</div>
            <div className="text-sm text-gray-600">Total Spent</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-3">Favorite Items</h3>
          <div className="flex flex-wrap gap-2">
            {customer.favoriteItems.map((item, i) => (
              <span key={i} className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">{item}</span>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-3">Allergies & Notes</h3>
          {customer.allergies.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {customer.allergies.map((allergy, i) => (
                <span key={i} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">{allergy}</span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No known allergies</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4">Recent Orders</h3>
        <div className="space-y-3">
          {customer.recentOrders.map((order) => (
            <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">{order.items.join(', ')}</div>
                <div className="text-sm text-gray-500">{new Date(order.date).toLocaleDateString()}</div>
              </div>
              <div className="font-semibold">\${order.total}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}`;
}

// Florist Customer Profile
export function generateCustomerProfileFlorist(options: CustomerProfileOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

interface FloristCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  memberSince: string;
  occasionReminders: { date: string; occasion: string; recipient: string }[];
  favoriteFlowers: string[];
  deliveryAddresses: { label: string; address: string }[];
  orderCount: number;
  totalSpent: number;
}

export default function CustomerProfileFlorist() {
  const [customer, setCustomer] = useState<FloristCustomer | null>(null);

  useEffect(() => {
    setCustomer({
      id: '1',
      name: 'Michael Chen',
      email: 'michael@email.com',
      phone: '555-0124',
      memberSince: '2023-03-10',
      occasionReminders: [
        { date: '2024-02-14', occasion: 'Anniversary', recipient: 'Wife - Emily' },
        { date: '2024-05-12', occasion: 'Mother\\'s Day', recipient: 'Mom' }
      ],
      favoriteFlowers: ['Red Roses', 'Orchids', 'Tulips'],
      deliveryAddresses: [
        { label: 'Home', address: '123 Main St, City, ST 12345' },
        { label: 'Office', address: '456 Business Ave, Suite 100' }
      ],
      orderCount: 15,
      totalSpent: 1250
    });
  }, []);

  if (!customer) return <div className="animate-pulse h-64 bg-gray-100 rounded-lg" />;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{customer.name}</h2>
            <p className="text-gray-600">{customer.email} • {customer.phone}</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-pink-100 text-pink-800 px-4 py-2 rounded-lg text-center">
              <div className="text-xl font-bold">{customer.orderCount}</div>
              <div className="text-sm">Orders</div>
            </div>
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg text-center">
              <div className="text-xl font-bold">\${customer.totalSpent}</div>
              <div className="text-sm">Total</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <span className="text-xl">🔔</span>
          Occasion Reminders
        </h3>
        <div className="space-y-3">
          {customer.occasionReminders.map((reminder, i) => (
            <div key={i} className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
              <div>
                <div className="font-medium">{reminder.occasion}</div>
                <div className="text-sm text-gray-600">For: {reminder.recipient}</div>
              </div>
              <div className="text-right">
                <div className="font-medium">{new Date(reminder.date).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-3">Favorite Flowers</h3>
          <div className="flex flex-wrap gap-2">
            {customer.favoriteFlowers.map((flower, i) => (
              <span key={i} className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm">🌸 {flower}</span>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-3">Delivery Addresses</h3>
          <div className="space-y-2">
            {customer.deliveryAddresses.map((addr, i) => (
              <div key={i} className="p-2 bg-gray-50 rounded">
                <div className="font-medium text-sm">{addr.label}</div>
                <div className="text-sm text-gray-600">{addr.address}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}`;
}

// Optician Customer Profile
export function generateCustomerProfileOptician(options: CustomerProfileOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

interface OpticianCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  insuranceProvider?: string;
  lastExamDate: string;
  prescription: { sphere: string; cylinder: string; axis: string; add?: string }[];
  purchaseHistory: { date: string; item: string; price: number }[];
  frameSizePreferences: { bridge: number; lens: number; temple: number };
}

export default function CustomerProfileOptician() {
  const [customer, setCustomer] = useState<OpticianCustomer | null>(null);

  useEffect(() => {
    setCustomer({
      id: '1',
      name: 'Jennifer Williams',
      email: 'jennifer@email.com',
      phone: '555-0125',
      dateOfBirth: '1985-07-22',
      insuranceProvider: 'VSP Vision Care',
      lastExamDate: '2024-01-05',
      prescription: [
        { sphere: '-2.50', cylinder: '-0.75', axis: '180', add: '+1.25' },
        { sphere: '-2.25', cylinder: '-0.50', axis: '175', add: '+1.25' }
      ],
      purchaseHistory: [
        { date: '2024-01-10', item: 'Ray-Ban RB5154 Clubmaster', price: 320 },
        { date: '2023-06-15', item: 'Contact Lenses (6 month supply)', price: 180 }
      ],
      frameSizePreferences: { bridge: 18, lens: 52, temple: 145 }
    });
  }, []);

  if (!customer) return <div className="animate-pulse h-64 bg-gray-100 rounded-lg" />;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{customer.name}</h2>
            <p className="text-gray-600">{customer.email} • {customer.phone}</p>
            <p className="text-sm text-gray-500">DOB: {new Date(customer.dateOfBirth).toLocaleDateString()}</p>
          </div>
          {customer.insuranceProvider && (
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg">
              <div className="text-sm">Insurance</div>
              <div className="font-medium">{customer.insuranceProvider}</div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4">Current Prescription</h3>
        <div className="text-sm text-gray-500 mb-2">Last exam: {new Date(customer.lastExamDate).toLocaleDateString()}</div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Eye</th>
              <th className="px-4 py-2 text-left">Sphere</th>
              <th className="px-4 py-2 text-left">Cylinder</th>
              <th className="px-4 py-2 text-left">Axis</th>
              <th className="px-4 py-2 text-left">Add</th>
            </tr>
          </thead>
          <tbody>
            {customer.prescription.map((rx, i) => (
              <tr key={i} className="border-t">
                <td className="px-4 py-2 font-medium">{i === 0 ? 'OD (Right)' : 'OS (Left)'}</td>
                <td className="px-4 py-2">{rx.sphere}</td>
                <td className="px-4 py-2">{rx.cylinder}</td>
                <td className="px-4 py-2">{rx.axis}°</td>
                <td className="px-4 py-2">{rx.add || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-3">Frame Preferences</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xl font-bold">{customer.frameSizePreferences.bridge}</div>
              <div className="text-sm text-gray-600">Bridge</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xl font-bold">{customer.frameSizePreferences.lens}</div>
              <div className="text-sm text-gray-600">Lens</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xl font-bold">{customer.frameSizePreferences.temple}</div>
              <div className="text-sm text-gray-600">Temple</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-3">Purchase History</h3>
          <div className="space-y-2">
            {customer.purchaseHistory.map((purchase, i) => (
              <div key={i} className="flex justify-between p-2 bg-gray-50 rounded">
                <div>
                  <div className="font-medium text-sm">{purchase.item}</div>
                  <div className="text-xs text-gray-500">{new Date(purchase.date).toLocaleDateString()}</div>
                </div>
                <div className="font-medium">\${purchase.price}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}`;
}

// Pharmacy Customer Profile
export function generateCustomerProfilePharmacy(options: CustomerProfileOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

interface PharmacyCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  insuranceInfo: { provider: string; memberId: string; groupId: string };
  medications: { name: string; dosage: string; refillDate: string; autoRefill: boolean }[];
  allergies: string[];
  preferredPharmacist?: string;
}

export default function CustomerProfilePharmacy() {
  const [customer, setCustomer] = useState<PharmacyCustomer | null>(null);

  useEffect(() => {
    setCustomer({
      id: '1',
      name: 'Robert Martinez',
      email: 'robert@email.com',
      phone: '555-0126',
      dateOfBirth: '1958-11-30',
      insuranceInfo: { provider: 'Blue Cross', memberId: 'BC123456789', groupId: 'GRP001' },
      medications: [
        { name: 'Lisinopril', dosage: '10mg', refillDate: '2024-02-01', autoRefill: true },
        { name: 'Metformin', dosage: '500mg', refillDate: '2024-01-25', autoRefill: true },
        { name: 'Atorvastatin', dosage: '20mg', refillDate: '2024-02-15', autoRefill: false }
      ],
      allergies: ['Penicillin', 'Sulfa'],
      preferredPharmacist: 'Dr. Sarah Chen'
    });
  }, []);

  if (!customer) return <div className="animate-pulse h-64 bg-gray-100 rounded-lg" />;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{customer.name}</h2>
            <p className="text-gray-600">{customer.email} • {customer.phone}</p>
            <p className="text-sm text-gray-500">DOB: {new Date(customer.dateOfBirth).toLocaleDateString()}</p>
          </div>
          <div className="bg-blue-100 text-blue-800 px-4 py-3 rounded-lg">
            <div className="text-sm font-medium">{customer.insuranceInfo.provider}</div>
            <div className="text-xs">Member: {customer.insuranceInfo.memberId}</div>
          </div>
        </div>
      </div>

      {customer.allergies.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-800 flex items-center gap-2">
            <span>⚠️</span> Allergies
          </h3>
          <div className="flex gap-2 mt-2">
            {customer.allergies.map((allergy, i) => (
              <span key={i} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">{allergy}</span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4">Active Medications</h3>
        <div className="space-y-3">
          {customer.medications.map((med, i) => (
            <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">{med.name} {med.dosage}</div>
                <div className="text-sm text-gray-500">Next refill: {new Date(med.refillDate).toLocaleDateString()}</div>
              </div>
              <div className="flex items-center gap-4">
                {med.autoRefill && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Auto-Refill</span>
                )}
                <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">Refill</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {customer.preferredPharmacist && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-2">Preferred Pharmacist</h3>
          <p className="text-gray-600">{customer.preferredPharmacist}</p>
        </div>
      )}
    </div>
  );
}`;
}

// Rental Customer Profile
export function generateCustomerProfileRental(options: CustomerProfileOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

interface RentalCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  memberSince: string;
  membershipType: 'basic' | 'premium' | 'vip';
  driversLicense?: { number: string; expiry: string; state: string };
  rentalHistory: { date: string; item: string; duration: string; total: number }[];
  activeRentals: { item: string; startDate: string; endDate: string }[];
  creditOnFile: boolean;
}

export default function CustomerProfileRental() {
  const [customer, setCustomer] = useState<RentalCustomer | null>(null);

  useEffect(() => {
    setCustomer({
      id: '1',
      name: 'David Thompson',
      email: 'david@email.com',
      phone: '555-0127',
      memberSince: '2022-08-20',
      membershipType: 'premium',
      driversLicense: { number: 'D1234567', expiry: '2026-08-15', state: 'CA' },
      rentalHistory: [
        { date: '2024-01-10', item: 'SUV - Ford Explorer', duration: '3 days', total: 285 },
        { date: '2023-12-20', item: 'Camera Equipment Kit', duration: '1 week', total: 175 }
      ],
      activeRentals: [
        { item: 'Power Tools Set', startDate: '2024-01-18', endDate: '2024-01-25' }
      ],
      creditOnFile: true
    });
  }, []);

  if (!customer) return <div className="animate-pulse h-64 bg-gray-100 rounded-lg" />;

  const membershipColors: Record<string, string> = {
    basic: 'bg-gray-100 text-gray-800',
    premium: 'bg-purple-100 text-purple-800',
    vip: 'bg-yellow-100 text-yellow-800'
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{customer.name}</h2>
            <p className="text-gray-600">{customer.email} • {customer.phone}</p>
            <p className="text-sm text-gray-500">Member since {new Date(customer.memberSince).toLocaleDateString()}</p>
          </div>
          <div className="flex gap-3">
            <span className={\`px-4 py-2 rounded-lg font-medium \${membershipColors[customer.membershipType]}\`}>
              {customer.membershipType.toUpperCase()}
            </span>
            {customer.creditOnFile && (
              <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg">✓ Card on File</span>
            )}
          </div>
        </div>
      </div>

      {customer.driversLicense && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-3">Driver's License</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-500">License Number</div>
              <div className="font-medium">{customer.driversLicense.number}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">State</div>
              <div className="font-medium">{customer.driversLicense.state}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Expiry</div>
              <div className="font-medium">{new Date(customer.driversLicense.expiry).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      )}

      {customer.activeRentals.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-800 mb-3">Active Rentals</h3>
          {customer.activeRentals.map((rental, i) => (
            <div key={i} className="flex justify-between items-center bg-white p-4 rounded-lg">
              <div>
                <div className="font-medium">{rental.item}</div>
                <div className="text-sm text-gray-600">
                  {new Date(rental.startDate).toLocaleDateString()} - {new Date(rental.endDate).toLocaleDateString()}
                </div>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">Extend</button>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4">Rental History</h3>
        <div className="space-y-3">
          {customer.rentalHistory.map((rental, i) => (
            <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">{rental.item}</div>
                <div className="text-sm text-gray-500">{new Date(rental.date).toLocaleDateString()} • {rental.duration}</div>
              </div>
              <div className="font-semibold">\${rental.total}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}`;
}

// Client Profile for Accounting
export function generateClientProfileAccounting(options: CustomerProfileOptions = {}): string {
  return `import React, { useState, useEffect } from 'react';

interface AccountingClient {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  clientSince: string;
  entityType: 'individual' | 'llc' | 'corporation' | 's-corp' | 'partnership';
  services: string[];
  taxDeadlines: { type: string; deadline: string; status: 'pending' | 'filed' | 'extended' }[];
  outstandingBalance: number;
  yearlyRevenue: number;
}

export default function ClientProfileAccounting() {
  const [client, setClient] = useState<AccountingClient | null>(null);

  useEffect(() => {
    setClient({
      id: '1',
      companyName: 'TechStart Inc.',
      contactName: 'James Wilson',
      email: 'james@techstart.com',
      phone: '555-0128',
      clientSince: '2021-03-15',
      entityType: 's-corp',
      services: ['Tax Preparation', 'Bookkeeping', 'Payroll', 'CFO Advisory'],
      taxDeadlines: [
        { type: 'Q4 Payroll Tax', deadline: '2024-01-31', status: 'pending' },
        { type: '1099 Filing', deadline: '2024-01-31', status: 'filed' },
        { type: 'Annual Tax Return', deadline: '2024-03-15', status: 'pending' }
      ],
      outstandingBalance: 2500,
      yearlyRevenue: 85000
    });
  }, []);

  if (!client) return <div className="animate-pulse h-64 bg-gray-100 rounded-lg" />;

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    filed: 'bg-green-100 text-green-800',
    extended: 'bg-blue-100 text-blue-800'
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{client.companyName}</h2>
            <p className="text-gray-600">{client.contactName}</p>
            <p className="text-gray-500">{client.email} • {client.phone}</p>
          </div>
          <div className="text-right">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">{client.entityType.toUpperCase()}</span>
            <p className="text-sm text-gray-500 mt-2">Client since {new Date(client.clientSince).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold">\${client.yearlyRevenue.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Annual Revenue</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600">\${client.outstandingBalance.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Outstanding Balance</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4">Services</h3>
        <div className="flex flex-wrap gap-2">
          {client.services.map((service, i) => (
            <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">{service}</span>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4">Tax Deadlines</h3>
        <div className="space-y-3">
          {client.taxDeadlines.map((deadline, i) => (
            <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">{deadline.type}</div>
                <div className="text-sm text-gray-500">Due: {new Date(deadline.deadline).toLocaleDateString()}</div>
              </div>
              <span className={\`px-3 py-1 rounded-full text-sm \${statusColors[deadline.status]}\`}>
                {deadline.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}`;
}
