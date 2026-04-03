/**
 * Athletic Training App Type Definition
 *
 * Complete definition for athletic training applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ATHLETIC_TRAINING_APP_TYPE: AppTypeDefinition = {
  id: 'athletic-training',
  name: 'Athletic Training',
  category: 'education',
  description: 'Athletic Training platform with comprehensive management features',
  icon: 'certificate',

  keywords: [
      "athletic training",
      "athletic",
      "training",
      "athletic software",
      "athletic app",
      "athletic platform",
      "athletic system",
      "athletic management",
      "education athletic"
  ],

  synonyms: [
      "Athletic Training platform",
      "Athletic Training software",
      "Athletic Training system",
      "athletic solution",
      "athletic service"
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
      "Build a athletic training platform",
      "Create a athletic training app",
      "I need a athletic training management system",
      "Build a athletic training solution",
      "Create a athletic training booking system"
  ],
};
