/**
 * Aqua Therapy App Type Definition
 *
 * Complete definition for aqua therapy applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const AQUA_THERAPY_APP_TYPE: AppTypeDefinition = {
  id: 'aqua-therapy',
  name: 'Aqua Therapy',
  category: 'healthcare',
  description: 'Aqua Therapy platform with comprehensive management features',
  icon: 'heart',

  keywords: [
      "aqua therapy",
      "aqua",
      "therapy",
      "aqua software",
      "aqua app",
      "aqua platform",
      "aqua system",
      "aqua management",
      "healthcare aqua"
  ],

  synonyms: [
      "Aqua Therapy platform",
      "Aqua Therapy software",
      "Aqua Therapy system",
      "aqua solution",
      "aqua service"
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
      "Build a aqua therapy platform",
      "Create a aqua therapy app",
      "I need a aqua therapy management system",
      "Build a aqua therapy solution",
      "Create a aqua therapy booking system"
  ],
};
