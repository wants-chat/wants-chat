/**
 * Temporary Housing App Type Definition
 *
 * Complete definition for temporary housing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TEMPORARY_HOUSING_APP_TYPE: AppTypeDefinition = {
  id: 'temporary-housing',
  name: 'Temporary Housing',
  category: 'services',
  description: 'Temporary Housing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "temporary housing",
      "temporary",
      "housing",
      "temporary software",
      "temporary app",
      "temporary platform",
      "temporary system",
      "temporary management",
      "services temporary"
  ],

  synonyms: [
      "Temporary Housing platform",
      "Temporary Housing software",
      "Temporary Housing system",
      "temporary solution",
      "temporary service"
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
      "Build a temporary housing platform",
      "Create a temporary housing app",
      "I need a temporary housing management system",
      "Build a temporary housing solution",
      "Create a temporary housing booking system"
  ],
};
