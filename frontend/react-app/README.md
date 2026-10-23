# MazeScape React frontend (migration workspace)

This workspace uses React, Vite, Tailwind CSS, and Lucide icons.

## Run locally
```bash
cd frontend/react-app
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Migration status
This is an isolated first-stage frontend workspace. The existing production HTML/CSS/JavaScript application remains intact while the React UI is developed. The next stage is to connect the existing Canvas game engine, API client, authentication, scores, and controls, then switch the deployment only after the integration is tested.

Do not point the production deployment at this workspace until the integration stage is complete.
