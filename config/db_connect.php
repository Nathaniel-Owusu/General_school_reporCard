<?php
// Smart Database Connection
// Can handle both Localhost and Production environments

// Default Local Credentials (XAMPP)
$db_host = 'localhost';
$db_user = 'root';
$db_pass = '';
$db_name = 'school_report_db';

// Check for Production Credentials File (Recommended for Security/Hostinger)
// Create a file named 'prod_config.php' in this same directory on your server
$prod_file = __DIR__ . '/prod_config.php';
if (file_exists($prod_file)) {
    include $prod_file;
    // Expects: $db_host, $db_user, $db_pass, $db_name to be set in that file
} else {
    // If no file found, maybe check domain name (optional fallback)
    if ($_SERVER['HTTP_HOST'] !== 'localhost' && $_SERVER['HTTP_HOST'] !== '127.0.0.1') {
        // We are on a live server but no config file found!
        // You can hardcode here if you prefer, but external file is safer.
        // Uncomment and fill below if you don't use prod_config.php:
        /*
        $db_host = 'localhost';
        $db_user = 'u123456789_admin';
        $db_name = 'u123456789_school_db';
        $db_pass = 'YourPassword123!';
        */
    }
}

// Enable error reporting
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    // Attempt connection
    $conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
    $conn->set_charset("utf8mb4");
} catch(Exception $e) {
    // Show a user-friendly message on production, full error on local
    if ($_SERVER['HTTP_HOST'] === 'localhost') {
        die("Database Connection Failed (Local): " . $e->getMessage());
    } else {
        die("<h1>Site Maintenance</h1><p>We are currently establishing connection to the database. Please check your configuration.</p>");
    }
}
?>
