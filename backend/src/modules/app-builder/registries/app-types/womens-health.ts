/**
 * Womens Health App Type Definition
 *
 * Complete definition for womens health applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WOMENS_HEALTH_APP_TYPE: AppTypeDefinition = {
  id: 'womens-health',
  name: 'Womens Health',
  category: 'healthcare',
  description: 'Womens Health platform with comprehensive management features',
  icon: 'stethoscope',

  keywords: [
      "womens health",
      "womens",
      "health",
      "womens software",
      "womens app",
      "womens platform",
      "womens system",
      "womens management",
      "healthcare womens"
  ],

  synonyms: [
      "Womens Health platform",
      "Womens Health software",
      "Womens Health system",
      "womens solution",
      "womens service"
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
      "Build a womens health platform",
      "Create a womens health app",
      "I need a womens health management system",
      "Build a womens health solution",
      "Create a womens health booking system"
  ],
};
