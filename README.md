# NakaeWorks Admin Panel & Backend

Welcome to the **NakaeWorks Admin Panel and Backend** repository! This project consists of a full-stack solution designed to manage services, providers, bookings, categories, and more. 

It is divided into two primary parts:
1. **Frontend (Admin Panel):** A modern, responsive React-based admin dashboard.
2. **Backend:** A robust ASP.NET Core 8 Web API for managing business logic and data persistence.

---

## 🚀 Technologies Used

### Frontend (`/adminPanal`)
*   **Framework:** React 19 + Vite
*   **Routing:** React Router DOM
*   **Styling:** Tailwind CSS + PostCSS
*   **State / Data Fetching:** TanStack React Query + Axios
*   **Animations:** Framer Motion
*   **Icons:** Lucide React

### Backend (`/backend_net`)
*   **Framework:** .NET 8 (ASP.NET Core Web API)
*   **ORM:** Entity Framework Core
*   **Database:** PostgreSQL (with `Npgsql`)
*   **Authentication:** JWT Bearer (JSON Web Tokens)
*   **Password Hashing:** BCrypt.Net-Next
*   **API Documentation:** Swagger / OpenAPI

---

## 📁 Project Structure

```text
nakaeworksadmin/
│
├── adminPanal/                   # Frontend React Application
│   ├── src/                      # Source files (components, pages, styles)
│   ├── package.json              # Frontend dependencies and scripts
│   └── vite.config.ts            # Vite bundler configuration
│
└── backend_net/                  # Backend .NET Solution
    └── NakaeWorks.Backend/       # Main API Project
        ├── Controllers/          # API endpoint controllers (Bookings, Providers, Categories, etc.)
        ├── Models/               # Domain entities (User, Category, etc.)
        ├── DTOs/                 # Data Transfer Objects
        ├── Data/                 # ApplicationDbContext for EF Core
        └── appsettings.json      # Database connection & JWT config
```

---

## 🛠️ Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   [.NET 8 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)
*   [PostgreSQL](https://www.postgresql.org/) (Running locally or hosted)

### 1. Backend Setup

1. **Navigate to the Backend directory:**
   ```bash
   cd backend_net/NakaeWorks.Backend
   ```

2. **Configure AppSettings:**
   Update your database connection string and JWT settings in `appsettings.json` or `appsettings.Development.json`.

3. **Apply Database Migrations:**
   Ensure your PostgreSQL server is running, then apply the migrations to create the database schema:
   ```bash
   dotnet ef database update
   ```

4. **Run the API:**
   ```bash
   dotnet run
   ```
   *The API will typically be available at `http://localhost:5000` or `https://localhost:5001`. Swagger documentation can be accessed at `/swagger`.*

### 2. Frontend Setup

1. **Navigate to the Frontend directory:**
   ```bash
   cd adminPanal
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the `adminPanal` directory and add your API base URL:
   ```env
   VITE_API_BASE_URL=https://localhost:5001/api
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   *The frontend will typically be accessible at `http://localhost:5173`.*

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page or submit a Pull Request.

## 📝 License
This project is proprietary and confidential. Only authorized contributors may access or modify the codebase.
