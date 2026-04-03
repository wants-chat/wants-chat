/**
 * Home Nursing App Type Definition
 *
 * Complete definition for home nursing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HOME_NURSING_APP_TYPE: AppTypeDefinition = {
  id: 'home-nursing',
  name: 'Home Nursing',
  category: 'services',
  description: 'Home Nursing platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "home nursing",
      "home",
      "nursing",
      "home software",
      "home app",
      "home platform",
      "home system",
      "home management",
      "services home"
  ],

  synonyms: [
      "Home Nursing platform",
      "Home Nursing software",
      "Home Nursing system",
      "home solution",
      "home service"
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
      "Build a home nursing platform",
      "Create a home nursing app",
      "I need a home nursing management system",
      "Build a home nursing solution",
      "Create a home nursing booking system"
  ],
};
