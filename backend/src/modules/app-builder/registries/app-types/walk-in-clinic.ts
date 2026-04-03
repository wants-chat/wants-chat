/**
 * Walk In Clinic App Type Definition
 *
 * Complete definition for walk in clinic applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WALK_IN_CLINIC_APP_TYPE: AppTypeDefinition = {
  id: 'walk-in-clinic',
  name: 'Walk In Clinic',
  category: 'healthcare',
  description: 'Walk In Clinic platform with comprehensive management features',
  icon: 'clinic',

  keywords: [
      "walk in clinic",
      "walk",
      "clinic",
      "walk software",
      "walk app",
      "walk platform",
      "walk system",
      "walk management",
      "healthcare walk"
  ],

  synonyms: [
      "Walk In Clinic platform",
      "Walk In Clinic software",
      "Walk In Clinic system",
      "walk solution",
      "walk service"
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
      "check-in",
      "notifications"
  ],

  optionalFeatures: [
      "insurance-billing",
      "prescriptions",
      "telemedicine",
      "payments",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'healthcare',

  defaultColorScheme: 'teal',
  defaultDesignVariant: 'clean',

  examplePrompts: [
      "Build a walk in clinic platform",
      "Create a walk in clinic app",
      "I need a walk in clinic management system",
      "Build a walk in clinic solution",
      "Create a walk in clinic booking system"
  ],
};
