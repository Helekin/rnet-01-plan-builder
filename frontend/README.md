# Frontend (React + TypeScript + Vite)

Client application for the Activities platform. For the architecture and how the project was built, see the [main README](../Readme.md).

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS)
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`, or `corepack enable`)
- The [backend](../backend/Readme.md) running at `http://localhost:5001`
- A [LocationIQ](https://locationiq.com/) access token (for location autocomplete)

## How to Run

All commands are run from the `frontend/` folder.

### 1. Install dependencies

```sh
pnpm install
```

### 2. Configure the environment variables

Create a `.env` file in `frontend/`:

```env
VITE_API_URL=http://localhost:5001/api
VITE_COMMENTS_URL=http://localhost:5001/comments
VITE_LOCATION_IQ_TOKEN=your_locationiq_token
```

| Variable                 | Description                                      |
| ------------------------ | ------------------------------------------------ |
| `VITE_API_URL`           | Base URL of the backend REST API                 |
| `VITE_COMMENTS_URL`      | URL of the SignalR comments hub                  |
| `VITE_LOCATION_IQ_TOKEN` | LocationIQ token used by the location input      |

### 3. Start the dev server

```sh
pnpm dev
```

Open **http://localhost:5173** in your browser.

## Other Scripts

| Command        | Description                           |
| -------------- | ------------------------------------- |
| `pnpm build`   | Type-checks and builds for production |
| `pnpm preview` | Serves the production build locally   |
| `pnpm lint`    | Runs ESLint                           |
