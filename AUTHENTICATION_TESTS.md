# Authentication Testing Guide

## 🧪 Quick Test Scenarios

### ✅ Test 1: Super Admin Login

```
1. Navigate to: http://localhost/general_report_card/login.html
2. Click "Staff" tab
3. Enter:
   Email: superadmin@system.com
   Password: superadmin123
4. Click "Login"

Expected Result: ✅ Redirect to super-admin.html
Console: 🔐 Auth Check: User role="super_admin", Allowed roles=[super_admin]
         ✅ Authorized: "super_admin" has access
```

---

### ✅ Test 2: School Admin Login

```
1. Navigate to: login.html
2. Click "Staff" tab
3. Enter:
   Email: admin@school.com
   Password: password123
4. Click "Login"

Expected Result: ✅ Redirect to admin-dashboard.html
Console: 🔐 Auth Check: User role="admin", Allowed roles=[admin]
         ✅ Authorized: "admin" has access
```

---

### ✅ Test 3: Teacher Login

```
1. Navigate to: login.html
2. Click "Staff" tab
3. Enter:
   Email: teacher@school.com
   Password: password123
4. Click "Login"

Expected Result: ✅ Redirect to teacher-portal.html
Console: 🔐 Auth Check: User role="teacher", Allowed roles=[teacher, admin]
         ✅ Authorized: "teacher" has access
```

---

### ✅ Test 4: Student Login

```
1. Navigate to: login.html
2. Click "Student" tab
3. Enter:
   Index Number: ST_001
4. Click "View My Report"

Expected Result: ✅ Redirect to student-report.html
Console: 🔐 Auth Check: User role="student", Allowed roles=[student]
         ✅ Student authenticated
```

---

### ❌ Test 5: Invalid Credentials

```
1. Navigate to: login.html
2. Click "Staff" tab
3. Enter:
   Email: wrong@email.com
   Password: wrongpassword
4. Click "Login"

Expected Result: ❌ Alert: "Login Failed: Invalid credentials"
                 ❌ Stays on login.html
```

---

### ❌ Test 6: Unauthorized Route Access (Teacher trying Super Admin)

```
1. Login as teacher (teacher@school.com / password123)
2. Wait for redirect to teacher-portal.html
3. Manually navigate to: http://localhost/general_report_card/super-admin.html

Expected Result:
- ❌ Alert: "Unauthorized Access
           You do not have permission to view this page.
           Required role: super_admin
           Your role: teacher"
- 🔄 Redirect to login.html
Console: ❌ Unauthorized: "teacher" tried to access page requiring [super_admin]
```

---

### ❌ Test 7: No Session Access

```
1. Open browser in incognito/private mode
2. Directly navigate to: super-admin.html

Expected Result:
- 🔄 Immediate redirect to login.html
Console: ⚠️ No user session found. Redirecting to login.
```

---

### ❌ Test 8: Deactivated Admin Login

```
Setup:
1. Login as super admin
2. Navigate to Admin Management section
3. Deactivate an admin (click the deactivate icon)

Test:
1. Logout
2. Try to login with deactivated admin credentials

Expected Result:
- ❌ Alert: "Login Failed: Your account has been deactivated. Contact your administrator."
- ❌ Stays on login.html
```

---

### ❌ Test 9: Blocked School Login

```
Setup:
1. Login as super admin
2. Block a school (click "Block" button on school card)

Test:
1. Logout
2. Try to login with any user from that school (admin/teacher/student)

Expected Result:
- ❌ Alert: "Login Failed: Your school is currently inactive. Contact administration."
- ❌ Stays on login.html
```

---

### ✅ Test 10: School Admin Trying Teacher Portal

```
1. Login as admin (admin@school.com / password123)
2. Manually navigate to: teacher-portal.html

Expected Result:
- ✅ Access granted (admins can access teacher portals)
Console: 🔐 Auth Check: User role="admin", Allowed roles=[teacher, admin]
         ✅ Authorized: "admin" has access
```

---

## 🔍 Console Logging Verification

Open browser DevTools (F12) → Console tab to see authentication logs:

### Successful Login

```
🔐 Auth Check: User role="super_admin", Allowed roles=[super_admin]
✅ Authorized: "super_admin" has access
```

### Failed Authentication

```
⚠️ No user session found. Redirecting to login.
```

### Unauthorized Access

```
🔐 Auth Check: User role="teacher", Allowed roles=[super_admin]
❌ Unauthorized: "teacher" tried to access page requiring [super_admin]
```

### Student Authentication

```
🔐 Auth Check: User role="student", Allowed roles=[student]
✅ Student authenticated
```

---

## 📊 Test Results Checklist

| Test | Scenario               | Expected             | Status |
| ---- | ---------------------- | -------------------- | ------ |
| 1    | Super Admin Login      | ✅ Access granted    | ☐      |
| 2    | School Admin Login     | ✅ Access granted    | ☐      |
| 3    | Teacher Login          | ✅ Access granted    | ☐      |
| 4    | Student Login          | ✅ Access granted    | ☐      |
| 5    | Invalid Credentials    | ❌ Login failed      | ☐      |
| 6    | Unauthorized Route     | ❌ Access denied     | ☐      |
| 7    | No Session             | ❌ Redirect to login | ☐      |
| 8    | Deactivated Admin      | ❌ Login failed      | ☐      |
| 9    | Blocked School         | ❌ Login failed      | ☐      |
| 10   | Admin → Teacher Portal | ✅ Access granted    | ☐      |

---

## 🎯 Testing Tools

### Browser DevTools Commands

```javascript
// Check current session
JSON.parse(sessionStorage.getItem("currentUser"));

// Clear session (force logout)
sessionStorage.removeItem("currentUser");

// View full database
Storage.get();

// Check if user is admin
const user = JSON.parse(sessionStorage.getItem("currentUser"));
console.log(user.role === "admin");
```

---

## 🔧 Debugging Tips

### Issue: Stuck in redirect loop

```javascript
// Clear session storage
sessionStorage.clear();
// Reload page
location.reload();
```

### Issue: Can't see console logs

```
1. Open DevTools (F12)
2. Go to Console tab
3. Ensure "Preserve log" is checked
4. Clear console and retry
```

### Issue: Authentication seems cached

```javascript
// Clear both session and local storage
sessionStorage.clear();
localStorage.clear();
// Hard reload
Ctrl + Shift + R (or Cmd + Shift + R on Mac)
```

---

## 📝 Test Report Template

```
Date: __________
Tester: __________

Super Admin Login: [ PASS / FAIL ]
Admin Login: [ PASS / FAIL ]
Teacher Login: [ PASS / FAIL ]
Student Login: [ PASS / FAIL ]
Invalid Credentials: [ PASS / FAIL ]
Unauthorized Access: [ PASS / FAIL ]
Deactivated User: [ PASS / FAIL ]
Blocked School: [ PASS / FAIL ]

Notes:
____________________________________________
____________________________________________
```

---

**Last Updated**: February 11, 2026
**Testing Version**: 2.0
**All Tests Should PASS**: ✅
