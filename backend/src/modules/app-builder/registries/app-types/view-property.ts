/**
 * View Property App Type Definition
 *
 * Complete definition for view property applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VIEW_PROPERTY_APP_TYPE: AppTypeDefinition = {
  id: 'view-property',
  name: 'View Property',
  category: 'real-estate',
  description: 'View Property platform with comprehensive management features',
  icon: 'building',

  keywords: [
      "view property",
      "view",
      "property",
      "view software",
      "view app",
      "view platform",
      "view system",
      "view management",
      "real-estate view"
  ],

  synonyms: [
      "View Property platform",
      "View Property software",
      "View Property system",
      "view solution",
      "view service"
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
      "Build a view property platform",
      "Create a view property app",
      "I need a view property management system",
      "Build a view property solution",
      "Create a view property booking system"
  ],
};
