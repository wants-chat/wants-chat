/**
 * Diet Clinic App Type Definition
 *
 * Complete definition for diet clinic applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const DIET_CLINIC_APP_TYPE: AppTypeDefinition = {
  id: 'diet-clinic',
  name: 'Diet Clinic',
  category: 'healthcare',
  description: 'Diet Clinic platform with comprehensive management features',
  icon: 'clinic',

  keywords: [
      "diet clinic",
      "diet",
      "clinic",
      "diet software",
      "diet app",
      "diet platform",
      "diet system",
      "diet management",
      "healthcare diet"
  ],

  synonyms: [
      "Diet Clinic platform",
      "Diet Clinic software",
      "Diet Clinic system",
      "diet solution",
      "diet service"
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
      "Build a diet clinic platform",
      "Create a diet clinic app",
      "I need a diet clinic management system",
      "Build a diet clinic solution",
      "Create a diet clinic booking system"
  ],
};
