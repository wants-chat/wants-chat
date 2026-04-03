/**
 * Proof of Delivery Feature Definition
 *
 * Electronic delivery confirmation for logistics applications.
 * Supports signature capture, photo proof, and delivery documentation.
 */

import { FeatureDefinition } from '../../../interfaces/feature.interface';

export const PROOF_OF_DELIVERY_FEATURE: FeatureDefinition = {
  id: 'proof-of-delivery',
  name: 'Proof of Delivery',
  category: 'business',
  description: 'Capture electronic proof of delivery with signatures, photos, and delivery documentation',
  icon: 'file-signature',

  includedInAppTypes: [
    'logistics',
    'delivery',
    'courier',
    'last-mile-delivery',
    'field-service',
    'food-delivery',
    'medical-delivery',
    'furniture-delivery',
  ],

  activationKeywords: [
    'proof of delivery',
    'pod',
    'delivery confirmation',
    'signature capture',
    'delivery signature',
    'photo proof',
    'delivery photo',
    'delivery receipt',
    'electronic signature',
    'e-signature',
    'delivery documentation',
    'signed delivery',
    'delivery verification',
    'delivery proof',
  ],

  enabledByDefault: true,
  optional: false,

  dependencies: ['user-auth', 'shipment-tracking', 'file-upload'],
  conflicts: [],

  pages: [
    {
      id: 'delivery-capture',
      route: '/delivery/:id/capture',
      section: 'frontend',
      title: 'Capture Delivery',
      authRequired: true,
      roles: ['driver'],
      templateId: 'delivery-capture',
      components: [
        'delivery-header',
        'recipient-info',
        'signature-pad',
        'photo-capture',
        'notes-input',
        'delivery-checklist',
        'complete-delivery-button',
      ],
      layout: 'fullscreen',
    },
    {
      id: 'pod-viewer',
      route: '/deliveries/:id/pod',
      section: 'frontend',
      title: 'Proof of Delivery',
      authRequired: true,
      templateId: 'pod-viewer',
      components: [
        'pod-header',
        'signature-display',
        'photo-gallery',
        'delivery-details',
        'timestamp-info',
        'location-map',
        'download-pod-button',
        'email-pod-button',
      ],
      layout: 'default',
    },
    {
      id: 'deliveries-list',
      route: '/deliveries',
      section: 'frontend',
      title: 'Deliveries',
      authRequired: true,
      templateId: 'deliveries-list',
      components: [
        'deliveries-table',
        'delivery-filters',
        'status-filter',
        'date-range-picker',
        'pod-status-badge',
      ],
      layout: 'dashboard',
    },
    {
      id: 'delivery-exceptions',
      route: '/deliveries/exceptions',
      section: 'frontend',
      title: 'Delivery Exceptions',
      authRequired: true,
      roles: ['driver', 'dispatcher', 'admin'],
      templateId: 'delivery-exceptions',
      components: [
        'exception-form',
        'exception-reason-picker',
        'exception-photo',
        'reattempt-scheduler',
        'customer-notification',
      ],
      layout: 'default',
    },
    {
      id: 'driver-deliveries',
      route: '/driver/deliveries',
      section: 'frontend',
      title: 'My Deliveries',
      authRequired: true,
      roles: ['driver'],
      templateId: 'driver-deliveries',
      components: [
        'today-deliveries',
        'pending-pods',
        'completed-pods',
        'delivery-stats',
      ],
      layout: 'dashboard',
    },
    {
      id: 'admin-pods',
      route: '/admin/pods',
      section: 'admin',
      title: 'Manage PODs',
      authRequired: true,
      roles: ['admin'],
      templateId: 'admin-pods',
      components: [
        'pods-table',
        'pod-filters',
        'bulk-download',
        'pod-analytics',
        'exception-report',
      ],
      layout: 'admin',
    },
  ],

  components: [
    // Capture components
    'delivery-header',
    'recipient-info',
    'signature-pad',
    'photo-capture',
    'notes-input',
    'delivery-checklist',
    'complete-delivery-button',

    // Viewer components
    'pod-header',
    'signature-display',
    'photo-gallery',
    'delivery-details',
    'timestamp-info',
    'location-map',
    'download-pod-button',
    'email-pod-button',

    // List components
    'deliveries-table',
    'delivery-filters',
    'status-filter',
    'date-range-picker',
    'pod-status-badge',

    // Exception components
    'exception-form',
    'exception-reason-picker',
    'exception-photo',
    'reattempt-scheduler',
    'customer-notification',

    // Driver components
    'today-deliveries',
    'pending-pods',
    'completed-pods',
    'delivery-stats',

    // Admin components
    'pods-table',
    'pod-filters',
    'bulk-download',
    'pod-analytics',
    'exception-report',
  ],

  entities: [
    {
      name: 'proof_of_delivery',
      displayName: 'Proof of Delivery',
      description: 'Delivery confirmation records',
      isCore: true,
    },
    {
      name: 'pod_signatures',
      displayName: 'Signatures',
      description: 'Captured delivery signatures',
      isCore: true,
    },
    {
      name: 'pod_photos',
      displayName: 'Delivery Photos',
      description: 'Photos taken at delivery',
      isCore: true,
    },
    {
      name: 'delivery_exceptions',
      displayName: 'Delivery Exceptions',
      description: 'Failed or exception delivery records',
      isCore: true,
    },
    {
      name: 'delivery_checklists',
      displayName: 'Delivery Checklists',
      description: 'Checklist items for delivery verification',
      isCore: false,
    },
  ],

  apiRoutes: [
    // POD CRUD
    {
      method: 'GET',
      path: '/pods',
      auth: true,
      handler: 'crud',
      entity: 'proof_of_delivery',
      operation: 'list',
      description: 'List proof of delivery records',
    },
    {
      method: 'GET',
      path: '/pods/:id',
      auth: true,
      handler: 'crud',
      entity: 'proof_of_delivery',
      operation: 'get',
      description: 'Get POD details',
    },
    {
      method: 'POST',
      path: '/pods',
      auth: true,
      role: 'driver',
      handler: 'crud',
      entity: 'proof_of_delivery',
      operation: 'create',
      description: 'Create proof of delivery',
    },

    // Delivery capture
    {
      method: 'POST',
      path: '/deliveries/:id/complete',
      auth: true,
      role: 'driver',
      handler: 'custom',
      entity: 'proof_of_delivery',
      description: 'Complete delivery with POD',
    },

    // Signatures
    {
      method: 'POST',
      path: '/pods/:id/signature',
      auth: true,
      role: 'driver',
      handler: 'custom',
      entity: 'pod_signatures',
      description: 'Upload signature image',
    },
    {
      method: 'GET',
      path: '/pods/:id/signature',
      auth: true,
      handler: 'crud',
      entity: 'pod_signatures',
      operation: 'get',
      description: 'Get signature image',
    },

    // Photos
    {
      method: 'POST',
      path: '/pods/:id/photos',
      auth: true,
      role: 'driver',
      handler: 'custom',
      entity: 'pod_photos',
      description: 'Upload delivery photos',
    },
    {
      method: 'GET',
      path: '/pods/:id/photos',
      auth: true,
      handler: 'crud',
      entity: 'pod_photos',
      operation: 'list',
      description: 'Get delivery photos',
    },
    {
      method: 'DELETE',
      path: '/pods/:podId/photos/:id',
      auth: true,
      handler: 'crud',
      entity: 'pod_photos',
      operation: 'delete',
      description: 'Delete delivery photo',
    },

    // Exceptions
    {
      method: 'POST',
      path: '/deliveries/:id/exception',
      auth: true,
      role: 'driver',
      handler: 'crud',
      entity: 'delivery_exceptions',
      operation: 'create',
      description: 'Report delivery exception',
    },
    {
      method: 'GET',
      path: '/delivery-exceptions',
      auth: true,
      handler: 'crud',
      entity: 'delivery_exceptions',
      operation: 'list',
      description: 'List delivery exceptions',
    },
    {
      method: 'PUT',
      path: '/delivery-exceptions/:id/resolve',
      auth: true,
      role: 'dispatcher',
      handler: 'custom',
      entity: 'delivery_exceptions',
      description: 'Resolve delivery exception',
    },

    // Download/share
    {
      method: 'GET',
      path: '/pods/:id/download',
      auth: true,
      handler: 'custom',
      entity: 'proof_of_delivery',
      description: 'Download POD as PDF',
    },
    {
      method: 'POST',
      path: '/pods/:id/email',
      auth: true,
      handler: 'custom',
      entity: 'proof_of_delivery',
      description: 'Email POD to recipient',
    },

    // Bulk operations
    {
      method: 'POST',
      path: '/pods/bulk-download',
      auth: true,
      handler: 'custom',
      entity: 'proof_of_delivery',
      description: 'Download multiple PODs as ZIP',
    },
  ],

  config: [
    {
      key: 'requireSignature',
      label: 'Require Signature',
      type: 'boolean',
      default: true,
      description: 'Require signature for all deliveries',
    },
    {
      key: 'requirePhoto',
      label: 'Require Photo',
      type: 'boolean',
      default: true,
      description: 'Require photo proof for deliveries',
    },
    {
      key: 'minPhotosRequired',
      label: 'Minimum Photos Required',
      type: 'number',
      default: 1,
      description: 'Minimum number of photos required',
    },
    {
      key: 'maxPhotosAllowed',
      label: 'Maximum Photos Allowed',
      type: 'number',
      default: 5,
      description: 'Maximum photos per delivery',
    },
    {
      key: 'captureGpsLocation',
      label: 'Capture GPS Location',
      type: 'boolean',
      default: true,
      description: 'Record GPS coordinates at delivery',
    },
    {
      key: 'captureTimestamp',
      label: 'Capture Timestamp',
      type: 'boolean',
      default: true,
      description: 'Record delivery timestamp',
    },
    {
      key: 'exceptionReasons',
      label: 'Exception Reasons',
      type: 'select',
      default: 'standard',
      options: [
        { value: 'standard', label: 'Standard Reasons' },
        { value: 'extended', label: 'Extended Reasons' },
        { value: 'custom', label: 'Custom Reasons' },
      ],
      description: 'Available exception reasons',
    },
    {
      key: 'autoEmailPod',
      label: 'Auto Email POD',
      type: 'boolean',
      default: false,
      description: 'Automatically email POD to recipient',
    },
    {
      key: 'podRetentionDays',
      label: 'POD Retention (days)',
      type: 'number',
      default: 730,
      description: 'How long to keep POD records',
    },
  ],
};
