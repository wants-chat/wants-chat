/**
 * Occupational Health App Type Definition
 *
 * Complete definition for occupational health applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const OCCUPATIONAL_HEALTH_APP_TYPE: AppTypeDefinition = {
  id: 'occupational-health',
  name: 'Occupational Health',
  category: 'healthcare',
  description: 'Occupational Health platform with comprehensive management features',
  icon: 'stethoscope',

  keywords: [
      "occupational health",
      "occupational",
      "health",
      "occupational software",
      "occupational app",
      "occupational platform",
      "occupational system",
      "occupational management",
      "healthcare occupational"
  ],

  synonyms: [
      "Occupational Health platform",
      "Occupational Health software",
      "Occupational Health system",
      "occupational solution",
      "occupational service"
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
      "Build a occupational health platform",
      "Create a occupational health app",
      "I need a occupational health management system",
      "Build a occupational health solution",
      "Create a occupational health booking system"
  ],
};
