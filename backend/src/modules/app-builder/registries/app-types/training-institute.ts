/**
 * Training Institute App Type Definition
 *
 * Complete definition for training institute applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRAINING_INSTITUTE_APP_TYPE: AppTypeDefinition = {
  id: 'training-institute',
  name: 'Training Institute',
  category: 'education',
  description: 'Training Institute platform with comprehensive management features',
  icon: 'certificate',

  keywords: [
      "training institute",
      "training",
      "institute",
      "training software",
      "training app",
      "training platform",
      "training system",
      "training management",
      "education training"
  ],

  synonyms: [
      "Training Institute platform",
      "Training Institute software",
      "Training Institute system",
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
      "Build a training institute platform",
      "Create a training institute app",
      "I need a training institute management system",
      "Build a training institute solution",
      "Create a training institute booking system"
  ],
};
