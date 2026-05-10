# UnPlanGo - MVP Requirements & Project Status

**Last Updated:** May 10, 2026

---

## 1. Product Overview

**UnPlanGo** is a student-focused social app that helps people living in the same accommodation or campus create or join spontaneous, last-minute plans (gym, study, sports, food, coffee, nights out).

### MVP Goals

- ✅ Reduce friction in making plans
- ✅ Let users see who else is going
- ✅ Enable quick "I'm in" actions
- ✅ Work reliably for a single accommodation/building

**NOT a full social network** — keep it simple.

---

## 2. Target Platform (MVP)

**Platform:** Mobile-first web app (PWA) ✅

- Focus: phones, not desktop
- Alternative: React Native / Flutter (Android first)

---

## 3. Core User Flow

```
User signs up
    ↓
User sees feed of upcoming plans
    ↓
User taps a plan → sees details + who's going
    ↓
User taps "I'm In"
    ↓
Their name + photo appears instantly
    ↓
They go do the activity
```

---

## 4. MVP Features (Must-Have Only)

### 4.1 Authentication ✅ PARTIAL

**Requirements:**

- [ ] Email sign-up & login
- [ ] Optional Google login
- [ ] No phone number required

**Current Status:**

- ✅ Email sign-up & login routes created
- ✅ JWT authentication implemented
- ❌ Google login NOT implemented
- ❌ Sign-up/login failing due to Firestore IAM permissions

**Issue:** Service account lacks `Cloud Datastore User` role in Google Cloud.

---

### 4.2 User Profile ✅ PARTIAL

**Requirements:**

- [ ] Name
- [ ] Profile photo
- [ ] Accommodation / building
- [ ] Optional short bio
- [ ] Auto-created on signup
- [ ] No followers, no messaging

**Current Status:**

- ✅ User model created with name, email, accommodation, bio
- ❌ Profile photo storage not implemented (Firebase Storage needed)
- ✅ User repository & services created
- ❌ Profile endpoints (PUT /me, GET /profile/:id) missing
- ❌ Profile edit UI partially implemented but not integrated

**Gap:** Photo storage implementation needed.

---

### 4.3 Home Feed (Core Screen) ✅ PARTIAL

**Requirements:**

- [ ] List of upcoming plans sorted by time (soonest first)
- [ ] Each plan card shows:
  - Title (e.g. "Gym Session", "Tesco Run")
  - Start time (human-readable)
  - Location
  - Creator name + photo
  - Number of people going
  - Small circular avatars of participants (max 3–5 shown)
- [ ] Button: "Create Plan" (floating or fixed)

**Current Status:**

- ✅ Plans feed UI created (HomeFeed.jsx)
- ✅ PlanCard component with most display fields
- ✅ Fetch plans from backend (GET /plans)
- ❌ Time sorting NOT verified (backend needs to implement)
- ❌ Participant avatars NOT showing (needs profile photos)
- ✅ Floating "Create Plan" button present
- ❌ Real-time participant count NOT updating live

**Gap:** Live updates, time sorting, photo display.

---

### 4.4 Create Plan ✅ PARTIAL

**Requirements:**

- [ ] Simple form: Title, Description, Date & Time, Location, Optional max spots
- [ ] Creator auto-set to current user
- [ ] On submit: Plan appears instantly in feed

**Current Status:**

- ✅ CreatePlan.jsx form created with all fields
- ✅ POST /plans endpoint created
- ✅ Plan validator (zod) implemented
- ❌ Real-time feed refresh NOT working (no live updates)
- ✅ Redirect to detail page on creation
- ❌ Form validation UI feedback missing

**Gap:** Real-time feed updates, better error handling.

---

### 4.5 Plan Detail Screen ✅ PARTIAL

**Requirements:**

- [ ] Show: Title, Description, Time & Location, Creator profile, Who's Going list
- [ ] Real-time update when someone joins
- [ ] Action button: "I'm In" / "You're In" / "Leave Plan"
- [ ] Max spots enforcement
- [ ] Cannot join twice

**Current Status:**

- ✅ PlanDetail.jsx created
- ✅ GET /plans/:id endpoint implemented
- ✅ Participants displayed (ParticipantsList.jsx)
- ✅ Join/Leave button logic implemented
- ❌ Real-time participant updates NOT working
- ❌ Max spots validation UI unclear
- ✅ Backend prevents duplicate joins

**Gap:** Real-time updates, UX clarity on spot limits.

---

### 4.6 My Activity ✅ PARTIAL

**Requirements:**

- [ ] Two tabs: "Plans I Created" + "Plans I Joined"
- [ ] Each links to Plan Detail

**Current Status:**

- ✅ MyActivity.jsx page created
- ✅ Tab structure present
- ❌ API endpoints for filtered plans NOT implemented
  - `GET /plans/me/created`
  - `GET /plans/me/joined`
- ❌ Data NOT fetching in UI

**Gap:** Backend endpoints needed, data fetching logic missing.

---

## 5. Data Model (Simple & Clean)

### User

```javascript
{
  id: string (UUID or Firestore doc ID),
  name: string,
  email: string,
  password: string (hashed),
  photo_url: string (optional),
  accommodation: string,
  bio: string (optional),
  created_at: timestamp
}
```

**Current Status:**

- ✅ Model created in Firestore
- ✅ Firestore collection: `users`
- ❌ Photo URL field not yet used

---

### Plan

```javascript
{
  id: string,
  title: string,
  description: string,
  datetime: timestamp,
  location: string,
  creator_id: string (foreign key),
  max_spots: number (optional),
  created_at: timestamp
}
```

**Current Status:**

- ✅ Model created in Firestore
- ✅ Firestore collection: `plans`
- ✅ All fields implemented
- ✅ Time sorting needed in queries

---

### PlanParticipant (Join Table)

```javascript
{
  id: string,
  plan_id: string,
  user_id: string,
  joined_at: timestamp
}
```

**Current Status:**

- ✅ Model created in Firestore
- ✅ Firestore collection: `planParticipants`
- ✅ Duplicate prevention working
- ✅ Join/leave logic working

---

## 6. Business Rules

| Rule                                         | Status | Notes                                    |
| -------------------------------------------- | ------ | ---------------------------------------- |
| Only authenticated users can create/join     | ✅     | Auth middleware implemented              |
| Cannot join same plan twice                  | ✅     | Backend prevents, Firestore unique check |
| Hide/archive past plans                      | ❌     | Not filtering, needs UI & logic          |
| Users see plans only from same accommodation | ❌     | No filtering in feed                     |
| No payments, ads, moderation                 | ✅     | Out of scope for MVP                     |

---

## 7. UI / UX Guidelines

| Guideline                       | Status                           |
| ------------------------------- | -------------------------------- |
| Mobile-first                    | ✅ Vite responsive, Tailwind CSS |
| Clean, modern, student-friendly | ✅ Components created            |
| Rounded cards                   | ✅ Tailwind styling              |
| Clear CTA buttons               | ✅ Button components             |
| Friendly copy                   | ⚠️ Partially—needs tone review   |
| Dark mode optional              | ❌ Not implemented               |

---

## 8. Tech Stack (Current Implementation)

| Layer    | Recommended               | Current                  | Status    |
| -------- | ------------------------- | ------------------------ | --------- |
| Frontend | React / React Native      | React + Vite             | ✅        |
| Backend  | Firebase / Supabase       | Node.js + Express        | ✅        |
| Auth     | Firebase Auth             | Firebase Admin SDK + JWT | ⚠️ Hybrid |
| Database | Firestore                 | Firestore                | ✅        |
| Hosting  | Vercel / Firebase Hosting | Not deployed             | ⏳        |

---

## 9. Explicitly OUT of Scope (Do NOT build)

| Feature                 | Status    |
| ----------------------- | --------- |
| ❌ Chat / messaging     | Not built |
| ❌ Notifications (push) | Not built |
| ❌ Payments             | Not built |
| ❌ Likes / comments     | Not built |
| ❌ Follower system      | Not built |
| ❌ Multi-campus support | Not built |
| ❌ Admin dashboards     | Not built |

---

---

# Current Project Structure vs Requirements

## File Organization

```
unplango/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── firebase.js              ✅ Firebase initialization
│   │   ├── controllers/
│   │   │   ├── AuthController.js        ✅ Sign-up/Login/GetMe
│   │   │   └── PlanController.js        ✅ CRUD for plans
│   │   ├── middleware/
│   │   │   ├── auth.js                  ✅ JWT verification
│   │   │   └── cors.js                  ✅ CORS headers
│   │   ├── models/
│   │   │   ├── User.js                  ✅ Firestore reference
│   │   │   ├── Plan.js                  ✅ Firestore reference
│   │   │   └── PlanParticipant.js       ✅ Firestore reference
│   │   ├── repositories/
│   │   │   ├── UserRepository.js        ✅ CRUD operations
│   │   │   └── PlanRepository.js        ✅ CRUD operations
│   │   ├── routes/
│   │   │   ├── auth.js                  ✅ Auth endpoints
│   │   │   └── plans.js                 ✅ Plan endpoints
│   │   ├── services/
│   │   │   ├── AuthService.js           ✅ Business logic
│   │   │   └── PlanService.js           ✅ Business logic
│   │   └── validators/
│   │       ├── authValidator.js         ✅ Input validation (Zod)
│   │       └── planValidator.js         ✅ Input validation (Zod)
│   ├── server.js                        ✅ Express app
│   ├── package.json                     ✅ Dependencies
│   └── .env                             ✅ Firebase credentials
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Button.jsx               ✅ Reusable button
│   │   │   ├── Card.jsx                 ✅ Plan card
│   │   │   ├── Input.jsx                ✅ Form input
│   │   │   ├── Layout.jsx               ✅ App wrapper
│   │   │   ├── Modal.jsx                ✅ Dialog component
│   │   │   ├── Nav.jsx                  ✅ Navigation
│   │   │   ├── ParticipantsList.jsx     ✅ Show plan participants
│   │   │   ├── PlanCard.jsx             ✅ Plan card with actions
│   │   │   └── RequireAuth.jsx          ✅ Auth guard
│   │   ├── context/
│   │   │   └── AuthContext.jsx          ✅ Auth state management
│   │   ├── pages/
│   │   │   ├── Chat.jsx                 ❌ Out of scope (messaging)
│   │   │   ├── CreatePlan.jsx           ✅ Create plan form
│   │   │   ├── EditPlan.jsx             ✅ Edit plan (partial)
│   │   │   ├── HomeFeed.jsx             ✅ Plans feed
│   │   │   ├── Login.jsx                ✅ Login form
│   │   │   ├── MyActivity.jsx           ⚠️ Missing API calls
│   │   │   ├── PlanDetail.jsx           ✅ Plan details
│   │   │   ├── Profile.jsx              ✅ User profile display
│   │   │   ├── ProfileEdit.jsx          ✅ Profile edit form
│   │   │   └── Signup.jsx               ✅ Sign-up form
│   │   ├── services/
│   │   │   └── planService.js           ✅ Plan API calls
│   │   ├── utils/
│   │   │   ├── formatDate.js            ✅ Date formatting
│   │   │   ├── leavePlan.js             ✅ Leave plan logic
│   │   │   ├── planActions.js           ✅ Join plan logic
│   │   │   └── validatePlanDates.js     ✅ Date validation
│   │   ├── api.js                       ✅ Axios instance + interceptors
│   │   ├── firebase.js                  ✅ Firebase client config
│   │   ├── App.jsx                      ✅ Main app component
│   │   └── main.jsx                     ✅ Entry point
│   ├── public/
│   │   ├── service-worker.js            ✅ PWA support
│   │   ├── manifest.json                ✅ PWA manifest
│   │   └── offline.html                 ✅ Offline page
│   ├── vite.config.js                   ✅ Vite config
│   ├── tailwind.config.js               ✅ Tailwind config
│   └── package.json                     ✅ Dependencies
│
├── firebase.json                        ✅ Firebase config
├── firestore.rules                      ✅ Security rules
├── firestore.indexes.json               ✅ Firestore indexes
└── MVP_REQUIREMENTS.md                  ✅ This file
```

---

## Gap Analysis Summary

### ✅ COMPLETED

- [x] Authentication system (email/password)
- [x] User model & repository
- [x] Plan CRUD operations
- [x] Plan participant join/leave
- [x] Home feed UI
- [x] Plan detail UI
- [x] Create plan form
- [x] Edit plan form
- [x] My activity page (structure)
- [x] Mobile-responsive design (Tailwind)
- [x] PWA setup (service worker, manifest)
- [x] Backend API structure

### ⚠️ PARTIAL / IN PROGRESS

- [ ] Profile photos (storage not implemented)
- [ ] Real-time updates (need live subscriptions)
- [ ] My Activity API integration (endpoints created, UI missing calls)
- [ ] Time-based sorting (backend query optimization)
- [ ] Accommodation filtering (no filtering in feed)
- [ ] Error handling & logging (basic only)
- [ ] Sign-up/Login flow (Firestore IAM permission issue)

### ❌ NOT IMPLEMENTED

- [ ] Google login (OAuth)
- [ ] Profile photo upload/storage
- [ ] Real-time Firestore listeners
- [ ] Past plan hiding/archiving
- [ ] Accommodation-based filtering
- [ ] Dark mode
- [ ] Push notifications (out of scope)
- [ ] Chat/messaging (out of scope)
- [ ] Cloud hosting/deployment

---

## Immediate Action Items

### Priority 1: Fix Authentication 🔴 BLOCKING

1. **Grant IAM Permission**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Add "Cloud Datastore User" role to: `firebase-adminsdk-fbsvc@unplango-app-b3db1.iam.gserviceaccount.com`
   - This unblocks sign-up/login

### Priority 2: Complete My Activity 🟡

1. Backend: Implement `GET /plans/me/created` endpoint
2. Backend: Implement `GET /plans/me/joined` endpoint
3. Frontend: Add API calls in MyActivity.jsx
4. Test pagination if needed

### Priority 3: Add Plan Filtering 🟡

1. Filter plans by user's accommodation in feed
2. Hide past plans (datetime < now)
3. Sort by datetime ascending (soonest first)

### Priority 4: Enhance UX 🟢

1. Add profile photo upload (Firebase Storage)
2. Add real-time Firestore listeners for live participant updates
3. Add proper error toast notifications
4. Test mobile responsiveness on real device

---

## Success Metrics (MVP Validation)

- [ ] Users can sign up and log in
- [ ] Users can create a plan and see it instantly in feed
- [ ] Users can join a plan and see their name appear in participants
- [ ] Users can view plans for their accommodation only
- [ ] Feed shows plans sorted by time (soonest first)
- [ ] Plans older than current time are hidden
- [ ] "I'm In" button is 1 tap away
- [ ] App works offline (PWA caching)
- [ ] Mobile-first experience is smooth

---

## Backend Endpoints Status

| Endpoint            | Method | Status     | Notes               |
| ------------------- | ------ | ---------- | ------------------- |
| `/auth/signup`      | POST   | ⏳ Blocked | Firestore IAM issue |
| `/auth/login`       | POST   | ⏳ Blocked | Firestore IAM issue |
| `/auth/me`          | GET    | ✅         | Requires JWT        |
| `/plans`            | GET    | ✅         | Needs filtering     |
| `/plans`            | POST   | ✅         | Create plan         |
| `/plans/:id`        | GET    | ✅         | Plan detail         |
| `/plans/:id`        | PUT    | ✅         | Edit plan           |
| `/plans/:id`        | DELETE | ✅         | Delete plan         |
| `/plans/:id/join`   | POST   | ✅         | Join plan           |
| `/plans/:id/leave`  | POST   | ✅         | Leave plan          |
| `/plans/me/created` | GET    | ❌         | NOT IMPLEMENTED     |
| `/plans/me/joined`  | GET    | ❌         | NOT IMPLEMENTED     |

---

## Frontend Page Status

| Page         | Route             | Status     | Notes                     |
| ------------ | ----------------- | ---------- | ------------------------- |
| Login        | `/login`          | ⏳ Blocked | Auth IAM issue            |
| Signup       | `/signup`         | ⏳ Blocked | Auth IAM issue            |
| Home Feed    | `/`               | ✅         | Needs filtering & sorting |
| Create Plan  | `/plans/create`   | ✅         | Works                     |
| Plan Detail  | `/plans/:id`      | ✅         | Works                     |
| Edit Plan    | `/plans/:id/edit` | ✅         | Works                     |
| My Activity  | `/activity`       | ⚠️         | UI ready, no data         |
| Profile      | `/profile`        | ✅         | Display only              |
| Profile Edit | `/profile/edit`   | ✅         | Edit form ready           |

---

## Notes

- **Database:** Currently using Firestore with permissive security rules for testing. **DO NOT deploy with these rules.**
- **Auth:** Hybrid approach using Firebase Admin SDK on backend + JWT tokens. Consider pure Firebase Auth for simplicity.
- **Real-time:** No live subscriptions yet; app requires manual refresh. Firestore listeners can be added later.
- **Deployment:** Not yet deployed. Recommend Vercel (frontend) + Firebase Hosting (backend) or Firebase Cloud Functions.

---

**Last Reviewed:** May 10, 2026  
**Next Review:** After IAM fix & Priority 1 completion
