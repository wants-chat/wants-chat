/**
 * Healthcare Specialties Component Generators
 *
 * Components for specialized healthcare practices:
 * - Chiropractic
 * - Dermatology
 * - Pediatrics
 * - Orthodontics
 * - Mental Health
 * - Radiology/Imaging
 * - Physical Therapy
 * - Home Care
 * - Lab/Diagnostics
 * - Urgent Care
 */

export interface HealthcareSpecialtyOptions {
  primaryColor?: string;
  showInsurance?: boolean;
  enableTelehealth?: boolean;
}

// ============================================
// CHIROPRACTIC COMPONENTS
// ============================================

export function generateChiropractorStats(options: HealthcareSpecialtyOptions = {}): string {
  return `import { useEffect, useState } from 'react';
import { Activity, Users, Calendar, TrendingUp } from 'lucide-react';

interface ChiroStats {
  todayAppointments: number;
  activePatients: number;
  adjustmentsThisWeek: number;
  newPatientsThisMonth: number;
}

export default function ChiropractorStats() {
  const [stats, setStats] = useState<ChiroStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch stats from API
    setStats({
      todayAppointments: 12,
      activePatients: 156,
      adjustmentsThisWeek: 48,
      newPatientsThisMonth: 8
    });
    setLoading(false);
  }, []);

  if (loading) return <div className="animate-pulse h-32 bg-gray-100 rounded-lg" />;

  const statCards = [
    { label: "Today's Appointments", value: stats?.todayAppointments, icon: Calendar, color: 'blue' },
    { label: 'Active Patients', value: stats?.activePatients, icon: Users, color: 'green' },
    { label: 'Adjustments This Week', value: stats?.adjustmentsThisWeek, icon: Activity, color: 'purple' },
    { label: 'New Patients', value: stats?.newPatientsThisMonth, icon: TrendingUp, color: 'orange' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => (
        <div key={stat.label} className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </div>
            <div className={\`p-3 rounded-lg bg-\${stat.color}-100\`}>
              <stat.icon className={\`w-6 h-6 text-\${stat.color}-600\`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}`;
}

export function generateSpineAssessment(options: HealthcareSpecialtyOptions = {}): string {
  return `import { useState } from 'react';

interface SpineRegion {
  region: string;
  status: 'normal' | 'subluxation' | 'restricted' | 'pain';
  notes: string;
}

interface SpineAssessmentProps {
  patientId: string;
  onSave?: (assessment: SpineRegion[]) => void;
}

export default function SpineAssessment({ patientId, onSave }: SpineAssessmentProps) {
  const [regions, setRegions] = useState<SpineRegion[]>([
    { region: 'Cervical (C1-C7)', status: 'normal', notes: '' },
    { region: 'Thoracic (T1-T12)', status: 'normal', notes: '' },
    { region: 'Lumbar (L1-L5)', status: 'normal', notes: '' },
    { region: 'Sacral', status: 'normal', notes: '' },
    { region: 'Pelvis', status: 'normal', notes: '' },
  ]);

  const statusColors = {
    normal: 'bg-green-100 text-green-800',
    subluxation: 'bg-red-100 text-red-800',
    restricted: 'bg-yellow-100 text-yellow-800',
    pain: 'bg-orange-100 text-orange-800',
  };

  const updateRegion = (index: number, field: keyof SpineRegion, value: string) => {
    const updated = [...regions];
    updated[index] = { ...updated[index], [field]: value };
    setRegions(updated);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">Spine Assessment</h3>
      <div className="space-y-4">
        {regions.map((region, index) => (
          <div key={region.region} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{region.region}</span>
              <select
                value={region.status}
                onChange={(e) => updateRegion(index, 'status', e.target.value)}
                className={\`px-3 py-1 rounded-full text-sm font-medium \${statusColors[region.status]}\`}
              >
                <option value="normal">Normal</option>
                <option value="subluxation">Subluxation</option>
                <option value="restricted">Restricted</option>
                <option value="pain">Pain</option>
              </select>
            </div>
            <textarea
              placeholder="Notes..."
              value={region.notes}
              onChange={(e) => updateRegion(index, 'notes', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              rows={2}
            />
          </div>
        ))}
      </div>
      <button
        onClick={() => onSave?.(regions)}
        className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
      >
        Save Assessment
      </button>
    </div>
  );
}`;
}

export function generateAdjustmentHistory(options: HealthcareSpecialtyOptions = {}): string {
  return `import { useState, useEffect } from 'react';
import { Calendar, MapPin, FileText } from 'lucide-react';

interface Adjustment {
  id: string;
  date: string;
  regions: string[];
  technique: string;
  notes: string;
  practitioner: string;
}

interface AdjustmentHistoryProps {
  patientId: string;
}

export default function AdjustmentHistory({ patientId }: AdjustmentHistoryProps) {
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch from API
    setAdjustments([
      {
        id: '1',
        date: '2024-01-15',
        regions: ['Cervical C3-C5', 'Thoracic T4'],
        technique: 'Diversified',
        notes: 'Patient reported improvement in neck mobility',
        practitioner: 'Dr. Smith'
      },
      {
        id: '2',
        date: '2024-01-08',
        regions: ['Lumbar L4-L5', 'Sacroiliac'],
        technique: 'Activator',
        notes: 'Lower back pain decreased from 7/10 to 4/10',
        practitioner: 'Dr. Smith'
      }
    ]);
    setLoading(false);
  }, [patientId]);

  if (loading) return <div className="animate-pulse h-48 bg-gray-100 rounded-lg" />;

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">Adjustment History</h3>
      <div className="space-y-4">
        {adjustments.map((adj) => (
          <div key={adj.id} className="border rounded-lg p-4 hover:bg-gray-50">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  {new Date(adj.date).toLocaleDateString()}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {adj.regions.map((region) => (
                    <span key={region} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {region}
                    </span>
                  ))}
                </div>
              </div>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                {adj.technique}
              </span>
            </div>
            {adj.notes && (
              <p className="mt-3 text-sm text-gray-600 flex items-start gap-2">
                <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {adj.notes}
              </p>
            )}
            <p className="mt-2 text-xs text-gray-400">by {adj.practitioner}</p>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}

// ============================================
// DERMATOLOGY COMPONENTS
// ============================================

export function generateDermatologyStats(options: HealthcareSpecialtyOptions = {}): string {
  return `import { useEffect, useState } from 'react';
import { Users, Calendar, Microscope, Sun } from 'lucide-react';

interface DermStats {
  todayAppointments: number;
  pendingBiopsies: number;
  skinChecksThisMonth: number;
  cosmeticProcedures: number;
}

export default function DermatologyStats() {
  const [stats, setStats] = useState<DermStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setStats({
      todayAppointments: 18,
      pendingBiopsies: 4,
      skinChecksThisMonth: 45,
      cosmeticProcedures: 12
    });
    setLoading(false);
  }, []);

  if (loading) return <div className="animate-pulse h-32 bg-gray-100 rounded-lg" />;

  const statCards = [
    { label: "Today's Appointments", value: stats?.todayAppointments, icon: Calendar, color: 'blue' },
    { label: 'Pending Biopsies', value: stats?.pendingBiopsies, icon: Microscope, color: 'red' },
    { label: 'Skin Checks (Month)', value: stats?.skinChecksThisMonth, icon: Sun, color: 'yellow' },
    { label: 'Cosmetic Procedures', value: stats?.cosmeticProcedures, icon: Users, color: 'purple' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => (
        <div key={stat.label} className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </div>
            <div className={\`p-3 rounded-lg bg-\${stat.color}-100\`}>
              <stat.icon className={\`w-6 h-6 text-\${stat.color}-600\`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}`;
}

export function generateSkinConditionTracker(options: HealthcareSpecialtyOptions = {}): string {
  return `import { useState } from 'react';
import { Camera, Plus, Calendar } from 'lucide-react';

interface SkinCondition {
  id: string;
  location: string;
  type: string;
  severity: 'mild' | 'moderate' | 'severe';
  dateIdentified: string;
  images: string[];
  notes: string;
}

interface SkinConditionTrackerProps {
  patientId: string;
  conditions?: SkinCondition[];
}

export default function SkinConditionTracker({ patientId, conditions = [] }: SkinConditionTrackerProps) {
  const [showAddForm, setShowAddForm] = useState(false);

  const severityColors = {
    mild: 'bg-green-100 text-green-800',
    moderate: 'bg-yellow-100 text-yellow-800',
    severe: 'bg-red-100 text-red-800',
  };

  const bodyLocations = [
    'Face', 'Scalp', 'Neck', 'Chest', 'Back', 'Arms', 'Hands', 'Legs', 'Feet', 'Other'
  ];

  const conditionTypes = [
    'Acne', 'Eczema', 'Psoriasis', 'Rosacea', 'Mole', 'Lesion', 'Rash', 'Wart', 'Other'
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Skin Conditions</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> Add Condition
        </button>
      </div>

      {conditions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No conditions tracked yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {conditions.map((condition) => (
            <div key={condition.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">{condition.type}</h4>
                  <p className="text-sm text-gray-500">{condition.location}</p>
                </div>
                <span className={\`px-2 py-1 rounded-full text-xs font-medium \${severityColors[condition.severity]}\`}>
                  {condition.severity}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                <Calendar className="w-3 h-3" />
                Identified: {new Date(condition.dateIdentified).toLocaleDateString()}
              </div>
              {condition.images.length > 0 && (
                <div className="mt-3 flex gap-2">
                  {condition.images.slice(0, 3).map((img, i) => (
                    <div key={i} className="w-16 h-16 bg-gray-100 rounded-lg" />
                  ))}
                  {condition.images.length > 3 && (
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-sm text-gray-500">
                      +{condition.images.length - 3}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}`;
}

export function generateBiopsyTracker(options: HealthcareSpecialtyOptions = {}): string {
  return `import { useState, useEffect } from 'react';
import { Microscope, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface Biopsy {
  id: string;
  date: string;
  location: string;
  type: string;
  status: 'pending' | 'in-lab' | 'completed';
  result?: 'benign' | 'malignant' | 'inconclusive';
  labName: string;
  notes: string;
}

interface BiopsyTrackerProps {
  patientId: string;
}

export default function BiopsyTracker({ patientId }: BiopsyTrackerProps) {
  const [biopsies, setBiopsies] = useState<Biopsy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setBiopsies([
      {
        id: '1',
        date: '2024-01-10',
        location: 'Left forearm',
        type: 'Punch biopsy',
        status: 'completed',
        result: 'benign',
        labName: 'DermPath Labs',
        notes: 'Seborrheic keratosis confirmed'
      },
      {
        id: '2',
        date: '2024-01-18',
        location: 'Upper back',
        type: 'Shave biopsy',
        status: 'in-lab',
        labName: 'DermPath Labs',
        notes: 'Awaiting pathology results'
      }
    ]);
    setLoading(false);
  }, [patientId]);

  const statusConfig = {
    pending: { icon: Clock, color: 'yellow', label: 'Pending' },
    'in-lab': { icon: Microscope, color: 'blue', label: 'In Lab' },
    completed: { icon: CheckCircle, color: 'green', label: 'Completed' },
  };

  const resultConfig = {
    benign: { color: 'green', label: 'Benign' },
    malignant: { color: 'red', label: 'Malignant' },
    inconclusive: { color: 'yellow', label: 'Inconclusive' },
  };

  if (loading) return <div className="animate-pulse h-48 bg-gray-100 rounded-lg" />;

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">Biopsy Results</h3>
      <div className="space-y-4">
        {biopsies.map((biopsy) => {
          const status = statusConfig[biopsy.status];
          const StatusIcon = status.icon;

          return (
            <div key={biopsy.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">{biopsy.type}</h4>
                  <p className="text-sm text-gray-500">{biopsy.location}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(biopsy.date).toLocaleDateString()} - {biopsy.labName}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={\`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-\${status.color}-100 text-\${status.color}-800\`}>
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </span>
                  {biopsy.result && (
                    <span className={\`px-2 py-1 rounded-full text-xs font-medium bg-\${resultConfig[biopsy.result].color}-100 text-\${resultConfig[biopsy.result].color}-800\`}>
                      {resultConfig[biopsy.result].label}
                    </span>
                  )}
                </div>
              </div>
              {biopsy.notes && (
                <p className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">{biopsy.notes}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}`;
}

// ============================================
// PEDIATRICS COMPONENTS
// ============================================

export function generatePediatricsStats(options: HealthcareSpecialtyOptions = {}): string {
  return `import { useEffect, useState } from 'react';
import { Baby, Syringe, Calendar, TrendingUp } from 'lucide-react';

interface PediatricStats {
  todayAppointments: number;
  wellChildVisits: number;
  vaccinationsDue: number;
  newbornsThisMonth: number;
}

export default function PediatricsStats() {
  const [stats, setStats] = useState<PediatricStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setStats({
      todayAppointments: 24,
      wellChildVisits: 18,
      vaccinationsDue: 12,
      newbornsThisMonth: 6
    });
    setLoading(false);
  }, []);

  if (loading) return <div className="animate-pulse h-32 bg-gray-100 rounded-lg" />;

  const statCards = [
    { label: "Today's Appointments", value: stats?.todayAppointments, icon: Calendar, color: 'blue' },
    { label: 'Well-Child Visits', value: stats?.wellChildVisits, icon: Baby, color: 'pink' },
    { label: 'Vaccinations Due', value: stats?.vaccinationsDue, icon: Syringe, color: 'orange' },
    { label: 'Newborns (Month)', value: stats?.newbornsThisMonth, icon: TrendingUp, color: 'green' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => (
        <div key={stat.label} className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </div>
            <div className={\`p-3 rounded-lg bg-\${stat.color}-100\`}>
              <stat.icon className={\`w-6 h-6 text-\${stat.color}-600\`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}`;
}

export function generateGrowthChart(options: HealthcareSpecialtyOptions = {}): string {
  return `import { useState, useEffect } from 'react';
import { TrendingUp, Ruler, Scale } from 'lucide-react';

interface GrowthData {
  date: string;
  age: string;
  weight: number;
  height: number;
  headCircumference?: number;
  weightPercentile: number;
  heightPercentile: number;
}

interface GrowthChartProps {
  patientId: string;
  patientDob: string;
}

export default function GrowthChart({ patientId, patientDob }: GrowthChartProps) {
  const [data, setData] = useState<GrowthData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setData([
      { date: '2024-01-15', age: '2y 3m', weight: 12.5, height: 86, headCircumference: 48, weightPercentile: 50, heightPercentile: 55 },
      { date: '2023-10-15', age: '2y', weight: 11.8, height: 84, headCircumference: 47.5, weightPercentile: 48, heightPercentile: 52 },
      { date: '2023-07-15', age: '1y 9m', weight: 11.2, height: 81, headCircumference: 47, weightPercentile: 45, heightPercentile: 50 },
    ]);
    setLoading(false);
  }, [patientId]);

  if (loading) return <div className="animate-pulse h-64 bg-gray-100 rounded-lg" />;

  const latestData = data[0];

  const getPercentileColor = (percentile: number) => {
    if (percentile < 5 || percentile > 95) return 'text-red-600';
    if (percentile < 10 || percentile > 90) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">Growth Chart</h3>

      {/* Current Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <Scale className="w-6 h-6 mx-auto mb-2 text-blue-600" />
          <p className="text-2xl font-bold">{latestData.weight} kg</p>
          <p className={\`text-sm \${getPercentileColor(latestData.weightPercentile)}\`}>
            {latestData.weightPercentile}th percentile
          </p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <Ruler className="w-6 h-6 mx-auto mb-2 text-green-600" />
          <p className="text-2xl font-bold">{latestData.height} cm</p>
          <p className={\`text-sm \${getPercentileColor(latestData.heightPercentile)}\`}>
            {latestData.heightPercentile}th percentile
          </p>
        </div>
        {latestData.headCircumference && (
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="w-6 h-6 mx-auto mb-2 rounded-full border-2 border-purple-600" />
            <p className="text-2xl font-bold">{latestData.headCircumference} cm</p>
            <p className="text-sm text-gray-500">Head Circ.</p>
          </div>
        )}
      </div>

      {/* History Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Age</th>
              <th className="px-4 py-2 text-right">Weight</th>
              <th className="px-4 py-2 text-right">Height</th>
              <th className="px-4 py-2 text-right">Head</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="border-t">
                <td className="px-4 py-2">{new Date(row.date).toLocaleDateString()}</td>
                <td className="px-4 py-2">{row.age}</td>
                <td className="px-4 py-2 text-right">{row.weight} kg</td>
                <td className="px-4 py-2 text-right">{row.height} cm</td>
                <td className="px-4 py-2 text-right">{row.headCircumference || '-'} cm</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}`;
}

export function generateVaccinationSchedule(options: HealthcareSpecialtyOptions = {}): string {
  return `import { useState, useEffect } from 'react';
import { Syringe, Check, Clock, AlertTriangle } from 'lucide-react';

interface Vaccination {
  id: string;
  name: string;
  dueDate: string;
  givenDate?: string;
  status: 'completed' | 'due' | 'overdue' | 'upcoming';
  dose: string;
  notes?: string;
}

interface VaccinationScheduleProps {
  patientId: string;
  patientDob: string;
}

export default function VaccinationSchedule({ patientId, patientDob }: VaccinationScheduleProps) {
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setVaccinations([
      { id: '1', name: 'DTaP', dueDate: '2024-02-15', status: 'due', dose: '4th dose' },
      { id: '2', name: 'MMR', dueDate: '2024-01-15', givenDate: '2024-01-15', status: 'completed', dose: '1st dose' },
      { id: '3', name: 'Hepatitis A', dueDate: '2023-12-01', status: 'overdue', dose: '2nd dose' },
      { id: '4', name: 'Varicella', dueDate: '2024-06-15', status: 'upcoming', dose: '2nd dose' },
      { id: '5', name: 'Polio (IPV)', dueDate: '2024-01-10', givenDate: '2024-01-10', status: 'completed', dose: '3rd dose' },
    ]);
    setLoading(false);
  }, [patientId]);

  const statusConfig = {
    completed: { icon: Check, color: 'green', bg: 'bg-green-100', text: 'text-green-800' },
    due: { icon: Clock, color: 'yellow', bg: 'bg-yellow-100', text: 'text-yellow-800' },
    overdue: { icon: AlertTriangle, color: 'red', bg: 'bg-red-100', text: 'text-red-800' },
    upcoming: { icon: Syringe, color: 'blue', bg: 'bg-blue-100', text: 'text-blue-800' },
  };

  if (loading) return <div className="animate-pulse h-64 bg-gray-100 rounded-lg" />;

  const grouped = {
    overdue: vaccinations.filter(v => v.status === 'overdue'),
    due: vaccinations.filter(v => v.status === 'due'),
    upcoming: vaccinations.filter(v => v.status === 'upcoming'),
    completed: vaccinations.filter(v => v.status === 'completed'),
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">Vaccination Schedule</h3>

      {grouped.overdue.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {grouped.overdue.length} overdue vaccination(s)
          </p>
        </div>
      )}

      <div className="space-y-3">
        {vaccinations.map((vax) => {
          const config = statusConfig[vax.status];
          const Icon = config.icon;

          return (
            <div key={vax.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className={\`p-2 rounded-lg \${config.bg}\`}>
                  <Syringe className={\`w-4 h-4 \${config.text}\`} />
                </div>
                <div>
                  <p className="font-medium">{vax.name}</p>
                  <p className="text-sm text-gray-500">{vax.dose}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={\`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium \${config.bg} \${config.text}\`}>
                  <Icon className="w-3 h-3" />
                  {vax.status}
                </span>
                <p className="text-xs text-gray-400 mt-1">
                  {vax.givenDate ? \`Given: \${new Date(vax.givenDate).toLocaleDateString()}\` : \`Due: \${new Date(vax.dueDate).toLocaleDateString()}\`}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}`;
}

// ============================================
// MENTAL HEALTH COMPONENTS
// ============================================

export function generateMentalHealthStats(options: HealthcareSpecialtyOptions = {}): string {
  return `import { useEffect, useState } from 'react';
import { Brain, Users, Calendar, Video } from 'lucide-react';

interface MentalHealthStats {
  todaySessions: number;
  activeClients: number;
  telehealthSessions: number;
  groupSessions: number;
}

export default function MentalHealthStats() {
  const [stats, setStats] = useState<MentalHealthStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setStats({
      todaySessions: 8,
      activeClients: 45,
      telehealthSessions: 12,
      groupSessions: 3
    });
    setLoading(false);
  }, []);

  if (loading) return <div className="animate-pulse h-32 bg-gray-100 rounded-lg" />;

  const statCards = [
    { label: "Today's Sessions", value: stats?.todaySessions, icon: Calendar, color: 'blue' },
    { label: 'Active Clients', value: stats?.activeClients, icon: Users, color: 'green' },
    { label: 'Telehealth (Week)', value: stats?.telehealthSessions, icon: Video, color: 'purple' },
    { label: 'Group Sessions', value: stats?.groupSessions, icon: Brain, color: 'pink' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => (
        <div key={stat.label} className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </div>
            <div className={\`p-3 rounded-lg bg-\${stat.color}-100\`}>
              <stat.icon className={\`w-6 h-6 text-\${stat.color}-600\`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}`;
}

export function generateTherapySessionNotes(options: HealthcareSpecialtyOptions = {}): string {
  return `import { useState } from 'react';
import { Save, Clock } from 'lucide-react';

interface SessionNotesProps {
  clientId: string;
  sessionId?: string;
  onSave?: (notes: SessionNotes) => void;
}

interface SessionNotes {
  sessionType: string;
  duration: number;
  presentingIssues: string;
  interventions: string;
  clientResponse: string;
  homework: string;
  nextSessionPlan: string;
  riskAssessment: 'none' | 'low' | 'moderate' | 'high';
}

export default function TherapySessionNotes({ clientId, sessionId, onSave }: SessionNotesProps) {
  const [notes, setNotes] = useState<SessionNotes>({
    sessionType: 'individual',
    duration: 50,
    presentingIssues: '',
    interventions: '',
    clientResponse: '',
    homework: '',
    nextSessionPlan: '',
    riskAssessment: 'none',
  });

  const sessionTypes = [
    { value: 'individual', label: 'Individual Therapy' },
    { value: 'couples', label: 'Couples Therapy' },
    { value: 'family', label: 'Family Therapy' },
    { value: 'group', label: 'Group Therapy' },
    { value: 'intake', label: 'Intake Assessment' },
  ];

  const riskLevels = [
    { value: 'none', label: 'No Risk', color: 'green' },
    { value: 'low', label: 'Low Risk', color: 'yellow' },
    { value: 'moderate', label: 'Moderate Risk', color: 'orange' },
    { value: 'high', label: 'High Risk', color: 'red' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">Session Notes</h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Session Type</label>
          <select
            value={notes.sessionType}
            onChange={(e) => setNotes({ ...notes, sessionType: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          >
            {sessionTypes.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <input
              type="number"
              value={notes.duration}
              onChange={(e) => setNotes({ ...notes, duration: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Presenting Issues</label>
          <textarea
            value={notes.presentingIssues}
            onChange={(e) => setNotes({ ...notes, presentingIssues: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            rows={3}
            placeholder="What the client discussed today..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Interventions Used</label>
          <textarea
            value={notes.interventions}
            onChange={(e) => setNotes({ ...notes, interventions: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            rows={3}
            placeholder="CBT, mindfulness, psychoeducation..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Client Response</label>
          <textarea
            value={notes.clientResponse}
            onChange={(e) => setNotes({ ...notes, clientResponse: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            rows={2}
            placeholder="How the client responded to interventions..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Homework Assigned</label>
          <textarea
            value={notes.homework}
            onChange={(e) => setNotes({ ...notes, homework: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            rows={2}
            placeholder="Tasks for client to complete before next session..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Risk Assessment</label>
          <div className="flex gap-2">
            {riskLevels.map((level) => (
              <button
                key={level.value}
                onClick={() => setNotes({ ...notes, riskAssessment: level.value as any })}
                className={\`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors \${
                  notes.riskAssessment === level.value
                    ? \`border-\${level.color}-500 bg-\${level.color}-100 text-\${level.color}-800\`
                    : 'border-gray-200 hover:border-gray-300'
                }\`}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() => onSave?.(notes)}
        className="mt-6 w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
      >
        <Save className="w-4 h-4" /> Save Session Notes
      </button>
    </div>
  );
}`;
}

export function generateMoodTracker(options: HealthcareSpecialtyOptions = {}): string {
  return `import { useState, useEffect } from 'react';
import { Smile, Meh, Frown, TrendingUp, TrendingDown } from 'lucide-react';

interface MoodEntry {
  date: string;
  mood: number; // 1-10
  anxiety: number; // 1-10
  sleep: number; // hours
  notes: string;
}

interface MoodTrackerProps {
  clientId: string;
}

export default function MoodTracker({ clientId }: MoodTrackerProps) {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setEntries([
      { date: '2024-01-18', mood: 7, anxiety: 3, sleep: 7.5, notes: 'Good day at work' },
      { date: '2024-01-17', mood: 5, anxiety: 6, sleep: 5, notes: 'Stressful meeting' },
      { date: '2024-01-16', mood: 6, anxiety: 4, sleep: 7, notes: '' },
      { date: '2024-01-15', mood: 4, anxiety: 7, sleep: 4.5, notes: 'Difficulty sleeping' },
      { date: '2024-01-14', mood: 6, anxiety: 5, sleep: 6, notes: '' },
    ]);
    setLoading(false);
  }, [clientId]);

  const getMoodIcon = (mood: number) => {
    if (mood >= 7) return <Smile className="w-5 h-5 text-green-500" />;
    if (mood >= 4) return <Meh className="w-5 h-5 text-yellow-500" />;
    return <Frown className="w-5 h-5 text-red-500" />;
  };

  const getMoodColor = (mood: number) => {
    if (mood >= 7) return 'bg-green-100 border-green-300';
    if (mood >= 4) return 'bg-yellow-100 border-yellow-300';
    return 'bg-red-100 border-red-300';
  };

  const avgMood = entries.length ? (entries.reduce((a, b) => a + b.mood, 0) / entries.length).toFixed(1) : 0;
  const avgAnxiety = entries.length ? (entries.reduce((a, b) => a + b.anxiety, 0) / entries.length).toFixed(1) : 0;
  const avgSleep = entries.length ? (entries.reduce((a, b) => a + b.sleep, 0) / entries.length).toFixed(1) : 0;

  if (loading) return <div className="animate-pulse h-64 bg-gray-100 rounded-lg" />;

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">Mood Tracker</h3>

      {/* Averages */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold">{avgMood}</p>
          <p className="text-sm text-gray-500">Avg Mood</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold">{avgAnxiety}</p>
          <p className="text-sm text-gray-500">Avg Anxiety</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold">{avgSleep}h</p>
          <p className="text-sm text-gray-500">Avg Sleep</p>
        </div>
      </div>

      {/* Entries */}
      <div className="space-y-3">
        {entries.map((entry, i) => (
          <div key={entry.date} className={\`p-3 rounded-lg border \${getMoodColor(entry.mood)}\`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getMoodIcon(entry.mood)}
                <div>
                  <p className="font-medium">{new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                  {entry.notes && <p className="text-sm text-gray-600">{entry.notes}</p>}
                </div>
              </div>
              <div className="text-right text-sm">
                <p>Mood: {entry.mood}/10</p>
                <p className="text-gray-500">Anxiety: {entry.anxiety}/10</p>
                <p className="text-gray-500">Sleep: {entry.sleep}h</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}

// ============================================
// RADIOLOGY/IMAGING COMPONENTS
// ============================================

export function generateRadiologyStats(options: HealthcareSpecialtyOptions = {}): string {
  return `import { useEffect, useState } from 'react';
import { Image, Clock, FileCheck, AlertCircle } from 'lucide-react';

interface RadiologyStats {
  todayScans: number;
  pendingReads: number;
  completedToday: number;
  urgentFindings: number;
}

export default function RadiologyStats() {
  const [stats, setStats] = useState<RadiologyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setStats({
      todayScans: 32,
      pendingReads: 8,
      completedToday: 24,
      urgentFindings: 2
    });
    setLoading(false);
  }, []);

  if (loading) return <div className="animate-pulse h-32 bg-gray-100 rounded-lg" />;

  const statCards = [
    { label: "Today's Scans", value: stats?.todayScans, icon: Image, color: 'blue' },
    { label: 'Pending Reads', value: stats?.pendingReads, icon: Clock, color: 'yellow' },
    { label: 'Completed', value: stats?.completedToday, icon: FileCheck, color: 'green' },
    { label: 'Urgent Findings', value: stats?.urgentFindings, icon: AlertCircle, color: 'red' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => (
        <div key={stat.label} className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </div>
            <div className={\`p-3 rounded-lg bg-\${stat.color}-100\`}>
              <stat.icon className={\`w-6 h-6 text-\${stat.color}-600\`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}`;
}

export function generateImagingQueue(options: HealthcareSpecialtyOptions = {}): string {
  return `import { useState, useEffect } from 'react';
import { Image, Clock, User, AlertTriangle } from 'lucide-react';

interface ImagingOrder {
  id: string;
  patientName: string;
  examType: string;
  modality: 'X-Ray' | 'CT' | 'MRI' | 'Ultrasound' | 'Mammogram' | 'PET';
  priority: 'routine' | 'urgent' | 'stat';
  orderTime: string;
  status: 'waiting' | 'in-progress' | 'completed' | 'reading';
  referringPhysician: string;
}

export default function ImagingQueue() {
  const [orders, setOrders] = useState<ImagingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    setOrders([
      { id: '1', patientName: 'John Smith', examType: 'Chest X-Ray', modality: 'X-Ray', priority: 'routine', orderTime: '09:30', status: 'waiting', referringPhysician: 'Dr. Johnson' },
      { id: '2', patientName: 'Mary Johnson', examType: 'Brain MRI w/contrast', modality: 'MRI', priority: 'urgent', orderTime: '08:45', status: 'in-progress', referringPhysician: 'Dr. Williams' },
      { id: '3', patientName: 'Robert Davis', examType: 'Abdominal CT', modality: 'CT', priority: 'stat', orderTime: '10:15', status: 'waiting', referringPhysician: 'Dr. Brown' },
      { id: '4', patientName: 'Sarah Wilson', examType: 'Pelvic Ultrasound', modality: 'Ultrasound', priority: 'routine', orderTime: '08:00', status: 'reading', referringPhysician: 'Dr. Davis' },
    ]);
    setLoading(false);
  }, []);

  const priorityConfig = {
    routine: { color: 'gray', label: 'Routine' },
    urgent: { color: 'orange', label: 'Urgent' },
    stat: { color: 'red', label: 'STAT' },
  };

  const statusConfig = {
    waiting: { color: 'yellow', label: 'Waiting' },
    'in-progress': { color: 'blue', label: 'In Progress' },
    completed: { color: 'green', label: 'Completed' },
    reading: { color: 'purple', label: 'Awaiting Read' },
  };

  const modalityColors = {
    'X-Ray': 'bg-blue-100 text-blue-800',
    'CT': 'bg-purple-100 text-purple-800',
    'MRI': 'bg-green-100 text-green-800',
    'Ultrasound': 'bg-pink-100 text-pink-800',
    'Mammogram': 'bg-orange-100 text-orange-800',
    'PET': 'bg-red-100 text-red-800',
  };

  if (loading) return <div className="animate-pulse h-64 bg-gray-100 rounded-lg" />;

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Imaging Queue</h3>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-1 border rounded-lg text-sm"
        >
          <option value="all">All Status</option>
          <option value="waiting">Waiting</option>
          <option value="in-progress">In Progress</option>
          <option value="reading">Awaiting Read</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="space-y-3">
        {filteredOrders.map((order) => (
          <div key={order.id} className={\`p-4 border rounded-lg hover:bg-gray-50 \${order.priority === 'stat' ? 'border-red-300 bg-red-50' : ''}\`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className={\`p-2 rounded-lg \${modalityColors[order.modality]}\`}>
                  <Image className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{order.patientName}</p>
                    {order.priority !== 'routine' && (
                      <span className={\`px-2 py-0.5 rounded text-xs font-bold bg-\${priorityConfig[order.priority].color}-100 text-\${priorityConfig[order.priority].color}-800\`}>
                        {priorityConfig[order.priority].label}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{order.examType}</p>
                  <p className="text-xs text-gray-400 mt-1">Ordered by {order.referringPhysician}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={\`px-2 py-1 rounded-full text-xs font-medium bg-\${statusConfig[order.status].color}-100 text-\${statusConfig[order.status].color}-800\`}>
                  {statusConfig[order.status].label}
                </span>
                <p className="text-xs text-gray-400 mt-2 flex items-center justify-end gap-1">
                  <Clock className="w-3 h-3" /> {order.orderTime}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`;
}

export function generateScanViewer(options: HealthcareSpecialtyOptions = {}): string {
  return `import { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Maximize2, Download, ChevronLeft, ChevronRight } from 'lucide-react';

interface ScanViewerProps {
  studyId: string;
  images: string[];
  patientName: string;
  examType: string;
  examDate: string;
}

export default function ScanViewer({ studyId, images, patientName, examType, examDate }: ScanViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const goToPrevious = () => setCurrentIndex(prev => Math.max(0, prev - 1));
  const goToNext = () => setCurrentIndex(prev => Math.min(images.length - 1, prev + 1));

  return (
    <div className="bg-black rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gray-900 px-4 py-2 flex items-center justify-between text-white">
        <div>
          <p className="font-medium">{patientName}</p>
          <p className="text-sm text-gray-400">{examType} - {new Date(examDate).toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleZoomOut} className="p-2 hover:bg-gray-700 rounded">
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="text-sm">{Math.round(zoom * 100)}%</span>
          <button onClick={handleZoomIn} className="p-2 hover:bg-gray-700 rounded">
            <ZoomIn className="w-5 h-5" />
          </button>
          <button onClick={handleRotate} className="p-2 hover:bg-gray-700 rounded">
            <RotateCw className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-gray-700 rounded">
            <Maximize2 className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-gray-700 rounded">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Viewer */}
      <div className="relative h-[600px] flex items-center justify-center bg-black">
        <div
          className="transition-transform duration-200"
          style={{
            transform: \`scale(\${zoom}) rotate(\${rotation}deg)\`,
          }}
        >
          {/* Placeholder for actual DICOM viewer */}
          <div className="w-[512px] h-[512px] bg-gray-800 flex items-center justify-center text-gray-500">
            <p>Image {currentIndex + 1} of {images.length}</p>
          </div>
        </div>

        {/* Navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              disabled={currentIndex === 0}
              className="absolute left-4 p-2 bg-gray-800 rounded-full text-white hover:bg-gray-700 disabled:opacity-50"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={goToNext}
              disabled={currentIndex === images.length - 1}
              className="absolute right-4 p-2 bg-gray-800 rounded-full text-white hover:bg-gray-700 disabled:opacity-50"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="bg-gray-900 p-2 flex gap-2 overflow-x-auto">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={\`w-16 h-16 bg-gray-700 rounded flex-shrink-0 \${i === currentIndex ? 'ring-2 ring-blue-500' : ''}\`}
            />
          ))}
        </div>
      )}
    </div>
  );
}`;
}

// ============================================
// HOME CARE COMPONENTS
// ============================================

export function generateHomeCareStats(options: HealthcareSpecialtyOptions = {}): string {
  return `import { useEffect, useState } from 'react';
import { Home, Users, Car, Clock } from 'lucide-react';

interface HomeCareStats {
  activePatients: number;
  todayVisits: number;
  caregivers: number;
  avgVisitDuration: string;
}

export default function HomeCareStats() {
  const [stats, setStats] = useState<HomeCareStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setStats({
      activePatients: 78,
      todayVisits: 24,
      caregivers: 15,
      avgVisitDuration: '1.5h'
    });
    setLoading(false);
  }, []);

  if (loading) return <div className="animate-pulse h-32 bg-gray-100 rounded-lg" />;

  const statCards = [
    { label: 'Active Patients', value: stats?.activePatients, icon: Users, color: 'blue' },
    { label: "Today's Visits", value: stats?.todayVisits, icon: Home, color: 'green' },
    { label: 'Caregivers', value: stats?.caregivers, icon: Car, color: 'purple' },
    { label: 'Avg Visit Duration', value: stats?.avgVisitDuration, icon: Clock, color: 'orange' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => (
        <div key={stat.label} className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </div>
            <div className={\`p-3 rounded-lg bg-\${stat.color}-100\`}>
              <stat.icon className={\`w-6 h-6 text-\${stat.color}-600\`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}`;
}

export function generateVisitScheduleMap(options: HealthcareSpecialtyOptions = {}): string {
  return `import { useState, useEffect } from 'react';
import { MapPin, Clock, User, Navigation } from 'lucide-react';

interface ScheduledVisit {
  id: string;
  patientName: string;
  address: string;
  scheduledTime: string;
  visitType: string;
  caregiver: string;
  status: 'scheduled' | 'in-transit' | 'in-progress' | 'completed';
  duration: number;
}

export default function VisitScheduleMap() {
  const [visits, setVisits] = useState<ScheduledVisit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setVisits([
      { id: '1', patientName: 'Eleanor Thompson', address: '123 Oak Street', scheduledTime: '09:00', visitType: 'Nursing Care', caregiver: 'Mary Johnson', status: 'completed', duration: 60 },
      { id: '2', patientName: 'Robert Williams', address: '456 Maple Ave', scheduledTime: '10:30', visitType: 'Physical Therapy', caregiver: 'Mary Johnson', status: 'in-progress', duration: 45 },
      { id: '3', patientName: 'Margaret Davis', address: '789 Pine Road', scheduledTime: '12:00', visitType: 'Medication Management', caregiver: 'Mary Johnson', status: 'scheduled', duration: 30 },
      { id: '4', patientName: 'James Miller', address: '321 Elm Street', scheduledTime: '14:00', visitType: 'Wound Care', caregiver: 'Mary Johnson', status: 'scheduled', duration: 45 },
    ]);
    setLoading(false);
  }, []);

  const statusConfig = {
    scheduled: { color: 'gray', label: 'Scheduled' },
    'in-transit': { color: 'blue', label: 'In Transit' },
    'in-progress': { color: 'green', label: 'In Progress' },
    completed: { color: 'gray', label: 'Completed', opacity: true },
  };

  if (loading) return <div className="animate-pulse h-96 bg-gray-100 rounded-lg" />;

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Map placeholder */}
        <div className="h-[400px] bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-2" />
            <p>Map View</p>
            <p className="text-sm">Integration with mapping service</p>
          </div>
        </div>

        {/* Visit list */}
        <div className="p-4 max-h-[400px] overflow-y-auto">
          <h3 className="font-semibold mb-4">Today's Route</h3>
          <div className="space-y-3">
            {visits.map((visit, index) => (
              <div
                key={visit.id}
                className={\`p-3 border rounded-lg \${statusConfig[visit.status].opacity ? 'opacity-50' : ''}\`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className={\`w-8 h-8 rounded-full bg-\${statusConfig[visit.status].color}-100 flex items-center justify-center text-sm font-bold text-\${statusConfig[visit.status].color}-800\`}>
                      {index + 1}
                    </div>
                    {index < visits.length - 1 && (
                      <div className="w-0.5 h-8 bg-gray-200 my-1" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{visit.patientName}</p>
                      <span className={\`px-2 py-0.5 rounded text-xs bg-\${statusConfig[visit.status].color}-100 text-\${statusConfig[visit.status].color}-800\`}>
                        {statusConfig[visit.status].label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" /> {visit.address}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {visit.scheduledTime} ({visit.duration}min)
                      </span>
                      <span>{visit.visitType}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}`;
}

export function generateCaregiverAssignment(options: HealthcareSpecialtyOptions = {}): string {
  return `import { useState, useEffect } from 'react';
import { User, MapPin, Clock, Star } from 'lucide-react';

interface Caregiver {
  id: string;
  name: string;
  role: string;
  skills: string[];
  availability: string;
  currentPatients: number;
  rating: number;
  distance?: string;
}

interface CaregiverAssignmentProps {
  patientId: string;
  patientAddress: string;
  requiredSkills: string[];
  onAssign?: (caregiverId: string) => void;
}

export default function CaregiverAssignment({ patientId, patientAddress, requiredSkills, onAssign }: CaregiverAssignmentProps) {
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCaregivers([
      { id: '1', name: 'Mary Johnson, RN', role: 'Registered Nurse', skills: ['Wound Care', 'IV Therapy', 'Medication Management'], availability: 'Mon-Fri 8am-4pm', currentPatients: 6, rating: 4.9, distance: '2.3 mi' },
      { id: '2', name: 'David Lee, CNA', role: 'Certified Nursing Assistant', skills: ['Personal Care', 'Mobility Assistance', 'Vital Signs'], availability: 'Mon-Sat 7am-3pm', currentPatients: 8, rating: 4.7, distance: '3.1 mi' },
      { id: '3', name: 'Sarah Martinez, PT', role: 'Physical Therapist', skills: ['Physical Therapy', 'Fall Prevention', 'Mobility Training'], availability: 'Tue-Sat 9am-5pm', currentPatients: 5, rating: 4.8, distance: '4.5 mi' },
    ]);
    setLoading(false);
  }, [patientId]);

  if (loading) return <div className="animate-pulse h-64 bg-gray-100 rounded-lg" />;

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">Assign Caregiver</h3>

      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Required skills:</strong> {requiredSkills.join(', ')}
        </p>
      </div>

      <div className="space-y-4">
        {caregivers.map((caregiver) => {
          const hasRequiredSkills = requiredSkills.every(skill =>
            caregiver.skills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
          );

          return (
            <div
              key={caregiver.id}
              className={\`p-4 border rounded-lg \${hasRequiredSkills ? 'border-green-200 bg-green-50' : ''}\`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium">{caregiver.name}</p>
                    <p className="text-sm text-gray-500">{caregiver.role}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-1 text-sm text-yellow-600">
                        <Star className="w-3 h-3 fill-current" /> {caregiver.rating}
                      </span>
                      <span className="text-sm text-gray-400">|</span>
                      <span className="text-sm text-gray-500">{caregiver.currentPatients} patients</span>
                      {caregiver.distance && (
                        <>
                          <span className="text-sm text-gray-400">|</span>
                          <span className="flex items-center gap-1 text-sm text-gray-500">
                            <MapPin className="w-3 h-3" /> {caregiver.distance}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {caregiver.skills.map((skill) => (
                        <span
                          key={skill}
                          className={\`px-2 py-0.5 rounded text-xs \${
                            requiredSkills.some(s => skill.toLowerCase().includes(s.toLowerCase()))
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600'
                          }\`}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onAssign?.(caregiver.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                >
                  Assign
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}`;
}

// ============================================
// LAB/DIAGNOSTICS COMPONENTS
// ============================================

export function generateLabStats(options: HealthcareSpecialtyOptions = {}): string {
  return `import { useEffect, useState } from 'react';
import { TestTube, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

interface LabStats {
  pendingTests: number;
  inProgress: number;
  completedToday: number;
  criticalResults: number;
}

export default function LabStats() {
  const [stats, setStats] = useState<LabStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setStats({
      pendingTests: 45,
      inProgress: 12,
      completedToday: 78,
      criticalResults: 3
    });
    setLoading(false);
  }, []);

  if (loading) return <div className="animate-pulse h-32 bg-gray-100 rounded-lg" />;

  const statCards = [
    { label: 'Pending Tests', value: stats?.pendingTests, icon: Clock, color: 'yellow' },
    { label: 'In Progress', value: stats?.inProgress, icon: TestTube, color: 'blue' },
    { label: 'Completed Today', value: stats?.completedToday, icon: CheckCircle, color: 'green' },
    { label: 'Critical Results', value: stats?.criticalResults, icon: AlertTriangle, color: 'red' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => (
        <div key={stat.label} className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </div>
            <div className={\`p-3 rounded-lg bg-\${stat.color}-100\`}>
              <stat.icon className={\`w-6 h-6 text-\${stat.color}-600\`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}`;
}

export function generateLabResults(options: HealthcareSpecialtyOptions = {}): string {
  return `import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';

interface LabResult {
  testName: string;
  value: number;
  unit: string;
  referenceRange: { min: number; max: number };
  previousValue?: number;
  date: string;
  status: 'normal' | 'high' | 'low' | 'critical';
}

interface LabResultsProps {
  patientId: string;
  orderId?: string;
}

export default function LabResults({ patientId, orderId }: LabResultsProps) {
  const [results, setResults] = useState<LabResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setResults([
      { testName: 'Glucose (Fasting)', value: 126, unit: 'mg/dL', referenceRange: { min: 70, max: 100 }, previousValue: 118, date: '2024-01-18', status: 'high' },
      { testName: 'Hemoglobin A1C', value: 6.8, unit: '%', referenceRange: { min: 4, max: 5.6 }, previousValue: 6.5, date: '2024-01-18', status: 'high' },
      { testName: 'Total Cholesterol', value: 195, unit: 'mg/dL', referenceRange: { min: 0, max: 200 }, previousValue: 210, date: '2024-01-18', status: 'normal' },
      { testName: 'HDL Cholesterol', value: 55, unit: 'mg/dL', referenceRange: { min: 40, max: 200 }, previousValue: 52, date: '2024-01-18', status: 'normal' },
      { testName: 'LDL Cholesterol', value: 130, unit: 'mg/dL', referenceRange: { min: 0, max: 100 }, previousValue: 145, date: '2024-01-18', status: 'high' },
      { testName: 'Potassium', value: 3.2, unit: 'mEq/L', referenceRange: { min: 3.5, max: 5.0 }, date: '2024-01-18', status: 'low' },
    ]);
    setLoading(false);
  }, [patientId, orderId]);

  const statusConfig = {
    normal: { color: 'green', icon: Minus },
    high: { color: 'red', icon: TrendingUp },
    low: { color: 'blue', icon: TrendingDown },
    critical: { color: 'red', icon: AlertTriangle },
  };

  const getTrend = (current: number, previous?: number) => {
    if (!previous) return null;
    if (current > previous) return <TrendingUp className="w-4 h-4 text-red-500" />;
    if (current < previous) return <TrendingDown className="w-4 h-4 text-green-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  if (loading) return <div className="animate-pulse h-64 bg-gray-100 rounded-lg" />;

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">Lab Results</h3>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Test</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Result</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Trend</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Reference Range</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {results.map((result) => {
              const config = statusConfig[result.status];
              const StatusIcon = config.icon;

              return (
                <tr key={result.testName} className={result.status === 'critical' ? 'bg-red-50' : ''}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{result.testName}</p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={\`font-bold \${result.status !== 'normal' ? \`text-\${config.color}-600\` : ''}\`}>
                      {result.value}
                    </span>
                    <span className="text-gray-500 ml-1">{result.unit}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {getTrend(result.value, result.previousValue)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {result.referenceRange.min} - {result.referenceRange.max} {result.unit}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={\`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-\${config.color}-100 text-\${config.color}-800\`}>
                      <StatusIcon className="w-3 h-3" />
                      {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}`;
}

export function generateTestOrderForm(options: HealthcareSpecialtyOptions = {}): string {
  return `import { useState } from 'react';
import { Search, Plus, X } from 'lucide-react';

interface TestPanel {
  id: string;
  name: string;
  tests: string[];
  category: string;
}

interface TestOrderFormProps {
  patientId: string;
  onSubmit?: (tests: string[], notes: string) => void;
}

export default function TestOrderForm({ patientId, onSubmit }: TestOrderFormProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<'routine' | 'urgent' | 'stat'>('routine');

  const testPanels: TestPanel[] = [
    { id: '1', name: 'Basic Metabolic Panel (BMP)', tests: ['Glucose', 'BUN', 'Creatinine', 'Sodium', 'Potassium', 'Chloride', 'CO2'], category: 'Chemistry' },
    { id: '2', name: 'Complete Blood Count (CBC)', tests: ['WBC', 'RBC', 'Hemoglobin', 'Hematocrit', 'Platelets'], category: 'Hematology' },
    { id: '3', name: 'Lipid Panel', tests: ['Total Cholesterol', 'HDL', 'LDL', 'Triglycerides'], category: 'Chemistry' },
    { id: '4', name: 'Liver Function Tests', tests: ['ALT', 'AST', 'Alkaline Phosphatase', 'Bilirubin', 'Albumin'], category: 'Chemistry' },
    { id: '5', name: 'Thyroid Panel', tests: ['TSH', 'T3', 'T4', 'Free T4'], category: 'Endocrine' },
    { id: '6', name: 'Hemoglobin A1C', tests: ['HbA1c'], category: 'Diabetes' },
    { id: '7', name: 'Urinalysis', tests: ['UA with Microscopy'], category: 'Urinalysis' },
  ];

  const filteredPanels = testPanels.filter(panel =>
    panel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    panel.tests.some(test => test.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const addTest = (panelName: string) => {
    if (!selectedTests.includes(panelName)) {
      setSelectedTests([...selectedTests, panelName]);
    }
  };

  const removeTest = (panelName: string) => {
    setSelectedTests(selectedTests.filter(t => t !== panelName));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">Order Lab Tests</h3>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search tests or panels..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg"
        />
      </div>

      {/* Selected Tests */}
      {selectedTests.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium text-blue-800 mb-2">Selected Tests:</p>
          <div className="flex flex-wrap gap-2">
            {selectedTests.map((test) => (
              <span key={test} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {test}
                <button onClick={() => removeTest(test)} className="hover:text-blue-600">
                  <X className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Test Panels */}
      <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
        {filteredPanels.map((panel) => (
          <div
            key={panel.id}
            className={\`p-3 border rounded-lg hover:bg-gray-50 cursor-pointer \${
              selectedTests.includes(panel.name) ? 'border-blue-500 bg-blue-50' : ''
            }\`}
            onClick={() => addTest(panel.name)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{panel.name}</p>
                <p className="text-xs text-gray-500">{panel.tests.join(', ')}</p>
              </div>
              <span className="text-xs px-2 py-1 bg-gray-100 rounded">{panel.category}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Priority */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
        <div className="flex gap-2">
          {(['routine', 'urgent', 'stat'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPriority(p)}
              className={\`px-4 py-2 rounded-lg border text-sm font-medium \${
                priority === p
                  ? p === 'stat' ? 'bg-red-600 text-white border-red-600' :
                    p === 'urgent' ? 'bg-orange-500 text-white border-orange-500' :
                    'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 hover:bg-gray-50'
              }\`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Clinical Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
          rows={3}
          placeholder="Reason for testing, relevant clinical history..."
        />
      </div>

      <button
        onClick={() => onSubmit?.(selectedTests, notes)}
        disabled={selectedTests.length === 0}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Submit Lab Order ({selectedTests.length} tests)
      </button>
    </div>
  );
}`;
}
