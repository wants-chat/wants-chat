/**
 * Neuro Rehabilitation App Type Definition
 *
 * Complete definition for neuro rehabilitation applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const NEURO_REHABILITATION_APP_TYPE: AppTypeDefinition = {
  id: 'neuro-rehabilitation',
  name: 'Neuro Rehabilitation',
  category: 'healthcare',
  description: 'Neuro Rehabilitation platform with comprehensive management features',
  icon: 'stethoscope',

  keywords: [
      "neuro rehabilitation",
      "neuro",
      "rehabilitation",
      "neuro software",
      "neuro app",
      "neuro platform",
      "neuro system",
      "neuro management",
      "healthcare neuro"
  ],

  synonyms: [
      "Neuro Rehabilitation platform",
      "Neuro Rehabilitation software",
      "Neuro Rehabilitation system",
      "neuro solution",
      "neuro service"
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
      "Build a neuro rehabilitation platform",
      "Create a neuro rehabilitation app",
      "I need a neuro rehabilitation management system",
      "Build a neuro rehabilitation solution",
      "Create a neuro rehabilitation booking system"
  ],
};
