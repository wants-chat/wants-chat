/**
 * Yard Care App Type Definition
 *
 * Complete definition for yard care applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const YARD_CARE_APP_TYPE: AppTypeDefinition = {
  id: 'yard-care',
  name: 'Yard Care',
  category: 'healthcare',
  description: 'Yard Care platform with comprehensive management features',
  icon: 'stethoscope',

  keywords: [
      "yard care",
      "yard",
      "care",
      "yard software",
      "yard app",
      "yard platform",
      "yard system",
      "yard management",
      "healthcare yard"
  ],

  synonyms: [
      "Yard Care platform",
      "Yard Care software",
      "Yard Care system",
      "yard solution",
      "yard service"
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
      "Build a yard care platform",
      "Create a yard care app",
      "I need a yard care management system",
      "Build a yard care solution",
      "Create a yard care booking system"
  ],
};
