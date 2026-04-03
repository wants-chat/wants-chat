/**
 * Workplace Training App Type Definition
 *
 * Complete definition for workplace training applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WORKPLACE_TRAINING_APP_TYPE: AppTypeDefinition = {
  id: 'workplace-training',
  name: 'Workplace Training',
  category: 'education',
  description: 'Workplace Training platform with comprehensive management features',
  icon: 'certificate',

  keywords: [
      "workplace training",
      "workplace",
      "training",
      "workplace software",
      "workplace app",
      "workplace platform",
      "workplace system",
      "workplace management",
      "education workplace"
  ],

  synonyms: [
      "Workplace Training platform",
      "Workplace Training software",
      "Workplace Training system",
      "workplace solution",
      "workplace service"
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
      "Build a workplace training platform",
      "Create a workplace training app",
      "I need a workplace training management system",
      "Build a workplace training solution",
      "Create a workplace training booking system"
  ],
};
