/**
 * Cold Storage App Type Definition
 *
 * Complete definition for cold storage applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const COLD_STORAGE_APP_TYPE: AppTypeDefinition = {
  id: 'cold-storage',
  name: 'Cold Storage',
  category: 'services',
  description: 'Cold Storage platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "cold storage",
      "cold",
      "storage",
      "cold software",
      "cold app",
      "cold platform",
      "cold system",
      "cold management",
      "services cold"
  ],

  synonyms: [
      "Cold Storage platform",
      "Cold Storage software",
      "Cold Storage system",
      "cold solution",
      "cold service"
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
      "Build a cold storage platform",
      "Create a cold storage app",
      "I need a cold storage management system",
      "Build a cold storage solution",
      "Create a cold storage booking system"
  ],
};
