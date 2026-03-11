<?php
// Smart Database Connection
// Can handle both Localhost and Production environments

// Default Local Credentials (XAMPP)
$db_host = 'localhost';
$db_user = 'root';
$db_pass = '';
$db_name = 'tako_sda_db'; // 🔄 Updated to match existing database

// Check for Production Credentials File (only use if NOT on localhost)
$is_localhost = false;
$http_host = isset($_SERVER['HTTP_HOST']) ? strtolower($_SERVER['HTTP_HOST']) : '';
$server_addr = isset($_SERVER['SERVER_ADDR']) ? $_SERVER['SERVER_ADDR'] : '';
$remote_addr = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '';

if (
    php_sapi_name() === 'cli' ||
    $http_host === 'localhost' ||
    strpos($http_host, '127.0.0.1') !== false ||
    strpos($http_host, '::1') !== false ||
    strpos($http_host, 'localhost:') !== false ||
    strpos($http_host, '.local') !== false || // Added for local hostnames
    $server_addr === '127.0.0.1' ||
    $server_addr === '::1' ||
    $remote_addr === '127.0.0.1' ||
    $remote_addr === '::1' ||
    // Support local network access (e.g., 192.168.x.x)
    preg_match('/^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/', $server_addr) ||
    preg_match('/^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/', $http_host) ||
    preg_match('/^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/', $remote_addr)
) {
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
