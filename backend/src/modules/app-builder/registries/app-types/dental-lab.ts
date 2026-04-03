/**
 * Dental Lab App Type Definition
 *
 * Complete definition for dental lab applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const DENTAL_LAB_APP_TYPE: AppTypeDefinition = {
  id: 'dental-lab',
  name: 'Dental Lab',
  category: 'healthcare',
  description: 'Dental Lab platform with comprehensive management features',
  icon: 'tooth',

  keywords: [
      "dental lab",
      "dental",
      "lab",
      "dental software",
      "dental app",
      "dental platform",
      "dental system",
      "dental management",
      "healthcare dental"
  ],

  synonyms: [
      "Dental Lab platform",
      "Dental Lab software",
      "Dental Lab system",
      "dental solution",
      "dental service"
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
      "Build a dental lab platform",
      "Create a dental lab app",
      "I need a dental lab management system",
      "Build a dental lab solution",
      "Create a dental lab booking system"
  ],
};
