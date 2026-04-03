/**
 * Travel Clinic App Type Definition
 *
 * Complete definition for travel clinic applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRAVEL_CLINIC_APP_TYPE: AppTypeDefinition = {
  id: 'travel-clinic',
  name: 'Travel Clinic',
  category: 'healthcare',
  description: 'Travel Clinic platform with comprehensive management features',
  icon: 'clinic',

  keywords: [
      "travel clinic",
      "travel",
      "clinic",
      "travel software",
      "travel app",
      "travel platform",
      "travel system",
      "travel management",
      "healthcare travel"
  ],

  synonyms: [
      "Travel Clinic platform",
      "Travel Clinic software",
      "Travel Clinic system",
      "travel solution",
      "travel service"
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
      "Build a travel clinic platform",
      "Create a travel clinic app",
      "I need a travel clinic management system",
      "Build a travel clinic solution",
      "Create a travel clinic booking system"
  ],
};
