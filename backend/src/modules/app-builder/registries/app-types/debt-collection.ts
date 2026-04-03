/**
 * Debt Collection App Type Definition
 *
 * Complete definition for debt collection applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const DEBT_COLLECTION_APP_TYPE: AppTypeDefinition = {
  id: 'debt-collection',
  name: 'Debt Collection',
  category: 'services',
  description: 'Debt Collection platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "debt collection",
      "debt",
      "collection",
      "debt software",
      "debt app",
      "debt platform",
      "debt system",
      "debt management",
      "services debt"
  ],

  synonyms: [
      "Debt Collection platform",
      "Debt Collection software",
      "Debt Collection system",
      "debt solution",
      "debt service"
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
      "Build a debt collection platform",
      "Create a debt collection app",
      "I need a debt collection management system",
      "Build a debt collection solution",
      "Create a debt collection booking system"
  ],
};
