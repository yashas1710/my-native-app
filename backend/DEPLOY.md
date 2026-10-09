# Backend deployment

Use Node 24 LTS. The start command runs plain Node, with no development watcher.

## Render

1. Connect this GitHub repository to a new Render **Web Service**, select the deployment branch, and choose the Node runtime.
2. Set **Root Directory** to `backend`, **Build Command** to `npm install`, and **Start Command** to `npm start`.
3. In Environment, set `NODE_ENV=production` and all eight required variables below. Obtain Firebase values from a service account JSON for the intended project; do not put credentials in Git or logs.

   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY_ID`
   - `FIREBASE_CLIENT_ID`
   - `FIREBASE_CLIENT_X509_CERT_URL`
   - `FIREBASE_PRIVATE_KEY_BASE64`: base64-encode the JSON credential's decoded `private_key` string, including actual newlines, rather than encoding the entire JSON file.
   - `JWT_SECRET`: a random secret at least 32 characters long, excluding `dev-secret`, `secret`, and `changeme`.
   - `FRONTEND_URL`: the exact Vercel origin, for example `https://your-project.vercel.app`, with no path. Trailing slashes are stripped.

4. Set **Health Check Path** to `/health`. Render supplies `PORT`; the server binds to `0.0.0.0` and defaults to port 5000 locally.
5. Deploy and confirm `GET https://<your-render-host>/health` returns HTTP 200 with `{"status":"OK"}`. Startup validation exits on missing variables or a weak production JWT secret before Firebase initializes.

For Railway, use the same root directory, commands, environment variables, and health path; use Railway's assigned port and public domain.

## Repoint Vercel in three steps

1. Open the frontend project in Vercel **Settings > Environment Variables** and set `VITE_API_URL` to the new public HTTPS backend origin for Production (and any Preview environments that should use it).
2. Set the backend's `FRONTEND_URL` to the exact production Vercel origin and restart/redeploy the backend if it changed.
3. Redeploy the Vercel frontend so Vite embeds the new URL; verify login, the feed, and plan creation against the new backend.

`frontend/.env.production` contains a placeholder, so a build without the dashboard variable will not point to a working backend. `frontend/src/api.js` falls back to `http://localhost:5000` only when `VITE_API_URL` is missing or empty.

## Local startup

Copy `.env.example` to `.env`, replace placeholders with valid credentials, and run `npm start` from `backend`. Use `NODE_ENV=development` locally; only `FRONTEND_URL` may be omitted in development to allow permissive CORS. All other listed variables remain required.

Real `.env` files are ignored for new files, but ignore rules do not remove already tracked files. This checkout already tracks `backend/.env` and `frontend/.env.production`; the latter has been replaced with a non-secret placeholder. Before handover, the owner must review the tracked backend credential file and its Git history, rotate exposed credentials, and arrange its removal from tracking separately. Never copy secret values into deployment logs.
