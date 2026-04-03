/**
 * Online Pharmacy App Type Definition
 *
 * Complete definition for online pharmacy applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ONLINE_PHARMACY_APP_TYPE: AppTypeDefinition = {
  id: 'online-pharmacy',
  name: 'Online Pharmacy',
  category: 'healthcare',
  description: 'Online Pharmacy platform with comprehensive management features',
  icon: 'stethoscope',

  keywords: [
      "online pharmacy",
      "online",
      "pharmacy",
      "online software",
      "online app",
      "online platform",
      "online system",
      "online management",
      "healthcare online"
  ],

  synonyms: [
      "Online Pharmacy platform",
      "Online Pharmacy software",
      "Online Pharmacy system",
      "online solution",
      "online service"
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
      "Build a online pharmacy platform",
      "Create a online pharmacy app",
      "I need a online pharmacy management system",
      "Build a online pharmacy solution",
      "Create a online pharmacy booking system"
  ],
};
