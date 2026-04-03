/**
 * Sports Clinic App Type Definition
 *
 * Complete definition for sports clinic applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SPORTS_CLINIC_APP_TYPE: AppTypeDefinition = {
  id: 'sports-clinic',
  name: 'Sports Clinic',
  category: 'healthcare',
  description: 'Sports Clinic platform with comprehensive management features',
  icon: 'clinic',

  keywords: [
      "sports clinic",
      "sports",
      "clinic",
      "sports software",
      "sports app",
      "sports platform",
      "sports system",
      "sports management",
      "healthcare sports"
  ],

  synonyms: [
      "Sports Clinic platform",
      "Sports Clinic software",
      "Sports Clinic system",
      "sports solution",
      "sports service"
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
      "Build a sports clinic platform",
      "Create a sports clinic app",
      "I need a sports clinic management system",
      "Build a sports clinic solution",
      "Create a sports clinic booking system"
  ],
};
