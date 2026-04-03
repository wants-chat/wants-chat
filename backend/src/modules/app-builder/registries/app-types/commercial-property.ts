/**
 * Commercial Property App Type Definition
 *
 * Complete definition for commercial property applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const COMMERCIAL_PROPERTY_APP_TYPE: AppTypeDefinition = {
  id: 'commercial-property',
  name: 'Commercial Property',
  category: 'real-estate',
  description: 'Commercial Property platform with comprehensive management features',
  icon: 'building',

  keywords: [
      "commercial property",
      "commercial",
      "property",
      "commercial software",
      "commercial app",
      "commercial platform",
      "commercial system",
      "commercial management",
      "real-estate commercial"
  ],

  synonyms: [
      "Commercial Property platform",
      "Commercial Property software",
      "Commercial Property system",
      "commercial solution",
      "commercial service"
  ],

  negativeKeywords: ['blog', 'portfolio'],

  sections: [
      {
          "id": "frontend",
          "name": "Public Portal",
          "enabled": true,
          "basePath": "/",
          "layout": "public",
          "description": "Public-facing interface"
      },
      {
          "id": "admin",
          "name": "Admin Dashboard",
          "enabled": true,
          "basePath": "/admin",
          "requiredRole": "staff",
          "layout": "admin",
          "description": "Administrative interface"
      }
  ],

  roles: [
      {
          "id": "admin",
          "name": "Broker",
          "level": 100,
          "isDefault": false,
          "accessibleSections": [
              "frontend",
              "admin"
          ],
          "defaultRoute": "/admin/dashboard"
      },
      {
          "id": "staff",
          "name": "Agent",
          "level": 40,
          "isDefault": false,
          "accessibleSections": [
              "admin"
          ],
          "defaultRoute": "/admin/dashboard"
      },
      {
          "id": "user",
          "name": "Client",
          "level": 10,
          "isDefault": true,
          "accessibleSections": [
              "frontend"
          ],
          "defaultRoute": "/"
      }
  ],

  defaultFeatures: [
      "user-auth",
      "property-listings",
      "lease-management",
      "maintenance-requests",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "rent-collection",
      "tenant-screening",
      "payments",
      "documents",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'real-estate',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'clean',

  examplePrompts: [
      "Build a commercial property platform",
      "Create a commercial property app",
      "I need a commercial property management system",
      "Build a commercial property solution",
      "Create a commercial property booking system"
  ],
};
