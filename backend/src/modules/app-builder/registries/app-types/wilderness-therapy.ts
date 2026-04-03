/**
 * Wilderness Therapy App Type Definition
 *
 * Complete definition for wilderness therapy applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WILDERNESS_THERAPY_APP_TYPE: AppTypeDefinition = {
  id: 'wilderness-therapy',
  name: 'Wilderness Therapy',
  category: 'healthcare',
  description: 'Wilderness Therapy platform with comprehensive management features',
  icon: 'heart',

  keywords: [
      "wilderness therapy",
      "wilderness",
      "therapy",
      "wilderness software",
      "wilderness app",
      "wilderness platform",
      "wilderness system",
      "wilderness management",
      "healthcare wilderness"
  ],

  synonyms: [
      "Wilderness Therapy platform",
      "Wilderness Therapy software",
      "Wilderness Therapy system",
      "wilderness solution",
      "wilderness service"
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
      "Build a wilderness therapy platform",
      "Create a wilderness therapy app",
      "I need a wilderness therapy management system",
      "Build a wilderness therapy solution",
      "Create a wilderness therapy booking system"
  ],
};
