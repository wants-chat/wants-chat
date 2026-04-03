/**
 * Secure Storage App Type Definition
 *
 * Complete definition for secure storage applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SECURE_STORAGE_APP_TYPE: AppTypeDefinition = {
  id: 'secure-storage',
  name: 'Secure Storage',
  category: 'services',
  description: 'Secure Storage platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "secure storage",
      "secure",
      "storage",
      "secure software",
      "secure app",
      "secure platform",
      "secure system",
      "secure management",
      "services secure"
  ],

  synonyms: [
      "Secure Storage platform",
      "Secure Storage software",
      "Secure Storage system",
      "secure solution",
      "secure service"
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
      "Build a secure storage platform",
      "Create a secure storage app",
      "I need a secure storage management system",
      "Build a secure storage solution",
      "Create a secure storage booking system"
  ],
};
