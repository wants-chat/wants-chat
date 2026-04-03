/**
 * Property Services App Type Definition
 *
 * Complete definition for property services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PROPERTY_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'property-services',
  name: 'Property Services',
  category: 'real-estate',
  description: 'Property Services platform with comprehensive management features',
  icon: 'building',

  keywords: [
      "property services",
      "property",
      "services",
      "property software",
      "property app",
      "property platform",
      "property system",
      "property management",
      "real-estate property"
  ],

  synonyms: [
      "Property Services platform",
      "Property Services software",
      "Property Services system",
      "property solution",
      "property service"
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
      "Build a property services platform",
      "Create a property services app",
      "I need a property services management system",
      "Build a property services solution",
      "Create a property services booking system"
  ],
};
