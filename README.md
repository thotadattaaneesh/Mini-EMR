# Mini-EMR (Electronic Medical Record)

A simplified full-stack Electronic Medical Record system that allows clinic administrators to manage patient records, and allows patients to securely log in to view their health data.

## Features

### 👨‍⚕️ Administrator Portal (`/admin`)
- **Dashboard View:** See a master list of all registered patients.
- **Patient Management:** Create, Read, Update, and Delete patients.
- **Medical Records:** Add and manage Appointments and Prescriptions for any patient.
- **No Authentication Required:** For the sake of this assignment, the admin portal is intentionally open and bypasses token checks.

### 🏥 Patient Portal (`/`)
- **Secure Authentication:** JWT-based login, signup, and secure HttpOnly cookie session management.
- **Personal Dashboard:** View upcoming appointments (7 days) and prescriptions due for refill.
- **History:** View 3-month appointment history and full prescription history.
- **Profile Settings:** Patients can securely update their personal details and change their password (requires old password verification).
- **Protected Data:** Patients can only see and manage their *own* data.

---

## Technology Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Vanilla CSS Modules (`admin.module.css`, `portal.module.css`)
- **Database:** SQLite
- **ORM:** Prisma
- **Authentication:** Custom JWT (JSON Web Tokens) with HttpOnly cookies
- **API Documentation:** Swagger UI / OpenAPI 3.0

---

## Database Schema

The SQLite database is managed by Prisma and contains 3 primary models:

1. **User (Patient)**
   - `id` (Int): Primary Key
   - `name` (String): Full Name
   - `email` (String): Unique email address
   - `password` (String): Bcrypt hashed password
   - *Relations:* One-to-Many with Appointments and Prescriptions.

2. **Appointment**
   - `id` (Int): Primary Key
   - `provider` (String): Name of the doctor/provider
   - `datetime` (DateTime): Scheduled date and time
   - `repeat` (String): "none", "weekly", or "monthly"
   - `userId` (Int): Foreign Key to User

3. **Prescription**
   - `id` (Int): Primary Key
   - `medication` (String): Name of drug (e.g. Diovan, Lexapro)
   - `dosage` (String): Amount per dose (e.g. 50mg)
   - `quantity` (Int): Number of pills
   - `refill_on` (DateTime): Date of next refill
   - `refill_schedule` (String): "none" or "monthly"
   - `userId` (Int): Foreign Key to User

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup the Database
Generate the Prisma client and push the schema to the SQLite database:
```bash
npx prisma generate
npx prisma db push
```

### 3. Start the Development Server
```bash
npm run dev
```

### 4. Access the Application
- **Patient Portal (Login/Signup):** [http://localhost:3000](http://localhost:3000)
- **Admin Dashboard:** [http://localhost:3000/admin](http://localhost:3000/admin)
- **Swagger API Docs:** [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

## API Documentation

The complete REST API is documented using OpenAPI (Swagger). Once the app is running, navigate to `/api-docs` to interact with the endpoints.

**Note on Swagger Authentication:** 
To test patient-specific endpoints, use the `/api/auth/login` endpoint to receive an `accessToken`. Scroll to the top of the Swagger page, click the green **Authorize** button, and paste your token. This will automatically attach it as a Bearer token to all subsequent requests.
