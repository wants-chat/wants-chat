/**
 * Self Storage App Type Definition
 *
 * Complete definition for self storage applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SELF_STORAGE_APP_TYPE: AppTypeDefinition = {
  id: 'self-storage',
  name: 'Self Storage',
  category: 'services',
  description: 'Self Storage platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "self storage",
      "self",
      "storage",
      "self software",
      "self app",
      "self platform",
      "self system",
      "self management",
      "services self"
  ],

  synonyms: [
      "Self Storage platform",
      "Self Storage software",
      "Self Storage system",
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
      "Build a self storage platform",
      "Create a self storage app",
      "I need a self storage management system",
      "Build a self storage solution",
      "Create a self storage booking system"
  ],
};
