/**
 * Movie Theater App Type Definition
 *
 * Complete definition for movie theater applications.
 */

import { AppTypeDefinition } from '../../interfaces/app-type.interface';

export const MOVIE_THEATER_APP_TYPE: AppTypeDefinition = {
  id: 'movie-theater',
  name: 'Movie Theater',
  category: 'entertainment',
  description: 'Movie Theater platform with comprehensive management features',
  icon: 'theater',

  keywords: [
      "movie theater",
      "movie",
      "theater",
      "movie software",
      "movie app",
      "movie platform",
      "movie system",
      "movie management",
      "entertainment movie"
  ],

  synonyms: [
      "Movie Theater platform",
      "Movie Theater software",
      "Movie Theater system",
      "movie solution",
      "movie service"
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
      "ticket-sales",
      "show-scheduling",
      "seating-charts",
      "notifications",
      "search"
  ],

  optionalFeatures: [
      "season-passes",
      "payments",
      "reviews",
      "gallery",
      "box-office"
  ],

  incompatibleFeatures: [],

  requiresAuth: true,
  requiresPayment: true,
  multiTenant: true,
  complexity: 'complex',
  industry: 'entertainment',

  defaultColorScheme: 'red',
  defaultDesignVariant: 'dramatic',

  examplePrompts: [
      "Build a movie theater platform",
      "Create a movie theater app",
      "I need a movie theater management system",
      "Build a movie theater solution",
      "Create a movie theater booking system"
  ],
};
