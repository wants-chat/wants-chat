/**
 * Software Training App Type Definition
 *
 * Complete definition for software training applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SOFTWARE_TRAINING_APP_TYPE: AppTypeDefinition = {
  id: 'software-training',
  name: 'Software Training',
  category: 'education',
  description: 'Software Training platform with comprehensive management features',
  icon: 'certificate',

  keywords: [
      "software training",
      "software",
      "training",
      "software software",
      "software app",
      "software platform",
      "software system",
      "software management",
      "education software"
  ],

  synonyms: [
      "Software Training platform",
      "Software Training software",
      "Software Training system",
      "software solution",
      "software service"
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
      "Build a software training platform",
      "Create a software training app",
      "I need a software training management system",
      "Build a software training solution",
      "Create a software training booking system"
  ],
};
