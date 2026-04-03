/**
 * Health Clinic App Type Definition
 *
 * Complete definition for health clinic applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HEALTH_CLINIC_APP_TYPE: AppTypeDefinition = {
  id: 'health-clinic',
  name: 'Health Clinic',
  category: 'healthcare',
  description: 'Health Clinic platform with comprehensive management features',
  icon: 'clinic',

  keywords: [
      "health clinic",
      "health",
      "clinic",
      "health software",
      "health app",
      "health platform",
      "health system",
      "health management",
      "healthcare health"
  ],

  synonyms: [
      "Health Clinic platform",
      "Health Clinic software",
      "Health Clinic system",
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
      "Build a health clinic platform",
      "Create a health clinic app",
      "I need a health clinic management system",
      "Build a health clinic solution",
      "Create a health clinic booking system"
  ],
};
