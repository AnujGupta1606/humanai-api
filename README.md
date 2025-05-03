# HumanChain AI Safety Incident Log

A full-stack application for logging, analyzing, and managing AI safety incidents.

## Features

### Backend (Flask + SQLite)
- **Incident CRUD API**: Create, read, update, and delete incidents with authentication.
- **Automated Email Alerts**: Sends email to admin for high-severity incidents.
- **Incident Analytics Endpoint**: `/incidents/analytics` provides statistics (total, by severity, by month).
- **Swagger UI**: API documentation at `/apidocs`.
- **CORS Enabled**: Allows frontend-backend communication.

### Frontend (React + Material-UI)
- **Modern Dashboard UI**: Clean, responsive interface using Material-UI.
- **Incident List**: Card-based display of all incidents with severity chips and timestamps.
- **Create, Read, Delete Incidents**: Add and remove incidents directly from the dashboard.
- **Live Analytics Dashboard**: Interactive charts (bar and pie) for incidents by month and severity using Chart.js, auto-refreshing after incident changes.
- **Error Handling & Loading States**: User-friendly feedback for API errors and loading.

## How to Run

1. **Backend**
   - Install dependencies: `pip install -r requirements.txt`
   - Start server: `python app.py` (default port 10000)

2. **Frontend**
   - Go to `frontend` folder
   - Install dependencies: `npm install`
   - Start app: `npm start` (default port 3000)

## API Authentication
- Username: `admin`
- Password: `password123`

## Tech Stack
- Python, Flask, SQLite, SQLAlchemy, Flasgger, Flask-CORS
- React, Material-UI, Chart.js, Axios

---


