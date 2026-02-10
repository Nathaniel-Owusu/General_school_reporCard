<?php
// check_status.php
header('Content-Type: application/json');
require_once 'config/db_connect.php';

$response = [
    'db_connection' => false,
    'tables' => [],
    'row_counts' => [],
    'errors' => []
];

if (isset($conn) && $conn instanceof mysqli) {
    $response['db_connection'] = true;

    $tables = ['schools', 'users', 'classes', 'subjects', 'students'];
    foreach ($tables as $table) {
        try {
            $result = $conn->query("SELECT COUNT(*) as count FROM `$table`");
            if ($result) {
                $row = $result->fetch_assoc();
                $response['tables'][$table] = 'exists';
                $response['row_counts'][$table] = $row['count'];
            } else {
                $response['tables'][$table] = 'missing';
                $response['errors'][] = "Table $table missing: " . $conn->error;
            }
        } catch (Exception $e) {
            $response['tables'][$table] = 'error';
            $response['errors'][] = $e->getMessage();
        }
    }
} else {
    $response['errors'][] = "Database connection failed variable not set.";
}

echo json_encode($response, JSON_PRETTY_PRINT);
