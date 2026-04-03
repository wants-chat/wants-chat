/**
 * Couples Therapy App Type Definition
 *
 * Complete definition for couples therapy applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const COUPLES_THERAPY_APP_TYPE: AppTypeDefinition = {
  id: 'couples-therapy',
  name: 'Couples Therapy',
  category: 'healthcare',
  description: 'Couples Therapy platform with comprehensive management features',
  icon: 'heart',

  keywords: [
      "couples therapy",
      "couples",
      "therapy",
      "couples software",
      "couples app",
      "couples platform",
      "couples system",
      "couples management",
      "healthcare couples"
  ],

  synonyms: [
      "Couples Therapy platform",
      "Couples Therapy software",
      "Couples Therapy system",
      "couples solution",
      "couples service"
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
      "Build a couples therapy platform",
      "Create a couples therapy app",
      "I need a couples therapy management system",
      "Build a couples therapy solution",
      "Create a couples therapy booking system"
  ],
};
