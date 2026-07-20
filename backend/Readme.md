# Activities Backend (.NET)

This project corresponds to the backend of the Activities web platform, developed with `.NET` on `Linux/Windows/Mac` using Visual Studio Code.

The system is designed to manage activities where users can register, browse, and participate in events. It handles user authentication, activity creation and management, attendee registration, and all the processes required to support a community-driven activities platform.

## Table of Contents

- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Step-by-Step Guide](#step-by-step-guide)
- [Database Setup (PostgreSQL on Linux)](#database-setup-postgresql-on-linux)
- [Migrations and Database](#migrations-and-database)
- [Important Notes](#important-notes)
- [Useful Commands](#useful-commands)

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

4. **PostgreSQL** installed locally, or access to a cloud-hosted instance (e.g., Railway). See [Database Setup](#database-setup-postgresql-on-linux) below.
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

### 6. Add the PostgreSQL EF Core provider

From the `Persistence` project (this is where `DbContext` and configurations live):

```sh
cd Persistence
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
cd ..
```

If the `API` project also needs the design-time tooling reference (for `dotnet ef` commands), add it there as well:

```sh
cd API
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL.Design
cd ..
```

### 7. Restore dependencies and build

```sh
dotnet restore
dotnet build
```

### 8. Run the application

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

## Database Setup (PostgreSQL on Linux)

These steps cover installing PostgreSQL and creating the local database on a Debian/Ubuntu-based distribution (e.g., Ubuntu, Linux Mint). If you're on a Fedora-based distro, replace `apt` with `dnf`.

### 1. Install PostgreSQL

```sh
sudo apt update
sudo apt install postgresql postgresql-contrib -y
```

Verify the installation:

```sh
psql --version
```

### 2. Start and enable the PostgreSQL service

```sh
sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo systemctl status postgresql
```

### 3. Switch to the `postgres` system user

PostgreSQL creates a default OS user called `postgres` with admin rights over the database server.

```sh
sudo -i -u postgres
```

### 4. Access the PostgreSQL prompt

```sh
psql
```

### 5. Create a database user (role) for the project

Replace `backend_user` and `your_password` with your own values:

```sql
CREATE USER backend_user WITH PASSWORD 'your_password';
```

### 6. Create the database

```sql
CREATE DATABASE activities_db OWNER backend_user;
```

### 7. Grant privileges (if needed)

```sql
GRANT ALL PRIVILEGES ON DATABASE activities_db TO backend_user;
```

### 8. Exit psql and the postgres user session

```sql
\q
```

```sh
exit
```

### 9. Test the connection with the new user

```sh
psql -h localhost -U backend_user -d activities_db
```

Enter `your_password` when prompted. If you get an authentication error, check `pg_hba.conf` (see note below).

### 10. (Optional) Allow password authentication for local connections

If step 9 fails with a `peer authentication failed` error, edit the PostgreSQL host-based authentication file:

```sh
sudo nano /etc/postgresql/*/main/pg_hba.conf
```

Change the `local` and `127.0.0.1` lines to use `md5` (or `scram-sha-256`) instead of `peer`/`ident`, then restart:

```sh
sudo systemctl restart postgresql
```

### 11. Set the connection string

Add the connection string to `appsettings.Development.json` (excluded from version control), or store it via User Secrets:

```sh
dotnet user-secrets init -p API
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=activities_db;Username=backend_user;Password=your_password" -p API
```

Or directly in `appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=activities_db;Username=backend_user;Password=your_password"
  }
}
```

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

## Useful Commands

### .NET

| Command                          | Description                    |
| -------------------------------- | ------------------------------ |
| `dotnet build`                   | Compiles the entire solution   |
| `dotnet run --project API`       | Runs the API project           |
| `dotnet watch run --project API` | Runs with hot reload           |
| `dotnet test`                    | Runs all tests in the solution |
| `dotnet clean`                   | Removes build artifacts        |

### PostgreSQL / psql

| Command                               | Description                                            |
| ------------------------------------- | ------------------------------------------------------ |
| `sudo systemctl start postgresql`     | Starts the PostgreSQL service                          |
| `sudo systemctl stop postgresql`      | Stops the PostgreSQL service                           |
| `sudo systemctl status postgresql`    | Checks service status                                  |
| `psql -h localhost -U <user> -d <db>` | Connects to a database                                 |
| `\l`                                  | Lists all databases (inside psql)                      |
| `\c <db_name>`                        | Connects to a specific database (inside psql)          |
| `\dt`                                 | Lists all tables in the current database (inside psql) |
| `\du`                                 | Lists all roles/users (inside psql)                    |
| `\q`                                  | Exits the psql prompt                                  |
| `DROP DATABASE activities_db;`        | Deletes the database (inside psql)                     |
