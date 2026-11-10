# Activities Platform

A full-stack web platform for managing community activities. Users can register, browse events, create and host their own activities, join as attendees, comment in real time, and manage a public profile with photos and followers.

The project is split into two applications that live in the same repository:

- **Backend**: a REST API built with **.NET 10** (ASP.NET Core) following Clean Architecture, with **PostgreSQL** as the database.
- **Frontend**: a single-page application built with **React 19 + TypeScript** and **Vite**, using Material UI for the interface.

> To run each part, see [backend/Readme.md](backend/Readme.md) and [frontend/README.md](frontend/README.md).

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [How the Project Was Built](#how-the-project-was-built)
  - [1. Repository](#1-repository)
  - [2. Backend](#2-backend)
  - [3. Frontend](#3-frontend)
  - [4. Database Folder](#4-database-folder)
  - [5. Assets (API Requests)](#5-assets-api-requests)
- [Quick Start](#quick-start)
- [Database Setup (PostgreSQL on Linux)](#database-setup-postgresql-on-linux)
- [Migrations and Database](#migrations-and-database)
- [Important Notes](#important-notes)
- [Useful Commands](#useful-commands)

## Tech Stack

| Layer          | Technologies                                                                                                   |
| -------------- | -------------------------------------------------------------------------------------------------------------- |
| Backend        | .NET 10, ASP.NET Core Web API, Entity Framework Core, ASP.NET Core Identity, MediatR, AutoMapper, FluentValidation, SignalR |
| Database       | PostgreSQL (via Npgsql EF Core provider)                                                                       |
| Media          | Cloudinary (photo uploads)                                                                                     |
| Frontend       | React 19, TypeScript, Vite, React Router, TanStack React Query, MobX, Axios                                    |
| UI / Forms     | Material UI (MUI), MUI Date Pickers, React Hook Form, Zod, React Toastify                                      |
| Extras         | Leaflet / React Leaflet (maps), LocationIQ (location autocomplete), Cropper.js (photo cropping), SignalR client |
| Tooling        | VS Code + C# Dev Kit, pnpm, ESLint, Insomnia                                                                   |

## Project Structure

```
rnet-01-plan-builder/
├── assets/                     # Insomnia collection with the API requests
│   └── Insomnia_*.yaml
├── backend/                    # .NET solution (Clean Architecture)
│   ├── backend.slnx            # Solution file
│   ├── API/                    # Entry point: controllers, middleware, SignalR hub, Program.cs
│   │   ├── Controllers/        # Account, Activities, Profiles (+ BaseApiController)
│   │   ├── DTOs/
│   │   ├── Middleware/         # Global exception handling
│   │   ├── SignalR/            # CommentHub (real-time comments)
│   │   └── Properties/         # launchSettings.json (ports/profiles)
│   ├── Application/            # Use cases (CQRS with MediatR)
│   │   ├── Activities/         # Commands, Queries, DTOs, Validators
│   │   ├── Profiles/           # Commands, Queries, DTOs, Validators
│   │   ├── Core/               # Result, AppException, MappingProfiles, ValidationBehavior
│   │   └── Interfaces/         # IPhotoService, IUserAccessor
│   ├── Domain/                 # Entities: Activity, ActivityAttendee, Comment, Photo, User, UserFollowing
│   ├── Infrastructure/         # External services: Cloudinary photos, security/authorization
│   └── Persistence/            # AppDbContext, DbInitializer (seed data), EF Core migrations
├── database/                   # Local database folder (contents are git-ignored)
├── frontend/                   # React + TypeScript + Vite SPA
│   ├── public/                 # Static files (logo, category images, placeholders)
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout/         # App shell, NavBar, UserMenu, global styles
│   │   │   ├── router/         # Routes and RequireAuth guard
│   │   │   └── shared/         # Reusable components (inputs, map, photo upload, buttons)
│   │   ├── features/           # Pages grouped by feature
│   │   │   ├── account/        # Login and register forms
│   │   │   ├── activities/     # Dashboard, details (incl. chat), create/edit form
│   │   │   ├── profiles/       # Profile page, photos, about, edit form
│   │   │   ├── home/
│   │   │   └── errors/
│   │   ├── lib/
│   │   │   ├── api/            # Axios instance (agent) with interceptors
│   │   │   ├── hooks/          # React Query hooks (activities, account, profile, comments)
│   │   │   ├── schemas/        # Zod validation schemas
│   │   │   ├── stores/         # MobX stores (UI, user)
│   │   │   ├── types/
│   │   │   └── util/
│   │   └── main.tsx            # App entry point and providers
│   ├── package.json
│   └── vite.config.ts
└── Readme.md
```

### Backend layers

The backend follows a Clean Architecture approach, with each layer in its own project to keep the code maintainable, testable and scalable:

- **API**: Web API controllers and application entry point. Exposes the REST endpoints, the Identity endpoints (`/api/login`, etc.) and the SignalR hub (`/comments`).
- **Application**: Business logic and use cases, implemented as MediatR commands and queries, plus DTOs, validators and AutoMapper profiles. Coordinates the flow between the API and the domain.
- **Domain**: Entities and core business rules. Independent from any external concern.
- **Infrastructure**: Implementations of external services, such as Cloudinary photo storage, the current-user accessor and the `IsActivityHost` authorization handler.
- **Persistence**: Data access layer: `AppDbContext`, seed data and EF Core migrations.

Project references:

```
API ──► Application ──► Domain
 │          └─────────► Persistence ──► Domain
 └────► Infrastructure ──► Application
```

## How the Project Was Built

### 1. Repository

The root folder holds both applications plus two support folders (`assets/` and `database/`). Each application has its own `.gitignore`: ASP.NET Core rules for the backend and Vite's default rules for the frontend.

### 2. Backend

The backend was created with the .NET CLI as a solution with five projects.

**a) Create the solution and the projects**

```sh
mkdir backend && cd backend

dotnet new sln -n backend              # generates backend.slnx in .NET 10
dotnet new webapi -n API -controllers  # Web API with controllers
dotnet new classlib -n Application
dotnet new classlib -n Domain
dotnet new classlib -n Persistence
dotnet new classlib -n Infrastructure
```

The template's sample files (`WeatherForecast`, `Class1.cs`) were deleted afterwards.

**b) Add the projects to the solution**

```sh
dotnet sln add API Application Domain Persistence Infrastructure
```

**c) Add the project references**

```sh
dotnet add API reference Application Infrastructure
dotnet add Application reference Domain Persistence
dotnet add Persistence reference Domain
dotnet add Infrastructure reference Application
```

**d) Install the NuGet packages**

```sh
# API: EF Core design-time tools (for dotnet ef) and OpenAPI
dotnet add API package Microsoft.EntityFrameworkCore.Design
dotnet add API package Microsoft.AspNetCore.OpenApi

# Application: CQRS, mapping and validation
dotnet add Application package MediatR
dotnet add Application package AutoMapper
dotnet add Application package FluentValidation.DependencyInjectionExtensions

# Domain: Identity (User extends IdentityUser)
dotnet add Domain package Microsoft.AspNetCore.Identity.EntityFrameworkCore

# Persistence: PostgreSQL EF Core provider
dotnet add Persistence package Npgsql.EntityFrameworkCore.PostgreSQL
dotnet add Persistence package Microsoft.EntityFrameworkCore.Design

# Infrastructure: photo uploads
dotnet add Infrastructure package CloudinaryDotNet
```

**e) Development milestones**

The backend was built up in stages, and the migration history reflects those stages:

1. **Activities CRUD**: `Activity` entity, `AppDbContext`, seed data (`DbInitializer`) and `ActivitiesController`. The first version used SQLite and was later moved to PostgreSQL.
2. **MediatR + AutoMapper + FluentValidation**: commands and queries, a `Result<T>` wrapper, a validation pipeline behavior and global exception middleware.
3. **Identity**: `User` entity, cookie/bearer authentication through `AddIdentityApiEndpoints` and a global authorization filter (migration `IdentityAdded`).
4. **Attendees**: many-to-many `ActivityAttendee` and the `IsActivityHost` authorization policy (migration `ActivityAttendeesAdded`).
5. **Photos**: Cloudinary integration in `Infrastructure` and profile photo endpoints (migration `PhotoEntityAdded`).
6. **Comments**: real-time comments through the SignalR `CommentHub` (migration `CommentEntityAdded`).
7. **Followers**: `UserFollowing` self-referencing relationship (migration `FollowerEntityAdded`).

At startup the API applies any pending migrations automatically and seeds the database (`Program.cs`).

### 3. Frontend

The frontend was scaffolded with Vite using the React + TypeScript template and **pnpm** as the package manager:

```sh
pnpm create vite@latest frontend --template react-ts
cd frontend
pnpm install
```

The React Compiler was enabled in `vite.config.ts` through `@rolldown/plugin-babel` and `babel-plugin-react-compiler`. The template's sample files (`App.css`, `src/assets/*`) were then removed, and the code was reorganized into `app/`, `features/` and `lib/`.

**Dependencies added during development**

```sh
# UI: Material UI + Roboto font
pnpm add @mui/material @mui/icons-material @emotion/react @emotion/styled @fontsource/roboto
pnpm add @mui/x-date-pickers date-fns

# Routing, server state and HTTP
pnpm add react-router @tanstack/react-query @tanstack/react-query-devtools axios

# Client state
pnpm add mobx mobx-react-lite

# Forms and validation
pnpm add react-hook-form zod @hookform/resolvers

# Notifications, maps, calendar, photo upload/cropping, real-time
pnpm add react-toastify leaflet react-leaflet@5.0.0-rc.2 react-calendar
pnpm add react-dropzone react-cropper cropperjs@1.6.2
pnpm add @microsoft/signalr

# Types
pnpm add -D @types/leaflet @types/node
```

**Architecture overview**

- **Routing** (`app/router`): React Router with a `RequireAuth` guard around the protected routes (`/activities`, `/create-activity`, `/manage/:id`, `/profiles/:id`).
- **Server state** (`lib/hooks`): React Query hooks wrap every API call made through the Axios `agent`.
- **Client state** (`lib/stores`): MobX stores for UI loading state (`uiStore`) and the authenticated user (`userStore`).
- **Forms** (`lib/schemas`): React Hook Form with Zod schemas.
- **Real-time** (`useComments`): a SignalR connection to the backend's `/comments` hub.

### 4. Database Folder

`database/` is a placeholder for local database files. Everything inside it is git-ignored except `.gitkeep`. `Program.cs` creates the folder on startup if it is missing. It dates from the original SQLite setup; the current PostgreSQL database runs as a separate service.

### 5. Assets (API Requests)

`assets/` contains only an **Insomnia** collection (`Insomnia_*.yaml`) with the API requests for the Activities, Account and Profiles endpoints. To use it, open Insomnia, choose **Import**, select the file, and point the base URL at your running backend (default `http://localhost:5001`).

## Quick Start

1. Set up PostgreSQL (see [Database Setup](#database-setup-postgresql-on-linux)).
2. Run the backend: see [backend/Readme.md](backend/Readme.md).
3. Run the frontend: see [frontend/README.md](frontend/README.md).
4. Open `http://localhost:5173`.

## Database Setup (PostgreSQL on Linux)

These steps cover installing PostgreSQL and creating the local database. Steps 1 and 2 depend on your distribution. From step 3 onward, the steps are the same on every distribution.

### 1. Install PostgreSQL

#### Debian / Ubuntu / Linux Mint

```sh
sudo apt update
sudo apt install postgresql postgresql-contrib -y
psql --version
```

On Fedora-based distros, replace `apt` with `dnf`.

#### Arch Linux / CachyOS

```sh
sudo pacman -Syu postgresql
psql --version
```

Unlike Debian/Ubuntu, Arch does not create the database cluster for you. Initialize it once as the `postgres` user before starting the service:

```sh
sudo -iu postgres initdb -D /var/lib/postgres/data \
  --locale=C.UTF-8 --encoding=UTF8 \
  --auth-local=peer --auth-host=scram-sha-256
```

The `--auth-*` flags enable password authentication for TCP connections (`localhost`). Without them, `initdb` defaults to `trust`, which lets any local user connect without a password.

### 2. Start and enable the service

```sh
sudo systemctl enable --now postgresql
sudo systemctl status postgresql
```

### 3. Open the PostgreSQL prompt as the `postgres` user

```sh
sudo -i -u postgres
psql
```

### 4. Create a user and the database

Replace `backend_user` and `your_password` with your own values:

```sql
CREATE USER backend_user WITH PASSWORD 'your_password';
CREATE DATABASE activities_db OWNER backend_user;
GRANT ALL PRIVILEGES ON DATABASE activities_db TO backend_user;
\q
```

```sh
exit
```

### 5. Test the connection

```sh
psql -h localhost -U backend_user -d activities_db
```

If you get a `peer authentication failed` (or `password authentication failed`) error, edit `pg_hba.conf`:

| Distribution          | `pg_hba.conf` location                   |
| --------------------- | ---------------------------------------- |
| Debian / Ubuntu       | `/etc/postgresql/<version>/main/pg_hba.conf` |
| Arch Linux / CachyOS  | `/var/lib/postgres/data/pg_hba.conf`     |

Change the `host` lines for `127.0.0.1/32` and `::1/128` to use `scram-sha-256`. Change the `local` line too if you connect without `-h localhost`. Then restart the service:

```sh
sudo systemctl restart postgresql
```

> **Arch / CachyOS:** PostgreSQL is a rolling package there. After a **major** version upgrade (e.g., 17 → 18), the service won't start until you migrate the data directory. You can either use `pg_upgrade` together with the `postgresql-old-upgrade` package, or, for a disposable dev database, delete `/var/lib/postgres/data`, run `initdb` again and re-create the user and database. To avoid surprise upgrades, you can add `IgnorePkg = postgresql postgresql-libs` to `/etc/pacman.conf`.

### 6. Set the connection string

Use User Secrets (recommended):

```sh
cd backend
dotnet user-secrets init -p API
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=activities_db;Username=backend_user;Password=your_password" -p API
```

Or set it in `backend/API/appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=activities_db;Username=backend_user;Password=your_password"
  }
}
```

## Migrations and Database

Every time the domain entities change (new fields, relationships or tables), create and apply a migration. Run these commands from the `backend/` folder, where `backend.slnx` lives.

```sh
# Install the EF Core tools (first time only)
dotnet tool install --global dotnet-ef

# Create a new migration
dotnet ef migrations add MigrationName -p Persistence -s API

# Apply migrations to the database
dotnet ef database update -p Persistence -s API

# Remove the last migration (if it was not applied yet)
dotnet ef migrations remove -p Persistence -s API
```

> The API also runs `Database.MigrateAsync()` on startup, so pending migrations are applied automatically when the backend starts.

## Important Notes

### Environment Variables and Secrets

Manage sensitive configuration (connection strings, Cloudinary keys, API tokens) through:

- **User Secrets** for local development: `dotnet user-secrets init -p API`.
- `backend/API/appsettings.json` (git-ignored) for the `CloudinarySettings` section.
- `frontend/.env` for the frontend variables (`VITE_API_URL`, `VITE_COMMENTS_URL`, `VITE_LOCATION_IQ_TOKEN`).
- Environment variables in production.

## Useful Commands

### .NET (from `backend/`)

| Command                          | Description                  |
| -------------------------------- | ---------------------------- |
| `dotnet build`                   | Compiles the entire solution |
| `dotnet run --project API`       | Runs the API project         |
| `dotnet watch run --project API` | Runs with hot reload         |
| `dotnet clean`                   | Removes build artifacts      |

### Frontend (from `frontend/`)

| Command        | Description                           |
| -------------- | ------------------------------------- |
| `pnpm install` | Installs dependencies                 |
| `pnpm dev`     | Starts the Vite dev server            |
| `pnpm build`   | Type-checks and builds for production |
| `pnpm preview` | Serves the production build locally   |
| `pnpm lint`    | Runs ESLint                           |

### PostgreSQL / psql

| Command                               | Description                                 |
| ------------------------------------- | ------------------------------------------- |
| `sudo systemctl start postgresql`     | Starts the PostgreSQL service               |
| `sudo systemctl stop postgresql`      | Stops the PostgreSQL service                |
| `sudo systemctl status postgresql`    | Checks service status                       |
| `psql -h localhost -U <user> -d <db>` | Connects to a database                      |
| `\l`                                  | Lists all databases (inside psql)           |
| `\c <db_name>`                        | Connects to a database (inside psql)        |
| `\dt`                                 | Lists tables in the current database        |
| `\du`                                 | Lists all roles/users                       |
| `\q`                                  | Exits psql                                  |
| `DROP DATABASE activities_db;`        | Deletes the database (inside psql)          |
