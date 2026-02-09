# 🚀 HR Dashboard - Quick Setup Guide

## ⚡ 5-Minute Setup

### Step 1: Import Database (2 minutes)
1. Start XAMPP and run MySQL
2. Open phpMyAdmin: `http://localhost/phpmyadmin`
3. Click "Import" → Choose `hr_dashboard.sql` → Click "Go"
✅ Database ready!

### Step 2: Setup Backend (1 minute)
1. Copy the `backend` folder to your PHP server:
   - **XAMPP Windows:** `C:/xampp/htdocs/hr_dashboard/`
   - **XAMPP Mac:** `/Applications/XAMPP/htdocs/hr_dashboard/`
   
2. Test API: Open browser to:
   ```
   http://localhost/hr_dashboard/backend/api/employees.php?action=all
   ```
   You should see JSON data with employees ✅

### Step 3: Setup Frontend (2 minutes)
1. Open terminal in project folder
2. Run:
   ```bash
   npm install
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser
✅ Dashboard running!

## 🔧 Configuration

### Database Credentials (if needed)
Edit `backend/config/database.php`:
```php
private $username = "root";     // Your MySQL username
private $password = "";         // Your MySQL password
```

### API URL (if backend is elsewhere)
Edit `src/services/api.ts`:
```typescript
const API_BASE_URL = 'http://localhost/hr_dashboard/backend/api/employees.php';
```

## 📊 What You Get

✅ **20 Pre-loaded Employees**
✅ **Full CRUD Operations** (Create, Read, Update, Delete)
✅ **Real-time Dashboard Analytics**
✅ **Department Distribution Charts**
✅ **Top Performers Leaderboard**
✅ **Upcoming Birthdays Tracker**
✅ **MySQL Stored Procedures**
✅ **RESTful PHP API**

## 🎯 API Endpoints

| Action | Method | Endpoint |
|--------|--------|----------|
| Get all employees | GET | `?action=all` |
| Get employee | GET | `?action=employee&id=ID-001` |
| Get by department | GET | `?action=department&dept=ADMIN` |
| Get by status | GET | `?action=status&status=Permanent` |
| Dashboard stats | GET | `?action=stats` |
| Upcoming birthdays | GET | `?action=birthdays` |
| Next ID | GET | `?action=next-id` |
| Create employee | POST | `?action=create` |
| Update employee | PUT | (body with employee data) |
| Delete employee | DELETE | `?id=ID-001` |

## 🐛 Common Issues

**"Connection Error"**
- ✅ Check MySQL is running in XAMPP
- ✅ Check database credentials in `backend/config/database.php`
- ✅ Verify database was imported in phpMyAdmin

**"Failed to fetch"**
- ✅ Check backend folder is in `htdocs/hr_dashboard/`
- ✅ Test API URL directly in browser
- ✅ Check API URL in `src/services/api.ts`

**"Cannot GET /api/employees.php"**
- ✅ Make sure you copied the `backend` folder to htdocs
- ✅ Access via `http://localhost/hr_dashboard/backend/api/employees.php`

## 📁 Folder Structure

```
htdocs/hr_dashboard/           ← Copy here
    └── backend/
        ├── api/
        │   └── employees.php
        ├── config/
        │   └── database.php
        └── .htaccess

your_project_folder/           ← Run npm here
    ├── src/
    │   ├── services/
    │   │   └── api.ts
    │   ├── HRDashboard.tsx
    │   └── ...
    ├── hr_dashboard.sql
    └── package.json
```

## 🎉 You're Ready!

Once setup is complete, you can:
- ➕ Add new employees
- ✏️ Edit employee details
- 🗑️ Delete employees
- 📊 View real-time analytics
- 🎂 Track upcoming birthdays
- 🏆 See top performers

All data is stored in MySQL and persists between sessions!

---

**Need help?** Check the full README.md for detailed documentation.
