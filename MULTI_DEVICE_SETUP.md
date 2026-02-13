# 🔧 MULTI-DEVICE ACCESS - COMPLETE SETUP GUIDE

## 🎯 Goal

Make ALL devices access the SAME Hostinger database so accounts work everywhere.

---

## ✅ STEP 1: Enable Remote MySQL for All Devices

**In Hostinger cPanel:**

1. **Login:** https://hpanel.hostinger.com
2. **Navigate to:** Databases → Remote MySQL
3. **Add new host:**
   ```
   IP Address: %
   Database: u957056558_report_card
   ```
4. **Click:** "Add Host"

**What this does:**

- ✅ Allows connections from ANY device
- ✅ No need to add individual IPs
- ✅ Works on PC, phone, tablet, anywhere!

---

## ✅ STEP 2: Add Password to Configuration (Device A - PC)

**On your PC:**

1. **Open:** `c:\xampp\htdocs\general_report_card\config\prod_config.php`

2. **Find line 13:**

   ```php
   $db_pass = 'YOUR_PASSWORD_HERE';
   ```

3. **Replace with your actual Hostinger MySQL password:**

   ```php
   $db_pass = 'your_actual_password';
   ```

4. **Save the file** (Ctrl + S)

**Where to get password:**

- Hostinger cPanel → Databases → MySQL Databases
- User: `u957056558_school_admin`
- If forgotten, click "Change Password"

---

## ✅ STEP 3: Test Connection on PC

**Open browser:**

```
http://localhost/general_report_card/test_connection.php
```

**Expected output:**

```
✅ SUCCESS! Connected to remote database

Testing connection to:
Host: srv1711.hstgr.io  ← Must show this!
Database: u957056558_report_card
User: u957056558_school_admin

Database Info:
- Tables found: 5
```

**If you see this, PC is connected to Hostinger!** ✅

---

## ✅ STEP 4: Clear Old Data and Start Fresh

**Option A: Reset Database (Recommended)**

1. **Open browser:**

   ```
   http://localhost/general_report_card/install.php
   ```

2. **This will:**
   - Clear existing data
   - Create fresh tables
   - Seed default accounts:
     - Super Admin: superadmin@system.com / superadmin123
     - School Admin: admin@school.com / password123
     - Sample teacher and students

**Option B: Keep Existing Data**

- Skip this step if you want to keep what's in Hostinger

---

## ✅ STEP 5: Test Login on PC

1. **Open:** `http://localhost/general_report_card/login.html`

2. **Open browser console (F12)**

3. **Should see:**

   ```
   ✅ Storage: Connected to remote database
   ```

4. **Login as admin:**

   ```
   Email: admin@school.com
   Password: password123
   ```

5. **Should work!** ✅

---

## ✅ STEP 6: Access from Other Devices

### For Device B (Phone/Tablet):

**You need to deploy the app OR use a temporary solution:**

### Option A: Deploy to Hostinger (Recommended)

1. **Upload all files to Hostinger web hosting**
2. **Access via:**
   ```
   https://yourdomain.com/login.html
   ```
3. **Login with same credentials**
4. **Works!** ✅

### Option B: Use ngrok (Temporary Testing)

1. **On PC, install ngrok:** https://ngrok.com/download

2. **Run:**

   ```bash
   ngrok http 80
   ```

3. **Copy the URL** (e.g., `https://abc123.ngrok.io`)

4. **On phone, open:**

   ```
   https://abc123.ngrok.io/general_report_card/login.html
   ```

5. **Login with same credentials**
6. **Works!** ✅

### Option C: Same WiFi Network

1. **Find PC IP address:**

   ```bash
   ipconfig
   ```

   Look for IPv4 (e.g., 192.168.1.100)

2. **On phone (same WiFi), open:**

   ```
   http://192.168.1.100/general_report_card/login.html
   ```

3. **Login with same credentials**
4. **Works!** ✅

---

## ✅ STEP 7: Verify Multi-Device Sync

### Test 1: Create Account on Device A

1. Login on PC as admin
2. Create new student: "Test Student" (ID: ST_TEST)
3. Logout

### Test 2: Access from Device B

1. Open app on phone
2. Login as admin
3. Check student list
4. **Should see "Test Student"** ✅

### Test 3: Login as Student

1. On phone, login as student (ID: ST_TEST)
2. **Should work!** ✅

---

## 🎯 How It Works Now

```
Device A (PC)           Device B (Phone)        Device C (Tablet)
      │                       │                       │
      └───────────────────────┼───────────────────────┘
                              │
                              ▼
                    Hostinger Database
                 (u957056558_report_card)
                              │
                    ✅ ONE shared database
                    ✅ All devices connected
                    ✅ Accounts work everywhere
```

---

## ✅ Final Checklist

- [ ] Remote MySQL enabled with IP: `%`
- [ ] Password added to `config/prod_config.php` on PC
- [ ] `test_connection.php` shows Hostinger connection
- [ ] Login page console shows "Connected to remote database"
- [ ] Can login on PC
- [ ] Can access from phone/other device
- [ ] Accounts created on one device work on all devices

---

## 🐛 Troubleshooting

### "Connection refused" on PC

- ✅ Check Remote MySQL has `%` added
- ✅ Check password in `prod_config.php`

### "Invalid credentials" on Device B

- ✅ Make sure Device B is accessing the deployed app (not localhost)
- ✅ Or use ngrok/network IP to access PC's server

### "Can't access from phone"

- ✅ Deploy to Hostinger, OR
- ✅ Use ngrok, OR
- ✅ Use same WiFi network with PC's IP

---

## 🎉 Success!

**After setup:**

- ✅ Create account on PC → Works on phone
- ✅ Create account on phone → Works on PC
- ✅ All devices share same data
- ✅ Changes sync instantly
- ✅ One database, unlimited devices!

---

**Need help? Check what step you're on and let me know!** 😊
