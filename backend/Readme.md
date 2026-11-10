# Backend (.NET)

REST API for the Activities platform, built with .NET 10 and PostgreSQL. For the architecture, database setup and migrations, see the [main README](../Readme.md).

## Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download) (check with `dotnet --version`)
- PostgreSQL running locally, with a database and user created (see [Database Setup](../Readme.md#database-setup-postgresql-on-linux))
- A [Cloudinary](https://cloudinary.com/) account (for photo uploads)
- (Optional) VS Code with the **C# Dev Kit** extension

## How to Run

All commands are run from the `backend/` folder.

### 1. Configure the settings

Set the database connection string with User Secrets:

```sh
dotnet user-secrets init -p API
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=activities_db;Username=backend_user;Password=your_password" -p API
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

The API starts at **http://localhost:5001**. Use `--launch-profile https` to serve it at `https://localhost:5001` instead. On startup it applies any pending migrations and seeds sample data automatically.

> CORS only allows the frontend at `http://localhost:5173` / `https://localhost:5173`.

### 4. Test the endpoints (optional)

Import the Insomnia collection in [`../assets`](../assets) to try the API requests.
