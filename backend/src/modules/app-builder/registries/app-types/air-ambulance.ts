/**
 * Air Ambulance App Type Definition
 *
 * Complete definition for air ambulance applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AIR_AMBULANCE_APP_TYPE: AppTypeDefinition = {
  id: 'air-ambulance',
  name: 'Air Ambulance',
  category: 'services',
  description: 'Air Ambulance platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "air ambulance",
      "air",
      "ambulance",
      "air software",
      "air app",
      "air platform",
      "air system",
      "air management",
      "services air"
  ],

  synonyms: [
      "Air Ambulance platform",
      "Air Ambulance software",
      "Air Ambulance system",
      "air solution",
      "air service"
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
      "Build a air ambulance platform",
      "Create a air ambulance app",
      "I need a air ambulance management system",
      "Build a air ambulance solution",
      "Create a air ambulance booking system"
  ],
};
