/**
 * Stump Grinding App Type Definition
 *
 * Complete definition for stump grinding applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const STUMP_GRINDING_APP_TYPE: AppTypeDefinition = {
  id: 'stump-grinding',
  name: 'Stump Grinding',
  category: 'services',
  description: 'Stump Grinding platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "stump grinding",
      "stump",
      "grinding",
      "stump software",
      "stump app",
      "stump platform",
      "stump system",
      "stump management",
      "services stump"
  ],

  synonyms: [
      "Stump Grinding platform",
      "Stump Grinding software",
      "Stump Grinding system",
      "stump solution",
      "stump service"
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
      "Build a stump grinding platform",
      "Create a stump grinding app",
      "I need a stump grinding management system",
      "Build a stump grinding solution",
      "Create a stump grinding booking system"
  ],
};
