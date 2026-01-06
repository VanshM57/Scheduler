# RTU College Class Scheduler

A comprehensive class scheduling application for RTU (Rajasthan Technical University) that helps students and teachers manage their class schedules efficiently.

## Features

### User Management
- **Email Validation**: Only `@rtu.ac.in` email addresses are allowed for registration and login
- **Role-Based Access**: 
  - **Students**: Can view schedules, filter by branch/semester, and see special events
  - **Teachers**: Can view, edit, cancel their own classes, and create special events
- **Simplified Registration**: Only requires name, email, and password (default role: student)

### Period Management
The system manages three types of periods:

1. **Original Period**: Master schedule containing:
   - Subject name
   - Teacher (user reference)
   - Room number
   - Start and end time
   - Semester, branch, batch
   - Day of week (Monday-Saturday)

2. **Today Period**: Daily schedule loaded at 12:00 AM from Original Period based on the current day
   - Includes update/cancellation status
   - Tracks who made changes

3. **Past Period**: Historical records of all past periods
   - Migrated from TodayPeriod at 11:59 PM daily
   - Contains complete history of class changes

### Student Dashboard
- View all periods for the selected date
- Filter by semester and branch
- Date picker to view past and future schedules
- See special events relevant to their branch/semester
- View class cancellation and update notifications

### Teacher Dashboard
- View only their assigned classes
- Edit class details (time, room, etc.)
- Cancel classes with notifications
- Create special events for students
- See update history

### Special Events
- Teachers can create additional events
- Can target specific branches/semesters or all students
- Events can be scheduled for today or future dates
- Students see relevant events based on their branch/semester

## Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **JWT** for authentication
- **node-cron** for scheduled tasks
- **bcrypt** for password hashing

### Frontend
- **React** with Vite
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Axios** for API calls
- **React Toastify** for notifications
- **Lucide React** for icons

## Project Structure

```
class/
├── backend/
│   ├── controllers/      # Request handlers
│   ├── models/          # MongoDB schemas
│   ├── route/           # API routes
│   ├── middlewares/     # Authentication & validation
│   ├── utils/           # Helper functions
│   ├── db/              # Database connection
│   ├── corn.js          # Cron jobs
│   └── index.js         # Server entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context providers
│   │   └── App.jsx      # Main app component
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
DB_CONNECTION_STRING=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_jwt_secret_key
PORT=3000
```

4. Start the server:
```bash
npm start
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
VITE_BASE_URL=http://localhost:3000/api/v1
```

4. Start the development server:
```bash
npm run dev
```

## API Endpoints

### User Routes (`/api/v1/user`)
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /logout` - User logout
- `GET /getUser` - Get current user info

### Today Period Routes (`/api/v1/todayPeriod`)
- `GET /getPeriods` - Get periods (supports query params: date, branch, sem)
- `POST /updatePeriod` - Update a period (teacher only)
- `POST /cancelPeriod` - Cancel a period (teacher only)
- `POST /addTodayPeriod` - Add new period (teacher only)

### Original Period Routes (`/api/v1/originalPeriod`)
- `POST /add-original-period` - Add master period (admin only)
- `POST /update-original-period` - Update master period (admin only)
- `DELETE /delete-original-period` - Delete master period (admin only)

### Special Event Routes (`/api/v1/specialEvent`)
- `POST /create` - Create special event (teacher only)
- `GET /getEvents` - Get special events (supports query params: date, branch, sem)
- `POST /update` - Update special event (teacher only, own events)
- `POST /delete` - Delete special event (teacher only, own events)

## Cron Jobs

The system uses two scheduled tasks:

1. **12:00 AM Daily**: 
   - Clears TodayPeriod
   - Loads periods from OriginalPeriod based on current day

2. **11:59 PM Daily**:
   - Migrates all TodayPeriod entries to PastPeriod
   - Preserves complete history of class changes

## Key Features Implementation

### Email Domain Validation
- Backend validation in User model and controllers
- Frontend validation in Login and Signup forms
- Only `@rtu.ac.in` emails allowed

### Role-Based Access Control
- Students can view schedules and events
- Teachers can edit/cancel only their own classes
- Middleware enforces role-based permissions

### Date-Based Period Retrieval
- Today: Fetches from TodayPeriod
- Past dates: Fetches from PastPeriod
- Future dates: Calculates from OriginalPeriod based on day of week

### Special Events
- Teachers can create events for specific branches/semesters
- Events can target all students
- Students see relevant events based on their profile

## UI/UX Features

- Modern, dark-themed interface
- Responsive design for all devices
- Smooth animations and transitions
- Real-time notifications
- Intuitive date picker and filters
- Clear visual indicators for cancelled classes
- Beautiful card-based layout for periods

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Token blacklisting for logout
- Role-based authorization
- Email domain validation
- Input validation and sanitization

## Future Enhancements

- Admin panel for managing original periods
- Email notifications for class changes
- Calendar view for schedules
- Export schedule to PDF
- Mobile app version
- Integration with college ERP system

## Contributing

This is a college project. For contributions or issues, please contact the development team.

## License

This project is developed for educational purposes at RTU.
