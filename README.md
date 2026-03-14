# GitHub City

GitHub City turns a developer's repositories into an interactive 3D city.

- Taller buildings: higher commit activity
- Brighter buildings: more stars
- Animated roof pulses: recent activity
- Color-coded buildings: repository language

## Tech Stack

- Frontend: React + TypeScript + Three.js
- Local backend: Node.js + Express
- Production deployment: Vercel (frontend + serverless API)

## Project Structure

```text
GitHub_City/
  api/                           # Vercel serverless API
    _lib/githubData.js
    github/user/[username].js
  backend/                       # Local Express backend for development
  frontend/                      # React app
  vercel.json                    # Vercel build/routes config
  .env.example
```

## Local Development

### 1. Install dependencies

```bash
cd frontend
npm install

cd ../backend
npm install
```

### 2. Run backend

```bash
cd backend
npm start
```

Runs on `http://localhost:3001`.

### 3. Run frontend

```bash
cd frontend
npm start
```

Runs on `http://localhost:3000`.

## Environment Variables

Create `.env` files as needed.

### Local backend (`backend/.env`)

```env
GITHUB_TOKEN=your_github_personal_access_token
```

### Vercel

Set this in your Vercel project settings:

- `GITHUB_TOKEN`

Without a token, GitHub API still works but has lower rate limits.

## API Endpoint

Frontend calls:

- `GET /api/github/user/:username?year=all|YYYY`

Example:

- `/api/github/user/octocat?year=2024`

## Push to GitHub

Run from project root:

```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/bikram73/GitHub_City.git
git push -u origin main
```

If the repo already exists locally, skip the `git init` step.

## Deploy on Vercel

### Option A: Vercel Dashboard (recommended)

1. Push this code to GitHub.
2. In Vercel, click New Project and import your GitHub repo.
3. Keep root directory as repository root (do not set it to `frontend`).
4. Add environment variable `GITHUB_TOKEN`.
5. Deploy.

`vercel.json` already configures:

- frontend static build from `frontend/package.json`
- serverless API from `api/**/*.js`
- SPA routing fallback

### Option B: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel
vercel --prod
```

## Build Check

```bash
cd frontend
npm run build
```

Build currently succeeds. A non-blocking warning may appear from `@mediapipe/tasks-vision` source maps.
