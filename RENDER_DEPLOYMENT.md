# Deploy Heidi Quiz on Render

Heidi Quiz deploys as a single Render Web Service. During the build, Render installs the backend dependencies, builds the React/Vite frontend, and then Express serves both the website and the `/api` routes from the same domain.

## Blueprint deployment

1. Push the repository to GitHub.
2. Open the Render dashboard.
3. Select **New +** and then **Blueprint**.
4. Connect the `Andri-Almengor/heidi` repository.
5. Keep `render.yaml` as the Blueprint path.
6. Enter the two secret values when Render requests them:
   - `APPS_SCRIPT_URL`: the deployed Google Apps Script `/exec` URL.
   - `APPS_SCRIPT_API_KEY`: the private key created by `setupProject()`.
7. Apply the Blueprint.
8. Wait for the build and deploy to finish.

## Render build configuration

- Runtime: Node
- Node version: 22.22.0
- Build command: `npm install && npm run render:build`
- Start command: `npm start`
- Health check: `/api/health/live`

## Production behavior

- The frontend uses `/api` as its API URL.
- Mock data is disabled.
- Express serves `frontend/dist`.
- React Router navigation falls back to `frontend/dist/index.html`.
- The Apps Script API key remains only in Render's backend environment.
- Render's generated HTTPS hostname is automatically accepted by CORS.

## Required secret values

Never commit these values:

```env
APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
APPS_SCRIPT_API_KEY=YOUR_PRIVATE_KEY
```

## Optional verification

After deployment, open:

```text
https://YOUR-SERVICE.onrender.com/api/health/live
```

Then verify the Apps Script connection:

```text
https://YOUR-SERVICE.onrender.com/api/health
```
