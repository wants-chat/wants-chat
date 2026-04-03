/**
 * Vocational Training App Type Definition
 *
 * Complete definition for vocational training applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VOCATIONAL_TRAINING_APP_TYPE: AppTypeDefinition = {
  id: 'vocational-training',
  name: 'Vocational Training',
  category: 'education',
  description: 'Vocational Training platform with comprehensive management features',
  icon: 'certificate',

  keywords: [
      "vocational training",
      "vocational",
      "training",
      "vocational software",
      "vocational app",
      "vocational platform",
      "vocational system",
      "vocational management",
      "education vocational"
  ],

  synonyms: [
      "Vocational Training platform",
      "Vocational Training software",
      "Vocational Training system",
      "vocational solution",
      "vocational service"
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
          "name": "Administrator",
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
          "name": "Instructor",
          "level": 40,
          "isDefault": false,
          "accessibleSections": [
              "admin"
          ],
          "defaultRoute": "/admin/dashboard"
      },
      {
          "id": "user",
          "name": "Student",
          "level": 10,
          "isDefault": true,
          "accessibleSections": [
              "frontend"
          ],
          "defaultRoute": "/"
      }
  ],

  defaultFeatures: [
      "user-auth",
      "course-management",
      "enrollment",
      "calendar",
      "certificates",
      "notifications"
  ],

  optionalFeatures: [
      "lms",
      "assignments",
      "payments",
      "attendance",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'education',

  defaultColorScheme: 'orange',
  defaultDesignVariant: 'professional',

  examplePrompts: [
      "Build a vocational training platform",
      "Create a vocational training app",
      "I need a vocational training management system",
      "Build a vocational training solution",
      "Create a vocational training booking system"
  ],
};
