/**
 * Therapy Center App Type Definition
 *
 * Complete definition for therapy center applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const THERAPY_CENTER_APP_TYPE: AppTypeDefinition = {
  id: 'therapy-center',
  name: 'Therapy Center',
  category: 'healthcare',
  description: 'Therapy Center platform with comprehensive management features',
  icon: 'heart',

  keywords: [
      "therapy center",
      "therapy",
      "center",
      "therapy software",
      "therapy app",
      "therapy platform",
      "therapy system",
      "therapy management",
      "healthcare therapy"
  ],

  synonyms: [
      "Therapy Center platform",
      "Therapy Center software",
      "Therapy Center system",
      "therapy solution",
      "therapy service"
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
      "Build a therapy center platform",
      "Create a therapy center app",
      "I need a therapy center management system",
      "Build a therapy center solution",
      "Create a therapy center booking system"
  ],
};
