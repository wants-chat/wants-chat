/**
 * Territory Management App Type Definition
 *
 * Complete definition for territory management applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TERRITORY_MANAGEMENT_APP_TYPE: AppTypeDefinition = {
  id: 'territory-management',
  name: 'Territory Management',
  category: 'services',
  description: 'Territory Management platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "territory management",
      "territory",
      "management",
      "territory software",
      "territory app",
      "territory platform",
      "territory system",
      "services territory"
  ],

  synonyms: [
      "Territory Management platform",
      "Territory Management software",
      "Territory Management system",
      "territory solution",
      "territory service"
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
      "Build a territory management platform",
      "Create a territory management app",
      "I need a territory management management system",
      "Build a territory management solution",
      "Create a territory management booking system"
  ],
};
