/**
 * Training Center App Type Definition
 *
 * Complete definition for training center applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRAINING_CENTER_APP_TYPE: AppTypeDefinition = {
  id: 'training-center',
  name: 'Training Center',
  category: 'education',
  description: 'Training Center platform with comprehensive management features',
  icon: 'certificate',

  keywords: [
      "training center",
      "training",
      "center",
      "training software",
      "training app",
      "training platform",
      "training system",
      "training management",
      "education training"
  ],

  synonyms: [
      "Training Center platform",
      "Training Center software",
      "Training Center system",
      "training solution",
      "training service"
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
      "Build a training center platform",
      "Create a training center app",
      "I need a training center management system",
      "Build a training center solution",
      "Create a training center booking system"
  ],
};
