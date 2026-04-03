/**
 * Respiratory Care App Type Definition
 *
 * Complete definition for respiratory care applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const RESPIRATORY_CARE_APP_TYPE: AppTypeDefinition = {
  id: 'respiratory-care',
  name: 'Respiratory Care',
  category: 'healthcare',
  description: 'Respiratory Care platform with comprehensive management features',
  icon: 'stethoscope',

  keywords: [
      "respiratory care",
      "respiratory",
      "care",
      "respiratory software",
      "respiratory app",
      "respiratory platform",
      "respiratory system",
      "respiratory management",
      "healthcare respiratory"
  ],

  synonyms: [
      "Respiratory Care platform",
      "Respiratory Care software",
      "Respiratory Care system",
      "respiratory solution",
      "respiratory service"
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
      "Build a respiratory care platform",
      "Create a respiratory care app",
      "I need a respiratory care management system",
      "Build a respiratory care solution",
      "Create a respiratory care booking system"
  ],
};
