// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/landing/Header';
import { Breadcrumb } from '../../components/ui/breadcrumb';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Medication as PillIcon,
  LocalPharmacy as PharmacyIcon,
  Refresh as RefreshIcon,
  Add as Plus,
  Close as CloseIcon,
  Send as SendIcon,
  History as HistoryIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as PendingIcon,
  Cancel as CancelIcon,
  Business as BuildingIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';

interface RefillRequest {
  id: string;
  medicationName: string;
  dosage: string;
  prescriptionNumber: string;
  pharmacy: {
    name: string;
    phone: string;
    address: string;
    email?: string;
  };
  requestDate: string;
  expectedDate?: string;
  status: 'pending' | 'approved' | 'ready' | 'completed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  notes?: string;
  refillsRemaining?: number;
  prescribedBy: string;
  lastRefillDate?: string;
}

const RefillRequests: React.FC = () => {
  const navigate = useNavigate();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  
  const [requests, setRequests] = useState<RefillRequest[]>([
    {
      id: '1',
      medicationName: 'Lisinopril',
      dosage: '10mg',
      prescriptionNumber: 'RX12345678',
      pharmacy: {
        name: 'CVS Pharmacy',
        phone: '(555) 123-4567',
        address: '123 Main St, City, ST 12345',
        email: 'refills@cvs.com'
      },
      requestDate: '2024-01-15',
      expectedDate: '2024-01-17',
      status: 'ready',
      priority: 'normal',
      notes: 'Ready for pickup',
      refillsRemaining: 2,
      prescribedBy: 'Dr. Smith',
      lastRefillDate: '2023-12-15'
    },
    {
      id: '2',
      medicationName: 'Metformin',
      dosage: '500mg',
      prescriptionNumber: 'RX87654321',
      pharmacy: {
        name: 'Walgreens',
        phone: '(555) 987-6543',
        address: '456 Oak Ave, City, ST 12345'
      },
      requestDate: '2024-01-16',
      expectedDate: '2024-01-18',
      status: 'pending',
      priority: 'high',
      notes: 'Expedited request',
      refillsRemaining: 1,
      prescribedBy: 'Dr. Johnson'
    },
    {
      id: '3',
      medicationName: 'Atorvastatin',
      dosage: '20mg',
      prescriptionNumber: 'RX11223344',
      pharmacy: {
        name: 'Rite Aid',
        phone: '(555) 456-7890',
        address: '789 Pine St, City, ST 12345'
      },
      requestDate: '2024-01-10',
      expectedDate: '2024-01-12',
      status: 'completed',
      priority: 'normal',
      refillsRemaining: 3,
      prescribedBy: 'Dr. Wilson',
      lastRefillDate: '2024-01-12'
    }
  ]);

  const [formData, setFormData] = useState({
    medicationName: '',
    dosage: '',
    prescriptionNumber: '',
    pharmacyName: '',
    pharmacyPhone: '',
    pharmacyAddress: '',
    priority: 'normal' as RefillRequest['priority'],
    notes: ''
  });

  const getStatusColor = (status: RefillRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500 text-white';
      case 'approved':
        return 'bg-blue-500 text-white';
      case 'ready':
        return 'bg-green-500 text-white';
      case 'completed':
        return 'bg-gray-500 text-white';
      case 'cancelled':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getPriorityColor = (priority: RefillRequest['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500/20 text-red-400';
      case 'high':
        return 'bg-orange-500/20 text-orange-400';
      case 'normal':
        return 'bg-blue-500/20 text-blue-400';
      case 'low':
        return 'bg-white/10 text-white/60';
      default:
        return 'bg-white/10 text-white/60';
    }
  };

  const getStatusIcon = (status: RefillRequest['status']) => {
    switch (status) {
      case 'pending':
        return <PendingIcon className="h-4 w-4 text-yellow-400" />;
      case 'approved':
        return <CheckCircleIcon className="h-4 w-4 text-blue-400" />;
      case 'ready':
        return <CheckCircleIcon className="h-4 w-4 text-green-400" />;
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4 text-white/60" />;
      case 'cancelled':
        return <CancelIcon className="h-4 w-4 text-red-400" />;
      default:
        return <PendingIcon className="h-4 w-4 text-white/60" />;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newRequest: RefillRequest = {
      id: Date.now().toString(),
      medicationName: formData.medicationName,
      dosage: formData.dosage,
      prescriptionNumber: formData.prescriptionNumber,
      pharmacy: {
        name: formData.pharmacyName,
        phone: formData.pharmacyPhone,
        address: formData.pharmacyAddress
      },
      requestDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      priority: formData.priority,
      notes: formData.notes,
      prescribedBy: 'Dr. Unknown' // In real app, this would come from prescription data
    };

    setRequests(prev => [newRequest, ...prev]);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      medicationName: '',
      dosage: '',
      prescriptionNumber: '',
      pharmacyName: '',
      pharmacyPhone: '',
      pharmacyAddress: '',
      priority: 'normal',
      notes: ''
    });
    setShowRequestForm(false);
  };

  const cancelRequest = (id: string) => {
    setRequests(prev => prev.map(req => 
      req.id === id ? { ...req, status: 'cancelled' as const } : req
    ));
  };

  const activeRequests = requests.filter(r => ['pending', 'approved', 'ready'].includes(r.status));
  const historyRequests = requests.filter(r => ['completed', 'cancelled'].includes(r.status));

  const breadcrumbItems = [
    { label: 'Health Manager', href: '/health' },
    { label: 'Medications', href: '/health/medications', icon: PillIcon },
    { label: 'Refill Requests', icon: RefreshIcon }
  ];

  return (
    <div className="min-h-screen relative">
      <BackgroundEffects />
      <Header />

      {/* Breadcrumb Navigation */}
      <div className="bg-white/5 backdrop-blur-sm border-b border-white/10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header Section */}
        <div className="mb-8 p-8 rounded-3xl bg-teal-500/10 border border-teal-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Prescription Refills
              </h1>
              <p className="text-lg text-white/60">
                Request and track your medication refills
              </p>
            </div>
            <Button
              onClick={() => setShowRequestForm(true)}
              className="rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60 mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-400">
                  {requests.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-yellow-500/20">
                <PendingIcon className="h-8 w-8 text-yellow-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60 mb-1">Ready</p>
                <p className="text-3xl font-bold text-green-400">
                  {requests.filter(r => r.status === 'ready').length}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-green-500/20">
                <CheckCircleIcon className="h-8 w-8 text-green-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60 mb-1">Total Requests</p>
                <p className="text-3xl font-bold text-teal-400">
                  {requests.length}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-teal-500/20">
                <RefreshIcon className="h-8 w-8 text-teal-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60 mb-1">This Month</p>
                <p className="text-3xl font-bold text-purple-400">
                  {requests.filter(r => {
                    const requestMonth = new Date(r.requestDate).getMonth();
                    const currentMonth = new Date().getMonth();
                    return requestMonth === currentMonth;
                  }).length}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-purple-500/20">
                <CalendarIcon className="h-8 w-8 text-purple-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-white/5 border border-white/10 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('active')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                activeTab === 'active'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              Active Requests ({activeRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <HistoryIcon className="h-4 w-4 mr-2 inline" />
              History ({historyRequests.length})
            </button>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-6">
          {(activeTab === 'active' ? activeRequests : historyRequests).length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {(activeTab === 'active' ? activeRequests : historyRequests).map((request) => (
                <Card
                  key={request.id}
                  className="rounded-2xl hover:border-teal-500/30 transition-all duration-300 bg-white/5 border border-white/10"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-teal-500/20">
                          <PillIcon className="h-6 w-6 text-teal-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">
                            {request.medicationName}
                          </h3>
                          <p className="text-sm text-white/60">
                            {request.dosage} • Rx: {request.prescriptionNumber}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`rounded-full px-3 py-1 text-xs font-semibold ${getPriorityColor(request.priority)}`}>
                          {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                        </Badge>
                        <Badge className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(request.status)}`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Request Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center gap-2 mb-3">
                          <CalendarIcon className="h-4 w-4 text-teal-400" />
                          <p className="font-semibold text-white">Request Details</p>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-white/60">Requested:</span>
                            <span className="text-white">{request.requestDate}</span>
                          </div>
                          {request.expectedDate && (
                            <div className="flex justify-between">
                              <span className="text-white/60">Expected:</span>
                              <span className="text-white">{request.expectedDate}</span>
                            </div>
                          )}
                          {request.refillsRemaining && (
                            <div className="flex justify-between">
                              <span className="text-white/60">Refills Left:</span>
                              <span className="text-white">{request.refillsRemaining}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center gap-2 mb-3">
                          <PharmacyIcon className="h-4 w-4 text-teal-400" />
                          <p className="font-semibold text-white">Pharmacy</p>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div>
                            <p className="font-medium text-white">{request.pharmacy.name}</p>
                            <p className="text-white/60">{request.pharmacy.address}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <PhoneIcon className="h-3 w-3 text-white/50" />
                            <span className="text-white/60">{request.pharmacy.phone}</span>
                          </div>
                          {request.pharmacy.email && (
                            <div className="flex items-center gap-2">
                              <EmailIcon className="h-3 w-3 text-white/50" />
                              <span className="text-white/60">{request.pharmacy.email}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status Update */}
                    <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/20">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(request.status)}
                        <p className="font-semibold text-white">
                          Status: {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </p>
                      </div>
                      {request.notes && (
                        <p className="text-sm text-white/60 mt-2">{request.notes}</p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {activeTab === 'active' && (
                      <div className="flex gap-2 pt-2">
                        {request.status === 'ready' && (
                          <Button
                            className="flex-1 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30"
                          >
                            <CheckCircleIcon className="h-4 w-4 mr-2" />
                            Mark as Picked Up
                          </Button>
                        )}
                        {request.status === 'pending' && (
                          <Button
                            variant="outline"
                            onClick={() => cancelRequest(request.id)}
                            className="flex-1 rounded-xl bg-transparent border-red-500/30 text-red-400 hover:bg-red-500/10"
                          >
                            <CancelIcon className="h-4 w-4 mr-2" />
                            Cancel Request
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          onClick={() => window.open(`tel:${request.pharmacy.phone}`)}
                          className="flex-1 rounded-xl bg-transparent border-teal-500/30 text-teal-400 hover:bg-teal-500/10"
                        >
                          <PhoneIcon className="h-4 w-4 mr-2" />
                          Call Pharmacy
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="rounded-2xl p-12 text-center bg-white/5 border border-white/10">
              <div className="max-w-md mx-auto">
                <div className="p-4 rounded-full mx-auto w-20 h-20 flex items-center justify-center mb-6 bg-teal-500/20">
                  <RefreshIcon className="h-10 w-10 text-teal-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  No {activeTab === 'active' ? 'Active' : 'Historical'} Requests
                </h3>
                <p className="text-white/60 mb-6">
                  {activeTab === 'active'
                    ? 'Start by creating a refill request for your medications'
                    : 'Your completed and cancelled requests will appear here'
                  }
                </p>
                {activeTab === 'active' && (
                  <Button
                    onClick={() => setShowRequestForm(true)}
                    className="rounded-xl px-6 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Request
                  </Button>
                )}
              </div>
            </Card>
          )}
        </div>
      </main>

      {/* New Request Modal */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10"
            style={{ backgroundColor: '#0f172a' }}
          >
            <div className="p-6 border-b border-white/10">
              <div className="flex justify-between items-center">
                <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
                  <RefreshIcon className="h-5 w-5 text-teal-400" />
                  New Refill Request
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={resetForm}
                  className="text-white/60 hover:text-white hover:bg-white/10"
                >
                  <CloseIcon className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Medication Information */}
                <div className="p-6 rounded-xl bg-white/5 border border-white/10 border-l-4 border-l-teal-500">
                  <h3 className="text-lg font-semibold mb-4 text-white">Medication Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="medicationName" className="text-white/80">Medication Name *</Label>
                      <input
                        type="text"
                        id="medicationName"
                        value={formData.medicationName}
                        onChange={(e) => setFormData(prev => ({ ...prev, medicationName: e.target.value }))}
                        required
                        className="w-full h-10 px-3 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dosage" className="text-white/80">Dosage *</Label>
                      <input
                        type="text"
                        id="dosage"
                        value={formData.dosage}
                        onChange={(e) => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
                        placeholder="e.g., 10mg, 1 tablet"
                        required
                        className="w-full h-10 px-3 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="prescriptionNumber" className="text-white/80">Prescription Number *</Label>
                    <input
                      type="text"
                      id="prescriptionNumber"
                      value={formData.prescriptionNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, prescriptionNumber: e.target.value }))}
                      placeholder="e.g., RX12345678"
                      required
                      className="w-full h-10 px-3 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
                    />
                  </div>
                </div>

                {/* Pharmacy Information */}
                <div className="p-6 rounded-xl bg-white/5 border border-white/10 border-l-4 border-l-teal-500">
                  <h3 className="text-lg font-semibold mb-4 text-white">Pharmacy Information</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="pharmacyName" className="text-white/80">Pharmacy Name *</Label>
                      <input
                        type="text"
                        id="pharmacyName"
                        value={formData.pharmacyName}
                        onChange={(e) => setFormData(prev => ({ ...prev, pharmacyName: e.target.value }))}
                        placeholder="e.g., CVS Pharmacy"
                        required
                        className="w-full h-10 px-3 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="pharmacyPhone" className="text-white/80">Phone Number *</Label>
                        <input
                          type="text"
                          id="pharmacyPhone"
                          value={formData.pharmacyPhone}
                          onChange={(e) => setFormData(prev => ({ ...prev, pharmacyPhone: e.target.value }))}
                          placeholder="(555) 123-4567"
                          required
                          className="w-full h-10 px-3 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500"
                          style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
                        />
                      </div>
                      <div>
                        <Label className="text-white/80">Priority</Label>
                        <select
                          value={formData.priority}
                          onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as RefillRequest['priority'] }))}
                          className="w-full h-10 px-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                          style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
                        >
                          <option value="low" style={{ backgroundColor: '#1e293b' }}>Low</option>
                          <option value="normal" style={{ backgroundColor: '#1e293b' }}>Normal</option>
                          <option value="high" style={{ backgroundColor: '#1e293b' }}>High</option>
                          <option value="urgent" style={{ backgroundColor: '#1e293b' }}>Urgent</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="pharmacyAddress" className="text-white/80">Address *</Label>
                      <input
                        type="text"
                        id="pharmacyAddress"
                        value={formData.pharmacyAddress}
                        onChange={(e) => setFormData(prev => ({ ...prev, pharmacyAddress: e.target.value }))}
                        placeholder="123 Main St, City, ST 12345"
                        required
                        className="w-full h-10 px-3 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes" className="text-white/80">Additional Notes</Label>
                  <textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any special instructions or notes..."
                    rows={3}
                    className="w-full p-3 rounded-xl text-white placeholder:text-white/40 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"
                    style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="flex-1 rounded-xl bg-transparent border-white/20 text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                  >
                    <SendIcon className="h-4 w-4 mr-2" />
                    Submit Request
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefillRequests;