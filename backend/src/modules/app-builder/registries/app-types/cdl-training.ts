/**
 * Cdl Training App Type Definition
 *
 * Complete definition for cdl training applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const CDL_TRAINING_APP_TYPE: AppTypeDefinition = {
  id: 'cdl-training',
  name: 'Cdl Training',
  category: 'education',
  description: 'Cdl Training platform with comprehensive management features',
  icon: 'certificate',

  keywords: [
      "cdl training",
      "cdl",
      "training",
      "cdl software",
      "cdl app",
      "cdl platform",
      "cdl system",
      "cdl management",
      "education cdl"
  ],

  synonyms: [
      "Cdl Training platform",
      "Cdl Training software",
      "Cdl Training system",
      "cdl solution",
      "cdl service"
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
      "Build a cdl training platform",
      "Create a cdl training app",
      "I need a cdl training management system",
      "Build a cdl training solution",
      "Create a cdl training booking system"
  ],
};
