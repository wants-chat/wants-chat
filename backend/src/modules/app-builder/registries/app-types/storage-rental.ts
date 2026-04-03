/**
 * Storage Rental App Type Definition
 *
 * Complete definition for storage rental applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const STORAGE_RENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'storage-rental',
  name: 'Storage Rental',
  category: 'rental',
  description: 'Storage Rental platform with comprehensive management features',
  icon: 'key',

  keywords: [
      "storage rental",
      "storage",
      "rental",
      "storage software",
      "storage app",
      "storage platform",
      "storage system",
      "storage management",
      "rental storage"
  ],

  synonyms: [
      "Storage Rental platform",
      "Storage Rental software",
      "Storage Rental system",
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
      "inventory",
      "reservations",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "invoicing",
      "check-in",
      "reviews",
      "discounts"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'rental',

  defaultColorScheme: 'teal',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a storage rental platform",
      "Create a storage rental app",
      "I need a storage rental management system",
      "Build a storage rental solution",
      "Create a storage rental booking system"
  ],
};
