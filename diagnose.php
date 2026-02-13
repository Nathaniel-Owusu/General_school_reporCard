<?php

/**
 * Database Configuration Diagnostic Tool
 * Upload this to your Hostinger server to diagnose connection issues
 */

header('Content-Type: application/json');

$diagnostics = [
    'timestamp' => date('Y-m-d H:i:s'),
    'server_info' => [],
    'file_checks' => [],
    'database_test' => []
];

// Server Information
$diagnostics['server_info'] = [
    'php_version' => phpversion(),
    'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
    'document_root' => $_SERVER['DOCUMENT_ROOT'] ?? 'Unknown',
    'script_path' => __FILE__,
    'current_dir' => __DIR__
];

// File Existence Checks
$files_to_check = [
    'config/prod_config.php',
    'config/db_connect.php',
    'api/db_handler.php',
    'api/login.php'
];

foreach ($files_to_check as $file) {
    $full_path = $_SERVER['DOCUMENT_ROOT'] . '/' . $file;
    $diagnostics['file_checks'][$file] = [
        'exists' => file_exists($full_path),
        'readable' => file_exists($full_path) && is_readable($full_path),
        'path' => $full_path
    ];
}

// Check prod_config.php content
$prod_config_path = __DIR__ . '/config/prod_config.php';
if (file_exists($prod_config_path)) {
    $diagnostics['prod_config'] = [
        'exists' => true,
        'path' => $prod_config_path,
        'readable' => is_readable($prod_config_path)
    ];

    // Try to load it
    include $prod_config_path;

    $diagnostics['prod_config']['loaded_vars'] = [
        'db_host' => isset($db_host) ? $db_host : 'NOT SET',
        'db_name' => isset($db_name) ? $db_name : 'NOT SET',
        'db_user' => isset($db_user) ? $db_user : 'NOT SET',
        'db_pass' => isset($db_pass) ? (empty($db_pass) ? 'EMPTY' : 'SET (hidden)') : 'NOT SET'
    ];
} else {
    $diagnostics['prod_config'] = [
        'exists' => false,
        'path' => $prod_config_path,
        'error' => 'prod_config.php not found!'
    ];
}

// Test Database Connection
if (isset($db_host) && isset($db_user) && isset($db_pass) && isset($db_name)) {
    try {
        $test_conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

        $diagnostics['database_test'] = [
            'success' => true,
            'host' => $db_host,
            'database' => $db_name,
            'user' => $db_user,
            'connection_id' => $test_conn->thread_id,
            'server_version' => $test_conn->server_info,
            'charset' => $test_conn->character_set_name()
        ];

        // Test query
        $result = $test_conn->query("SHOW TABLES");
        $tables = [];
        while ($row = $result->fetch_array()) {
            $tables[] = $row[0];
        }
        $diagnostics['database_test']['tables'] = $tables;
        $diagnostics['database_test']['table_count'] = count($tables);

        $test_conn->close();
    } catch (Exception $e) {
        $diagnostics['database_test'] = [
            'success' => false,
            'error' => $e->getMessage(),
            'attempted_host' => $db_host ?? 'NOT SET',
            'attempted_database' => $db_name ?? 'NOT SET',
            'attempted_user' => $db_user ?? 'NOT SET'
        ];
    }
} else {
    $diagnostics['database_test'] = [
        'success' => false,
        'error' => 'Database credentials not set'
    ];
}

// Output diagnostics
echo json_encode($diagnostics, JSON_PRETTY_PRINT);
