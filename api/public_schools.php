<?php
// api/public_schools.php
// Public endpoint to fetch the list of active schools for the admissions page dropdown
header('Content-Type: application/json');

// Allow CORS if needed
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . '/../config/db_connect.php';

try {
    // Fallback query in case the 'active' column hasn't been migrated yet to Hostinger
    $query = "SELECT id, name FROM schools WHERE active = 1 ORDER BY name ASC";
    $result = @$conn->query($query);

    // If the active column doesn't exist, fallback to all schools
    if (!$result) {
        $query = "SELECT id, name FROM schools ORDER BY name ASC";
        $result = $conn->query($query);
    }

    $schools = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $schools[] = $row;
        }
    }

    echo json_encode(['success' => true, 'data' => $schools]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
