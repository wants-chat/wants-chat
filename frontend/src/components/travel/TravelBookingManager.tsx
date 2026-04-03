import React, { useState } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Home, 
  Car, 
  Plane, 
  Train, 
  Bus,
  Calendar,
  MapPin,
  DollarSign,
  Phone,
  Mail,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useConfirm } from '../../contexts/ConfirmDialogContext';
import type { TravelPlan, Accommodation, Transportation } from '../../services/travelService';

interface TravelBookingManagerProps {
  plan: TravelPlan;
  onUpdate: (updatedPlan: TravelPlan) => void;
  className?: string;
}

const TravelBookingManager: React.FC<TravelBookingManagerProps> = ({
  plan,
  onUpdate,
  className = ''
}) => {
  const { confirm } = useConfirm();
  const [activeTab, setActiveTab] = useState<'accommodations' | 'transportation'>('accommodations');
  const [editingAccommodation, setEditingAccommodation] = useState<string | null>(null);
  const [editingTransportation, setEditingTransportation] = useState<string | null>(null);
  const [addingAccommodation, setAddingAccommodation] = useState(false);
  const [addingTransportation, setAddingTransportation] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'booked':
        return 'bg-blue-100 text-blue-800';
      case 'planned':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-white/10 backdrop-blur-xl border border-white/20 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'booked':
        return <CheckCircle className="h-4 w-4" />;
      case 'planned':
        return <Clock className="h-4 w-4" />;
      case 'cancelled':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getAccommodationIcon = (type: Accommodation['type']) => {
    return <Home className="h-4 w-4" />;
  };

  const getTransportationIcon = (type: Transportation['type']) => {
    switch (type) {
      case 'flight':
        return <Plane className="h-4 w-4" />;
      case 'train':
        return <Train className="h-4 w-4" />;
      case 'bus':
        return <Bus className="h-4 w-4" />;
      case 'car_rental':
      case 'taxi':
        return <Car className="h-4 w-4" />;
      default:
        return <Car className="h-4 w-4" />;
    }
  };

  const handleAddAccommodation = async (accommodationData: Omit<Accommodation, 'id' | 'planId' | 'createdAt' | 'updatedAt'>) => {
    const newAccommodation: Accommodation = {
      id: `temp_${Date.now()}`,
      planId: plan.id,
      ...accommodationData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedPlan = {
      ...plan,
      accommodations: [...plan.accommodations, newAccommodation]
    };

    onUpdate(updatedPlan);
    setAddingAccommodation(false);
  };

  const handleUpdateAccommodation = async (accommodationId: string, updates: Partial<Accommodation>) => {
    const updatedPlan = {
      ...plan,
      accommodations: plan.accommodations.map(acc =>
        acc.id === accommodationId
          ? { ...acc, ...updates, updatedAt: new Date().toISOString() }
          : acc
      )
    };

    onUpdate(updatedPlan);
    setEditingAccommodation(null);
  };

  const handleDeleteAccommodation = async (accommodationId: string) => {
    const confirmed = await confirm({
      title: 'Delete Accommodation',
      message: 'Are you sure you want to delete this accommodation?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive'
    });

    if (!confirmed) return;

    const updatedPlan = {
      ...plan,
      accommodations: plan.accommodations.filter(acc => acc.id !== accommodationId)
    };

    onUpdate(updatedPlan);
  };

  const handleAddTransportation = async (transportationData: Omit<Transportation, 'id' | 'planId' | 'createdAt' | 'updatedAt'>) => {
    const newTransportation: Transportation = {
      id: `temp_${Date.now()}`,
      planId: plan.id,
      ...transportationData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedPlan = {
      ...plan,
      transportation: [...plan.transportation, newTransportation]
    };

    onUpdate(updatedPlan);
    setAddingTransportation(false);
  };

  const handleUpdateTransportation = async (transportationId: string, updates: Partial<Transportation>) => {
    const updatedPlan = {
      ...plan,
      transportation: plan.transportation.map(trans =>
        trans.id === transportationId
          ? { ...trans, ...updates, updatedAt: new Date().toISOString() }
          : trans
      )
    };

    onUpdate(updatedPlan);
    setEditingTransportation(null);
  };

  const handleDeleteTransportation = async (transportationId: string) => {
    const confirmed = await confirm({
      title: 'Delete Transportation',
      message: 'Are you sure you want to delete this transportation?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive'
    });

    if (!confirmed) return;

    const updatedPlan = {
      ...plan,
      transportation: plan.transportation.filter(trans => trans.id !== transportationId)
    };

    onUpdate(updatedPlan);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <h2 className="text-2xl font-bold mb-2 text-white">Booking Management</h2>
        <p className="text-white/80">
          Manage your accommodations and transportation bookings
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="accommodations" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Accommodations ({plan.accommodations.length})
          </TabsTrigger>
          <TabsTrigger value="transportation" className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            Transportation ({plan.transportation.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accommodations" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Accommodations</h3>
            <Button onClick={() => setAddingAccommodation(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Accommodation
            </Button>
          </div>

          {/* Add Accommodation Form */}
          {addingAccommodation && (
            <AccommodationForm
              onSave={handleAddAccommodation}
              onCancel={() => setAddingAccommodation(false)}
              plan={plan}
            />
          )}

          {/* Accommodations List */}
          <div className="space-y-4">
            {plan.accommodations.length === 0 ? (
              <Card className="p-8 text-center bg-white/10 backdrop-blur-xl border border-white/20">
                <Home className="h-12 w-12 mx-auto mb-4 text-white/60" />
                <h3 className="text-lg font-semibold mb-2 text-white">No accommodations yet</h3>
                <p className="text-white/80 mb-4">
                  Add your hotel, Airbnb, or other accommodation bookings
                </p>
                <Button onClick={() => setAddingAccommodation(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Accommodation
                </Button>
              </Card>
            ) : (
              plan.accommodations.map((accommodation) => (
                <Card key={accommodation.id}>
                  <CardContent className="p-6">
                    {editingAccommodation === accommodation.id ? (
                      <AccommodationForm
                        initialData={accommodation}
                        onSave={(data) => handleUpdateAccommodation(accommodation.id, data)}
                        onCancel={() => setEditingAccommodation(null)}
                        plan={plan}
                      />
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center">
                              {getAccommodationIcon(accommodation.type)}
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold">{accommodation.name}</h4>
                              <p className="text-white/80">{accommodation.address}</p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-white/80">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(accommodation.checkInDate).toLocaleDateString()} - {new Date(accommodation.checkOutDate).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  {accommodation.nights} nights
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(accommodation.status)}>
                              {getStatusIcon(accommodation.status)}
                              <span className="ml-1 capitalize">{accommodation.status}</span>
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingAccommodation(accommodation.id)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteAccommodation(accommodation.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-white">Cost</p>
                            <p className="text-white/80">
                              {accommodation.cost.totalAmount} {accommodation.cost.currency} total
                              <br />
                              {accommodation.cost.perNight} per night
                            </p>
                          </div>

                          {accommodation.booking.confirmationNumber && (
                            <div>
                              <p className="font-medium text-white">Confirmation</p>
                              <p className="text-white/80">
                                {accommodation.booking.confirmationNumber}
                              </p>
                            </div>
                          )}

                          {accommodation.amenities && accommodation.amenities.length > 0 && (
                            <div>
                              <p className="font-medium text-white">Amenities</p>
                              <p className="text-white/80">
                                {accommodation.amenities.slice(0, 3).join(', ')}
                                {accommodation.amenities.length > 3 && ` +${accommodation.amenities.length - 3} more`}
                              </p>
                            </div>
                          )}
                        </div>

                        {accommodation.booking.website && (
                          <div className="pt-4 border-t">
                            <a
                              href={accommodation.booking.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-primary hover:underline"
                            >
                              <ExternalLink className="h-4 w-4" />
                              View Booking Details
                            </a>
                          </div>
                        )}

                        {accommodation.notes && (
                          <div className="pt-4 border-t">
                            <p className="text-sm text-white/80">
                              <strong>Notes:</strong> {accommodation.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="transportation" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Transportation</h3>
            <Button onClick={() => setAddingTransportation(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Transportation
            </Button>
          </div>

          {/* Add Transportation Form */}
          {addingTransportation && (
            <TransportationForm
              onSave={handleAddTransportation}
              onCancel={() => setAddingTransportation(false)}
              plan={plan}
            />
          )}

          {/* Transportation List */}
          <div className="space-y-4">
            {plan.transportation.length === 0 ? (
              <Card className="p-8 text-center bg-white/10 backdrop-blur-xl border border-white/20">
                <Car className="h-12 w-12 mx-auto mb-4 text-white/60" />
                <h3 className="text-lg font-semibold mb-2 text-white">No transportation yet</h3>
                <p className="text-white/80 mb-4">
                  Add your flights, trains, car rentals, or other transportation bookings
                </p>
                <Button onClick={() => setAddingTransportation(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Transportation
                </Button>
              </Card>
            ) : (
              plan.transportation.map((transportation) => (
                <Card key={transportation.id}>
                  <CardContent className="p-6">
                    {editingTransportation === transportation.id ? (
                      <TransportationForm
                        initialData={transportation}
                        onSave={(data) => handleUpdateTransportation(transportation.id, data)}
                        onCancel={() => setEditingTransportation(null)}
                        plan={plan}
                      />
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center">
                              {getTransportationIcon(transportation.type)}
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold capitalize text-white">
                                {transportation.type.replace('_', ' ')}
                              </h4>
                              <div className="flex items-center gap-2 text-white/80">
                                <MapPin className="h-4 w-4" />
                                <span>{transportation.from.name} → {transportation.to.name}</span>
                              </div>
                              <div className="flex items-center gap-4 mt-2 text-sm text-white/80">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(transportation.departureDate).toLocaleDateString()} at{' '}
                                  {new Date(transportation.departureDate).toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: '2-digit'
                                  })}
                                </span>
                                {transportation.duration && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {Math.floor(transportation.duration / 60)}h {transportation.duration % 60}m
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(transportation.status)}>
                              {getStatusIcon(transportation.status)}
                              <span className="ml-1 capitalize">{transportation.status}</span>
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingTransportation(transportation.id)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteTransportation(transportation.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          {transportation.cost && (
                            <div>
                              <p className="font-medium text-white">Cost</p>
                              <p className="text-white/80">
                                {transportation.cost.amount} {transportation.cost.currency}
                                {transportation.cost.perPerson && ' per person'}
                              </p>
                            </div>
                          )}

                          {transportation.booking?.confirmationNumber && (
                            <div>
                              <p className="font-medium text-white">Confirmation</p>
                              <p className="text-white/80">
                                {transportation.booking.confirmationNumber}
                              </p>
                            </div>
                          )}

                          {transportation.details?.flightNumber && (
                            <div>
                              <p className="font-medium text-white">Flight Number</p>
                              <p className="text-white/80">
                                {transportation.details.flightNumber}
                                {transportation.details.airline && ` (${transportation.details.airline})`}
                              </p>
                            </div>
                          )}
                        </div>

                        {transportation.notes && (
                          <div className="pt-4 border-t">
                            <p className="text-sm text-white/80">
                              <strong>Notes:</strong> {transportation.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Accommodation Form Component
interface AccommodationFormProps {
  initialData?: Partial<Accommodation>;
  onSave: (data: Omit<Accommodation, 'id' | 'planId' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  plan: TravelPlan;
}

const AccommodationForm: React.FC<AccommodationFormProps> = ({
  initialData,
  onSave,
  onCancel,
  plan
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    type: initialData?.type || 'hotel' as Accommodation['type'],
    address: initialData?.address || '',
    checkInDate: initialData?.checkInDate 
      ? new Date(initialData.checkInDate).toISOString().split('T')[0]
      : new Date(plan.startDate).toISOString().split('T')[0],
    checkOutDate: initialData?.checkOutDate 
      ? new Date(initialData.checkOutDate).toISOString().split('T')[0]
      : new Date(plan.endDate).toISOString().split('T')[0],
    totalAmount: initialData?.cost?.totalAmount || 0,
    perNight: initialData?.cost?.perNight || 0,
    currency: initialData?.cost?.currency || 'USD',
    confirmationNumber: initialData?.booking?.confirmationNumber || '',
    platform: initialData?.booking?.platform || '',
    website: initialData?.booking?.website || '',
    amenities: initialData?.amenities?.join(', ') || '',
    status: initialData?.status || 'planned' as Accommodation['status'],
    notes: initialData?.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const checkInDate = new Date(formData.checkInDate);
    const checkOutDate = new Date(formData.checkOutDate);
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

    const accommodationData: Omit<Accommodation, 'id' | 'planId' | 'createdAt' | 'updatedAt'> = {
      name: formData.name,
      type: formData.type,
      address: formData.address,
      checkInDate,
      checkOutDate,
      nights,
      cost: {
        totalAmount: formData.totalAmount,
        perNight: formData.perNight,
        currency: formData.currency
      },
      booking: {
        confirmationNumber: formData.confirmationNumber,
        platform: formData.platform,
        website: formData.website
      },
      amenities: formData.amenities.split(',').map(a => a.trim()).filter(Boolean),
      status: formData.status,
      notes: formData.notes
    };

    onSave(accommodationData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded bg-white/10 backdrop-blur-xl border-white/20">
      <h4 className="font-semibold text-white">
        {initialData ? 'Edit Accommodation' : 'Add New Accommodation'}
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Hotel name or property"
            required
          />
        </div>

        <div>
          <Label htmlFor="type">Type</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as Accommodation['type'] }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hotel">Hotel</SelectItem>
              <SelectItem value="hostel">Hostel</SelectItem>
              <SelectItem value="apartment">Apartment</SelectItem>
              <SelectItem value="house">House</SelectItem>
              <SelectItem value="resort">Resort</SelectItem>
              <SelectItem value="bnb">Bed & Breakfast</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
          placeholder="Full address"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="checkInDate">Check-in Date</Label>
          <Input
            id="checkInDate"
            type="date"
            value={formData.checkInDate}
            onChange={(e) => setFormData(prev => ({ ...prev, checkInDate: e.target.value }))}
          />
        </div>

        <div>
          <Label htmlFor="checkOutDate">Check-out Date</Label>
          <Input
            id="checkOutDate"
            type="date"
            value={formData.checkOutDate}
            onChange={(e) => setFormData(prev => ({ ...prev, checkOutDate: e.target.value }))}
            min={formData.checkInDate}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="totalAmount">Total Cost</Label>
          <Input
            id="totalAmount"
            type="number"
            value={formData.totalAmount}
            onChange={(e) => setFormData(prev => ({ ...prev, totalAmount: parseFloat(e.target.value) || 0 }))}
            placeholder="0.00"
          />
        </div>

        <div>
          <Label htmlFor="perNight">Per Night</Label>
          <Input
            id="perNight"
            type="number"
            value={formData.perNight}
            onChange={(e) => setFormData(prev => ({ ...prev, perNight: parseFloat(e.target.value) || 0 }))}
            placeholder="0.00"
          />
        </div>

        <div>
          <Label htmlFor="currency">Currency</Label>
          <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="GBP">GBP</SelectItem>
              <SelectItem value="JPY">JPY</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="confirmationNumber">Confirmation Number</Label>
          <Input
            id="confirmationNumber"
            value={formData.confirmationNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, confirmationNumber: e.target.value }))}
            placeholder="Booking confirmation number"
          />
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as Accommodation['status'] }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="planned">Planned</SelectItem>
              <SelectItem value="booked">Booked</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="amenities">Amenities (comma separated)</Label>
        <Input
          id="amenities"
          value={formData.amenities}
          onChange={(e) => setFormData(prev => ({ ...prev, amenities: e.target.value }))}
          placeholder="WiFi, Pool, Gym, Spa, Restaurant"
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Any additional notes..."
          rows={3}
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
        <Button type="submit">
          <Save className="h-4 w-4 mr-1" />
          {initialData ? 'Update' : 'Add'} Accommodation
        </Button>
      </div>
    </form>
  );
};

// Transportation Form Component (similar structure but for transportation)
interface TransportationFormProps {
  initialData?: Partial<Transportation>;
  onSave: (data: Omit<Transportation, 'id' | 'planId' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  plan: TravelPlan;
}

const TransportationForm: React.FC<TransportationFormProps> = ({
  initialData,
  onSave,
  onCancel,
  plan
}) => {
  const [formData, setFormData] = useState({
    type: initialData?.type || 'flight' as Transportation['type'],
    fromName: initialData?.from?.name || '',
    fromAddress: initialData?.from?.address || '',
    toName: initialData?.to?.name || '',
    toAddress: initialData?.to?.address || '',
    departureDate: initialData?.departureDate 
      ? new Date(initialData.departureDate).toISOString().slice(0, 16)
      : '',
    arrivalDate: initialData?.arrivalDate 
      ? new Date(initialData.arrivalDate).toISOString().slice(0, 16)
      : '',
    duration: initialData?.duration || 0,
    amount: initialData?.cost?.amount || 0,
    currency: initialData?.cost?.currency || 'USD',
    perPerson: initialData?.cost?.perPerson || false,
    confirmationNumber: initialData?.booking?.confirmationNumber || '',
    flightNumber: initialData?.details?.flightNumber || '',
    airline: initialData?.details?.airline || '',
    status: initialData?.status || 'planned' as Transportation['status'],
    notes: initialData?.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const transportationData: Omit<Transportation, 'id' | 'planId' | 'createdAt' | 'updatedAt'> = {
      type: formData.type,
      from: {
        name: formData.fromName,
        address: formData.fromAddress
      },
      to: {
        name: formData.toName,
        address: formData.toAddress
      },
      departureDate: new Date(formData.departureDate),
      arrivalDate: formData.arrivalDate ? new Date(formData.arrivalDate) : undefined,
      duration: formData.duration || undefined,
      cost: formData.amount > 0 ? {
        amount: formData.amount,
        currency: formData.currency,
        perPerson: formData.perPerson
      } : undefined,
      booking: {
        confirmationNumber: formData.confirmationNumber
      },
      details: {
        flightNumber: formData.flightNumber || undefined,
        airline: formData.airline || undefined
      },
      status: formData.status,
      notes: formData.notes
    };

    onSave(transportationData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded bg-white/10 backdrop-blur-xl border-white/20">
      <h4 className="font-semibold text-white">
        {initialData ? 'Edit Transportation' : 'Add New Transportation'}
      </h4>

      <div>
        <Label htmlFor="type">Type</Label>
        <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as Transportation['type'] }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="flight">Flight</SelectItem>
            <SelectItem value="train">Train</SelectItem>
            <SelectItem value="bus">Bus</SelectItem>
            <SelectItem value="car_rental">Car Rental</SelectItem>
            <SelectItem value="taxi">Taxi</SelectItem>
            <SelectItem value="subway">Subway</SelectItem>
            <SelectItem value="ferry">Ferry</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fromName">From (Location) *</Label>
          <Input
            id="fromName"
            value={formData.fromName}
            onChange={(e) => setFormData(prev => ({ ...prev, fromName: e.target.value }))}
            placeholder="Departure location"
            required
          />
        </div>

        <div>
          <Label htmlFor="toName">To (Destination) *</Label>
          <Input
            id="toName"
            value={formData.toName}
            onChange={(e) => setFormData(prev => ({ ...prev, toName: e.target.value }))}
            placeholder="Arrival destination"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="departureDate">Departure Date & Time</Label>
          <Input
            id="departureDate"
            type="datetime-local"
            value={formData.departureDate}
            onChange={(e) => setFormData(prev => ({ ...prev, departureDate: e.target.value }))}
          />
        </div>

        <div>
          <Label htmlFor="arrivalDate">Arrival Date & Time</Label>
          <Input
            id="arrivalDate"
            type="datetime-local"
            value={formData.arrivalDate}
            onChange={(e) => setFormData(prev => ({ ...prev, arrivalDate: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="confirmationNumber">Confirmation Number</Label>
          <Input
            id="confirmationNumber"
            value={formData.confirmationNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, confirmationNumber: e.target.value }))}
            placeholder="Booking confirmation"
          />
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as Transportation['status'] }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="planned">Planned</SelectItem>
              <SelectItem value="booked">Booked</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {formData.type === 'flight' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="flightNumber">Flight Number</Label>
            <Input
              id="flightNumber"
              value={formData.flightNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, flightNumber: e.target.value }))}
              placeholder="e.g., AA123"
            />
          </div>

          <div>
            <Label htmlFor="airline">Airline</Label>
            <Input
              id="airline"
              value={formData.airline}
              onChange={(e) => setFormData(prev => ({ ...prev, airline: e.target.value }))}
              placeholder="e.g., American Airlines"
            />
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Any additional notes..."
          rows={3}
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
        <Button type="submit">
          <Save className="h-4 w-4 mr-1" />
          {initialData ? 'Update' : 'Add'} Transportation
        </Button>
      </div>
    </form>
  );
};

export default TravelBookingManager;