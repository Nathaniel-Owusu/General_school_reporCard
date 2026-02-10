# Hostinger Database Setup Guide

## You're Almost There! 🎉

Your code is now on Hostinger via GitHub, but you need to connect it to a database.

## Step-by-Step Instructions:

### 1. Create Database in Hostinger (5 minutes)

1. Log into **Hostinger hPanel**
2. Go to **Databases** → **MySQL Databases**
3. Click **"Create New Database"**
4. Enter these details:
   - **Database Name**: `school_report_db`
   - **Username**: `school_admin`
   - **Password**: Create a strong password

5. **IMPORTANT**: Write down the exact credentials Hostinger gives you:
   ```
   Database Host: localhost
   Database Name: u123456789_school_report_db  (with your user ID prefix)
   Username: u123456789_school_admin           (with your user ID prefix)
   Password: (your password)
   ```

### 2. Create Configuration File

1. In Hostinger **File Manager**, go to: `public_html/config/`
2. Create a **New File** called: `prod_config.php`
3. Copy and paste this code:

```php
<?php
// Hostinger Production Database Credentials
$db_host = 'localhost';
$db_user = 'YOUR_DB_USERNAME_HERE';  // Replace with your actual username
$db_pass = 'YOUR_DB_PASSWORD_HERE';  // Replace with your actual password
$db_name = 'YOUR_DB_NAME_HERE';      // Replace with your actual database name
?>
```

4. **Replace the placeholders** with your ACTUAL credentials from Step 1
5. **Save** the file

### 3. Initialize Database Tables

1. Visit: `https://yourdomain.com/install.php`
2. You should see: "Correct tables created successfully."
3. ✅ Done! Your database is ready!

### 4. Access Your Application

Visit: `https://yourdomain.com/`

**Default Login:**

- Email: `admin@school.com`
- Password: `password123`

---

## ⚠️ Security Note

**Never commit `prod_config.php` to GitHub!** It contains your database password.

The file is already in `.gitignore` to prevent accidental commits.

## Need Help?

If you see any errors, check:

1. Database credentials are correct in `prod_config.php`
2. You ran `install.php` to create tables
3. Your Hostinger MySQL service is active

---

**Questions?** Check the main `DEPLOY.md` file or contact support.
