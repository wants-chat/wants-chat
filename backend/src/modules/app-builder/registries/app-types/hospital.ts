/**
 * Hospital App Type Definition
 *
 * Complete definition for hospital applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HOSPITAL_APP_TYPE: AppTypeDefinition = {
  id: 'hospital',
  name: 'Hospital',
  category: 'services',
  description: 'Hospital platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "hospital",
      "hospital software",
      "hospital app",
      "hospital platform",
      "hospital system",
      "hospital management",
      "services hospital"
  ],

  synonyms: [
      "Hospital platform",
      "Hospital software",
      "Hospital system",
      "hospital solution",
      "hospital service"
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
      "Build a hospital platform",
      "Create a hospital app",
      "I need a hospital management system",
      "Build a hospital solution",
      "Create a hospital booking system"
  ],
};
