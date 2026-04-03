/**
 * Health Screening App Type Definition
 *
 * Complete definition for health screening applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const HEALTH_SCREENING_APP_TYPE: AppTypeDefinition = {
  id: 'health-screening',
  name: 'Health Screening',
  category: 'healthcare',
  description: 'Health Screening platform with comprehensive management features',
  icon: 'stethoscope',

  keywords: [
      "health screening",
      "health",
      "screening",
      "health software",
      "health app",
      "health platform",
      "health system",
      "health management",
      "healthcare health"
  ],

  synonyms: [
      "Health Screening platform",
      "Health Screening software",
      "Health Screening system",
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
      "Build a health screening platform",
      "Create a health screening app",
      "I need a health screening management system",
      "Build a health screening solution",
      "Create a health screening booking system"
  ],
};
