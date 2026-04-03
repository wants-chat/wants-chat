/**
 * Telehealth App Type Definition
 *
 * Complete definition for telehealth applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TELEHEALTH_APP_TYPE: AppTypeDefinition = {
  id: 'telehealth',
  name: 'Telehealth',
  category: 'healthcare',
  description: 'Telehealth platform with comprehensive management features',
  icon: 'stethoscope',

  keywords: [
      "telehealth",
      "telehealth software",
      "telehealth app",
      "telehealth platform",
      "telehealth system",
      "telehealth management",
      "healthcare telehealth"
  ],

  synonyms: [
      "Telehealth platform",
      "Telehealth software",
      "Telehealth system",
      "telehealth solution",
      "telehealth service"
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
      "Build a telehealth platform",
      "Create a telehealth app",
      "I need a telehealth management system",
      "Build a telehealth solution",
      "Create a telehealth booking system"
  ],
};
