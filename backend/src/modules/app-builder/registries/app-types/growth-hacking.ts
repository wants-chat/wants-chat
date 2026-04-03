/**
 * Growth Hacking App Type Definition
 *
 * Complete definition for growth hacking applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const GROWTH_HACKING_APP_TYPE: AppTypeDefinition = {
  id: 'growth-hacking',
  name: 'Growth Hacking',
  category: 'services',
  description: 'Growth Hacking platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "growth hacking",
      "growth",
      "hacking",
      "growth software",
      "growth app",
      "growth platform",
      "growth system",
      "growth management",
      "services growth"
  ],

  synonyms: [
      "Growth Hacking platform",
      "Growth Hacking software",
      "Growth Hacking system",
      "growth solution",
      "growth service"
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
      "Build a growth hacking platform",
      "Create a growth hacking app",
      "I need a growth hacking management system",
      "Build a growth hacking solution",
      "Create a growth hacking booking system"
  ],
};
