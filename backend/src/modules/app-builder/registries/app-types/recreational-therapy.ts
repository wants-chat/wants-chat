/**
 * Recreational Therapy App Type Definition
 *
 * Complete definition for recreational therapy applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RECREATIONAL_THERAPY_APP_TYPE: AppTypeDefinition = {
  id: 'recreational-therapy',
  name: 'Recreational Therapy',
  category: 'healthcare',
  description: 'Recreational Therapy platform with comprehensive management features',
  icon: 'heart',

  keywords: [
      "recreational therapy",
      "recreational",
      "therapy",
      "recreational software",
      "recreational app",
      "recreational platform",
      "recreational system",
      "recreational management",
      "healthcare recreational"
  ],

  synonyms: [
      "Recreational Therapy platform",
      "Recreational Therapy software",
      "Recreational Therapy system",
      "recreational solution",
      "recreational service"
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
      "Build a recreational therapy platform",
      "Create a recreational therapy app",
      "I need a recreational therapy management system",
      "Build a recreational therapy solution",
      "Create a recreational therapy booking system"
  ],
};
