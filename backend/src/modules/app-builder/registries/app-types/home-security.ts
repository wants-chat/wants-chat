/**
 * Home Security App Type Definition
 *
 * Complete definition for home security applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HOME_SECURITY_APP_TYPE: AppTypeDefinition = {
  id: 'home-security',
  name: 'Home Security',
  category: 'services',
  description: 'Home Security platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "home security",
      "home",
      "security",
      "home software",
      "home app",
      "home platform",
      "home system",
      "home management",
      "services home"
  ],

  synonyms: [
      "Home Security platform",
      "Home Security software",
      "Home Security system",
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
      "Build a home security platform",
      "Create a home security app",
      "I need a home security management system",
      "Build a home security solution",
      "Create a home security booking system"
  ],
};
