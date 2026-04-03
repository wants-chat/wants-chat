import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  FileText,
  Upload,
  Download,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertTriangle,
  Calendar,
  Shield,
  Plane,
  CreditCard,
  MapPin,
  FileImage,
  Search
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import type { TravelPlan, TravelDocument } from '../../services/travelService';
import { useConfirm } from '../../contexts/ConfirmDialogContext';

interface TravelDocumentManagerProps {
  plan: TravelPlan;
  onUpdate: (updatedPlan: TravelPlan) => void;
  className?: string;
}

const TravelDocumentManager: React.FC<TravelDocumentManagerProps> = ({
  plan,
  onUpdate,
  className = ''
}) => {
  const { confirm } = useConfirm();
  const [editingDocument, setEditingDocument] = useState<string | null>(null);
  const [addingDocument, setAddingDocument] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const documentTypes = [
    { value: 'passport', label: 'Passport', icon: <Shield className="h-4 w-4" /> },
    { value: 'visa', label: 'Visa', icon: <Shield className="h-4 w-4" /> },
    { value: 'ticket', label: 'Ticket', icon: <Plane className="h-4 w-4" /> },
    { value: 'reservation', label: 'Reservation', icon: <FileText className="h-4 w-4" /> },
    { value: 'insurance', label: 'Insurance', icon: <Shield className="h-4 w-4" /> },
    { value: 'vaccination', label: 'Vaccination', icon: <Shield className="h-4 w-4" /> },
    { value: 'itinerary', label: 'Itinerary', icon: <MapPin className="h-4 w-4" /> },
    { value: 'map', label: 'Map', icon: <MapPin className="h-4 w-4" /> },
    { value: 'other', label: 'Other', icon: <FileText className="h-4 w-4" /> }
  ];

  const getStatusColor = (status: TravelDocument['status']) => {
    switch (status) {
      case 'obtained':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'missing':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'expired':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: TravelDocument['status']) => {
    switch (status) {
      case 'obtained':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'missing':
        return <AlertTriangle className="h-4 w-4" />;
      case 'expired':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: TravelDocument['type']) => {
    const typeConfig = documentTypes.find(t => t.value === type);
    return typeConfig?.icon || <FileText className="h-4 w-4" />;
  };

  const isDocumentExpiringSoon = (document: TravelDocument) => {
    if (!document.expiryDate) return false;
    const expiryDate = new Date(document.expiryDate);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  const filteredDocuments = plan.documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const requiredDocuments = filteredDocuments.filter(doc => doc.isRequired);
  const optionalDocuments = filteredDocuments.filter(doc => !doc.isRequired);

  const handleAddDocument = async (documentData: Omit<TravelDocument, 'id' | 'planId' | 'createdAt' | 'updatedAt'>) => {
    const newDocument: TravelDocument = {
      id: `temp_${Date.now()}`,
      planId: plan.id,
      ...documentData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedPlan = {
      ...plan,
      documents: [...plan.documents, newDocument]
    };

    onUpdate(updatedPlan);
    setAddingDocument(false);
  };

  const handleUpdateDocument = async (documentId: string, updates: Partial<TravelDocument>) => {
    const updatedPlan = {
      ...plan,
      documents: plan.documents.map(doc =>
        doc.id === documentId
          ? { ...doc, ...updates, updatedAt: new Date().toISOString() }
          : doc
      )
    };

    onUpdate(updatedPlan);
    setEditingDocument(null);
  };

  const handleDeleteDocument = async (documentId: string) => {
    const confirmed = await confirm({
      title: 'Delete Document',
      message: 'Are you sure you want to delete this document?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive'
    });

    if (!confirmed) return;

    const updatedPlan = {
      ...plan,
      documents: plan.documents.filter(doc => doc.id !== documentId)
    };

    onUpdate(updatedPlan);
  };

  // Calculate document completeness
  const requiredDocumentsCount = plan.documents.filter(doc => doc.isRequired).length;
  const obtainedRequiredCount = plan.documents.filter(doc => doc.isRequired && doc.status === 'obtained').length;
  const completeness = requiredDocumentsCount > 0 ? (obtainedRequiredCount / requiredDocumentsCount) * 100 : 100;

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Document Manager</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your travel documents, visas, and important papers
          </p>
        </div>
        <Button onClick={() => setAddingDocument(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Document
        </Button>
      </div>

      {/* Document Completeness Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Document Completeness</span>
            <Badge variant={completeness === 100 ? 'default' : 'secondary'}>
              {Math.round(completeness)}% Complete
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Required Documents Obtained</span>
              <span>{obtainedRequiredCount} of {requiredDocumentsCount}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className="bg-primary rounded-full h-3 transition-all duration-300"
                style={{ width: `${completeness}%` }}
              />
            </div>
            
            {/* Warnings */}
            {plan.documents.filter(doc => doc.status === 'expired' || isDocumentExpiringSoon(doc)).length > 0 && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200 mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Attention Required</span>
                </div>
                <div className="space-y-1">
                  {plan.documents
                    .filter(doc => doc.status === 'expired')
                    .map(doc => (
                      <p key={doc.id} className="text-sm text-yellow-700 dark:text-yellow-300">
                        • {doc.name} has expired
                      </p>
                    ))}
                  {plan.documents
                    .filter(doc => isDocumentExpiringSoon(doc))
                    .map(doc => (
                      <p key={doc.id} className="text-sm text-yellow-700 dark:text-yellow-300">
                        • {doc.name} expires soon ({doc.expiryDate && new Date(doc.expiryDate).toLocaleDateString()})
                      </p>
                    ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {documentTypes.map(type => (
              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="obtained">Obtained</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="missing">Missing</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Add Document Form */}
      {addingDocument && (
        <DocumentForm
          onSave={handleAddDocument}
          onCancel={() => setAddingDocument(false)}
          plan={plan}
        />
      )}

      {/* Required Documents */}
      {requiredDocuments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Required Documents ({requiredDocuments.length})
          </h3>
          <div className="space-y-4">
            {requiredDocuments.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                isEditing={editingDocument === document.id}
                onEdit={() => setEditingDocument(document.id)}
                onSave={(updates) => handleUpdateDocument(document.id, updates)}
                onCancel={() => setEditingDocument(null)}
                onDelete={() => handleDeleteDocument(document.id)}
                plan={plan}
                isExpiringSoon={isDocumentExpiringSoon(document)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Optional Documents */}
      {optionalDocuments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Optional Documents ({optionalDocuments.length})
          </h3>
          <div className="space-y-4">
            {optionalDocuments.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                isEditing={editingDocument === document.id}
                onEdit={() => setEditingDocument(document.id)}
                onSave={(updates) => handleUpdateDocument(document.id, updates)}
                onCancel={() => setEditingDocument(null)}
                onDelete={() => handleDeleteDocument(document.id)}
                plan={plan}
                isExpiringSoon={isDocumentExpiringSoon(document)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredDocuments.length === 0 && !addingDocument && (
        <Card className="p-8 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">
            {plan.documents.length === 0 ? 'No documents yet' : 'No documents found'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {plan.documents.length === 0 
              ? 'Add your travel documents, tickets, and important papers'
              : 'Try adjusting your search or filters'
            }
          </p>
          {plan.documents.length === 0 && (
            <Button onClick={() => setAddingDocument(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Document
            </Button>
          )}
        </Card>
      )}
    </div>
  );
};

// Document Card Component
interface DocumentCardProps {
  document: TravelDocument;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (updates: Partial<TravelDocument>) => void;
  onCancel: () => void;
  onDelete: () => void;
  plan: TravelPlan;
  isExpiringSoon: boolean;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  plan,
  isExpiringSoon
}) => {
  const getTypeIcon = (type: TravelDocument['type']) => {
    const documentTypes = [
      { value: 'passport', icon: <Shield className="h-4 w-4" /> },
      { value: 'visa', icon: <Shield className="h-4 w-4" /> },
      { value: 'ticket', icon: <Plane className="h-4 w-4" /> },
      { value: 'reservation', icon: <FileText className="h-4 w-4" /> },
      { value: 'insurance', icon: <Shield className="h-4 w-4" /> },
      { value: 'vaccination', icon: <Shield className="h-4 w-4" /> },
      { value: 'itinerary', icon: <MapPin className="h-4 w-4" /> },
      { value: 'map', icon: <MapPin className="h-4 w-4" /> },
      { value: 'other', icon: <FileText className="h-4 w-4" /> }
    ];
    const typeConfig = documentTypes.find(t => t.value === type);
    return typeConfig?.icon || <FileText className="h-4 w-4" />;
  };

  const getStatusColor = (status: TravelDocument['status']) => {
    switch (status) {
      case 'obtained':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'missing':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'expired':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: TravelDocument['status']) => {
    switch (status) {
      case 'obtained':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'missing':
        return <AlertTriangle className="h-4 w-4" />;
      case 'expired':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Card className={`${isExpiringSoon ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10' : ''}`}>
      <CardContent className="p-6">
        {isEditing ? (
          <DocumentForm
            initialData={document}
            onSave={onSave}
            onCancel={onCancel}
            plan={plan}
          />
        ) : (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center">
                  {getTypeIcon(document.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-lg font-semibold">{document.name}</h4>
                    {document.isRequired && (
                      <Badge variant="outline" className="text-xs">
                        Required
                      </Badge>
                    )}
                    {isExpiringSoon && (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        Expiring Soon
                      </Badge>
                    )}
                  </div>
                  {document.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                      {document.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="capitalize">
                      {document.type.replace('_', ' ')}
                    </span>
                    {document.issuer && (
                      <span>Issued by {document.issuer}</span>
                    )}
                    {document.documentNumber && (
                      <span>#{document.documentNumber}</span>
                    )}
                  </div>
                  {document.expiryDate && (
                    <div className="flex items-center gap-1 mt-2 text-sm">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className={isExpiringSoon ? 'text-yellow-600 font-medium' : ''}>
                        Expires: {new Date(document.expiryDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(document.status)}>
                  {getStatusIcon(document.status)}
                  <span className="ml-1 capitalize">{document.status}</span>
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onEdit}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onDelete}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {document.tags && document.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {document.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {document.fileUrl && (
              <div className="pt-4 border-t">
                <a
                  href={document.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Document
                </a>
              </div>
            )}

            {document.notes && (
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Notes:</strong> {document.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Document Form Component
interface DocumentFormProps {
  initialData?: Partial<TravelDocument>;
  onSave: (data: Omit<TravelDocument, 'id' | 'planId' | 'createdAt' | 'updatedAt'> | Partial<TravelDocument>) => void;
  onCancel: () => void;
  plan: TravelPlan;
}

const DocumentForm: React.FC<DocumentFormProps> = ({
  initialData,
  onSave,
  onCancel,
  plan
}) => {
  const [formData, setFormData] = useState({
    type: initialData?.type || 'other' as TravelDocument['type'],
    name: initialData?.name || '',
    description: initialData?.description || '',
    fileUrl: initialData?.fileUrl || '',
    expiryDate: initialData?.expiryDate 
      ? new Date(initialData.expiryDate).toISOString().split('T')[0]
      : '',
    issuer: initialData?.issuer || '',
    documentNumber: initialData?.documentNumber || '',
    tags: initialData?.tags?.join(', ') || '',
    isRequired: initialData?.isRequired ?? false,
    status: initialData?.status || 'missing' as TravelDocument['status'],
    notes: initialData?.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const documentData = {
      type: formData.type,
      name: formData.name,
      description: formData.description || undefined,
      fileUrl: formData.fileUrl || undefined,
      expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : undefined,
      issuer: formData.issuer || undefined,
      documentNumber: formData.documentNumber || undefined,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      isRequired: formData.isRequired,
      status: formData.status,
      notes: formData.notes || undefined
    };

    onSave(documentData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded bg-gray-50 dark:bg-gray-800">
      <h4 className="font-semibold">
        {initialData ? 'Edit Document' : 'Add New Document'}
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Document Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Passport, Flight Ticket"
            required
          />
        </div>

        <div>
          <Label htmlFor="type">Type</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as TravelDocument['type'] }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="passport">Passport</SelectItem>
              <SelectItem value="visa">Visa</SelectItem>
              <SelectItem value="ticket">Ticket</SelectItem>
              <SelectItem value="reservation">Reservation</SelectItem>
              <SelectItem value="insurance">Insurance</SelectItem>
              <SelectItem value="vaccination">Vaccination</SelectItem>
              <SelectItem value="itinerary">Itinerary</SelectItem>
              <SelectItem value="map">Map</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Brief description of the document..."
          rows={2}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="issuer">Issuer</Label>
          <Input
            id="issuer"
            value={formData.issuer}
            onChange={(e) => setFormData(prev => ({ ...prev, issuer: e.target.value }))}
            placeholder="e.g., US Government, Airline"
          />
        </div>

        <div>
          <Label htmlFor="documentNumber">Document Number</Label>
          <Input
            id="documentNumber"
            value={formData.documentNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, documentNumber: e.target.value }))}
            placeholder="e.g., Passport number, Ticket number"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="expiryDate">Expiry Date</Label>
          <Input
            id="expiryDate"
            type="date"
            value={formData.expiryDate}
            onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
          />
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as TravelDocument['status'] }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="obtained">Obtained</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="missing">Missing</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="fileUrl">File URL</Label>
        <Input
          id="fileUrl"
          type="url"
          value={formData.fileUrl}
          onChange={(e) => setFormData(prev => ({ ...prev, fileUrl: e.target.value }))}
          placeholder="Link to document file or scan"
        />
      </div>

      <div>
        <Label htmlFor="tags">Tags (comma separated)</Label>
        <Input
          id="tags"
          value={formData.tags}
          onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
          placeholder="e.g., urgent, printed, digital"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isRequired"
          checked={formData.isRequired}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isRequired: checked as boolean }))}
        />
        <Label htmlFor="isRequired">This is a required document for the trip</Label>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Any additional notes about this document..."
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
          {initialData ? 'Update' : 'Add'} Document
        </Button>
      </div>
    </form>
  );
};

export default TravelDocumentManager;