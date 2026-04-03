/**
 * Wreath Making App Type Definition
 *
 * Complete definition for wreath making applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WREATH_MAKING_APP_TYPE: AppTypeDefinition = {
  id: 'wreath-making',
  name: 'Wreath Making',
  category: 'services',
  description: 'Wreath Making platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "wreath making",
      "wreath",
      "making",
      "wreath software",
      "wreath app",
      "wreath platform",
      "wreath system",
      "wreath management",
      "services wreath"
  ],

  synonyms: [
      "Wreath Making platform",
      "Wreath Making software",
      "Wreath Making system",
      "wreath solution",
      "wreath service"
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
      "Build a wreath making platform",
      "Create a wreath making app",
      "I need a wreath making management system",
      "Build a wreath making solution",
      "Create a wreath making booking system"
  ],
};
