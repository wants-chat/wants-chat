/**
 * Hunting Guide App Type Definition
 *
 * Complete definition for hunting guide applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HUNTING_GUIDE_APP_TYPE: AppTypeDefinition = {
  id: 'hunting-guide',
  name: 'Hunting Guide',
  category: 'services',
  description: 'Hunting Guide platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "hunting guide",
      "hunting",
      "guide",
      "hunting software",
      "hunting app",
      "hunting platform",
      "hunting system",
      "hunting management",
      "services hunting"
  ],

  synonyms: [
      "Hunting Guide platform",
      "Hunting Guide software",
      "Hunting Guide system",
      "hunting solution",
      "hunting service"
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
      "Build a hunting guide platform",
      "Create a hunting guide app",
      "I need a hunting guide management system",
      "Build a hunting guide solution",
      "Create a hunting guide booking system"
  ],
};
