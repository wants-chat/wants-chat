/**
 * Vacation Property App Type Definition
 *
 * Complete definition for vacation property applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VACATION_PROPERTY_APP_TYPE: AppTypeDefinition = {
  id: 'vacation-property',
  name: 'Vacation Property',
  category: 'real-estate',
  description: 'Vacation Property platform with comprehensive management features',
  icon: 'building',

  keywords: [
      "vacation property",
      "vacation",
      "property",
      "vacation software",
      "vacation app",
      "vacation platform",
      "vacation system",
      "vacation management",
      "real-estate vacation"
  ],

  synonyms: [
      "Vacation Property platform",
      "Vacation Property software",
      "Vacation Property system",
      "vacation solution",
      "vacation service"
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
      "Build a vacation property platform",
      "Create a vacation property app",
      "I need a vacation property management system",
      "Build a vacation property solution",
      "Create a vacation property booking system"
  ],
};
