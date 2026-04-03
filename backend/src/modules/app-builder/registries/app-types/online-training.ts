/**
 * Online Training App Type Definition
 *
 * Complete definition for online training applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const ONLINE_TRAINING_APP_TYPE: AppTypeDefinition = {
  id: 'online-training',
  name: 'Online Training',
  category: 'education',
  description: 'Online Training platform with comprehensive management features',
  icon: 'certificate',

  keywords: [
      "online training",
      "online",
      "training",
      "online software",
      "online app",
      "online platform",
      "online system",
      "online management",
      "education online"
  ],

  synonyms: [
      "Online Training platform",
      "Online Training software",
      "Online Training system",
      "online solution",
      "online service"
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
      "Build a online training platform",
      "Create a online training app",
      "I need a online training management system",
      "Build a online training solution",
      "Create a online training booking system"
  ],
};
