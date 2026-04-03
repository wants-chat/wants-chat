/**
 * Specialty Coffee App Type Definition
 *
 * Complete definition for specialty coffee applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SPECIALTY_COFFEE_APP_TYPE: AppTypeDefinition = {
  id: 'specialty-coffee',
  name: 'Specialty Coffee',
  category: 'services',
  description: 'Specialty Coffee platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "specialty coffee",
      "specialty",
      "coffee",
      "specialty software",
      "specialty app",
      "specialty platform",
      "specialty system",
      "specialty management",
      "services specialty"
  ],

  synonyms: [
      "Specialty Coffee platform",
      "Specialty Coffee software",
      "Specialty Coffee system",
      "specialty solution",
      "specialty service"
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
      "Build a specialty coffee platform",
      "Create a specialty coffee app",
      "I need a specialty coffee management system",
      "Build a specialty coffee solution",
      "Create a specialty coffee booking system"
  ],
};
