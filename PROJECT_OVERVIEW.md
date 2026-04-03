# Widest Life - Project Overview & Tracking

**Last Updated**: December 2025
**Version**: 1.0
**Team**: InfoInlet Development Team

---

## Quick Navigation

- [Project Summary](#project-summary)
- [Tech Stack](#tech-stack)
- [Backend Modules](#backend-modules-nestjs---24-modules)
- [Frontend Pages](#frontend-pages-react--vite---38-pages)
- [Mobile Screens](#mobile-screens-flutter---23-categories)
- [Database Tables](#database-tables-90-tables)
- [API Endpoints](#api-endpoints-summary)
- [Feature Status](#feature-status-tracking)
- [Development Notes](#development-notes)

---

## Project Summary

**Widest Life** (aka **Life OS**) হলো একটা comprehensive personal life management platform। এটা users দের help করে তাদের জীবনের multiple aspects track এবং manage করতে:

| Category | Features |
|----------|----------|
| Health | Medical records, prescriptions, vitals, pregnancy care, insurance |
| Fitness | Workouts, body measurements, achievements, exercise library |
| Nutrition | Calorie tracking, meal logging, fasting, water intake |
| Finance | Expenses, budgets, currency conversion, billing |
| Meditation | Sessions, programs, audio library, mental health logs |
| Travel | AI-powered trip planning, itineraries, budget breakdown |
| Language | Courses, lessons, vocabulary, exercises, leaderboards |
| Blog | Posts, comments, likes, ratings |
| Habits | Daily tracking, streaks, reminders |
| Todo | Lists, categories, priorities, attachments |

---

## Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| NestJS 9+ | Framework |
| TypeScript | Language |
| Fluxez SDK | Database & Auth (like Firebase/Supabase) |
| Socket.io | WebSocket/Real-time |
| JWT | Authentication tokens |
| Stripe | Payment processing |
| Claude API | AI features |
| Multer | File uploads |

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18+ | Framework |
| Vite | Build tool |
| TypeScript | Language |
| Tailwind CSS | Styling |
| Shadcn/ui | UI Components |
| React Query | Data fetching |
| Axios | HTTP client (via `/lib/api`) |
| React Router | Routing |
| Sonner | Toast notifications |

### Mobile
| Technology | Purpose |
|------------|---------|
| Flutter 3+ | Framework |
| Dart | Language |
| Provider/Riverpod | State management |
| ServiceLocator | Dependency injection |
| SharedPreferences | Local storage |
| Socket.io | Real-time |

### DevOps
| Technology | Purpose |
|------------|---------|
| GitHub Actions | CI/CD |
| Hetzner VPS | Server (CAX31, IP: 46.62.146.236) |
| PM2 | Process manager |
| HTTPS | SSL/TLS |

---

## Backend Modules (NestJS - 24 Modules)

### Core Modules

| Module | Location | Responsibility |
|--------|----------|----------------|
| **Auth** | `src/modules/auth/` | Login, register, JWT, OAuth, password reset |
| **Users** | `src/modules/users/` | User profiles, preferences |
| **Dashboard** | `src/modules/dashboard/` | Aggregated user data |
| **Fluxez** | `src/modules/fluxez/` | SDK wrapper for DB & storage |
| **Notifications** | `src/modules/notifications/` | Real-time alerts, reminders |
| **Settings** | `src/modules/settings/` | User preferences |

### Feature Modules

| Module | Location | Key Features |
|--------|----------|--------------|
| **Health** | `src/modules/health/` | Profiles, metrics, prescriptions, vitals, insurance, pregnancy |
| **Fitness** | `src/modules/fitness/` | Workouts, plans, body measurements, achievements |
| **Calories** | `src/modules/calories/` | Food logging, macros, fasting, water intake |
| **Meditation** | `src/modules/meditation/` | Sessions, programs, audio, mental health |
| **Travel** | `src/modules/travel/` | AI trip planning, itineraries |
| **Language** | `src/modules/language/` | Courses, lessons, vocabulary, exercises |
| **Blog** | `src/modules/blog/` | Posts, comments, likes, ratings |
| **Habits** | `src/modules/habits/` | Tracking, streaks, reminders |
| **Todo** | `src/modules/todo/` | Lists, categories, attachments |
| **Finance** | `src/modules/finance/` | Accounts, transactions, analytics |
| **Expenses** | `src/modules/expenses/` | Expense tracking, categories |
| **Currency** | `src/modules/currency/` | Conversion, rates, alerts |
| **Billing** | `src/modules/billing/` | Stripe, subscriptions |
| **Recipes** | `src/modules/recipes/` | Recipe DB, meal plans |
| **AI** | `src/modules/ai/` | Claude integration |

### Admin Modules

| Module | Location | Purpose |
|--------|----------|---------|
| **Admin Meditation** | `src/modules/admin-meditation/` | Manage meditation content |
| **Admin Fitness** | `src/modules/admin-fitness/` | Manage workout plans |
| **Admin Finance** | `src/modules/admin-finance/` | Financial oversight |

### WebSocket

| File | Purpose |
|------|---------|
| `src/common/gateways/app.gateway.ts` | Main WebSocket gateway |
| Token auth via `decode()` | Fluxez tokens validated |
| User rooms: `user:${userId}` | Targeted messaging |

---

## Frontend Pages (React + Vite - 38+ Pages)

### Public Pages (No Auth Required)

| Page | Route | Purpose |
|------|-------|---------|
| Landing | `/` | Homepage |
| Features | `/features` | Feature showcase |
| How It Works | `/how-it-works` | User guide |
| Pricing | `/pricing` | Plans |
| About | `/about` | Company info |
| Contact | `/contact` | Contact form |
| Login | `/login` | User login |
| Signup | `/signup` | Registration |

### Dashboard & Profile

| Page | Route | Purpose |
|------|-------|---------|
| Dashboard | `/dashboard` | Main dashboard |
| Profile | `/profile` | User profile |
| Onboarding | `/onboarding` | New user setup |

### Health Module (`/health/*`)

| Page | Route | Purpose |
|------|-------|---------|
| Health Overview | `/health` | Health dashboard |
| Medical Records | `/health/records` | All medical records |
| Personal Info | `/health/personal-info` | Basic medical info |
| Prescriptions | `/health/prescriptions` | Medication management |
| Add Prescription | `/health/prescriptions/add` | New prescription |
| Doctor Visit | `/health/doctor-visit` | Schedule appointment |
| Insurance | `/health/insurance` | Insurance info |
| Test Results | `/health/results` | Upload results |
| Vital Records | `/health/vitals` | Track vitals |
| Mother Care | `/health/mother-care` | Maternal health |
| Pregnancy | `/health/pregnancy` | Pregnancy tracking |
| Baby Care | `/health/baby-care` | Baby health |
| Emergency Contacts | `/health/emergency` | Emergency info |
| Medical Facilities | `/health/facilities` | Facility info |
| Treatments | `/health/treatments` | Treatment tracking |
| Medications | `/health/medications` | Medication list |
| Reminders | `/health/reminders` | Medication reminders |

### Fitness Module (`/fitness/*`)

| Page | Route | Purpose |
|------|-------|---------|
| Fitness Landing | `/fitness` | Module home |
| Onboarding | `/fitness/onboarding` | Setup flow |
| Dashboard | `/fitness/dashboard` | Main fitness view |
| Workout Plans | `/fitness/plans` | Browse plans |
| Custom Plan | `/fitness/plans/custom` | Create custom plan |
| Progress | `/fitness/progress` | Analytics |
| Profile | `/fitness/profile` | Fitness profile |
| Workout Session | `/fitness/session` | Active workout |

### Meditation Module (`/meditation/*`)

| Page | Route | Purpose |
|------|-------|---------|
| Meditation Home | `/meditation` | Module home |
| Series | `/meditation/series` | Browse series |
| Series Detail | `/meditation/series/:id` | Series details |
| Session | `/meditation/session` | Active session |
| Profile | `/meditation/profile` | User profile |
| History | `/meditation/history` | Session history |

### Calories Module (`/calories/*`)

| Page | Route | Purpose |
|------|-------|---------|
| Landing | `/calories` | Module home |
| Onboarding | `/calories/onboarding` | Setup |
| Diet Plan | `/calories/diet-plan` | Select plan |
| Macros | `/calories/macros` | Customize macros |
| Dashboard | `/calories/dashboard` | Main view |
| Diary | `/calories/diary` | Daily log |
| Fasting | `/calories/fasting` | Fasting tracker |
| Progress | `/calories/progress` | Analytics |
| Food Search | `/calories/search` | Search foods |
| Log Food | `/calories/log` | Log meals |

### Travel Module (`/travel/*`)

| Page | Route | Purpose |
|------|-------|---------|
| Travel Plans | `/travel` | Browse plans |
| Stats | `/travel/stats` | Statistics |
| Generator | `/travel/generate` | AI generator |
| Favorites | `/travel/favorites` | Saved plans |
| Public Plans | `/travel/public` | Public plans |

### Blog Module (`/blog/*`)

| Page | Route | Purpose |
|------|-------|---------|
| Blog Home | `/blog` | All posts |
| Post Detail | `/blog/:id` | Read post |
| My Blogs | `/blog/my-blogs` | User's posts |

### Other Modules

| Page | Route | Purpose |
|------|-------|---------|
| Billing | `/billing` | Subscription management |
| Expense Tracker | `/expenses` | Expense tracking |
| Currency Converter | `/currency` | Currency tool |
| Meal Planner | `/meal-planner` | Meal planning |
| Todo | `/todo` | Task management |

---

## Mobile Screens (Flutter - 23+ Categories)

### Core Screens

| Screen | File | Purpose |
|--------|------|---------|
| Splash | `splash_screen.dart` | App init |
| Home | `home_page.dart` | Main dashboard |
| Login | `login_screen.dart` | User login |
| Signup | `signup_screen.dart` | Registration |
| Profile | `profile_edit_screen.dart` | Profile management |

### Feature Screens by Category

| Category | Screen Count | Key Screens |
|----------|--------------|-------------|
| **Meditation** | 9 | Series, history, audio player, guide, profile |
| **Recipes** | 18 | Dashboard, list, detail, cooking steps, favorites, categories |
| **Meal Planning** | 6 | Plans, create, select meals, shopping list |
| **Habits** | 2 | Tracker, streaks & stats |
| **Finance** | 10 | Budget, expenses, analytics |
| **Language** | 24 | Lessons, vocabulary, stories, leaderboards |
| **Travel** | 5+ | Planning, AI generator |
| **Health** | 9 | Profile, records, vitals |
| **Blog** | 8 | Browse, create, comments |
| **Fitness** | 5+ | Workouts, tracking |
| **Nutrition** | 14 | Analysis, diet recommendations |
| **Currency** | 6 | Conversion, rates |
| **Life OS** | 20 | Main interface, navigation |
| **Todo** | 8 | Lists, categories |
| **Onboarding** | 3+ | App setup flow |

### DAOs (Data Access Objects)

| DAO | File | API Integration |
|-----|------|-----------------|
| Auth | `auth_dao.dart` | Login, register, tokens |
| Blog | `blog_dao.dart` | Posts, comments |
| Recipe | `recipe_dao.dart` | Recipes CRUD |
| Meal Plan | `meal_plan_dao.dart` | Meal planning |
| Shopping List | `shopping_list_dao.dart` | Shopping lists |
| Meditation | `meditation_dao.dart` | Sessions, programs |
| Fitness | `fitness_dao.dart` | Workouts |
| Health | `health_dao.dart` | Medical records (37KB) |
| Language | `language_dao.dart` | Learning (37KB) |
| Habit | `habit_dao.dart` | Habit tracking |
| Travel | `travel_dao.dart` | Trip planning |
| Nutrition | `nutrition_dao.dart` | Calorie tracking (33KB) |
| Todo | `todo_dao.dart` | Task management |
| Expense | `expense_dao.dart` | Expenses |
| Currency | `currency_dao.dart` | Conversion |
| Notification | `notification_dao.dart` | Alerts |
| Billing | `billing_dao.dart` | Subscriptions |

---

## Database Tables (90+ Tables)

### User & Settings (2 tables)

| Table | Purpose |
|-------|---------|
| `user_settings` | Preferences, theme, language, notifications |
| `user_activity` | Activity tracking |

### Health & Medical (15+ tables)

| Table | Purpose |
|-------|---------|
| `health_profiles` | Basic health info |
| `health_metrics` | BP, heart rate, weight, etc. |
| `prescriptions` | Medications |
| `test_results` | Lab results |
| `health_insurance` | Insurance info |
| `pregnancy_records` | Pregnancy tracking |
| `paternal_checkup_appointments` | Checkup scheduling |
| `serious_conditions` | Serious health conditions |
| `emergency_contacts` | Emergency info |
| `medical_facilities` | Facility info |
| `treatments` | Treatment records |

### Fitness (6+ tables)

| Table | Purpose |
|-------|---------|
| `fitness_profiles` | User fitness info |
| `fitness_activities` | Activity tracking |
| `workout_plans` | User plans |
| `admin_workout_plans` | System plans |
| `workout_history` | Past workouts |
| `workout_sessions` | Active sessions |
| `exercises` | Exercise library |
| `fitness_achievements` | Achievements |
| `fitness_milestones` | Milestones |
| `fitness_body_measurements` | Body measurements |

### Nutrition & Calories (10 tables)

| Table | Purpose |
|-------|---------|
| `calories_user_profiles` | User nutrition profile |
| `calories_nutrition_goals` | Daily goals |
| `calories_foods` | Food database |
| `calories_food_logs` | Daily food log |
| `calories_weight_logs` | Weight tracking |
| `calories_water_intake_logs` | Water intake |
| `calories_exercise_logs` | Exercise logging |
| `calories_favorite_foods` | Favorites |
| `calories_fasting_sessions` | Fasting tracking |
| `calories_fasting_reminders` | Fasting reminders |
| `calories_progress_photos` | Progress photos |
| `calories_weight_milestones` | Weight milestones |

### Financial (5+ tables)

| Table | Purpose |
|-------|---------|
| `financial_accounts` | Bank accounts |
| `expenses` | Expense records |
| `expense_v2` | Updated expenses |
| `finance_categories` | Categories |
| `budgets` | Budget plans |
| `budget_v2` | Updated budgets |

### Currency (4 tables)

| Table | Purpose |
|-------|---------|
| `currency_rates` | Exchange rates |
| `currency_alerts` | Rate alerts |
| `currency_conversions` | Conversion history |
| `currency_favorites` | Favorite pairs |

### Meditation (8 tables)

| Table | Purpose |
|-------|---------|
| `meditation_sessions` | Session records |
| `meditation_categories` | Categories |
| `meditation_audio_library` | Audio files |
| `meditation_programs` | Programs |
| `meditation_program_sessions` | Program sessions |
| `meditation_program_enrollments` | User enrollments |
| `meditation_program_session_completions` | Completions |
| `ambient_sounds` | Background sounds |
| `user_meditation_stats` | User stats |
| `mental_health_logs` | Mental health |

### Travel (3 tables)

| Table | Purpose |
|-------|---------|
| `travel_plans` | Trip plans |
| `travel_plan_favourites` | Favorites |
| `ai_generations` | AI generations |

### Blog (5 tables)

| Table | Purpose |
|-------|---------|
| `blog_posts` | Posts |
| `blog_categories` | Categories |
| `blog_comments` | Comments |
| `blog_likes` | Likes |
| `blog_ratings` | Ratings |
| `blog_comment_likes` | Comment likes |

### Todos (4 tables)

| Table | Purpose |
|-------|---------|
| `todo_lists` | Lists |
| `todos` | Tasks |
| `todo_attachments` | Attachments |
| `todo_categories` | Categories |

### Habits (4 tables)

| Table | Purpose |
|-------|---------|
| `habits` | Habit definitions |
| `habit_completions` | Daily completions |
| `habit_reminders` | Reminders |
| `habit_streaks` | Streak tracking |

### Language Learning (12+ tables)

| Table | Purpose |
|-------|---------|
| `language_profiles` | User profiles |
| `language_courses` | Courses |
| `language_progress` | Progress tracking |
| `language_vocabulary` | Vocabulary |
| `language_achievements` | Achievements |
| `language_lessons` | Lessons |
| `language_lessons_v2` | Updated lessons |
| `language_exercises` | Exercises |
| `language_stories` | Stories |
| `language_study_sessions` | Study sessions |
| `language_leaderboard` | Leaderboards |
| `language_units` | Course units |
| `language_unit_exercises` | Unit exercises |
| `user_lesson_progress` | Lesson progress |
| `user_unit_progress` | Unit progress |
| `user_exercise_progress` | Exercise progress |
| `phonemes` | Pronunciation |

### Recipes & Meals (5 tables)

| Table | Purpose |
|-------|---------|
| `recipes` | Recipe database |
| `recipe_favorites` | User favorites |
| `recipe_ratings` | Ratings |
| `meal_plans` | Meal plans |
| `meal_plan_items` | Plan items |
| `recipe_meal_plans` | Recipe-meal links |
| `recipe_shopping_lists` | Shopping lists |

### Notifications (2 tables)

| Table | Purpose |
|-------|---------|
| `notifications` | User notifications |
| `reminders` | Scheduled reminders |

---

## API Endpoints Summary

### Total: 500+ Endpoints

| Module | Endpoint Count | Base Path |
|--------|---------------|-----------|
| Auth | 15+ | `/auth` |
| Health | 50+ | `/health` |
| Fitness | 40+ | `/fitness` |
| Calories | 40+ | `/calories` |
| Meditation | 25+ | `/meditation` |
| Travel | 20+ | `/travel` |
| Language | 40+ | `/language` |
| Blog | 15+ | `/blog` |
| Finance | 30+ | `/finance` |
| Expenses | 15+ | `/expenses` |
| Currency | 10+ | `/currency` |
| Habits | 15+ | `/habits` |
| Todo | 15+ | `/todo` |
| Recipes | 20+ | `/recipes` |
| Notifications | 15+ | `/notifications` |
| Users | 10+ | `/users` |
| Dashboard | 5+ | `/dashboard` |
| Billing | 10+ | `/billing` |
| AI | 10+ | `/ai` |

---

## Feature Status Tracking

### Legend
- ✅ Complete
- 🔄 In Progress
- ⏸️ Paused
- ❌ Not Started
- 🐛 Has Bugs

### Backend Status

| Module | API | WebSocket | Tests | Status |
|--------|-----|-----------|-------|--------|
| Auth | ✅ | ✅ | ⏸️ | ✅ |
| Health | ✅ | ⏸️ | ⏸️ | ✅ |
| Fitness | ✅ | ⏸️ | ⏸️ | ✅ |
| Calories | ✅ | ⏸️ | ⏸️ | ✅ |
| Meditation | ✅ | ⏸️ | ⏸️ | ✅ |
| Travel | ✅ | ⏸️ | ⏸️ | ✅ |
| Language | ✅ | ⏸️ | ⏸️ | ✅ |
| Blog | ✅ | ⏸️ | ⏸️ | ✅ |
| Finance | ✅ | ⏸️ | ⏸️ | ✅ |
| Currency | ✅ | ⏸️ | ⏸️ | ✅ |
| Habits | ✅ | ⏸️ | ⏸️ | ✅ |
| Todo | ✅ | ⏸️ | ⏸️ | ✅ |
| Recipes | ✅ | ⏸️ | ⏸️ | ✅ |
| Notifications | ✅ | ✅ | ⏸️ | ✅ |

### Frontend Status

| Module | Pages | API Integration | UI Polish | Status |
|--------|-------|-----------------|-----------|--------|
| Auth | ✅ | ✅ | ✅ | ✅ |
| Dashboard | ✅ | ✅ | 🔄 | 🔄 |
| Health | ✅ | ✅ | 🔄 | 🔄 |
| Fitness | ✅ | ✅ | 🔄 | 🔄 |
| Calories | ✅ | ✅ | 🔄 | 🔄 |
| Meditation | ✅ | ✅ | 🔄 | 🔄 |
| Travel | ✅ | ✅ | 🔄 | 🔄 |
| Language | ✅ | ✅ | 🔄 | 🔄 |
| Blog | ✅ | ✅ | 🔄 | 🔄 |
| Finance | 🔄 | 🔄 | 🔄 | 🔄 |
| Currency | ✅ | ✅ | ✅ | ✅ |
| Habits | 🔄 | 🔄 | 🔄 | 🔄 |
| Todo | ✅ | ✅ | 🔄 | 🔄 |

### Mobile Status

| Module | Screens | DAO | UI | Status |
|--------|---------|-----|-----|--------|
| Auth | ✅ | ✅ | ✅ | ✅ |
| Home | ✅ | ✅ | 🔄 | 🔄 |
| Meditation | ✅ | ✅ | 🔄 | 🔄 |
| Recipes | ✅ | ✅ | 🔄 | 🔄 |
| Meal Plan | ✅ | ✅ | 🔄 | 🔄 |
| Habits | ✅ | ✅ | 🔄 | 🔄 |
| Finance | ✅ | ✅ | 🔄 | 🔄 |
| Language | ✅ | ✅ | 🔄 | 🔄 |
| Health | ✅ | ✅ | 🔄 | 🔄 |
| Blog | ✅ | ✅ | 🔄 | 🔄 |
| Fitness | ✅ | ✅ | 🔄 | 🔄 |
| Nutrition | ✅ | ✅ | 🔄 | 🔄 |
| Currency | ✅ | ✅ | 🔄 | 🔄 |
| Todo | ✅ | ✅ | 🔄 | 🔄 |

---

## Development Notes

### Important Patterns

1. **User ID Extraction** (Backend):
   ```typescript
   const userId = req.user.sub || req.user.userId;
   ```

2. **API Client** (Frontend):
   ```typescript
   import { api } from '@/lib/api';
   const { data } = await api.get('/endpoint');
   ```

3. **ServiceLocator** (Flutter):
   ```dart
   final dao = ServiceLocator.instance.recipeDao;
   ```

### Key Files to Know

| File | Purpose |
|------|---------|
| `backend/src/database/schema.ts` | All database table definitions |
| `backend/src/modules/fluxez/fluxez.service.ts` | Fluxez SDK wrapper |
| `frontend/src/lib/api.ts` | Centralized API client |
| `frontend/src/contexts/AuthContext.tsx` | Auth state management |
| `mobile/lib/services/service_locator.dart` | Dependency injection |

### Environment Variables

**Backend** (`.env`):
```
FLUXEZ_API_URL=
FLUXEZ_API_KEY=
FLUXEZ_ANON_KEY=
JWT_SECRET=
STRIPE_SECRET_KEY=
```

**Frontend** (`.env`):
```
VITE_API_URL=https://api.example.com/api/v1
```

### Build Commands

```bash
# Backend
cd backend && npm run build

# Frontend
cd frontend && npm run build

# Mobile
cd mobile && flutter analyze && flutter build apk
```

### Deployment

- **Server**: Hetzner CAX31 (46.62.146.236)
- **Path**: `/opt/widest-life/`
- **PM2 Processes**: `widest-life-backend`, `widest-life-frontend`
- **CI/CD**: GitHub Actions on push to `main`

---

## Known Issues & TODOs

### Backend
- [ ] Large schema.ts file (2700+ lines) - consider splitting
- [ ] Multiple v1/v2 entities need cleanup
- [ ] Add comprehensive tests

### Frontend
- [ ] Large service files (healthService 71KB) - consider splitting
- [ ] Complete UI polish for all modules
- [ ] Add loading states everywhere

### Mobile
- [ ] auth_dao_new.dart needs finalization
- [ ] Complete all screen implementations
- [ ] Add offline support

---

## Quick Reference Commands

```bash
# Start development
cd backend && npm run start:dev
cd frontend && npm run dev
cd mobile && flutter run

# Check for issues
cd backend && npm run lint
cd frontend && npm run lint
cd mobile && flutter analyze

# Run tests
cd backend && npm run test
cd frontend && npm run test
cd mobile && flutter test
```

---

**Note**: এই file টা regularly update করুন যখন নতুন features add করবেন বা changes হবে।
