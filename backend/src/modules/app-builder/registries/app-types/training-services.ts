/**
 * Training Services App Type Definition
 *
 * Complete definition for training services applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRAINING_SERVICES_APP_TYPE: AppTypeDefinition = {
  id: 'training-services',
  name: 'Training Services',
  category: 'education',
  description: 'Training Services platform with comprehensive management features',
  icon: 'certificate',

  keywords: [
      "training services",
      "training",
      "services",
      "training software",
      "training app",
      "training platform",
      "training system",
      "training management",
      "education training"
  ],

  synonyms: [
      "Training Services platform",
      "Training Services software",
      "Training Services system",
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
      "Build a training services platform",
      "Create a training services app",
      "I need a training services management system",
      "Build a training services solution",
      "Create a training services booking system"
  ],
};
