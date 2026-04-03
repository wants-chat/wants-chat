/**
 * Puppy Training App Type Definition
 *
 * Complete definition for puppy training applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const PUPPY_TRAINING_APP_TYPE: AppTypeDefinition = {
  id: 'puppy-training',
  name: 'Puppy Training',
  category: 'education',
  description: 'Puppy Training platform with comprehensive management features',
  icon: 'certificate',

  keywords: [
      "puppy training",
      "puppy",
      "training",
      "puppy software",
      "puppy app",
      "puppy platform",
      "puppy system",
      "puppy management",
      "education puppy"
  ],

  synonyms: [
      "Puppy Training platform",
      "Puppy Training software",
      "Puppy Training system",
      "puppy solution",
      "puppy service"
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
      "Build a puppy training platform",
      "Create a puppy training app",
      "I need a puppy training management system",
      "Build a puppy training solution",
      "Create a puppy training booking system"
  ],
};
