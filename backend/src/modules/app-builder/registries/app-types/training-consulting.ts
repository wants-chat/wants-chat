/**
 * Training Consulting App Type Definition
 *
 * Complete definition for training consulting applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const TRAINING_CONSULTING_APP_TYPE: AppTypeDefinition = {
  id: 'training-consulting',
  name: 'Training Consulting',
  category: 'professional-services',
  description: 'Training Consulting platform with comprehensive management features',
  icon: 'chart',

  keywords: [
      "training consulting",
      "training",
      "consulting",
      "training software",
      "training app",
      "training platform",
      "training system",
      "training management",
      "consulting training"
  ],

  synonyms: [
      "Training Consulting platform",
      "Training Consulting software",
      "Training Consulting system",
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
          "name": "Staff",
          "level": 40,
          "isDefault": false,
          "accessibleSections": [
              "admin"
          ],
          "defaultRoute": "/admin/dashboard"
      },
      {
          "id": "user",
          "name": "User",
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
      "appointments",
      "clients",
      "projects",
      "calendar",
      "notifications"
  ],

  optionalFeatures: [
      "invoicing",
      "contracts",
      "documents",
      "time-tracking",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'consulting',

  defaultColorScheme: 'indigo',
  defaultDesignVariant: 'professional',

  examplePrompts: [
      "Build a training consulting platform",
      "Create a training consulting app",
      "I need a training consulting management system",
      "Build a training consulting solution",
      "Create a training consulting booking system"
  ],
};
