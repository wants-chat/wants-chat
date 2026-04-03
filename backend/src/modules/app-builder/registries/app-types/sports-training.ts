/**
 * Sports Training App Type Definition
 *
 * Complete definition for sports training applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SPORTS_TRAINING_APP_TYPE: AppTypeDefinition = {
  id: 'sports-training',
  name: 'Sports Training',
  category: 'education',
  description: 'Sports Training platform with comprehensive management features',
  icon: 'certificate',

  keywords: [
      "sports training",
      "sports",
      "training",
      "sports software",
      "sports app",
      "sports platform",
      "sports system",
      "sports management",
      "education sports"
  ],

  synonyms: [
      "Sports Training platform",
      "Sports Training software",
      "Sports Training system",
      "sports solution",
      "sports service"
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
      "Build a sports training platform",
      "Create a sports training app",
      "I need a sports training management system",
      "Build a sports training solution",
      "Create a sports training booking system"
  ],
};
