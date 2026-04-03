/**
 * Storage Services App Type Definition
 *
 * Complete definition for storage services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const STORAGE_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'storage-services',
  name: 'Storage Services',
  category: 'services',
  description: 'Storage Services platform with comprehensive management features',
  icon: 'wrench',

  keywords: [
      "storage services",
      "storage",
      "services",
      "storage software",
      "storage app",
      "storage platform",
      "storage system",
      "storage management",
      "services storage"
  ],

  synonyms: [
      "Storage Services platform",
      "Storage Services software",
      "Storage Services system",
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
      "scheduling",
      "invoicing",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "inventory",
      "payments",
      "reviews",
      "clients",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'gray',
  defaultDesignVariant: 'practical',

  examplePrompts: [
      "Build a storage services platform",
      "Create a storage services app",
      "I need a storage services management system",
      "Build a storage services solution",
      "Create a storage services booking system"
  ],
};
