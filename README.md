# Medicare - MERN Stack Doctor Appointment & Healthcare Management Platform

Medicare is a production-ready, full-stack medical consulting and appointment scheduling platform. It integrates role-based dashboards (Patient, Doctor, Admin), secure Stripe checkout flows, real-time messaging using Socket.io, and a custom AI Symptom Checker.

---

## Tech Stack

### Frontend
*   **React.js & Vite** - High-speed SPA scaffolding
*   **Tailwind CSS** - Glassmorphism cards and layout styling
*   **React Router DOM** - Dynamic nested routing and dashboard shells
*   **Framer Motion** - Fluid page transitions and micro-interactions
*   **Lucide React** - Modern, sleek icon vectors
*   **Axios** - Token injection request handlers
*   **React Hook Form** - Form validation bindings
*   **React Hot Toast** - Non-blocking overlay notifications
*   **Chart.js & React-Chartjs-2** - Metric analytics visual graphs
*   **React Calendar** - Appointment slot schedule maps

### Backend
*   **Node.js & Express.js** - Rest API framework
*   **MongoDB & Mongoose** - Database modelling schemas
*   **JWT & BcryptJS** - Authentication tokens and password encryption
*   **Multer** - Clinical certificate uploads handler
*   **Socket.io** - Real-time patient-doctor messaging channels
*   **Stripe SDK** - Safe card checkout validations
*   **Nodemailer** - Verification and password reset SMTP client
*   **Helmet & Rate Limiter** - Rest APIs protection and safety headers

---

## Features

1.  **Multi-Role Dashboards**:
    *   **Patient**: Search doctors by specialization or city, pick availability slots, pay via Stripe, view records, print prescriptions, calculate BMI.
    *   **Doctor**: Update slot availability hours, approve/reject consultations, compose prescriptions (dosage, morning/evening checkboxes), view earnings charts.
    *   **Admin**: Platform telemetry (patient growth charts, revenues), approve/reject practitioner license uploads.
2.  **AI Symptom Checker**: Keyword-based medical parsing matching descriptions to fields and suggesting active doctors.
3.  **Real-time Chat**: Immediate messaging channels between doctors and patients using WebSockets.
4.  **Prescription Printer**: Clean CSS-print layouts printable as clinical PDF slips.
5.  **Offline Fallbacks**: Automatically fallbacks to mock Stripe/Mail/DB configurations if local tokens are not set.

---

## Folder Structure

```
Medical/
├── backend/
│   ├── config/          # Database, Cloudinary, and Stripe configs
│   ├── controllers/     # REST request controllers
│   ├── middleware/      # Auth, uploads, roles, and errors
│   ├── models/          # Mongoose collections
│   ├── routes/          # Express end points
│   ├── utils/           # Nodemailer Ethereal fallback scripts
│   ├── validators/      # Sanitizers
│   └── server.js        # Boot entry
└── frontend/
    ├── src/
    │   ├── animations/  # Framer variants
    │   ├── components/  # Buttons, Glass Cards, Skeletons
    │   ├── context/     # Themes (dark mode) & Auth state
    │   ├── layouts/     # Navbar, Footer, Sidebars
    │   ├── pages/       # Landing, directory, dashboards
    │   ├── services/    # Axios API
    │   └── main.jsx     # Vite index root
```

---

## Environment Variables

### Backend (`/backend/.env`)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/medicare
JWT_SECRET=supersecretjwtkey123!
JWT_EXPIRE=30d
STRIPE_SECRET_KEY=sk_test_... # Left mock to simulate checkout
FRONTEND_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
EMAIL_HOST=
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASS=
NODE_ENV=development
```

---

## Installation & Running Locally

### Prerequisites
*   Node.js (v18+)
*   MongoDB (Optional, fallback modes operate offline)

### Step 1: Clone and install backend
```bash
cd backend
npm install
npm run dev
```

### Step 2: Install frontend and launch dev server
```bash
cd ../frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your web browser.

---

## API Documentation

### Auth
*   `POST /api/auth/register` - SignUp patient/doctor
*   `POST /api/auth/login` - Login, return JWT
*   `POST /api/auth/verify-email` - Validate email verification link

### Consultations
*   `POST /api/appointments/book` - Set up a clinical consultation
*   `PUT /api/appointments/:id/status` - Complete, cancel, or reschedule

### AI Services
*   `POST /api/ai/symptom-check` - Feed symptom terms to recommendations

---

## Deployment Guide

### Backend (Render)
1. Add a new **Web Service** on Render.
2. Link your Git repository.
3. Build command: `npm install`
4. Start command: `node server.js`
5. Configure Environment Variables in the Render Dashboard.

### Frontend (Vercel)
1. Import the `/frontend` subfolder to Vercel.
2. The `vercel.json` SPA rewrite will automatically manage routing.
3. Configure `VITE_API_URL` pointing to your Render domain.

---

## License
MIT License.
