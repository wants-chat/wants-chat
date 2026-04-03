/**
 * Residential Property App Type Definition
 *
 * Complete definition for residential property applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RESIDENTIAL_PROPERTY_APP_TYPE: AppTypeDefinition = {
  id: 'residential-property',
  name: 'Residential Property',
  category: 'real-estate',
  description: 'Residential Property platform with comprehensive management features',
  icon: 'building',

  keywords: [
      "residential property",
      "residential",
      "property",
      "residential software",
      "residential app",
      "residential platform",
      "residential system",
      "residential management",
      "real-estate residential"
  ],

  synonyms: [
      "Residential Property platform",
      "Residential Property software",
      "Residential Property system",
      "residential solution",
      "residential service"
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
      "Build a residential property platform",
      "Create a residential property app",
      "I need a residential property management system",
      "Build a residential property solution",
      "Create a residential property booking system"
  ],
};
