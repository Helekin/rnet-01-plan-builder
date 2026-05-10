# Activities Backend (.NET)

This project corresponds to the backend of the Activities web platform, developed with `.NET` on `Linux/Windows/Mac` using Visual Studio Code.

The system is designed to manage activities where users can register, browse, and participate in events. It handles user authentication, activity creation and management, attendee registration, and all the processes required to support a community-driven activities platform.

## Project Structure

The backend is organized following a Clean Architecture approach with separate layers to ensure high maintainability, testability, and scalability:

- **API** → Web API controllers and application entry point. Exposes the REST endpoints and handles HTTP requests/responses.
- **Application** → Business logic, use cases, DTOs, validators, and application-level services. Coordinates the flow between the API and the domain.
- **Domain** → Entities, domain rules, and core business logic. The heart of the application, independent from any external concern.
- **Persistence** → Data access layer, database context, repositories, configurations, and migrations.

This separation facilitates maintenance, unit testing, and future integrations.

## Prerequisites

1. Have Visual Studio Code installed.
2. Install the **C# Dev Kit** extension for IntelliSense, debugging, and project management.
3. Have the **.NET SDK** installed. Verify with:

```sh
dotnet --version
```

4. A database engine (e.g., PostgreSQL or SQL Server, local or cloud-hosted such as Railway).
5. Configure the required environment variables (connection string, JWT secrets, etc.).

## Step-by-Step Guide

### 1. Create the project folder

```sh
mkdir backend
cd backend
```

### 2. Create the main solution

The solution (`.sln`) organizes the different projects under a single environment:

```sh
dotnet new sln
```

This will generate a `backend.sln` file.

### 3. Create the projects

#### API

Entry point of the application (controllers and initial configuration):

```sh
dotnet new webapi -n API --controllers
```

#### Domain

Contains the entities and core domain rules:

```sh
dotnet new classlib -n Domain
```

#### Application

Contains the business logic, use cases, DTOs, and application services:

```sh
dotnet new classlib -n Application
```

#### Persistence

Contains data access logic, the database context, repositories, and migrations:

```sh
dotnet new classlib -n Persistence
```

### 4. Add the projects to the solution

```sh
dotnet sln add API
dotnet sln add Application
dotnet sln add Domain
dotnet sln add Persistence
```

### 5. Add references between projects

The references should follow the dependency rule of Clean Architecture: outer layers depend on inner layers, never the other way around.

```sh
# From the API project
cd API
dotnet add reference ../Application
dotnet add reference ../Persistence
cd ..

# From the Application project
cd Application
dotnet add reference ../Domain
cd ..

# From the Persistence project
cd Persistence
dotnet add reference ../Domain
cd ..
```

> **Note:** `Domain` should not reference any other project. It must remain independent of frameworks and infrastructure concerns.

### 6. Restore dependencies and build

```sh
dotnet restore
dotnet build
```

### 7. Run the application

From the root folder, run the API project:

```sh
dotnet run --project API
```

Or, alternatively, navigate into the API folder:

```sh
cd API
dotnet watch run
```

The `watch` command will automatically reload the application when changes are detected.

## Migrations and Database

Every time changes are made to the domain entities (for example, adding fields, relationships, or new tables), the following steps must be executed to update the database.

### 1. Install Entity Framework Core tools (only the first time)

```sh
dotnet tool install --global dotnet-ef
```

### 2. Create a new migration

From the root folder of the project (where the `.sln` file is located):

```sh
dotnet ef migrations add MigrationName -p Persistence -s API
```

### 3. Apply the migration to the database

```sh
dotnet ef database update -p Persistence -s API
```

### 4. Remove the last migration (if needed)

```sh
dotnet ef migrations remove -p Persistence -s API
```

## Important Notes

### Deployment on Railway

When running migrations in a production environment, you need to connect to the Railway container or environment from the terminal.

Before executing the database update command (`dotnet ef database update`), temporarily replace the local connection variables with Railway's external variables (for example, the production `ConnectionString`).

This ensures that the migration is correctly applied to the cloud database.

### Important

Once the migration has been executed, restore the internal (local) variables in the `.env` file or in the project configurations.

This prevents unnecessary connections to the production database and therefore avoids additional consumption or costs on Railway.

### Environment Variables

It is recommended to manage sensitive configuration (connection strings, JWT secrets, third-party API keys) through:

- `appsettings.Development.json` for local development (excluded from version control).
- User Secrets for local sensitive data: `dotnet user-secrets init -p API`
- Environment variables in production environments.

### Useful Commands

| Command                          | Description                    |
| -------------------------------- | ------------------------------ |
| `dotnet build`                   | Compiles the entire solution   |
| `dotnet run --project API`       | Runs the API project           |
| `dotnet watch run --project API` | Runs with hot reload           |
| `dotnet test`                    | Runs all tests in the solution |
| `dotnet clean`                   | Removes build artifacts        |
