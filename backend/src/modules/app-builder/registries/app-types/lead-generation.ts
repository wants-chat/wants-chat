/**
 * Lead Generation App Type Definition
 *
 * Complete definition for lead generation applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const LEAD_GENERATION_APP_TYPE: AppTypeDefinition = {
  id: 'lead-generation',
  name: 'Lead Generation',
  category: 'services',
  description: 'Lead Generation platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "lead generation",
      "lead",
      "generation",
      "lead software",
      "lead app",
      "lead platform",
      "lead system",
      "lead management",
      "services lead"
  ],

  synonyms: [
      "Lead Generation platform",
      "Lead Generation software",
      "Lead Generation system",
      "lead solution",
      "lead service"
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
      "calendar",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "payments",
      "reviews",
      "messaging",
      "documents",
      "reporting"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'medium',
  industry: 'services',

  defaultColorScheme: 'blue',
  defaultDesignVariant: 'modern',

  examplePrompts: [
      "Build a lead generation platform",
      "Create a lead generation app",
      "I need a lead generation management system",
      "Build a lead generation solution",
      "Create a lead generation booking system"
  ],
};
