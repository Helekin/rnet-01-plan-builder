# Backend (.NET)

REST API for the Activities platform, built with .NET 10 and PostgreSQL. For the architecture, database setup and migrations, see the [main README](../Readme.md).

## Table of Contents

- [Prerequisites](#prerequisites)
- [How to Run](#how-to-run)
- [Configuration Reference](#configuration-reference)
- [Seed Data](#seed-data)
- [Email (Confirmation and Password Reset)](#email-confirmation-and-password-reset)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Real-time Comments (SignalR)](#real-time-comments-signalr)
- [Error Handling](#error-handling)

## Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download) (check with `dotnet --version`)
- PostgreSQL running locally, with a database and user created (see [Database Setup](../Readme.md#database-setup-postgresql-on-linux))
- A [Cloudinary](https://cloudinary.com/) account (for photo uploads)
- (Optional) A [Resend](https://resend.com/) account (for sending real emails, see [Email](#email-confirmation-and-password-reset))
- (Optional) VS Code with the **C# Dev Kit** extension
- (Optional) `dotnet-ef` to manage migrations: `dotnet tool install --global dotnet-ef`

## How to Run

All commands are run from the `backend/` folder.

### 1. Configure the settings

Set the database connection string and the Resend token with User Secrets:

```sh
dotnet user-secrets init -p API
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=activities_db;Username=backend_user;Password=your_password" -p API
dotnet user-secrets set "Resend:ApiToken" "re_your_resend_token" -p API
```

Create `API/appsettings.json` (git-ignored) with your Cloudinary credentials:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "CloudinarySettings": {
    "CloudName": "your_cloud_name",
    "ApiKey": "your_api_key",
    "ApiSecret": "your_api_secret"
  },
  "AllowedHosts": "*"
}
```

Create `API/appsettings.Development.json` (also git-ignored) with the frontend URL, which is used to build the links inside the emails:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Information"
    }
  },
  "ClientAppUrl": "http://localhost:5173"
}
```

> You can put the connection string in `appsettings.Development.json` instead of User Secrets (see the [main README](../Readme.md#6-set-the-connection-string)).

### 2. Restore and build

```sh
dotnet restore
dotnet build
```

### 3. Run the API

```sh
dotnet run --project API
```

Or with hot reload:

```sh
dotnet watch run --project API
```

The API starts at **http://localhost:5001**. Use `--launch-profile https` to serve it at `https://localhost:5001` (with HTTP on `http://localhost:5000`) instead. On startup it applies any pending migrations and seeds sample data automatically.

> CORS only allows the frontend at `http://localhost:5173` / `https://localhost:5173`, with credentials enabled.

### 4. Test the endpoints (optional)

Import the Insomnia collection in [`../assets`](../assets) to try the API requests.

## Configuration Reference

| Key                                  | Where to set it                         | Description                                                             |
| ------------------------------------ | --------------------------------------- | ----------------------------------------------------------------------- |
| `ConnectionStrings:DefaultConnection` | User Secrets or `appsettings.Development.json` | PostgreSQL connection string                                    |
| `CloudinarySettings:CloudName`       | `appsettings.json`                      | Cloudinary cloud name                                                   |
| `CloudinarySettings:ApiKey`          | `appsettings.json`                      | Cloudinary API key                                                      |
| `CloudinarySettings:ApiSecret`       | `appsettings.json`                      | Cloudinary API secret                                                   |
| `Resend:ApiToken`                    | User Secrets                            | Resend API token used by the email sender                               |
| `ClientAppUrl`                       | `appsettings.Development.json`          | Frontend base URL, used in the confirm-email and reset-password links   |

Both `appsettings.json` and `appsettings.Development.json` are listed in `backend/.gitignore`, so secrets in them are never committed.

## Seed Data

On the first run, `Persistence/DbInitializer.cs` creates three users and a set of sample activities (only if the tables are empty):

| Display name | Email              | Password       |
| ------------ | ------------------ | -------------- |
| Helekin      | `helekin@test.com` | `Kthulhu@1928` |
| Saggi        | `saggi@test.com`   | `Kthulhu@1928` |
| Kefka        | `kefka@test.com`   | `Kthulhu@1928` |

Login requires a confirmed email (`SignIn.RequireConfirmedEmail = true`). The seeded users are created with `EmailConfirmed = true`, so you can log in with them right away. Their IDs are generated by Identity (GUIDs).

> If your database was seeded by an older version, its users are still unconfirmed, because the seed only runs when the users table is empty. Reseed it (see below), or set `EmailConfirmed = true` on those users in the `AspNetUsers` table.

To reseed from scratch, drop the database (`DROP DATABASE activities_db;`), re-create it and start the API again.

## Email (Confirmation and Password Reset)

Emails are sent by `Infrastructure/Email/EmailSender.cs`, which implements ASP.NET Core Identity's `IEmailSender<User>` with the [Resend](https://resend.com/) SDK. Two emails are sent:

| Email               | Triggered by                                                         | Link sent to the user                                           |
| ------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------- |
| Email confirmation  | `POST /api/account/register`, `GET /api/account/resendConfirmEmail` | `{ClientAppUrl}/confirm-email?userId=...&code=...`               |
| Password reset      | `POST /api/forgotPassword`                                           | `{ClientAppUrl}/reset-password?email=...&code=...`               |

The confirmation code is Base64Url-encoded before it is placed in the link; the frontend sends it back to `GET /api/confirmEmail`.

### Sending real emails (default)

`SendMailAsync` sends every email through Resend with `resend.EmailSendAsync(message)`. For this to work:

- Set `Resend:ApiToken` (see [Configuration Reference](#configuration-reference)).
- The `From` address must be allowed by your Resend account. With the `resend.dev` test domain, Resend only delivers to the email address of your own Resend account. To send to any address, [verify your own domain](https://resend.com/docs/dashboard/domains/introduction) and use a sender on it.

### Testing without sending emails

To test the flows without a Resend account (or to register fake addresses such as `@test.com`), switch `SendMailAsync` to test mode: comment out the Resend call, and uncomment `Console.WriteLine` and `Task.CompletedTask`:

```csharp
// Test mode: print the email instead of sending it
Console.WriteLine(message.HtmlBody);

// await resend.EmailSendAsync(message);

await Task.CompletedTask;
```

The email's HTML, including the confirmation or reset link, is then printed in the terminal where the API runs. Copy the link into the browser. Revert the three lines to send real emails again.

## Authentication

Authentication uses **ASP.NET Core Identity** with `AddIdentityApiEndpoints<User>`, which issues **bearer tokens** (not JWTs):

- `POST /api/login` returns `{ accessToken, expiresIn, refreshToken }`. Send the token as `Authorization: Bearer <accessToken>`.
- A global `AuthorizeFilter` requires an authenticated user on every controller endpoint. Public endpoints are marked with `[AllowAnonymous]`.
- Emails must be unique, and an unconfirmed email cannot log in (the login returns `401` with `detail: "NotAllowed"`).
- The `IsActivityHost` policy (`Infrastructure/Security/IsHostRequirement.cs`) only lets the host of an activity edit or delete it.
- For the SignalR hub, the token is read from the `access_token` query string on `/comments` requests, since WebSockets cannot send headers.

## API Endpoints

All endpoints are prefixed with `/api`. 🔓 = anonymous access allowed; every other endpoint requires a bearer token.

### Identity (built-in, from `MapIdentityApi<User>`)

| Method | Route                   | Description                                              |
| ------ | ----------------------- | -------------------------------------------------------- |
| POST   | `/login` 🔓             | Logs in with `{ email, password }` and returns tokens    |
| POST   | `/refresh` 🔓           | Exchanges a refresh token for a new access token         |
| GET    | `/confirmEmail` 🔓      | Confirms an email (`userId`, `code` query parameters)    |
| POST   | `/forgotPassword` 🔓    | Sends a password reset email (`{ email }`)               |
| POST   | `/resetPassword` 🔓     | Resets the password (`{ email, resetCode, newPassword }`) |
| GET/POST | `/manage/info`        | Reads/updates the current user's Identity info           |

> `MapIdentityApi` also maps `/register`, `/resendConfirmationEmail` and `/manage/2fa`. The app uses its own `/account/register` and `/account/resendConfirmEmail` instead, because they also store the display name and build links that point to the frontend.

### Account (`AccountController`)

| Method | Route                          | Description                                                         |
| ------ | ------------------------------ | ------------------------------------------------------------------- |
| POST   | `/account/register` 🔓         | Registers `{ displayName, email, password }` and sends the confirmation email |
| GET    | `/account/resendConfirmEmail` 🔓 | Re-sends the confirmation email (`email` or `userId` query parameter) |
| GET    | `/account/user-info` 🔓        | Returns the current user (`displayName`, `email`, `id`, `imageUrl`), or `204` if not logged in |
| POST   | `/account/logout`              | Signs the user out                                                  |
| POST   | `/account/change-password`     | Changes the password (`{ currentPassword, newPassword }`)           |

### Activities (`ActivitiesController`)

| Method | Route                      | Description                                                   |
| ------ | -------------------------- | ------------------------------------------------------------- |
| GET    | `/activities`              | Paged list of upcoming activities (see query parameters below) |
| GET    | `/activities/{id}`         | Activity details, including attendees                         |
| POST   | `/activities`              | Creates an activity; the current user becomes its host        |
| PUT    | `/activities/{id}`         | Edits an activity (host only)                                 |
| DELETE | `/activities/{id}`         | Deletes an activity (host only)                               |
| POST   | `/activities/{id}/attend`  | Toggles attendance; for the host, toggles cancel/reactivate   |

`GET /activities` uses **cursor-based pagination**, ordered by date:

| Query parameter | Default         | Description                                                    |
| --------------- | --------------- | -------------------------------------------------------------- |
| `startDate`     | now (UTC)       | Only returns activities on or after this date                  |
| `filter`        | (none)          | `isGoing` (activities you attend) or `isHost` (activities you host) |
| `cursor`        | (none)          | The `nextCursor` value from the previous page                  |
| `pageSize`      | `3` (max `50`)  | Number of items per page                                       |

Response shape: `{ "items": [ ...ActivityDto ], "nextCursor": "2026-12-01T18:00:00Z" | null }`. A `null` cursor means there are no more pages.

### Profiles (`ProfilesController`)

| Method | Route                              | Description                                                         |
| ------ | ---------------------------------- | ------------------------------------------------------------------- |
| GET    | `/profiles/{userId}`               | Gets a user profile (with follower/following counts)                |
| PUT    | `/profiles`                        | Updates the current user's `displayName` and `bio`                  |
| POST   | `/profiles/add-photo`              | Uploads a photo (`multipart/form-data`, field `file`) to Cloudinary |
| GET    | `/profiles/{userId}/photos`        | Lists a user's photos                                               |
| DELETE | `/profiles/{photoId}/photos`       | Deletes one of your photos (not the main photo)                     |
| PUT    | `/profiles/{photoId}/setMain`      | Sets one of your photos as the main (avatar) photo                  |
| POST   | `/profiles/{userId}/follow`        | Follows/unfollows a user                                            |
| GET    | `/profiles/{userId}/follow-list`   | `predicate=followers` (default) or `predicate=followings`           |
| GET    | `/profiles/{userId}/activities`    | A user's activities: `filter=past`, `filter=hosting`, or upcoming ones they attend (default) |

## Real-time Comments (SignalR)

The `CommentHub` is mapped at **`/comments`** (outside the `/api` prefix) and requires authentication.

1. Connect to `/comments?activityId={id}` with the access token (the client sends it as `access_token`).
2. On connect, the server adds the connection to the activity's group and sends `LoadComments` with the existing comments.
3. Call `SendComment` with `{ activityId, body }`. The server saves the comment and broadcasts `ReceiveComment` to everyone in the group.

## Error Handling

- **Validation:** FluentValidation validators run through a MediatR pipeline behavior (`ValidationBehavior`) before each handler. A failure throws a `ValidationException`, which `ExceptionMiddleware` turns into a `400` `ValidationProblemDetails` response listing the errors per field.
- **Results:** handlers return a `Result<T>`; `BaseApiController.HandleResult` maps it to `200`, `400` or `404`.
- **Exceptions:** `ExceptionMiddleware` catches any other unhandled exception and returns a `500` JSON `AppException` (`statusCode`, `message`, and `details` with the stack trace in Development only).
