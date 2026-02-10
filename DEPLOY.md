# Deploying to Hostinger (MySQL Version)

## 1. Create Your Database in Hostinger

1. Log in to your Hostinger Control Panel (hPanel).
2. Go to **Databases** -> **Management**.
3. Create a **New MySQL Database**.
   - **Database Name**: (Example: `u123456789_school_db`)
   - **Database User**: (Example: `u123456789_admin`)
   - **Database Password**: (Create a strong password, e.g., `P@ssword123!`)
4. Click **Create**.
5. Note down the **Database Name**, **User**, and **Password**.

## 2. Import the Schema

1. In Hostinger Databases list, click **Enter phpMyAdmin** next to your new database.
2. Click the **Import** tab at the top.
3. Click "Choose File" and select `database_schema.sql` from this project folder.
4. Click **Go** (bottom of page).
   - This will create the empty tables (`schools`, `users`, etc.) needed for the app.

## 3. Upload Your Files

1. Use **File Manager** (in Hostinger) or an FTP client (FileZilla).
2. Go to `public_html`.
3. Clear any default files if you want.
4. Upload all files and folders from your local project **EXCEPT**:
   - `.git/` folder (if any)
   - `node_modules/` (not needed)
   - `test_data.php` (if any leftover test files)
   - `_legacy/` (not needed)

## 4. Configure Connection on Server

Since your local `db_connect.php` uses `localhost/root` credentials, you need to tell the server the real credentials.

1. In Hostinger File Manager, navigate to `public_html/config/`.
2. Create a **New File** named `prod_config.php`.
3. Paste the following code into `prod_config.php` and fill in your details:

```php
<?php
// Hostinger Database Credentials
$db_host = 'localhost'; // Usually localhost on Hostinger
$db_user = 'u123456789_admin'; // YOUR_DB_USER
$db_pass = 'YourStrongPassword!'; // YOUR_DB_PASSWORD
$db_name = 'u123456789_school_db'; // YOUR_DB_NAME
?>
```

4. Save the file.

## 5. Done!

Visit your website URL. Since the database is fresh, you will need to:

1. **Register** a new school account on the live site.
2. Log in and add data.

The system will now run entirely on Hostinger's MySQL database.
