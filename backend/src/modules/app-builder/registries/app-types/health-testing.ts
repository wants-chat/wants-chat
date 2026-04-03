/**
 * Health Testing App Type Definition
 *
 * Complete definition for health testing applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HEALTH_TESTING_APP_TYPE: AppTypeDefinition = {
  id: 'health-testing',
  name: 'Health Testing',
  category: 'healthcare',
  description: 'Health Testing platform with comprehensive management features',
  icon: 'stethoscope',

  keywords: [
      "health testing",
      "health",
      "testing",
      "health software",
      "health app",
      "health platform",
      "health system",
      "health management",
      "healthcare health"
  ],

  synonyms: [
      "Health Testing platform",
      "Health Testing software",
      "Health Testing system",
      "health solution",
      "health service"
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
      "Build a health testing platform",
      "Create a health testing app",
      "I need a health testing management system",
      "Build a health testing solution",
      "Create a health testing booking system"
  ],
};
