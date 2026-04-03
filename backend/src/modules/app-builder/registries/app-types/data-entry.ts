/**
 * Data Entry App Type Definition
 *
 * Complete definition for data entry applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const DATA_ENTRY_APP_TYPE: AppTypeDefinition = {
  id: 'data-entry',
  name: 'Data Entry',
  category: 'services',
  description: 'Data Entry platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "data entry",
      "data",
      "entry",
      "data software",
      "data app",
      "data platform",
      "data system",
      "data management",
      "services data"
  ],

  synonyms: [
      "Data Entry platform",
      "Data Entry software",
      "Data Entry system",
      "data solution",
      "data service"
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
      "Build a data entry platform",
      "Create a data entry app",
      "I need a data entry management system",
      "Build a data entry solution",
      "Create a data entry booking system"
  ],
};
