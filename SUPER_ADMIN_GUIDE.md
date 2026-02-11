# Super Admin Capabilities - Complete Guide

## 🏫 School Management Features

The Super Admin panel provides comprehensive multi-school management capabilities. Here's everything you can do:

---

## ✅ Core Capabilities

### 1. **Create a New School**

- **How**: Click "Add New School" button
- **What you provide**:
  - School name\*
  - School address
  - Contact email\*
  - Contact phone
  - Admin credentials (name, email, password)\*
  - Educational levels (KG, Primary, JHS)
- **What happens automatically**:
  ✅ School record created with unique ID  
  ✅ Admin user account created  
  ✅ **Auto-seeded Classes** based on selected levels:
  - **KG**: KG 1, KG 2
  - **Primary**: Class 1-6
  - **JHS**: JHS 1-3

  ✅ **Auto-seeded GES Default Subjects** per level:
  - **KG**: Language & Literacy, Numeracy, Environmental Studies, Creative Arts, OWOP, Physical Development, RME
  - **Primary**: English, Mathematics, Science, OWOP, Creative Arts, RME, PE, Ghanaian Language, Computing/ICT
  - **JHS**: English, Mathematics, Integrated Science, Social Studies, RME, Computing, Career Technology, Creative Arts & Design, Ghanaian Language, French

  ✅ Default grading system configured  
  ✅ School marked as active

---

### 2. **Edit School Details**

- **How**: Click the "Edit" button on any school card
- **What you can edit**:
  - School name
  - School address
  - Contact email
  - Contact phone
  - **School Status** (Active/Inactive toggle)
- **What's protected**:
  - School ID (immutable)
  - Existing students, teachers, classes, and subjects
  - Historical data and records

---

### 3. **Activate / Deactivate a School**

- **How**:
  - Method 1: Use the "Block/Unblock" button on school card
  - Method 2: Edit school and toggle the "School Status" switch
- **Active School**:
  - ✅ All users can log in (admins, teachers, students)
  - ✅ Full functionality available
  - ✅ Shows green "Active" badge
- **Inactive/Blocked School**:
  - ❌ No users from this school can log in
  - ❌ School appears with red "Blocked" badge
  - ✅ All data is preserved
  - ✅ Can be reactivated anytime

---

### 4. **Delete a School (Soft Delete)**

- **How**: Click the "Delete" button on school card
- **Confirmation Required**: Yes, with warning dialog
- **What is Soft Delete?**
  - School is marked as `deleted: true`
  - School automatically becomes inactive
  - `deleted_at` timestamp recorded
  - School disappears from Super Admin view
  - **All data is preserved** in the database
- **What happens to users?**
  - ❌ Admins cannot log in
  - ❌ Teachers cannot log in
  - ❌ Students cannot log in
- **Can it be recovered?**
  - Yes, technically (requires database access)
  - Soft delete ensures data safety
  - Hard delete is NOT implemented for safety

---

## 📊 Dashboard Statistics

The Super Admin sees real-time stats:

- **Total Schools**: Count of non-deleted schools
- **Active Schools**: Count of schools with `active: true`
- **Total Students**: All students across all schools
- **Total Teachers**: All teachers across all schools

---

## 🔍 Search & Filter

### Search

- Search schools by name
- Real-time filtering as you type

### Filter Options

- **All Schools**: Shows all non-deleted schools
- **Active Only**: Shows only active schools
- **Blocked Only**: Shows only inactive/blocked schools

---

## 🎨 School Card Display

Each school card shows:

- School name
- Address
- Number of students
- Number of teachers
- Number of admins
- Status badge (Active/Blocked)
- Action buttons (Edit, Block/Unblock, View, Delete)

---

## 🔐 Access Control

### Login Credentials

```
Email: superadmin@system.com
Password: superadmin123
```

### Permission Level

- **Super Admin**: System-wide access, multi-school management
- **School Admin**: Single school only
- **Teacher**: Assigned classes only
- **Student**: Own records only

---

## 🗃️ Database Schema

### School Object Structure

```javascript
{
  id: "SCH_001",
  name: "School Name",
  address: "Full Address",
  contact_email: "admin@school.com",
  contact_phone: "+123456789",
  active: true,           // false when blocked
  deleted: false,         // true when soft deleted
  deleted_at: null,       // timestamp when deleted
  settings: {
    currentTerm: "1st Term",
    academicYear: "2024/2025",
    gradingSystem: [...],
    toggles: {...}
  }
}
```

---

## ⚡ Auto-Seeding Details

### GES Classes by Level

| Level   | Classes Auto-Created                                 |
| ------- | ---------------------------------------------------- |
| KG      | KG 1, KG 2                                           |
| Primary | Class 1, Class 2, Class 3, Class 4, Class 5, Class 6 |
| JHS     | JHS 1, JHS 2, JHS 3                                  |

### GES Subjects by Level

#### Kindergarten (KG)

1. Language & Literacy (LIT)
2. Numeracy (NUM)
3. Environmental Studies (ENV)
4. Creative Arts (ART)
5. Our World Our People (OWOP)
6. Physical Development (PHY)
7. Religious & Moral Education (RME)

#### Primary

1. English Language (ENG)
2. Mathematics (MATH)
3. Science (SCI)
4. Our World Our People (OWOP)
5. Creative Arts (ART)
6. Religious & Moral Education (RME)
7. Physical Education (PE)
8. Ghanaian Language (GHA)
9. Computing / ICT (ICT)

#### Junior High School (JHS)

1. English Language (ENG)
2. Mathematics (MATH)
3. Integrated Science (SCI)
4. Social Studies (SOC)
5. Religious & Moral Education (RME)
6. Computing (COM)
7. Career Technology (CAT)
8. Creative Arts & Design (CAD)
9. Ghanaian Language (GHA)
10. French (FRE) - Inactive by default

---

## 🚀 Usage Examples

### Example 1: Adding a New School

1. Click "Add New School"
2. Enter: "Springfield Academy"
3. Select levels: Primary, JHS
4. Enter admin credentials
5. Submit
6. **Result**: School created with 9 classes (Class 1-6, JHS 1-3) and all relevant subjects

### Example 2: Temporarily Blocking a School

1. Find school in grid
2. Click "Block" button
3. Confirm action
4. **Result**: All logins from that school are disabled, data preserved

### Example 3: Editing School Contact Info

1. Click "Edit" on school card
2. Update email: newemail@school.com
3. Update phone: +1234567890
4. Save changes
5. **Result**: School contact info updated immediately

---

## ⚠️ Important Notes

1. **Soft Delete is Permanent from UI**: Once deleted, schools cannot be restored from the UI
2. **Data Preservation**: Deleted schools remain in database for audit/recovery
3. **Cascade Effect**: Blocking a school blocks ALL users (admins, teachers, students)
4. **Auto-Seed**: Subjects and classes are created based on GES curriculum
5. **Validation**: School name and contact email are required fields

---

## 🛠️ Technical Implementation

### File Structure

```
super-admin.html         # Super Admin UI
js/app.js               # Backend controller (fetchSuperAdminData)
js/storage.js           # Database layer
```

### API Actions

- `stats` - Get dashboard statistics
- `schools` - List all schools with counts
- `edit_school` - Update school details
- `toggle_school` - Activate/deactivate school
- `delete_school` - Soft delete school

---

**Last Updated**: February 11, 2026  
**Version**: 2.1  
**Author**: Super Admin Team
