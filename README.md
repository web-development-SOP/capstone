# UniLib — University Library SPA

A Steam-inspired university library app built with React 18 + TypeScript + Firebase Auth.

**Live URL:** https://YOUR-PROJECT.vercel.app

> Replace the URL above with your real Vercel URL after deploying (Step 3).

---

## Screenshots

### Home — Book catalog
![Home page showing the book search and catalog grid](docs/screenshots/home.png)

### Book detail
![Book detail page with loan and wishlist actions](docs/screenshots/book-detail.png)

### Login
![Login form with email/password fields](docs/screenshots/login.png)

### My Loans (protected route)
![Loans page only accessible after signing in](docs/screenshots/loans.png)

> **How to add screenshots:** Run `npm run dev`, take a screenshot of each page, and save the files in `docs/screenshots/`.

---

## Running the tests

```bash
# Install dependencies (only needed once)
npm install

# Run the full test suite once
npm test

# Run tests in watch mode (re-runs on file save)
npm run test:watch
```

Expected output:

```
Test Files  7 passed (7)
     Tests  31 passed (31)
```

### What is tested

| File | Component / Hook | Cases covered |
|---|---|---|
| `Spinner.test.tsx` | `<Spinner>` | Default label, custom label |
| `SearchBar.test.tsx` | `<SearchBar>` | Render, submit, trim, blank guard, loading state |
| `BookCard.test.tsx` | `<BookCard>` | Cover image, placeholder letter, availability badge, detail link |
| `useFetch.test.ts` | `useFetch` hook | Null URL, loading state, successful response, network error |
| `ProtectedRoute.test.tsx` | `<ProtectedRoute>` | Loading spinner, redirect to `/login`, renders children when authenticated |
| `Login.test.tsx` | `<Login>` page | Field render, empty-field validation, invalid email, successful submit, navigation, wrong credentials error |
| `AuthContext.test.tsx` | `useAuth` hook | Initial state, persisted session, `login()`, `register()`, `logout()` |

All external dependencies (Firebase, Axios, CSS Modules) are mocked with `vi.mock()` — no network calls are made during tests.

---

## Authentication flow

The app uses **Firebase Authentication** (email/password) via the Firebase Web SDK v9+.

```
User fills in email + password
        │
        ▼
Login.tsx calls useAuth().login(email, password)
        │
        ▼
AuthContext calls signInWithEmailAndPassword(auth, email, password)
        │
        ▼
Firebase returns a FirebaseUser object
        │
        ▼
AuthContext calls fbUser.getIdToken() → real Firebase JWT (Bearer token)
        │
        ├── setUser(toUser(fbUser))   ← stored in React state (memory only)
        └── setToken(jwt)             ← stored in React state (memory only)
                │
                ▼
        Firebase SDK persists the session in IndexedDB automatically.
        On every page reload, onAuthStateChanged() fires and restores
        the user + refreshes the token — no manual localStorage needed.
                │
                ▼
        ProtectedRoute reads useAuth().user
        ├── isLoading=true  → shows <Spinner>
        ├── user=null       → <Navigate to="/login">
        └── user present    → renders the protected page (e.g. /loans)
```

**Token usage:** `useAuth().token` exposes the JWT so it can be sent as an `Authorization: Bearer <token>` header in any API call that requires authentication.

**Logout:** calls `signOut(auth)` — Firebase clears the persisted session and `onAuthStateChanged` fires with `null`, which resets `user` and `token` to `null`.

---

## Tech stack

| Layer | Technology |
|---|---|
| UI | React 18 + TypeScript |
| Routing | React Router DOM v6 |
| Styling | CSS Modules + SASS |
| HTTP | Axios + custom `useFetch` hook |
| Auth / Backend | Firebase Authentication |
| State | React Context API |
| Book data | Open Library REST API |
| Build | Vite |
| Tests | Vitest + React Testing Library |
| Deploy | Vercel |

---

## Local development

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd capstone

# 2. Install dependencies
npm install

# 3. Create the environment file
cp .env.local.example .env.local
# Fill in your Firebase project values (see below)

# 4. Start the dev server
npm run dev
```

### Environment variables

Create a `.env.local` file in the project root with your Firebase config:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> These values are in the Firebase console → Project settings → Your apps → SDK setup.

---

## Deploying to Vercel

### First deploy (one time)

1. Push your code to GitHub.
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your repo.
3. Vercel auto-detects Vite. Leave the build settings as default:
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
4. In **Environment Variables**, add all six `VITE_FIREBASE_*` variables from your `.env.local`.
5. Click **Deploy**.
6. Copy the live URL and paste it at the top of this README.

### Re-deploying after changes

```bash
git add .
git commit -m "your message"
git push
# Vercel redeploys automatically on every push to main
```

The `vercel.json` at the root already contains the SPA rewrite rule so deep links (e.g. `/loans`, `/book/OL123W`) work correctly after a hard refresh:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

---

## Alternative: deploying to Netlify

1. Push your code to GitHub.
2. Go to [netlify.com](https://netlify.com) → **Add new site** → import from Git.
3. Set:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. In **Site configuration → Environment variables**, add the six `VITE_FIREBASE_*` variables.
5. Click **Deploy site**.
6. Add a `public/_redirects` file to handle SPA routing:

```
/*  /index.html  200
```

> With Netlify you do **not** need `vercel.json` — use `_redirects` instead.
