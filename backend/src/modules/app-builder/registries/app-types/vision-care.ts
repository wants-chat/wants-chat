/**
 * Vision Care App Type Definition
 *
 * Complete definition for vision care applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VISION_CARE_APP_TYPE: AppTypeDefinition = {
  id: 'vision-care',
  name: 'Vision Care',
  category: 'healthcare',
  description: 'Vision Care platform with comprehensive management features',
  icon: 'stethoscope',

  keywords: [
      "vision care",
      "vision",
      "care",
      "vision software",
      "vision app",
      "vision platform",
      "vision system",
      "vision management",
      "healthcare vision"
  ],

  synonyms: [
      "Vision Care platform",
      "Vision Care software",
      "Vision Care system",
      "vision solution",
      "vision service"
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
      "Build a vision care platform",
      "Create a vision care app",
      "I need a vision care management system",
      "Build a vision care solution",
      "Create a vision care booking system"
  ],
};
