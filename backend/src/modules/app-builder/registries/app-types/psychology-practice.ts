/**
 * Psychology Practice App Type Definition
 *
 * Complete definition for psychology practice applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PSYCHOLOGY_PRACTICE_APP_TYPE: AppTypeDefinition = {
  id: 'psychology-practice',
  name: 'Psychology Practice',
  category: 'healthcare',
  description: 'Psychology Practice platform with comprehensive management features',
  icon: 'stethoscope',

  keywords: [
      "psychology practice",
      "psychology",
      "practice",
      "psychology software",
      "psychology app",
      "psychology platform",
      "psychology system",
      "psychology management",
      "healthcare psychology"
  ],

  synonyms: [
      "Psychology Practice platform",
      "Psychology Practice software",
      "Psychology Practice system",
      "psychology solution",
      "psychology service"
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
      "Build a psychology practice platform",
      "Create a psychology practice app",
      "I need a psychology practice management system",
      "Build a psychology practice solution",
      "Create a psychology practice booking system"
  ],
};
