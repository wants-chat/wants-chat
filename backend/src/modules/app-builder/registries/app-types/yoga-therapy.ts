/**
 * Yoga Therapy App Type Definition
 *
 * Complete definition for yoga therapy applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const YOGA_THERAPY_APP_TYPE: AppTypeDefinition = {
  id: 'yoga-therapy',
  name: 'Yoga Therapy',
  category: 'healthcare',
  description: 'Yoga Therapy platform with comprehensive management features',
  icon: 'heart',

  keywords: [
      "yoga therapy",
      "yoga",
      "therapy",
      "yoga software",
      "yoga app",
      "yoga platform",
      "yoga system",
      "yoga management",
      "healthcare yoga"
  ],

  synonyms: [
      "Yoga Therapy platform",
      "Yoga Therapy software",
      "Yoga Therapy system",
      "yoga solution",
      "yoga service"
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
      "Build a yoga therapy platform",
      "Create a yoga therapy app",
      "I need a yoga therapy management system",
      "Build a yoga therapy solution",
      "Create a yoga therapy booking system"
  ],
};
