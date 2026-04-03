/**
 * Self Defense App Type Definition
 *
 * Complete definition for self defense applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SELF_DEFENSE_APP_TYPE: AppTypeDefinition = {
  id: 'self-defense',
  name: 'Self Defense',
  category: 'services',
  description: 'Self Defense platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "self defense",
      "self",
      "defense",
      "self software",
      "self app",
      "self platform",
      "self system",
      "self management",
      "services self"
  ],

  synonyms: [
      "Self Defense platform",
      "Self Defense software",
      "Self Defense system",
      "self solution",
      "self service"
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
      "Build a self defense platform",
      "Create a self defense app",
      "I need a self defense management system",
      "Build a self defense solution",
      "Create a self defense booking system"
  ],
};
