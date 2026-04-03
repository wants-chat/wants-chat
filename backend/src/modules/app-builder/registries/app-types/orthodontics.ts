/**
 * Orthodontics App Type Definition
 *
 * Complete definition for orthodontics applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ORTHODONTICS_APP_TYPE: AppTypeDefinition = {
  id: 'orthodontics',
  name: 'Orthodontics',
  category: 'healthcare',
  description: 'Orthodontics platform with comprehensive management features',
  icon: 'stethoscope',

  keywords: [
      "orthodontics",
      "orthodontics software",
      "orthodontics app",
      "orthodontics platform",
      "orthodontics system",
      "orthodontics management",
      "healthcare orthodontics"
  ],

  synonyms: [
      "Orthodontics platform",
      "Orthodontics software",
      "Orthodontics system",
      "orthodontics solution",
      "orthodontics service"
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
      "patient-records",
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "telemedicine",
      "prescriptions",
      "insurance-billing",
      "messaging",
      "documents",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'healthcare',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'professional',

  examplePrompts: [
      "Build a orthodontics platform",
      "Create a orthodontics app",
      "I need a orthodontics management system",
      "Build a orthodontics solution",
      "Create a orthodontics booking system"
  ],
};
