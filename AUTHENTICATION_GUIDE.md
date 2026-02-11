# Authentication System - Complete Guide

## 🔐 Overview

The system implements **role-based authentication** with frontend simulation. All authentication is handled client-side using sessionStorage and localStorage for data persistence.

---

## 👥 User Roles

### 1. **Super Admin** (`super_admin`)

- **Access Level**: System-wide
- **Can Access**: `super-admin.html`
- **Permissions**:
  - Manage all schools
  - Create/Edit/Delete schools
  - Manage school admins
  - View system-wide statistics
  - No school assignment required

### 2. **Admin** (`admin`)

- **Access Level**: Single school
- **Can Access**: `admin-dashboard.html`
- **Permissions**:
  - Manage students in assigned school
  - Manage teachers in assigned school
  - Manage classes and subjects
  - Approve student results
  - Configure school settings
  - Must be assigned to a school

### 3. **Teacher** (`teacher`)

- **Access Level**: Assigned classes only
- **Can Access**: `teacher-portal.html`
- **Permissions**:
  - View assigned classes
  - Enter student grades
  - View student lists
  - Update class scores
  - Must be assigned to a school

### 4. **Student** (`student`)

- **Access Level**: Own records only
- **Can Access**: `student-report.html`
- **Permissions**:
  - View own report card
  - Print report card
  - View approved results only
  - Identified by index number (not email)

---

## 🚪 Login Flow

### Student Login

```
1. User opens login.html
2. Clicks "Student" tab
3. Enters index number (e.g., ST_001)
4. System validates:
   ✅ Student exists
   ✅ School is active
5. Redirects to: student-report.html
```

### Staff Login (Admin, Teacher, Super Admin)

```
1. User opens login.html
2. Clicks "Staff" tab
3. Enters email and password
4. System validates:
   ✅ User exists
   ✅ Credentials match
   ✅ User is active (not deactivated)
   ✅ School is active (for non-super admins)
5. Redirects based on role:
   - super_admin → super-admin.html
   - admin → admin-dashboard.html
   - teacher → teacher-portal.html
```

---

## 🛡️ Authentication Functions

### `login(type, credentials)`

**Purpose**: Authenticates user and creates session

**Parameters**:

- `type`: 'student' or 'staff'
- `credentials`: Object with login data
  - For students: `{ id: 'ST_001' }`
  - For staff: `{ email: 'admin@school.com', password: 'password123' }`

**Validation Checks**:

1. **Credentials Match**: Email/password or index number
2. **User Active**: Admin/teacher must not be deactivated
3. **School Active**: School must not be blocked or deleted
4. **Super Admin Exception**: Super admin bypasses school checks

**Returns**:

```javascript
{
  success: true/false,
  message: 'Error message if failed',
  redirect: 'page-to-redirect.html',
  user: { ...user object }
}
```

**Session Storage**:

- Stores user object in `sessionStorage.getItem('currentUser')`
- Persists only for browser session
- Cleared on logout or browser close

---

### `checkAuth(allowedRoles)`

**Purpose**: Protects routes by verifying user role

**Parameters**:

- `allowedRoles`: Array of permitted roles
  - Example: `['super_admin']`
  - Example: `['admin', 'teacher']`

**Behavior**:

1. Reads user from sessionStorage
2. If no user → redirect to login
3. If user role not in allowedRoles → show error and redirect to login
4. If authorized → return user object

**Console Logging**:

- ⚠️ Warning when no session found
- 🔐 Info on every auth check
- ✅ Success when authorized
- ❌ Error when unauthorized

**Error Message**:

```
Unauthorized Access

You do not have permission to view this page.
Required role: super_admin or admin
Your role: teacher
```

---

### `logout()`

**Purpose**: Ends user session and returns to login

**Behavior**:

1. Removes `currentUser` from sessionStorage
2. Redirects to `login.html`
3. No confirmation required

---

## 🔒 Route Protection

### Protected Pages

| Page                   | Allowed Roles      | Check Location |
| ---------------------- | ------------------ | -------------- |
| `super-admin.html`     | `super_admin`      | Line 504       |
| `admin-dashboard.html` | `admin`            | Line 898       |
| `teacher-portal.html`  | `teacher`, `admin` | Line 211       |
| `student-report.html`  | `student`          | Line 60        |

### Implementation Example

```javascript
// At the top of protected page
const user = checkAuth(["super_admin"]);
if (user) {
  // User is authorized, render page
  document.getElementById("user-name").textContent = user.name;
}
```

---

## 🚫 Access Control Rules

### Rule 1: No Session = No Access

- If `sessionStorage.getItem('currentUser')` is null
- User is redirected to login.html
- No exceptions

### Rule 2: Wrong Role = Denied

- If user.role not in allowedRoles array
- Error alert shown
- Redirected to login.html
- Attempt logged to console

### Rule 3: Inactive User = Blocked

- If admin or teacher has `active: false`
- Login fails with message: "Your account has been deactivated"
- Cannot access any staff pages

### Rule 4: Blocked School = No Login

- If school has `active: false` or `deleted: true`
- Login fails for all users from that school
- Message: "Your school is currently inactive"
- Super admin exception: can still login

### Rule 5: Super Admin = Bypass

- Super admin does NOT need a school assignment
- Super admin bypasses school status checks
- Can login even if no schools exist

---

## 🔍 Security Validation Matrix

| Check              | Super Admin | Admin | Teacher | Student |
| ------------------ | ----------- | ----- | ------- | ------- |
| Email/Password     | ✅          | ✅    | ✅      | ❌      |
| Index Number       | ❌          | ❌    | ❌      | ✅      |
| User Active        | 🟡 Always   | ✅    | ✅      | ❌      |
| School Exists      | ❌          | ✅    | ✅      | ✅      |
| School Active      | ❌          | ✅    | ✅      | ✅      |
| School Not Deleted | ❌          | ✅    | ✅      | ✅      |
| Role Permission    | ✅          | ✅    | ✅      | ✅      |

**Legend**:

- ✅ Required check
- ❌ Not applicable
- 🟡 Special handling

---

## 🧪 Testing Authentication

### Test Super Admin Access

```javascript
// credentials.html or login page
Email: superadmin@system.com
Password: superadmin123
Expected: Redirect to super-admin.html
```

### Test Admin Access

```javascript
Email: admin@school.com
Password: password123
Expected: Redirect to admin-dashboard.html
```

### Test Teacher Access

```javascript
Email: teacher@school.com
Password: password123
Expected: Redirect to teacher-portal.html
```

### Test Student Access

```javascript
Index Number: ST_001
Expected: Redirect to student-report.html
```

### Test Blocked Admin

```javascript
1. Super admin deactivates an admin
2. Admin tries to login
Expected: "Your account has been deactivated"
```

### Test Blocked School

```javascript
1. Super admin blocks a school
2. Any user from that school tries to login
Expected: "Your school is currently inactive"
```

### Test Unauthorized Access

```javascript
1. Login as teacher
2. Manually navigate to super-admin.html
Expected: Alert + redirect to login
Console: ❌ Unauthorized error logged
```

---

## ⚙️ Implementation Details

### Session Management

```javascript
// Store user session
sessionStorage.setItem("currentUser", JSON.stringify(userObject));

// Retrieve user session
const user = JSON.parse(sessionStorage.getItem("currentUser"));

// Clear session
sessionStorage.removeItem("currentUser");
```

### Role-Based Redirect Logic

```javascript
let redirect = "teacher-portal.html"; // Default
if (user.role === "super_admin") redirect = "super-admin.html";
else if (user.role === "admin") redirect = "admin-dashboard.html";
```

---

## 🔧 Files Involved

### Core Authentication Files

- `js/app.js` - Authentication functions (login, checkAuth, logout)
- `login.html` - Login interface
- `js/storage.js` - User data storage and retrieval

### Protected Pages

- `super-admin.html` - Super Admin panel
- `admin-dashboard.html` - School Admin dashboard
- `teacher-portal.html` - Teacher portal
- `student-report.html` - Student report card

---

## ⚠️ Security Warnings

### Current Implementation (Prototype)

❌ **Passwords stored in plain text**
❌ **No password hashing**
❌ **Client-side only authentication**
❌ **No JWT or secure tokens**
❌ **SessionStorage vulnerable to XSS**
❌ **No rate limiting**
❌ **No HTTPS enforcement**

### Production Recommendations

✅ **Implement bcrypt password hashing**
✅ **Use HTTP-only cookies**
✅ **Add JWT tokens**
✅ **Server-side validation**
✅ **HTTPS required**
✅ **Add CSRF protection**
✅ **Implement rate limiting**
✅ **Add 2FA for admins**

---

## 📊 Authentication Flow Diagram

```
┌─────────────┐
│  Login Page │
└─────┬───────┘
      │
      ▼
┌──────────────────┐
│ Enter Credentials│
└─────┬────────────┘
      │
      ▼
┌──────────────────┐    NO    ┌─────────────┐
│ Valid User?      ├─────────►│ Show Error  │
└─────┬────────────┘          └─────────────┘
      │ YES
      ▼
┌──────────────────┐    NO    ┌─────────────┐
│ User Active?     ├─────────►│ Deactivated │
└─────┬────────────┘          └─────────────┘
      │ YES
      ▼
┌──────────────────┐    NO    ┌─────────────┐
│ School Active?   ├─────────►│ Blocked     │
└─────┬────────────┘          └─────────────┘
      │ YES
      ▼
┌──────────────────┐
│ Create Session   │
└─────┬────────────┘
      │
      ▼
┌──────────────────┐
│ Redirect by Role │
└──────────────────┘
      │
      ├─► super_admin → super-admin.html
      ├─► admin → admin-dashboard.html
      ├─► teacher → teacher-portal.html
      └─► student → student-report.html
```

---

**Last Updated**: February 11, 2026  
**System**: Frontend Authentication (Prototype)  
**Security Level**: Development Only - Not Production Ready
