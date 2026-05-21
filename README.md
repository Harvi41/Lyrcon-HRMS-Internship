# CoreHR - Human Resource Management System (Lyrcon HRMS Internship)

CoreHR is a comprehensive Human Resource Management System (HRMS) built during the Lyrcon Internship. It provides a centralized platform for HR professionals and administrators to manage employees, attendance, leave, payroll, recruitment, assets, and overall team performance.

## 🔗 Live Links

- **Frontend (Vercel):** [https://lyrcon-hrms-internship.vercel.app](https://lyrcon-hrms-internship.vercel.app)
- **Backend (Render):** [https://lyrcon-hrms-internship.onrender.com](https://lyrcon-hrms-internship.onrender.com)

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19 + Vite
- **Styling:** Vanilla CSS & CSS Modules (Fully Responsive)
- **HTTP Client:** Axios
- **State Management:** React Hooks

### Backend
- **Framework:** Node.js + Express.js
- **Database:** MongoDB (Mongoose)
- **Authentication:** JWT (JSON Web Tokens) & bcrypt for password hashing
- **Environment:** dotenv

---

## ✨ Features

- **Role-Based Access Control:** Secure login system supporting multiple roles (`hr`, `super admin`, etc.).
- **Employee Overview:** Manage employee details and directories.
- **Attendance & Leave Management:** Track employee attendance records and manage leave requests efficiently.
- **Payroll Management:** Centralized system for tracking payroll and salaries.
- **Recruitment:** Manage ongoing hiring pipelines and candidate tracking.
- **Asset Management:** Keep track of company assets, add comments, and report damages.
- **Announcements & Team Monitoring:** Broadcast announcements and monitor team performance metrics.
- **Responsive Dashboard:** Fully responsive interface gracefully adapting from mobile devices to extra-large desktop screens.

---

## 🚀 Getting Started (Local Development)

Follow these steps to set up the project locally on your machine.

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas URI)

### 1. Clone the repository
```bash
git clone https://github.com/ZalaNidhish/Lyrcon-HRMS-Internship.git
cd Lyrcon-HRMS-Internship
```

### 2. Backend Setup
```bash
cd Backend
npm install
```
**Environment Variables for Backend:**
Create a `.env` file inside the `Backend` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
```
**Start the Backend Server:**
```bash
npm start
# The backend will run on http://localhost:5000
```
*(On first run, the backend will auto-seed default HR and Admin accounts into your database).*

### 3. Frontend Setup
Open a new terminal window/tab:
```bash
cd Frontend
npm install
```
**Environment Variables for Frontend:**
Create a `.env` file inside the `Frontend` directory for local development:
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_ENV=development
```
**Start the Frontend Server:**
```bash
npm run dev
# The frontend will run on http://localhost:5173
```

---

## 📂 Project Structure

```text
Lyrcon-HRMS-Internship/
├── Backend/                 # Node.js + Express Backend
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # API request handlers (auth, employee, asset, etc.)
│   │   ├── middlewares/     # Auth and validation middlewares
│   │   ├── models/          # Mongoose schemas (User, Employee, Asset, etc.)
│   │   ├── routes/          # Express route definitions
│   │   └── seed/            # Database seeders (roles, default users)
│   ├── app.js               # Backend entry point
│   └── package.json         
│
└── Frontend/                # React + Vite Frontend
    ├── src/
    │   ├── assets/          # Global styles and static assets
    │   ├── components/      # Reusable React components (Authform, HRDashboardLayout)
    │   ├── lib/             # Utilities (Axios instance configuration)
    │   ├── Pages/           # Top-level Page components
    │   ├── App.jsx          # Main application routing and session management
    │   └── main.jsx         # React application entry point
    ├── vite.config.js       # Vite bundler configuration
    ├── .env                 # Local environment variables
    ├── .env.production      # Production environment variables
    └── package.json         
```

---

## 🤝 Default Credentials

When running the application locally against a fresh database, the backend seeder will automatically create these default accounts:

- **HR:** `hr@lyrcon.com`
- **Admin:** `admin@lyrcon.com`

---

*Developed as part of the Lyrcon Internship Program by Zala Nidhish.*