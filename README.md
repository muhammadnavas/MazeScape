# MazeScape

MazeScape is a browser-based maze game built with HTML, CSS, and vanilla JavaScript. It runs entirely on the client and can be hosted as a static website on Vercel.

## Features

- Randomly generated mazes
- Ghost AI with A* pathfinding
- Keyboard and mobile touch controls
- Power-ups, lives, timers, and in-game scoring
- Enhanced maze textures
- Local settings stored in the browser
- Help and A* algorithm explanation

## No backend required

MazeScape does not require a server, database, user account, or API credentials. Gameplay and scoring run in the browser. Settings are saved locally using `localStorage`; scores are not uploaded to a server or shared between players.

## Run locally

You can open `frontend/index.html` directly in a browser, or serve the frontend directory with any static HTTP server.

For example, with Python installed:

```bash
cd frontend
python -m http.server 8000
```

Then open http://localhost:8000.

## Deploy

Deploy the `frontend` directory as a static site on Vercel. Set the Vercel project root directory to `frontend`; no backend service, database, or environment variables are needed.

## Project structure

```text
MazeScape/
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── game.js
│   ├── astar.js
│   └── react-app/   # Separate experimental UI workspace; not the production game
└── README.md
```

## License

MIT
