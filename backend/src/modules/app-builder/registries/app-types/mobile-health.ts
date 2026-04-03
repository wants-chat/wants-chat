/**
 * Mobile Health App Type Definition
 *
 * Complete definition for mobile health applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MOBILE_HEALTH_APP_TYPE: AppTypeDefinition = {
  id: 'mobile-health',
  name: 'Mobile Health',
  category: 'healthcare',
  description: 'Mobile Health platform with comprehensive management features',
  icon: 'stethoscope',

  keywords: [
      "mobile health",
      "mobile",
      "health",
      "mobile software",
      "mobile app",
      "mobile platform",
      "mobile system",
      "mobile management",
      "healthcare mobile"
  ],

  synonyms: [
      "Mobile Health platform",
      "Mobile Health software",
      "Mobile Health system",
      "mobile solution",
      "mobile service"
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
      "Build a mobile health platform",
      "Create a mobile health app",
      "I need a mobile health management system",
      "Build a mobile health solution",
      "Create a mobile health booking system"
  ],
};
