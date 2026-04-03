/**
 * Alternative Therapy App Type Definition
 *
 * Complete definition for alternative therapy applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ALTERNATIVE_THERAPY_APP_TYPE: AppTypeDefinition = {
  id: 'alternative-therapy',
  name: 'Alternative Therapy',
  category: 'healthcare',
  description: 'Alternative Therapy platform with comprehensive management features',
  icon: 'heart',

  keywords: [
      "alternative therapy",
      "alternative",
      "therapy",
      "alternative software",
      "alternative app",
      "alternative platform",
      "alternative system",
      "alternative management",
      "healthcare alternative"
  ],

  synonyms: [
      "Alternative Therapy platform",
      "Alternative Therapy software",
      "Alternative Therapy system",
      "alternative solution",
      "alternative service"
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
      "Build a alternative therapy platform",
      "Create a alternative therapy app",
      "I need a alternative therapy management system",
      "Build a alternative therapy solution",
      "Create a alternative therapy booking system"
  ],
};
