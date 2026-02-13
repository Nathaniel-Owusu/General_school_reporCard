<?php

/**
 * Production Database Configuration (Hostinger)
 * ALL DEVICES WILL USE THIS REMOTE DATABASE
 */

// Hostinger MySQL Server Details - Using YOUR existing database
$db_host = 'localhost';  // Hostinger server (localhost when on Hostinger)
$db_name = 'school_report';  // Your existing database
$db_user = 'owusuansahnath.';  // Your existing MySQL username
$db_pass = 'reportCard@1234';  // Your existing MySQL password

/**
 * ✅ CONFIGURATION NOTES:
 * 
 * - Using your existing Hostinger database: school_report
 * - This works when files are hosted ON Hostinger servers
 * - 'localhost' is correct when running on the same server as database
 * - All devices access via your domain URL
 * 
 * 🌐 HOW IT WORKS:
 * 
 * Device A → yourdomain.com → Hostinger Server → localhost → school_report ✅
 * Device B → yourdomain.com → Hostinger Server → localhost → school_report ✅
 * 
 * All devices connect to SAME database through your domain!
 * 
 * ⚠️ IMPORTANT:
 * - Files MUST be uploaded to Hostinger
 * - Access ONLY via your domain (not localhost on PC)
 * - Database schema must be imported to school_report
 */
