# 🌐 Remote Database Configuration - Quick Start

## ✅ What I've Set Up For You

I've created everything you need to connect to your **Hostinger MySQL database**:

### 📁 Files Created

1. **`config/prod_config.php`** - Production database configuration
2. **`test_connection.php`** - Connection testing script
3. **`setup_remote_db.html`** - Interactive setup wizard
4. **`REMOTE_DATABASE_SETUP.md`** - Complete documentation
5. **`.gitignore`** - Protects sensitive files from Git

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Open Setup Wizard

```
http://localhost/general_report_card/setup_remote_db.html
```

### Step 2: Get Hostinger Credentials

1. Login to: https://hpanel.hostinger.com
2. Go to: **Databases → MySQL Databases**
3. Find database: `u957056558_school_repord`
4. Note your:
   - **Username** (starts with u957056558\_)
   - **Password** (reset if forgotten)

### Step 3: Enable Remote Access

1. In Hostinger: **Databases → Remote MySQL**
2. **Add your IP** (the wizard will show it)
   - Or use `%` for "Any Host" (testing only)
3. Select: `u957056558_school_repord`
4. Click **"Add Host"**

### Step 4: Update Configuration

Edit: `config/prod_config.php`

```php
<?php
$db_host = 'srv1711.hstgr.io';
$db_user = 'YOUR_USERNAME';  // ← Replace this
$db_pass = 'YOUR_PASSWORD';  // ← Replace this
$db_name = 'u957056558_school_repord';
```

### Step 5: Test Connection

```
http://localhost/general_report_card/test_connection.php
```

**Expected Result:**

```
✅ SUCCESS! Connected to remote database
Database Info:
- Tables found: 5
```

---

## 📊 Your Hostinger Details

```
Hostname: srv1711.hstgr.io
Alt Host: 82.197.82.92
Database: u957056558_school_repord
Port:     3306
```

---

## 🔄 How It Works

The app automatically detects which database to use:

### Local Development (XAMPP)

- **If `prod_config.php` doesn't exist** → Uses localhost
- Good for testing without affecting production

### Production (Hostinger)

- **If `prod_config.php` exists** → Uses Hostinger
- Your live database with real data

**Switch anytime** by renaming/deleting `prod_config.php`!

---

## ✅ Success Checklist

After setup, verify:

- [ ] `test_connection.php` shows "SUCCESS"
- [ ] Login page loads without errors
- [ ] Can login as admin (admin@school.com / password123)
- [ ] Dashboard shows data
- [ ] Changes persist after refresh
- [ ] Browser console shows: "✅ Storage: Connected to remote database"

---

## 🐛 Common Issues

### "Connection refused"

**Fix:** Add your IP in Hostinger Remote MySQL

### "Access denied"

**Fix:** Check username/password in `prod_config.php`

### "Unknown database"

**Fix:** Verify database name is exactly: `u957056558_school_repord`

### "No tables found"

**Fix:** Import `database_schema.sql` via phpMyAdmin

---

## 📚 Full Documentation

- **Setup Guide:** `REMOTE_DATABASE_SETUP.md`
- **Migration Info:** `DATABASE_MIGRATION.md`
- **Deployment:** `DEPLOY.md`

---

## 🔐 Security Notes

✅ **Protected Files:**

- `config/prod_config.php` is in `.gitignore`
- Never commit database credentials to Git

✅ **Best Practices:**

- Use strong passwords
- Whitelist specific IPs (not "Any Host")
- Regular database backups

---

## 🎯 Next Steps

1. **Complete setup** using the wizard
2. **Test connection** thoroughly
3. **Import schema** if needed (via phpMyAdmin)
4. **Seed data** using `install.php`
5. **Test login** with all user roles
6. **Deploy** when ready!

---

## 📞 Need Help?

**Hostinger Support:**

- 24/7 Live Chat in cPanel
- https://support.hostinger.com/

**Check Logs:**

- Browser Console (F12)
- `test_connection.php` output
- Hostinger error logs in cPanel

---

**Created:** 2026-02-12
**Status:** Ready for Configuration
**Database:** Hostinger MySQL (Remote)
