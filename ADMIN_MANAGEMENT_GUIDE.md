# School Admin Management - Complete Guide

## 📋 Overview

The Super Admin panel now includes comprehensive **School Admin Management** functionality, allowing you to manage all school administrator accounts across the entire system.

---

## ✅ Core Capabilities

### 1. **Create a School Admin Account**

**How to Access**: Click the "Add New Admin" button in the Admin Management section

**Required Information**:

- Admin Name \*
- Email Address \* (must be unique)
- Password \* (minimum 6 characters)
- Assign to School \* (dropdown of active schools)

**What Happens**:

- ✅ New admin user account created with unique ID
- ✅ Admin assigned to specified school
- ✅ Admin automatically set as active
- ✅ Creation timestamp recorded
- ✅ **Multi-School Prevention**: System checks if email already exists
- ✅ **Validation**: Cannot assign to deleted or inactive schools

**Multi-School Policy**:

- By default, one email can only be an admin for ONE school
- System prevents duplicates and multi-school assignments
- This ensures clear accountability and prevents conflicts

---

### 2. **Assign Admin to a School**

**Methods**:

- **During Creation**: Select school from dropdown when creating new admin
- **Edit Existing**: Change school assignment via Edit Admin modal

**School Dropdown Shows**:

- Only active, non-deleted schools
- School name clearly displayed
- Current assignment highlighted in edit mode

**Validation**:

- Cannot assign to deleted schools
- Cannot assign to inactive/blocked schools
- School must exist in the system

---

### 3. **Activate / Deactivate Admin**

**Two Methods**:

#### Method 1: Quick Toggle (from table)

- Click the activate/deactivate icon (✓ or ✗) in Actions column
- Instant status change with confirmation
- Visual feedback in status badge

#### Method 2: Via Edit Modal

- Click "Edit" button on admin row
- Use the "Admin Status" toggle switch
- Save changes to apply

**Active Admin**:

- ✅ Can log in to their assigned school
- ✅ Full admin privileges for their school
- ✅ Green "Active" badge displayed

**Inactive/Deactivated Admin**:

- ❌ Cannot log in to the system
- ❌ No access to any admin functions
- ❌ Red "Inactive" badge displayed
- ✅ Account data preserved
- ✅ Can be reactivated anytime

---

### 4. **Reset Admin Password (Simulated)**

**How to Reset**:

1. Click the "Reset Password" icon (key symbol) in Actions column
2. Enter new password (min 6 characters)
3. Confirm password (must match)
4. Submit to update

**What Happens**:

- Password updated immediately in database
- Timestamp of password reset recorded
- Admin will use new password on next login
- **Important**: Admin is NOT automatically notified (simulated system)

**Security Notes**:

- Passwords are currently stored in plain text (prototype system)
- Production systems should use bcrypt or similar hashing
- Consider implementing password reset via email in production

---

### 5. **Prevent One Admin Managing Multiple Schools**

**How It Works**:

- System checks email uniqueness during admin creation
- If email already exists, creation is blocked
- Error message: "Email already exists"
- This ensures one admin = one school relationship

**Override Capability**:

- Super Admin can manually edit admin's school assignment
- Useful for transferring admins between schools
- Still maintains one-school-per-admin rule

**Why This Matters**:

- Clear accountability
- Prevents data confusion
- Ensures proper school-level access control
- Simplifies audit trails

---

## 🔍 Search & Filter Features

### **Search**

- Search by admin name
- Search by admin email
- Real-time filtering as you type
- Case-insensitive search

### **Filter by School**

- Dropdown shows all activeSchools
- Select any school to see only its admins
- "All Schools" option to view everyone

### **Filter by Status**

- **All Status**: Shows both active and inactive
- **Active**: Shows only active admins
- **Inactive**: Shows only deactivated admins

### **Combined Filters**

- All filters work together
- Search + School + Status
- Powerful for finding specific admins

---

## 📊 Admin Table Display

Each admin row shows:

| Column         | Information                                            |
| -------------- | ------------------------------------------------------ |
| **Admin Name** | Name with avatar circle (first letter), Admin ID below |
| **Email**      | Contact email address                                  |
| **School**     | Assigned school name in blue badge                     |
| **Status**     | Active (green) or Inactive (red) badge                 |
| **Actions**    | Edit, Reset Password, Activate/Deactivate buttons      |

---

## 🎯 Use Cases & Examples

### Example 1: Creating New Admin for a School

```
Scenario: New school "Riverside Academy" needs an admin

Steps:
1. Click "Add New Admin"
2. Enter: Name = "Jane Smith"
3. Enter: Email = "jane@riversideacademy.com"
4. Enter: Password = "welcome123"
5. Select: School = "Riverside Academy"
6. Click "Create Admin"

Result: Jane can now log in and manage Riverside Academy
```

### Example 2: Transferring Admin to Another School

```
Scenario: Move admin from School A to School B

Steps:
1. Click "Edit" on admin row
2. Change school dropdown to School B
3. Save changes

Result: Admin now manages School B instead of School A
```

### Example 3: Temporarily Suspending an Admin

```
Scenario: Admin needs temporary suspension

Steps:
1. Click deactivate icon (✗) in Actions
2. Confirm action

Result: Admin cannot log in until reactivated
```

### Example 4: Admin Forgot Password

```
Scenario: Admin cannot remember password

Steps:
1. Click "Reset Password" icon (key)
2. Enter new password: "newpass123"
3. Confirm password: "newpass123"
4. Submit

Result: Admin uses "newpass123" to log in next time
```

---

## 🔐 Security & Validation

### **Email Validation**

- Must be valid email format
- Must be unique across all users
- Cannot create duplicate emails

### **Password Requirements**

- Minimum 6 characters
- Confirmation required on reset
- Stored as plain text (prototype only!)

### **School Assignment Validation**

- School must exist
- School cannot be deleted
- School cannot be inactive/blocked

### **Multi-School Prevention**

- One email = one admin account
- System blocks re-use of email addresses
- Clear error messages if conflict detected

---

## 🗃️ Database Schema

### Admin User Object

```javascript
{
  id: "ADM_001",
  school_id: "SCH_001",
  name: "Admin Name",
  email: "admin@school.com",
  password: "password123",      // Plain text (prototype only)
  role: "admin",
  active: true,                 // false when deactivated
  created_at: 1234567890,       // Timestamp of creation
  updated_at: 1234567890,       // Timestamp of last update
  password_reset_at: 1234567890 // Timestamp of last password reset
}
```

---

## ⚡ Quick Reference

| Action              | Button/Icon             | Location                              |
| ------------------- | ----------------------- | ------------------------------------- |
| Create Admin        | "Add New Admin" (green) | Top right of Admin Management section |
| Edit Admin          | Pencil icon (blue)      | Actions column in admin table         |
| Reset Password      | Key icon (purple)       | Actions column in admin table         |
| Activate/Deactivate | ✓/✗ icon (green/red)    | Actions column in admin table         |
| Search              | Search input            | Above admin table                     |
| Filter by School    | School dropdown         | Above admin table                     |
| Filter by Status    | Status dropdown         | Above admin table                     |

---

## ⚠️ Important Notes

1. **Multi-School Policy**: Strictly enforced - one admin per school only
2. **Password Reset**: Admin is NOT notified - manual communication required
3. **Deactivation**: Immediate effect - admin cannot log in
4. **Email Uniqueness**: System-wide - no duplicate emails allowed
5. **School Validation**: Cannot assign to deleted or inactive schools
6. **Data Preservation**: Deactivated admins retain all data

---

## 🚀 API Actions

The following actions are available via `fetchSuperAdminData()`:

| Action                 | Parameters                               | Returns                            |
| ---------------------- | ---------------------------------------- | ---------------------------------- |
| `create_admin`         | name, email, password, school_id         | success, admin_id or error message |
| `edit_admin`           | admin_id, name, email, school_id, active | success or error message           |
| `toggle_admin`         | admin_id, active                         | success or error message           |
| `reset_admin_password` | admin_id, new_password                   | success or error message           |

---

## 📁 File Structure

```
super-admin.html          # UI and frontend logic
js/app.js                 # Backend controller (fetchSuperAdminData)
js/storage.js             # Database layer
```

---

**Last Updated**: February 11, 2026  
**Version**: 2.0  
**Feature**: School Admin Management
