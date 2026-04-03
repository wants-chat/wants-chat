/**
 * Property Appraisal App Type Definition
 *
 * Complete definition for property appraisal applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PROPERTY_APPRAISAL_APP_TYPE: AppTypeDefinition = {
  id: 'property-appraisal',
  name: 'Property Appraisal',
  category: 'real-estate',
  description: 'Property Appraisal platform with comprehensive management features',
  icon: 'building',

  keywords: [
      "property appraisal",
      "property",
      "appraisal",
      "property software",
      "property app",
      "property platform",
      "property system",
      "property management",
      "real-estate property"
  ],

  synonyms: [
      "Property Appraisal platform",
      "Property Appraisal software",
      "Property Appraisal system",
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
      "Build a property appraisal platform",
      "Create a property appraisal app",
      "I need a property appraisal management system",
      "Build a property appraisal solution",
      "Create a property appraisal booking system"
  ],
};
