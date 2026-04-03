/**
 * Psychiatry App Type Definition
 *
 * Complete definition for psychiatry applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PSYCHIATRY_APP_TYPE: AppTypeDefinition = {
  id: 'psychiatry',
  name: 'Psychiatry',
  category: 'healthcare',
  description: 'Psychiatry platform with comprehensive management features',
  icon: 'stethoscope',

  keywords: [
      "psychiatry",
      "psychiatry software",
      "psychiatry app",
      "psychiatry platform",
      "psychiatry system",
      "psychiatry management",
      "healthcare psychiatry"
  ],

  synonyms: [
      "Psychiatry platform",
      "Psychiatry software",
      "Psychiatry system",
      "psychiatry solution",
      "psychiatry service"
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
      "Build a psychiatry platform",
      "Create a psychiatry app",
      "I need a psychiatry management system",
      "Build a psychiatry solution",
      "Create a psychiatry booking system"
  ],
};
