/**
 * Salt Therapy App Type Definition
 *
 * Complete definition for salt therapy applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SALT_THERAPY_APP_TYPE: AppTypeDefinition = {
  id: 'salt-therapy',
  name: 'Salt Therapy',
  category: 'healthcare',
  description: 'Salt Therapy platform with comprehensive management features',
  icon: 'heart',

  keywords: [
      "salt therapy",
      "salt",
      "therapy",
      "salt software",
      "salt app",
      "salt platform",
      "salt system",
      "salt management",
      "healthcare salt"
  ],

  synonyms: [
      "Salt Therapy platform",
      "Salt Therapy software",
      "Salt Therapy system",
      "salt solution",
      "salt service"
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
          "name": "Practice Owner",
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
          "name": "Healthcare Provider",
          "level": 40,
          "isDefault": false,
          "accessibleSections": [
              "admin"
          ],
          "defaultRoute": "/admin/dashboard"
      },
      {
          "id": "user",
          "name": "Patient",
          "level": 10,
          "isDefault": true,
          "accessibleSections": [
              "frontend"
          ],
          "defaultRoute": "/appointments"
      }
  ],

  defaultFeatures: [
      "user-auth",
      "appointments",
      "calendar",
      "scheduling",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "treatment-plans",
      "documents",
      "invoicing",
      "payments",
      "messaging"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'healthcare',

  defaultColorScheme: 'purple',
  defaultDesignVariant: 'calm',

  examplePrompts: [
      "Build a salt therapy platform",
      "Create a salt therapy app",
      "I need a salt therapy management system",
      "Build a salt therapy solution",
      "Create a salt therapy booking system"
  ],
};
