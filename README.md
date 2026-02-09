# HR Dashboard - Full Stack Application

A modern HR Analytics Dashboard with React frontend and PHP/MySQL backend.

## 🚀 Features

- ✅ Complete CRUD operations (Create, Read, Update, Delete)
- 📊 Real-time dashboard analytics
- 🎂 Upcoming birthdays tracker
- 🏆 Top performers leaderboard
- 📈 Department distribution charts
- 💾 MySQL database with stored procedures
- 🔄 RESTful API

## 📋 Prerequisites

- Node.js (v14 or higher)
- PHP (v7.4 or higher)
- MySQL/MariaDB (v5.7 or higher)
- XAMPP/WAMP/MAMP or any PHP server with MySQL

## 🛠️ Installation & Setup

### Step 1: Database Setup

1. **Start your MySQL server** (via XAMPP, WAMP, or standalone MySQL)

2. **Import the database:**
   - Open phpMyAdmin (usually at `http://localhost/phpmyadmin`)
   - Click on "Import" tab
   - Choose the `hr_dashboard.sql` file
   - Click "Go" to import

   This will:
   - Create the `hr_dashboard` database
   - Create the `employees` table
   - Insert 20 initial employee records
   - Create all CRUD stored procedures
   - Create analytics views

### Step 2: Backend Setup (PHP API)

1. **Copy the `backend` folder to your PHP server directory:**

   For XAMPP (Windows):
   ```
   Copy backend/ to C:/xampp/htdocs/hr_dashboard/backend/
   ```

   For XAMPP (Mac):
   ```
   Copy backend/ to /Applications/XAMPP/htdocs/hr_dashboard/backend/
   ```

   For MAMP (Mac):
   ```
   Copy backend/ to /Applications/MAMP/htdocs/hr_dashboard/backend/
   ```

2. **Configure database credentials:**
   - Open `backend/config/database.php`
   - Update the following if needed:
     ```php
     private $host = "localhost";
     private $db_name = "hr_dashboard";
     private $username = "root";      // Your MySQL username
     private $password = "";          // Your MySQL password
     ```

3. **Test the API:**
   - Open your browser and go to:
     ```
     http://localhost/hr_dashboard/backend/api/employees.php?action=all
     ```
   - You should see a JSON response with all employees

### Step 3: Frontend Setup (React)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure API endpoint:**
   - Open `src/services/api.ts`
   - Update the `API_BASE_URL` if your backend is at a different location:
     ```typescript
     const API_BASE_URL = 'http://localhost/hr_dashboard/backend/api/employees.php';
     ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   - Navigate to `http://localhost:5173` (or the port shown in terminal)

## 📁 Project Structure

```
hr_dashboard/
├── backend/
│   ├── api/
│   │   └── employees.php       # Main API endpoint
│   └── config/
│       └── database.php        # Database connection
├── src/
│   ├── services/
│   │   └── api.ts             # API service layer
│   ├── HRDashboard.tsx        # Main dashboard component
│   ├── App.tsx                # App wrapper
│   ├── App.css                # App styles
│   ├── index.css              # Global styles
│   └── main.tsx               # Entry point
├── hr_dashboard.sql           # Database schema & data
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Get All Employees
```
GET /backend/api/employees.php?action=all
```

### Get Employee by ID
```
GET /backend/api/employees.php?action=employee&id=ID-001
```

### Get Employees by Department
```
GET /backend/api/employees.php?action=department&dept=ADMIN
```

### Get Employees by Status
```
GET /backend/api/employees.php?action=status&status=Permanent
```

### Get Dashboard Statistics
```
GET /backend/api/employees.php?action=stats
```

### Get Upcoming Birthdays
```
GET /backend/api/employees.php?action=birthdays
```

### Get Next Employee ID
```
GET /backend/api/employees.php?action=next-id
```

### Create Employee
```
POST /backend/api/employees.php?action=create
Content-Type: application/json

{
  "id": "ID-021",
  "name": "DELA CRUZ, JUAN P.",
  "department": "Administrative Division (ADMIN)",
  "birthDate": "1990-05-15",
  "performanceRating": 4.2,
  "trainingHours": 95,
  "status": "Permanent"
}
```

### Update Employee
```
PUT /backend/api/employees.php
Content-Type: application/json

{
  "id": "ID-021",
  "name": "DELA CRUZ, JUAN PEDRO",
  "department": "Crisis Intervention Unit (CIU)",
  "birthDate": "1990-05-15",
  "performanceRating": 4.5,
  "trainingHours": 100,
  "status": "Permanent"
}
```

### Delete Employee
```
DELETE /backend/api/employees.php?id=ID-021
```

## 🐛 Troubleshooting

### "Connection Error" in Dashboard

1. **Check if MySQL is running:**
   - Open XAMPP/WAMP Control Panel
   - Make sure MySQL/MariaDB is started

2. **Verify the database was imported:**
   - Open phpMyAdmin
   - Check if `hr_dashboard` database exists
   - Check if `employees` table has data

3. **Check database credentials:**
   - Open `backend/config/database.php`
   - Verify username and password match your MySQL setup

4. **Verify API is accessible:**
   - Open browser to `http://localhost/hr_dashboard/backend/api/employees.php?action=all`
   - Should see JSON data, not an error

### CORS Errors

The PHP API already includes CORS headers. If you still see CORS errors:

1. Make sure you're accessing the React app via the development server (http://localhost:5173)
2. Don't open the HTML file directly in the browser

### "Failed to fetch" Errors

1. **Check the API URL in `src/services/api.ts`**
2. **Ensure your PHP server is running**
3. **Test the API directly in browser**

## 💡 Usage

### Adding an Employee
1. Click the "+ ADD EMPLOYEE" button
2. Fill in the employee details
3. Click "ADD EMPLOYEE"
4. The employee will be saved to the database

### Editing an Employee
1. Click the "EDIT" button on any employee card (if you add this feature)
2. Modify the details
3. Click "SAVE CHANGES"

### Deleting an Employee
1. Click "EDIT" on an employee
2. Click the "DELETE" button
3. Confirm the deletion

## 🔒 Security Notes

For production use, consider:
- Using environment variables for database credentials
- Implementing user authentication
- Adding input validation and sanitization
- Using prepared statements (already implemented)
- Adding rate limiting
- Using HTTPS

## 📝 Database Stored Procedures

The following stored procedures are available:

- `sp_create_employee()` - Create new employee
- `sp_get_all_employees()` - Get all employees
- `sp_get_employee_by_id()` - Get employee by ID
- `sp_get_employees_by_department()` - Filter by department
- `sp_get_employees_by_status()` - Filter by status
- `sp_update_employee()` - Update employee
- `sp_delete_employee()` - Delete employee
- `sp_get_dashboard_stats()` - Get analytics
- `sp_get_upcoming_birthdays()` - Get upcoming birthdays
- `sp_generate_next_id()` - Generate next ID
- `sp_update_all_ages()` - Update all employee ages

## 🎨 Customization

### Changing Colors
Edit the gradient colors in `src/HRDashboard.tsx` and `src/index.css`

### Adding More Statistics
Add new queries in `backend/api/employees.php` in the `getDashboardStats()` function

### Modifying the Database
Update `hr_dashboard.sql` and re-import, or use SQL ALTER statements

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

---

**Made with ❤️ using React + PHP + MySQL**
