/**
 * Soil Amendment App Type Definition
 *
 * Complete definition for soil amendment applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SOIL_AMENDMENT_APP_TYPE: AppTypeDefinition = {
  id: 'soil-amendment',
  name: 'Soil Amendment',
  category: 'services',
  description: 'Soil Amendment platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "soil amendment",
      "soil",
      "amendment",
      "soil software",
      "soil app",
      "soil platform",
      "soil system",
      "soil management",
      "services soil"
  ],

  synonyms: [
      "Soil Amendment platform",
      "Soil Amendment software",
      "Soil Amendment system",
      "soil solution",
      "soil service"
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
      "Build a soil amendment platform",
      "Create a soil amendment app",
      "I need a soil amendment management system",
      "Build a soil amendment solution",
      "Create a soil amendment booking system"
  ],
};
