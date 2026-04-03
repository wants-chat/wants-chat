/**
 * Wrought Iron App Type Definition
 *
 * Complete definition for wrought iron applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WROUGHT_IRON_APP_TYPE: AppTypeDefinition = {
  id: 'wrought-iron',
  name: 'Wrought Iron',
  category: 'services',
  description: 'Wrought Iron platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "wrought iron",
      "wrought",
      "iron",
      "wrought software",
      "wrought app",
      "wrought platform",
      "wrought system",
      "wrought management",
      "services wrought"
  ],

  synonyms: [
      "Wrought Iron platform",
      "Wrought Iron software",
      "Wrought Iron system",
      "wrought solution",
      "wrought service"
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
      "Build a wrought iron platform",
      "Create a wrought iron app",
      "I need a wrought iron management system",
      "Build a wrought iron solution",
      "Create a wrought iron booking system"
  ],
};
