/**
 * Simulation App Type Definition
 *
 * Complete definition for simulation applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const SIMULATION_APP_TYPE: AppTypeDefinition = {
  id: 'simulation',
  name: 'Simulation',
  category: 'services',
  description: 'Simulation platform with comprehensive management features',
  icon: 'briefcase',

  keywords: [
      "simulation",
      "simulation software",
      "simulation app",
      "simulation platform",
      "simulation system",
      "simulation management",
      "services simulation"
  ],

  synonyms: [
      "Simulation platform",
      "Simulation software",
      "Simulation system",
      "simulation solution",
      "simulation service"
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
      "Build a simulation platform",
      "Create a simulation app",
      "I need a simulation management system",
      "Build a simulation solution",
      "Create a simulation booking system"
  ],
};
