# Frontend (React + TypeScript + Vite)

Client application for the Activities platform. For the architecture and how the project was built, see the [main README](../Readme.md).

## Table of Contents

- [Prerequisites](#prerequisites)
- [How to Run](#how-to-run)
- [Other Scripts](#other-scripts)
- [Pages and Routes](#pages-and-routes)
- [Folder Structure](#folder-structure)
- [How It Works](#how-it-works)

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

Create a `.env` file in `frontend/` (it is git-ignored):

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

> Vite only exposes variables that start with `VITE_`, and reads `.env` at startup. Restart `pnpm dev` after changing it.

### 3. Start the dev server

```sh
pnpm dev
```

Open **http://localhost:5173** in your browser. The backend only accepts requests from this origin (CORS), so keep the default port.

## Other Scripts

| Command        | Description                           |
| -------------- | ------------------------------------- |
| `pnpm build`   | Type-checks and builds for production |
| `pnpm preview` | Serves the production build locally   |
| `pnpm lint`    | Runs ESLint                           |

## Pages and Routes

Routes are defined in [`src/app/router/Routes.tsx`](src/app/router/Routes.tsx). Protected routes are wrapped in `RequireAuth`, which redirects to `/login` and returns the user to the original page after logging in.

| Route              | Page                  | Access    | Description                                                      |
| ------------------ | --------------------- | --------- | ---------------------------------------------------------------- |
| `/`                | `HomePage`            | Protected | Landing page                                                     |
| `/activities`      | `ActivityDashboard`   | Protected | Activity list with infinite scroll, filters and a date calendar  |
| `/activities/:id`  | `ActivityDetailPage`  | Protected | Details, map, attendees, join/cancel buttons and live chat       |
| `/create-activity` | `ActivityForm`        | Protected | Create a new activity                                            |
| `/manage/:id`      | `ActivityForm`        | Protected | Edit an activity (host only)                                     |
| `/profiles/:id`    | `ProfilePage`         | Protected | Profile with About, Photos, Events, Followers and Following tabs |
| `/change-password` | `ChangePasswordForm`  | Protected | Change the current user's password                               |
| `/login`           | `LoginForm`           | Public    | Log in; links to register and "forgot password"                  |
| `/register`        | `RegisterForm`        | Public    | Create an account; shows `RegisterSuccess` afterwards            |
| `/confirm-email`   | `VerifyEmail`         | Public    | Target of the confirmation email link (`userId`, `code`)         |
| `/forgot-password` | `ForgotPasswordForm`  | Public    | Request a password reset email                                   |
| `/reset-password`  | `ResetPasswordForm`   | Public    | Target of the reset email link (`email`, `code`)                 |
| `/not-found`       | `NotFound`            | Public    | 404 page; any unknown route redirects here                       |

## Folder Structure

```
src/
├── app/
│   ├── layout/        # App shell, NavBar, UserMenu, global styles
│   ├── router/        # Routes and the RequireAuth guard
│   └── shared/        # Reusable components: TextInput, SelectInput, DateTimeInput,
│                      # LocationInput, MapComponent, PhotoUploadWidget, StarButton...
├── features/
│   ├── account/       # Login, register, verify email, change/forgot/reset password
│   ├── activities/    # dashboard/, details/ (incl. chat), form/
│   ├── profiles/      # Profile page, header, tabs, photos, followings, edit form
│   ├── home/
│   └── errors/
├── lib/
│   ├── api/agent.ts   # Axios instance with interceptors
│   ├── hooks/         # React Query hooks: useActivities, useAccount, useProfile, useComments
│   ├── schemas/       # Zod schemas for every form
│   ├── stores/        # MobX stores: uiStore, userStore, activityStore
│   ├── types/         # Shared TypeScript types
│   └── util/          # Helpers: formatDate, timeAgo, requiredString (Zod)
└── main.tsx           # Entry point: MUI date localization, MobX store, React Query, toasts, router
```

## How It Works

### API calls (`lib/api/agent.ts`)

All HTTP requests go through a single Axios instance whose `baseURL` is `VITE_API_URL`:

- The **request interceptor** marks the UI as busy and adds `Authorization: Bearer <token>` when the user is logged in.
- The **response interceptor** clears the busy state and handles errors globally: toasts for `400`, `401` and `500`, and a redirect to `/not-found` for `404`.
- A 1-second artificial delay is added to every response, so loading states are visible during development.

### Authentication (`useAccount`, `userStore`)

- `POST /api/login` returns an access token. `userStore` keeps it and saves it in `localStorage` (key `jwt`), so the session survives a page reload. `GET /api/account/user-info` then loads the current user into the React Query cache (`["user"]`).
- New accounts must confirm their email before logging in. After registering, the user gets a link to `/confirm-email`, and `VerifyEmail` sends the `userId` and `code` to `GET /api/confirmEmail`. If verification fails, the page offers to re-send the link.
- Forgot password: `ForgotPasswordForm` posts the email to `/api/forgotPassword`. The email links to `/reset-password`, and `ResetPasswordForm` posts the code and new password to `/api/resetPassword`.
- Logged-in users can change their password from the user menu (`/change-password`).

> The backend sends these emails with Resend. If the backend is in email test mode, the emails are printed to its console instead, so copy the link from the API terminal (see [backend/Readme.md](../backend/Readme.md#testing-without-sending-emails)).

### Server state (React Query)

Every API call is wrapped in a hook in `lib/hooks`. The activity list uses `useInfiniteQuery` with the backend's cursor pagination (`nextCursor`), and `react-intersection-observer` loads the next page when the end of the list scrolls into view. The filter (all / going / hosting) and the start date come from `activityStore` and are part of the query key (`["activities", filter, startDate]`), so changing them refetches the list.

### Client state (MobX)

- `uiStore`: global loading indicator.
- `userStore`: the access token and login state.
- `activityStore`: the dashboard filter and start date.

### Forms

Forms use React Hook Form with a Zod resolver (`lib/schemas`). Shared inputs in `app/shared/components` connect MUI fields to React Hook Form. `LocationInput` calls LocationIQ's autocomplete API, and `MapComponent` shows the venue with Leaflet.

### Real-time chat (`useComments`)

On the activity details page, `useComments` opens a SignalR connection to `VITE_COMMENTS_URL?activityId=...`, sending the access token. It loads the existing comments (`LoadComments`), listens for new ones (`ReceiveComment`) and sends messages with `SendComment`.

### Photos

`PhotoUploadWidget` uses `react-dropzone` to select an image and `react-cropper` to crop it to a square. It then uploads the image as `multipart/form-data` to `/api/profiles/add-photo`.
