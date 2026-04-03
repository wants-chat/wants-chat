import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateShippingAddressForm = (
  resolved: ResolvedComponent,
  variant: 'default' | 'withMap' | 'savedAddresses' = 'default'
) => {
  const dataSource = resolved.dataSource;

  const getField = (fieldName: string): string => {
    const mapping = resolved.fieldMappings.find(m => m.targetField === fieldName);
    if (mapping?.sourceField) {
      return `propData?.${mapping.sourceField}`;
    }
    // Return undefined/empty for missing data - let component handle gracefully
    // For ID fields
    if (fieldName === 'id' || fieldName.endsWith('Id')) {
      return `propData?.id || ${dataName}?._id`;
    }
    // For array fields
    if (fieldName.match(/items|steps|updates|timeline|list|array|images|products|users|orders|features|links|stats|statistics|metrics|categories|tags|members|avatars|methods|examples|reviews|comments|notifications|messages|events|courses|lessons|modules|posts|articles|videos|photos|data|results|activities|cards|testimonials|faqs|questions|answers|options|choices|variants|attributes|filters|transactions|invoices|payments|receipts|shipments|deliveries/i)) {
      return `propData?.${fieldName} || ([] as any[])`;
    }
    // For object fields
    if (fieldName.match(/address|metadata|config|settings|tracking|gallery/i)) {
      return `propData?.${fieldName} || ({} as any)`;
    }
    // For scalar values - return empty string as fallback
    return `propData?.${fieldName} || ''`;
  };

  // Parse data source for clean prop naming (sanitize to camelCase)
  const sanitizeVariableName = (name: string): string => {
    // Replace dots and underscores with camelCase
    return name
      .split(/[._]/)
      .map((part, index) => {
        if (index === 0) {
          return part;
        }
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join('');
  };

  const getDataPath = () => {
    if (!dataSource || dataSource.trim() === '') return 'data';
    const parts = dataSource.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart ? sanitizeVariableName(lastPart) : 'data';
  };

  const dataName = getDataPath();

  // Get API route for data fetching
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'data'}`;
  };

  const apiRoute = getApiRoute();

  const variants = {
    default: `
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ShippingAddressFormProps {
  ${dataName}?: any;
  entity?: string;
  orders?: any;
  className?: string;
  onAddressChange?: (address: any) => void;
  onSave?: (address: any) => void;
  onContinue?: (address: any) => void;
  onSubmit?: (address: any) => void;
  onSubmitAddress?: (address: any) => void;
  onAddAddress?: (address: any) => void;
  onUpdateAddress?: (address: any) => void;
  onUpdateShippingAddress?: (address: any) => void;
  onDeleteAddress?: (addressId: string) => void;
  onSetDefault?: (addressId: string) => void;
}

export default function ShippingAddressForm({ ${dataName}: propData, entity = '${dataSource || 'data'}', orders, className, onAddressChange, onSave, onContinue, onSubmitAddress, onAddAddress, onUpdateAddress, onUpdateShippingAddress, onDeleteAddress }: ShippingAddressFormProps) {
  const queryClient = useQueryClient();

  // Fetch data using useQuery
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity],
    queryFn: () => api.get<any>(\`${apiRoute}\`),
    enabled: !propData && !orders,
  });

  // Address save mutation
  const saveMutation = useMutation({
    mutationFn: async (address: any) => {
      const response = await api.post<any>(\`/\${entity}\`, address);
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [entity] });
      if (onAddressChange) onAddressChange(data);
    },
    onError: (err: any) => {
      console.error('Address save error:', err);
    },
  });

  // Loading state
  if (isLoading && !propData && !orders) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const addressData = propData || orders || fetchedData || {};

  const [fullName, setFullName] = useState(${getField('fullName')});
  const [addressLine1, setAddressLine1] = useState(${getField('addressLine1')});
  const [addressLine2, setAddressLine2] = useState(${getField('addressLine2')});
  const [city, setCity] = useState(${getField('city')});
  const [state, setState] = useState(${getField('state')});
  const [zipCode, setZipCode] = useState(${getField('zipCode')});
  const [country, setCountry] = useState(${getField('country')});
  const [phone, setPhone] = useState(${getField('phone')});

  const shippingAddressTitle = ${getField('shippingAddressTitle')};
  const saveAddressButton = ${getField('saveAddressButton')};
  const continueButton = ${getField('continueButton')};

  // Event handlers
  const handleSave = () => {
    const address = { fullName, addressLine1, addressLine2, city, state, zipCode, country, phone };
    if (onSave) {
      onSave(address);
    } else if (onAddAddress) {
      onAddAddress(address);
    } else {
      saveMutation.mutate(address);
    }
  };

  const handleContinue = () => {
    const address = { fullName, addressLine1, addressLine2, city, state, zipCode, country, phone };
    if (onContinue) {
      onContinue(address);
    } else if (onSubmitAddress) {
      onSubmitAddress(address);
    } else {
      saveMutation.mutate(address);
    }
  };

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-6 h-6" />
            {shippingAddressTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="addressLine1">Address Line 1 *</Label>
              <Input
                id="addressLine1"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                placeholder="Street address"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
              <Input
                id="addressLine2"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                placeholder="Apartment, suite, unit, etc."
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter city"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="state">State / Province *</Label>
                <Input
                  id="state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Enter state"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="zipCode">ZIP / Postal Code *</Label>
                <Input
                  id="zipCode"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="Enter ZIP code"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="country">Country *</Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="United States">United States</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                    <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                    <SelectItem value="Australia">Australia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
                className="mt-1"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleSave}
                className="flex-1 dark:border-gray-600"
              >
                {saveAddressButton}
              </Button>
              <Button
                onClick={handleContinue}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {continueButton}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
    `,

    withMap: `
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Navigation, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ShippingAddressFormProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onSave?: (address: any) => void;
  onContinue?: (address: any) => void;
  onUseCurrentLocation?: () => void;
  onSubmitAddress?: (address: any) => void;
  onAddAddress?: (address: any) => void;
  onUpdateAddress?: (address: any) => void;
  onUpdateShippingAddress?: (address: any) => void;
  onDeleteAddress?: (addressId: string) => void;
  onSetDefault?: (addressId: string) => void;
}

export default function ShippingAddressForm({ ${dataName}: propData, entity = '${dataSource || 'data'}', className, onSave, onContinue, onUseCurrentLocation, onSubmitAddress, onAddAddress, onUpdateAddress, onUpdateShippingAddress, onDeleteAddress }: ShippingAddressFormProps) {
  const queryClient = useQueryClient();

  // Fetch data using useQuery
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity],
    queryFn: () => api.get<any>(\`${apiRoute}\`),
    enabled: !propData,
  });

  // Address save mutation
  const saveMutation = useMutation({
    mutationFn: async (address: any) => {
      const response = await api.post<any>(\`/\${entity}\`, address);
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [entity] });
    },
    onError: (err: any) => {
      console.error('Address save error:', err);
    },
  });

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const addressData = propData || fetchedData || {};

  const [fullName, setFullName] = useState(${getField('fullName')});
  const [addressLine1, setAddressLine1] = useState(${getField('addressLine1')});
  const [addressLine2, setAddressLine2] = useState(${getField('addressLine2')});
  const [city, setCity] = useState(${getField('city')});
  const [state, setState] = useState(${getField('state')});
  const [zipCode, setZipCode] = useState(${getField('zipCode')});
  const [country, setCountry] = useState(${getField('country')});
  const [phone, setPhone] = useState(${getField('phone')});

  const shippingAddressTitle = ${getField('shippingAddressTitle')};
  const deliveryLocationTitle = ${getField('deliveryLocationTitle')};
  const continueButton = ${getField('continueButton')};
  const mapCoordinates = ${getField('mapCoordinates')};

  // Event handlers
  const handleUseCurrentLocation = () => {
    if (onUseCurrentLocation) {
      onUseCurrentLocation();
    }
  };

  const handleContinue = () => {
    const address = { fullName, addressLine1, addressLine2, city, state, zipCode, country, phone };
    if (onContinue) {
      onContinue(address);
    } else if (onSubmitAddress) {
      onSubmitAddress(address);
    } else {
      saveMutation.mutate(address);
    }
  };

  return (
    <div className={cn("w-full max-w-4xl mx-auto", className)}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              {shippingAddressTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="addressLine1">Address Line 1 *</Label>
                <Input
                  id="addressLine1"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="addressLine2">Address Line 2</Label>
                <Input
                  id="addressLine2"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="zipCode">ZIP Code *</Label>
                  <Input
                    id="zipCode"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="United States">United States</SelectItem>
                      <SelectItem value="Canada">Canada</SelectItem>
                      <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1"
                />
              </div>

              <Button
                onClick={handleContinue}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {continueButton}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900 dark:text-white">{deliveryLocationTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4"
              style={{
                backgroundImage: \`url(https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/\${mapCoordinates.lng},\${mapCoordinates.lat},12,0/600x400?access_token=YOUR_MAPBOX_TOKEN)\`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="bg-white/90 dark:bg-gray-800/90 px-4 py-2 rounded-lg">
                <MapPin className="w-8 h-8 text-red-600 mx-auto" />
                <p className="text-sm text-gray-900 dark:text-white mt-1">Map Preview</p>
              </div>
            </div>

            <Button
              onClick={handleUseCurrentLocation}
              variant="outline"
              className="w-full dark:border-gray-600"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Use My Current Location
            </Button>

            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Your delivery location will be shown on the map above. You can drag the pin to adjust the exact location.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
    `,

    savedAddresses: `
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Plus, Edit2, Trash2, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ShippingAddressFormProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onSelectAddress?: (address: any) => void;
  onAddNew?: () => void;
  onEdit?: (address: any) => void;
  onDelete?: (addressId: string) => void;
  onSetDefault?: (addressId: string) => void;
  onSubmitAddress?: (address: any) => void;
  onAddAddress?: (address: any) => void;
  onUpdateAddress?: (address: any) => void;
  onUpdateShippingAddress?: (address: any) => void;
  onDeleteAddress?: (addressId: string) => void;
}

export default function ShippingAddressForm({ ${dataName}: propData, entity = '${dataSource || 'data'}', className, onSelectAddress, onAddNew, onEdit, onDelete, onSetDefault, onSubmitAddress, onAddAddress, onUpdateAddress, onUpdateShippingAddress, onDeleteAddress }: ShippingAddressFormProps) {
  const queryClient = useQueryClient();

  // Fetch data using useQuery
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity],
    queryFn: () => api.get<any>(\`${apiRoute}\`),
    enabled: !propData,
  });

  // Delete address mutation
  const deleteMutation = useMutation({
    mutationFn: async (addressId: string) => {
      const response = await api.delete<any>(\`/\${entity}/\${addressId}\`);
      return response?.data || response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [entity] });
    },
    onError: (err: any) => {
      console.error('Address delete error:', err);
    },
  });

  // Set default mutation
  const setDefaultMutation = useMutation({
    mutationFn: async (addressId: string) => {
      const response = await api.put<any>(\`/\${entity}/\${addressId}/default\`, {});
      return response?.data || response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [entity] });
    },
    onError: (err: any) => {
      console.error('Set default error:', err);
    },
  });

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const addressData = propData || fetchedData || {};

  const savedAddresses = ${getField('savedAddresses')};
  const [selectedAddressId, setSelectedAddressId] = useState(savedAddresses[0]?.id);

  const savedAddressesTitle = ${getField('savedAddressesTitle')};
  const addNewAddressButton = ${getField('addNewAddressButton')};
  const continueButton = ${getField('continueButton')};
  const editButton = ${getField('editButton')};
  const deleteButton = ${getField('deleteButton')};
  const setDefaultButton = ${getField('setDefaultButton')};

  // Event handlers
  const handleSelectAddress = (address: any) => {
    setSelectedAddressId(address.id);
    if (onSelectAddress) {
      onSelectAddress(address);
    }
  };

  const handleAddNew = () => {
    if (onAddNew) {
      onAddNew();
    } else if (onAddAddress) {
      onAddAddress({});
    }
  };

  const handleEdit = (address: any) => {
    if (onEdit) {
      onEdit(address);
    } else if (onUpdateAddress) {
      onUpdateAddress(address);
    }
  };

  const handleDelete = (addressId: string) => {
    if (onDelete) {
      onDelete(addressId);
    } else if (onDeleteAddress) {
      onDeleteAddress(addressId);
    } else {
      deleteMutation.mutate(addressId);
    }
  };

  const handleSetDefault = (addressId: string) => {
    if (onSetDefault) {
      onSetDefault(addressId);
    } else {
      setDefaultMutation.mutate(addressId);
    }
  };

  const handleContinue = () => {
    const selectedAddress = savedAddresses.find((addr: any) => addr.id === selectedAddressId);
    if (onSelectAddress) {
      onSelectAddress(selectedAddress);
    }
  };

  return (
    <div className={cn("w-full max-w-4xl mx-auto", className)}>
      <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700 mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-6 h-6" />
              {savedAddressesTitle}
            </CardTitle>
            <Button
              onClick={handleAddNew}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              {addNewAddressButton}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedAddresses.map((address: any) => (
              <div
                key={address.id}
                className={cn(
                  "relative p-4 border-2 rounded-lg cursor-pointer transition-all",
                  selectedAddressId === address.id
                    ? "border-blue-600 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20"
                    : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                )}
                onClick={() => handleSelectAddress(address)}
              >
                {/* Selection Indicator */}
                {selectedAddressId === address.id && (
                  <div className="absolute top-2 right-2">
                    <div className="w-6 h-6 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}

                {/* Address Label & Default Badge */}
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{address.label}</h3>
                  {address.isDefault && (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs">
                      Default
                    </Badge>
                  )}
                </div>

                {/* Address Details */}
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">{address.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{address.address}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{address.phone}</p>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(address);
                    }}
                    className="flex-1 dark:border-gray-600"
                  >
                    <Edit2 className="w-3 h-3 mr-1" />
                    {editButton}
                  </Button>
                  {!address.isDefault && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetDefault(address.id);
                        }}
                        className="dark:border-gray-600"
                      >
                        {setDefaultButton}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(address.id);
                        }}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:border-gray-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={handleContinue}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
          >
            {continueButton}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
    `
  };

  return variants[variant] || variants.default;
};
