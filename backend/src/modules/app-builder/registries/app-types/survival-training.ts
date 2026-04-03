/**
 * Survival Training App Type Definition
 *
 * Complete definition for survival training applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SURVIVAL_TRAINING_APP_TYPE: AppTypeDefinition = {
  id: 'survival-training',
  name: 'Survival Training',
  category: 'education',
  description: 'Survival Training platform with comprehensive management features',
  icon: 'certificate',

  keywords: [
      "survival training",
      "survival",
      "training",
      "survival software",
      "survival app",
      "survival platform",
      "survival system",
      "survival management",
      "education survival"
  ],

  synonyms: [
      "Survival Training platform",
      "Survival Training software",
      "Survival Training system",
      "survival solution",
      "survival service"
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
      "Build a survival training platform",
      "Create a survival training app",
      "I need a survival training management system",
      "Build a survival training solution",
      "Create a survival training booking system"
  ],
};
