# 🗄️ Create New Database in Hostinger - Step by Step

## 📋 Recommended Credentials

Use these when creating your database:

```
Database Name: school_report_card
Username:      school_admin
Password:      [Generate strong password in Hostinger]
```

**Note:** Hostinger will add prefix `u957056558_` automatically!

---

## 🎯 Step-by-Step Guide

### Step 1: Access MySQL Databases

1. **Login to Hostinger:** https://hpanel.hostinger.com
2. **Navigate to:** Databases → MySQL Databases
3. You'll see the MySQL Databases management page

---

### Step 2: Create Database

**In the "Create New Database" section:**

```
┌─────────────────────────────────────────┐
│ Create New Database                     │
├─────────────────────────────────────────┤
│ Database Name: school_report_card       │
│                                         │
│ [Create] button                         │
└─────────────────────────────────────────┘
```

**What happens:**

- Hostinger creates: `u957056558_school_report_card`
- The prefix `u957056558_` is added automatically
- **Write down the FULL name!**

---

### Step 3: Create MySQL User

**In the "MySQL Users" section:**

```
┌─────────────────────────────────────────┐
│ Create New User                         │
├─────────────────────────────────────────┤
│ Username: school_admin                  │
│ Password: [Generate Password] or        │
│           [Enter your own]              │
│                                         │
│ Password Strength: ████████ Strong      │
│                                         │
│ [Create] button                         │
└─────────────────────────────────────────┘
```

**What happens:**

- Hostinger creates: `u957056558_school_admin`
- Password is generated (or you create one)
- **COPY THE PASSWORD IMMEDIATELY!**

**Password Tips:**

- Click "Generate Password" for a strong one
- Or create your own: Min 12 chars, mix of upper/lower/numbers/symbols
- Example: `Sch00l@Rep0rt#2026!`

---

### Step 4: Link User to Database

**In the "Add User to Database" section:**

```
┌─────────────────────────────────────────┐
│ Add User to Database                    │
├─────────────────────────────────────────┤
│ User:     u957056558_school_admin       │
│ Database: u957056558_school_report_card │
│                                         │
│ [Add] button                            │
└─────────────────────────────────────────┘
```

**After clicking Add, grant privileges:**

```
┌─────────────────────────────────────────┐
│ Manage User Privileges                  │
├─────────────────────────────────────────┤
│ ☑ ALL PRIVILEGES                        │
│                                         │
│ [Make Changes] button                   │
└─────────────────────────────────────────┘
```

**Important:** Check "ALL PRIVILEGES" to give full access!

---

### Step 5: Enable Remote Access

**Navigate to:** Databases → Remote MySQL

```
┌─────────────────────────────────────────┐
│ Add New Host                            │
├─────────────────────────────────────────┤
│ IP Address: 154.161.105.219             │
│ Database:   u957056558_school_report_card│
│                                         │
│ [Add Host] button                       │
└─────────────────────────────────────────┘
```

**Your IP:** `154.161.105.219`

**Alternative for testing:**

- Use `%` for "Any Host" (less secure, testing only)

---

## 📝 Record Your Credentials

After completing the steps above, fill this out:

```
┌─────────────────────────────────────────────────────┐
│  YOUR HOSTINGER DATABASE CREDENTIALS                │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Hostname:  srv1711.hstgr.io                       │
│  (or IP):   82.197.82.92                           │
│                                                     │
│  Database:  u957056558_________________            │
│             (fill in the full name from Hostinger) │
│                                                     │
│  Username:  u957056558_________________            │
│             (fill in the full name from Hostinger) │
│                                                     │
│  Password:  _______________________________        │
│             (the password you created/generated)   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Keep this information secure!**

---

## 🔧 Update Configuration File

After creating the database, update `config/prod_config.php`:

```php
<?php
$db_host = 'srv1711.hstgr.io';
$db_name = 'u957056558_school_report_card';  // ← Your full database name
$db_user = 'u957056558_school_admin';        // ← Your full username
$db_pass = 'YOUR_ACTUAL_PASSWORD';           // ← Your password
```

---

## ✅ Verification Checklist

Before proceeding, verify:

- [ ] Database created in Hostinger
- [ ] Full database name copied (with u957056558\_ prefix)
- [ ] MySQL user created
- [ ] Full username copied (with u957056558\_ prefix)
- [ ] Password saved securely
- [ ] User linked to database with ALL PRIVILEGES
- [ ] Remote MySQL access enabled (IP added)
- [ ] `config/prod_config.php` updated with actual credentials

---

## 🧪 Test Connection

After setup, test the connection:

**Via Browser:**

```
http://localhost/general_report_card/test_connection.php
```

**Expected Output:**

```
✅ SUCCESS! Connected to remote database

Database Info:
- Tables found: 0
- Character set: utf8mb4
- MySQL version: 8.0.x

⚠️ No tables found. You may need to run database_schema.sql
```

---

## 📊 Import Database Schema

Once connected, import the schema:

### Option 1: Via Hostinger phpMyAdmin

1. **Login to Hostinger cPanel**
2. **Open phpMyAdmin**
3. **Select database:** `u957056558_school_report_card`
4. **Click "Import" tab**
5. **Choose file:** `database_schema.sql`
6. **Click "Go"**

### Option 2: Via Command Line

```bash
mysql -h srv1711.hstgr.io -u u957056558_school_admin -p u957056558_school_report_card < database_schema.sql
```

---

## 🌱 Seed Initial Data

After importing schema, seed the database:

**Via Browser:**

```
http://localhost/general_report_card/install.php
```

This creates:

- Default school
- Super admin account
- Sample users and data

---

## 🎯 Final Test

After everything is set up:

1. **Open:** `http://localhost/general_report_card/login.html`
2. **Check console (F12):** Should see "✅ Storage: Connected to remote database"
3. **Login as admin:** admin@school.com / password123
4. **Verify:** Dashboard loads with data
5. **Test:** Make changes, refresh page, changes persist

---

## 🐛 Troubleshooting

### "Connection refused"

- ✅ Verify IP `154.161.105.219` is added in Remote MySQL
- ✅ Try using IP `82.197.82.92` instead of hostname

### "Access denied"

- ✅ Check username has `u957056558_` prefix
- ✅ Check password is correct (no extra spaces)
- ✅ Verify user has ALL PRIVILEGES on database

### "Unknown database"

- ✅ Check database name has `u957056558_` prefix
- ✅ Verify database exists in Hostinger cPanel
- ✅ Check spelling is exact

---

## 📞 Need Help?

**Hostinger Support:**

- 24/7 Live Chat in hPanel
- Knowledge Base: https://support.hostinger.com/

**Common Questions:**

- "How to create MySQL database" → Search Hostinger KB
- "How to enable remote MySQL" → Check Hostinger docs
- "How to reset MySQL password" → Available in cPanel

---

**Good luck with your database setup!** 🚀

Once you have your credentials, update `config/prod_config.php` and run `test_connection.php` to verify everything works!
