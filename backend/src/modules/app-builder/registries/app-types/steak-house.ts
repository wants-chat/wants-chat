/**
 * Steak House App Type Definition
 *
 * Complete definition for steak house applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const STEAK_HOUSE_APP_TYPE: AppTypeDefinition = {
  id: 'steak-house',
  name: 'Steak House',
  category: 'services',
  description: 'Steak House platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "steak house",
      "steak",
      "house",
      "steak software",
      "steak app",
      "steak platform",
      "steak system",
      "steak management",
      "services steak"
  ],

  synonyms: [
      "Steak House platform",
      "Steak House software",
      "Steak House system",
      "steak solution",
      "steak service"
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
      "Build a steak house platform",
      "Create a steak house app",
      "I need a steak house management system",
      "Build a steak house solution",
      "Create a steak house booking system"
  ],
};
