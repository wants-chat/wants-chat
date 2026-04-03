/**
 * Mobile Dental App Type Definition
 *
 * Complete definition for mobile dental applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MOBILE_DENTAL_APP_TYPE: AppTypeDefinition = {
  id: 'mobile-dental',
  name: 'Mobile Dental',
  category: 'healthcare',
  description: 'Mobile Dental platform with comprehensive management features',
  icon: 'tooth',

  keywords: [
      "mobile dental",
      "mobile",
      "dental",
      "mobile software",
      "mobile app",
      "mobile platform",
      "mobile system",
      "mobile management",
      "healthcare mobile"
  ],

  synonyms: [
      "Mobile Dental platform",
      "Mobile Dental software",
      "Mobile Dental system",
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
      "treatment-plans",
      "calendar",
      "notifications"
  ],

  optionalFeatures: [
      "insurance-billing",
      "payments",
      "reminders",
      "gallery",
      "reviews"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'healthcare',

  defaultColorScheme: 'cyan',
  defaultDesignVariant: 'clean',

  examplePrompts: [
      "Build a mobile dental platform",
      "Create a mobile dental app",
      "I need a mobile dental management system",
      "Build a mobile dental solution",
      "Create a mobile dental booking system"
  ],
};
