/**
 * Storage Solutions App Type Definition
 *
 * Complete definition for storage solutions applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const STORAGE_SOLUTIONS_APP_TYPE: AppTypeDefinition = {
  id: 'storage-solutions',
  name: 'Storage Solutions',
  category: 'services',
  description: 'Storage Solutions platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "storage solutions",
      "storage",
      "solutions",
      "storage software",
      "storage app",
      "storage platform",
      "storage system",
      "storage management",
      "services storage"
  ],

  synonyms: [
      "Storage Solutions platform",
      "Storage Solutions software",
      "Storage Solutions system",
      "storage solution",
      "storage service"
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
      "Build a storage solutions platform",
      "Create a storage solutions app",
      "I need a storage solutions management system",
      "Build a storage solutions solution",
      "Create a storage solutions booking system"
  ],
};
