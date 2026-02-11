# General School Report Card System

A comprehensive school management system with multi-tenancy support, built with vanilla JavaScript and TailwindCSS.

## 🚀 Quick Start

### For Super Administrators

**Access the Super Admin Panel**: Log in to manage all schools in the system.

- **URL**: `super-admin.html`
- **Email**: `superadmin@system.com`
- **Password**: `superadmin123`

### For School Administrators

**Access your school's admin dashboard**:

- **URL**: `login.html` → Click "Staff" tab
- **Email**: `admin@school.com`
- **Password**: `password123`

### For Teachers

- **Email**: `teacher@school.com`
- **Password**: `password123`

### For Students

- **Index Number**: `ST_001` (or `ST_002`)

## 📂 System Architecture

### User Hierarchy

```
Super Admin (Multi-School Management)
    └── School Admin (Single School)
            ├── Teachers
            └── Students
```

## 🎯 Features by Role

### Super Admin

✅ View all schools in the system  
✅ Monitor total students/teachers across all schools  
✅ Add new schools with automatic setup  
✅ Block/Unblock schools temporarily  
✅ View detailed stats per school

### School Admin

✅ Manage students (add, edit, delete)  
✅ Manage teachers and assign classes  
✅ Manage classes and subjects  
✅ Review and approve student results  
✅ Configure grading system  
✅ Set academic year and term  
✅ Backup and restore school data

### Teacher

✅ View assigned classes  
✅ Enter student grades  
✅ View student lists  
✅ Update class scores

### Student

✅ View approved report card  
✅ Print report card  
✅ See grades by subject

## 📄 Key Files

| File                   | Purpose                                         |
| ---------------------- | ----------------------------------------------- |
| `super-admin.html`     | Super admin dashboard (multi-school management) |
| `admin-dashboard.html` | School admin dashboard                          |
| `teacher-portal.html`  | Teacher grade entry portal                      |
| `student-report.html`  | Student report card view                        |
| `login.html`           | Universal login page                            |
| `register.html`        | New school registration                         |
| `js/app.js`            | Main application logic and controllers          |
| `js/storage.js`        | Database layer (localStorage + MySQL sync)      |

## 🗄️ Database Structure

The system uses a JSON-based structure synchronized with MySQL:

```javascript
{
  schools: [
    {
      id: "SCH_001",
      name: "School Name",
      active: true,  // Can be set to false by super admin to block
      settings: { currentTerm, academicYear, gradingSystem }
    }
  ],
  users: [
    {
      role: "super_admin" | "admin" | "teacher",
      school_id: null | "SCH_001",  // null for super_admin
      email, password
    }
  ],
  students: [ ... ],
  classes: [ ... ],
  subjects: [ ... ]
}
```

## 🔒 Security Notes

⚠️ **Important**: This is a prototype system with client-side authentication.

- For production use, implement server-side authentication
- Hash passwords (bcrypt)
- Use HTTP-only cookies for sessions
- Implement proper access control on the backend

See `SECURITY_AUDIT.md` for detailed security analysis.

## 🔐 Authentication & Route Protection

### Role-Based Authentication

The system implements **role-based access control** with the following hierarchy:

```
┌─────────────────┐
│  Super Admin    │  ← System-wide access, no school assignment
└────────┬────────┘
         │
    ┌────▼─────┐
    │  Admin   │  ← Single school access
    └────┬─────┘
         │
    ┌────▼────────┐
    │  Teacher    │  ← Assigned classes only
    │  Student    │  ← Own records only
    └─────────────┘
```

### Login Validation

#### Staff Login (Email + Password)

- ✅ Credentials must match
- ✅ User must be active (not deactivated)
- ✅ School must be active (for admins/teachers)
- ✅ Super admin bypasses school checks

#### Student Login (Index Number)

- ✅ Index number must exist
- ✅ School must be active and not deleted

### Protected Routes

| Page                   | Allowed Roles      | Authentication Check |
| ---------------------- | ------------------ | -------------------- |
| `super-admin.html`     | `super_admin`      | ✅ Enforced          |
| `admin-dashboard.html` | `admin`            | ✅ Enforced          |
| `teacher-portal.html`  | `teacher`, `admin` | ✅ Enforced          |
| `student-report.html`  | `student`          | ✅ Enforced          |

**Unauthorized Access**: Attempting to access a protected page without proper role results in:

- ❌ Alert with error message
- 🔄 Redirect to login page
- 📝 Console error log

### Session Management

- **Storage**: `sessionStorage.getItem('currentUser')`
- **Lifetime**: Browser session only
- **Logout**: Clears session and redirects to login

For complete authentication details, see `AUTHENTICATION_GUIDE.md`.

## 📋 Documentation

- `SUPER_ADMIN_GUIDE.md` - Complete super admin feature documentation
- `ADMIN_MANAGEMENT_GUIDE.md` - School admin management features
- `AUTHENTICATION_GUIDE.md` - Complete authentication system documentation
- `AUTHENTICATION_TESTS.md` - Testing guide for all authentication scenarios
- `SECURITY_AUDIT.md` - Security analysis and recommendations
- `DEPLOY.md` - Deployment instructions
- `HOSTINGER_SETUP.md` - Hosting setup guide

## 🛠️ Technologies

- **Frontend**: HTML5, TailwindCSS, Vanilla JavaScript
- **Storage**: LocalStorage (development), MySQL (production)
- **Icons**: Ionicons
- **Charts**: Chart.js

## 🎨 Design Philosophy

- **Modern**: Gradient backgrounds, glassmorphism effects
- **Responsive**: Mobile-first design
- **Accessible**: Clear typography, good contrast
- **Professional**: Suitable for real school environments

## 📞 Support

For technical support or feature requests, contact **CorelTech**.

---

**Version**: 2.0  
**Last Updated**: February 11, 2026  
**Built by**: CorelTech
