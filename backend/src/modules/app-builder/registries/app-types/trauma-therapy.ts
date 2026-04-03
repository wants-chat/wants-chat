/**
 * Trauma Therapy App Type Definition
 *
 * Complete definition for trauma therapy applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRAUMA_THERAPY_APP_TYPE: AppTypeDefinition = {
  id: 'trauma-therapy',
  name: 'Trauma Therapy',
  category: 'healthcare',
  description: 'Trauma Therapy platform with comprehensive management features',
  icon: 'heart',

  keywords: [
      "trauma therapy",
      "trauma",
      "therapy",
      "trauma software",
      "trauma app",
      "trauma platform",
      "trauma system",
      "trauma management",
      "healthcare trauma"
  ],

  synonyms: [
      "Trauma Therapy platform",
      "Trauma Therapy software",
      "Trauma Therapy system",
      "trauma solution",
      "trauma service"
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
      "Build a trauma therapy platform",
      "Create a trauma therapy app",
      "I need a trauma therapy management system",
      "Build a trauma therapy solution",
      "Create a trauma therapy booking system"
  ],
};
