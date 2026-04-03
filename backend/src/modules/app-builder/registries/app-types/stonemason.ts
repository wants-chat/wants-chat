/**
 * Stonemason App Type Definition
 *
 * Complete definition for stonemason applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const STONEMASON_APP_TYPE: AppTypeDefinition = {
  id: 'stonemason',
  name: 'Stonemason',
  category: 'services',
  description: 'Stonemason platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "stonemason",
      "stonemason software",
      "stonemason app",
      "stonemason platform",
      "stonemason system",
      "stonemason management",
      "services stonemason"
  ],

  synonyms: [
      "Stonemason platform",
      "Stonemason software",
      "Stonemason system",
      "stonemason solution",
      "stonemason service"
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
      "Build a stonemason platform",
      "Create a stonemason app",
      "I need a stonemason management system",
      "Build a stonemason solution",
      "Create a stonemason booking system"
  ],
};
