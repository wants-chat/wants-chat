/**
 * Mens Health App Type Definition
 *
 * Complete definition for mens health applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MENS_HEALTH_APP_TYPE: AppTypeDefinition = {
  id: 'mens-health',
  name: 'Mens Health',
  category: 'healthcare',
  description: 'Mens Health platform with comprehensive management features',
  icon: 'stethoscope',

  keywords: [
      "mens health",
      "mens",
      "health",
      "mens software",
      "mens app",
      "mens platform",
      "mens system",
      "mens management",
      "healthcare mens"
  ],

  synonyms: [
      "Mens Health platform",
      "Mens Health software",
      "Mens Health system",
      "mens solution",
      "mens service"
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
      "Build a mens health platform",
      "Create a mens health app",
      "I need a mens health management system",
      "Build a mens health solution",
      "Create a mens health booking system"
  ],
};
