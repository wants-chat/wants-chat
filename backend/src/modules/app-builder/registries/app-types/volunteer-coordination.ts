/**
 * Volunteer Coordination App Type Definition
 *
 * Complete definition for volunteer coordination applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const VOLUNTEER_COORDINATION_APP_TYPE: AppTypeDefinition = {
  id: 'volunteer-coordination',
  name: 'Volunteer Coordination',
  category: 'services',
  description: 'Volunteer Coordination platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "volunteer coordination",
      "volunteer",
      "coordination",
      "volunteer software",
      "volunteer app",
      "volunteer platform",
      "volunteer system",
      "volunteer management",
      "services volunteer"
  ],

  synonyms: [
      "Volunteer Coordination platform",
      "Volunteer Coordination software",
      "Volunteer Coordination system",
      "volunteer solution",
      "volunteer service"
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
      "Build a volunteer coordination platform",
      "Create a volunteer coordination app",
      "I need a volunteer coordination management system",
      "Build a volunteer coordination solution",
      "Create a volunteer coordination booking system"
  ],
};
