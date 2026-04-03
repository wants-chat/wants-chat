/**
 * Animal Assisted Therapy App Type Definition
 *
 * Complete definition for animal assisted therapy applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ANIMAL_ASSISTED_THERAPY_APP_TYPE: AppTypeDefinition = {
  id: 'animal-assisted-therapy',
  name: 'Animal Assisted Therapy',
  category: 'healthcare',
  description: 'Animal Assisted Therapy platform with comprehensive management features',
  icon: 'heart',

  keywords: [
      "animal assisted therapy",
      "animal",
      "assisted",
      "therapy",
      "animal software",
      "animal app",
      "animal platform",
      "animal system",
      "animal management",
      "healthcare animal"
  ],

  synonyms: [
      "Animal Assisted Therapy platform",
      "Animal Assisted Therapy software",
      "Animal Assisted Therapy system",
      "animal solution",
      "animal service"
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
      "Build a animal assisted therapy platform",
      "Create a animal assisted therapy app",
      "I need a animal assisted therapy management system",
      "Build a animal assisted therapy solution",
      "Create a animal assisted therapy booking system"
  ],
};
