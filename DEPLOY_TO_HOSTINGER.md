# 🚀 DEPLOY TO HOSTINGER - Complete Guide

## 🎯 Goal

Deploy your app to Hostinger so ANY device can access it without IP restrictions.

---

## ✅ STEP 1: Prepare Files for Upload

### Files to Upload:

**All HTML files:**

- login.html
- admin-dashboard.html
- teacher-portal.html
- student-report.html
- super-admin.html
- credentials.html
- (any other .html files)

**All folders:**

- js/ (all JavaScript files)
- css/ (all CSS files)
- api/ (all PHP API files)
- config/ (database configuration)
- assets/ (if you have images/icons)

**Important PHP files:**

- database_schema.sql (for reference, already imported)

---

## ✅ STEP 2: Update prod_config.php

**BEFORE uploading, edit:**
`config/prod_config.php`

**Make sure it has:**

```php
<?php
$db_host = 'srv1711.hstgr.io';
$db_name = 'u957056558_report_card';
$db_user = 'u957056558_school_admin';
$db_pass = 'YOUR_ACTUAL_PASSWORD';  // ← Add your real password!
```

**⚠️ CRITICAL:** Replace `YOUR_ACTUAL_PASSWORD` with your real Hostinger MySQL password!

---

## ✅ STEP 3: Upload to Hostinger

### Method 1: File Manager (Easiest)

1. **Login to Hostinger:** https://hpanel.hostinger.com

2. **Go to:** Files → File Manager

3. **Navigate to:** `public_html/`

4. **Create folder (optional):**
   - If you want: `public_html/school/`
   - Or use root: `public_html/`

5. **Upload files:**
   - Click "Upload" button
   - Select all your project files
   - Wait for upload to complete

6. **Verify structure:**
   ```
   public_html/
   ├── login.html
   ├── admin-dashboard.html
   ├── js/
   ├── css/
   ├── api/
   └── config/
   ```

### Method 2: FTP (Advanced)

1. **Get FTP credentials from Hostinger**
2. **Use FileZilla or similar**
3. **Upload all files to `public_html/`**

---

## ✅ STEP 4: Set Default Page (Optional)

**Make login.html the default page:**

### Option A: Rename

Rename `login.html` to `index.html`

### Option B: Create index.html redirect

```html
<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="refresh" content="0; url=login.html" />
  </head>
  <body>
    Redirecting...
  </body>
</html>
```

---

## ✅ STEP 5: Test the Deployment

### Test 1: Access the Site

**Open browser and go to:**

```
https://yourdomain.com/login.html
```

**Or if in subfolder:**

```
https://yourdomain.com/school/login.html
```

### Test 2: Check Database Connection

**Open browser console (F12)**

**Should see:**

```
✅ Storage: Connected to remote database
```

### Test 3: Login

**Try logging in as admin:**

```
Email: admin@school.com
Password: password123
```

**Should work!** ✅

---

## ✅ STEP 6: Access from Multiple Devices

**Now test from different devices:**

### On PC:

```
https://yourdomain.com/login.html
```

### On Phone:

```
https://yourdomain.com/login.html
```

### On Tablet:

```
https://yourdomain.com/login.html
```

**All should work!** ✅

---

## 🎯 Your Domain Options

### Option 1: Use Hostinger Subdomain

```
https://yoursite.hostingersite.com/login.html
```

### Option 2: Use Custom Domain

```
https://yourschool.com/login.html
```

**Find your domain in Hostinger hPanel → Websites**

---

## 🔐 Security After Deployment

### 1. Remove Test Files

**Delete these from server:**

- test_connection.php
- install.php (after initial setup)
- setup_remote_db.html

### 2. Protect config folder

**Create `.htaccess` in `config/` folder:**

```apache
Deny from all
```

### 3. Use HTTPS

**Enable SSL in Hostinger:**

- Go to: Websites → Manage → SSL
- Enable free SSL certificate
- Force HTTPS

---

## 📋 Deployment Checklist

- [ ] Updated `prod_config.php` with actual password
- [ ] Uploaded all files to `public_html/`
- [ ] Verified folder structure is correct
- [ ] Set default page (index.html or redirect)
- [ ] Tested login from browser
- [ ] Checked console shows "Connected to remote database"
- [ ] Tested from PC - works ✅
- [ ] Tested from phone - works ✅
- [ ] Tested from tablet - works ✅
- [ ] Removed test files (test_connection.php, etc.)
- [ ] Enabled SSL/HTTPS

---

## 🎉 After Deployment

**Benefits:**

- ✅ Access from ANY device
- ✅ No IP whitelisting needed
- ✅ Professional URL
- ✅ HTTPS security
- ✅ Always online
- ✅ Fast loading (Hostinger servers)

**Your app is now:**

```
Device A → yourdomain.com → Hostinger Server → Database ✅
Device B → yourdomain.com → Hostinger Server → Database ✅
Device C → yourdomain.com → Hostinger Server → Database ✅

All devices use SAME database!
No IP restrictions!
```

---

## 🐛 Troubleshooting

### "Page not found"

- Check files are in `public_html/`
- Verify file names are correct (case-sensitive!)

### "Database connection failed"

- Check `config/prod_config.php` has correct password
- Verify database name: `u957056558_report_card`

### "Can't access from phone"

- Make sure using domain URL (not localhost)
- Check SSL is enabled
- Try incognito/private mode

### "Changes not showing"

- Clear browser cache
- Hard refresh (Ctrl + Shift + R)
- Check you uploaded latest files

---

## 📞 Need Help?

**Hostinger Support:**

- 24/7 Live Chat in hPanel
- Knowledge Base: https://support.hostinger.com/

**Common Questions:**

- "How to upload files" → File Manager guide
- "How to enable SSL" → SSL setup guide
- "How to set default page" → Index file guide

---

**Ready to deploy? Start with Step 1!** 🚀
