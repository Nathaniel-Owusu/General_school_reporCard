<?php
// Smart Database Connection
// Can handle both Localhost and Production environments

// Default Local Credentials (XAMPP)
$db_host = 'localhost';
$db_user = 'root';
$db_pass = '';
$db_name = 'school_report_db';

// Check for Production Credentials File (only use if NOT on localhost)
$is_localhost = false;
if (php_sapi_name() === 'cli' || (isset($_SERVER['HTTP_HOST']) && ($_SERVER['HTTP_HOST'] === 'localhost' || strpos($_SERVER['HTTP_HOST'], '127.0.0.1') !== false))) {
    $is_localhost = true;
}

$prod_file = __DIR__ . '/prod_config.php';
if (!$is_localhost && file_exists($prod_file)) {
    include $prod_file;
    // Production config loaded successfully
}

// Enable error reporting
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    // Attempt connection
    $conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
    $conn->set_charset("utf8mb4");
} catch (Exception $e) {
    // Log error for debugging
    error_log("Database Connection Error: " . $e->getMessage());

    // Return JSON error for API endpoints
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database connection failed',
        'message' => 'Cannot connect to database. Please check configuration.',
        'details' => $e->getMessage(),
        'config' => [
            'host' => $db_host,
            'database' => $db_name,
            'user' => $db_user,
            'prod_file_exists' => file_exists($prod_file)
        ]
    ]);
    exit;
}
