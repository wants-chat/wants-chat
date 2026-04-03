/**
 * Facility Management App Type Definition
 *
 * Complete definition for facility management applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const FACILITY_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'facility-management',
  name: 'Facility Management',
  category: 'services',
  description: 'Facility Management platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "facility management",
      "facility",
      "management",
      "facility software",
      "facility app",
      "facility platform",
      "facility system",
      "services facility"
  ],

  synonyms: [
      "Facility Management platform",
      "Facility Management software",
      "Facility Management system",
      "facility solution",
      "facility service"
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
          "name": "Administrator",
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
          "name": "Staff",
          "level": 40,
          "isDefault": false,
          "accessibleSections": [
              "admin"
          ],
          "defaultRoute": "/admin/dashboard"
      },
      {
          "id": "user",
          "name": "User",
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
      "appointments",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "reviews",
      "messaging",
      "documents",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a facility management platform",
      "Create a facility management app",
      "I need a facility management management system",
      "Build a facility management solution",
      "Create a facility management booking system"
  ],
};
