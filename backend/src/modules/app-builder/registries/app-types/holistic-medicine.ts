/**
 * Holistic Medicine App Type Definition
 *
 * Complete definition for holistic medicine applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HOLISTIC_MEDICINE_APP_TYPE: AppTypeDefinition = {
  id: 'holistic-medicine',
  name: 'Holistic Medicine',
  category: 'services',
  description: 'Holistic Medicine platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "holistic medicine",
      "holistic",
      "medicine",
      "holistic software",
      "holistic app",
      "holistic platform",
      "holistic system",
      "holistic management",
      "services holistic"
  ],

  synonyms: [
      "Holistic Medicine platform",
      "Holistic Medicine software",
      "Holistic Medicine system",
      "holistic solution",
      "holistic service"
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
      "Build a holistic medicine platform",
      "Create a holistic medicine app",
      "I need a holistic medicine management system",
      "Build a holistic medicine solution",
      "Create a holistic medicine booking system"
  ],
};
