/**
 * Workforce Training App Type Definition
 *
 * Complete definition for workforce training applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const WORKFORCE_TRAINING_APP_TYPE: AppTypeDefinition = {
  id: 'workforce-training',
  name: 'Workforce Training',
  category: 'education',
  description: 'Workforce Training platform with comprehensive management features',
  icon: 'certificate',

  keywords: [
      "workforce training",
      "workforce",
      "training",
      "workforce software",
      "workforce app",
      "workforce platform",
      "workforce system",
      "workforce management",
      "education workforce"
  ],

  synonyms: [
      "Workforce Training platform",
      "Workforce Training software",
      "Workforce Training system",
      "workforce solution",
      "workforce service"
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
      "Build a workforce training platform",
      "Create a workforce training app",
      "I need a workforce training management system",
      "Build a workforce training solution",
      "Create a workforce training booking system"
  ],
};
