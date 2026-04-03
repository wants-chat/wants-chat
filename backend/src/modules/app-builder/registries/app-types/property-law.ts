/**
 * Property Law App Type Definition
 *
 * Complete definition for property law applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PROPERTY_LAW_APP_TYPE: AppTypeDefinition = {
  id: 'property-law',
  name: 'Property Law',
  category: 'legal',
  description: 'Property Law platform with comprehensive management features',
  icon: 'scale',

  keywords: [
      "property law",
      "property",
      "law",
      "property software",
      "property app",
      "property platform",
      "property system",
      "property management",
      "legal property"
  ],

  synonyms: [
      "Property Law platform",
      "Property Law software",
      "Property Law system",
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
          "name": "Managing Partner",
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
          "name": "Attorney",
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
      "case-management",
      "client-intake",
      "billing-timekeeping",
      "documents",
      "notifications"
  ],

  optionalFeatures: [
      "court-calendar",
      "document-assembly",
      "conflict-check",
      "payments",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'legal',

  defaultColorScheme: 'slate',
  defaultDesignVariant: 'professional',

  examplePrompts: [
      "Build a property law platform",
      "Create a property law app",
      "I need a property law management system",
      "Build a property law solution",
      "Create a property law booking system"
  ],
};
