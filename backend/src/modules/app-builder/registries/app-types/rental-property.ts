/**
 * Rental Property App Type Definition
 *
 * Complete definition for rental property applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RENTAL_PROPERTY_APP_TYPE: AppTypeDefinition = {
  id: 'rental-property',
  name: 'Rental Property',
  category: 'real-estate',
  description: 'Rental Property platform with comprehensive management features',
  icon: 'building',

  keywords: [
      "rental property",
      "rental",
      "property",
      "rental software",
      "rental app",
      "rental platform",
      "rental system",
      "rental management",
      "real-estate rental"
  ],

  synonyms: [
      "Rental Property platform",
      "Rental Property software",
      "Rental Property system",
      "rental solution",
      "rental service"
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
      "Build a rental property platform",
      "Create a rental property app",
      "I need a rental property management system",
      "Build a rental property solution",
      "Create a rental property booking system"
  ],
};
