/**
 * Property Development App Type Definition
 *
 * Complete definition for property development applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PROPERTY_DEVELOPMENT_APP_TYPE: AppTypeDefinition = {
  id: 'property-development',
  name: 'Property Development',
  category: 'real-estate',
  description: 'Property Development platform with comprehensive management features',
  icon: 'building',

  keywords: [
      "property development",
      "property",
      "development",
      "property software",
      "property app",
      "property platform",
      "property system",
      "property management",
      "real-estate property"
  ],

  synonyms: [
      "Property Development platform",
      "Property Development software",
      "Property Development system",
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
      "Build a property development platform",
      "Create a property development app",
      "I need a property development management system",
      "Build a property development solution",
      "Create a property development booking system"
  ],
};
