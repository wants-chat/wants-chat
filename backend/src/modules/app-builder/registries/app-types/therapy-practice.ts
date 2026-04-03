/**
 * Therapy Practice App Type Definition
 *
 * Complete definition for therapy practice applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const THERAPY_PRACTICE_APP_TYPE: AppTypeDefinition = {
  id: 'therapy-practice',
  name: 'Therapy Practice',
  category: 'healthcare',
  description: 'Therapy Practice platform with comprehensive management features',
  icon: 'heart',

  keywords: [
      "therapy practice",
      "therapy",
      "practice",
      "therapy software",
      "therapy app",
      "therapy platform",
      "therapy system",
      "therapy management",
      "healthcare therapy"
  ],

  synonyms: [
      "Therapy Practice platform",
      "Therapy Practice software",
      "Therapy Practice system",
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
      "Build a therapy practice platform",
      "Create a therapy practice app",
      "I need a therapy practice management system",
      "Build a therapy practice solution",
      "Create a therapy practice booking system"
  ],
};
