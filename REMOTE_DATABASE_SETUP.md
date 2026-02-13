# Remote Database Setup Guide (Hostinger)

## 📋 Overview

This guide will help you connect your application to the Hostinger MySQL database.

**Database Details:**

- **Hostname:** `srv1711.hstgr.io` (or IP: `82.197.82.92`)
- **Database Name:** `u957056558_school_repord`
- **Port:** 3306 (default)

---

## 🔧 Step-by-Step Setup

### Step 1: Get Your MySQL Credentials

1. **Login to Hostinger cPanel**
2. **Navigate to:** Databases → MySQL Databases
3. **Find your credentials:**
   - Database name: `u957056558_school_repord` ✅ (confirmed)
   - Username: Usually `u957056558_xxxxx` (check in cPanel)
   - Password: Your MySQL password (if forgotten, reset in cPanel)

### Step 2: Configure Remote MySQL Access

1. **In Hostinger cPanel:**
   - Go to **Databases → Remote MySQL**
2. **Add your IP address:**

   **Option A: Specific IP (Recommended for Production)**
   - Find your server's public IP: https://whatismyipaddress.com/
   - Add that IP to the whitelist

   **Option B: Any Host (For Testing Only)**
   - Use `%` to allow connections from any IP
   - ⚠️ **Security Warning:** Only use this for testing!

3. **Select Database:**
   - Choose: `u957056558_school_repord`
   - Click "Add Host"

### Step 3: Update Configuration File

1. **Open:** `config/prod_config.php`

2. **Update the credentials:**

   ```php
   <?php
   $db_host = 'srv1711.hstgr.io';
   $db_user = 'YOUR_ACTUAL_USERNAME';  // From cPanel
   $db_pass = 'YOUR_ACTUAL_PASSWORD';  // From cPanel
   $db_name = 'u957056558_school_repord';
   ```

3. **Save the file**

### Step 4: Test the Connection

Run the test script to verify connectivity:

**Via Browser:**

```
http://localhost/general_report_card/test_connection.php
```

**Via Command Line:**

```bash
cd c:\xampp\htdocs\general_report_card
php test_connection.php
```

**Expected Output:**

```
✅ SUCCESS! Connected to remote database
Database Info:
- Tables found: 5
- Table names:
  • schools
  • users
  • classes
  • subjects
  • students
```

### Step 5: Import Database Schema (If Needed)

If the test shows "No tables found", import the schema:

**Option A: Via phpMyAdmin (Hostinger)**

1. Login to Hostinger cPanel
2. Open phpMyAdmin
3. Select database: `u957056558_school_repord`
4. Click "Import"
5. Upload: `database_schema.sql`
6. Click "Go"

**Option B: Via Command Line**

```bash
mysql -h srv1711.hstgr.io -u YOUR_USERNAME -p u957056558_school_repord < database_schema.sql
```

### Step 6: Seed Initial Data

After schema is imported, seed the database:

**Via Browser:**

```
http://localhost/general_report_card/install.php
```

This will create:

- Default school
- Super admin account
- Sample admin and teacher accounts
- Sample students and subjects

---

## 🔄 Switching Between Local and Remote

### For Local Development (XAMPP)

**Delete or rename:** `config/prod_config.php`

```bash
# The app will use local MySQL (localhost)
```

### For Remote/Production

**Ensure:** `config/prod_config.php` exists with correct credentials

```bash
# The app will use Hostinger MySQL
```

The `db_connect.php` automatically detects which to use!

---

## 🛡️ Security Best Practices

### 1. Protect Configuration Files

Add to `.gitignore`:

```
config/prod_config.php
config/local_config.php
*.env
```

### 2. Use Strong Passwords

- Minimum 16 characters
- Mix of uppercase, lowercase, numbers, symbols
- Don't reuse passwords

### 3. Restrict IP Access

- In Hostinger Remote MySQL, only whitelist necessary IPs
- Remove "Any Host" (%) after testing
- Update whitelist when your IP changes

### 4. Use Environment Variables (Advanced)

For production servers, consider using `.env` files:

```php
$db_host = getenv('DB_HOST');
$db_user = getenv('DB_USER');
$db_pass = getenv('DB_PASS');
$db_name = getenv('DB_NAME');
```

---

## 🐛 Troubleshooting

### Error: "Connection refused"

**Causes:**

- IP not whitelisted in Hostinger Remote MySQL
- Firewall blocking port 3306
- Wrong hostname/IP

**Solutions:**

1. Verify IP is added in Hostinger cPanel
2. Try using IP instead of hostname: `82.197.82.92`
3. Check if port 3306 is open

### Error: "Access denied for user"

**Causes:**

- Wrong username or password
- User doesn't have permissions

**Solutions:**

1. Verify credentials in Hostinger cPanel
2. Reset MySQL password if needed
3. Check user has privileges on the database

### Error: "Unknown database"

**Causes:**

- Database name typo
- Database doesn't exist

**Solutions:**

1. Verify exact database name: `u957056558_school_repord`
2. Check database exists in cPanel
3. Create database if missing

### Error: "Too many connections"

**Causes:**

- Shared hosting connection limit reached
- Unclosed connections in code

**Solutions:**

1. Ensure all `$conn->close()` calls are present
2. Contact Hostinger support to increase limit
3. Optimize queries to reduce connection time

### Connection works locally but not remotely

**Causes:**

- Different PHP/MySQL versions
- SSL requirements
- Firewall rules

**Solutions:**

1. Check PHP version compatibility
2. Try adding SSL parameters (if required)
3. Contact Hostinger support

---

## 📊 Connection Performance

### Expected Latency

- **Local (XAMPP):** < 1ms
- **Remote (Hostinger):** 50-200ms (depends on location)

### Optimization Tips

1. **Use connection pooling** (persistent connections)
2. **Minimize queries** (batch operations)
3. **Cache frequently accessed data**
4. **Use indexes** on large tables
5. **Consider CDN** for static assets

---

## 🚀 Deployment Checklist

Before going live:

- [ ] Update `config/prod_config.php` with production credentials
- [ ] Test connection using `test_connection.php`
- [ ] Import database schema to remote server
- [ ] Seed initial data (super admin, default school)
- [ ] Verify all CRUD operations work
- [ ] Test login for all user roles
- [ ] Remove or secure test files (`test_connection.php`, `install.php`)
- [ ] Set up regular database backups
- [ ] Configure SSL/HTTPS
- [ ] Update API URLs if needed
- [ ] Test on production domain

---

## 📞 Support

**Hostinger Support:**

- Live Chat: Available 24/7 in cPanel
- Knowledge Base: https://support.hostinger.com/

**Application Issues:**

- Check browser console (F12) for errors
- Review `config/db_connect.php` for connection logic
- Test API endpoints: `api/db_handler.php`, `api/login.php`

---

## 📝 Quick Reference

### Connection String

```php
$conn = new mysqli(
    'srv1711.hstgr.io',           // host
    'YOUR_USERNAME',               // user
    'YOUR_PASSWORD',               // pass
    'u957056558_school_repord'    // database
);
```

### Test Query

```sql
SELECT COUNT(*) as total FROM schools;
```

### Backup Command

```bash
mysqldump -h srv1711.hstgr.io -u YOUR_USERNAME -p u957056558_school_repord > backup.sql
```

### Restore Command

```bash
mysql -h srv1711.hstgr.io -u YOUR_USERNAME -p u957056558_school_repord < backup.sql
```

---

**Last Updated:** 2026-02-12
**Status:** Ready for Configuration
